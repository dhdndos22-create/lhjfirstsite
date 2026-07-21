import {
  getLoggedInUsername,
  requireHyojongLogin,
  watchHyojongLogin
} from "./fishing-auth.js";

const startScreen = document.getElementById("startScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const shopScreen = document.getElementById("shopScreen");

const startButton = document.getElementById("startButton");
const menuButton = document.getElementById("menuButton");
const fishingButton = document.getElementById("fishingButton");
const quickMenuPanel = document.getElementById("quickMenuPanel");
const quickMenuItems = [...document.querySelectorAll(".quick-menu-item")];
const shopBackButton = document.getElementById("shopBackButton");

const levelStatusButton = document.getElementById("levelStatusButton");
const goldStatusButton = document.getElementById("goldStatusButton");
const energyStatusButton = document.getElementById("energyStatusButton");

const playerLevel = document.getElementById("playerLevel");
const playerGold = document.getElementById("playerGold");
const playerEnergy = document.getElementById("playerEnergy");
const levelExperience = document.getElementById("levelExperience");
const levelProgressFill = document.getElementById("levelProgressFill");
const shopPlayerLevel = document.getElementById("shopPlayerLevel");
const shopPlayerGold = document.getElementById("shopPlayerGold");
const shopPlayerEnergy = document.getElementById("shopPlayerEnergy");
const shopLevelExperience = document.getElementById("shopLevelExperience");
const shopLevelProgressFill = document.getElementById("shopLevelProgressFill");
const shopStatusButtons = [...document.querySelectorAll("#shopScreen .status-button")];

const shopCategoryButtons = [...document.querySelectorAll(".shop-category-button")];
const shopItemGrid = document.getElementById("shopItemGrid");
const shopPrevPageButton = document.getElementById("shopPrevPageButton");
const shopNextPageButton = document.getElementById("shopNextPageButton");
const shopPageIndicator = document.getElementById("shopPageIndicator");
const shopItemModal = document.getElementById("shopItemModal");
const shopModalCloseButton = document.getElementById("shopModalCloseButton");
const shopModalBuyButton = document.getElementById("shopModalBuyButton");
const shopModalItemName = document.getElementById("shopModalItemName");
const shopModalItemDescription = document.getElementById("shopModalItemDescription");
const shopModalItemPrice = document.getElementById("shopModalItemPrice");

const bubbleLayer = document.getElementById("bubbleLayer");

const PRESS_DURATION = 170;
const SCREEN_CHANGE_DELAY = 180;
const BUBBLE_COUNT_MIN = 7;
const BUBBLE_COUNT_MAX = 11;

let isOpeningLobby = false;
let isQuickMenuOpen = false;
let activeShopCategory = "currency";
let currentShopPage = 1;
let selectedShopItemId = null;

const SHOP_ITEMS_PER_PAGE = 8;

const SHOP_ITEMS = Object.freeze([
  { id: "energy_5", category: "currency", name: "에너지 5개", price: 500, rewardAmount: 5, description: "구매 즉시 에너지 5개를 획득합니다." },
  { id: "energy_10", category: "currency", name: "에너지 10개", price: 900, rewardAmount: 10, description: "구매 즉시 에너지 10개를 획득합니다." },
  { id: "energy_20", category: "currency", name: "에너지 20개", price: 1700, rewardAmount: 20, description: "구매 즉시 에너지 20개를 획득합니다." },
  { id: "energy_30", category: "currency", name: "에너지 30개", price: 2400, rewardAmount: 30, description: "구매 즉시 에너지 30개를 획득합니다." },
  { id: "energy_50", category: "currency", name: "에너지 50개", price: 3800, rewardAmount: 50, description: "구매 즉시 에너지 50개를 획득합니다." },
  { id: "energy_75", category: "currency", name: "에너지 75개", price: 5400, rewardAmount: 75, description: "구매 즉시 에너지 75개를 획득합니다." },
  { id: "energy_100", category: "currency", name: "에너지 100개", price: 6800, rewardAmount: 100, description: "구매 즉시 에너지 100개를 획득합니다." },
  { id: "energy_150", category: "currency", name: "에너지 150개", price: 9500, rewardAmount: 150, description: "구매 즉시 에너지 150개를 획득합니다." },
  { id: "energy_250", category: "currency", name: "에너지 250개", price: 15000, rewardAmount: 250, description: "구매 즉시 에너지 250개를 획득합니다." },
  { id: "energy_500", category: "currency", name: "에너지 500개", price: 28000, rewardAmount: 500, description: "구매 즉시 에너지 500개를 획득합니다." }
]);

/*
  계정 최초 접속 기본값
  - 레벨: 1 (최대 100)
  - 골드: 0
  - 에너지: 10 (보유 제한 없음)
*/
const DEFAULT_PLAYER_STATE = Object.freeze({
  level: 1,
  currentExp: 0,
  requiredExp: 100,
  gold: 0,
  energy: 10
});

export const playerState = {
  ...DEFAULT_PLAYER_STATE
};

export const fishingSession = {
  username: getLoggedInUsername(),
  currentScreen: "start"
};

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function changeScreen(nextScreenName) {
  const screens = {
    start: startScreen,
    lobby: lobbyScreen,
    shop: shopScreen
  };

  const nextScreen = screens[nextScreenName];

  if (!nextScreen) {
    console.error(`존재하지 않는 화면입니다: ${nextScreenName}`);
    return;
  }

  Object.entries(screens).forEach(([screenName, screenElement]) => {
    const isNextScreen = screenName === nextScreenName;

    screenElement.classList.toggle("is-active", isNextScreen);
    screenElement.setAttribute("aria-hidden", String(!isNextScreen));
  });

  fishingSession.currentScreen = nextScreenName;
}

export function updateLobbyStatus({
  level,
  currentExp,
  requiredExp,
  gold,
  energy,
}) {
  const levelLabel = `Lv. ${level}`;
  const goldLabel = Number(gold).toLocaleString("ko-KR");
  const energyLabel = Number(energy).toLocaleString("ko-KR");
  const expLabel = level >= 100 ? "MAX" : `${currentExp} / ${requiredExp}`;

  playerLevel.textContent = levelLabel;
  playerGold.textContent = goldLabel;
  playerEnergy.textContent = energyLabel;
  levelExperience.textContent = expLabel;

  if (shopPlayerLevel) shopPlayerLevel.textContent = levelLabel;
  if (shopPlayerGold) shopPlayerGold.textContent = goldLabel;
  if (shopPlayerEnergy) shopPlayerEnergy.textContent = energyLabel;
  if (shopLevelExperience) shopLevelExperience.textContent = expLabel;

  const progress =
    requiredExp > 0
      ? Math.min(100, Math.max(0, currentExp / requiredExp * 100))
      : 0;

  levelProgressFill.style.width = `${progress}%`;
  if (shopLevelProgressFill) {
    shopLevelProgressFill.style.width = `${progress}%`;
  }
}

function getPlayerSaveKey() {
  return `fishingPlayer:${fishingSession.username || "guest"}`;
}

function normalizeNonNegativeInteger(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(0, Math.floor(number));
}

function loadPlayerState() {
  try {
    const raw = localStorage.getItem(getPlayerSaveKey());

    if (!raw) {
      Object.assign(playerState, DEFAULT_PLAYER_STATE);
      localStorage.setItem(
        getPlayerSaveKey(),
        JSON.stringify(playerState)
      );
      return;
    }

    const saved = JSON.parse(raw);

    playerState.level = Math.min(
      100,
      Math.max(1, normalizeNonNegativeInteger(saved.level, 1))
    );
    playerState.currentExp = normalizeNonNegativeInteger(saved.currentExp, 0);
    playerState.requiredExp = Math.max(
      1,
      normalizeNonNegativeInteger(saved.requiredExp, 100)
    );
    playerState.gold = normalizeNonNegativeInteger(saved.gold, 0);
    playerState.energy = normalizeNonNegativeInteger(saved.energy, 10);
  } catch (error) {
    console.warn("플레이어 저장 데이터를 읽지 못했습니다.", error);
    Object.assign(playerState, DEFAULT_PLAYER_STATE);
  }
}

export function savePlayerState() {
  localStorage.setItem(
    getPlayerSaveKey(),
    JSON.stringify(playerState)
  );
}

function openLobby() {
  loadPlayerState();
  updateLobbyStatus(playerState);
  changeScreen("lobby");
  console.log(`피싱월드 로비 입장: ${fishingSession.username}`);
}

function createBubble(x, y, index) {
  const bubble = document.createElement("span");
  const size = randomBetween(10, 27);
  const duration = randomBetween(620, 1050);
  const rise = randomBetween(70, 145);
  const sway = randomBetween(-34, 34);

  bubble.className = "click-bubble";
  bubble.style.setProperty("--bubble-x", `${x + randomBetween(-62, 62)}px`);
  bubble.style.setProperty("--bubble-y", `${y + randomBetween(-8, 30)}px`);
  bubble.style.setProperty("--bubble-size", `${size}px`);
  bubble.style.setProperty("--bubble-duration", `${duration}ms`);
  bubble.style.setProperty("--bubble-rise", `${rise}px`);
  bubble.style.setProperty("--bubble-sway", `${sway}px`);
  bubble.style.animationDelay = `${index * 18}ms`;

  bubble.addEventListener("animationend", () => bubble.remove(), { once: true });
  bubbleLayer.appendChild(bubble);
}

function playBubbleEffect(button) {
  const screenRect = bubbleLayer.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();

  const centerX = buttonRect.left - screenRect.left + buttonRect.width / 2;
  const centerY = buttonRect.top - screenRect.top + buttonRect.height * 0.65;

  const count = Math.floor(
    randomBetween(BUBBLE_COUNT_MIN, BUBBLE_COUNT_MAX + 1)
  );

  for (let index = 0; index < count; index += 1) {
    createBubble(centerX, centerY, index);
  }
}

function pressButton(button) {
  button.classList.remove("is-pressed");

  void button.offsetWidth;

  button.classList.add("is-pressed");
  playBubbleEffect(button);

  window.setTimeout(() => {
    button.classList.remove("is-pressed");
  }, PRESS_DURATION);
}

function bindBubbleButton(button, onClick) {
  if (!button) {
    return;
  }

  button.addEventListener("pointerdown", () => {
    pressButton(button);
  });

  button.addEventListener("pointerup", () => {
    window.setTimeout(() => {
      button.classList.remove("is-pressed");
    }, 70);
  });

  button.addEventListener("pointercancel", () => {
    button.classList.remove("is-pressed");
  });

  button.addEventListener("pointerleave", (event) => {
    if (event.buttons > 0) {
      button.classList.remove("is-pressed");
    }
  });

  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      pressButton(button);
    }
  });

  button.addEventListener("click", onClick);
}

