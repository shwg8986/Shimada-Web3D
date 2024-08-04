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

export function startIntroAnimation() {
  const originalPosition = new THREE.Vector3(0, 20, 0); // initialCameraPosition と同じ
  const targetPosition = new THREE.Vector3(0, 10, 0); // 目標位置

  let progress = 0;
  const animateCameraIntro = () => {
    progress += 0.005;
    if (progress < 1) {
      camera.position.lerpVectors(originalPosition, targetPosition, progress);
      requestAnimationFrame(animateCameraIntro);
    } else {
      startWaveAnimation();
    }
  };

  animateCameraIntro();
}

function startWaveAnimation() {
  const baseY = 10; // 基準のY座標
  const amplitude = 1; // 波の振幅
  const frequency = 0.01; // 波の頻度
  let time = 0;

  const animateWave = () => {
    time += 1;
    const newY = baseY + Math.sin(time * frequency) * amplitude;
    camera.position.setY(newY);

    if (time < 60) {
      // 約1秒間（60FPS * 1秒）
      requestAnimationFrame(animateWave);
    }
  };

  animateWave();
}
