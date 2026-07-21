import {
  getLoggedInUsername,
  requireHyojongLogin,
  watchHyojongLogin
} from "./fishing-auth.js";

import {
  CommonPanelUI,
  PANEL_DEFINITIONS
} from "./common-panel-ui.js";

const screens = {
  start: document.getElementById("startScreen"),
  lobby: document.getElementById("lobbyScreen"),
  panel: document.getElementById("commonPanelScreen")
};

const startButton = document.getElementById("startButton");
const menuButton = document.getElementById("menuButton");
const fishingButton = document.getElementById("fishingButton");
const quickMenuPanel = document.getElementById("quickMenuPanel");
const quickMenuItems = [...document.querySelectorAll(".quick-menu-item")];
const lobbyStatusMount = document.getElementById("lobbyStatusMount");
const panelStatusMount = document.getElementById("panelStatusMount");
const commonPanelBackButton = document.getElementById("commonPanelBackButton");
const bubbleLayer = document.getElementById("bubbleLayer");

const commonPanel = new CommonPanelUI({
  screen: screens.panel,
  title: document.getElementById("commonPanelTitle"),
  tabs: document.getElementById("commonPanelTabs"),
  body: document.getElementById("commonPanelBody"),
  pagination: document.getElementById("commonPanelPagination")
});

const DEFAULT_PLAYER_STATE = Object.freeze({
  level: 1,
  currentExp: 0,
  requiredExp: 100,
  gold: 0,
  energy: 10
});

export const playerState = { ...DEFAULT_PLAYER_STATE };

export const fishingSession = {
  username: getLoggedInUsername(),
  currentScreen: "start",
  activePanel: null
};

let isQuickMenuOpen = false;

function createStatusBarMarkup(scope) {
  return `
    <div class="lobby-status-bar" aria-label="플레이어 상태" data-status-scope="${scope}">
      <button class="status-button level-status" type="button" data-status-action="level" aria-label="레벨 정보">
        <img src="./images/level-status-ui-new.png" class="status-ui-image" alt="" draggable="false">
        <span class="level-number" data-player-level>Lv. 1</span>
        <span class="level-progress-area" aria-hidden="true">
          <span class="level-progress-fill" data-level-progress></span>
        </span>
        <span class="level-experience" data-level-experience>0 / 100</span>
      </button>

      <button class="status-button gold-status" type="button" data-status-action="gold" aria-label="보유 골드">
        <img src="./images/gold-status-ui-new.png" class="status-ui-image" alt="" draggable="false">
        <span class="gold-number" data-player-gold>0</span>
      </button>

      <button class="status-button energy-status" type="button" data-status-action="energy" aria-label="에너지 정보">
        <img src="./images/energy-status-ui-new.png" class="status-ui-image" alt="" draggable="false">
        <span class="energy-number" data-player-energy>10</span>
      </button>
    </div>
  `;
}

function mountSharedStatusBars() {
  lobbyStatusMount.innerHTML = createStatusBarMarkup("lobby");
  panelStatusMount.innerHTML = createStatusBarMarkup("panel");

  document.querySelectorAll("[data-status-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.statusAction;
      const labels = {
        level: `현재 레벨은 ${playerState.level}입니다.`,
        gold: `현재 골드는 ${playerState.gold.toLocaleString("ko-KR")}입니다.`,
        energy: `현재 에너지는 ${playerState.energy.toLocaleString("ko-KR")}입니다.`
      };
      alert(labels[type]);
    });
  });
}

function getPlayerSaveKey() {
  return `fishingPlayer:${fishingSession.username || "guest"}`;
}

function normalizeInteger(value, fallback, minimum = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(minimum, Math.floor(number));
}

function loadPlayerState() {
  try {
    const raw = localStorage.getItem(getPlayerSaveKey());

    if (!raw) {
      Object.assign(playerState, DEFAULT_PLAYER_STATE);
      savePlayerState();
      return;
    }

    const saved = JSON.parse(raw);
    playerState.level = Math.min(100, normalizeInteger(saved.level, 1, 1));
    playerState.currentExp = normalizeInteger(saved.currentExp, 0);
    playerState.requiredExp = normalizeInteger(saved.requiredExp, 100, 1);
    playerState.gold = normalizeInteger(saved.gold, 0);
    playerState.energy = normalizeInteger(saved.energy, 10);
  } catch (error) {
    console.warn("플레이어 저장 데이터를 불러오지 못했습니다.", error);
    Object.assign(playerState, DEFAULT_PLAYER_STATE);
  }
}

export function savePlayerState() {
  localStorage.setItem(getPlayerSaveKey(), JSON.stringify(playerState));
}

