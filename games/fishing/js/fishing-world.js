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
import { FISH_DATA, getFishByStage } from "./data/fish.js";
import { STAGE_DATA, getStageById } from "./data/stages.js";
import { EQUIPMENT_DATA } from "./data/equipment.js";
import { SHOP_PRODUCT_DATA } from "./data/shop-products.js";
import {
  playerSave,
  replacePlayerSave,
  getPlayerStatusView,
  addCaughtFish,
  addExp,
  sellInventoryFish,
  claimFishCollectionReward,
  spendGold
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

const fishDetailModal = document.getElementById("fishDetailModal");
const fishDetailCloseButton = document.getElementById("fishDetailCloseButton");
const fishDetailImage = document.getElementById("fishDetailImage");
const fishDetailRarity = document.getElementById("fishDetailRarity");
const fishDetailName = document.getElementById("fishDetailName");
const fishDetailDescription = document.getElementById("fishDetailDescription");
const fishDetailSize = document.getElementById("fishDetailSize");
const fishDetailPrice = document.getElementById("fishDetailPrice");
const fishDetailCollectionCount = document.getElementById("fishDetailCollectionCount");
const fishDetailInventoryCount = document.getElementById("fishDetailInventoryCount");
const fishSellArea = document.getElementById("fishSellArea");
const fishSellMinusButton = document.getElementById("fishSellMinusButton");
const fishSellPlusButton = document.getElementById("fishSellPlusButton");
const fishSellAllButton = document.getElementById("fishSellAllButton");
const fishSellQuantity = document.getElementById("fishSellQuantity");
const fishSellButton = document.getElementById("fishSellButton");
const fishSellTotalPrice = document.getElementById("fishSellTotalPrice");


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
  requiredExp: 30,
  gold: GAME_CONFIG.initialGold,
  ruby: GAME_CONFIG.initialRuby
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
        <span class="level-experience" data-level-experience>0%</span>
      </button>

      <button class="status-button gold-status" type="button" data-status-action="gold" aria-label="보유 골드">
        <img src="./images/gold-status-ui-new.png" class="status-ui-image" alt="" draggable="false">
        <span class="gold-number" data-player-gold>0</span>
      </button>

      <button class="status-button ruby-status" type="button" data-status-action="ruby" aria-label="보유 루비">
        <img src="./images/ruby-status-ui-new.png" class="status-ui-image" alt="" draggable="false">
        <span class="ruby-number" data-player-ruby>0</span>
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
        ruby: `현재 루비는 ${playerState.ruby.toLocaleString("ko-KR")}개입니다.`
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
  const progress = playerState.level >= GAME_CONFIG.maxLevel
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          playerState.requiredExp > 0
            ? (playerState.currentExp / playerState.requiredExp) * 100
            : 0
        )
      );
  const expText = playerState.level >= GAME_CONFIG.maxLevel
    ? "MAX"
    : `${Math.floor(progress)}%`;

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
  document.querySelectorAll("[data-player-ruby]").forEach((node) => {
    node.textContent = playerState.ruby.toLocaleString("ko-KR");
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

function getInventoryFishCount(fishId) {
  return Math.max(0, Number(playerSave.inventory?.fish?.[fishId]) || 0);
}

const fishDetailState = {
  fish: null,
  mode: "collection",
  quantity: 1
};

function closeFishDetailModal() {
  fishDetailModal.hidden = true;
  document.body.classList.remove("has-modal-open");
  fishDetailState.fish = null;
}

function updateFishSellView() {
  const fish = fishDetailState.fish;
  if (!fish) return;

  const owned = getInventoryFishCount(fish.id);
  fishDetailState.quantity = Math.min(
    Math.max(1, fishDetailState.quantity),
    Math.max(1, owned)
  );

  fishSellQuantity.textContent = fishDetailState.quantity.toLocaleString("ko-KR");
  fishSellTotalPrice.textContent =
    `${(fish.baseGold * fishDetailState.quantity).toLocaleString("ko-KR")} G`;

  fishSellMinusButton.disabled = fishDetailState.quantity <= 1;
  fishSellPlusButton.disabled = fishDetailState.quantity >= owned;
  fishSellButton.disabled = owned < 1;
}

function openFishDetailModal(fish, mode = "collection") {
  const collectionCount = getCollectionCount(fish.id);
  const inventoryCount = getInventoryFishCount(fish.id);

  fishDetailState.fish = fish;
  fishDetailState.mode = mode;
  fishDetailState.quantity = 1;

  fishDetailModal.dataset.rarity = fish.rarity;
  fishDetailImage.src = fish.image;
  fishDetailImage.alt = fish.name;
  fishDetailRarity.textContent = RARITY_LABELS[fish.rarity] ?? fish.rarity;
  fishDetailName.textContent = fish.name;
  fishDetailDescription.textContent = fish.description;
  fishDetailSize.textContent = `${fish.minSize}~${fish.maxSize}cm`;
  fishDetailPrice.textContent = `${fish.baseGold.toLocaleString("ko-KR")} G`;
  fishDetailCollectionCount.textContent = `${collectionCount.toLocaleString("ko-KR")}회`;
  fishDetailInventoryCount.textContent = `${inventoryCount.toLocaleString("ko-KR")}마리`;

  // 도감에서는 판매 기능을 숨기고, 인벤토리에서만 판매할 수 있습니다.
  fishSellArea.hidden = mode !== "inventory" || inventoryCount < 1;
  updateFishSellView();

  fishDetailModal.hidden = false;
  document.body.classList.add("has-modal-open");
  fishDetailCloseButton.focus();
}

function renderFishInventory(panel) {
  panel.hidePagination();

  const ownedFish = Object.entries(playerSave.inventory?.fish ?? {})
    .map(([fishId, count]) => ({
      fish: FISH_DATA[fishId],
      count: Math.max(0, Number(count) || 0)
    }))
    .filter(({ fish, count }) => fish && count > 0)
    .sort((a, b) => {
      const rarityDifference =
        RARITY_ORDER.indexOf(b.fish.rarity) - RARITY_ORDER.indexOf(a.fish.rarity);
      return rarityDifference || a.fish.name.localeCompare(b.fish.name, "ko");
    });

  if (ownedFish.length === 0) {
    panel.renderEmpty(
      `<strong>보유한 물고기가 없습니다.</strong><br>낚시에서 잡은 물고기는 자동으로 이곳에 추가됩니다.`
    );
    return;
  }

  const wrapper = document.createElement("section");
  wrapper.className = "fish-inventory-view";

  const summary = document.createElement("div");
  summary.className = "fish-inventory-summary";
  const totalCount = ownedFish.reduce((sum, entry) => sum + entry.count, 0);
  summary.innerHTML = `
    <div><span>보유 어종</span><strong>${ownedFish.length}종</strong></div>
    <div><span>총 수량</span><strong>${totalCount.toLocaleString("ko-KR")}마리</strong></div>
  `;
  wrapper.appendChild(summary);

  const grid = document.createElement("div");
  grid.className = "fish-inventory-grid";

  ownedFish.forEach(({ fish, count }) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `fish-inventory-card rarity-${fish.rarity}`;
    card.innerHTML = `
      <span class="fish-inventory-image">
        <img src="${fish.image}" alt="${fish.name}" draggable="false">
      </span>
      <span class="fish-inventory-info">
        <strong>${fish.name}</strong>
        <small>${RARITY_LABELS[fish.rarity]}</small>
        <span>보유 ${count.toLocaleString("ko-KR")}마리</span>
        <em>개당 ${fish.baseGold.toLocaleString("ko-KR")} G</em>
      </span>
    `;
    card.addEventListener("click", () => openFishDetailModal(fish, "inventory"));
    grid.appendChild(card);
  });

  wrapper.appendChild(grid);
  panel.setBody(wrapper);
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
      const isDiscovered = count > 0;
      const card = document.createElement("article");

      card.className =
        `collection-card rarity-${fish.rarity}` +
        (isDiscovered ? " is-discovered" : " is-undiscovered");

      card.dataset.fishId = fish.id;
      card.dataset.discovered = String(isDiscovered);

      card.innerHTML = `
        <div class="collection-image-frame">
          <img
            src="${fish.image}"
            alt="${isDiscovered ? fish.name : "아직 발견하지 못한 생물"}"
            draggable="false"
          >
          <span class="collection-count">
            ${isDiscovered ? `× ${count}` : "미획득"}
          </span>
        </div>
        <button
          type="button"
          class="collection-reward-button"
          data-collection-reward="${fish.id}"
          ${!isDiscovered || playerSave.fishCollection?.[fish.id]?.rewardClaimed === true ? "disabled" : ""}
        >
          ${!isDiscovered
            ? "미발견"
            : playerSave.fishCollection?.[fish.id]?.rewardClaimed === true
              ? "보상 수령완료"
              : "보상받기 +10 루비"}
        </button>
        <div class="collection-card-info">
          <strong class="collection-fish-name">
            ${isDiscovered ? fish.name : "???"}
          </strong>
          <span class="collection-fish-size">
            ${isDiscovered ? `${fish.minSize}~${fish.maxSize}cm` : "크기 ???"}
          </span>
        </div>
      `;

      const rewardButton = card.querySelector("[data-collection-reward]");
      rewardButton?.addEventListener("keydown", (event) => {
        event.stopPropagation();
      });

      rewardButton?.addEventListener("click", (event) => {
        event.stopPropagation();

        const claimed = claimFishCollectionReward(fish.id, 10);
        if (!claimed) return;

        savePlayerState();
        updatePlayerStatus();
        renderCollectionPanel(`stage-${stageId}`, panel);
      });

      if (isDiscovered) {
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `${fish.name} 상세보기`);

        card.addEventListener("click", (event) => {
          if (event.target.closest("[data-collection-reward]")) return;
          openFishDetailModal(fish, "collection");
        });

        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFishDetailModal(fish, "collection");
          }
        });
      } else {
        card.setAttribute(
          "aria-label",
          `${RARITY_LABELS[fish.rarity] ?? fish.rarity} 등급의 미발견 생물`
        );
      }

      grid.appendChild(card);
    });

    section.appendChild(grid);
    wrapper.appendChild(section);
  });

  panel.setBody(wrapper);
}


