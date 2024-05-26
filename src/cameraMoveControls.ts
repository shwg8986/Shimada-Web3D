import * as THREE from "three";
import { camera } from "./setup";
import nipplejs from "nipplejs";

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// 移動時にカメラのピッチ角度をリセットするための関数
export function resetCameraPitch() {
  const euler = new THREE.Euler(0, camera.rotation.y, 0, "YXZ");
  camera.rotation.copy(euler);
}

// ズーム機能の実装 - PC
export function onMouseWheel(event: WheelEvent) {
  camera.fov += event.deltaY * 0.05; // マウスホイールの移動量に応じて視野角を調整
  camera.fov = Math.max(20, Math.min(120, camera.fov)); // 最小・最大の視野角を設定
  camera.updateProjectionMatrix();
}

// ズーム機能の実装 - スマホ
export function onTouchPinch(this: any, event: TouchEvent) {
  if (event.touches.length == 2) {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (this.lastTouchDistance !== undefined) {
      const deltaDistance = distance - this.lastTouchDistance;
      camera.fov -= deltaDistance * 0.1; // ピンチの動きに応じて視野角を調整
      camera.fov = Math.max(20, Math.min(120, camera.fov)); // 最小・最大の視野角を設定
      camera.updateProjectionMatrix();
    }

    this.lastTouchDistance = distance;
  }
}

export function onTouchPicthEnd(this: any) {
  this.lastTouchDistance = undefined;
}

// 左下のジョイスティックの設定 - 移動
export function setupJoystick() {
  const joystickContainer = document.getElementById(
    "joystickContainer"
  ) as HTMLElement;
  if (joystickContainer) {
    const joystick = nipplejs.create({
      zone: joystickContainer,
      mode: "static",
      position: { left: "50%", bottom: "50%" },
      color: "#fff",
    });

    joystick.on("start", () => {
      resetCameraPitch();
    });

    joystick.on("move", (evt, data) => {
      moveForward = data.direction.y === "up";
      moveBackward = data.direction.y === "down";
      moveLeft = data.direction.x === "left";
      moveRight = data.direction.x === "right";
    });

    joystick.on("end", () => {
      moveForward = moveBackward = moveLeft = moveRight = false;
    });
  }
}

// キーボードの押下処理 - 移動
export function onKeyDown(event: KeyboardEvent) {
  resetCameraPitch();
  switch (event.key) {
    case "w":
    case "ArrowUp":
      moveForward = true;
      break;
    case "s":
    case "ArrowDown":
      moveBackward = true;
      break;
    case "a":
    case "ArrowLeft":
      moveLeft = true;
      break;
    case "d":
    case "ArrowRight":
      moveRight = true;
      break;
  }
}

// キーボードの離上処理
export function onKeyUp(event: KeyboardEvent) {
  switch (event.key) {
    case "w":
    case "ArrowUp":
      moveForward = false;
      break;
    case "s":
    case "ArrowDown":
      moveBackward = false;
      break;
    case "a":
    case "ArrowLeft":
      moveLeft = false;
      break;
    case "d":
    case "ArrowRight":
      moveRight = false;
      break;
  }
}

// カメラを指定位置に移動する関数
export function moveCameraTo(
  targetPosition: THREE.Vector3,
  targetRotation: THREE.Euler,
  onComplete: () => void
) {
  const duration = 300;
  const startPosition = camera.position.clone();
  const startRotation = camera.rotation.clone();
  const startTime = performance.now();

  const offset = new THREE.Vector3(0, 0, 20).applyEuler(targetRotation);
  const adjustedPosition = targetPosition.clone().add(offset);

  function animateCamera(time: number) {
    const elapsedTime = time - startTime;
    const t = Math.min(elapsedTime / duration, 1);
    camera.position.lerpVectors(startPosition, adjustedPosition, t);
    camera.rotation.set(
      THREE.MathUtils.lerp(startRotation.x, targetRotation.x, t),
      THREE.MathUtils.lerp(startRotation.y, targetRotation.y, t),
      THREE.MathUtils.lerp(startRotation.z, targetRotation.z, t)
    );
    if (t < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      onComplete();
    }
  }

  requestAnimationFrame(animateCamera);
}

// カメラを球体の内部に移動する関数
export function moveCameraInsideSphere(
  spherePosition: THREE.Vector3,
  sphereRotation: THREE.Euler,
  onComplete: () => void
) {
  const duration = 300;
  const startPosition = camera.position.clone();
  const startRotation = camera.rotation.clone();
  const startTime = performance.now();

  const adjustedPosition = spherePosition.clone();

  function animateCamera(time: number) {
    const elapsedTime = time - startTime;
    const t = Math.min(elapsedTime / duration, 1);
    camera.position.lerpVectors(startPosition, adjustedPosition, t);
    camera.rotation.set(
      THREE.MathUtils.lerp(startRotation.x, sphereRotation.x, t),
      THREE.MathUtils.lerp(startRotation.y, sphereRotation.y, t),
      THREE.MathUtils.lerp(startRotation.z, sphereRotation.z, t)
    );
    if (t < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      onComplete();
    }
  }

  requestAnimationFrame(animateCamera);
}

export { moveForward, moveBackward, moveLeft, moveRight };
