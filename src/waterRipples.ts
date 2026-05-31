// カーソル/クリックに反応する水面の波紋。
// ポインタ位置から水面(Water プレーン)へレイキャストし、当たった点に
// 広がりながら消えるリングを生成する。クリック時は少し大きめの波紋。
import * as THREE from "three";
import { scene, camera, water } from "./setup.ts";

interface Ripple {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  maxScale: number;
  baseOpacity: number;
}

const ripples: Ripple[] = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let lastSpawn = 0; // ホバー時の生成間引き用（ミリ秒）

function spawnRipple(point: THREE.Vector3, big: boolean) {
  // 細く控えめなリング（通常合成・低不透明度）
  const geometry = new THREE.RingGeometry(0.85, 1.0, 48);
  const material = new THREE.MeshBasicMaterial({
    color: big ? 0xafe4ff : 0x9fd6ee,
    transparent: true,
    opacity: big ? 0.35 : 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2; // 水面に寝かせる
  mesh.position.set(point.x, 0.15, point.z);
  scene.add(mesh);
  ripples.push({
    mesh,
    age: 0,
    life: big ? 1.4 : 1.0,
    maxScale: big ? 14 : 7,
    baseOpacity: big ? 0.35 : 0.18,
  });
}

function raycastWater(clientX: number, clientY: number): THREE.Vector3 | null {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(water, false);
  return hits.length > 0 ? hits[0].point : null;
}

export function initWaterRipples() {
  const canvas = document.getElementById("canvasContainer");
  if (!canvas) return;

  // ホバー時: 間引きながら小さな波紋
  canvas.addEventListener(
    "pointermove",
    (e: PointerEvent) => {
      const now = e.timeStamp;
      if (now - lastSpawn < 160) return;
      const point = raycastWater(e.clientX, e.clientY);
      if (point) {
        lastSpawn = now;
        spawnRipple(point, false);
      }
    },
    { passive: true }
  );

  // クリック時: 大きな波紋＋飛沫（水面をクリックしたときだけ）
  canvas.addEventListener(
    "pointerdown",
    (e: PointerEvent) => {
      const point = raycastWater(e.clientX, e.clientY);
      if (point) {
        spawnRipple(point, true);
      }
    },
    { passive: true }
  );
}

export function updateWaterRipples(delta: number) {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.age += delta;
    const t = r.age / r.life;
    if (t >= 1) {
      scene.remove(r.mesh);
      r.mesh.geometry.dispose();
      (r.mesh.material as THREE.Material).dispose();
      ripples.splice(i, 1);
      continue;
    }
    const scale = 1 + t * r.maxScale;
    r.mesh.scale.set(scale, scale, scale);
    (r.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - t) * r.baseOpacity;
  }
}
