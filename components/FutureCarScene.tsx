"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type Props = {
  progressRef: RefObject<{ p: number }>;
};

type View = { pos: [number, number, number]; look: [number, number, number] };

const STAGES = 6;

const VIEWS: View[] = [
  // S0 intro — front-left 3/4
  { pos: [5.6, 2.0, 6.6], look: [0, 0.85, 0.4] },
  // S1 engine — rear, engine hatch open
  { pos: [-5.2, 2.4, -6.0], look: [0, 1.0, -1.6] },
  // S2 wheels — front-left wheel closeup
  { pos: [-5.2, 1.4, 3.7], look: [-1.9, 0.55, 2.6] },
  // S3 doors — left side, interior visible
  { pos: [-4.6, 1.6, 1.2], look: [0.8, 1.05, 0.4] },
  // S4 frunk — front trunk open, high right
  { pos: [5.6, 2.6, 4.8], look: [1.3, 1.05, 1.9] },
  // S5 cockpit — front, low, into the cabin
  { pos: [-1.4, 1.5, 4.1], look: [0.2, 1.15, 1.1] },
  // S6 finale — elevated frontal, car drives toward the camera
  { pos: [0.0, 2.4, 7.6], look: [0, 0.7, 0.0] },
];

const PG = (t: number) => t * t * (3 - 2 * t);
const smooth = (x: number, a: number, b: number) => THREE.MathUtils.smoothstep(x, a, b);
const WHEEL_RADIUS = 0.3;

type PanelSpec = {
  name: string;
  openAt: number;
  closeFrom: number;
  closeTo: number;
  angle: number;
  bias?: number;
  // reversed: rest pose = fully closed (rotation = angle, shift at 100%), and the
  // stage sweep drives it to the open (authored) pose. Enables "closed at start,
  // open during the feature, closed again before drive-off" sequencing.
  reversed?: boolean;
  // shift: world-space translation added to the pivot when the deck is closed.
  // [x, y, z]: +Z car-front, +Y up. Scrubs the CLOSED pose (e.g. close a cowl gap /
  // pull the deck off the windshield); in reversed mode it fades to 0 as it opens.
  shift?: [number, number, number];
};

// All opening panels are driven by the model's own mechanism nodes (see MECH_SPECS below),
// except the front bonnet whose action poses are degenerate — it keeps a hinge pivot.
const PANEL_SPECS: PanelSpec[] = [
  // front bonnet / frunk: lifts at stage 4, closes before stage 5. bias 0 keeps the deck at its raw
  // authored pose at rest. The open sweep (angle 0.6, +sign) then hinges it from its REAR (cowl)
  // seam so the free nose edge sweeps toward the body — opposite of opening further upward.
  { name: "Frunk_69", openAt: 0.615, closeFrom: 0.77, closeTo: 0.83, angle: 1.05, bias: 0.0, reversed: true, shift: [0, -0.06875, 0.16] },
];

type Panel = {
  pivot: THREE.Group;
  axis: THREE.Vector3;
  sign: number;
  spec: PanelSpec;
  basePos: THREE.Vector3;
  baseScale: number;
  open?: number;
};

type MechSpec = {
  node: string;
  clip: string;
  openAt: number;
  closeFrom: number;
  closeTo: number;
  // flushOffset: world-displacement added to the node when fully closed. The door action's END
  // pose lies ~0.22 proud of the body shell, so the closed pose is pushed in until it's flush.
  flushOffset?: [number, number, number];
};

// The model's own animation actions animate these nodes from an OPEN pose to a CLOSED pose.
// We hold each mechanism at its closed (action END) pose at rest, then reverse the action to
// open it during its stage.
const MECH_SPECS: MechSpec[] = [
  // Object_239Action / Object_204Action — left and right doors (END = flat closed). The door
  // nodes are world-mirrored in X; +X local motion tucks the LEFT door inward. Full flush sit
  // reads "too far in", so use half that inset for a near-flush fit.
  { node: "Object_239", clip: "Object_239Action", openAt: 0.45, closeFrom: 0.6, closeTo: 0.66, flushOffset: [0.111, 0, 0] },
  { node: "Object_204", clip: "Object_204Action", openAt: 0.45, closeFrom: 0.6, closeTo: 0.66, flushOffset: [-0.111, 0, 0] },
  // Object_247Action — rear engine-bay hatch (trunk lid; END = flush deck).
  { node: "Object_247", clip: "Object_247Action", openAt: 0.1667, closeFrom: 0.42, closeTo: 0.47 },
];

