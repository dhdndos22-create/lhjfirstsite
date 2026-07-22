import {
  getLoggedInUsername,
  requireHyojongLogin,
  watchHyojongLogin
} from "./fishing-auth.js";

import {
  CommonPanelUI,
  PANEL_DEFINITIONS
} from "./common-panel-ui.js";

import { GAME_CONFIG, RARITY_LABELS, RARITY_ORDER } from "./data/game-config.js";
import { getFishByStage } from "./data/fish.js";
import { STAGE_DATA, getStageById } from "./data/stages.js";
import {
  playerSave,
  replacePlayerSave,
  getPlayerStatusView
} from "./state/player-state.js";
import {
  loadPlayerSave,
  savePlayerSave
} from "./services/save-service.js";

const screens = {
  start: document.getElementById("startScreen"),
  lobby: document.getElementById("lobbyScreen"),
  panel: document.getElementById("commonPanelScreen"),
  stageSelect: document.getElementById("stageSelectScreen"),
  fishingStage: document.getElementById("fishingStageScreen")
};

const startButton = document.getElementById("startButton");
const menuButton = document.getElementById("menuButton");
const fishingButton = document.getElementById("fishingButton");
const quickMenuPanel = document.getElementById("quickMenuPanel");
const quickMenuItems = [...document.querySelectorAll(".quick-menu-item")];
const lobbyStatusMount = document.getElementById("lobbyStatusMount");
const panelStatusMount = document.getElementById("panelStatusMount");
const stageStatusMount = document.getElementById("stageStatusMount");
const fishingStatusMount = document.getElementById("fishingStatusMount");
const commonPanelBackButton = document.getElementById("commonPanelBackButton");
const stageSelectBackButton = document.getElementById("stageSelectBackButton");
const fishingStageBackButton = document.getElementById("fishingStageBackButton");
const stagePrevButton = document.getElementById("stagePrevButton");
const stageNextButton = document.getElementById("stageNextButton");
const stageEnterButton = document.getElementById("stageEnterButton");
const stageCard = document.getElementById("stageCard");
const stageNumberText = document.getElementById("stageNumberText");
const stageNameText = document.getElementById("stageNameText");
const stageDescriptionText = document.getElementById("stageDescriptionText");
const stageDifficultyText = document.getElementById("stageDifficultyText");
const stageRequirementText = document.getElementById("stageRequirementText");
const stagePreview = document.getElementById("stagePreview");
const stageIslandImage = document.getElementById("stageIslandImage");
const stageLockOverlay = document.getElementById("stageLockOverlay");
const stagePageDots = document.getElementById("stagePageDots");
const fishingStageNumber = document.getElementById("fishingStageNumber");
const fishingStageName = document.getElementById("fishingStageName");
const fishingStageDescription = document.getElementById("fishingStageDescription");
const fishingStageBackground = document.getElementById("fishingStageBackground");
const bubbleLayer = document.getElementById("bubbleLayer");

const commonPanel = new CommonPanelUI({
  screen: screens.panel,
  title: document.getElementById("commonPanelTitle"),
  tabs: document.getElementById("commonPanelTabs"),
  body: document.getElementById("commonPanelBody"),
  pagination: document.getElementById("commonPanelPagination")
});

export const playerState = {
  level: GAME_CONFIG.initialLevel,
  currentExp: GAME_CONFIG.initialExp,
  requiredExp: 100,
  gold: GAME_CONFIG.initialGold,
  energy: GAME_CONFIG.initialEnergy
};

function syncLegacyStatusView() {
  Object.assign(playerState, getPlayerStatusView());
}