function getOwnedEquipmentCount(equipmentId) {
  return Math.max(0, Number(playerSave.equipment?.owned?.[equipmentId]) || 0);
}

function equipRod(equipmentId) {
  if (getOwnedEquipmentCount(equipmentId) < 1) return false;
  playerSave.equipment.equipped.rod = equipmentId;
  savePlayerState();
  return true;
}

function purchaseShopProduct(product) {
  const equipmentReward = product.rewards?.find((reward) => reward.type === "equipment");
  if (equipmentReward && getOwnedEquipmentCount(equipmentReward.equipmentId) > 0) {
    alert("이미 보유 중인 장비입니다.");
    return false;
  }

  const price = Math.max(0, Number(product.price?.amount) || 0);
  if (product.price?.type === "gold" && !spendGold(price)) {
    alert("골드가 부족합니다.");
    return false;
  }

  for (const reward of product.rewards ?? []) {
    if (reward.type === "equipment") {
      playerSave.equipment.owned[reward.equipmentId] = 1;
    } else if (reward.type === "ruby") {
      playerSave.currency.ruby += Math.max(0, Number(reward.amount) || 0);
      playerSave.statistics.totalRubyEarned += Math.max(0, Number(reward.amount) || 0);
    } else if (reward.type === "item") {
      const itemId = reward.itemId;
      playerSave.inventory.items[itemId] =
        Math.max(0, Number(playerSave.inventory.items[itemId]) || 0) +
        Math.max(0, Number(reward.amount) || 0);
    }
  }

  playerSave.shop.purchaseCounts[product.id] =
    Math.max(0, Number(playerSave.shop.purchaseCounts[product.id]) || 0) + 1;
  savePlayerState();
  updatePlayerStatus();
  return true;
}

