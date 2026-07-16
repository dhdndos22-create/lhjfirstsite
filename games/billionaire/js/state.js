import {
  DEFAULT_GAME_STATE,
  BUILDING_CONFIG,
  EMPLOYEE_CONFIG,
  JOB_CHOICES,
  calculateJobReward,
  getJobChoicesByLevel,
  GAME_BALANCE,
  ECONOMY_BALANCE_VERSION,
  PET_CONFIG,
  calculateLevelUpCost
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

export function getEquippedPet() {
  const equippedId = state.petData?.equipped_pet_id;
  return PET_CONFIG.find(pet => pet.id === equippedId) || null;
}

export function getTotalClickPower() {
  const beforePet =
    Number(state.baseClickPower) +
    Number(state.jobData.click_bonus);
  const pet = getEquippedPet();
  return Math.floor(beforePet * (1 + Number(pet?.clickRate || 0)));
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

      const incomeGrowth =
        Number(employee.incomeGrowth || 1);

      return (
        totalIncome +
        Math.floor(
          Number(employee.baseAutoIncome) *
          Math.pow(incomeGrowth, level - 1)
        )
      );
    },
    0
  );
}




/* =========================
   전체 초당 수입 계산
========================= */

export function getTotalAutoIncome() {
  const beforePet =
    Number(state.baseAutoIncome) +
    Number(state.jobData.auto_bonus) +
    getBuildingAutoIncome() +
    getEmployeeAutoIncome();
  const pet = getEquippedPet();
  return Math.floor(beforePet * (1 + Number(pet?.autoRate || 0)));
}

/* =========================
   직업 데이터 정규화
========================= */

export function normalizeJobData(savedJobData) {
  const defaultJobData = cloneDefaultState().jobData;

  if (!savedJobData || typeof savedJobData !== "object") {
    return defaultJobData;
  }

  const rawSelectedJobs = Array.isArray(savedJobData.selected_jobs)
    ? savedJobData.selected_jobs
    : [];

  const normalizedJobs = [];

  rawSelectedJobs.forEach(function (savedJob) {
    if (!savedJob || typeof savedJob !== "object") return;

    const level = Number(savedJob.selected_level ?? savedJob.level);
    if (!Number.isInteger(level)) return;

    const jobConfig = getJobChoicesByLevel(level).find(
      job => job.id === savedJob.id
    );

    if (!jobConfig) return;

    const reward = calculateJobReward(jobConfig);
    normalizedJobs.push({
      id: jobConfig.id,
      name: jobConfig.name,
      icon: jobConfig.icon,
      level,
      selected_level: level,
      click_bonus: reward.clickBonus,
      auto_bonus: reward.autoBonus
    });
  });

  // 같은 레벨의 중복 기록이 있으면 마지막 선택만 남긴다.
  const jobsByLevel = new Map();
  normalizedJobs.forEach(job => jobsByLevel.set(job.selected_level, job));
  const selectedJobs = [...jobsByLevel.values()]
    .sort((a, b) => a.selected_level - b.selected_level);

  const savedClaimedLevels = Array.isArray(savedJobData.claimed_levels)
    ? savedJobData.claimed_levels
    : [];

  const configuredLevels = Object.keys(JOB_CHOICES).map(Number);
  const claimedLevels = [
    ...savedClaimedLevels.map(Number),
    ...selectedJobs.map(job => job.selected_level)
  ].filter(level => configuredLevels.includes(level));

  const uniqueClaimedLevels = [...new Set(claimedLevels)]
    .sort((a, b) => a - b);

  // 새 방식에서는 가장 높은 단계의 직업 하나만 실제 효과를 가진다.
  const currentJob = selectedJobs.length > 0
    ? selectedJobs[selectedJobs.length - 1]
    : null;

  const pendingValue = savedJobData.pending_selection_level;
  const pendingSelectionLevel = pendingValue === null || pendingValue === undefined
    ? null
    : Number(pendingValue);

  return {
    selected_jobs: selectedJobs,
    current_job: currentJob,
    click_bonus: currentJob ? currentJob.click_bonus : 0,
    auto_bonus: currentJob ? currentJob.auto_bonus : 0,
    pending_selection_level:
      configuredLevels.includes(pendingSelectionLevel) &&
      !uniqueClaimedLevels.includes(pendingSelectionLevel)
        ? pendingSelectionLevel
        : null,
    claimed_levels: uniqueClaimedLevels
  };
}

