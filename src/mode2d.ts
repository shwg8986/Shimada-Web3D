/*
 * 2D表示モード
 *
 * 3Dサイトと同じコンテンツを、旧My-Home-Page（React/MUI版）のデザインを踏襲した
 * 縦スクロールの2Dページとして表示する。右上のトグルボタンでいつでも2D⇔3Dを
 * 切り替えられる。
 *
 * Experience / Education / Publication は index.html 内の3Dオーバーレイ用DOMを
 * クローンして使うため、コンテンツの更新は従来どおり index.html の1箇所だけで済む。
 */

import "./mode2d.css";
import { camera } from "./setup.ts";
import {
  cancelIntroAnimation,
  isIntroRunning,
  INTRO_LANDING,
} from "./loadingAnimation.ts";

export type ViewMode = "2d" | "3d";

const STORAGE_KEY = "shimada-web-view-mode";
let currentMode: ViewMode = "3d";
let isTransitioning = false;

const profileImageUrl = new URL(
  "../images/ProfileImage.jpg",
  import.meta.url
).toString();

// Awardsのアイコンボタンで開く画像。キーはボタンの data-certificate と対応
const certificates = {
  nedo: {
    url: new URL(
      "../images/NEDO Challnge Season1 Awards certificate.jpg",
      import.meta.url
    ).toString(),
    alt: "Q-Chainners NEDO Challenge Season1 Society 5.0領域 第3位の賞状",
  },
  aivr: {
    url: new URL(
      "../images/Best Paper Award - AIVR2024.jpg",
      import.meta.url
    ).toString(),
    alt: "AIVR2024 Best Paper Award の賞状",
  },
  academic: {
    url: new URL(
      "../images/Academic Excellence Award.jpg",
      import.meta.url
    ).toString(),
    alt: "東京都立大学 2021年度 成績優秀者表彰の表彰状ホルダー",
  },
};

type CertificateKey = keyof typeof certificates;

function certificateButton(key: CertificateKey, label = "賞状"): string {
  return `<button type="button" class="s2d-certificate-open" data-certificate="${key}" aria-label="${label}を表示" aria-haspopup="dialog" aria-controls="s2d-certificate"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg></button>`;
}

export function is2DMode(): boolean {
  return currentMode === "2d";
}

// ===== 2D専用コンテンツのデータ =====

const aboutMeItems = [
  {
    icon: "fa-solid fa-flask s2d-icon-science",
    text: "大学・大学院では、VRと人間情報学をテーマに研究していました。現在は量子コンピューティングとブロックチェーンの研究開発に携わり、チーム「Q-Chainners」で量子技術の活用に取り組んでいます。",
  },
  {
    icon: "fa-solid fa-diagram-project s2d-icon-science",
    text: "具体的には、ゲート型量子コンピュータを用いてハッシュを生成する技術を開発し、ブロックチェーンへの応用を進めています。2026年10月には、国（NEDO・経済産業省）が主催する量子コンピュータの研究開発コンテストで第3位を受賞しました。",
  },
  {
    icon: "fa-solid fa-code s2d-icon-code",
    text: "開発では、自分の書いたコードが画面上の動きや見た目に反映されるのが好きで、特にフロントエンドの実装を楽しんでいます。このサイトもその延長で、Three.jsによる3D表現や、2D・3Dを切り替えられる仕組みを作っています。",
  },
  {
    icon: "fa-solid fa-compass s2d-icon-explore",
    text: "これからは3Dモデリングも学び、表現の幅を広げていきたいと考えています。",
  },
];

const hobbies = [
  { icon: "fa-solid fa-pizza-slice", label: "ピザ・ラーメン巡り" },
  { icon: "fa-solid fa-plane", label: "国内/海外旅行" },
  { icon: "fa-solid fa-dumbbell", label: "ジム" },
  { icon: "fa-solid fa-wine-glass", label: "ワイン" },
  { icon: "fa-solid fa-table-tennis-paddle-ball", label: "テニス・バドミントン" },
  { icon: "fa-solid fa-baseball", label: "野球観戦" },
  { icon: "fa-solid fa-moon", label: "夜景・海を眺めること" },
];

