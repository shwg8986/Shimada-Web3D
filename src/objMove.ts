import { Mesh, Vector3, SphereGeometry } from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import {
  moveForward,
  moveBackward,
  moveLeft,
  moveRight,
} from "./cameraMoveControls.ts";
import { camera } from "./setup.ts";
import { drone1, drone2 } from "./objCreateFunc.ts";

let isInsideSphere = false;

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

// カメラの移動を更新する関数
export function updateCameraControls(controls: PointerLockControls) {
  const moveSpeed = 0.2;
  if (moveForward) controls.moveForward(moveSpeed);
  if (moveBackward) controls.moveForward(-moveSpeed);
  if (moveLeft) controls.moveRight(-moveSpeed);
  if (moveRight) controls.moveRight(moveSpeed);
}

let previousIsInsideSphereStates_Video: boolean[] = [];
// ビデオ球体の位置を更新する関数
export function updateVideoSpheres(
  spheres: Mesh[],
  initialPositions: Vector3[],
  elapsedTime: number,
  amplitude: number,
  frequency: number
) {
  spheres.forEach((sphere, index) => {
    const initialPosition = initialPositions[index];
    const yOffset = amplitude * Math.sin(frequency * elapsedTime);
    const backButton = document.getElementById("back-button") as HTMLElement;
    const tabs = document.querySelector(".tabs") as HTMLElement;

    // カメラが球体の中にいるかどうかをチェック
    const distanceToCamera = camera.position.distanceTo(sphere.position);
    isInsideSphere = distanceToCamera < sphere.userData.radius;

    //  初回チェック用にpreviousIsInsideSphereStates_Videoを初期化
    if (previousIsInsideSphereStates_Video.length < spheres.length) {
      previousIsInsideSphereStates_Video.push(!isInsideSphere);
    }

    // 状態が変わったときだけ処理を実行
    if (isInsideSphere !== previousIsInsideSphereStates_Video[index]) {
      if (isInsideSphere) {
        backButton.style.display = "block"; // ボタンを表示
        tabs.style.display = "none"; // タブを非表示
        if (!sphere.userData.isPlaying) {
          sphere.userData.video.play(); // 動画を再生
          sphere.userData.isPlaying = true;
        }
      } else {
        backButton.style.display = "none"; // ボタンを非表示
        tabs.style.display = "block"; // タブを表示
        if (sphere.userData.isPlaying) {
          sphere.userData.video.pause(); // 動画を停止
          sphere.userData.isPlaying = false;
        }
      }
      // 状態を更新
      previousIsInsideSphereStates_Video[index] = isInsideSphere;
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

let previousIsInsideSphereStates_Image: boolean[] = [];
// 画像球体の位置を更新する関数
export function updateImageSpheres(
  spheres: Mesh[],
  initialPositions: Vector3[],
  elapsedTime: number,
  amplitude: number,
  frequency: number
) {
  spheres.forEach((sphere, index) => {
    const initialPosition = initialPositions[index];
    const yOffset = amplitude * Math.sin(frequency * elapsedTime);
    const backButton = document.getElementById("back-button") as HTMLElement;
    const tabs = document.querySelector(".tabs") as HTMLElement;

    // カメラが球体の中にいるかどうかをチェック
    const distanceToCamera = camera.position.distanceTo(sphere.position);
    isInsideSphere = distanceToCamera < sphere.userData.radius;

    // 初回チェック用にpreviousIsInsideSphereStatesを初期化
    if (previousIsInsideSphereStates_Image.length < spheres.length) {
      previousIsInsideSphereStates_Image.push(!isInsideSphere);
    }

    // 状態が変わったときだけ処理を実行
    if (isInsideSphere !== previousIsInsideSphereStates_Image[index]) {
      if (isInsideSphere) {
        backButton.style.display = "block"; // ボタンを表示
        tabs.style.display = "none"; // タブを非表示
      } else {
        backButton.style.display = "none"; // ボタンを非表示
        tabs.style.display = "block"; // タブを表示
      }
      // 状態を更新
      previousIsInsideSphereStates_Image[index] = isInsideSphere;
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
          const orbitRadius = 6;
          const orbitSpeed = 1.5;
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
