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
  Box3,
} from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { vertexShader_2d, fragmentShader_2d } from "../shaders/shader_2d.ts";
import { vertexShader_3d, fragmentShader_3d } from "../shaders/shader_3d.ts";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { Font } from "three/addons/loaders/FontLoader.js";
import { scene } from "./setup.ts";
import { isMobile } from "./utils.ts";
import { GeometricArtGenerator, ArtType } from "./geometricArt.ts";

let drone1: Group;
let drone2: Group;

const tabObjects: Mesh[] = [];
const videoSpheres: Mesh[] = [];
const videoInitialPositions: Vector3[] = [];
const imageSpheres: Mesh[] = [];
const imageInitialPositions: Vector3[] = [];
const artGenerators: GeometricArtGenerator[] = [];

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
  title: string,
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

// 幾何学アートパネルの作成関数
export function createPlaneWithGeometricArt(
  width: number,
  height: number,
  fontColor: string,
  strokeColor: string,
  position: Vector3,
  rotation: Euler,
  contentId: string,
  artType: ArtType,
  title: string,
) {
  // モバイルかどうかで解像度とパフォーマンスモードを切り替え
  const mobile = isMobile();
  const canvasWidth = mobile ? 512 : 1024;
  const canvasHeight = mobile ? 256 : 512;
  const perfMode = mobile ? "low" : "high";

  // 幾何学アート生成
  const artGenerator = new GeometricArtGenerator(
    canvasWidth,
    canvasHeight,
    perfMode,
  );
  artGenerator.draw(artType);
  artGenerators.push(artGenerator);

  // キャンバスからテクスチャを作成
  const artTexture = new CanvasTexture(artGenerator.getCanvas());
  artTexture.needsUpdate = true;

  const material = new MeshBasicMaterial({
    map: artTexture,
    side: DoubleSide,
  });

  const geometry = new PlaneGeometry(width, height);
  const plane = new Mesh(geometry, material);
  plane.position.copy(position);
  plane.rotation.copy(rotation);
  plane.userData.contentId = contentId;
  plane.userData.artGenerator = artGenerator;
  plane.userData.artTexture = artTexture;
  plane.userData.artType = artType;
  scene.add(plane);
  tabObjects.push(plane);

  // タイトルテキストを改善（視認性向上）
  const titleCanvas = document.createElement("canvas");
  const context = titleCanvas.getContext("2d")!;
  titleCanvas.width = 1024;
  titleCanvas.height = 256;

  // テキストに影と縁取りを追加して視認性を向上
  context.font = "bold 80px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";

  // 影を追加
  context.shadowColor = "rgba(0, 0, 0, 0.8)";
  context.shadowBlur = 10;
  context.shadowOffsetX = 3;
  context.shadowOffsetY = 3;

  // 縁取りを太く
  context.strokeStyle = strokeColor;
  context.lineWidth = 8;
  context.strokeText(title, 512, 128);

  // 本体のテキスト
  context.shadowColor = "transparent";
  context.fillStyle = fontColor;
  context.fillText(title, 512, 128);

  const titleTexture = new CanvasTexture(titleCanvas);
  const titleMaterial = new MeshBasicMaterial({
    map: titleTexture,
    transparent: true,
  });
  const titleGeometry = new PlaneGeometry(width, height * 0.5);
  const titlePlane = new Mesh(titleGeometry, titleMaterial);
  titlePlane.position.copy(position);
  titlePlane.rotation.copy(rotation);
  titlePlane.position.y += height * 0.25;
  titlePlane.position.z +=
    rotation.y > Math.PI / 2 && rotation.y < (3 * Math.PI) / 2 ? -0.1 : 0.1;
  scene.add(titlePlane);

  return plane;
}

// ビデオ球体の作成関数
// export function createVideoSphere(
//   radius: number,
//   position: Vector3,
//   rotation: Euler,
//   videoSrc: string,
//   title: string,
//   font: Font
// ) {
//   const video = document.createElement("video");
//   video.src = videoSrc;
//   video.loop = true;
//   video.muted = true;
//   video.crossOrigin = "anonymous";
//   video.setAttribute("playsinline", "");
//   video.setAttribute("preload", "true");
//   video.setAttribute("autoplay", "true");
//   video.pause();
//   // video.load();

//   const videoTexture = new VideoTexture(video);
//   videoTexture.minFilter = LinearFilter;
//   videoTexture.magFilter = LinearFilter;
//   videoTexture.format = RGBAFormat;

//   // 動画の最初のフレームがロードされたら再生を開始する
//   video.addEventListener("loadeddata", () => {
//     videoTexture.needsUpdate = true;
//     // console.log("loadeddata");
//   });

//   const sphereGeometry = new SphereGeometry(radius, 32, 32);
//   const sphereMaterial = new ShaderMaterial({
//     uniforms: { videoTexture: { value: videoTexture } },
//     vertexShader: vertexShader_3d,
//     fragmentShader: fragmentShader_3d,
//     side: BackSide,
//   });