function getShopItemsByCategory(category) {
  return SHOP_ITEMS.filter((item) => item.category === category);
}

function getShopTotalPages(category = activeShopCategory) {
  const itemCount = getShopItemsByCategory(category).length;
  return Math.max(1, Math.ceil(itemCount / SHOP_ITEMS_PER_PAGE));
}

function createShopItemCard(item) {
  return `
    <article class="shop-item-card" data-item-id="${item.id}" tabindex="0" aria-label="${item.name} 상품 정보 열기">
      <div class="shop-item-image-placeholder" aria-hidden="true">이미지 칸</div>
      <h3 class="shop-item-name">${item.name}</h3>
      <p class="shop-item-price">${item.price.toLocaleString("ko-KR")} 골드</p>
      <button class="shop-item-buy-mini" type="button" data-buy-item-id="${item.id}">구매</button>
    </article>
  `;
}

function renderShopItems() {
  const categoryItems = getShopItemsByCategory(activeShopCategory);
  const totalPages = getShopTotalPages();

  currentShopPage = Math.min(Math.max(1, currentShopPage), totalPages);

  const startIndex = (currentShopPage - 1) * SHOP_ITEMS_PER_PAGE;
  const pageItems = categoryItems.slice(startIndex, startIndex + SHOP_ITEMS_PER_PAGE);

  if (pageItems.length === 0) {
    shopItemGrid.innerHTML = '<p class="shop-empty-state">이 카테고리의 상품은 준비 중입니다.</p>';
  } else {
    shopItemGrid.innerHTML = pageItems.map(createShopItemCard).join("");
  }

  shopPageIndicator.textContent = `${currentShopPage} / ${totalPages}`;
  shopPrevPageButton.disabled = currentShopPage <= 1;
  shopNextPageButton.disabled = currentShopPage >= totalPages;
}