type Mech = {
  node: THREE.Object3D;
  qClosed: THREE.Quaternion;
  qOpen: THREE.Quaternion;
  pClosed: THREE.Vector3 | null;
  pOpen: THREE.Vector3 | null;
  openAt: number;
  closeFrom: number;
  closeTo: number;
};

export default function FutureCarScene({ progressRef }: Props) {
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
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060111);
    scene.fog = new THREE.FogExp2(0x060111, 0.03);

    const camera = new THREE.PerspectiveCamera(
      45,
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

    const key = new THREE.DirectionalLight(0x00e5ff, 2.8);
    scene.add(key);
    const neon = new THREE.PointLight(0x00e5ff, 15, 30, 2);
    scene.add(neon);
    scene.add(new THREE.AmbientLight(0x3d1f66, 0.5));
    const underGlow = new THREE.PointLight(0xff2ea6, 11, 9);
    underGlow.position.set(0, 0.25, 0);
    scene.add(underGlow);
    const topLight = new THREE.DirectionalLight(0xffffff, 2.0);
    topLight.position.set(0, 7, 4);
    scene.add(topLight);

    const car = new THREE.Group();
    scene.add(car);

    const wheels: THREE.Object3D[] = [];
    const panels: Panel[] = [];
    const mechs: Mech[] = [];
    let lastCarZ = 0;
    const carState = { z: 0 };
    let disposed = false;

    const MODEL_URL = "/media/threeD/animated-chevrolet-c8-model/source/Chevrollete C8 Model.glb";
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      MODEL_URL,
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
        const plane = m.getObjectByName("Plane");
        const targetLen = 5.3;

        m.updateMatrixWorld(true);
        const boxCar = (box: THREE.Box3) => {
          m.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh) return;
            if (plane && (o === plane || o.parent === plane)) return;
            box.union(new THREE.Box3().setFromObject(mesh));
          });
        };
        const bb = new THREE.Box3();
        boxCar(bb);
        const k =
          targetLen /
          Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
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

        m.traverse((o) => {
          if (/^(Front|Rear)_(Left|Right)_Wheel_\d+$/.test(o.name || "")) wheels.push(o);
        });

        PANEL_SPECS.forEach((spec) => {
          const panel = m.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(spec.name));
          if (!panel) return;
          const bb = new THREE.Box3().setFromObject(panel);
          const ctr = bb.getCenter(new THREE.Vector3());
          const size = bb.getSize(new THREE.Vector3());

          const hingeWorld = new THREE.Vector3();
          let axisWorld = new THREE.Vector3(1, 0, 0);
          let sign = -1; // hood hinged at cabin edge: -X rotation lifts free edge toward +Z
          if (spec.name.startsWith("Left_Door") || spec.name.startsWith("Right_Door")) {
            // Door hinges at the A-pillar front edge; authored state is flared open, so bias pulls
            // the door flush against the body (body shell at the door band is ~1.10).
            hingeWorld.set(spec.name.startsWith("Left_Door") ? 1.02 : -1.02, bb.min.y + size.y * 0.3, 1.14);
            axisWorld.set(0, 1, 0);
            sign = ctr.x > 0 ? -1 : 1;
          } else {
            const frunk = spec.name === "Frunk_69";
            // Frunk hinges on its REAR (cowl) seam; bias 0 keeps the rest pose = raw authored pose.
            // Positive sign sweeps the free NOSE edge down toward the body (opposite of opening up).
            if (frunk) {
              const deck = m.getObjectByName("Object_121");
              const seamZ = deck ? new THREE.Box3().setFromObject(deck).min.z : bb.min.z;
              // ride the top of the deck's rear seam so the hinge line sits on the cowl edge
              const w = new THREE.Vector3();
              let seamTopY = -Infinity;
              if (deck) {
                deck.updateWorldMatrix(true, true);
                deck.traverse((o) => {
                  if (!(o as THREE.Mesh).isMesh || !(o as THREE.Mesh).geometry) return;
                  const mesh = o as THREE.Mesh;
                  const pos = mesh.geometry.attributes.position;
                  for (let i = 0; i < pos.count; i++) {
                    w.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
                    if (w.z < seamZ + 0.1 && w.y > seamTopY) seamTopY = w.y;
                  }
                });
              }
              if (seamTopY === -Infinity) seamTopY = bb.max.y - 0.04;
              hingeWorld.set(ctr.x, seamTopY, seamZ);
            } else {
              hingeWorld.set(ctr.x, bb.min.y, bb.max.z);
            }
            sign = 1;
          }

          const panelParent = panel.parent!;
          panelParent.worldToLocal(hingeWorld);
          const pivot = new THREE.Group();
          pivot.position.copy(hingeWorld);
          panelParent.add(pivot);
          pivot.quaternion.set(0, 0, 0, 1);
          pivot.updateMatrixWorld(true);

          const world0 = new THREE.Matrix4().copy(panel.matrixWorld);
          const rel = pivot.matrixWorld.clone().invert().multiply(world0);
          pivot.add(panel);
          panel.matrix.copy(rel);
          panel.matrixAutoUpdate = false;

          const localAxis = axisWorld
            .clone()
            .applyQuaternion(
              new THREE.Quaternion().setFromRotationMatrix(pivot.matrixWorld)
            )
            .normalize();

          panels.push({
            pivot,
            axis: localAxis,
            sign,
            spec,
            basePos: hingeWorld.clone(),
            baseScale: panelParent.getWorldScale(new THREE.Vector3()).x,
            open: 0,
          });
        });

        // Mechanisms: read each open -> close action's first (open) and last (closed) keyframes
        // and drop every mechanism into its closed pose immediately.
        const readQuat = (track: THREE.KeyframeTrack, i: number) =>
          new THREE.Quaternion().fromArray(track.values as unknown as number[], i * 4);
        const readVec = (track: THREE.KeyframeTrack, i: number) =>
          new THREE.Vector3().fromArray(track.values as unknown as number[], i * 3);
        const saneQuat = (q: THREE.Quaternion) =>
          Math.abs(q.lengthSq() - 1) < 0.05;
        for (const spec of MECH_SPECS) {
          const node = m.getObjectByName(spec.node);
          if (!node) continue;
          const clip = m.animations.find((c) => c.name.startsWith(spec.clip));
          const qTrack =
            clip && clip.tracks.find((t) => t.name.endsWith(".quaternion"));
          const pTrack =
            clip && clip.tracks.find((t) => t.name.endsWith(".position"));
          let qOpen = qTrack ? readQuat(qTrack, 0) : node.quaternion.clone();
          const qClosed = qTrack
            ? readQuat(qTrack, Math.floor(qTrack.values.length / 4) - 1)
            : new THREE.Quaternion();
          if (qTrack && !saneQuat(qOpen)) {
            for (let i = 0; i < Math.floor(qTrack.values.length / 4); i++) {
              const q = readQuat(qTrack, i);
              if (saneQuat(q)) { qOpen.copy(q); break; }
            }
          }
          let pOpen: THREE.Vector3 | null = node.position.clone();
          let pClosed: THREE.Vector3 | null = null;
          if (pTrack) {
            const last = readVec(pTrack, Math.floor(pTrack.values.length / 3) - 1);
            if (Math.abs(last.x) < 5 && Math.abs(last.y) < 5 && Math.abs(last.z) < 5) {
              pClosed = last;
            }
          }
          if (spec.flushOffset) {
            pClosed = pOpen.clone().add(
              new THREE.Vector3(spec.flushOffset[0], spec.flushOffset[1], spec.flushOffset[2])
            );
          }
          node.quaternion.copy(qClosed);
          if (pClosed) node.position.copy(pClosed);
          if (qTrack) qOpen = qOpen.normalize();
          mechs.push({
            node, qClosed: qClosed.normalize(), qOpen,
            pOpen: pOpen ?? null, pClosed,
            openAt: spec.openAt, closeFrom: spec.closeFrom, closeTo: spec.closeTo,
          });
        }
      },
      undefined,
      (err) => {
        console.error("C8 GLTF failed:", err);
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
    gradTex.wrapS = gradTex.wrapT = THREE.RepeatWrapping;
    const gradMat = new THREE.MeshBasicMaterial({ map: gradTex, fog: false, depthWrite: false });
    const gradBg = new THREE.Mesh(new THREE.PlaneGeometry(260, 140), gradMat);
    gradBg.position.set(0, 0, -32);
    camera.add(gradBg);

    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    const l0 = new THREE.Vector3();
    const l1 = new THREE.Vector3();
    const target = new THREE.Vector3();
    const axisX = new THREE.Vector3(1, 0, 0);
    const tmpQ = new THREE.Quaternion();
    const clock = new THREE.Clock();

    let raf = 0;
    const loopFn = () => {
      raf = requestAnimationFrame(loopFn);
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
      neon.color.set(0x00e5ff).lerp(new THREE.Color(0xff2ea6), (mx + 1) * 0.5);

      const segCount = VIEWS.length - 1;
      const pos = THREE.MathUtils.clamp(p, 0, 1) * segCount;
      const k = Math.min(Math.floor(pos), segCount - 1);
      const u = PG(pos - k);
      p0.fromArray(VIEWS[k].pos);
      p1.fromArray(VIEWS[k + 1].pos);
      l0.fromArray(VIEWS[k].look);
      l1.fromArray(VIEWS[k + 1].look);
      camera.position.lerpVectors(p0, p1, u);
      camera.position.x += mx * 0.35;
      camera.position.y += my * 0.2;
      target.lerpVectors(l0, l1, u);
      camera.lookAt(target);

      panels.forEach((panel) => {
        const s = panel.spec;
        const opening = smooth(p, s.openAt - 0.03, s.openAt + 0.08);
        const closing = smooth(p, s.closeFrom, s.closeTo);
        const open = opening * (1 - closing);
        const forced = p < 0.1 || p > 0.95 ? 0 : open;
        panel.open = forced;
        const bias = s.bias ?? 0;
        if (s.reversed) {
          // rest = closed (rotation `angle`, full shift); open = authored pose.
          tmpQ.setFromAxisAngle(panel.axis, (bias + s.angle * (1 - forced)) * panel.sign);
        } else {
          tmpQ.setFromAxisAngle(panel.axis, (bias + forced * s.angle) * panel.sign);
        }
        panel.pivot.quaternion.copy(tmpQ);
        const sh = s.shift;
        if (sh) {
          // shift is in world units; the pivot lives under a parent scaled by k (~0.08),
          // so convert to the parent's local scale before adding.
          const k = s.reversed ? 1 - forced : forced;
          panel.pivot.position.copy(panel.basePos);
          panel.pivot.position.x += (sh[0] * k) / panel.baseScale;
          panel.pivot.position.y += (sh[1] * k) / panel.baseScale;
          panel.pivot.position.z += (sh[2] * k) / panel.baseScale;
        }
      });

// Mechanisms hold the closed (action-end) pose at rest; open = reverse the action.
      for (const mch of mechs) {
        const opening = smooth(p, mch.openAt - 0.03, mch.openAt + 0.08);
        const closing = smooth(p, mch.closeFrom, mch.closeTo);
        const o = p < 0.1 || p > 0.95 ? 0 : opening * (1 - closing);
        mch.node.quaternion.slerpQuaternions(mch.qClosed, mch.qOpen, o);
        if (mch.pOpen && mch.pClosed) {
          mch.node.position.lerpVectors(mch.pClosed, mch.pOpen, o);
        }
      }

      const drive = reduce ? 0 : smooth(p, 0.955, 1);
      carState.z = drive * drive * 46;
      car.position.z = carState.z;
      car.position.y = reduce ? 0 : Math.sin(t * 0.7) * 0.012 * (1 - drive);
      car.rotation.x = reduce ? 0 : -0.05 * drive;

      if (!reduce) {
        const dz = car.position.z - lastCarZ;
        lastCarZ = car.position.z;
        const spinActive = smooth(p, 0.3, 0.42);
        const showcase = (1 - drive) * (spinActive * 7 + 0.001);
        const turn = showcase * dt + dz / WHEEL_RADIUS;
        for (let i = 0; i < wheels.length; i++) {
          wheels[i].rotateOnWorldAxis(axisX, turn);
        }
      }

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
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
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