//   const videoSphere = new Mesh(sphereGeometry, sphereMaterial);
//   videoSphere.position.copy(position);
//   videoSphere.rotation.copy(rotation);
//   videoSphere.userData = { video, isPlaying: false, radius };
//   scene.add(videoSphere);
//   videoSpheres.push(videoSphere);
//   videoInitialPositions.push(position.clone());

//   const textMeshes = createTextMeshes(title, font, 1, 0x000000);
//   textMeshes.forEach((textMesh, index) => {
//     textMesh.position.set(position.x, position.y, position.z);
//     textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
//     scene.add(textMesh);
//     videoSphere.userData[`textMesh${index}`] = textMesh;
//   });

//   const metalBox = createMetalBox(position, rotation, radius, 5, 2, 5);
//   videoSphere.userData.metalBox = metalBox;

//   return videoSphere;
// }

export function createVideoSphere(
  radius: number,
  position: Vector3,
  rotation: Euler,
  videoSrc: string,
  posterSrc: string,
  title: string,
  font: Font,
) {
  const video = document.createElement("video");
  video.src = videoSrc;
  video.loop = true;
  video.muted = true;
  video.crossOrigin = "anonymous";
  video.setAttribute("playsinline", "");
  // 遅延ロード: 起動時には動画をダウンロードしない。
  // preload="none" かつ autoplay を付けないことで、球体に近づいて
  // play() が呼ばれた時に初めて動画の読み込みが始まる。
  // （以前は preload="auto" 相当 + autoplay で、PCでは起動と同時に
  //   3本の動画 計約150MB を一括ダウンロードしていたのがボトルネックだった）
  video.setAttribute("preload", "none");

  const videoTexture = new VideoTexture(video);
  videoTexture.minFilter = LinearFilter;
  videoTexture.magFilter = LinearFilter;
  videoTexture.format = RGBAFormat;

  // ポスター（静止画）テクスチャ:
  // 動画は遅延ロードのため近づくまで読み込まれないが、その間も球体が
  // 白く（テクスチャ無しに）ならないよう、軽量な静止画を最初から貼っておく。
  const posterTexture = new TextureLoader().load(posterSrc);
  posterTexture.minFilter = LinearFilter;
  posterTexture.magFilter = LinearFilter;
  posterTexture.format = RGBAFormat;

  const sphereGeometry = new SphereGeometry(radius, 32, 32);
  const sphereMaterial = new ShaderMaterial({
    // 最初はポスター静止画を表示。動画データ読み込み後に videoTexture へ差し替える。
    uniforms: { videoTexture: { value: posterTexture } },
    vertexShader: vertexShader_3d,
    fragmentShader: fragmentShader_3d,
    side: BackSide,
  });

  // 動画データが読み込めたら、テクスチャをポスターから動画へ切り替える
  video.addEventListener("loadeddata", () => {
    videoTexture.needsUpdate = true;
    sphereMaterial.uniforms.videoTexture.value = videoTexture;
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
  font: Font,
) {
  // ローディング用のテクスチャ
  const loadingCanvas = document.createElement("canvas");
  const loadingContext = loadingCanvas.getContext("2d")!;
  const scale = 2; // 解像度の倍率
  loadingCanvas.width = 512 * scale;
  loadingCanvas.height = 512 * scale;
  loadingContext.fillStyle = "black";
  const gradient = loadingContext.createLinearGradient(
    0,
    0,
    loadingCanvas.width,
    loadingCanvas.height,
  );
  gradient.addColorStop(0, "black"); // 左上は黒
  gradient.addColorStop(1, "gray"); // 右下は灰色

  // 背景を描画
  loadingContext.fillStyle = gradient;
  loadingContext.fillRect(0, 0, loadingCanvas.width, loadingCanvas.height);

  // テキスト
  const textWidth = 400 * scale; // テキストエリアの幅
  const textHeight = 50 * scale; // テキストエリアの高
  const textX = (loadingCanvas.width - textWidth) / 2; // 中央に配置
  const textY = (loadingCanvas.height - textHeight) / 2; // 中央に配置
  loadingContext.clearRect(textX, textY, textWidth, textHeight); // テキストエリアをクリア

  loadingContext.fillStyle = "black";
  loadingContext.font = "48px bold sans-serif";
  loadingContext.textAlign = "center";
  loadingContext.textBaseline = "middle";
  loadingContext.fillText("Now Loading...", 256 * scale, 256 * scale);

  const loadingTexture = new CanvasTexture(loadingCanvas);
  const loadingMaterial = new MeshBasicMaterial({
    map: loadingTexture,
    transparent: true,
    opacity: 0.7,
  });
  const loadingGeometry = new SphereGeometry(radius, 32, 32);
  const loadingSphere = new Mesh(loadingGeometry, loadingMaterial);
  loadingSphere.position.copy(position);
  loadingSphere.rotation.set(rotation.x, rotation.y - 1.5, rotation.z);
  scene.add(loadingSphere);

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

    imageTexture.needsUpdate = true; // 画像テクスチャが完全にロードされたことをThree.jsに通知
    scene.remove(loadingSphere); // ローディングスフィアを削除

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
  color: number,
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
  depth: number,
) {
  const boxGeometry = new BoxGeometry(width, height, depth);
  const textureLoader = new TextureLoader();
  const metalMaterial = new MeshStandardMaterial({
    side: DoubleSide,
    roughness: 0.2,
    metalness: 0.7,
    // metalnessMap: textureLoader.load("../textures/stone.jpg"),
    metalnessMap: textureLoader.load(
      new URL("../textures/stone.jpg", import.meta.url).toString(),
    ),
    emissive: 0x333333,
    emissiveIntensity: 0.4,
  });
  const metalBox = new Mesh(boxGeometry, metalMaterial);
  metalBox.position.copy(spherePosition);
  metalBox.position.set(
    spherePosition.x,
    spherePosition.y - (radius + height / 2 + 0.1),
    spherePosition.z,
  );
  metalBox.rotation.copy(sphereRotation);
  scene.add(metalBox);
  return metalBox;
}

// ドローンの読み込み
// モデル(drone_costum.fbx)は本体もプロペラも1メッシュに統合されており、
// プロペラだけを分離して回せない。そこで疑似プロペラを4基追加して回す。
// 配置・サイズはモデルのバウンディングボックス（スケール前のローカル空間）
// に対する比率で指定するので、モデルのスケールが変わっても自動で追従する。
const PROP_SPAN_X = 0.34; // 中心からのX方向オフセット（bboxサイズ比）
const PROP_SPAN_Z = 0.34; // 中心からのZ方向オフセット（bboxサイズ比）
const PROP_Y_OFFSET = -0.4; // 上端からの高さ（bboxサイズ比）
const PROP_BLADE_LEN = 0.3; // 羽根の全長（bboxのX幅に対する比）
const PROP_SPIN_SPEED = 25; // 回転速度（ラジアン/秒）

// 1基のプロペラ（十字に組んだ2枚羽根）を生成
function createPropeller(bladeLength: number): Group {
  const propeller = new Group();
  const width = bladeLength * 0.18;
  const thickness = bladeLength * 0.05;
  const material = new MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.4,
    roughness: 0.6,
    transparent: true,
    opacity: 0.85,
    side: DoubleSide,
  });
  for (let i = 0; i < 2; i++) {
    const blade = new Mesh(
      new BoxGeometry(bladeLength, thickness, width),
      material,
    );
    blade.rotation.y = (i * Math.PI) / 2; // 90°ずらして十字に
    propeller.add(blade);
  }
  return propeller;
}

