import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: PointerLockControls | undefined;
let water: Water;
let sky: Sky;
let sun: THREE.Vector3;

const sizes = { width: window.innerWidth, height: window.innerHeight };
const initialCameraPosition = new THREE.Vector3(0, 10, 0);

// シーンの設定
export function setupScene() {
  scene = new THREE.Scene();
}

// カメラの設定
export function setupCamera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(
    initialCameraPosition.x,
    initialCameraPosition.y,
    initialCameraPosition.z
  );
}

// レンダラーの設定
export function setupRenderer() {
  const canvas = document.getElementById(
    "canvasContainer"
  ) as HTMLCanvasElement;
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
}

// カメラ制御の設定
export function setupControls() {
  const canvas = document.getElementById(
    "canvasContainer"
  ) as HTMLCanvasElement;
  if (canvas) {
    controls = new PointerLockControls(camera, document.body);
    scene.add(controls.getObject());
  } else {
    console.error("Canvas element not found");
  }
}

// 水面の設定
export function setupWater() {
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      new URL("../textures/waternormals.jpg", import.meta.url).toString(),
      (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
}

// 空の設定
export function setupSkybox() {
  sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = 1;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.01;
  skyUniforms["mieDirectionalG"].value = 0.8;

  setupSun(); // 太陽の呼び出し
}

// 太陽の呼び出し関数
export function setupSun() {
  const parameters = { elevation: 2, azimuth: 180 };
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const sceneEnv = new THREE.Scene();
  let renderTarget: THREE.WebGLRenderTarget<THREE.Texture> | undefined;

  const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
  const theta = THREE.MathUtils.degToRad(parameters.azimuth);

  sun = new THREE.Vector3();
  sun.setFromSphericalCoords(1, phi, theta);

  sky.material.uniforms["sunPosition"].value.copy(sun);
  water.material.uniforms["sunDirection"].value.copy(sun).normalize();

  if (renderTarget !== undefined) renderTarget.dispose();

  sceneEnv.add(sky);
  renderTarget = pmremGenerator.fromScene(sceneEnv);
  scene.add(sky);

  scene.environment = renderTarget.texture;
}

// ライトの設定
export function setupLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(1, 0.55, 5);
  scene.add(directionalLight);
}

export { scene, camera, renderer, controls, water, sky, sun };
