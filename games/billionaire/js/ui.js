import {
  state,
  getTotalClickPower,
  getTotalAutoIncome
} from "./state.js";

import {
  GAME_BALANCE,
  CONTENT_UNLOCK_LEVELS
} from "./config.js";

/* =========================
   HTML 요소
========================= */

export const elements = {
  startScreen:
    document.getElementById("startScreen"),

  gameScreen:
    document.getElementById("gameScreen"),

  startBtn:
    document.getElementById("startBtn"),

  homeBtn:
    document.getElementById("homeBtn"),

  clickArea:
    document.getElementById("clickArea"),

  moneyText:
    document.getElementById("moneyText"),

  levelText:
    document.getElementById("levelText"),

  clickPowerText:
    document.getElementById("clickPowerText"),

  autoIncomeText:
    document.getElementById("autoIncomeText"),

  clickUpgradeBtn:
    document.getElementById("clickUpgradeBtn"),

  autoUpgradeBtn:
    document.getElementById("autoUpgradeBtn"),

  levelUpBtn:
    document.getElementById("levelUpBtn"),

  clickUpgradeIncreaseText:
    document.getElementById(
      "clickUpgradeIncreaseText"
    ),

  autoUpgradeIncreaseText:
    document.getElementById(
      "autoUpgradeIncreaseText"
    ),

  clickUpgradeCostText:
    document.getElementById(
      "clickUpgradeCostText"
    ),

  autoUpgradeCostText:
    document.getElementById(
      "autoUpgradeCostText"
    ),

  levelUpCostText:
    document.getElementById(
      "levelUpCostText"
    ),

  gameMenuBtn:
    document.getElementById("gameMenuBtn"),

  gameMenuPanel:
    document.getElementById(
      "gameMenuPanel"
    ),

  upgradeMenuBtn:
    document.getElementById(
      "upgradeMenuBtn"
    ),

  upgradeSubMenu:
    document.getElementById(
      "upgradeSubMenu"
    )
};

/* =========================
   강화 증가량 계산
========================= */

function calculateUpgradeIncrease(
  currentValue,
  increaseRate,
  minimumIncrease
) {
  return Math.max(
    Number(minimumIncrease) || 1,

    Math.ceil(
      Number(currentValue || 0) *
      Number(increaseRate || 0)
    )
  );
}

/* =========================
   콘텐츠 잠금 상태
========================= */

function setMenuLockState(
  button,
  requiredLevel,
  unlockedText,
  lockedText
) {
  if (!button) {
    return;
  }

  const unlocked =
    state.level >= requiredLevel;

  button.disabled = !unlocked;

  button.classList.toggle(
    "lockedMenuItem",
    !unlocked
  );

  button.innerHTML = unlocked
    ? unlockedText
    : `
      🔒 ${lockedText}
      <span class="unlockLevelGuide">
        Lv.${requiredLevel} 해금
      </span>
    `;
}

export function updateContentUnlockUI() {
  setMenuLockState(
    document.getElementById(
      "gamblingMenuBtn"
    ),
    CONTENT_UNLOCK_LEVELS.GAMBLING,
    "🎰 도박",
    "도박"
  );

  setMenuLockState(
    document.getElementById(
      "jobMenuBtn"
    ),
    CONTENT_UNLOCK_LEVELS.JOB,
    "💼 직업",
    "직업"
  );

  setMenuLockState(
    document.getElementById(
      "buildingMenuBtn"
    ),
    CONTENT_UNLOCK_LEVELS.BUILDING,
    "💼 사업",
    "사업"
  );

  setMenuLockState(
    document.getElementById(
      "employeeMenuBtn"
    ),
    CONTENT_UNLOCK_LEVELS.EMPLOYEE,
    "👷 알바 고용",
    "알바 고용"
  );

  setMenuLockState(
    document.getElementById("petMenuBtn"),
    CONTENT_UNLOCK_LEVELS.PET,
    "🐾 펫",
    "펫"
  );
}

/* =========================
   메인 UI 갱신
========================= */

