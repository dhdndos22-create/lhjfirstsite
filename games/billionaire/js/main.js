import {
  AUTO_SAVE_INTERVAL
} from "./config.js";

import {
  initializeBuilding,
  updateBuildingUI
} from "./building.js";

import {
  initializeEmployee,
  updateEmployeeUI
} from "./employee.js";

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
  updateMainUI,
  formatMoney
} from "./ui.js";

import {
  createCoinEffect
} from "./effects.js";

import {
  initializeUpgrade,
  calculateLevelUpCost,
  calculateClickUpgradeCost,
  calculateAutoUpgradeCost,
  calculateClickPower,
  calculateAutoIncome
} from "./upgrade.js";

import {
  initializeJob,
  updateJobUI,
  renderJobHistory,
  refreshJobOpportunity
} from "./job.js";

import {
  initializeGambling,
  updateGamblingUI
} from "./gambling.js";

const offlineRewardOverlay =
  document.getElementById(
    "offlineRewardOverlay"
  );

const offlineTimeText =
  document.getElementById(
    "offlineTimeText"
  );

const offlineRewardText =
  document.getElementById(
    "offlineRewardText"
  );

const offlineRewardCloseBtn =
  document.getElementById(
    "offlineRewardCloseBtn"
  );

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
initializeEmployee();

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

offlineRewardCloseBtn.addEventListener(
  "click",
  function () {
    offlineRewardOverlay.classList.add(
      "hidden"
    );
  }
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
      기존 저장값과 관계없이 현재 밸런스 공식으로
      강화 수입과 다음 강화 비용을 보정한다.
    */
    state.baseClickPower = calculateClickPower(
      state.clickUpgradeLevel
    );

    state.baseAutoIncome = calculateAutoIncome(
      state.autoUpgradeLevel
    );

    state.clickUpgradeCost = calculateClickUpgradeCost(
      state.clickUpgradeLevel
    );

    state.autoUpgradeCost = calculateAutoUpgradeCost(
      state.autoUpgradeLevel
    );

    state.levelUpCost =
      calculateLevelUpCost(state.level) ?? 0;

    /* 놓친 10레벨 단위 취업 기회를 복구한다. */
    await refreshJobOpportunity({
      openChoice: false,
      save: false
    });

    /*
      마지막 저장 시점부터 현재까지의
      오프라인 자동 수입을 계산한다.
    */
    const offlineResult =
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
    updateEmployeeUI();
    updateBuildingUI();

    if (offlineResult.reward > 0) {
      showOfflineRewardPopup(
        offlineResult
      );
    }


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
  updateBuildingUI();
  updateEmployeeUI();
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
      updateEmployeeUI();
      updateJobUI();
      updateGamblingUI();
      updateBuildingUI();
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

function showOfflineRewardPopup(
  offlineResult
) {
  offlineTimeText.textContent =
    `비접속 시간: ${formatOfflineTime(
      offlineResult.offlineSeconds
    )}`;

  offlineRewardText.textContent =
    formatMoney(
      offlineResult.reward
    );

  offlineRewardOverlay.classList.remove(
    "hidden"
  );
}

function formatOfflineTime(
  totalSeconds
) {
  const days =
    Math.floor(
      totalSeconds / 86400
    );

  const hours =
    Math.floor(
      (totalSeconds % 86400) / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const seconds =
    totalSeconds % 60;

  const parts = [];

  if (days > 0) {
    parts.push(`${days}일`);
  }

  if (hours > 0) {
    parts.push(`${hours}시간`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}분`);
  }

  if (
    days === 0 &&
    hours === 0
  ) {
    parts.push(`${seconds}초`);
  }

  return parts.join(" ");
}