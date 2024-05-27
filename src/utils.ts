import * as THREE from "three";
import { camera } from "./setup.ts";
// import { isCameraMoving, isOverlay } from "./main";
import { tabObjects, videoSpheres, imageSpheres } from "./objCreateFunc.ts";
import { moveCameraInsideSphere, moveCameraTo } from "./cameraMoveControls.ts";
import { showContent } from "./overlay.ts";

let insideSpherePosition: THREE.Vector3 | null = null;
let isInsideSphere = false;
let isOverlayVisible = false;
let isCameraMoving = false;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// カメラが球体の中にいるかどうかをチェックする関数
export function checkCameraInsideSphere() {
  if (isInsideSphere && insideSpherePosition) {
    const distance = camera.position.distanceTo(insideSpherePosition);
    if (distance > 5) {
      isInsideSphere = false;
      insideSpherePosition = null;
    }
  }
}

// ユーザーのインタラクションを処理する関数;
export function handleInteraction(clientX: number, clientY: number) {
  if (isCameraMoving || isInsideSphere || isOverlayVisible) return;

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([
    ...videoSpheres,
    ...imageSpheres,
    ...tabObjects,
  ]);
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    if (
      intersectedObject.userData.video ||
      intersectedObject.userData.isImage
    ) {
      isCameraMoving = true;
      insideSpherePosition = intersectedObject.position.clone();
      moveCameraInsideSphere(
        intersectedObject.position,
        intersectedObject.rotation,
        () => {
          isCameraMoving = false;
        }
      );
    } else {
      const overlay = document.getElementById("overlay");
      if (overlay) {
        const contentId = intersectedObject.userData.contentId;
        if (contentId) {
          isCameraMoving = true;
          const targetRotation = intersectedObject.rotation.clone();
          moveCameraTo(intersectedObject.position, targetRotation, () => {
            showContent(contentId);
            isCameraMoving = false;
          });
        }
      }
    }
  }
}