function createEquipmentVisual(equipment) {
  const visual = document.createElement("span");
  visual.className = `equipment-card-visual rarity-${equipment.rarity}`;
  if (equipment.image) {
    const image = document.createElement("img");
    image.src = equipment.image;
    image.alt = equipment.name;
    visual.appendChild(image);
  } else {
    visual.textContent = "🎣";
    visual.setAttribute("aria-label", "낚싯대 이미지 준비 중");
  }
  return visual;
}

function renderShopEquipment(panel) {
  const wrapper = document.createElement("div");
  wrapper.className = "equipment-card-list";

  const products = Object.values(SHOP_PRODUCT_DATA).filter((product) => product.category === "equipment");
  products.forEach((product) => {
    const reward = product.rewards?.find((item) => item.type === "equipment");
    const equipment = reward ? EQUIPMENT_DATA[reward.equipmentId] : null;
    if (!equipment) return;

    const owned = getOwnedEquipmentCount(equipment.id) > 0;
    const equipped = playerSave.equipment?.equipped?.rod === equipment.id;
    const card = document.createElement("article");
    card.className = `equipment-product-card rarity-${equipment.rarity}`;
    card.appendChild(createEquipmentVisual(equipment));

    const content = document.createElement("div");
    content.className = "equipment-card-content";
    content.innerHTML = `
      <span class="equipment-card-rarity">${RARITY_LABELS[equipment.rarity] ?? equipment.rarity}</span>
      <strong>${equipment.name}</strong>
      <p>${equipment.description}</p>
      <small>릴링 힘 ${equipment.stats.reelPower} · 제어력 ${equipment.stats.rodControl} · 줄 내구도 ${equipment.stats.lineStrength}</small>
    `;
    card.appendChild(content);

    const action = document.createElement("button");
    action.type = "button";
    action.className = "equipment-card-action";
    action.disabled = owned;
    action.textContent = equipped ? "장착 중" : owned ? "보유 중" : `${product.price.amount.toLocaleString("ko-KR")} 골드`;
    action.addEventListener("click", () => {
      if (!purchaseShopProduct(product)) return;
      renderShopEquipment(panel);
    });
    card.appendChild(action);
    wrapper.appendChild(card);
  });

  panel.setBody(wrapper);
}

