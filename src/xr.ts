// WebXR（VR）対応:
//  - 画面右下に VRButton を表示し、対応ヘッドセットで没入モードに入れる
//  - コントローラからレーザーを出し、トリガーで 360 画像/動画の球へワープ
//  - スティックで空間を自由に飛び回れる（移動＝右手 / 旋回＝左手）
//
// 移動は「プレイヤー Dolly（カメラの親グループ）」を動かして実現する。
// VR 中はカメラのローカル位置をヘッドセットが上書きするため、カメラを直接
// 動かせない。Dolly を動かすことで世界内を移動する。
// 近接判定(objMove/utils)はワールド座標を見るよう修正済みなので破綻しない。
import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { scene, camera, renderer } from "./setup.ts";
import { videoSpheres, imageSpheres } from "./objCreateFunc.ts";
import { spawnBurst } from "./particles.ts";
import { isMobile } from "./utils.ts";

let dolly: THREE.Group;
let controller0: THREE.XRTargetRaySpace;
let controller1: THREE.XRTargetRaySpace;
let cameraWasInScene = false;

const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
const up = new THREE.Vector3(0, 1, 0);

// VR セッションを終了する（コントローラのグリップ握りで呼ばれる）
function endVRSession() {
  const session = renderer.xr.getSession();
  if (session) session.end();
}

// コントローラのレーザー＋小さな本体を作る
function buildControllerVisual(): THREE.Group {
  const group = new THREE.Group();

  // レーザー光線
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -8),
  ]);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x66ddff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });
  group.add(new THREE.Line(lineGeo, lineMat));

  // コントローラ本体（簡易表現）
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.04, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0x222233,
      emissive: 0x113355,
      metalness: 0.6,
      roughness: 0.3,
    })
  );
  body.position.z = 0.02;
  group.add(body);

  return group;
}

function onSelectStart(event: { target: THREE.XRTargetRaySpace }) {
  const controller = event.target;
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  const hits = raycaster.intersectObjects(
    [...videoSpheres, ...imageSpheres],
    false
  );

  if (hits.length > 0) {
    const obj = hits[0].object as THREE.Object3D;
    // ヘッドが球の中心に来るよう Dolly を移動 = 360 空間にワープ
    const headLocalY = camera.position.y; // local-floor 基準の目線高さ
    dolly.position.set(obj.position.x, obj.position.y - headLocalY, obj.position.z);
    spawnBurst(hits[0].point, 0.55);
  } else {
    // 何もない方向なら、その先で粒子を弾けさせる
    const p = raycaster.ray.origin
      .clone()
      .add(raycaster.ray.direction.clone().multiplyScalar(10));
    spawnBurst(p, 0.08);
  }
}

function onSessionStart() {
  // カメラを Dolly の子に移し替え、これまでのワールド位置を Dolly に引き継ぐ
  dolly.position.copy(camera.position);
  dolly.position.y -= 1.6; // local-floor の目線高さ(約1.6m)ぶん下げる
  camera.position.set(0, 0, 0);
  dolly.add(camera);
  cameraWasInScene = true;
}

function onSessionEnd() {
  // カメラをシーン直下に戻し、ワールド位置を復元
  if (cameraWasInScene) {
    const worldPos = new THREE.Vector3();
    dolly.getWorldPosition(worldPos);
    scene.add(camera);
    camera.position.set(worldPos.x, worldPos.y + 1.6, worldPos.z);
    cameraWasInScene = false;
  }
}

// VRButton の「VR NOT SUPPORTED」だけを、デバイス非対応だと分かる文言へ置き換える。
// （"WEBXR NEEDS HTTPS" 等は意味のある案内なのでそのまま残す。位置は three の
//   デフォルト＝下部中央のまま）
function patchVRButton(button: HTMLElement) {
  const TARGET = "VR not supported on your device";
  const fix = () => {
    if (button.textContent === "VR NOT SUPPORTED") {
      button.textContent = TARGET;
    }
  };
  fix();
  // VRButton はサポート判定の Promise 解決後に文言を書き換えるため、監視して上書きする
  new MutationObserver(fix).observe(button, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

export function initXR() {
  // スマホでは VR が使えず、非対応ボタンが他UIと重なるだけなので表示しない
  if (!isMobile()) {
    const vrButton = VRButton.createButton(renderer);
    patchVRButton(vrButton);
    document.body.appendChild(vrButton);
  }

  dolly = new THREE.Group();
  dolly.name = "player-dolly";
  scene.add(dolly);

  controller0 = renderer.xr.getController(0);
  controller1 = renderer.xr.getController(1);
  [controller0, controller1].forEach((c) => {
    c.add(buildControllerVisual());
    c.addEventListener("selectstart", onSelectStart as any);
    // グリップ(握りボタン)でも VR を終了できるようにする（保険）
    c.addEventListener("squeezestart", endVRSession);
    dolly.add(c);
  });

  renderer.xr.addEventListener("sessionstart", onSessionStart);
  renderer.xr.addEventListener("sessionend", onSessionEnd);
}

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const DEAD = 0.15;

// 毎フレーム: スティックによる移動・旋回
export function updateXR(delta: number) {
  if (!renderer.xr.isPresenting || !dolly) return;
  const session = renderer.xr.getSession();
  if (!session) return;

  let moveX = 0;
  let moveZ = 0;
  let turn = 0;

  for (const src of session.inputSources) {
    const gp = src.gamepad;
    if (!gp) continue;
    const ax = gp.axes;
    // タッチ系コントローラは [2],[3] にスティック、無ければ [0],[1]
    const sx = ax.length >= 4 ? ax[2] : ax[0] || 0;
    const sy = ax.length >= 4 ? ax[3] : ax[1] || 0;

    if (src.handedness === "left") {
      if (Math.abs(sx) > DEAD) turn += sx; // 左手X = 旋回
    } else {
      if (Math.abs(sx) > DEAD) moveX += sx; // 右手 = 平行移動
      if (Math.abs(sy) > DEAD) moveZ += sy;
    }
  }

  // 旋回（頭の位置を中心に Dolly を回す）
  if (turn !== 0) {
    dolly.rotateY(-turn * delta * 1.8);
  }

  // 移動（頭の向いている水平方向を基準に）
  if (moveX !== 0 || moveZ !== 0) {
    camera.getWorldDirection(_forward);
    _forward.y = 0;
    _forward.normalize();
    _right.crossVectors(_forward, up).normalize();

    const speed = 24 * delta;
    // スティック上(sy<0)で前進
    dolly.position.addScaledVector(_forward, -moveZ * speed);
    dolly.position.addScaledVector(_right, moveX * speed);
  }
}
