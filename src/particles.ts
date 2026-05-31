// パーティクル＆物理:
//  - ドローンが描く光の軌跡（トレイル）
//  - クリック/トリガーで弾ける光の粒子（バースト）
// いずれも加算合成なので Bloom と相性よく、暗い背景で発光して見える。
import * as THREE from "three";
import { scene } from "./setup.ts";
import { drone1, drone2 } from "./objCreateFunc.ts";

// ===== ドローンのトレイル =====
const TRAIL_LEN = 48;

interface Trail {
  line: THREE.Line;
  positions: Float32Array;
  colors: Float32Array;
  getDrone: () => THREE.Group | undefined;
  hue: number;
  initialized: boolean;
}

const trails: Trail[] = [];

function createTrail(getDrone: () => THREE.Group | undefined, hue: number): Trail {
  const positions = new Float32Array(TRAIL_LEN * 3);
  const colors = new Float32Array(TRAIL_LEN * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  scene.add(line);
  return { line, positions, colors, getDrone, hue, initialized: false };
}

export function initParticles() {
  // ドローンは非同期ロードのため、ここでは取得関数だけ渡しておく。
  trails.push(createTrail(() => drone1, 0.55)); // 水色系
  trails.push(createTrail(() => drone2, 0.08)); // 橙系
}

const _worldPos = new THREE.Vector3();
const _color = new THREE.Color();

function updateTrails() {
  trails.forEach((trail) => {
    const drone = trail.getDrone();
    if (!drone) return;
    drone.getWorldPosition(_worldPos);

    const pos = trail.positions;
    const col = trail.colors;

    if (!trail.initialized) {
      // 初回は全頂点を現在位置で埋める（線が原点から伸びないように）
      for (let i = 0; i < TRAIL_LEN; i++) {
        pos[i * 3] = _worldPos.x;
        pos[i * 3 + 1] = _worldPos.y;
        pos[i * 3 + 2] = _worldPos.z;
      }
      trail.initialized = true;
    }

    // 後ろへ1つずらして先頭に最新位置を入れる
    for (let i = TRAIL_LEN - 1; i > 0; i--) {
      pos[i * 3] = pos[(i - 1) * 3];
      pos[i * 3 + 1] = pos[(i - 1) * 3 + 1];
      pos[i * 3 + 2] = pos[(i - 1) * 3 + 2];
    }
    pos[0] = _worldPos.x;
    pos[1] = _worldPos.y;
    pos[2] = _worldPos.z;

    // 先頭が明るく、後方ほど暗く（加算合成なので暗い=消える）
    for (let i = 0; i < TRAIL_LEN; i++) {
      const fade = 1 - i / TRAIL_LEN;
      _color.setHSL(trail.hue, 0.9, 0.6 * fade * fade);
      col[i * 3] = _color.r;
      col[i * 3 + 1] = _color.g;
      col[i * 3 + 2] = _color.b;
    }

    trail.line.geometry.attributes.position.needsUpdate = true;
    trail.line.geometry.attributes.color.needsUpdate = true;
  });
}

// ===== 弾けるパーティクル（バースト） =====
interface Burst {
  points: THREE.Points;
  velocities: Float32Array;
  life: number;
  maxLife: number;
}

const bursts: Burst[] = [];
const PARTICLES_PER_BURST = 36;

export function spawnBurst(position: THREE.Vector3, hue = 0.55) {
  const count = PARTICLES_PER_BURST;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    // 球状にランダムな初速
    const dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    )
      .normalize()
      .multiplyScalar(4 + Math.random() * 6);
    velocities[i * 3] = dir.x;
    velocities[i * 3 + 1] = dir.y + 2;
    velocities[i * 3 + 2] = dir.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: new THREE.Color().setHSL(hue, 0.9, 0.65),
    size: 1.4,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  bursts.push({ points, velocities, life: 1.2, maxLife: 1.2 });
}

function updateBursts(delta: number) {
  const gravity = 9.0;
  for (let b = bursts.length - 1; b >= 0; b--) {
    const burst = bursts[b];
    burst.life -= delta;
    if (burst.life <= 0) {
      scene.remove(burst.points);
      burst.points.geometry.dispose();
      (burst.points.material as THREE.Material).dispose();
      bursts.splice(b, 1);
      continue;
    }
    const pos = burst.points.geometry.attributes.position.array as Float32Array;
    const vel = burst.velocities;
    for (let i = 0; i < pos.length / 3; i++) {
      vel[i * 3 + 1] -= gravity * delta;
      pos[i * 3] += vel[i * 3] * delta;
      pos[i * 3 + 1] += vel[i * 3 + 1] * delta;
      pos[i * 3 + 2] += vel[i * 3 + 2] * delta;
    }
    burst.points.geometry.attributes.position.needsUpdate = true;
    (burst.points.material as THREE.PointsMaterial).opacity =
      burst.life / burst.maxLife;
  }
}

export function updateParticles(delta: number) {
  updateTrails();
  updateBursts(delta);
}