function setShopCategory(category) {
  activeShopCategory = category;
  currentShopPage = 1;

  shopCategoryButtons.forEach((button) => {
    const isActive = button.dataset.category === category;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  renderShopItems();
}

function findShopItem(itemId) {
  return SHOP_ITEMS.find((item) => item.id === itemId) ?? null;
}

function openShopItemModal(itemId) {
  const item = findShopItem(itemId);

  if (!item) {
    return;
  }

  selectedShopItemId = item.id;
  shopModalItemName.textContent = item.name;
  shopModalItemDescription.textContent = item.description;
  shopModalItemPrice.textContent = `${item.price.toLocaleString("ko-KR")} 골드`;
  shopItemModal.classList.add("is-open");
  shopItemModal.setAttribute("aria-hidden", "false");
}

function closeShopItemModal() {
  selectedShopItemId = null;
  shopItemModal.classList.remove("is-open");
  shopItemModal.setAttribute("aria-hidden", "true");
}

function buyShopItem(itemId) {
  const item = findShopItem(itemId);

  if (!item) {
    return;
  }

  if (playerState.gold < item.price) {
    alert(`골드가 부족합니다.\n필요 골드: ${item.price.toLocaleString("ko-KR")}`);
    return;
  }

  playerState.gold -= item.price;
  playerState.energy += item.rewardAmount;
  savePlayerState();
  updateLobbyStatus(playerState);
  closeShopItemModal();

  alert(`${item.name}을 구매했습니다.\n에너지 +${item.rewardAmount}`);
}

function initializeFishingLogin() {
  fishingSession.username = getLoggedInUsername();

  if (fishingSession.username) {
    console.log(`피싱월드 로그인 연결 완료: ${fishingSession.username}`);
  } else {
    console.log("피싱월드 비로그인 상태");
  }

  watchHyojongLogin(() => {
    fishingSession.username = null;
    alert("효종월드에서 로그아웃되어 메인 화면으로 이동합니다.");
    window.location.href = "../../index.html";
  });
}

bindBubbleButton(startButton, () => {
  if (isOpeningLobby) {
    return;
  }

  const username = requireHyojongLogin();

  if (!username) {
    return;
  }

  isOpeningLobby = true;
  fishingSession.username = username;

  window.setTimeout(() => {
    openLobby();
    isOpeningLobby = false;
  }, SCREEN_CHANGE_DELAY);
});

bindBubbleButton(levelStatusButton, () => {
  window.setTimeout(() => {
    alert(
      `레벨 ${playerState.level}\n경험치 ${playerState.currentExp} / ${playerState.requiredExp}`
    );
  }, 100);
});

bindBubbleButton(goldStatusButton, () => {
  window.setTimeout(() => {
    alert(`보유 골드: ${playerState.gold.toLocaleString("ko-KR")}`);
  }, 100);
});

bindBubbleButton(energyStatusButton, () => {
  window.setTimeout(() => {
    alert(`보유 에너지: ${playerState.energy.toLocaleString("ko-KR")}\n낚시 1회당 에너지 1개를 사용합니다.`);
  }, 100);
});

shopStatusButtons.forEach((button) => {
  bindBubbleButton(button, () => {
    const statusType = button.dataset.status;

    window.setTimeout(() => {
      if (statusType === "level") {
        alert(`레벨 ${playerState.level}\n경험치 ${playerState.currentExp} / ${playerState.requiredExp}`);
      } else if (statusType === "gold") {
        alert(`보유 골드: ${playerState.gold.toLocaleString("ko-KR")}`);
      } else if (statusType === "energy") {
        alert(`보유 에너지: ${playerState.energy.toLocaleString("ko-KR")}\n낚시 1회당 에너지 1개를 사용합니다.`);
      }
    }, 100);
  });
});

function setQuickMenuOpen(open) {
  isQuickMenuOpen = open;
  quickMenuPanel.classList.toggle("is-open", open);
  quickMenuPanel.setAttribute("aria-hidden", String(!open));
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "메뉴 닫기" : "메뉴 열기"
  );
}

function toggleQuickMenu() {
  setQuickMenuOpen(!isQuickMenuOpen);
}

bindBubbleButton(menuButton, () => {
  toggleQuickMenu();
});

quickMenuItems.forEach((button) => {
  bindBubbleButton(button, () => {
    const menuType = button.dataset.menu;

    if (menuType === "shop") {
      setQuickMenuOpen(false);
      window.setTimeout(() => {
        renderShopItems();
        changeScreen("shop");
      }, 120);
      return;
    }

    const menuNames = {
      equipment: "장비",
      draw: "뽑기",
      achievement: "업적",
      mail: "우편"
    };

    const menuName = menuNames[menuType] ?? "메뉴";

    window.setTimeout(() => {
      alert(`${menuName} 화면은 다음 단계에서 연결할 예정입니다.`);
    }, 100);
  });
});

shopCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setShopCategory(button.dataset.category);
  });
});