export function getNextAvailableJobLevel() {
  const claimedLevels = Array.isArray(state.jobData.claimed_levels)
    ? state.jobData.claimed_levels
    : [];

  const configuredLevels = Object.keys(JOB_CHOICES)
    .map(Number)
    .filter(Number.isInteger)
    .sort((a, b) => a - b);

  return configuredLevels.find(targetLevel =>
    state.level >= targetLevel &&
    !claimedLevels.includes(targetLevel) &&
    getJobChoicesByLevel(targetLevel).length > 0
  ) ?? null;
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

    common_lottery_last_bought_at:
      savedGamblingData
        .common_lottery_last_bought_at ??
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
      ),

      common_ticket_count: Number(
        savedLottery
          .common_ticket_count ??
        defaultGamblingData.lottery
          .common_ticket_count
      ),

      common_total_spent: Number(
        savedLottery
          .common_total_spent ??
        defaultGamblingData.lottery
          .common_total_spent
      ),

      common_total_won: Number(
        savedLottery
          .common_total_won ??
        defaultGamblingData.lottery
          .common_total_won
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

  const safeSavedData =
    savedEmployeeData &&
    typeof savedEmployeeData === "object"
      ? savedEmployeeData
      : {};

  const savedEmployees =
    safeSavedData.employees &&
    typeof safeSavedData.employees === "object"
      ? safeSavedData.employees
      : {};

  const normalizedEmployees = {};

  /*
    현재 EMPLOYEE_CONFIG를 기준으로 알바 목록을 다시 만든다.
    기존 유저가 보유한 알바와 강화 레벨은 유지하고,
    새로 추가된 알바는 미고용·레벨 0으로 자동 생성한다.
  */
  EMPLOYEE_CONFIG.forEach(
    function (employee) {
      const defaultEmployee =
        defaultEmployeeData.employees[employee.id] ||
        { hired: false, level: 0 };

      const savedEmployee =
        savedEmployees[employee.id] &&
        typeof savedEmployees[employee.id] === "object"
          ? savedEmployees[employee.id]
          : {};

      const hired =
        savedEmployee.hired === true;

      normalizedEmployees[employee.id] = {
        hired,

        level: hired
          ? Math.min(
            Number(GAME_BALANCE.EMPLOYEE.MAX_LEVEL),
            Math.max(
              1,
              Math.floor(
                Number(savedEmployee.level) || 1
              )
            )
          )
          : Number(defaultEmployee.level) || 0
      };
    }
  );

  /* 저장된 total_hired 값은 신뢰하지 않고 실제 상태로 재계산한다. */
  const totalHired = Object.values(
    normalizedEmployees
  ).filter(employee => employee.hired).length;

  return {
    employees: normalizedEmployees,
    total_hired: totalHired,
    balance_version: ECONOMY_BALANCE_VERSION
  };
}


/* =========================
   펫 데이터 정규화
========================= */
export function normalizePetData(savedPetData) {
  const saved = savedPetData && typeof savedPetData === "object" ? savedPetData : {};
  const validIds = new Set(PET_CONFIG.map(pet => pet.id));
  const owned = Array.isArray(saved.owned)
    ? [...new Set(saved.owned.filter(id => validIds.has(id)))]
    : [];
  const equipped = owned.includes(saved.equipped_pet_id)
    ? saved.equipped_pet_id
    : null;
  return {
    owned,
    equipped_pet_id: equipped,
    total_purchases: owned.length
  };
}

/* =========================
   저장 데이터 마이그레이션 확인
========================= */

function stableStringify(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch (error) {
    return "";
  }
}


/* =========================
   DB 데이터 적용
========================= */

export function applySaveData(data) {
  const originalEmployeeData = stableStringify(
    data.employee_data
  );

  const originalGamblingData = stableStringify(
    data.gambling_data
  );
  const originalPetData = stableStringify(data.pet_data);
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

  /*
    DB에 저장된 이전 level_up_cost는 사용하지 않는다.
    현재 레벨과 최신 COST_ANCHORS를 기준으로 항상 다시 계산한다.
  */
  const savedLevelUpCost = Number(
    data.level_up_cost ?? 0
  );

  state.levelUpCost = calculateLevelUpCost(
    state.level
  );

  state.jobData =
    normalizeJobData(
      data.job_data
    );

    
  const nextJobLevel =
    getNextAvailableJobLevel();

  if (
    state.jobData
      .pending_selection_level === null &&
    nextJobLevel !== null
  ) {
    state.jobData
      .pending_selection_level =
      nextJobLevel;
  }

  state.petData = normalizePetData(data.pet_data);

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

  const normalizedEmployeeData = stableStringify(
    state.employeeData
  );

  const normalizedGamblingData = stableStringify(
    state.gamblingData
  );
  const normalizedPetData = stableStringify(state.petData);

  const employeeDataMigrated =
    originalEmployeeData !== normalizedEmployeeData;

  const gamblingDataMigrated =
    originalGamblingData !== normalizedGamblingData;
  const petDataMigrated = originalPetData !== normalizedPetData;

  const levelUpCostMigrated =
    savedLevelUpCost !== state.levelUpCost;

  return {
    employeeDataMigrated,
    gamblingDataMigrated,
    petDataMigrated,
    levelUpCostMigrated,
    needsSave:
      employeeDataMigrated ||
      gamblingDataMigrated ||
      petDataMigrated ||
      levelUpCostMigrated
  };
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

    pet_data:
      state.petData,

    building_data:
      state.buildingData,


    employee_data:
      state.employeeData,

    last_saved_at: now,
    updated_at: now
  };
}