import {
  AUTO_SAVE_INTERVAL
} from "./config.js";

import {
  state,
  getTotalClickPower,
  getTotalAutoIncome
} from "./state.js";

import {
  loadGameData,
  saveGameData,
  applyOfflineReward
} from "./database.js";

import {
  elements,
  initializeMainMenu,
  updateMainUI
} from "./ui.js";

import {
  createCoinEffect
} from "./effects.js";

import {
  initializeUpgrade
} from "./upgrade.js";

//import {
  //initializeJob,
 // updateJobUI
//} from "./job.js";

let isGameStarted = false;
let incomeTimer = null;
let saveTimer = null;

initializeMainMenu();
initializeUpgrade();
//initializeJob();

elements.startBtn.addEventListener(
  "click",
  startGame
);

elements.homeBtn.addEventListener(
  "click",
  returnHome
);

elements.clickArea.addEventListener(
  "click",
  earnMoneyByClick
);

async function startGame() {
  state.username =
    localStorage.getItem("hyojongUser") ||
    "guest";

  elements.startBtn.disabled = true;
  elements.startBtn.textContent =
    "불러오는 중...";

  try {
    const loadResult =
      await loadGameData();

    await applyOfflineReward(
      loadResult.lastSavedAt
    );

    elements.startScreen.classList.add(
      "hidden"
    );

    elements.gameScreen.classList.remove(
      "hidden"
    );

    isGameStarted = true;

    updateMainUI();
    //updateJobUI();

    startIncomeTimer();
    startSaveTimer();
  } catch (error) {
    console.error(
      "게임 시작 오류:",
      error
    );

    alert(
      "게임 데이터를 불러오지 못했습니다."
    );
  } finally {
    elements.startBtn.disabled = false;
    elements.startBtn.textContent =
      "게임시작";
  }
}

function earnMoneyByClick(event) {
  if (!isGameStarted) return;

  state.money += getTotalClickPower();

  createCoinEffect(
    event.clientX,
    event.clientY
  );

  updateMainUI();
 // updateJobUI();
}

function startIncomeTimer() {
  if (incomeTimer) {
    clearInterval(incomeTimer);
  }

  incomeTimer = setInterval(
    function () {
      if (!isGameStarted) return;

      state.money +=
        getTotalAutoIncome();

      updateMainUI();
    //  updateJobUI();
    },
    1000
  );
}

function startSaveTimer() {
  if (saveTimer) {
    clearInterval(saveTimer);
  }

  saveTimer = setInterval(
    function () {
      if (!isGameStarted) return;

      saveGameData();
    },
    AUTO_SAVE_INTERVAL
  );
}

async function returnHome() {
  if (isGameStarted) {
    await saveGameData();
  }

  location.href = "../../index.html";
}

document.addEventListener(
  "visibilitychange",
  function () {
    if (
      document.visibilityState ===
        "hidden" &&
      isGameStarted
    ) {
      saveGameData();
    }
  }
);