function renderEquipmentPanel(panel) {
  const wrapper = document.createElement("div");
  wrapper.className = "equipment-card-list";

  Object.values(EQUIPMENT_DATA)
    .filter((equipment) => getOwnedEquipmentCount(equipment.id) > 0)
    .forEach((equipment) => {
      const equipped = playerSave.equipment?.equipped?.rod === equipment.id;
      const card = document.createElement("article");
      card.className = `equipment-product-card rarity-${equipment.rarity}`;
      card.appendChild(createEquipmentVisual(equipment));

      const content = document.createElement("div");
      content.className = "equipment-card-content";
      content.innerHTML = `
        <span class="equipment-card-rarity">${RARITY_LABELS[equipment.rarity] ?? equipment.rarity}</span>
        <strong>${equipment.name}</strong>
        <p>${equipment.description}</p>
        <small>릴링 힘 ${equipment.stats.reelPower} · 제어력 ${equipment.stats.rodControl} · 줄 내구도 ${equipment.stats.lineStrength}</small>
      `;
      card.appendChild(content);

      const actions = document.createElement("div");
      actions.className = "equipment-card-actions";
      const equipButton = document.createElement("button");
      equipButton.type = "button";
      equipButton.className = "equipment-card-action";
      equipButton.disabled = equipped;
      equipButton.textContent = equipped ? "장착 중" : "장착하기";
      equipButton.addEventListener("click", () => {
        equipRod(equipment.id);
        renderEquipmentPanel(panel);
      });
      actions.appendChild(equipButton);

      const sellButton = document.createElement("button");
      sellButton.type = "button";
      sellButton.className = "equipment-card-action secondary";
      sellButton.disabled = true;
      sellButton.textContent = equipment.sellable === false ? "판매 불가" : "판매 준비 중";
      actions.appendChild(sellButton);
      card.appendChild(actions);
      wrapper.appendChild(card);
    });

  panel.setBody(wrapper);
}