export function updateMainUI() {
  const totalClickPower =
    getTotalClickPower();

  const totalAutoIncome =
    getTotalAutoIncome();

  /*
    실제 강화 코드에서는 기본 수입만 증가시킨다.
    따라서 표시되는 증가량도 기본 수입을 기준으로 계산한다.
  */
  const clickIncrease =
    calculateUpgradeIncrease(
      state.baseClickPower,
      GAME_BALANCE
        .CLICK_UPGRADE
        .INCREASE_RATE,
      GAME_BALANCE
        .CLICK_UPGRADE
        .MIN_INCREASE
    );

  const autoIncrease =
    calculateUpgradeIncrease(
      state.baseAutoIncome,
      GAME_BALANCE
        .AUTO_UPGRADE
        .INCREASE_RATE,
      GAME_BALANCE
        .AUTO_UPGRADE
        .MIN_INCREASE
    );

  elements.moneyText.textContent =
    formatMoney(state.money);

  elements.levelText.textContent =
    `${state.level} / ${
      GAME_BALANCE.LEVEL.MAX_LEVEL
    }`;

  elements.clickPowerText.textContent =
    formatMoney(totalClickPower);

  elements.autoIncomeText.textContent =
    `${formatMoney(
      totalAutoIncome
    )} / 초`;

  /*
    강화 시 증가량 표시
  */
  if (
    elements.clickUpgradeIncreaseText
  ) {
    elements.clickUpgradeIncreaseText
      .textContent =
      `▲ ${formatMoney(
        clickIncrease
      )} 증가`;
  }

  if (
    elements.autoUpgradeIncreaseText
  ) {
    elements.autoUpgradeIncreaseText
      .textContent =
      `▲ ${formatMoney(
        autoIncrease
      )} / 초 증가`;
  }

  elements.clickUpgradeCostText
    .textContent =
    `비용: ${formatMoney(
      state.clickUpgradeCost
    )}`;

  elements.autoUpgradeCostText
    .textContent =
    `비용: ${formatMoney(
      state.autoUpgradeCost
    )}`;

  const isMaxLevel =
    state.level >=
    GAME_BALANCE.LEVEL.MAX_LEVEL;

  elements.levelUpCostText.textContent =
    isMaxLevel
      ? "최대 레벨 달성"
      : `비용: ${formatMoney(
          state.levelUpCost
        )}`;

  elements.clickUpgradeBtn.disabled =
    state.money <
    state.clickUpgradeCost;

  elements.autoUpgradeBtn.disabled =
    state.money <
    state.autoUpgradeCost;

  elements.levelUpBtn.disabled =
    isMaxLevel ||
    state.money <
      state.levelUpCost;

  updateContentUnlockUI();
}

/* =========================
   메인 메뉴 초기화
========================= */

export function initializeMainMenu() {
  elements.gameMenuBtn.addEventListener(
    "click",
    function (event) {
      event.stopPropagation();

      elements.gameMenuPanel
        .classList.toggle("hidden");
    }
  );

  elements.upgradeMenuBtn
    .addEventListener(
      "click",
      function (event) {
        event.stopPropagation();

        elements.upgradeSubMenu
          .classList.toggle("hidden");
      }
    );

  elements.gameMenuPanel
    .addEventListener(
      "click",
      function (event) {
        event.stopPropagation();
      }
    );
}

/* =========================
   금액 표시
========================= */

export function formatMoney(value) {
  const number =
    Math.floor(
      Number(value) || 0
    );

  if (
    number >=
    1000000000000
  ) {
    return `${
      removeTrailingZeros(
        (
          number /
          1000000000000
        ).toFixed(2)
      )
    }조`;
  }

  if (
    number >=
    100000000
  ) {
    return `${
      removeTrailingZeros(
        (
          number /
          100000000
        ).toFixed(2)
      )
    }억`;
  }

  if (number >= 10000) {
    return `${
      removeTrailingZeros(
        (
          number /
          10000
        ).toFixed(2)
      )
    }만`;
  }

  return `${number.toLocaleString()}원`;
}

export function formatPlainNumber(value) {
  return Math.floor(
    Number(value) || 0
  ).toLocaleString();
}

function removeTrailingZeros(value) {
  return value
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}