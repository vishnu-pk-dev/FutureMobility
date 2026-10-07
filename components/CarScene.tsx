"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type Props = {
  progressRef: RefObject<{ p: number }>;
};

export default function CarScene({ progressRef }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
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
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060111);
    scene.fog = new THREE.FogExp2(0x060111, 0.038);

    const camera = new THREE.PerspectiveCamera(
      45,
      el.clientWidth / el.clientHeight,
      0.1,
      80
    );
    camera.position.set(0, 1.7, 7.4);

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

    const key = new THREE.DirectionalLight(0x00e5ff, 2.6);
    scene.add(key);
    const neon = new THREE.PointLight(0x00e5ff, 14, 22, 2);
    scene.add(neon);
    scene.add(new THREE.AmbientLight(0x3d1f66, 0.55));
    const underGlow = new THREE.PointLight(0xff2ea6, 10, 7);
    underGlow.position.set(0, 0.25, 0);
    scene.add(underGlow);
    const topLight = new THREE.DirectionalLight(0xffffff, 1.8);
    topLight.position.set(0, 7, 4);
    scene.add(topLight);

    const car = new THREE.Group();
    car.rotation.y = reduce ? 0.5 : 0;
    car.position.y = -0.28;
    scene.add(car);
    let disposed = false;
    let doorCtrl: ((t: number) => void) | null = null;

    const GLB_URL =
      "/media/threeD/lamborghini_centenario_roadster_sdc/scene.gltf";
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      GLB_URL,
      (gltf) => {
        if (disposed) {
          gltf.scene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.geometry) m.geometry.dispose();
            const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
            if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
            else if (mat) mat.dispose();
          });
          return;
        }
        const m = gltf.scene;
        const targetLen = 5.3;
        m.updateMatrixWorld(true);
        let box = new THREE.Box3().setFromObject(m);
        let size = box.getSize(new THREE.Vector3());
        const k = targetLen / Math.max(size.x, size.z);
        m.scale.setScalar(k);
        m.updateMatrixWorld(true);
        box = new THREE.Box3().setFromObject(m);
        size = box.getSize(new THREE.Vector3());
        const c = box.getCenter(new THREE.Vector3());
        m.position.x -= c.x;
        m.position.z -= c.z;
        m.position.y = 0.02 - box.min.y;
        car.add(m);

        m.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (let i = 0; i < mats.length; i++) {
            const mm = mats[i] as THREE.MeshStandardMaterial;
            const n = (mm.name || "").toLowerCase();
            const isPaint =
              n.includes("body_colour") || n.includes("centenario") || n.includes("paint");
            const isLight =
              n.includes("ligt") ||
              n.includes("runninglight") ||
              n.includes("beltinterior") ||
              n.includes("lightsnormal");
            const isGlass =
              n.includes("glass") || n.includes("headlight") || n.includes("gls_ar");
            if (isPaint) {
              const white = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0.3,
                roughness: 0.22,
                envMapIntensity: 1.5,
                clearcoat: 1,
                clearcoatRoughness: 0.1,
              });
              if (Array.isArray(mesh.material)) mesh.material[i] = white;
              else mesh.material = white;
              mm.dispose();
            } else if (isLight) {
              if (mm.emissive) {
                mm.emissive.set(0x38acff);
                mm.emissiveIntensity = 2.2;
              } else {
                mm.color.set(0x38acff);
              }
            } else if (isGlass) {
              mm.transparent = true;
              mm.depthWrite = false;
              mm.opacity = Math.min(mm.opacity ?? 1, 0.65);
            }
          }
        });

        // Scrubbed playback of the model's own baked butterfly-door animation
        // (targets Empty.001_16 / Empty.002_20, the groups that already hold the
        // doors + mirrors). The author's hinge and full open angle come with it.
        if (gltf.animations && gltf.animations.length) {
          const clip = gltf.animations[0];
          const tracks: { node: THREE.Object3D; track: THREE.KeyframeTrack; path: string }[] =
            [];
          clip.tracks.forEach((tr) => {
            const dot = tr.name.lastIndexOf(".");
            if (dot < 0) return;
            const nodeName = tr.name.slice(0, dot);
            const suffix = tr.name.slice(dot + 1);
            const path = suffix === "quaternion" ? "rotation" : suffix === "scale" ? "scale" : "";
            if (!path) return;
            let node: THREE.Object3D | null = null;
            m.traverse((o) => {
              if (o.name === nodeName) node = o;
            });
            if (node) tracks.push({ node, track: tr, path });
          });
          if (tracks.length) {
            const q0 = new THREE.Quaternion();
            const q1 = new THREE.Quaternion();
            const v0 = new THREE.Vector3();
            doorCtrl = (t: number) => {
              tracks.forEach(({ node, track, path }) => {
                const times = track.times as unknown as number[];
                const vals = track.values as unknown as number[];
                const n = times.length;
                if (!n) return;
                let i0 = 0;
                for (let i = 1; i < n; i++) if (times[i] <= t) i0 = i;
                const i1 = Math.min(i0 + 1, n - 1);
                const k = i0 >= n - 1 ? 1 : (t - times[i0]) / (times[i1] - times[i0] || 1);
                if (path === "rotation") {
                  if (k <= 0) {
                    node.quaternion.set(vals[i0 * 4], vals[i0 * 4 + 1], vals[i0 * 4 + 2], vals[i0 * 4 + 3]);
                  } else {
                    q0.set(vals[i0 * 4], vals[i0 * 4 + 1], vals[i0 * 4 + 2], vals[i0 * 4 + 3]);
                    q1.set(vals[i1 * 4], vals[i1 * 4 + 1], vals[i1 * 4 + 2], vals[i1 * 4 + 3]);
                    node.quaternion.slerpQuaternions(q0, q1, k);
                  }
                } else {
                  const stride = Math.floor(vals.length / n);
                  v0.set(
                    vals[i0 * stride] * (1 - k) + vals[i1 * stride] * k,
                    vals[i0 * stride + 1] * (1 - k) + vals[i1 * stride + 1] * k,
                    vals[i0 * stride + 2] * (1 - k) + vals[i1 * stride + 2] * k
                  );
                  node.scale.copy(v0);
                }
              });
            };
            doorCtrl(0.05);
          }
        }
      },
      undefined,
      (err) => {
        console.error("GLB load failed:", err);
      }
    );

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
    const gradMat = new THREE.MeshBasicMaterial({
      map: gradTex,
      fog: false,
      depthWrite: false,
    });
    const gradBg = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), gradMat);
    gradBg.position.set(0, 3, -13);
    scene.add(gradBg);

    const clock = new THREE.Clock();
    let raf = 0;
    let camY = 1.9;
    const cyan = new THREE.Color(0x00e5ff);
    const magenta = new THREE.Color(0xff2ea6);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = clock.getDelta();
      const t = clock.elapsedTime;
      const p = reduce ? 0 : progressRef.current.p;

      const damp = 1 - Math.pow(0.001, dt);
      key.position.x = key.position.x * (1 - damp) + mx * 5 * damp;
      key.position.y = key.position.y * (1 - damp) + (5 + my * 2) * damp;
      key.position.z = key.position.z * (1 - damp) + 6 * damp;
      const nx = Math.sin(mx * Math.PI * 0.45) * 5;
      const nz = Math.cos(mx * Math.PI * 0.45) * 5;
      const ny = 2.4 + my * 1.8;
      neon.position.x = neon.position.x * (1 - damp) + nx * damp;
      neon.position.y = neon.position.y * (1 - damp) + ny * damp;
      neon.position.z = neon.position.z * (1 - damp) + nz * damp;
      neon.color.copy(cyan).lerp(magenta, (mx + 1) * 0.5);

      const moveRaw = reduce ? 0 : THREE.MathUtils.clamp((p - 0.18) / 0.34, 0, 1);
      const move = moveRaw * moveRaw * (3 - 2 * moveRaw);
      const backRaw = reduce ? 0 : THREE.MathUtils.clamp((p - 0.7) / 0.14, 0, 1);
      const back = backRaw * backRaw * (3 - 2 * backRaw);

      car.scale.setScalar(1.22 - 0.12 * move + back * 0.13);
      car.position.x = -3.4 * move * (1 - back);
      car.rotation.y = reduce ? 0.5 : t * 0.12 + p * Math.PI * 2.6 + move * Math.PI + back * 1.15;
      car.rotation.x = reduce ? 0 : (Math.sin(t * 0.25) * 0.02 - p * 0.05) * (1 - move * 0.6);

      const targetY = reduce ? 1.9 : 1.88 + p * 0.12 + Math.sin(t * 0.4) * 0.08 - back * 0.75;
      camY += (targetY - camY) * 0.05;
      camera.position.y = camY;
      camera.position.z = reduce ? 7.9 : 7.9 - p * 1.1 + move * 0.7 - back * 1.4;
      camera.lookAt(-1.1 * move * (1 - back), 1.05, 0);

      if (!reduce && doorCtrl) {
        let dt2: number;
        if (backRaw > 0) {
          dt2 = THREE.MathUtils.lerp(3.71, 2.07, backRaw);
        } else if (p >= 0.42) {
          dt2 = 3.71;
        } else if (p <= 0.12) {
          dt2 = 0.05;
        } else {
          dt2 = THREE.MathUtils.lerp(2.07, 3.71, (p - 0.12) / 0.3);
        }
        doorCtrl(dt2);
      }

      renderer.render(scene, camera);
    };
    loop();

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
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = (m as THREE.Mesh).material as
          | THREE.Material
          | THREE.Material[]
          | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      scene.environment?.dispose();
      gradTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [progressRef]);

  return (
    <div
      ref={host}
      aria-hidden
      className="absolute inset-0 z-0"
      style={{ contain: "strict" }}
    />
  );
}