import { DEFAULT_GAME_STATE } from "./config.js";

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
}

export const state = cloneDefaultState();

export function getTotalClickPower() {
  return (
    Number(state.baseClickPower) +
    Number(state.jobData.click_bonus)
  );
}

export function getTotalAutoIncome() {
  return (
    Number(state.baseAutoIncome) +
    Number(state.jobData.auto_bonus)
  );
}

export function normalizeJobData(savedJobData) {
  const defaultJobData =
    cloneDefaultState().jobData;

  if (
    !savedJobData ||
    typeof savedJobData !== "object"
  ) {
    return defaultJobData;
  }

  return {
    level: Number(
      savedJobData.level ??
      defaultJobData.level
    ),

    level_up_cost: Number(
      savedJobData.level_up_cost ??
      defaultJobData.level_up_cost
    ),

    selected_jobs: Array.isArray(
      savedJobData.selected_jobs
    )
      ? savedJobData.selected_jobs
      : [],

    click_bonus: Number(
      savedJobData.click_bonus ?? 0
    ),

    auto_bonus: Number(
      savedJobData.auto_bonus ?? 0
    ),

    pending_selection_level:
      savedJobData.pending_selection_level === null ||
      savedJobData.pending_selection_level === undefined
        ? null
        : Number(
            savedJobData.pending_selection_level
          )
  };
}

export function applySaveData(data) {
  state.money = Number(data.money ?? 0);
  state.level = Number(data.level ?? 1);

  /*
    DB의 click_power와 auto_income은
    직업 보너스를 제외한 기본 강화 수입으로 사용한다.
  */
  state.baseClickPower =
    Number(data.click_power ?? 1);

  state.baseAutoIncome =
    Number(data.auto_income ?? 0);

  state.clickUpgradeLevel =
    Number(data.click_upgrade_level ?? 0);

  state.autoUpgradeLevel =
    Number(data.auto_upgrade_level ?? 0);

  state.clickUpgradeCost =
    Number(data.click_upgrade_cost ?? 50);

  state.autoUpgradeCost =
    Number(data.auto_upgrade_cost ?? 100);

  state.levelUpCost =
    Number(data.level_up_cost ?? 500);

  state.jobData =
    normalizeJobData(data.job_data);
}

export function createSavePayload() {
  const now = new Date().toISOString();

  return {
    username: state.username,

    money: state.money,
    level: state.level,

    click_power: state.baseClickPower,
    auto_income: state.baseAutoIncome,

    click_upgrade_level:
      state.clickUpgradeLevel,

    auto_upgrade_level:
      state.autoUpgradeLevel,

    click_upgrade_cost:
      state.clickUpgradeCost,

    auto_upgrade_cost:
      state.autoUpgradeCost,

    level_up_cost:
      state.levelUpCost,

    job_data: state.jobData,

    last_saved_at: now,
    updated_at: now
  };
}