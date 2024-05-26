import * as THREE from "three";
import { getIsCameraMoving, setIsCameraMoving } from "./main.ts";
import { videoSpheres, imageSpheres, tabObjects } from "./objCreateFunc.ts";
import { moveCameraTo } from "./cameraMoveControls.ts";

let isOverlayVisible = false;

// 指定されたコンテンツを表示する関数
export function showContent(id: string) {
  // console.log(`Showing content with ID: ${id}`);
  const overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.classList.add("active");
    const contents = document.querySelectorAll(".content-item");
    contents.forEach((content) => content.classList.remove("active"));

    const selectedContent = document.getElementById(id);
    if (selectedContent) {
      selectedContent.classList.add("active");
    } else {
      console.error(`Content with ID ${id} not found.`);
    }

    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => tab.classList.remove("active"));

    const selectedTab = document.querySelector(
      `[id="tab${id.replace("content", "")}"]`
    );
    if (selectedTab) {
      selectedTab.classList.add("active");
    } else {
      console.error(`Tab for content ID ${id} not found.`);
    }
  } else {
    console.error("Overlay not found.");
  }
  isOverlayVisible = true;
}

// オーバーレイを閉じる関数
export function closeOverlay() {
  const overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.classList.remove("active");
    const contents = document.querySelectorAll(".content-item");
    contents.forEach((content) => content.classList.remove("active"));
  }
  isOverlayVisible = false;
}

// タブクリック時の処理を追加
export function handleTabClick(contentId: string) {
  if (getIsCameraMoving()) return; // カメラ移動中の場合は何もしない

  const intersectedObject = tabObjects.find(
    (obj) => obj.userData.contentId === contentId
  );
  if (intersectedObject) {
    setIsCameraMoving(true);
    const targetRotation = intersectedObject.rotation.clone();
    moveCameraTo(intersectedObject.position, targetRotation, () => {
      showContent(contentId);
      setIsCameraMoving(false);
    });
  }
}

// 次のコンテンツを表示する関数
const showNext = () => {
  if (getIsCameraMoving()) return; // カメラ移動中の場合は何もしない

  const activeContent = document.querySelector(
    ".content-item.active"
  ) as HTMLElement;
  const contents = Array.from(document.querySelectorAll(".content-item"));

  if (!activeContent) {
    // console.error("No active content found.");
    return;
  }

  const currentIndex = contents.indexOf(activeContent);
  const nextIndex = (currentIndex + 1) % contents.length; // 循環させる

  // console.log(`Current index: ${currentIndex}, Next index: ${nextIndex}`);

  const nextContent = contents[nextIndex] as HTMLElement;
  if (nextContent) {
    // console.log(`Next content ID: ${nextContent.id}`);
    moveCameraToNextContent(nextContent.id);
  } else {
    // console.error("Next content not found.");
  }
};

// 前のコンテンツを表示する関数
const showPrev = () => {
  if (getIsCameraMoving()) return; // カメラ移動中の場合は何もしない

  const activeContent = document.querySelector(
    ".content-item.active"
  ) as HTMLElement;
  const contents = Array.from(document.querySelectorAll(".content-item"));

  if (!activeContent) {
    // console.error("No active content found.");
    return;
  }

  const currentIndex = contents.indexOf(activeContent);
  const prevIndex = (currentIndex - 1 + contents.length) % contents.length; // 循環させるために変更

  // console.log(`Current index: ${currentIndex}, Prev index: ${prevIndex}`); // デバッグログ追加

  const prevContent = contents[prevIndex] as HTMLElement;
  if (prevContent) {
    // console.log(`Prev content ID: ${prevContent.id}`);
    moveCameraToNextContent(prevContent.id);
  } else {
    // console.error("Previous content not found.");
  }
};

// 次のコンテンツにカメラを移動させて表示する関数
const moveCameraToNextContent = (contentId: string) => {
  // console.log(`Moving to content with ID: ${contentId}`);
  const intersectedObject = findIntersectedObjectByContentId(contentId);
  if (intersectedObject) {
    setIsCameraMoving(true);
    const targetRotation = intersectedObject.rotation.clone();
    moveCameraTo(intersectedObject.position, targetRotation, () => {
      showContent(contentId);
      setIsCameraMoving(false);
    });
  } else {
    // console.log(`No intersected object found for content ID: ${contentId}`);
  }
};

// コンテンツIDに基づいて交差したオブジェクトを見つける関数
const findIntersectedObjectByContentId = (
  contentId: string
): THREE.Object3D | null => {
  const objects = [...videoSpheres, ...imageSpheres, ...tabObjects];
  for (const obj of objects) {
    if (obj.userData.contentId === contentId) {
      return obj;
    }
  }
  return null;
};

export const initOverlay = (handleTabClick: (contentId: string) => void) => {
  document.addEventListener("DOMContentLoaded", () => {
    // 各タブにクリックイベントリスナーを追加
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        if (getIsCameraMoving()) return; // カメラ移動中の場合は何もしない
        const id = tab.id.replace("tab", "content");
        handleTabClick(id);
      });
    });

    // 各Nextボタンにクリックイベントリスナーを追加
    document.querySelectorAll(".next-button").forEach((button) => {
      button.addEventListener("click", showNext);
    });

    // 各Prevボタンにクリックイベントリスナーを追加
    document.querySelectorAll(".prev-button").forEach((button) => {
      button.addEventListener("click", showPrev);
    });

    // オーバーレイ外側のクリックを検出してオーバーレイを閉じる関数
    const overlay = document.getElementById("overlay");
    overlay?.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeOverlay();
      }
    });

    // 閉じるボタンにイベントリスナーを追加
    document
      .getElementById("close-button")!
      .addEventListener("click", closeOverlay);
  });
};
