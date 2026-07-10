import {
  state,
  getTotalClickPower,
  getTotalAutoIncome
} from "./state.js";

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
    document.getElementById("gameMenuPanel"),

  upgradeMenuBtn:
    document.getElementById(
      "upgradeMenuBtn"
    ),

  upgradeSubMenu:
    document.getElementById(
      "upgradeSubMenu"
    )
};

export function updateMainUI() {
  elements.moneyText.textContent =
    formatMoney(state.money);

  elements.levelText.textContent =
    state.level;

  elements.clickPowerText.textContent =
    formatMoney(getTotalClickPower());

  elements.autoIncomeText.textContent =
    `${formatMoney(getTotalAutoIncome())} / 초`;

  elements.clickUpgradeCostText.textContent =
    `비용: ${formatMoney(
      state.clickUpgradeCost
    )}`;

  elements.autoUpgradeCostText.textContent =
    `비용: ${formatMoney(
      state.autoUpgradeCost
    )}`;

  elements.levelUpCostText.textContent =
    `비용: ${formatMoney(
      state.levelUpCost
    )}`;

  elements.clickUpgradeBtn.disabled =
    state.money < state.clickUpgradeCost;

  elements.autoUpgradeBtn.disabled =
    state.money < state.autoUpgradeCost;

  elements.levelUpBtn.disabled =
    state.money < state.levelUpCost;
}

export function initializeMainMenu() {
  elements.gameMenuBtn.addEventListener(
    "click",
    function (event) {
      event.stopPropagation();

      elements.gameMenuPanel.classList.toggle(
        "hidden"
      );
    }
  );

  elements.upgradeMenuBtn.addEventListener(
    "click",
    function (event) {
      event.stopPropagation();

      elements.upgradeSubMenu.classList.toggle(
        "hidden"
      );
    }
  );

  elements.gameMenuPanel.addEventListener(
    "click",
    function (event) {
      event.stopPropagation();
    }
  );
}

export function formatMoney(value) {
  const number =
    Math.floor(Number(value) || 0);

  if (number >= 100000000) {
    return `${removeTrailingZeros(
      (number / 100000000).toFixed(2)
    )}억`;
  }

  if (number >= 10000) {
    return `${removeTrailingZeros(
      (number / 10000).toFixed(2)
    )}만`;
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