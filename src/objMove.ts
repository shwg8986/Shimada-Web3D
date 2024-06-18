import { Mesh, Vector3, SphereGeometry } from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import {
  moveForward,
  moveBackward,
  moveLeft,
  moveRight,
} from "./cameraMoveControls.ts";
import { camera, compassNeedle } from "./setup.ts";
import { drone1, drone2 } from "./objCreateFunc.ts";

// ドローンの位置を更新する関数
export function updateDrones(elapsedTime: number) {
  if (drone1 && drone2) {
    drone1.position.x =
      100 * Math.sin(elapsedTime * 0.5) + 5 * Math.cos(elapsedTime * 1.2);
    drone1.position.y = 60 + 5 * Math.sin(elapsedTime * 0.7);
    drone1.position.z =
      -200 * Math.cos(elapsedTime * 0.3) + -5 * Math.sin(elapsedTime * 1.5);

    drone2.position.x =
      -50 * Math.sin(elapsedTime * 0.5) - 10 * Math.cos(elapsedTime * 1.2);
    drone2.position.y = 90 + 10 * Math.sin(elapsedTime * 0.7);
    drone2.position.z =
      100 * Math.cos(elapsedTime * 0.3) + 10 * Math.sin(elapsedTime * 1.5);
  }
}

// コンパスの向きを更新する関数
export function updateCompass() {
  // カメラの向きを取得
  const direction = new Vector3();
  camera.getWorldDirection(direction);
  // 方位角を計算
  const angle = Math.atan2(direction.x, direction.z);
  const degree = angle * (180 / Math.PI) + 180;
  // 方位磁針の針を回転
  compassNeedle.style.transform = `rotate(${-degree}deg)`;
}

// カメラの移動を更新する関数
export function updateCameraControls(controls: PointerLockControls) {
  const moveSpeed = 0.2;
  if (moveForward) controls.moveForward(moveSpeed);
  if (moveBackward) controls.moveForward(-moveSpeed);
  if (moveLeft) controls.moveRight(-moveSpeed);
  if (moveRight) controls.moveRight(moveSpeed);
}

let previousIsInsideSphereStates_Video: boolean[] = [];
let previousIsInsideSphereStates_Image: boolean[] = [];

function updateSpheres(
  spheres: Mesh[],
  initialPositions: Vector3[],
  elapsedTime: number,
  amplitude: number,
  frequency: number,
  previousStates: boolean[],
  handleInsideStateChange: (sphere: Mesh, isInside: boolean) => void
) {
  const backButton = document.getElementById("back-button") as HTMLElement;
  const tabs = document.querySelector(".tabs") as HTMLElement;

  if (!backButton || !tabs) {
    console.error("Required elements are not found in the DOM.");
    return;
  }

  const yOffset = amplitude * Math.sin(frequency * elapsedTime);

  spheres.forEach((sphere, index) => {
    const initialPosition = initialPositions[index];

    // カメラが球体の中にいるかどうかをチェック
    const distanceToCamera = camera.position.distanceTo(sphere.position);
    const isInsideSphere = distanceToCamera < sphere.userData.radius;

    // 初回チェック用にpreviousStatesを初期化
    if (previousStates.length < spheres.length) {
      previousStates.push(!isInsideSphere);
    }

    // 状態が変わったときだけ処理を実行
    if (isInsideSphere !== previousStates[index]) {
      handleInsideStateChange(sphere, isInsideSphere);
      previousStates[index] = isInsideSphere;
    }

    if (!isInsideSphere) {
      sphere.position.y = initialPosition.y + yOffset;
      if (sphere.userData.metalBox) {
        const radius = (sphere.geometry as SphereGeometry).parameters.radius;
        sphere.userData.metalBox.position.set(
          initialPosition.x,
          initialPosition.y - radius - 2 + yOffset,
          initialPosition.z
        );
      }

      Object.keys(sphere.userData).forEach((key) => {
        if (key.startsWith("textMesh")) {
          const textMesh = sphere.userData[key];
          const orbitRadius = 6; // 公転の半径
          const orbitSpeed = 1.5; // 公転の速度
          const letterIndex = parseInt(key.replace("textMesh", ""), 10);
          const angle = orbitSpeed * elapsedTime - letterIndex * 0.2; // 文字ごとに逆方向にずらす
          textMesh.position.x =
            sphere.position.x + orbitRadius * Math.cos(angle);
          textMesh.position.z =
            sphere.position.z + orbitRadius * Math.sin(angle);
          textMesh.position.y =
            sphere.position.y + orbitRadius * Math.sin(angle);
        }
      });
    } else {
      sphere.position.y = initialPosition.y;
      if (sphere.userData.metalBox) {
        sphere.userData.metalBox.position.y =
          initialPosition.y - sphere.userData.radius - 1;
      }
    }
  });
}

function handleVideoSphereInsideStateChange(sphere: Mesh, isInside: boolean) {
  const backButton = document.getElementById("back-button") as HTMLElement;
  const tabs = document.querySelector(".tabs") as HTMLElement;

  if (isInside) {
    backButton.style.display = "block"; // ボタンを表示
    backButton.style.visibility = "visible"; // ボタンを表示
    tabs.style.display = "none"; // タブを非表示
    if (!sphere.userData.isPlaying) {
      sphere.userData.video.play(); // 動画を再生
      sphere.userData.isPlaying = true;
    }
  } else {
    backButton.style.display = "none"; // ボタンを非表示
    backButton.style.visibility = "hidden"; // ボタンを非表示
    tabs.style.display = "block"; // タブを表示
    if (sphere.userData.isPlaying) {
      sphere.userData.video.pause(); // 動画を停止
      sphere.userData.isPlaying = false;
    }
  }
}

function handleImageSphereInsideStateChange(isInside: boolean) {
  const backButton = document.getElementById("back-button") as HTMLElement;
  const tabs = document.querySelector(".tabs") as HTMLElement;

  if (isInside) {
    backButton.style.display = "block"; // ボタンを表示
    backButton.style.visibility = "visible"; // ボタンを表示
    tabs.style.display = "none"; // タブを非表示
  } else {
    backButton.style.display = "none"; // ボタンを非表示
    backButton.style.visibility = "hidden"; // ボタンを非表示
    tabs.style.display = "block"; // タブを表示
  }
}

export function updateVideoSpheres(
  spheres: Mesh[],
  initialPositions: Vector3[],
  elapsedTime: number,
  amplitude: number,
  frequency: number
) {
  updateSpheres(
    spheres,
    initialPositions,
    elapsedTime,
    amplitude,
    frequency,
    previousIsInsideSphereStates_Video,
    handleVideoSphereInsideStateChange
  );
}

export function updateImageSpheres(
  spheres: Mesh[],
  initialPositions: Vector3[],
  elapsedTime: number,
  amplitude: number,
  frequency: number
) {
  updateSpheres(
    spheres,
    initialPositions,
    elapsedTime,
    amplitude,
    frequency,
    previousIsInsideSphereStates_Image,
    // handleImageSphereInsideStateChange
    (_sphere, isInside) => handleImageSphereInsideStateChange(isInside)
  );
}
