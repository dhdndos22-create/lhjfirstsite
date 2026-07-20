import {
  getLoggedInUsername,
  requireHyojongLogin,
  watchHyojongLogin
} from "./fishing-auth.js";

const startScreen = document.getElementById("startScreen");
const lobbyScreen = document.getElementById("lobbyScreen");

const startButton = document.getElementById("startButton");
const menuButton = document.getElementById("menuButton");
const fishingButton = document.getElementById("fishingButton");

const levelStatusButton = document.getElementById("levelStatusButton");
const goldStatusButton = document.getElementById("goldStatusButton");
const energyStatusButton = document.getElementById("energyStatusButton");

const playerLevel = document.getElementById("playerLevel");
const playerGold = document.getElementById("playerGold");
const playerEnergy = document.getElementById("playerEnergy");
const levelExperience = document.getElementById("levelExperience");
const levelProgressFill = document.getElementById("levelProgressFill");

const bubbleLayer = document.getElementById("bubbleLayer");

const PRESS_DURATION = 170;
const SCREEN_CHANGE_DELAY = 180;
const BUBBLE_COUNT_MIN = 7;
const BUBBLE_COUNT_MAX = 11;

let isOpeningLobby = false;

/*
  이후 Supabase 저장 데이터를 연결하면 이 값을 서버 데이터로 교체한다.
*/
export const playerState = {
  level: 1,
  currentExp: 30,
  requiredExp: 100,
  gold: 12500,
  energy: 80,
  maxEnergy: 100
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
    lobby: lobbyScreen
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
  maxEnergy
}) {
  playerLevel.textContent = String(level);
  playerGold.textContent = Number(gold).toLocaleString("ko-KR");
  playerEnergy.textContent = `${energy} / ${maxEnergy}`;
  levelExperience.textContent = `${currentExp} / ${requiredExp}`;

  const progress =
    requiredExp > 0
      ? Math.min(100, Math.max(0, currentExp / requiredExp * 100))
      : 0;

  levelProgressFill.style.width = `${progress}%`;
}

function openLobby() {
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
    alert(`에너지: ${playerState.energy} / ${playerState.maxEnergy}`);
  }, 100);
});

bindBubbleButton(menuButton, () => {});

bindBubbleButton(fishingButton, () => {
  window.setTimeout(() => {
    alert("낚시 화면은 다음 단계에서 연결할 예정입니다.");
  }, 120);
});

updateLobbyStatus(playerState);
initializeFishingLogin();


/* =========================
   레이어형 캐릭터 장비 시스템
========================= */

const characterButton = document.getElementById("characterButton");
const equipmentPanel = document.getElementById("equipmentPanel");
const equipmentCloseButton = document.getElementById("equipmentCloseButton");
const equipmentSlots = [...document.querySelectorAll(".equipment-slot")];
const equipmentOptions = document.getElementById("equipmentOptions");

const characterLayers = {
  head: document.getElementById("playerHeadLayer"),
  top: document.getElementById("playerTopLayer"),
  bottom: document.getElementById("playerBottomLayer"),
  shoes: document.getElementById("playerShoesLayer"),
  rod: document.getElementById("playerRodLayer")
};

const equippedNameElements = {
  head: document.getElementById("equippedHeadName"),
  top: document.getElementById("equippedTopName"),
  bottom: document.getElementById("equippedBottomName"),
  shoes: document.getElementById("equippedShoesName"),
  rod: document.getElementById("equippedRodName")
};

const EQUIPMENT = {
  head: {
    "head-none": {
      name: "착용 안 함",
      image: "./images/player/head/head-none.png"
    },
    "head-cap-001": {
      name: "초보 낚시 모자",
      image: "./images/player/head/head-cap-001.png"
    }
  },
  top: {
    "top-none": {
      name: "기본 민소매",
      image: "./images/player/top/top-none.png"
    },
    "top-vest-001": {
      name: "초보 낚시 조끼",
      image: "./images/player/top/top-vest-001.png"
    }
  },
  bottom: {
    "bottom-none": {
      name: "기본 하의",
      image: "./images/player/bottom/bottom-none.png"
    },
    "bottom-shorts-001": {
      name: "초보 반바지",
      image: "./images/player/bottom/bottom-shorts-001.png"
    }
  },
  shoes: {
    "shoes-none": {
      name: "맨발",
      image: "./images/player/shoes/shoes-none.png"
    },
    "shoes-sneakers-001": {
      name: "초보 운동화",
      image: "./images/player/shoes/shoes-sneakers-001.png"
    }
  },
  rod: {
    "rod-none": {
      name: "낚싯대 없음",
      image: "./images/player/rod/rod-none.png"
    },
    "rod-basic-001": {
      name: "초보 낚싯대",
      image: "./images/player/rod/rod-basic-001.png"
    }
  }
};