const articles = [
  {
    title:
      "「NEDO懸賞金活用型プログラム／量子コンピュータを用いた社会問題ソリューション開発」のSociety 5.0領域で第3位を受賞",
    source: "KDDI総合研究所 トピックス",
    date: "2026-10-29",
    label: "2026年10月29日",
    url: "https://www.kddi-research.jp/topics/2026/102901.html",
  },
  {
    title: "量子技術分野最大の国際会議 IEEE Quantum Week 2026 参加レポート",
    source: "KDDI Tech note",
    date: "2026-10-08",
    label: "2026年10月8日",
    url: "https://tech-note.kddi.com/n/nf18c6d068d93",
  },
  {
    title: "量子コンピュータを活用したブロックチェーン -NEDO Challenge-",
    source: "KDDI Tech note",
    date: "2026-06-16",
    label: "2026年6月16日",
    url: "https://tech-note.kddi.com/n/n2eb577f7d4d8",
  },
];

const certifications: [string, string][] = [
  ["2026/2", "TOEIC L&R IP Test Total Score 825"],
  [
    "2025/3",
    "AWS Certified Solutions Architect - Associate (SAA-C03), Amazon Web Services (AWS).",
  ],
  ["2024/12", "LinuC Level-1 Certification, LPI-Japan."],
  ["2024/12", "Registered Scrum Master®, Scrum Inc."],
  [
    "2024/10",
    "AWS Certified Cloud Practitioner (CLF-C02), Amazon Web Services (AWS).",
  ],
  ["2024/9", "SnowPro Core (COF-CO2), Snowflake."],
  ["2024/6", "第一級陸上特殊無線技士, 公益財団法人 日本無線協会"],
  ["2024/5", "G検定, 一般社団法人日本ディープラーニング協会"],
  ["2024/2", "上級バーチャルリアリティ技術者, 日本VR学会"],
  [
    "2024/2",
    "バーチャルリアリティ技術者認定試験 アプリケーションコース, 日本VR学会",
  ],
  ["2023/8", "バーチャルリアリティ技術者認定試験 セオリーコース, 日本VR学会"],
  ["2023/7", "Paiza プログラミングスキルチェック Sランク"],
  ["2021/12", "基本情報技術者試験, 情報処理推進機構"],
  ["2021/2", "TOEIC L&R Total Score 780"],
];

const awards: [string, string][] = [
  [
    "2026",
    `<h3 class="s2d-award-program">NEDO懸賞金活用型プログラム「量子コンピュータを用いた社会問題ソリューション開発」Season1</h3>
      <p>チーム「Q-Chainners」<br>ゲート型量子コンピューティング技術を活用したハッシュ生成とブロックチェーンへの応用。</p>
      <ul class="s2d-award-details">
        <li><div class="s2d-award-heading"><a href="https://www.nedo.go.jp/news/press/AA5_101974.html" target="_blank" rel="noopener noreferrer">Society 5.0領域 第3位（懸賞金1,000万円）</a>${certificateButton("nedo")}</div><span>2026年10月</span></li>
        <li>Best Poster 3rd — 第二回研究開発討議会<br><span>2026年5月</span></li>
      </ul>`,
  ],
  [
    "2024",
    `<div class="s2d-award-heading"><a href="https://www.sd.tmu.ac.jp/news/prize/11808.html" target="_blank" rel="noopener noreferrer">Best Paper Award - 2024 8th International Conference on Artificial intelligence and Virtual Reality (AIVR2024)</a>${certificateButton("aivr")}</div>`,
  ],
  [
    "2021",
    `<div class="s2d-award-heading"><span>東京都立大学 情報科学科 成績優秀者表彰</span>${certificateButton("academic", "写真")}</div>`,
  ],
];

const links = [
  {
    url: "https://www.instagram.com/shwg_sh_/",
    icon: "fa-brands fa-instagram",
    cls: "s2d-link-instagram",
    label: "Instagram",
  },
  {
    url: "https://x.com/shwg_360",
    icon: "fa-brands fa-x-twitter",
    cls: "s2d-link-x",
    label: "X (Twitter)",
  },
  {
    url: "https://github.com/shwg8986",
    icon: "fa-brands fa-github",
    cls: "s2d-link-github",
    label: "Github",
  },
  {
    url: "https://www.linkedin.com/in/shimada-shogo/",
    icon: "fa-brands fa-linkedin",
    cls: "s2d-link-linkedin",
    label: "LinkedIn",
  },
  {
    url: "https://www.researchgate.net/profile/Shogo-Shimada-2",
    icon: "fa-brands fa-researchgate",
    cls: "s2d-link-researchgate",
    label: "ResearchGate",
  },
];

// ===== ページ構築 =====

function tableRows(rows: [string, string][]): string {
  return rows
    .map(([date, text]) => `<tr><td>${date}</td><td>${text}</td></tr>`)
    .join("");
}

