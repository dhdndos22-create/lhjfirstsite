import {
  getLoggedInUsername,
  requireHyojongLogin,
  watchHyojongLogin
} from "./fishing-auth.js";

import {
  CHARACTER_CATALOG,
  DEFAULT_EQUIPMENT,
  registerCharacterTarget,
  rebuildCharacterEverywhere
} from "./character-composer.js";


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
   안전 장비 장착 및 캐릭터 출력
========================= */

const characterButton = document.getElementById("characterButton");
const lobbyCharacterImage =
  document.getElementById("lobbyCharacterImage");

const equipmentPanel = document.getElementById("equipmentPanel");
const equipmentCloseButton =
  document.getElementById("equipmentCloseButton");
const equipmentSlots =
  [...document.querySelectorAll(".equipment-slot")];
const equipmentOptions =
  document.getElementById("equipmentOptions");

const slotMap = {
  head: "head",
  top: "top",
  bottom: "bottom",
  shoes: "shoes",
  rod: "rodFront"
};

let selectedEquipmentSlot = "head";
let equippedItems = { ...DEFAULT_EQUIPMENT };
let rebuildQueue = Promise.resolve();

function getEquipmentSaveKey() {
  return `fishingEquipmentV2:${fishingSession.username || "guest"}`;
}

function loadEquipmentState() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(getEquipmentSaveKey())
    );

    if (!saved || typeof saved !== "object") {
      return;
    }

    Object.entries(DEFAULT_EQUIPMENT).forEach(([slot, defaultId]) => {
      const savedId = saved[slot];

      equippedItems[slot] =
        CHARACTER_CATALOG[slot]?.[savedId]
          ? savedId
          : defaultId;
    });
  } catch (error) {
    console.warn("장비 저장 데이터를 읽지 못했습니다.", error);
  }
}

function saveEquipmentState() {
  localStorage.setItem(
    getEquipmentSaveKey(),
    JSON.stringify(equippedItems)
  );
}

function queueCharacterRebuild() {
  rebuildQueue = rebuildQueue
    .catch(() => {})
    .then(() => rebuildCharacterEverywhere(equippedItems))
    .catch((error) => {
      console.error("캐릭터 갱신 실패:", error);
    });

  return rebuildQueue;
}

async function equipItem(slot, itemId) {
  if (!CHARACTER_CATALOG[slot]?.[itemId]) {
    console.error(`존재하지 않는 장비: ${slot}/${itemId}`);
    return;
  }

  equippedItems[slot] = itemId;
  saveEquipmentState();

  await queueCharacterRebuild();
  renderEquipmentOptions(selectedEquipmentSlot);
}

function renderEquipmentOptions(uiSlot) {
  selectedEquipmentSlot = uiSlot;
  equipmentOptions.replaceChildren();

  equipmentSlots.forEach((button) => {
    button.classList.toggle(
      "is-selected",
      button.dataset.slot === uiSlot
    );
  });

  const actualSlot = slotMap[uiSlot];
  const items = CHARACTER_CATALOG[actualSlot] ?? {};

  Object.entries(items).forEach(([itemId, item]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "equipment-option";
    button.textContent = item.name;

    if (equippedItems[actualSlot] === itemId) {
      button.classList.add("is-equipped");
      button.textContent += " · 장착 중";
    }

    button.addEventListener("click", async () => {
      button.disabled = true;

      try {
        await equipItem(actualSlot, itemId);
      } finally {
        button.disabled = false;
      }
    });

    equipmentOptions.appendChild(button);
  });

  const guide = document.createElement("p");
  guide.className = "equipment-guide";
  guide.textContent =
    "규격이 맞지 않는 PNG는 자동으로 제외되므로 캐릭터가 깨지지 않습니다. " +
    "신규 장비는 1024×1536 투명 PNG로 등록하세요.";

  equipmentOptions.appendChild(guide);
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

equipmentCloseButton.addEventListener(
  "click",
  closeEquipmentPanel
);

equipmentPanel.addEventListener("click", (event) => {
  if (event.target === equipmentPanel) {
    closeEquipmentPanel();
  }
});

menuButton.addEventListener("click", () => {
  openEquipmentPanel(selectedEquipmentSlot);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeEquipmentPanel();
  }
});

/*
  다른 화면에 캐릭터를 출력할 때도 같은 완성 개체를 사용한다.

  예:
  registerCharacterTarget(
    document.getElementById("profileCharacterImage")
  );

  registerCharacterTarget(
    document.getElementById("fishingCharacterImage")
  );
*/
registerCharacterTarget(lobbyCharacterImage);

loadEquipmentState();
queueCharacterRebuild();
