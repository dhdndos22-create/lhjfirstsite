import {
  GAME_BALANCE
} from "./config.js";

import {
  state
} from "./state.js";

import {
  elements,
  updateMainUI
} from "./ui.js";

import {
  saveGameData
} from "./database.js";

/* =========================
   강화 기능 초기화
========================= */

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

/* =========================
   구간별 증가율 선택
========================= */

function getGrowthByLevel(
  level,
  growthList
) {
  if (level < 10) {
    return growthList[0];
  }

  if (level < 25) {
    return growthList[1];
  }

  if (level < 50) {
    return growthList[2];
  }

  return growthList[3];
}

/* =========================
   클릭 강화
========================= */

async function upgradeClickPower(event) {
  event.stopPropagation();

  if (
    state.money <
    state.clickUpgradeCost
  ) {
    return;
  }

  state.money -=
    state.clickUpgradeCost;

  state.clickUpgradeLevel++;

  const bonusInterval =
    GAME_BALANCE
      .CLICK_UPGRADE
      .BONUS_INTERVAL;

  const increase =
    1 +
    Math.floor(
      state.clickUpgradeLevel /
      bonusInterval
    );

  state.baseClickPower +=
    increase;

  const growth =
    getGrowthByLevel(
      state.clickUpgradeLevel,
      GAME_BALANCE
        .CLICK_UPGRADE
        .GROWTH
    );

  state.clickUpgradeCost =
    Math.max(
      state.clickUpgradeCost + 1,
      Math.floor(
        state.clickUpgradeCost *
        growth
      )
    );

  updateMainUI();

  await saveGameData();
}

/* =========================
   초당 수입 강화
========================= */

async function upgradeAutoIncome(event) {
  event.stopPropagation();

  if (
    state.money <
    state.autoUpgradeCost
  ) {
    return;
  }

  state.money -=
    state.autoUpgradeCost;

  state.autoUpgradeLevel++;

  const bonusInterval =
    GAME_BALANCE
      .AUTO_UPGRADE
      .BONUS_INTERVAL;

  const increase =
    1 +
    Math.floor(
      state.autoUpgradeLevel /
      bonusInterval
    );

  state.baseAutoIncome +=
    increase;

  const growth =
    getGrowthByLevel(
      state.autoUpgradeLevel,
      GAME_BALANCE
        .AUTO_UPGRADE
        .GROWTH
    );

  state.autoUpgradeCost =
    Math.max(
      state.autoUpgradeCost + 1,
      Math.floor(
        state.autoUpgradeCost *
        growth
      )
    );

  updateMainUI();

  await saveGameData();
}

/* =========================
   메인 레벨업
========================= */

async function upgradeMainLevel(event) {
  event.stopPropagation();

  if (
    state.money <
    state.levelUpCost
  ) {
    return;
  }

  state.money -=
    state.levelUpCost;

  state.level++;

  const growth =
    getGrowthByLevel(
      state.level,
      GAME_BALANCE
        .LEVEL
        .GROWTH
    );

  state.levelUpCost =
    Math.max(
      state.levelUpCost + 1,
      Math.floor(
        state.levelUpCost *
        growth
      )
    );

  updateMainUI();

  await saveGameData();
}