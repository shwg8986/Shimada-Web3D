/*
学び

<ビルド時におけるパスの設定について>
相対パス: ビルド時に問題になることが多いので、できるだけ避ける。
絶対パス: ビルド時に問題が発生しにくい。

相対パスを用いる場合は、import.meta.urlで現在のモジュールのURLを取得し、new URLを使用することでファイルパスの解決に役立つ
 */

import "./style.css";
import * as THREE from "three";
import { FontLoader, Font } from "three/addons/loaders/FontLoader.js";

import {
  setupScene,
  setupCamera,
  setupRenderer,
  setupControls,
  setupWater,
  setupSkybox,
  setupLights,
  scene,
  camera,
  renderer,
  controls,
  water,
} from "./setup.ts";

import {
  videoSpheres,
  imageSpheres,
  videoInitialPositions,
  imageInitialPositions,
  loadDrones,
} from "./objCreateFunc.ts";

import {
  createPlanesWithVideos,
  createVideoSpheres_PC,
  createImageSpheres_PC_smartPhone,
  createImageSpheres_smartPhone,
} from "./objCreate.ts";

import {
  updateDrones,
  updateCameraControls,
  updateVideoSpheres,
  updateImageSpheres,
} from "./objMove.ts";

import { handleTabClick, initOverlay } from "./overlay.ts";

import { setupEventListeners, initializeAccordions } from "./eventListeners.ts";

import { checkCameraInsideSphere, isMobile } from "./utils.ts";

// グローバル変数の定義
let font: Font;
let isCameraMoving = false;

export function getIsCameraMoving() {
  return isCameraMoving;
}

export function setIsCameraMoving(value: boolean) {
  isCameraMoving = value;
}

function init() {
  try {
    setupScene(); // シーンの設定
    setupCamera(); // カメラの設定
    setupRenderer(); // レンダラーの設定
    setupControls(); // カメラ制御の設定
    setupWater(); // 水面の設定
    setupSkybox(); // 空の設定
    initializeAccordions(); // アコーディオンの初期化
    setupEventListeners(); // イベントリスナーの設定
    loadFont(); // フォントの読み込み
    animate(); // アニメーションの開始
    initOverlay(handleTabClick); // オーバーレイの初期化
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

// フォントの読み込み
// function loadFont() {
//   const fontLoader = new FontLoader();
//   fontLoader.load("../fonts/helvetiker_regular.typeface.json", (loadedFont) => {
//     font = loadedFont;
//     setupInitialObjects();
//   });
// }

function loadFont() {
  const fontLoader = new FontLoader();
  fontLoader.load(
    new URL(
      "../fonts/helvetiker_regular.typeface.json",
      import.meta.url
    ).toString(),
    (loadedFont) => {
      font = loadedFont;
      setupInitialObjects();
    }
  );
}

// 環境オブジェクトの初期設定
function setupInitialObjects() {
  createPlanesWithVideos(); // ビデオパネルの作成
  createImageSpheres_PC_smartPhone(); // 画像球体の作成

  if (isMobile()) {
    createImageSpheres_smartPhone(); // 画像球体の作成
    console.log("Device is smartPhone");
  } else {
    createVideoSpheres_PC(); // ビデオ球体の作成
    console.log("Device is PC");
  }
  loadDrones(); // ドローンの読み込み
  setupLights(); // ライトの設定
}

// アニメーションの処理

function animate() {
  const clock = new THREE.Clock();

  function render() {
    const elapsedTime = clock.getElapsedTime();
    const amplitude = 1.5;
    const frequency = 1.0;

    // ドローンの動き
    updateDrones(elapsedTime);

    // videoSpheres と imageSpheres
    updateVideoSpheres(
      videoSpheres,
      videoInitialPositions,
      elapsedTime,
      amplitude,
      frequency
    );

    updateImageSpheres(
      imageSpheres,
      imageInitialPositions,
      elapsedTime,
      amplitude,
      frequency
    );

    // カメラの移動処理
    if (controls) {
      updateCameraControls(controls);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);

    water.material.uniforms["time"].value += 1.0 / 60.0;

    // カメラが球体内にいるかどうかのチェック
    checkCameraInsideSphere();
  }
  render();
}

// 初期化関数の呼び出し
init();

export { font, isCameraMoving };