export const fishingSession = {
  username: getLoggedInUsername(),
  currentScreen: "start",
  activePanel: null,
  selectedStageIndex: 0,
  activeStageId: null
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
  stageStatusMount.innerHTML = createStatusBarMarkup("stage-select");
  fishingStatusMount.innerHTML = createStatusBarMarkup("fishing-stage");

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

function loadPlayerState() {
  const loadedSave = loadPlayerSave(fishingSession.username || "guest");
  replacePlayerSave(loadedSave);
  syncLegacyStatusView();
}

export function savePlayerState() {
  const saved = savePlayerSave(
    fishingSession.username || "guest",
    playerSave
  );
  replacePlayerSave(saved);
  syncLegacyStatusView();
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

function getCollectionCount(fishId) {
  const record = playerSave.fishCollection?.[fishId];
  return Number(record?.count ?? record ?? 0);
}

function renderCollectionPanel(tabId, panel) {
  const stageId = Number(String(tabId).replace("stage-", ""));
  const fishList = getFishByStage(stageId);

  panel.hidePagination();

  if (fishList.length === 0) {
    panel.renderEmpty(
      `<strong>${stageId}스테이지 도감</strong><br>출현 생물 데이터가 아직 등록되지 않았습니다.`
    );
    return;
  }

  const stage = getStageById(stageId);
  const acquiredCount = fishList.filter((fish) => getCollectionCount(fish.id) > 0).length;

  const wrapper = document.createElement("section");
  wrapper.className = "collection-view";

  const summary = document.createElement("div");
  summary.className = "collection-summary";
  summary.innerHTML = `
    <div>
      <span class="collection-stage-label">STAGE ${stageId}</span>
      <strong>${stage?.name ?? `${stageId}스테이지`}</strong>
    </div>
    <span class="collection-progress">${acquiredCount} / ${fishList.length}</span>
  `;
  wrapper.appendChild(summary);

  RARITY_ORDER.forEach((rarity) => {
    const rarityFish = fishList.filter((fish) => fish.rarity === rarity);
    if (rarityFish.length === 0) return;

    const section = document.createElement("section");
    section.className = `collection-rarity-section rarity-${rarity}`;

    const title = document.createElement("h2");
    title.className = "collection-rarity-title";
    title.textContent = RARITY_LABELS[rarity] ?? rarity;
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "collection-grid";

    rarityFish.forEach((fish) => {
      const count = getCollectionCount(fish.id);
      const card = document.createElement("article");
      card.className = `collection-card rarity-${fish.rarity}`;
      card.dataset.fishId = fish.id;

      card.innerHTML = `
        <div class="collection-image-frame">
          <img src="${fish.image}" alt="${fish.name}" draggable="false">
          <span class="collection-count">${count > 0 ? `× ${count}` : "미획득"}</span>
        </div>
        <div class="collection-card-info">
          <strong class="collection-fish-name">${fish.name}</strong>
          <span class="collection-fish-size">${fish.minSize}~${fish.maxSize}cm</span>
        </div>
      `;

      card.addEventListener("click", () => {
        alert(
          `${fish.name}\n${RARITY_LABELS[fish.rarity]}\n${fish.description}\n` +
          `크기: ${fish.minSize}~${fish.maxSize}cm\n기본 판매가: ${fish.baseGold.toLocaleString("ko-KR")} 골드`
        );
      });

      grid.appendChild(card);
    });

    section.appendChild(grid);
    wrapper.appendChild(section);
  });

  panel.setBody(wrapper);
}

function renderPanelSlot(type, tabId, panel) {
  if (type === "collection") {
    renderCollectionPanel(tabId, panel);
    return;
  }

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


function getStageCollectionProgress(stage) {
  const total = stage.fishPool.length;
  if (total === 0) return { caught: 0, total: 0, rate: 0 };

  const caught = stage.fishPool.filter((fishId) => {
    const record = playerSave.fishCollection?.[fishId];
    return Number(record?.count ?? record ?? 0) > 0;
  }).length;

  return {
    caught,
    total,
    rate: Math.floor((caught / total) * 100)
  };
}

function isStageUnlocked(stage) {
  if (stage.id === 1) return true;
  const previousStage = getStageById(stage.previousStageId);
  const previousProgress = previousStage
    ? getStageCollectionProgress(previousStage)
    : { rate: 0 };

  return playerSave.profile.level >= stage.requiredLevel
    && previousProgress.rate >= stage.requiredCollectionRate;
}

function updateHighestUnlockedStage() {
  const highest = STAGE_DATA.reduce((maxId, stage) => {
    return isStageUnlocked(stage) ? Math.max(maxId, stage.id) : maxId;
  }, 1);

  playerSave.progression.highestUnlockedStageId = highest;
}

function getStageUnlockMessage(stage) {
  if (stage.id === 1) return "처음부터 입장 가능";

  const previousStage = getStageById(stage.previousStageId);
  const progress = previousStage
    ? getStageCollectionProgress(previousStage)
    : { caught: 0, total: 0, rate: 0 };
  const collectionText = progress.total > 0
    ? `${previousStage.name} 도감 ${progress.caught}/${progress.total} (${progress.rate}%)`
    : `${previousStage.name} 도감 데이터 준비중 (완성 필요)`;

  return `해금 조건 · Lv.${stage.requiredLevel} / ${collectionText}`;
}

function renderStageDots() {
  stagePageDots.innerHTML = "";
  STAGE_DATA.forEach((stage, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "stage-page-dot";
    dot.classList.toggle("is-active", index === fishingSession.selectedStageIndex);
    dot.setAttribute("aria-label", `${stage.name} 선택`);
    dot.addEventListener("click", () => {
      fishingSession.selectedStageIndex = index;
      renderStageSelection();
    });
    stagePageDots.appendChild(dot);
  });
}

function renderStageSelection(direction = 0) {
  const stage = STAGE_DATA[fishingSession.selectedStageIndex];
  if (!stage) return;

  updateHighestUnlockedStage();
  const unlocked = isStageUnlocked(stage);

  stageCard.classList.remove("slide-left", "slide-right");
  if (direction !== 0) {
    void stageCard.offsetWidth;
    stageCard.classList.add(direction > 0 ? "slide-left" : "slide-right");
  }

  stageNumberText.textContent = `STAGE ${stage.id}`;
  stageNameText.textContent = stage.name;
  stageDescriptionText.textContent = stage.description;
  stageDifficultyText.textContent = `${"★".repeat(stage.difficulty)}${"☆".repeat(5 - stage.difficulty)}`;
  stageRequirementText.textContent = unlocked ? "입장 가능" : getStageUnlockMessage(stage);
  stageRequirementText.classList.toggle("is-locked", !unlocked);
  stageEnterButton.disabled = !unlocked;
  stageEnterButton.textContent = unlocked ? "입장하기" : "잠김";
  stagePreview.classList.toggle("is-locked", !unlocked);
  stagePreview.dataset.stage = String(stage.id);
  stageIslandImage.src = stage.backgroundImage;
  stageIslandImage.alt = `${stage.name} 스테이지 섬`;

  const imageStyle = stage.imageStyle ?? {};
  stageIslandImage.style.setProperty("--stage-image-scale", String(imageStyle.scale ?? 1));
  stageIslandImage.style.setProperty("--stage-image-x", `${imageStyle.offsetX ?? 0}px`);
  stageIslandImage.style.setProperty("--stage-image-y", `${imageStyle.offsetY ?? 0}px`);
  stageIslandImage.dataset.stageId = String(stage.id);

  stageLockOverlay.hidden = unlocked;

  stagePrevButton.disabled = fishingSession.selectedStageIndex === 0;
  stageNextButton.disabled = fishingSession.selectedStageIndex === STAGE_DATA.length - 1;
  renderStageDots();
}

function openStageSelect() {
  closeQuickMenu();
  loadPlayerState();
  updateHighestUnlockedStage();
  const selectedId = playerSave.progression?.selectedStageId || 1;
  fishingSession.selectedStageIndex = Math.max(
    0,
    STAGE_DATA.findIndex((stage) => stage.id === selectedId)
  );
  updatePlayerStatus();
  renderStageSelection();
  changeScreen("stageSelect");
}

function moveStageSelection(offset) {
  const nextIndex = fishingSession.selectedStageIndex + offset;
  if (nextIndex < 0 || nextIndex >= STAGE_DATA.length) return;
  fishingSession.selectedStageIndex = nextIndex;
  renderStageSelection(offset);
}

let stageSwipeStartX = null;

function handleStageSwipeStart(event) {
  stageSwipeStartX = event.clientX;
}

function handleStageSwipeEnd(event) {
  if (stageSwipeStartX === null) return;
  const distance = event.clientX - stageSwipeStartX;
  stageSwipeStartX = null;
  if (Math.abs(distance) < 45) return;
  moveStageSelection(distance < 0 ? 1 : -1);
}

function enterSelectedStage() {
  const stage = STAGE_DATA[fishingSession.selectedStageIndex];
  if (!stage || !isStageUnlocked(stage)) return;

  fishingSession.activeStageId = stage.id;
  playerSave.progression.selectedStageId = stage.id;
  savePlayerState();

  fishingStageNumber.textContent = `STAGE ${stage.id}`;
  fishingStageName.textContent = stage.name;
  fishingStageDescription.textContent = stage.description;
  fishingStageBackground.dataset.stage = String(stage.id);
  updatePlayerStatus();
  changeScreen("fishingStage");
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
  bindPressEffect(stageSelectBackButton);
  bindPressEffect(fishingStageBackButton);
  bindPressEffect(stagePrevButton);
  bindPressEffect(stageNextButton);
  bindPressEffect(stageEnterButton);

  startButton.addEventListener("click", () => {
    if (!requireHyojongLogin()) return;
    fishingSession.username = getLoggedInUsername();
    openLobby();
  });

  menuButton.addEventListener("click", toggleQuickMenu);

  fishingButton.addEventListener("click", openStageSelect);

  stagePrevButton.addEventListener("click", () => moveStageSelection(-1));
  stageNextButton.addEventListener("click", () => moveStageSelection(1));
  stagePreview.addEventListener("pointerdown", handleStageSwipeStart);
  stagePreview.addEventListener("pointerup", handleStageSwipeEnd);
  stagePreview.addEventListener("pointercancel", () => { stageSwipeStartX = null; });
  stageEnterButton.addEventListener("click", enterSelectedStage);
  stageSelectBackButton.addEventListener("click", openLobby);
  fishingStageBackButton.addEventListener("click", openStageSelect);

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
    else if (fishingSession.currentScreen === "fishingStage") openStageSelect();
    else if (fishingSession.currentScreen === "stageSelect") openLobby();
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