function buildPage(): HTMLDivElement {
  const app2d = document.createElement("div");
  app2d.id = "app2d";
  app2d.innerHTML = `
    <header class="s2d-appbar">
      <span class="s2d-brand" id="s2d-brand">しまだのWeb2D</span>
    </header>

    <section id="s2d-profile" class="s2d-hero">
      <img class="s2d-hero-image" src="${profileImageUrl}" alt="Profile Image" />
      <div class="s2d-hero-text">
        <h1>Profile</h1>
        <p class="s2d-hero-sub">ー プロフィール ー</p>
        <p class="s2d-hero-name">島田匠悟 (Shogo SHIMADA)</p>
        <p class="s2d-hero-desc">
          修士（情報科学）,<br />Master of Computer Science.<br /><br />
          生まれ: 1999年 神奈川県
        </p>
      </div>
    </section>

    <section id="s2d-about" class="s2d-section s2d-animate">
      <h2 class="s2d-title">About Me</h2>
      <p class="s2d-subtitle">ー 自己紹介 ー</p>
      ${aboutMeItems
        .map(
          (item) => `
      <div class="s2d-about-item">
        <i class="${item.icon}"></i>
        <p>${item.text}</p>
      </div>`
        )
        .join("")}
      <p class="s2d-note">
        本Webサイトは TypeScript(Three.js) を用いて開発しています。右上のボタンから3D版⇔2D版をいつでも切り替えられます。
      </p>
      <p class="s2d-hobbies-title">Hobbies</p>
      <div class="s2d-chips">
        ${hobbies
          .map(
            (hobby) =>
              `<span class="s2d-chip"><i class="${hobby.icon}"></i>${hobby.label}</span>`
          )
          .join("")}
      </div>
    </section>

    <section id="s2d-education" class="s2d-section s2d-animate from-right">
      <h2 class="s2d-title">Education</h2>
      <p class="s2d-subtitle">ー 学歴 ー</p>
      <div id="s2d-education-body"></div>
    </section>

    <section id="s2d-experience" class="s2d-section s2d-animate">
      <h2 class="s2d-title">Experience</h2>
      <p class="s2d-subtitle">ー 経歴 ー</p>
      <div id="s2d-experience-body"></div>
    </section>

    <section id="s2d-publication" class="s2d-section s2d-animate from-right">
      <h2 class="s2d-title">Publication</h2>
      <p class="s2d-subtitle">ー 研究業績 ー</p>
      <div id="s2d-publication-body"></div>
    </section>

    <section id="s2d-articles" class="s2d-section s2d-animate">
      <h2 class="s2d-title">Articles</h2>
      <p class="s2d-subtitle">ー 執筆記事 ー</p>
      <div class="s2d-articles">
        ${articles.map((article) => `
          <a class="s2d-article" href="${article.url}" target="_blank" rel="noopener noreferrer">
            <div class="s2d-article-meta"><span>${article.source}</span><time datetime="${article.date}">${article.label}</time></div>
            <h3>${article.title}<span class="s2d-article-arrow" aria-hidden="true">↗</span></h3>
          </a>`).join("")}
      </div>
    </section>

    <section id="s2d-certifications" class="s2d-section s2d-animate">
      <h2 class="s2d-title">Certifications</h2>
      <p class="s2d-subtitle">ー 資格 ー</p>
      <table class="table">${tableRows(certifications)}</table>
    </section>

    <section id="s2d-awards" class="s2d-section s2d-animate from-right">
      <h2 class="s2d-title">Awards</h2>
      <p class="s2d-subtitle">ー 受賞 ー</p>
      <table class="table">${tableRows(awards)}</table>
      <dialog id="s2d-certificate" class="s2d-certificate" aria-label="受賞の賞状・写真">
        <header class="s2d-certificate-toolbar">
          <form method="dialog"><button class="s2d-certificate-close" aria-label="戻る" autofocus>×</button></form>
        </header>
        <div class="s2d-certificate-stage">
          <img alt="" />
        </div>
      </dialog>
    </section>

    <section id="s2d-link" class="s2d-section s2d-animate">
      <h2 class="s2d-title">Link</h2>
      <p class="s2d-subtitle">ー リンク ー</p>
      <div class="s2d-links">
        ${links
          .map(
            (link) =>
              `<a href="${link.url}" target="_blank" rel="noopener" aria-label="${link.label}" class="${link.cls}"><i class="${link.icon}"></i></a>`
          )
          .join("")}
      </div>
    </section>

    <footer class="s2d-footer">
      <p>Copyright © ${new Date().getFullYear()} Shogo SHIMADA.</p>
      <p>All rights reserved.</p>
    </footer>
  `;
  const certificate = app2d.querySelector<HTMLDialogElement>("#s2d-certificate")!;
  app2d.querySelectorAll<HTMLButtonElement>(".s2d-certificate-open").forEach((button) => {
    button.addEventListener("click", () => {
      const data = certificates[button.dataset.certificate as CertificateKey];
      const image = certificate.querySelector<HTMLImageElement>(".s2d-certificate-stage img")!;
      image.src = data.url;
      image.alt = data.alt;
      certificate.showModal();
    });
  });
  certificate.addEventListener("click", (event) => {
    if (event.target !== certificate) return;
    const bounds = certificate.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      certificate.close();
    }
  });
  return app2d;
}

