import { state } from "./state.js";
import { elements, updateMainUI } from "./ui.js";
import { saveGameData } from "./database.js";

export function initializeUpgrade() {
  elements.clickUpgradeBtn.addEventListener(
    "click",
    upgradeClickPower
  );

  elements.autoUpgradeBtn.addEventListener(
    "click",
    upgradeAutoIncome
  );

  elements.levelUpBtn.addEventListener(
    "click",
    upgradeMainLevel
  );
}

async function upgradeClickPower(event) {
  event.stopPropagation();

  if (
    state.money <
    state.clickUpgradeCost
  ) {
    return;
  }

  state.money -= state.clickUpgradeCost;
  state.clickUpgradeLevel++;

  state.baseClickPower +=
    1 +
    Math.floor(
      state.clickUpgradeLevel / 5
    );

  state.clickUpgradeCost =
    Math.floor(
      state.clickUpgradeCost * 1.35
    );

  updateMainUI();
  await saveGameData();
}

async function upgradeAutoIncome(event) {
  event.stopPropagation();

  if (
    state.money <
    state.autoUpgradeCost
  ) {
    return;
  }

  state.money -= state.autoUpgradeCost;
  state.autoUpgradeLevel++;

  state.baseAutoIncome +=
    1 +
    Math.floor(
      state.autoUpgradeLevel / 4
    );

  state.autoUpgradeCost =
    Math.floor(
      state.autoUpgradeCost * 1.4
    );

  updateMainUI();
  await saveGameData();
}

async function upgradeMainLevel(event) {
  event.stopPropagation();

  if (
    state.money <
    state.levelUpCost
  ) {
    return;
  }

  state.money -= state.levelUpCost;
  state.level++;

  state.levelUpCost =
    Math.floor(
      state.levelUpCost * 1.8
    );

  updateMainUI();
  await saveGameData();
}