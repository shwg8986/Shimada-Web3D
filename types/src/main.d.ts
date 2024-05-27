import "./style.css";
import { Font } from "three/addons/loaders/FontLoader.js";
declare let font: Font;
declare let isCameraMoving: boolean;
export declare function getIsCameraMoving(): boolean;
export declare function setIsCameraMoving(value: boolean): void;
export { font, isCameraMoving };
