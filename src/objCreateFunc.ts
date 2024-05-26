import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { vertexShader_2d, fragmentShader_2d } from "../shaders/shader_2d.ts";
import { vertexShader_3d, fragmentShader_3d } from "../shaders/shader_3d.ts";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { Font } from "three/addons/loaders/FontLoader.js";
import { scene } from "./setup.ts";

let drone1: THREE.Group;
let drone2: THREE.Group;

const tabObjects: THREE.Mesh[] = [];
const videoSpheres: THREE.Mesh[] = [];
const videoInitialPositions: THREE.Vector3[] = [];
const imageSpheres: THREE.Mesh[] = [];
const imageInitialPositions: THREE.Vector3[] = [];

// ビデオパネルの作成関数
export function createPlaneWithVideo(
  width: number,
  height: number,
  fontColor: string,
  strokeColor: string,
  position: THREE.Vector3,
  rotation: THREE.Euler,
  contentId: string,
  videoSrc: string,
  title: string
) {
  const video = document.createElement("video");
  video.src = videoSrc;
  video.loop = true;
  video.muted = true;
  video.crossOrigin = "anonymous";
  video.play();

  const videoTexture = new THREE.VideoTexture(video);
  const material = new THREE.ShaderMaterial({
    uniforms: { videoTexture: { value: videoTexture } },
    vertexShader: vertexShader_2d,
    fragmentShader: fragmentShader_2d,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.PlaneGeometry(width, height);
  const plane = new THREE.Mesh(geometry, material);
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

  const titleTexture = new THREE.CanvasTexture(titleCanvas);
  const titleMaterial = new THREE.MeshBasicMaterial({
    map: titleTexture,
    transparent: true,
  });
  const titleGeometry = new THREE.PlaneGeometry(width, height);
  const titlePlane = new THREE.Mesh(titleGeometry, titleMaterial);
  titlePlane.position.copy(position);
  titlePlane.rotation.copy(rotation);
  titlePlane.position.z +=
    rotation.y > Math.PI / 2 && rotation.y < (3 * Math.PI) / 2 ? -0.1 : 0.1;
  scene.add(titlePlane);

  return plane;
}

// ビデオ球体の作成関数
export function createVideoSphere(
  radius: number,
  position: THREE.Vector3,
  rotation: THREE.Euler,
  videoSrc: string,
  title: string,
  font: Font
) {
  const video = document.createElement("video");
  video.src = videoSrc;
  video.loop = true;
  video.muted = true;
  video.crossOrigin = "anonymous";
  video.pause();

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBAFormat;

  const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
  const sphereMaterial = new THREE.ShaderMaterial({
    uniforms: { videoTexture: { value: videoTexture } },
    vertexShader: vertexShader_3d,
    fragmentShader: fragmentShader_3d,
    side: THREE.BackSide,
  });

  const videoSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
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
  position: THREE.Vector3,
  rotation: THREE.Euler,
  imageSrc: string,
  title: string,
  font: Font
) {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin("anonymous");
  textureLoader.load(imageSrc, (imageTexture) => {
    imageTexture.minFilter = THREE.LinearFilter;
    imageTexture.magFilter = THREE.LinearFilter;
    imageTexture.format = THREE.RGBAFormat;

    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms: { videoTexture: { value: imageTexture } },
      vertexShader: vertexShader_3d,
      fragmentShader: fragmentShader_3d,
      side: THREE.BackSide,
    });

    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const imageSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
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
): THREE.Mesh[] {
  const letters = text.split("");
  const textMeshes = letters.map((letter) => {
    const geometry = new TextGeometry(letter, {
      font: font,
      size: size,
      depth: 0.5,
    });
    const material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
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
  spherePosition: THREE.Vector3,
  sphereRotation: THREE.Euler,
  radius: number,
  width: number,
  height: number,
  depth: number
) {
  const boxGeometry = new THREE.BoxGeometry(width, height, depth);
  const textureLoader = new THREE.TextureLoader();
  const metalMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    roughness: 0.2,
    metalness: 0.7,
    metalnessMap: textureLoader.load("../textures/stone.jpg"),
    emissive: 0x333333,
    emissiveIntensity: 0.4,
  });
  const metalBox = new THREE.Mesh(boxGeometry, metalMaterial);
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
  fbxLoader.setResourcePath("./models/Drone_Costum/Teturizer/");
  fbxLoader.load("./models/Drone_Costum/Material/drone_costum.fbx", (obj) => {
    obj.scale.set(0.015, 0.015, 0.015);
    drone1 = obj;
    drone2 = obj.clone();
    scene.add(drone1);
    scene.add(drone2);
  });
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