const DEFAULT_EQUIPPED_ITEMS = {
  head: "head-cap-001",
  top: "top-vest-001",
  bottom: "bottom-shorts-001",
  shoes: "shoes-sneakers-001",
  rod: "rod-basic-001"
};

let equippedItems = { ...DEFAULT_EQUIPPED_ITEMS };
let selectedEquipmentSlot = "head";

function getEquipmentSaveKey() {
  return `fishingEquipment:${fishingSession.username || "guest"}`;
}

function loadEquippedItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(getEquipmentSaveKey()));

    if (saved && typeof saved === "object") {
      Object.keys(DEFAULT_EQUIPPED_ITEMS).forEach((slot) => {
        if (EQUIPMENT[slot]?.[saved[slot]]) {
          equippedItems[slot] = saved[slot];
        }
      });
    }
  } catch (error) {
    console.warn("장비 저장 데이터를 읽지 못했습니다.", error);
  }
}

function saveEquippedItems() {
  localStorage.setItem(getEquipmentSaveKey(), JSON.stringify(equippedItems));
}

function renderEquippedCharacter() {
  Object.entries(equippedItems).forEach(([slot, itemId]) => {
    const layer = characterLayers[slot];
    const item = EQUIPMENT[slot]?.[itemId];

    if (!layer || !item) {
      return;
    }

    layer.src = item.image;
    equippedNameElements[slot].textContent = item.name;
  });
}

function equipItem(slot, itemId) {
  if (!EQUIPMENT[slot]?.[itemId]) {
    console.error(`존재하지 않는 장비: ${slot}/${itemId}`);
    return;
  }

  equippedItems[slot] = itemId;
  renderEquippedCharacter();
  saveEquippedItems();
  renderEquipmentOptions(slot);
}

function renderEquipmentOptions(slot) {
  selectedEquipmentSlot = slot;
  equipmentOptions.replaceChildren();

  equipmentSlots.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.slot === slot);
  });

  Object.entries(EQUIPMENT[slot]).forEach(([itemId, item]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "equipment-option";
    button.textContent = item.name;

    if (equippedItems[slot] === itemId) {
      button.classList.add("is-equipped");
    }

    button.addEventListener("click", () => {
      pressButton(characterButton);
      equipItem(slot, itemId);
    });

    equipmentOptions.appendChild(button);
  });
}

function openEquipmentPanel(initialSlot = "head") {
  renderEquipmentOptions(initialSlot);
  equipmentPanel.classList.add("is-open");
  equipmentPanel.setAttribute("aria-hidden", "false");
}

function closeEquipmentPanel() {
  equipmentPanel.classList.remove("is-open");
  equipmentPanel.setAttribute("aria-hidden", "true");
}

equipmentSlots.forEach((button) => {
  button.addEventListener("click", () => {
    renderEquipmentOptions(button.dataset.slot);
  });
});

characterButton.addEventListener("click", () => {
  playBubbleEffect(characterButton);
  openEquipmentPanel("head");
});

equipmentCloseButton.addEventListener("click", closeEquipmentPanel);

equipmentPanel.addEventListener("click", (event) => {
  if (event.target === equipmentPanel) {
    closeEquipmentPanel();
  }
});

/* 기존 메뉴 버튼도 장비창을 열도록 연결 */
menuButton.addEventListener("click", () => {
  openEquipmentPanel(selectedEquipmentSlot);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeEquipmentPanel();
  }
});

loadEquippedItems();
renderEquippedCharacter();