// 3Dオーバーレイ用のDOM（index.html内）から Education / Experience / Publication を
// クローンして2Dページに流し込む
function cloneSharedContent(app2d: HTMLElement) {
  const educationBody = app2d.querySelector("#s2d-education-body");
  const educationTable = document.querySelector("#content2 .table");
  if (educationBody && educationTable) {
    educationBody.appendChild(educationTable.cloneNode(true));
  }

  const experienceBody = app2d.querySelector("#s2d-experience-body");
  if (experienceBody) {
    document.querySelectorAll("#content1 .accordion").forEach((accordion) => {
      const clone = accordion.cloneNode(true) as HTMLElement;
      // 3D側の initializeAccordions に二重で拾われないよう、外側クラスだけ変える
      clone.className = "accordion2d";
      experienceBody.appendChild(clone);
    });
  }

  const publicationBody = app2d.querySelector("#s2d-publication-body");
  const publicationTable = document.querySelector("#content3 .table");
  if (publicationBody && publicationTable) {
    publicationBody.appendChild(publicationTable.cloneNode(true));
  }
}

// クローンしたアコーディオンの開閉（イベント委譲）
function setupAccordionDelegation(app2d: HTMLElement) {
  app2d.addEventListener("click", (event) => {
    const header = (event.target as HTMLElement).closest(
      ".accordion2d .accordion-header"
    );
    if (!header) return;

    const content = header.parentElement?.querySelector(".accordion-content");
    const toggle = header.querySelector(".accordion-toggle");
    if (!content || !toggle) return;

    const isActive = content.classList.toggle("active");
    toggle.innerHTML = isActive ? "&#9660;" : "&#9650;";
  });
}

// セクションのスライドイン表示（旧2Dサイトの slideInLeft/Right を踏襲）
function setupScrollAnimations(app2d: HTMLElement) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { root: app2d, threshold: 0.1 }
  );
  app2d.querySelectorAll(".s2d-animate").forEach((el) => observer.observe(el));
}

// ===== モード切り替え =====

function resolveInitialMode(): ViewMode {
  // URLは「?」を使わないハッシュ形式（例: https://.../#2d）
  const hash = window.location.hash.replace("#", "").toLowerCase();
  if (hash === "2d") return "2d";
  if (hash === "3d") return "3d";
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    // プライベートブラウジング等でlocalStorageが使えない場合は既定の3D
  }
  return saved === "2d" ? "2d" : "3d";
}

export function setViewMode(mode: ViewMode) {
  currentMode = mode;
  document.body.classList.toggle("mode-2d", mode === "2d");

  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // 保存できなくても切り替え自体は成立する
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("mode"); // 旧形式の ?mode=2d が残っていたら消す
  url.hash = mode === "2d" ? "2d" : "";
  history.replaceState(null, "", url.toString());

  const toggle = document.getElementById("view-toggle");
  if (toggle) {
    toggle.innerHTML =
      mode === "2d"
        ? '<i class="fa-solid fa-cube"></i><span>3D表示へ</span>'
        : '<i class="fa-solid fa-list"></i><span>2D表示へ</span>';
  }

  if (mode === "2d") {
    // 3D側で開いたままのオーバーレイを閉じておく
    document.getElementById("overlay")?.classList.remove("active");
    document.body.classList.remove("overlay-open");
    document
      .querySelectorAll("#app .content-item")
      .forEach((content) => content.classList.remove("active"));
  }
}

// ===== 2D⇔3D 遷移演出 =====
// 3D→2D: カメラが空へ吹き上がり、視界が広がりながらホワイトアウト。
//         2DページはパースをつけたズームインでOverlayパネルのように現れる。
// 2D→3D: 白の中から上空スタートでカメラが海面へ落下（イントロの落下と同じ演出）、
//         広角から通常の視界へすっと絞り込まれて着地する。

