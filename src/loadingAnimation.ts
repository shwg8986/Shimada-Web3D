import * as THREE from "three";
import { camera } from "./setup.ts";

let isFading = false;

export function isFadingActive() {
  return isFading;
}

function initLoadingAnimation() {
  const canvas = document.getElementById("loading-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB"); // 空色（上部）
    gradient.addColorStop(0.5, "#4BB0CE"); // 浅い海色（中間）
    gradient.addColorStop(0.8, "#007BA7"); // 深い海色（下部）
    gradient.addColorStop(1, "#00587A"); // 海底色（最下部）

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 砂の表現
    const sandGradient = ctx.createLinearGradient(
      0,
      canvas.height * 0.9,
      0,
      canvas.height
    );
    sandGradient.addColorStop(0, "rgba(238, 214, 175, 0)"); // 透明な砂色（上部）
    sandGradient.addColorStop(1, "rgba(238, 214, 175, 0.8)"); // 不透明な砂色（下部）

    ctx.fillStyle = sandGradient;
    ctx.fillRect(0, canvas.height * 0.9, canvas.width, canvas.height * 0.1);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    requestAnimationFrame(animate);
  }

  animate();
  return startTypingAnimation();
}

function startTypingAnimation(): Promise<void> {
  return new Promise((resolve) => {
    const text = "環境を読み込み中...";
    const typingElement = document.getElementById("typing-text");
    let i = 0;

    function typeWriter() {
      if (i < text.length) {
        typingElement.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
      } else {
        resolve();
      }
    }

    typeWriter();
  });
}

export function showLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.display = "flex";
  }
  initLoadingAnimation();
}
export function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  const fadeOverlay = document.getElementById("fade-overlay");
  const app = document.getElementById("app");

  if (loadingScreen && fadeOverlay && app) {
    loadingScreen.style.opacity = "0";
    isFading = true;
    setTimeout(() => {
      loadingScreen.style.display = "none";
      fadeOverlay.style.opacity = "0";
      app.style.opacity = "1";
    }, 500);

    setTimeout(() => {
      isFading = false;
      fadeOverlay.style.display = "none";
    }, 4000);
  }
}

// イントロ（カメラ落下・波揺れ）はカメラ位置を毎フレーム上書きするため、
// ユーザーが操作を始めたら即座に中断してクリック操作を優先させる
let introCancelled = false;
let introRunning = false;
let settleOnCancel = true;

// イントロの着地状態（2D⇔3D遷移が基準値として参照する）
export const INTRO_LANDING = { y: 10, fov: 75 };

export function isIntroRunning() {
  return introRunning;
}

// settle=false は「後始末を呼び出し側が引き継ぐ」中断（2D⇔3D遷移用）
export function cancelIntroAnimation(settle = true) {
  if (introRunning) {
    settleOnCancel = settle;
  }
  introCancelled = true;
}

export function startIntroAnimation() {
  // すでにユーザーが操作を始めていたらイントロは行わない
  // （ここでフラグをリセットすると、ロード中のクリックによるカメラ移動を
  //   イントロが上書きしてしまう）
  if (introCancelled) return;

  // 2D→3D遷移と同じ演出:
  // 上空・広角の状態から海面へ落下しながら、視界がすっと絞り込まれて着地する
  const targetPosition = new THREE.Vector3(0, INTRO_LANDING.y, 0);
  const startY = 32;
  const baseFov = INTRO_LANDING.fov;
  const startFov = baseFov + 32;
  const duration = 1000;

  introRunning = true;
  // フェードで画面が見え始めるのを待ってから落下を開始する
  // （すぐ落とすと真っ黒な画面の裏で演出が終わってしまう）
  const revealDelay = 500;

  camera.position.set(0, startY, 0);
  camera.fov = startFov;
  camera.updateProjectionMatrix();

  let start: number | null = null;
  const animateCameraIntro = (now: number) => {
    if (start === null) start = now;
    if (introCancelled) {
      introRunning = false;
      // 2D⇔3D遷移からの中断時は後始末を遷移側が引き継ぐ
      if (!settleOnCancel) return;
      // 中断時は視界と高度を素早く通常へ戻す。
      // クリックによるカメラ移動(moveCameraTo等)はこの後に登録されるため、
      // 同一フレーム内ではそちらの書き込みが勝ち、操作が優先される。
      const fovAtCancel = camera.fov;
      const yAtCancel = camera.position.y;
      const cancelStart = performance.now();
      const settle = (n: number) => {
        const tt = Math.min((n - cancelStart) / 200, 1);
        camera.fov = fovAtCancel + (baseFov - fovAtCancel) * tt;
        camera.position.y = yAtCancel + (targetPosition.y - yAtCancel) * tt;
        camera.updateProjectionMatrix();
        if (tt < 1) requestAnimationFrame(settle);
      };
      requestAnimationFrame(settle);
      return;
    }
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    camera.position.y = startY + (targetPosition.y - startY) * eased;
    camera.fov = startFov + (baseFov - startFov) * eased;
    camera.updateProjectionMatrix();
    if (t < 1) {
      requestAnimationFrame(animateCameraIntro);
    } else {
      camera.position.copy(targetPosition);
      startWaveAnimation();
    }
  };

  window.setTimeout(() => {
    if (introCancelled) {
      introRunning = false;
      // 2D⇔3D遷移からの中断時は後始末を遷移側が引き継ぐ
      if (!settleOnCancel) return;
      // 落下開始前に操作された場合は視界を通常へ戻す
      camera.fov = baseFov;
      camera.updateProjectionMatrix();
      // クリックによるカメラ移動が始まっていない（=初期上空のまま）ときだけ着地させる。
      // すでに球体等へ移動済みの場合に位置を触ると、カメラが引き戻されてしまう。
      if (Math.abs(camera.position.y - startY) < 0.001) {
        camera.position.copy(targetPosition);
      }
      return;
    }
    requestAnimationFrame(animateCameraIntro);
  }, revealDelay);
}

function startWaveAnimation() {
  const baseY = 10; // 基準のY座標
  const amplitude = 1; // 波の振幅
  const frequency = 0.01; // 波の頻度
  let time = 0;

  const animateWave = () => {
    if (introCancelled) {
      introRunning = false;
      return;
    }
    time += 1;
    const newY = baseY + Math.sin(time * frequency) * amplitude;
    camera.position.setY(newY);

    if (time < 60) {
      // 約1秒間（60FPS * 1秒）
      requestAnimationFrame(animateWave);
    } else {
      introRunning = false;
    }
  };

  animateWave();
}
