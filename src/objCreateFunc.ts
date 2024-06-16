import {
  Group,
  Mesh,
  Vector3,
  Euler,
  VideoTexture,
  ShaderMaterial,
  BackSide,
  DoubleSide,
  PlaneGeometry,
  CanvasTexture,
  MeshBasicMaterial,
  LinearFilter,
  RGBAFormat,
  SphereGeometry,
  TextureLoader,
  BoxGeometry,
  MeshStandardMaterial,
} from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { vertexShader_2d, fragmentShader_2d } from "../shaders/shader_2d.ts";
import { vertexShader_3d, fragmentShader_3d } from "../shaders/shader_3d.ts";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { Font } from "three/addons/loaders/FontLoader.js";
import { scene } from "./setup.ts";
import { isMobile } from "./utils.ts";

let drone1: Group;
let drone2: Group;

const tabObjects: Mesh[] = [];
const videoSpheres: Mesh[] = [];
const videoInitialPositions: Vector3[] = [];
const imageSpheres: Mesh[] = [];
const imageInitialPositions: Vector3[] = [];

// ビデオパネルの作成関数
export function createPlaneWithVideo(
  width: number,
  height: number,
  fontColor: string,
  strokeColor: string,
  position: Vector3,
  rotation: Euler,
  contentId: string,
  videoSrc: string,
  title: string
) {
  const video = document.createElement("video");
  video.src = videoSrc;
  video.loop = true;
  video.muted = true;
  video.crossOrigin = "anonymous";
  // video.setAttribute("playsinline", "true");
  video.setAttribute("playsinline", "");
  video.setAttribute("preload", "auto");
  video.play();

  const videoTexture = new VideoTexture(video);
  const material = new ShaderMaterial({
    uniforms: { videoTexture: { value: videoTexture } },
    vertexShader: vertexShader_2d,
    fragmentShader: fragmentShader_2d,
    side: DoubleSide,
  });

  const geometry = new PlaneGeometry(width, height);
  const plane = new Mesh(geometry, material);
  plane.position.copy(position);
  plane.rotation.copy(rotation);
  plane.userData.contentId = contentId;
  scene.add(plane);
  tabObjects.push(plane);

  const titleCanvas = document.createElement("canvas");
  const context = titleCanvas.getContext("2d")!;
  titleCanvas.width = 512;
  titleCanvas.height = 512;
  context.font = "64px sans-serif";
  context.fillStyle = fontColor;
  context.lineWidth = 3;
  context.strokeStyle = strokeColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(title, 256, 256);

  const titleTexture = new CanvasTexture(titleCanvas);
  const titleMaterial = new MeshBasicMaterial({
    map: titleTexture,
    transparent: true,
  });
  const titleGeometry = new PlaneGeometry(width, height);
  const titlePlane = new Mesh(titleGeometry, titleMaterial);
  titlePlane.position.copy(position);
  titlePlane.rotation.copy(rotation);
  titlePlane.position.z +=
    rotation.y > Math.PI / 2 && rotation.y < (3 * Math.PI) / 2 ? -0.1 : 0.1;
  scene.add(titlePlane);

  // スマホの場合、動画の解像度を下げる
  video.addEventListener("loadeddata", () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    if (isMobile()) {
      canvas.width = video.videoWidth / 4; // 解像度を半分に下げる（スマホ向け）
      canvas.height = video.videoHeight / 4;
    } else {
      canvas.width = video.videoWidth; // PCでは元の解像度
      canvas.height = video.videoHeight;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    videoTexture.needsUpdate = true;
    // console.log("loadeddata");
  });

  return plane;
}

// ビデオ球体の作成関数
export function createVideoSphere(
  radius: number,
  position: Vector3,
  rotation: Euler,
  videoSrc: string,
  title: string,
  font: Font
) {
  const video = document.createElement("video");
  video.src = videoSrc;
  video.loop = true;
  video.muted = true;
  video.crossOrigin = "anonymous";
  video.setAttribute("playsinline", "");
  video.setAttribute("preload", "true");
  video.setAttribute("autoplay", "true");
  video.pause();
  // video.load();

  const videoTexture = new VideoTexture(video);
  videoTexture.minFilter = LinearFilter;
  videoTexture.magFilter = LinearFilter;
  videoTexture.format = RGBAFormat;

  // 動画の最初のフレームがロードされたら再生を開始する
  video.addEventListener("loadeddata", () => {
    videoTexture.needsUpdate = true;
    // console.log("loadeddata");
  });

  const sphereGeometry = new SphereGeometry(radius, 32, 32);
  const sphereMaterial = new ShaderMaterial({
    uniforms: { videoTexture: { value: videoTexture } },
    vertexShader: vertexShader_3d,
    fragmentShader: fragmentShader_3d,
    side: BackSide,
  });

  const videoSphere = new Mesh(sphereGeometry, sphereMaterial);
  videoSphere.position.copy(position);
  videoSphere.rotation.copy(rotation);
  videoSphere.userData = { video, isPlaying: false, radius };
  scene.add(videoSphere);
  videoSpheres.push(videoSphere);
  videoInitialPositions.push(position.clone());

  const textMeshes = createTextMeshes(title, font, 1, 0x000000);
  textMeshes.forEach((textMesh, index) => {
    textMesh.position.set(position.x, position.y, position.z);
    textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
    scene.add(textMesh);
    videoSphere.userData[`textMesh${index}`] = textMesh;
  });

  const metalBox = createMetalBox(position, rotation, radius, 5, 2, 5);
  videoSphere.userData.metalBox = metalBox;

  return videoSphere;
}

