import {
  DEFAULT_GAME_STATE,
  BUILDING_CONFIG,
  EMPLOYEE_CONFIG
} from "./config.js";

/* =========================
   기본 상태 복사
========================= */

function cloneDefaultState() {
  return JSON.parse(
    JSON.stringify(DEFAULT_GAME_STATE)
  );
}

export const state = cloneDefaultState();

/* =========================
   클릭 수입 계산
========================= */

export function getTotalClickPower() {
  return (
    Number(state.baseClickPower) +
    Number(state.jobData.click_bonus)
  );
}

/* =========================
   건물 초당 수입 계산
========================= */

export function getBuildingAutoIncome() {
  return BUILDING_CONFIG.reduce(
    function (totalIncome, building) {
      const ownedCount = Number(
        state.buildingData.owned[
        building.id
        ] ?? 0
      );

      return (
        totalIncome +
        ownedCount *
        Number(building.autoIncome)
      );
    },
    0
  );
}


export function getEmployeeAutoIncome() {
  return EMPLOYEE_CONFIG.reduce(
    function (totalIncome, employee) {
      const savedEmployee =
        state.employeeData.employees[
        employee.id
        ];

      if (
        !savedEmployee ||
        !savedEmployee.hired
      ) {
        return totalIncome;
      }

      const level = Math.max(
        1,
        Math.floor(
          Number(savedEmployee.level) || 1
        )
      );

      return (
        totalIncome +
        Number(employee.baseAutoIncome) *
        level
      );
    },
    0
  );
}




/* =========================
   전체 초당 수입 계산
========================= */

export function getTotalAutoIncome() {
  return (
    Number(state.baseAutoIncome) +
    Number(state.jobData.auto_bonus) +
    getBuildingAutoIncome()  +
    getEmployeeAutoIncome()
  );
}

/* =========================
   직업 데이터 정규화
========================= */

export function normalizeJobData(
  savedJobData
) {
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
      savedJobData.pending_selection_level ===
        null ||
        savedJobData.pending_selection_level ===
        undefined
        ? null
        : Number(
          savedJobData
            .pending_selection_level
        )
  };
}

/* =========================
   도박 데이터 정규화
========================= */

export function normalizeGamblingData(
  savedGamblingData
) {
  const defaultGamblingData =
    cloneDefaultState().gamblingData;

  if (
    !savedGamblingData ||
    typeof savedGamblingData !== "object"
  ) {
    return defaultGamblingData;
  }

  const savedLottery =
    savedGamblingData.lottery &&
      typeof savedGamblingData.lottery ===
      "object"
      ? savedGamblingData.lottery
      : {};

  const savedStats =
    savedGamblingData.stats &&
      typeof savedGamblingData.stats ===
      "object"
      ? savedGamblingData.stats
      : {};

  return {
    odd_even_last_played_at:
      savedGamblingData
        .odd_even_last_played_at ??
      null,

    dice_last_played_at:
      savedGamblingData
        .dice_last_played_at ??
      null,

    beggar_lottery_last_bought_at:
      savedGamblingData
        .beggar_lottery_last_bought_at ??
      null,

    lottery: {
      beggar_ticket_count: Number(
        savedLottery
          .beggar_ticket_count ??
        defaultGamblingData.lottery
          .beggar_ticket_count
      ),

      beggar_total_spent: Number(
        savedLottery
          .beggar_total_spent ??
        defaultGamblingData.lottery
          .beggar_total_spent
      ),

      beggar_total_won: Number(
        savedLottery
          .beggar_total_won ??
        defaultGamblingData.lottery
          .beggar_total_won
      )
    },

    stats: {
      odd_even_plays: Number(
        savedStats.odd_even_plays ??
        defaultGamblingData.stats
          .odd_even_plays
      ),

      odd_even_wins: Number(
        savedStats.odd_even_wins ??
        defaultGamblingData.stats
          .odd_even_wins
      ),

      dice_plays: Number(
        savedStats.dice_plays ??
        defaultGamblingData.stats
          .dice_plays
      ),

      dice_wins: Number(
        savedStats.dice_wins ??
        defaultGamblingData.stats
          .dice_wins
      )
    }
  };
}

