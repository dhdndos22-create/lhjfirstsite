import { GAME_CONFIG } from "../data/game-config.js";
import { getRequiredExp } from "../data/level-data.js";

export const DEFAULT_PLAYER_SAVE = Object.freeze({
  version: GAME_CONFIG.saveVersion,

  profile: Object.freeze({
    level: GAME_CONFIG.initialLevel,
    exp: GAME_CONFIG.initialExp,
    requiredExp: getRequiredExp(GAME_CONFIG.initialLevel)
  }),

  currency: Object.freeze({
    gold: GAME_CONFIG.initialGold,
    energy: GAME_CONFIG.initialEnergy
  }),

  inventory: Object.freeze({
    items: Object.freeze({}),
    bait: Object.freeze({})
  }),

  equipment: Object.freeze({
    owned: Object.freeze({ basic_rod: 1 }),
    equipped: Object.freeze({
      rod: "basic_rod",
      reel: null,
      line: null,
      float: null
    })
  }),

  progression: Object.freeze({
    selectedStageId: 1,
    highestUnlockedStageId: 1
  }),

  fishCollection: Object.freeze({}),
  achievements: Object.freeze({}),

  shop: Object.freeze({
    purchaseCounts: Object.freeze({})
  }),

  statistics: Object.freeze({
    totalFishingCount: 0,
    totalFishCaught: 0,
    totalGoldEarned: 0,
    totalGoldSpent: 0,
    totalEnergySpent: 0
  }),

  timestamps: Object.freeze({
    createdAt: null,
    lastSavedAt: null,
    lastLoginAt: null
  })
});

export function createDefaultPlayerSave() {
  const now = new Date().toISOString();
  const save = structuredClone(DEFAULT_PLAYER_SAVE);
  save.timestamps.createdAt = now;
  save.timestamps.lastSavedAt = now;
  save.timestamps.lastLoginAt = now;
  return save;
}
