// 空の設定: 起動時に一度だけ「夕焼け」を適用する。
// （以前は昼→夕→夜を循環させていたが、夕焼け固定に変更）
import * as THREE from "three";
import { scene, sky, water, renderer } from "./setup.ts";
import { isMobile } from "./utils.ts";

// 夕焼けの太陽パラメータ（低い高度＋暖色の散乱）
const SUNSET = {
  elevation: 4, // 地平線近く
  azimuth: 90, // 東から昇る位置
  turbidity: 5, // 大気の濁り（高いほど赤みが強くなる）
  rayleigh: 3, // 赤みを強める
  mieCoefficient: 0.008, // ミー散乱の強さ（小さいほど赤みが強くなる）
  mieDirectionalG: 0.45, // ミー散乱の方向性（高いほど太陽の周りが明るくなる）
};

const sunPosition = new THREE.Vector3();

export function initTimeOfDay() {
  const phi = THREE.MathUtils.degToRad(90 - SUNSET.elevation);
  const theta = THREE.MathUtils.degToRad(SUNSET.azimuth);
  sunPosition.setFromSphericalCoords(1, phi, theta);

  const u = sky.material.uniforms;
  u["sunPosition"].value.copy(sunPosition);
  u["turbidity"].value = SUNSET.turbidity;
  u["rayleigh"].value = SUNSET.rayleigh;
  u["mieCoefficient"].value = SUNSET.mieCoefficient;
  u["mieDirectionalG"].value = SUNSET.mieDirectionalG;

  water.material.uniforms["sunDirection"].value.copy(sunPosition).normalize();

  // 夕焼けに合わせて環境マップ（金属の反射）を一度だけ再生成する（PCのみ）
  if (!isMobile()) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    scene.remove(sky);
    envScene.add(sky);
    const rt = pmrem.fromScene(envScene);
    envScene.remove(sky);
    scene.add(sky);
    scene.environment = rt.texture;
    pmrem.dispose();
  }
}
