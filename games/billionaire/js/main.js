import {
  AUTO_SAVE_INTERVAL
} from "./config.js";

import {
  initializeBuilding,
  updateBuildingUI
} from "./building.js";

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

import {
  initializeJob,
  updateJobUI,
  renderJobHistory
} from "./job.js";

import {
  initializeGambling,
  updateGamblingUI
} from "./gambling.js";

/* =========================
   게임 실행 상태
========================= */

let isGameStarted = false;

let incomeTimer = null;
let saveTimer = null;

/* =========================
   각 기능 초기화
========================= */

initializeMainMenu();
initializeUpgrade();
initializeJob();
initializeGambling();
initializeBuilding();

/* =========================
   기본 이벤트 등록
========================= */

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

/* =========================
   게임 시작
========================= */

async function startGame() {
  state.username =
    localStorage.getItem("hyojongUser") ||
    "guest";

  elements.startBtn.disabled = true;

  elements.startBtn.textContent =
    "불러오는 중...";

  try {
    /*
      Supabase에서 현재 유저의
      게임 데이터를 불러온다.
    */
    const loadResult =
      await loadGameData();

    /*
      마지막 저장 시점부터 현재까지의
      오프라인 자동 수입을 계산한다.
    */
    await applyOfflineReward(
      loadResult.lastSavedAt
    );

    /*
      시작 화면을 숨기고
      실제 게임 화면을 보여준다.
    */
    elements.startScreen.classList.add(
      "hidden"
    );

    elements.gameScreen.classList.remove(
      "hidden"
    );

    isGameStarted = true;

    /*
      불러온 데이터를 기준으로
      모든 화면을 갱신한다.
    */
    updateMainUI();
    updateJobUI();
    renderJobHistory();
    updateGamblingUI();
    updateBuildingUI();

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

/* =========================
   화면 클릭 수입
========================= */

function earnMoneyByClick(event) {
  if (!isGameStarted) {
    return;
  }

  state.money +=
    getTotalClickPower();

  createCoinEffect(
    event.clientX,
    event.clientY
  );

  /*
    보유금이 바뀌었으므로
    강화, 직업, 도박 버튼 상태를 갱신한다.
  */
  updateMainUI();
  updateJobUI();
  updateGamblingUI();
}

/* =========================
   초당 자동 수입
========================= */

function startIncomeTimer() {
  if (incomeTimer) {
    clearInterval(incomeTimer);
  }

  incomeTimer = setInterval(
    function () {
      if (!isGameStarted) {
        return;
      }

      state.money +=
        getTotalAutoIncome();

      updateMainUI();
      updateJobUI();
      updateGamblingUI();
    },
    1000
  );
}

/* =========================
   자동 저장
========================= */

function startSaveTimer() {
  if (saveTimer) {
    clearInterval(saveTimer);
  }

  saveTimer = setInterval(
    function () {
      if (!isGameStarted) {
        return;
      }

      saveGameData();
    },
    AUTO_SAVE_INTERVAL
  );
}

/* =========================
   효종월드로 돌아가기
========================= */

async function returnHome() {
  if (isGameStarted) {
    await saveGameData();
  }

  location.href =
    "../../index.html";
}

/* =========================
   화면을 닫거나 다른 탭으로
   이동할 때 저장 시도
========================= */

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