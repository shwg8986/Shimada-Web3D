// クリック可能なオブジェクト（360球・パネル）の上に、小さな下向き三角(▽)を
// 浮かべて「押せる」ことを示すマーカー。カメラの方を向き、ゆっくり上下に揺れる。
// 画像球は非同期で生成されるため、毎フレーム未付与のものへ後から追加する。
import * as THREE from "three";
import { scene, camera } from "./setup.ts";
import { videoSpheres, imageSpheres, tabObjects } from "./objCreateFunc.ts";

interface Marker {
  mesh: THREE.Mesh;
  target: THREE.Object3D;
  topOffset: number; // オブジェクト中心からマーカーまでの高さ
  phase: number; // 揺れの位相（個体差）
}

const markers: Marker[] = [];
const tracked = new Set<THREE.Object3D>();

let geometry: THREE.ShapeGeometry | undefined;
let material: THREE.MeshBasicMaterial | undefined;

function ensureAssets() {
  if (geometry && material) return;
  // 下向き三角(▽): 上辺が水平で、頂点が下を向く
  const shape = new THREE.Shape();
  shape.moveTo(-0.9, 0.6);
  shape.lineTo(0.9, 0.6);
  shape.lineTo(0, -0.7);
  shape.closePath();
  geometry = new THREE.ShapeGeometry(shape);
  material = new THREE.MeshBasicMaterial({
    color: 0xfff1d6, // 夕焼けになじむ暖色の白
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

// オブジェクトの上端＋少し上、までの高さを求める
function topOffsetFor(obj: THREE.Object3D): number {
  const g = (obj as THREE.Mesh).geometry as any;
  if (g?.type === "SphereGeometry") return (g.parameters.radius ?? 5) + 1.8;
  if (g?.type === "PlaneGeometry") return (g.parameters.height ?? 10) / 2 + 1.6;
  return 6;
}

function addMarker(obj: THREE.Object3D) {
  ensureAssets();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 10;
  scene.add(mesh);
  markers.push({
    mesh,
    target: obj,
    topOffset: topOffsetFor(obj),
    phase: markers.length * 0.7,
  });
  tracked.add(obj);
}

export function initClickMarkers() {
  ensureAssets();
}

const _q = new THREE.Quaternion();

export function updateClickMarkers(elapsed: number) {
  // 後から生成されたオブジェクト（画像球など）にもマーカーを付与
  for (const obj of [...videoSpheres, ...imageSpheres, ...tabObjects]) {
    if (!tracked.has(obj)) addMarker(obj);
  }

  // 全マーカーをカメラへ向ける（ビルボード）＋上下に揺らす
  camera.getWorldQuaternion(_q);
  for (const m of markers) {
    const p = m.target.position;
    const bob = Math.sin(elapsed * 2 + m.phase) * 0.35;
    m.mesh.position.set(p.x, p.y + m.topOffset + bob, p.z);
    m.mesh.quaternion.copy(_q);
  }

  // ごく弱い明滅で視線を誘導する
  if (material) material.opacity = 0.7 + Math.sin(elapsed * 3) * 0.2;
}
