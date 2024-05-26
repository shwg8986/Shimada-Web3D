import * as THREE from "three";
import {
  createPlaneWithVideo,
  createImageSphere,
  createVideoSphere,
} from "./objCreateFunc";
import { font } from "./main.ts";

const pentagon_radius = 50;

// ビデオパネルの作成
export function createPlanesWithVideos() {
  createPlaneWithVideo(
    20,
    10,
    "#fff",
    "#000",
    new THREE.Vector3(
      -pentagon_radius * Math.sin(36 * (Math.PI / 180)),
      7,
      -pentagon_radius * Math.sin(54 * (Math.PI / 180))
    ),
    new THREE.Euler(0, THREE.MathUtils.degToRad(36), 0),
    "content0",
    "../shortVideo/unity.mp4",
    "Profile"
  );

  createPlaneWithVideo(
    20,
    10,
    "#fff",
    "#000",
    new THREE.Vector3(
      -pentagon_radius * Math.sin(72 * (Math.PI / 180)),
      7,
      pentagon_radius * Math.sin(18 * (Math.PI / 180))
    ),
    new THREE.Euler(0, THREE.MathUtils.degToRad(108), 0),
    "content1",
    "../shortVideo/glasgow.mp4",
    "Experience"
  );

  createPlaneWithVideo(
    20,
    10,
    "#fff",
    "#000",
    new THREE.Vector3(0, 7, pentagon_radius),
    new THREE.Euler(0, THREE.MathUtils.degToRad(180), 0),
    "content2",
    "../shortVideo/brain.mp4",
    "Education"
  );

  createPlaneWithVideo(
    20,
    10,
    "#fff",
    "#000",
    new THREE.Vector3(
      pentagon_radius * Math.sin(72 * (Math.PI / 180)),
      7,
      pentagon_radius * Math.sin(18 * (Math.PI / 180))
    ),
    new THREE.Euler(0, THREE.MathUtils.degToRad(252), 0),
    "content3",
    "../shortVideo/labMeetingVR.mp4",
    "Publication"
  );

  createPlaneWithVideo(
    20,
    10,
    "#fff",
    "#000",
    new THREE.Vector3(
      pentagon_radius * Math.sin(36 * (Math.PI / 180)),
      7,
      -pentagon_radius * Math.sin(54 * (Math.PI / 180))
    ),
    new THREE.Euler(0, THREE.MathUtils.degToRad(324), 0),
    "content4",
    "../shortVideo/teamLab.mp4",
    "Link"
  );
}

// ビデオ球体の作成
export function createVideoSpheres() {
  createVideoSphere(
    5,
    new THREE.Vector3(0, 8, -pentagon_radius),
    new THREE.Euler(0, 0, 0),
    "../shortVideo/tourEiffel3d_st.MP4",
    "Paris Video",
    font
  );
  createVideoSphere(
    5,
    new THREE.Vector3(
      pentagon_radius * Math.sin(72 * (Math.PI / 180)),
      8,
      -pentagon_radius * Math.sin(18 * (Math.PI / 180))
    ),
    new THREE.Euler(0, THREE.MathUtils.degToRad(288), 0),
    "../shortVideo/cruiseThai3d.MP4",
    "Bangkok Video",
    font
  );
  createVideoSphere(
    5,
    new THREE.Vector3(
      -pentagon_radius * Math.sin(72 * (Math.PI / 180)),
      8,
      -pentagon_radius * Math.sin(18 * (Math.PI / 180))
    ),
    new THREE.Euler(0, THREE.MathUtils.degToRad(72), 0),
    "../shortVideo/warsawOld23d_st.MP4",
    "Warsaw Video",
    font
  );
}

// 画像球体の作成
export function createImageSpheres() {
  createImageSphere(
    5,
    new THREE.Vector3(
      -pentagon_radius * Math.sin(36 * (Math.PI / 180)),
      8,
      pentagon_radius * Math.sin(54 * (Math.PI / 180))
    ),
    new THREE.Euler(0, THREE.MathUtils.degToRad(144), 0),
    "../360Images/vitre.JPG",
    "Vitre Photo",
    font
  );
  createImageSphere(
    5,
    new THREE.Vector3(
      pentagon_radius * Math.sin(36 * (Math.PI / 180)),
      8,
      pentagon_radius * Math.sin(54 * (Math.PI / 180))
    ),
    new THREE.Euler(0, THREE.MathUtils.degToRad(216), 0),
    "../360Images/singapore.JPG",
    "Singapore Photo",
    font
  );
}