const TRANSITION_IN_MS = 420;
const TRANSITION_OUT_MS = 750;
const WARP_FOV_OFFSET = 32;
const WARP_RISE_HEIGHT = 22;

function ensureTransitionOverlay(): HTMLElement {
  let overlay = document.getElementById("mode-transition");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "mode-transition";
    document.body.appendChild(overlay);
  }
  return overlay;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;

function animateFov(to: number, duration: number, ease = easeOutCubic) {
  const from = camera.fov;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    camera.fov = from + (to - from) * ease(t);
    camera.updateProjectionMatrix();
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function animateCameraY(to: number, duration: number, ease = easeOutCubic) {
  const from = camera.position.y;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    camera.position.y = from + (to - from) * ease(t);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// 2Dページをパース付きズームインで登場させる
function playApp2DEnterAnimation() {
  const app2d = document.getElementById("app2d");
  if (!app2d) return;
  app2d.classList.remove("s2d-zoom-in");
  void app2d.offsetWidth; // リフローを挟んでアニメーションを再発火させる
  app2d.classList.add("s2d-zoom-in");
}

export function switchViewMode(target: ViewMode) {
  if (isTransitioning || target === currentMode) return;
  isTransitioning = true;

  // イントロ落下中に切り替えた場合、そのままの fov/y を「基準値」として
  // 記憶すると空中・広角のまま固定されてしまうため、イントロの着地値を使う
  const wasIntroRunning = isIntroRunning();
  cancelIntroAnimation(false); // 後始末はこちらで引き継ぐ
  const baseFov = wasIntroRunning ? INTRO_LANDING.fov : camera.fov;
  const baseY = wasIntroRunning ? INTRO_LANDING.y : camera.position.y;

  const overlay = ensureTransitionOverlay();
  overlay.classList.add("active");

  if (currentMode === "3d") {
    // ワープアウト: 空へ吹き上がりながら視界が広がる
    animateFov(baseFov + WARP_FOV_OFFSET, TRANSITION_IN_MS, easeInCubic);
    animateCameraY(baseY + WARP_RISE_HEIGHT, TRANSITION_IN_MS, easeInCubic);
  }

  window.setTimeout(() => {
    setViewMode(target);

    if (target === "3d") {
      // ワープイン: 上空・広角の状態から海面へ落下して着地
      camera.fov = baseFov + WARP_FOV_OFFSET;
      camera.updateProjectionMatrix();
      camera.position.y = baseY + WARP_RISE_HEIGHT;
      animateFov(baseFov, TRANSITION_OUT_MS);
      animateCameraY(baseY, TRANSITION_OUT_MS);
    } else {
      // 3D側のカメラは元の状態に戻しておき、2Dページをズームインさせる
      camera.fov = baseFov;
      camera.updateProjectionMatrix();
      camera.position.y = baseY;
      playApp2DEnterAnimation();
    }

    overlay.classList.remove("active");
    window.setTimeout(() => {
      isTransitioning = false;
    }, TRANSITION_OUT_MS);
  }, TRANSITION_IN_MS + 60);
}

function setupToggleButton() {
  const toggle = document.createElement("button");
  toggle.id = "view-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "2D表示と3D表示を切り替える");
  toggle.addEventListener("click", () => {
    switchViewMode(is2DMode() ? "3d" : "2d");
  });
  document.body.appendChild(toggle);
}

// ===== 初期化（main.ts の init から呼ぶ） =====

export function init2DMode() {
  const app2d = buildPage();
  document.body.appendChild(app2d);

  cloneSharedContent(app2d);
  setupAccordionDelegation(app2d);
  setupScrollAnimations(app2d);
  setupToggleButton();

  const brand = app2d.querySelector("#s2d-brand");
  brand?.addEventListener("click", () => {
    app2d.scrollTo({ top: 0, behavior: "smooth" });
  });

  // トップへ戻るボタン:
  // #app2d 内に置くとズームインアニメーション中の transform の影響で
  // position: fixed の基準がビューポートからずれるため、body直下に置く
  const scrollTopButton = document.createElement("button");
  scrollTopButton.id = "s2d-scrolltop";
  scrollTopButton.type = "button";
  scrollTopButton.setAttribute("aria-label", "ページの先頭へ戻る");
  scrollTopButton.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
  scrollTopButton.addEventListener("click", () => {
    app2d.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.body.appendChild(scrollTopButton);

  setViewMode(resolveInitialMode());
}