/* =========================
   건물 데이터 정규화
========================= */

export function normalizeBuildingData(
  savedBuildingData
) {
  const defaultBuildingData =
    cloneDefaultState().buildingData;

  if (
    !savedBuildingData ||
    typeof savedBuildingData !== "object"
  ) {
    return defaultBuildingData;
  }

  const savedOwned =
    savedBuildingData.owned &&
      typeof savedBuildingData.owned ===
      "object"
      ? savedBuildingData.owned
      : {};

  const normalizedOwned = {};

  /*
    config.js의 건물 목록을 기준으로
    모든 건물 보유 개수를 안전하게 복원한다.
  */
  BUILDING_CONFIG.forEach(
    function (building) {
      normalizedOwned[building.id] =
        Math.max(
          0,
          Math.floor(
            Number(
              savedOwned[building.id] ??
              defaultBuildingData.owned[
              building.id
              ] ??
              0
            )
          )
        );
    }
  );

  return {
    owned: normalizedOwned,

    total_purchases: Math.max(
      0,
      Math.floor(
        Number(
          savedBuildingData
            .total_purchases ??
          defaultBuildingData
            .total_purchases ??
          0
        )
      )
    )
  };
}

export function normalizeEmployeeData(
  savedEmployeeData
) {
  const defaultEmployeeData =
    cloneDefaultState().employeeData;

  if (
    !savedEmployeeData ||
    typeof savedEmployeeData !== "object"
  ) {
    return defaultEmployeeData;
  }

  const savedEmployees =
    savedEmployeeData.employees &&
      typeof savedEmployeeData.employees ===
      "object"
      ? savedEmployeeData.employees
      : {};

  const normalizedEmployees = {};

  EMPLOYEE_CONFIG.forEach(
    function (employee) {
      const savedEmployee =
        savedEmployees[employee.id];

      const hired =
        savedEmployee?.hired === true;

      normalizedEmployees[employee.id] = {
        hired,

        level: hired
          ? Math.max(
            1,
            Math.floor(
              Number(
                savedEmployee?.level
              ) || 1
            )
          )
          : 0
      };
    }
  );

  return {
    employees: normalizedEmployees,

    total_hired: Math.max(
      0,
      Math.floor(
        Number(
          savedEmployeeData.total_hired ??
          defaultEmployeeData.total_hired ??
          0
        )
      )
    )
  };
}


/* =========================
   DB 데이터 적용
========================= */

export function applySaveData(data) {
  state.money = Number(
    data.money ?? 0
  );

  state.level = Number(
    data.level ?? 1
  );

  /*
    DB의 click_power와 auto_income은
    직업·건물 보너스를 제외한
    기본 강화 수입이다.
  */
  state.baseClickPower = Number(
    data.click_power ?? 1
  );

  state.baseAutoIncome = Number(
    data.auto_income ?? 0
  );

  state.clickUpgradeLevel = Number(
    data.click_upgrade_level ?? 0
  );

  state.autoUpgradeLevel = Number(
    data.auto_upgrade_level ?? 0
  );

  state.clickUpgradeCost = Number(
    data.click_upgrade_cost ?? 50
  );

  state.autoUpgradeCost = Number(
    data.auto_upgrade_cost ?? 100
  );

  state.levelUpCost = Number(
    data.level_up_cost ?? 500
  );

  state.jobData =
    normalizeJobData(
      data.job_data
    );

  state.gamblingData =
    normalizeGamblingData(
      data.gambling_data
    );

  state.buildingData =
    normalizeBuildingData(
      data.building_data
    );

  state.employeeData =
    normalizeEmployeeData(
      data.employee_data
    );
}

/* =========================
   DB 저장용 데이터 생성
========================= */

export function createSavePayload() {
  const now =
    new Date().toISOString();

  return {
    username: state.username,

    money: state.money,
    level: state.level,

    click_power:
      state.baseClickPower,

    auto_income:
      state.baseAutoIncome,

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

    job_data:
      state.jobData,

    gambling_data:
      state.gamblingData,

    building_data:
      state.buildingData,


    employee_data:
      state.employeeData,

    last_saved_at: now,
    updated_at: now
  };
}