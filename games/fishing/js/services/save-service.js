import { GAME_CONFIG } from "../data/game-config.js";
import { getRequiredExp } from "../data/level-data.js";
import { createDefaultPlayerSave } from "../state/player-save-template.js";

const SAVE_KEY_PREFIX = "fishingWorldSave";
const LEGACY_KEY_PREFIX = "fishingPlayer";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toInteger(value, fallback, minimum = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(minimum, Math.floor(number));
}

function normalizeCountMap(value) {
  if (!isPlainObject(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .map(([id, amount]) => [id, toInteger(amount, 0)])
      .filter(([, amount]) => amount > 0)
  );
}

function normalizeRecordMap(value) {
  return isPlainObject(value) ? structuredClone(value) : {};
}

export function getPlayerSaveKey(userId) {
  const safeUserId = String(userId || "guest").trim() || "guest";
  return `${SAVE_KEY_PREFIX}:${safeUserId}`;
}

function getLegacySaveKey(userId) {
  const safeUserId = String(userId || "guest").trim() || "guest";
  return `${LEGACY_KEY_PREFIX}:${safeUserId}`;
}

function migrateLegacySave(legacy) {
  const save = createDefaultPlayerSave();
  const level = Math.min(
    GAME_CONFIG.maxLevel,
    toInteger(legacy?.level, GAME_CONFIG.initialLevel, 1)
  );

  save.profile.level = level;
  save.profile.exp = level >= GAME_CONFIG.maxLevel
    ? 0
    : toInteger(legacy?.currentExp, GAME_CONFIG.initialExp);
  save.profile.requiredExp = level >= GAME_CONFIG.maxLevel
    ? 0
    : getRequiredExp(level);
  save.currency.gold = toInteger(legacy?.gold, GAME_CONFIG.initialGold);
  save.currency.ruby = toInteger(legacy?.ruby, GAME_CONFIG.initialRuby);
  return save;
}

export function normalizePlayerSave(rawSave) {
  if (!isPlainObject(rawSave)) {
    return createDefaultPlayerSave();
  }

  if (!isPlainObject(rawSave.profile) && "level" in rawSave) {
    return migrateLegacySave(rawSave);
  }

  const fallback = createDefaultPlayerSave();
  const level = Math.min(
    GAME_CONFIG.maxLevel,
    toInteger(rawSave.profile?.level, fallback.profile.level, 1)
  );

  const save = {
    version: GAME_CONFIG.saveVersion,

    profile: {
      level,
      exp: level >= GAME_CONFIG.maxLevel
        ? 0
        : toInteger(rawSave.profile?.exp, fallback.profile.exp),
      requiredExp: level >= GAME_CONFIG.maxLevel
        ? 0
        : getRequiredExp(level)
    },

    currency: {
      gold: toInteger(rawSave.currency?.gold, fallback.currency.gold),
      ruby: toInteger(rawSave.currency?.ruby, fallback.currency.ruby)
    },

    inventory: {
      items: normalizeCountMap(rawSave.inventory?.items),
      bait: normalizeCountMap(rawSave.inventory?.bait),
      fish: normalizeCountMap(rawSave.inventory?.fish)
    },

    equipment: {
      owned: normalizeCountMap(rawSave.equipment?.owned),
      equipped: {
        rod: rawSave.equipment?.equipped?.rod ?? fallback.equipment.equipped.rod,
        reel: rawSave.equipment?.equipped?.reel ?? null,
        line: rawSave.equipment?.equipped?.line ?? null,
        float: rawSave.equipment?.equipped?.float ?? null
      }
    },

    progression: {
      selectedStageId: Math.min(5, toInteger(rawSave.progression?.selectedStageId, 1, 1)),
      highestUnlockedStageId: Math.min(5, toInteger(rawSave.progression?.highestUnlockedStageId, 1, 1))
    },

    fishCollection: normalizeRecordMap(rawSave.fishCollection),
    achievements: normalizeRecordMap(rawSave.achievements),

    shop: {
      purchaseCounts: normalizeCountMap(rawSave.shop?.purchaseCounts)
    },

    statistics: {
      totalFishingCount: toInteger(rawSave.statistics?.totalFishingCount, 0),
      totalFishCaught: toInteger(rawSave.statistics?.totalFishCaught, 0),
      totalGoldEarned: toInteger(rawSave.statistics?.totalGoldEarned, 0),
      totalGoldSpent: toInteger(rawSave.statistics?.totalGoldSpent, 0),
      totalRubyEarned: toInteger(rawSave.statistics?.totalRubyEarned, 0),
      totalRubySpent: toInteger(rawSave.statistics?.totalRubySpent, 0)
    },

    timestamps: {
      createdAt: rawSave.timestamps?.createdAt || fallback.timestamps.createdAt,
      lastSavedAt: rawSave.timestamps?.lastSavedAt || fallback.timestamps.lastSavedAt,
      lastLoginAt: new Date().toISOString()
    }
  };

  if (!save.equipment.owned.basic_rod) {
    save.equipment.owned.basic_rod = 1;
  }

  if (!save.equipment.equipped.rod) {
    save.equipment.equipped.rod = "basic_rod";
  }

  return save;
}

export function loadPlayerSave(userId) {
  const key = getPlayerSaveKey(userId);

  try {
    const raw = localStorage.getItem(key);

    if (raw) {
      return normalizePlayerSave(JSON.parse(raw));
    }

    const legacyRaw = localStorage.getItem(getLegacySaveKey(userId));
    const save = legacyRaw
      ? normalizePlayerSave(JSON.parse(legacyRaw))
      : createDefaultPlayerSave();

    savePlayerSave(userId, save);
    return save;
  } catch (error) {
    console.warn("플레이어 저장 데이터를 불러오지 못했습니다.", error);
    return createDefaultPlayerSave();
  }
}

export function savePlayerSave(userId, playerSave) {
  const normalized = normalizePlayerSave(playerSave);
  normalized.timestamps.lastSavedAt = new Date().toISOString();
  localStorage.setItem(getPlayerSaveKey(userId), JSON.stringify(normalized));
  return normalized;
}

export function resetPlayerSave(userId) {
  const save = createDefaultPlayerSave();
  return savePlayerSave(userId, save);
}
