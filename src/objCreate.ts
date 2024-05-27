import { Vector3, Euler, MathUtils } from "three";
import {
  createPlaneWithVideo,
  createImageSphere,
  createVideoSphere,
} from "./objCreateFunc.ts";
import { font } from "./main.ts";

const pentagon_radius = 50;

// ビデオパネルの作成
export function createPlanesWithVideos() {
  createPlaneWithVideo(
    20,
    10,
    "#fff",
    "#000",
    new Vector3(
      -pentagon_radius * Math.sin(36 * (Math.PI / 180)),
      7,
      -pentagon_radius * Math.sin(54 * (Math.PI / 180))
    ),
    new Euler(0, MathUtils.degToRad(36), 0),
    "content0",
    // "../shortVideo/unity.mp4",
    new URL("../shortVideo/unity.mp4", import.meta.url).toString(),
    "Profile"
  );

  createPlaneWithVideo(
    20,
    10,
    "#fff",
    "#000",
    new Vector3(
      -pentagon_radius * Math.sin(72 * (Math.PI / 180)),
      7,
      pentagon_radius * Math.sin(18 * (Math.PI / 180))
    ),
    new Euler(0, MathUtils.degToRad(108), 0),
    "content1",
    // "../shortVideo/glasgow.mp4",
    new URL("../shortVideo/glasgow.mp4", import.meta.url).toString(),
    "Experience"
  );

  createPlaneWithVideo(
    20,
    10,
    "#fff",
    "#000",
    new Vector3(0, 7, pentagon_radius),
    new Euler(0, MathUtils.degToRad(180), 0),
    "content2",
    // "../shortVideo/brain.mp4",
    new URL("../shortVideo/brain.mp4", import.meta.url).toString(),
    "Education"
  );

  createPlaneWithVideo(
    20,
    10,
    "#fff",
    "#000",
    new Vector3(
      pentagon_radius * Math.sin(72 * (Math.PI / 180)),
      7,
      pentagon_radius * Math.sin(18 * (Math.PI / 180))
    ),
    new Euler(0, MathUtils.degToRad(252), 0),
    "content3",
    // "../shortVideo/labMeetingVR.mp4",
    new URL("../shortVideo/labMeetingVR.mp4", import.meta.url).toString(),
    "Publication"
  );

  createPlaneWithVideo(
    20,
    10,
    "#fff",
    "#000",
    new Vector3(
      pentagon_radius * Math.sin(36 * (Math.PI / 180)),
      7,
      -pentagon_radius * Math.sin(54 * (Math.PI / 180))
    ),
    new Euler(0, MathUtils.degToRad(324), 0),
    "content4",
    // "../shortVideo/teamLab.mp4",
    new URL("../shortVideo/teamLab.mp4", import.meta.url).toString(),
    "Link"
  );
}

// ビデオ球体の作成
export function createVideoSpheres() {
  createVideoSphere(
    5,
    new Vector3(0, 8, -pentagon_radius),
    new Euler(0, 0, 0),
    // "../shortVideo/tourEiffel3d_st.MP4",
    new URL("../shortVideo/tourEiffel3d_st.MP4", import.meta.url).toString(),
    "Paris Video",
    font
  );
  createVideoSphere(
    5,
    new Vector3(
      pentagon_radius * Math.sin(72 * (Math.PI / 180)),
      8,
      -pentagon_radius * Math.sin(18 * (Math.PI / 180))
    ),
    new Euler(0, MathUtils.degToRad(288), 0),
    // "../shortVideo/cruiseThai3d.MP4",
    new URL("../shortVideo/cruiseThai3d.MP4", import.meta.url).toString(),
    "Bangkok Video",
    font
  );
  createVideoSphere(
    5,
    new Vector3(
      -pentagon_radius * Math.sin(72 * (Math.PI / 180)),
      8,
      -pentagon_radius * Math.sin(18 * (Math.PI / 180))
    ),
    new Euler(0, MathUtils.degToRad(72), 0),
    // "../shortVideo/warsawOld23d_st.MP4",
    new URL("../shortVideo/warsawOld23d_st.MP4", import.meta.url).toString(),
    "Warsaw Video",
    font
  );
}

// 画像球体の作成
export function createImageSpheres() {
  createImageSphere(
    5,
    new Vector3(
      -pentagon_radius * Math.sin(36 * (Math.PI / 180)),
      8,
      pentagon_radius * Math.sin(54 * (Math.PI / 180))
    ),
    new Euler(0, MathUtils.degToRad(144), 0),
    // "../360Images/vitre.JPG",
    new URL("../360Images/vitre.JPG", import.meta.url).toString(),
    "Vitre Photo",
    font
  );
  createImageSphere(
    5,
    new Vector3(
      pentagon_radius * Math.sin(36 * (Math.PI / 180)),
      8,
      pentagon_radius * Math.sin(54 * (Math.PI / 180))
    ),
    new Euler(0, MathUtils.degToRad(216), 0),
    // "../360Images/singapore.JPG",
    new URL("../360Images/singapore.JPG", import.meta.url).toString(),
    "Singapore Photo",
    font
  );
}
