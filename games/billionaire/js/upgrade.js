import {
  GAME_BALANCE,
  CONTENT_UNLOCK_LEVELS,
  calculateLevelUpCost
} from "./config.js";

import { state } from "./state.js";
import { elements, updateMainUI } from "./ui.js";
import { saveGameData } from "./database.js";
import { refreshJobOpportunity } from "./job.js";
import { showUnlockNotification } from "./unlock.js";

export function initializeUpgrade() {
  elements.clickUpgradeBtn.addEventListener("click", upgradeClickPower);
  elements.autoUpgradeBtn.addEventListener("click", upgradeAutoIncome);
  elements.levelUpBtn.addEventListener("click", upgradeMainLevel);
}

function getClickUpgradeGrowth(level) {
  const growth =
    GAME_BALANCE.CLICK_UPGRADE.BASE_GROWTH +
    level * GAME_BALANCE.CLICK_UPGRADE.GROWTH_PER_LEVEL;

  return Math.min(growth, GAME_BALANCE.CLICK_UPGRADE.MAX_GROWTH);
}

function getAutoUpgradeGrowth(level) {
  const growth =
    GAME_BALANCE.AUTO_UPGRADE.BASE_GROWTH +
    level * GAME_BALANCE.AUTO_UPGRADE.GROWTH_PER_LEVEL;

  return Math.min(
    growth,
    GAME_BALANCE.AUTO_UPGRADE.MAX_GROWTH
  );
}

function calculateIncrease(currentValue, increaseRate, minimumIncrease) {
  return Math.max(
    minimumIncrease,
    Math.ceil(Number(currentValue) * Number(increaseRate))
  );
}


/*
  완료한 강화 횟수를 기준으로 다음 강화 비용을 다시 계산한다.
  밸런스 패치 전 계정도 같은 공식으로 보정할 때 사용한다.
*/
export function calculateClickUpgradeCost(completedLevel) {
  const safeLevel = Math.max(0, Math.floor(Number(completedLevel) || 0));
  let cost = GAME_BALANCE.CLICK_UPGRADE.START_COST;

  for (let level = 1; level <= safeLevel; level++) {
    const growth = getClickUpgradeGrowth(level);
    cost = Math.max(cost + 1, Math.floor(cost * growth));
  }

  return cost;
}

export function calculateAutoUpgradeCost(completedLevel) {
  const safeLevel = Math.max(0, Math.floor(Number(completedLevel) || 0));
  let cost = GAME_BALANCE.AUTO_UPGRADE.START_COST;

  for (let level = 1; level <= safeLevel; level++) {
    const growth = getAutoUpgradeGrowth(level);
    cost = Math.max(cost + 1, Math.floor(cost * growth));
  }

  return cost;
}

export function calculateClickPower(completedLevel) {
  const safeLevel = Math.max(0, Math.floor(Number(completedLevel) || 0));
  let value = 1;

  for (let level = 1; level <= safeLevel; level++) {
    value += calculateIncrease(
      value,
      GAME_BALANCE.CLICK_UPGRADE.INCREASE_RATE,
      GAME_BALANCE.CLICK_UPGRADE.MIN_INCREASE
    );
  }

  return value;
}

export function calculateAutoIncome(completedLevel) {
  const safeLevel = Math.max(0, Math.floor(Number(completedLevel) || 0));
  let value = 0;

  for (let level = 1; level <= safeLevel; level++) {
    value += calculateIncrease(
      value,
      GAME_BALANCE.AUTO_UPGRADE.INCREASE_RATE,
      GAME_BALANCE.AUTO_UPGRADE.MIN_INCREASE
    );
  }

  return value;
}

function getUnlockedContent(level) {
  const content = [];

  if (level === CONTENT_UNLOCK_LEVELS.JOB) {
    content.push({ icon: "💼", title: "직업", message: "이제 레벨 10마다 새로운 직업을 선택할 수 있습니다." });
  }

  if (level === CONTENT_UNLOCK_LEVELS.BUILDING) {
    content.push({ icon: "🏢", title: "사업", message: "사업을 구매해 초당 수입을 늘릴 수 있습니다." });
  }

  if (level === CONTENT_UNLOCK_LEVELS.EMPLOYEE) {
    content.push({ icon: "👷", title: "알바 고용", message: "알바를 고용하고 업그레이드할 수 있습니다." });
  }

  if (level === CONTENT_UNLOCK_LEVELS.PET) {
    content.push({ icon: "🐾", title: "펫", message: "펫을 구매하고 장착해 총 수입을 비율로 증가시킬 수 있습니다." });
  }

  return content;
}

async function upgradeClickPower(event) {
  event.stopPropagation();
  if (state.money < state.clickUpgradeCost) return;

  state.money -= state.clickUpgradeCost;
  state.clickUpgradeLevel++;

  const increase = calculateIncrease(
    state.baseClickPower,
    GAME_BALANCE.CLICK_UPGRADE.INCREASE_RATE,
    GAME_BALANCE.CLICK_UPGRADE.MIN_INCREASE
  );

  state.baseClickPower += increase;

  state.clickUpgradeCost = calculateClickUpgradeCost(
    state.clickUpgradeLevel
  );

  updateMainUI();
  await saveGameData();
}

async function upgradeAutoIncome(event) {
  event.stopPropagation();
  if (state.money < state.autoUpgradeCost) return;

  state.money -= state.autoUpgradeCost;
  state.autoUpgradeLevel++;

  const increase = calculateIncrease(
    state.baseAutoIncome,
    GAME_BALANCE.AUTO_UPGRADE.INCREASE_RATE,
    GAME_BALANCE.AUTO_UPGRADE.MIN_INCREASE
  );

  state.baseAutoIncome += increase;

  state.autoUpgradeCost = calculateAutoUpgradeCost(
    state.autoUpgradeLevel
  );

  updateMainUI();
  await saveGameData();
}

async function upgradeMainLevel(event) {
  event.stopPropagation();

  const maxLevel = GAME_BALANCE.LEVEL.MAX_LEVEL;
  if (state.level >= maxLevel) return;

  const currentCost = calculateLevelUpCost(state.level);
  if (currentCost === null || state.money < currentCost) return;

  state.money -= currentCost;
  state.level++;
  state.levelUpCost = calculateLevelUpCost(state.level) ?? 0;

  updateMainUI();
  await saveGameData();

  for (const unlocked of getUnlockedContent(state.level)) {
    await showUnlockNotification(unlocked);
  }

  await refreshJobOpportunity({ openChoice: true, save: true });
}