function renderPanelSlot(type, tabId, panel) {
  if (type === "collection") {
    renderCollectionPanel(tabId, panel);
    return;
  }

  if (type === "shop" && tabId === "equipment") {
    renderShopEquipment(panel);
    return;
  }

  if (type === "equipment") {
    renderEquipmentPanel(panel);
    return;
  }

  if (type === "inventory" && tabId === "fish") {
    renderFishInventory(panel);
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

  document.querySelectorAll("[data-fish-modal-close]").forEach((button) => {
    button.addEventListener("click", closeFishDetailModal);
  });
  fishDetailCloseButton.addEventListener("click", closeFishDetailModal);


  fishSellMinusButton.addEventListener("click", () => {
    fishDetailState.quantity -= 1;
    updateFishSellView();
  });

  fishSellPlusButton.addEventListener("click", () => {
    fishDetailState.quantity += 1;
    updateFishSellView();
  });

  fishSellAllButton.addEventListener("click", () => {
    if (!fishDetailState.fish) return;
    fishDetailState.quantity = getInventoryFishCount(fishDetailState.fish.id);
    updateFishSellView();
  });

  fishSellButton.addEventListener("click", () => {
    const fish = fishDetailState.fish;
    if (!fish || fishDetailState.mode !== "inventory") return;

    const sold = sellInventoryFish(
      fish.id,
      fishDetailState.quantity,
      fish.baseGold
    );
    if (!sold) return;

    savePlayerState();
    updatePlayerStatus();
    closeFishDetailModal();

    if (fishingSession.activePanel === "inventory") {
      renderPanelSlot("inventory", commonPanel.currentTab, commonPanel);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!isQuickMenuOpen) return;
    if (quickMenuPanel.contains(event.target) || menuButton.contains(event.target)) return;
    closeQuickMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!fishDetailModal.hidden) {
      closeFishDetailModal();
      return;
    }
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

  // 낚시 성공 처리에서 같은 함수를 호출하면 도감과 인벤토리가 함께 갱신됩니다.
  window.FishingWorldFish = Object.freeze({
    catch(fishId, options = {}) {
      const fish = FISH_DATA[fishId];
      if (!fish) throw new Error(`등록되지 않은 물고기입니다: ${fishId}`);

      const previousRecord = playerSave.fishCollection?.[fishId] ?? null;
      const previousCount = Number(previousRecord?.count ?? previousRecord ?? 0) || 0;
      const previousMaxSize = Number(previousRecord?.maxSize ?? 0) || 0;
      const caughtSize = Math.max(0, Number(options.size) || 0);

      addCaughtFish(fishId, options);
      addExp(options.exp ?? fish.baseExp ?? 0);
      savePlayerState();
      updatePlayerStatus();

      return {
        fish,
        inventoryCount: getInventoryFishCount(fishId),
        collectionCount: getCollectionCount(fishId),
        expGained: Number(options.exp ?? fish.baseExp ?? 0),
        isFirstCatch: previousCount < 1,
        isNewRecord: previousCount > 0 && caughtSize > previousMaxSize,
        previousMaxSize,
        currentMaxSize: Math.max(previousMaxSize, caughtSize)
      };
    }
  });
}

initialize();
