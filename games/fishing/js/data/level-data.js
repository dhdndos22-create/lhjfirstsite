import { GAME_CONFIG } from "./game-config.js";

export function getRequiredExp(level) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));

  if (safeLevel >= GAME_CONFIG.maxLevel) {
    return 0;
  }

  const growthLevel = safeLevel - 1;

  return Math.floor(
    30 +
    growthLevel * 20 +
    Math.pow(growthLevel, 1.65) * 12
  );
}

export const LEVEL_TABLE = Object.freeze(
  Array.from({ length: GAME_CONFIG.maxLevel }, (_, index) => {
    const level = index + 1;
    return Object.freeze({
      level,
      requiredExp: getRequiredExp(level)
    });
  })
);