export function updatePlayerStatus() {
  const levelText = `Lv. ${playerState.level}`;
  const expText = playerState.level >= 100
    ? "MAX"
    : `${playerState.currentExp} / ${playerState.requiredExp}`;
  const progress = playerState.level >= 100
    ? 100
    : Math.min(100, playerState.currentExp / playerState.requiredExp * 100);

  document.querySelectorAll("[data-player-level]").forEach((node) => {
    node.textContent = levelText;
  });
  document.querySelectorAll("[data-level-experience]").forEach((node) => {
    node.textContent = expText;
  });
  document.querySelectorAll("[data-level-progress]").forEach((node) => {
    node.style.width = `${progress}%`;
  });
  document.querySelectorAll("[data-player-gold]").forEach((node) => {
    node.textContent = playerState.gold.toLocaleString("ko-KR");
  });
  document.querySelectorAll("[data-player-energy]").forEach((node) => {
    node.textContent = playerState.energy.toLocaleString("ko-KR");
  });
}

function changeScreen(name) {
  Object.entries(screens).forEach(([screenName, screen]) => {
    const active = name === screenName;
    screen.classList.toggle("is-active", active);
    screen.setAttribute("aria-hidden", String(!active));
  });
  fishingSession.currentScreen = name;
}

function closeQuickMenu() {
  isQuickMenuOpen = false;
  quickMenuPanel.classList.remove("is-open");
  quickMenuPanel.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
}

function toggleQuickMenu() {
  isQuickMenuOpen = !isQuickMenuOpen;
  quickMenuPanel.classList.toggle("is-open", isQuickMenuOpen);
  quickMenuPanel.setAttribute("aria-hidden", String(!isQuickMenuOpen));
  menuButton.setAttribute("aria-expanded", String(isQuickMenuOpen));
}

function renderPanelSlot(type, tabId, panel) {
  const definition = PANEL_DEFINITIONS[type];
  const selectedTab = definition.tabs.find((tab) => tab.id === tabId);
  const tabName = selectedTab ? selectedTab.label : definition.title;

  panel.renderEmpty(
    `${tabName} 콘텐츠 영역입니다.<br>상품카드·인벤토리 카드·장비 카드는 이 슬롯에 별도 컴포넌트로 연결합니다.`
  );
}

function openCommonPanel(type) {
  closeQuickMenu();
  fishingSession.activePanel = type;

  commonPanel.open(type, {
    onTabChange(tabId, panel) {
      renderPanelSlot(type, tabId, panel);
    }
  });

  updatePlayerStatus();
  changeScreen("panel");
}

function openLobby() {
  fishingSession.activePanel = null;
  loadPlayerState();
  updatePlayerStatus();
  changeScreen("lobby");
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createBubble(x, y, index) {
  if (!bubbleLayer) return;
  const bubble = document.createElement("span");
  bubble.className = "click-bubble";
  bubble.style.setProperty("--bubble-x", `${x + randomBetween(-45, 45)}px`);
  bubble.style.setProperty("--bubble-y", `${y + randomBetween(-5, 20)}px`);
  bubble.style.setProperty("--bubble-size", `${randomBetween(9, 22)}px`);
  bubble.style.setProperty("--bubble-duration", `${randomBetween(600, 950)}ms`);
  bubble.style.setProperty("--bubble-rise", `${randomBetween(60, 120)}px`);
  bubble.style.setProperty("--bubble-sway", `${randomBetween(-28, 28)}px`);
  bubble.style.animationDelay = `${index * 15}ms`;
  bubble.addEventListener("animationend", () => bubble.remove(), { once: true });
  bubbleLayer.appendChild(bubble);
}

function playBubbleEffect(button) {
  if (!bubbleLayer) return;
  const layerRect = bubbleLayer.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const x = buttonRect.left - layerRect.left + buttonRect.width / 2;
  const y = buttonRect.top - layerRect.top + buttonRect.height / 2;
  for (let index = 0; index < 8; index += 1) createBubble(x, y, index);
}

function bindPressEffect(button) {
  if (!button) return;
  button.addEventListener("pointerdown", () => {
    button.classList.add("is-pressed");
    playBubbleEffect(button);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    button.addEventListener(eventName, () => button.classList.remove("is-pressed"));
  });
}

function bindEvents() {
  bindPressEffect(startButton);
  bindPressEffect(menuButton);
  bindPressEffect(fishingButton);
  bindPressEffect(commonPanelBackButton);

  startButton.addEventListener("click", () => {
    if (!requireHyojongLogin()) return;
    fishingSession.username = getLoggedInUsername();
    openLobby();
  });

  menuButton.addEventListener("click", toggleQuickMenu);

  fishingButton.addEventListener("click", () => {
    if (playerState.energy < 1) {
      alert("에너지가 부족합니다.");
      return;
    }
    alert("낚시 기능은 다음 단계에서 연결합니다.");
  });

  quickMenuItems.forEach((button) => {
    button.addEventListener("click", () => openCommonPanel(button.dataset.menu));
  });

  commonPanelBackButton.addEventListener("click", openLobby);

  document.addEventListener("pointerdown", (event) => {
    if (!isQuickMenuOpen) return;
    if (quickMenuPanel.contains(event.target) || menuButton.contains(event.target)) return;
    closeQuickMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (fishingSession.currentScreen === "panel") openLobby();
    else closeQuickMenu();
  });
}

function initialize() {
  mountSharedStatusBars();
  bindEvents();
  loadPlayerState();
  updatePlayerStatus();

  watchHyojongLogin((username) => {
    fishingSession.username = username;
  });
}

initialize();
