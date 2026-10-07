"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap, useGSAP } from "@/lib/gsap";
import Reveal from "@/components/Reveal";

const smooth = (x: number, a: number, b: number) => THREE.MathUtils.smoothstep(x, a, b);

// Assemblies split off the Mercedes-AMG ONE shell. The GLB is a flat hierarchy where
// every panel is its own top-level group under "RootNode", so we classify by name
// prefix, then give each matched group the same explode offset. Axes: front = +Z,
// driver-left = +X.
type AssemblySpec = {
  id: string;
  test: (n: string) => boolean;
  off: [number, number, number];
  px: number;
};
const hasPrefix = (...p: string[]) => (n: string) =>
  p.some((x) => n.startsWith(x));
const ASSEMBLIES: AssemblySpec[] = [
  { id: "engine", test: (n) => n === "amgprojone_body_009" || n.startsWith("amgprojone_body_010"), off: [0, 1.7, -0.3], px: 0.12 },
  { id: "canopy", test: hasPrefix("amgprojone_windshield"), off: [0, 1.8, 0.35], px: 0.2 },
  { id: "tailgate", test: hasPrefix("amgprojone_tailgate"), off: [0, 1.9, -0.4], px: 0.28 },
  { id: "spoiler", test: hasPrefix("amgprojone_spoiler"), off: [0, 2.2, -0.5], px: 0.36 },
  { id: "fender-f", test: hasPrefix("amgprojone_bumper_F"), off: [0, 0.25, 2.6], px: 0.44 },
  { id: "fender-r", test: hasPrefix("amgprojone_bumper_R"), off: [0, 0.25, -2.6], px: 0.52 },
  { id: "door-l", test: hasPrefix("amgprojone_door_L"), off: [2.4, 0.25, 0.3], px: 0.6 },
  { id: "door-r", test: hasPrefix("amgprojone_door_R"), off: [-2.4, 0.25, 0.3], px: 0.66 },
  { id: "steer", test: hasPrefix("amgprojone_steer"), off: [0, 2.3, 0.9], px: 0.92 },
];
// Wheel corners; the AMG GLB lists tires in [FL, RL, RR, FR] order, so each
// wheel's corner is derived from its tire's world position instead of a fixed
// array index (left = +X, front = +Z). px matches the manifest row below.
type WheelCorner = "fl" | "fr" | "rl" | "rr";
const wheelCorner = (c: THREE.Vector3): WheelCorner => {
  const side = c.x >= 0 ? "l" : "r";
  const end = c.z >= 0 ? "f" : "r";
  return `${side}${end}` === "lf"
    ? "fl"
    : `${side}${end}` === "rf"
      ? "fr"
      : `${side}${end}` === "lr"
        ? "rl"
        : "rr";
};
const WHEELS: {
  id: string;
  corner: WheelCorner;
  px: number;
}[] = [
  { id: "wheel-fl", corner: "fl", px: 0.72 },
  { id: "wheel-fr", corner: "fr", px: 0.78 },
  { id: "wheel-rl", corner: "rl", px: 0.84 },
  { id: "wheel-rr", corner: "rr", px: 0.88 },
];

const MANIFEST = [
  { id: "chassis", name: "TRANSPARENT SHELL", meta: "Full-hole carbon monocoque" },
  { id: "engine", name: "E-PERFORMANCE V8", meta: "4.0L biturbo + 3 e-motors" },
  { id: "canopy", name: "BUBBLE CANOPY", meta: "Cut-down head screen" },
  { id: "tailgate", name: "ENGINE DECK", meta: "See-through glass hatch" },
  { id: "spoiler", name: "DRS WING", meta: "Actuated 2-plane aero" },
  { id: "fender-f", name: "FRONT BOW", meta: "Ground-effect splitter" },
  { id: "fender-r", name: "REAR SPRAY", meta: "Diffuser + strakes" },
  { id: "door-l", name: "SCISSOR DOOR · L", meta: "Forward dihedral pivot" },
  { id: "door-r", name: "SCISSOR DOOR · R", meta: "Forward dihedral pivot" },
  { id: "wheel-fl", name: "AMG WHEEL · FL", meta: "Forged turbine spoke" },
  { id: "wheel-fr", name: "AMG WHEEL · FR", meta: "Forged turbine spoke" },
  { id: "wheel-rl", name: "AMG WHEEL · RL", meta: "Magnet-thrust hub" },
  { id: "wheel-rr", name: "AMG WHEEL · RR", meta: "Magnet-thrust hub" },
  { id: "steer", name: "AMG FORMULA YOKE", meta: "Fly-by-wire tiller" },
];

