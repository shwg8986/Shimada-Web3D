import { Mesh, Vector3 } from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
export declare function updateDrones(elapsedTime: number): void;
export declare function updateCameraControls(controls: PointerLockControls): void;
export declare function updateVideoSpheres(spheres: Mesh[], initialPositions: Vector3[], elapsedTime: number, amplitude: number, frequency: number): void;
export declare function updateImageSpheres(spheres: Mesh[], initialPositions: Vector3[], elapsedTime: number, amplitude: number, frequency: number): void;