// 画像球体の作成関数
export function createImageSphere(
  radius: number,
  position: Vector3,
  rotation: Euler,
  imageSrc: string,
  title: string,
  font: Font
) {
  const textureLoader = new TextureLoader();
  textureLoader.setCrossOrigin("anonymous");
  textureLoader.load(imageSrc, (imageTexture) => {
    imageTexture.minFilter = LinearFilter;
    imageTexture.magFilter = LinearFilter;
    imageTexture.format = RGBAFormat;

    const sphereMaterial = new ShaderMaterial({
      uniforms: { videoTexture: { value: imageTexture } },
      vertexShader: vertexShader_3d,
      fragmentShader: fragmentShader_3d,
      side: BackSide,
    });

    const sphereGeometry = new SphereGeometry(radius, 32, 32);
    const imageSphere = new Mesh(sphereGeometry, sphereMaterial);
    imageSphere.position.copy(position);
    imageSphere.rotation.copy(rotation);
    imageSphere.userData = { isImage: true, radius };
    scene.add(imageSphere);
    imageSpheres.push(imageSphere);
    imageInitialPositions.push(position.clone());

    const textMeshes = createTextMeshes(title, font, 1, 0x000000);
    textMeshes.forEach((textMesh, index) => {
      textMesh.position.set(position.x, position.y, position.z);
      textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
      scene.add(textMesh);
      imageSphere.userData[`textMesh${index}`] = textMesh;
    });

    const metalBox = createMetalBox(position, rotation, radius, 5, 2, 5);
    imageSphere.userData.metalBox = metalBox;
  });
}

// テキストメッシュの作成関数
export function createTextMeshes(
  text: string,
  font: Font,
  size: number,
  color: number
): Mesh[] {
  const letters = text.split("");
  const textMeshes = letters.map((letter) => {
    const geometry = new TextGeometry(letter, {
      font: font,
      size: size,
      depth: 0.5,
    });
    const material = new MeshBasicMaterial({
      color: color,
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    return mesh;
  });

  const offsetX = size * 0.6;
  textMeshes.forEach((mesh, index) => {
    mesh.position.x = index * offsetX;
  });

  return textMeshes;
}

// メタルボックスの作成関数
export function createMetalBox(
  spherePosition: Vector3,
  sphereRotation: Euler,
  radius: number,
  width: number,
  height: number,
  depth: number
) {
  const boxGeometry = new BoxGeometry(width, height, depth);
  const textureLoader = new TextureLoader();
  const metalMaterial = new MeshStandardMaterial({
    side: DoubleSide,
    roughness: 0.2,
    metalness: 0.7,
    // metalnessMap: textureLoader.load("../textures/stone.jpg"),
    metalnessMap: textureLoader.load(
      new URL("../textures/stone.jpg", import.meta.url).toString()
    ),
    emissive: 0x333333,
    emissiveIntensity: 0.4,
  });
  const metalBox = new Mesh(boxGeometry, metalMaterial);
  metalBox.position.copy(spherePosition);
  metalBox.position.set(
    spherePosition.x,
    spherePosition.y - (radius + height / 2 + 0.1),
    spherePosition.z
  );
  metalBox.rotation.copy(sphereRotation);
  scene.add(metalBox);
  return metalBox;
}

// ドローンの読み込み
export function loadDrones() {
  const fbxLoader = new FBXLoader();
  // fbxLoader.setResourcePath("../models/Drone_Costum/Teturizer/");
  // fbxLoader.load("../models/Drone_Costum/Material/drone_costum.fbx", (obj) => {
  fbxLoader.setResourcePath(
    new URL("/models/Drone_Costum/Teturizer/", import.meta.url).toString()
  );
  fbxLoader.load(
    new URL(
      "/models/Drone_Costum/Material/drone_costum.fbx",
      import.meta.url
    ).toString(),
    (obj) => {
      obj.scale.set(0.015, 0.015, 0.015);
      drone1 = obj;
      drone2 = obj.clone();
      scene.add(drone1);
      scene.add(drone2);
    }
  );
}

export {
  tabObjects,
  videoSpheres,
  imageSpheres,
  videoInitialPositions,
  imageInitialPositions,
  drone1,
  drone2,
};
