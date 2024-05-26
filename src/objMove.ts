import * as THREE from "three";
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

// ビデオ球体の位置を更新する関数
export function updateVideoSpheres(
  spheres: THREE.Mesh[],
  initialPositions: THREE.Vector3[],
  elapsedTime: number,
  amplitude: number,
  frequency: number
) {
  spheres.forEach((sphere, index) => {
    const initialPosition = initialPositions[index];
    const yOffset = amplitude * Math.sin(frequency * elapsedTime);

    // カメラが球体の中にいるかどうかをチェック
    const distanceToCamera = camera.position.distanceTo(sphere.position);
    isInsideSphere = distanceToCamera < sphere.userData.radius;

    if (isInsideSphere) {
      if (!sphere.userData.isPlaying) {
        sphere.userData.video.play(); // 動画を再生
        sphere.userData.isPlaying = true;
      }
    } else {
      if (sphere.userData.isPlaying) {
        sphere.userData.video.pause(); // 動画を停止
        sphere.userData.isPlaying = false;
      }
    }

    if (!isInsideSphere) {
      sphere.position.y = initialPosition.y + yOffset;
      if (sphere.userData.metalBox) {
        const radius = (sphere.geometry as THREE.SphereGeometry).parameters
          .radius;
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

// 画像球体の位置を更新する関数
export function updateImageSpheres(
  spheres: THREE.Mesh[],
  initialPositions: THREE.Vector3[],
  elapsedTime: number,
  amplitude: number,
  frequency: number
) {
  spheres.forEach((sphere, index) => {
    const initialPosition = initialPositions[index];
    const yOffset = amplitude * Math.sin(frequency * elapsedTime);

    // カメラが球体の中にいるかどうかをチェック
    const distanceToCamera = camera.position.distanceTo(sphere.position);
    isInsideSphere = distanceToCamera < sphere.userData.radius;

    if (!isInsideSphere) {
      sphere.position.y = initialPosition.y + yOffset;
      if (sphere.userData.metalBox) {
        const radius = (sphere.geometry as THREE.SphereGeometry).parameters
          .radius;
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