shopPrevPageButton.addEventListener("click", () => {
  if (currentShopPage > 1) {
    currentShopPage -= 1;
    renderShopItems();
  }
});

shopNextPageButton.addEventListener("click", () => {
  const totalPages = getShopTotalPages();

  if (currentShopPage < totalPages) {
    currentShopPage += 1;
    renderShopItems();
  }
});

shopItemGrid.addEventListener("click", (event) => {
  const buyButton = event.target.closest("[data-buy-item-id]");

  if (buyButton) {
    event.stopPropagation();
    openShopItemModal(buyButton.dataset.buyItemId);
    return;
  }

  const card = event.target.closest(".shop-item-card");

  if (card) {
    openShopItemModal(card.dataset.itemId);
  }
});

shopItemGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const card = event.target.closest(".shop-item-card");

  if (card && !event.target.closest("button")) {
    event.preventDefault();
    openShopItemModal(card.dataset.itemId);
  }
});

shopModalCloseButton.addEventListener("click", closeShopItemModal);
shopItemModal.querySelector("[data-modal-close]").addEventListener("click", closeShopItemModal);
shopModalBuyButton.addEventListener("click", () => {
  if (selectedShopItemId) {
    buyShopItem(selectedShopItemId);
  }
});

bindBubbleButton(shopBackButton, () => {
  window.setTimeout(() => {
    changeScreen("lobby");
  }, 100);
});

document.addEventListener("pointerdown", (event) => {
  if (!isQuickMenuOpen) {
    return;
  }

  const clickedInsidePanel = quickMenuPanel.contains(event.target);
  const clickedMenuButton = menuButton.contains(event.target);

  if (!clickedInsidePanel && !clickedMenuButton) {
    setQuickMenuOpen(false);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (shopItemModal.classList.contains("is-open")) {
      closeShopItemModal();
      return;
    }

    setQuickMenuOpen(false);
  }
});

bindBubbleButton(fishingButton, () => {
  window.setTimeout(() => {
    alert("낚시 화면은 다음 단계에서 연결할 예정입니다.");
  }, 120);
});

updateLobbyStatus(playerState);
renderShopItems();
initializeFishingLogin();