type ExplodeTarget = {
  obj: THREE.Object3D;
  base: THREE.Vector3;
  off: THREE.Vector3;
  px: number;
};

// back-out overshoot so each part snaps away with a "tick" as it releases.
const popOut = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = t - 1;
  return 1 + c3 * x * x * x + c1 * x * x;
};

export default function ExplodedView3D() {
  const root = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLSpanElement>(null);
  const sceneP = useRef<{ p: number }>({ p: 0 });

  // The same glass/quality pass as the features scene, applied once after load.
  const prettify = (m: THREE.Object3D) => {
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (let i = 0; i < mats.length; i++) {
        const mm = mats[i] as THREE.MeshStandardMaterial;
        const n = mm.name || "";
        if (n.toLowerCase().includes("glass")) {
          mm.transparent = true;
          mm.depthWrite = false;
          mm.opacity = Math.min(mm.opacity ?? 1, 0.6);
        } else if (mm.envMapIntensity !== undefined) {
          mm.envMapIntensity = 1.5;
        }
      }
    });
  };

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060111);
    scene.fog = new THREE.FogExp2(0x060111, 0.028);

    const camera = new THREE.PerspectiveCamera(
      42,
      el.clientWidth / el.clientHeight,
      0.1,
      140
    );
    scene.add(camera);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    let mx = 0;
    let my = 0;
    const onMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const key = new THREE.DirectionalLight(0x00e5ff, 2.4);
    scene.add(key);
    const neon = new THREE.PointLight(0x00e5ff, 15, 30, 2);
    scene.add(neon);
    scene.add(new THREE.AmbientLight(0x3d1f66, 0.45));
    const underGlow = new THREE.PointLight(0xff2ea6, 11, 9);
    underGlow.position.set(0, 0.25, 0);
    scene.add(underGlow);
    const topLight = new THREE.DirectionalLight(0xffffff, 2.0);
    topLight.position.set(0, 7, 4);
    scene.add(topLight);

    const car = new THREE.Group();
    scene.add(car);

    // Full-bleed gradient backdrop attached to the camera so edges never show.
    const gradCanvas = document.createElement("canvas");
    gradCanvas.width = 1024;
    gradCanvas.height = 512;
    const g2 = gradCanvas.getContext("2d");
    if (g2) {
      const grad = g2.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, "#04060d");
      grad.addColorStop(0.5, "#0a0b16");
      grad.addColorStop(1, "#140f1e");
      g2.fillStyle = grad;
      g2.fillRect(0, 0, 1024, 512);
    }
    const gradTex = new THREE.CanvasTexture(gradCanvas);
    gradTex.wrapS = gradTex.wrapT = THREE.RepeatWrapping;
    const gradMat = new THREE.MeshBasicMaterial({ map: gradTex, fog: false, depthWrite: false });
    const gradBg = new THREE.Mesh(new THREE.PlaneGeometry(260, 140), gradMat);
    gradBg.position.set(0, 0, -32);
    camera.add(gradBg);

    const targets: ExplodeTarget[] = [];
    let disposed = false;

    const MODEL_URL =
      "/media/threeD/transparency-mercedes-amg-one/source/cafe_nhan_sam_hoa_tan_queen_food.glb";
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const m = gltf.scene;
        const targetLen = 5.3;

        m.updateMatrixWorld(true);
        const boxCar = (box: THREE.Box3) => {
          m.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh) return;
            box.union(new THREE.Box3().setFromObject(mesh));
          });
        };
        const bb = new THREE.Box3();
        boxCar(bb);
        const k =
          targetLen / Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
        m.scale.setScalar(k);
        m.updateMatrixWorld(true);

        const bb2 = new THREE.Box3();
        boxCar(bb2);
        const c = bb2.getCenter(new THREE.Vector3());
        m.position.x -= c.x;
        m.position.z -= c.z;
        m.position.y = 0 - bb2.min.y;
        car.add(m);
        m.updateMatrixWorld(true);

        prettify(m);

        // The AMG GLB ships as a flat stack: every panel is a direct child of
        // "RootNode". At rest (p < first px) nothing has moved, so the car reads
        // perfectly assembled. Match groups by name prefix for the body parts,
        // and pair each tire with the rim/brake nodes clustered around it.
        const root = m.getObjectByName("RootNode") ?? m;
        const kids = root.children;

        // 1) wheels: find each tire, collect all coop parts within its radius.
        const tireNames = kids
          .filter((o) => o.name.startsWith("amgprojone_tire"))
          .map((o) => o.name);
        const tireCenters = tireNames.map((nm) => {
          const o = root.getObjectByName(nm)!;
          const b = new THREE.Box3().setFromObject(o);
          return b.getCenter(new THREE.Vector3());
        });
        const wheelOfName: Record<string, number> = {};
        for (const nm of tireNames) {
          const o = root.getObjectByName(nm)!;
          const b = new THREE.Box3().setFromObject(o);
          const ctr = b.getCenter(new THREE.Vector3());
          let best = 0;
          let bestD = Infinity;
          tireCenters.forEach((tc, i) => {
            const d = ctr.distanceTo(tc);
            if (d < bestD) { bestD = d; best = i; }
          });
          wheelOfName[nm] = best;
        }
        const total = kids.filter((o) => {
          const n = o.name;
          return n.startsWith("amgprojone_rim") || n.startsWith("amgprojone_tire");
        });
        const wheelIdx = (o: THREE.Object3D) => {
          const b = new THREE.Box3().setFromObject(o);
          const ctr = b.getCenter(new THREE.Vector3());
          let best = 0;
          let bestD = Infinity;
          tireCenters.forEach((tc, i) => {
            const d = ctr.distanceTo(tc);
            if (d < bestD) { bestD = d; best = i; }
          });
          return best;
        };
        // The offsets above are in world/car-model units; the GLB's RootNode carries a
        // baked ~0.01 scale, so convert each direction into the parts' local space.
        const rootScale = new THREE.Vector3().setFromMatrixScale(root.matrixWorld);

        for (const o of total) {
          const w = wheelIdx(o);
          const tc = tireCenters[w];
          const corner = wheelCorner(tc);
          const spec = WHEELS.find((x) => x.corner === corner)!;
          const base = o.position.clone();
          // explode outward away from the car's centerline + along its axis.
          const off = new THREE.Vector3(
            (tc.x >= 0 ? 1 : -1) * 1.9,
            0.18,
            (tc.z >= 0 ? 1 : -1) * 0.2
          );
          off.x /= rootScale.x;
          off.y /= rootScale.y;
          off.z /= rootScale.z;
          targets.push({ obj: o, base, off, px: spec.px });
        }

        // 2) body: everything else is classified by its assembly prefix.
        for (const o of kids) {
          if (total.includes(o)) continue;
          const n = o.name;
          const asm = ASSEMBLIES.find((a) => a.test(n));
          if (!asm) continue;
          const off = new THREE.Vector3(asm.off[0], asm.off[1], asm.off[2]);
          off.x /= rootScale.x;
          off.y /= rootScale.y;
          off.z /= rootScale.z;
          targets.push({
            obj: o,
            base: o.position.clone(),
            off,
            px: asm.px,
          });
        }
      },
      undefined,
      (err) => {
        console.error("AMG ONE GLTF failed:", err);
      }
    );

    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();
    let raf = 0;
    const loopFn = () => {
      raf = requestAnimationFrame(loopFn);
      const dt = clock.getDelta();
      const t = clock.elapsedTime;
      const p = reduce ? 0 : sceneP.current.p;

      const damp = 1 - Math.pow(0.001, dt);
      const sway = Math.sin(t * 0.35) * 0.06;
      key.position.x = key.position.x * (1 - damp) + mx * 5 * damp;
      key.position.y = key.position.y * (1 - damp) + my * 3 * damp;

      // Fixed cinematic 3/4 camera with gentle parallax + slow orbit.
      // Fixed cinematic 3/4 camera with gentle parallax + slow orbit.
      camera.position.set(
        5.4 + mx * 0.4 + sway,
        2.8 + my * 0.25 + Math.sin(t * 0.2) * 0.05,
        6.2 + sway * 0.5
      );
      camera.lookAt(0, 0.55, -0.1);

      const pp = (px: number) => popOut(smooth(p, px, px + 0.05));
      targets.forEach((tp) => {
        const u = pp(tp.px);
        tmp.copy(tp.off).multiplyScalar(u);
        tp.obj.position.copy(tp.base).add(tmp);
      });

      neon.position.x = mx * 2;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loopFn);

    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      el.textContent = "";
    };
  }, []);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const pin = pinRef.current;
      if (!wrap || !pin) return;

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "+=170%",
          scrub: 1,
          pin,
          anticipatePin: 1,
          onUpdate: (self) => {
            sceneP.current.p = self.progress;
            const el = progRef.current;
            if (el) el.textContent = String(Math.round(self.progress * 100)).padStart(3, "0");
          },
          onRefresh: (self) => {
            sceneP.current.p = self.progress;
          },
        },
      });

      const chassisRow = document.querySelector('[data-row="chassis"]');
      if (chassisRow) {
        tl.set(chassisRow, { autoAlpha: 1, color: "#1f78ff" }, 0);
      }

      const pxOf: Record<string, number> = { chassis: 0 };
      ASSEMBLIES.forEach((a) => (pxOf[a.id] = a.px));
      WHEELS.forEach((w) => (pxOf[w.id] = w.px));
      MANIFEST.forEach((p) => {
        const row = document.querySelector(`[data-row="${p.id}"]`);
        if (row && p.id !== "chassis") {
          tl.fromTo(
            row,
            { autoAlpha: 0.35, color: "#64748b" },
            { autoAlpha: 1, color: "#1f78ff", duration: 0.04 },
            pxOf[p.id]
          );
        }
      });
    },
    { scope: root }
  );

  const corner =
    "absolute h-8 w-8 border-neon/50";

  return (
    <section id="exploded" ref={root} className="relative bg-abyss/40">
      <div className="relative mx-auto max-w-[1440px] px-5 pt-24 lg:px-10 lg:pt-32">
        <Reveal>
          <p className="hud-chip mb-4 text-neon">
            <span className="text-dim">SECTION</span> 04 — DECONSTRUCTION
          </p>
          <h2 className="font-display text-3xl font-black leading-tight text-ice md:text-5xl">
            SCROLL TO <span className="text-neon text-glow">TEAR IT DOWN</span>
          </h2>
        </Reveal>
      </div>

      <div ref={wrapRef}>
        <div
          ref={pinRef}
          className="relative flex min-h-screen flex-col justify-center overflow-hidden"
        >
          <div className="grid-flat absolute inset-0 opacity-25" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 50% 60%, rgba(31,120,255,0.07), transparent 70%)",
            }}
          />

          <div className="relative z-[1] mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-6 px-5 py-10 lg:grid-cols-[1.5fr_0.5fr] lg:gap-10 lg:px-10">
            <div className="clip-corner relative order-1 border border-neon/12 bg-void/60 p-3 md:p-6">
              <div ref={hostRef} className="relative aspect-[1000/470] w-full overflow-hidden">
                {/* HUD scan frame */}
                <div className="pointer-events-none absolute inset-0 z-10">
                  <span className={`${corner} left-3 top-3 border-l-2 border-t-2`} />
                  <span className={`${corner} right-3 top-3 border-r-2 border-t-2`} />
                  <span className={`${corner} bottom-3 left-3 border-b-2 border-l-2`} />
                  <span className={`${corner} bottom-3 right-3 border-b-2 border-r-2`} />
                </div>
                <span className="hud-chip pointer-events-none absolute left-5 top-4 z-10 text-[#5c8fd0]">
                  #EXP-014 · 3D
                </span>
                <span className="hud-chip pointer-events-none absolute right-5 top-4 z-10 text-[#5c8fd0]">
                  AXION-X // CUTAWAY
                </span>
                <span className="hud-chip pointer-events-none absolute bottom-4 left-5 z-10 text-[#5c8fd0]">
                  LIVE MODEL · GLB
                </span>
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px translate-y-[-1px] bg-white/25" />
              </div>

              <div className="flex items-center justify-between border-t border-line px-2 pt-3">
                <span className="hud-chip text-dim">DECONSTRUCTION MODE</span>
                <span className="hud-chip text-neon">
                  PROGRESS{" "}
                  <span ref={progRef} className="text-ice">
                    000
                  </span>
                  %
                </span>
              </div>
            </div>

            <div className="order-2 lg:order-1">
              <ul className="space-y-0.5">
                {MANIFEST.map((item, i) => (
                  <li
                    key={item.id}
                    data-row={item.id}
                    className="flex items-center gap-3 border-l-2 border-line py-1.5 pl-3 transition-colors duration-300 md:py-2 md:pl-4"
                  >
                    <span className="font-display text-xs font-black text-dim">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <p className="truncate font-display text-[10px] font-bold tracking-[0.16em] text-[#8fc0cf] md:text-[11px]">
                        {item.name}
                      </p>
                      <p className="truncate font-light text-[10px] text-dim md:text-[11px]">
                        {item.meta}
                      </p>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}