// ドローンに疑似プロペラを4基取り付ける
function attachPropellers(drone: Group) {
  // スケールを一旦戻してジオメトリ空間(=子の座標系)のbboxを測る
  const prevScale = drone.scale.clone();
  drone.scale.set(1, 1, 1);
  drone.updateMatrixWorld(true);
  const box = new Box3().setFromObject(drone);
  drone.scale.copy(prevScale);

  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const bladeLength = size.x * PROP_BLADE_LEN;
  const x = size.x * PROP_SPAN_X;
  const z = size.z * PROP_SPAN_Z;
  const y = box.max.y + size.y * PROP_Y_OFFSET;

  const corners = [
    new Vector3(center.x - x, y, center.z - z),
    new Vector3(center.x + x, y, center.z - z),
    new Vector3(center.x - x, y, center.z + z),
    new Vector3(center.x + x, y, center.z + z),
  ];

  const propellers: Group[] = [];
  corners.forEach((pos, i) => {
    const propeller = createPropeller(bladeLength);
    propeller.position.copy(pos);
    // 隣り合うプロペラは逆回転（クアッドコプター風）
    propeller.userData.spinDir = i % 2 === 0 ? 1 : -1;
    drone.add(propeller);
    propellers.push(propeller);
  });
  drone.userData.propellers = propellers;
}

export function loadDrones() {
  const fbxLoader = new FBXLoader();
  // fbxLoader.setResourcePath("../models/Drone_Costum/Teturizer/");
  // fbxLoader.load("../models/Drone_Costum/Material/drone_costum.fbx", (obj) => {

  // fbxLoader.setResourcePath(
  //   new URL("/models/Drone_Costum/Teturizer/", import.meta.url).toString()
  // );

  fbxLoader.setResourcePath(
    new URL(
      "/models/Drone_Costum/Teturizer/Blury.jpg",
      import.meta.url,
    ).toString(),
  );
  fbxLoader.setResourcePath(
    new URL(
      "/models/Drone_Costum/Teturizer/Aperture-icon.png",
      import.meta.url,
    ).toString(),
  );
  fbxLoader.load(
    new URL(
      "/models/Drone_Costum/Material/drone_costum.fbx",
      import.meta.url,
    ).toString(),
    (obj) => {
      obj.scale.set(0.015, 0.015, 0.015);
      drone1 = obj;
      drone2 = obj.clone();
      // それぞれに疑似プロペラを取り付ける
      attachPropellers(drone1);
      attachPropellers(drone2);
      scene.add(drone1);
      scene.add(drone2);
    },
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
  artGenerators,
  PROP_SPIN_SPEED,
};
