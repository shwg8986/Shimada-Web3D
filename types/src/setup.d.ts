import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";
declare let scene: THREE.Scene;
declare let camera: THREE.PerspectiveCamera;
declare let renderer: THREE.WebGLRenderer;
declare let controls: PointerLockControls | undefined;
declare let water: Water;
declare let sky: Sky;
declare let sun: THREE.Vector3;
export declare function setupScene(): void;
export declare function setupCamera(): void;
export declare function setupRenderer(): void;
export declare function setupControls(): void;
export declare function setupWater(): void;
export declare function setupSkybox(): void;
export declare function setupSun(): void;
export declare function setupLights(): void;
export { scene, camera, renderer, controls, water, sky, sun };