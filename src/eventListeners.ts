import * as THREE from "three";
import { camera, renderer, setUpCompass } from "./setup.ts";
import { handleInteraction, isMobile } from "./utils.ts";
import {
  onMouseWheel,
  onTouchPinch,
  onTouchPicthEnd,
  onKeyDown,
  onKeyUp,
  setupJoystick,
  moveCameraTo,
} from "./cameraMoveControls.ts";
import { videoSpheres, imageSpheres, tabObjects } from "./objCreateFunc.ts";

const sizes = { width: window.innerWidth, height: window.innerHeight };
const initialCameraPosition = new THREE.Vector3(0, 10, 0);
let isDragging = false;
let clickTimeout: number | null = null;
let previousMousePosition = { x: 0, y: 0 };

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// マウス移動時のイベントハンドラ
function onMouseMove(event: MouseEvent) {
  if (isDragging) {
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;
    previousMousePosition = { x: event.clientX, y: event.clientY };

    camera.rotation.order = "YXZ";
    camera.rotation.y -= deltaX * 0.005;
    camera.rotation.x -= deltaY * 0.005;
  }
}

// マウスダウン時のイベントハンドラ
function onMouseDown(event: MouseEvent) {
  isDragging = false;
  previousMousePosition = { x: event.clientX, y: event.clientY };
  clickTimeout = window.setTimeout(() => {
    isDragging = true;
  }, 150);
}

// マウスアップ時のイベントハンドラ
function onMouseUp() {
  if (clickTimeout !== null) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
  }

  if (!isDragging) {
    handleInteraction(previousMousePosition.x, previousMousePosition.y);
  }
  isDragging = false;
}

// タッチ移動時のイベントハンドラ
function onTouchMove(event: TouchEvent) {
  if (isDragging && event.touches.length === 1) {
    const deltaX = event.touches[0].clientX - previousMousePosition.x;
    const deltaY = event.touches[0].clientY - previousMousePosition.y;
    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };

    camera.rotation.order = "YXZ";
    camera.rotation.y -= deltaX * 0.005;
    camera.rotation.x -= deltaY * 0.005;
  }
}

// タッチスタート時のイベントハンドラ
function onTouchStart(event: TouchEvent) {
  if (event.touches.length === 1) {
    isDragging = false;
    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };

    clickTimeout = window.setTimeout(() => {
      isDragging = true;
    }, 100);
  }
}

// タッチエンド時のイベントハンドラ
function onTouchEnd() {
  if (clickTimeout !== null) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
  }

  if (!isDragging) {
    handleInteraction(previousMousePosition.x, previousMousePosition.y);
  }
  isDragging = false;
}

// ウィンドウリサイズ時の処理
function onWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
  // console.log(`Resized Renderer Size: ${sizes.width} x ${sizes.height}`);
}

// マウスホバー時の処理
function onMouseHover(event: MouseEvent) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([
    ...videoSpheres,
    ...imageSpheres,
    ...tabObjects,
  ]);
  document.body.style.cursor = intersects.length > 0 ? "pointer" : "default";
}

// イベントリスナーの設定
export function setupEventListeners() {
  const canvas = document.getElementById(
    "canvasContainer"
  ) as HTMLCanvasElement;

  // console.log("Event listeners set up");

  document.addEventListener("DOMContentLoaded", () => {
    const headerElement = document.querySelector(".header");
    if (isMobile()) {
      headerElement.textContent = "しまだのWeb3D - スマホ版";
      headerElement.classList.add("mobile-header");
    } else {
      headerElement.textContent = "しまだのWeb3D - PC版";
    }
  });

  // コンパスの初期化
  window.addEventListener("load", setUpCompass);

  // マウスイベント
  canvas.addEventListener("mousedown", onMouseDown, { passive: true });
  canvas.addEventListener("mousemove", onMouseMove, { passive: true });
  canvas.addEventListener("mouseup", onMouseUp, { passive: true });
  canvas.addEventListener("mouseleave", onMouseUp, { passive: true });

  // タッチイベント
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: true });
  canvas.addEventListener("touchend", onTouchEnd, { passive: true });
  canvas.addEventListener("touchcancel", onTouchEnd, { passive: true });

  // キーボードイベント
  document.addEventListener("keydown", onKeyDown, { passive: true });
  document.addEventListener("keyup", onKeyUp, { passive: true });

  // マウスホイールイベント
  canvas.addEventListener("wheel", onMouseWheel, { passive: true });

  // ピンチ操作のタッチイベント
  canvas.addEventListener("touchmove", onTouchPinch, { passive: true });
  canvas.addEventListener("touchend", onTouchPicthEnd, { passive: true });

  // カメラのfovを変更する関数
  function changeCameraFov(newFov: number) {
    camera.fov = newFov;
    camera.updateProjectionMatrix();
  }

  // ヘッダーまたはバックボタンをクリックしたときにカメラをリセット
  const header = document.querySelector(".header");
  if (header) {
    header.addEventListener("click", () => {
      // camera.position.set(
      //   initialCameraPosition.x,
      //   initialCameraPosition.y,
      //   initialCameraPosition.z
      // );
      // camera.rotation.set(0, 0, 0);
      moveCameraTo(initialCameraPosition, new THREE.Euler(0, 0, 0), () => {});
      changeCameraFov(75); // fovを75に変更
    });
  }

  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      // camera.position.set(
      //   initialCameraPosition.x,
      //   initialCameraPosition.y,
      //   initialCameraPosition.z
      // );
      // camera.rotation.set(0, 0, 0);
      moveCameraTo(initialCameraPosition, new THREE.Euler(0, 0, 0), () => {});
      changeCameraFov(75); // fovを75に変更
    });
  }

  // リサイズイベント
  window.addEventListener("resize", onWindowResize);
  // マウスムーブイベント
  window.addEventListener("mousemove", onMouseHover);

  setupJoystick();
}

// アコーディオンの初期化
export function initializeAccordions() {
  document.addEventListener("DOMContentLoaded", () => {
    const accordions = document.querySelectorAll(".accordion");

    accordions.forEach((accordion) => {
      const header = accordion.querySelector(".accordion-header");
      const content = accordion.querySelector(".accordion-content");
      const toggle = accordion.querySelector(".accordion-toggle");

      if (header && content && toggle) {
        header.addEventListener("click", () => {
          const isActive = content.classList.contains("active");

          if (isActive) {
            content.classList.remove("active");
            toggle.innerHTML = "&#9650;"; // 文字を変更
          } else {
            content.classList.add("active");
            toggle.innerHTML = "&#9660;"; // 文字を変更
          }
        });
      }
    });
  });
}
