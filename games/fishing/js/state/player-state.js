import { GAME_CONFIG } from "../data/game-config.js";
import { getRequiredExp } from "../data/level-data.js";
import { createDefaultPlayerSave } from "./player-save-template.js";

export const playerSave = createDefaultPlayerSave();

export function replacePlayerSave(nextSave) {
  Object.keys(playerSave).forEach((key) => delete playerSave[key]);
  Object.assign(playerSave, structuredClone(nextSave));
  return playerSave;
}

export function getPlayerStatusView() {
  return {
    level: playerSave.profile.level,
    currentExp: playerSave.profile.exp,
    requiredExp: playerSave.profile.level >= GAME_CONFIG.maxLevel
      ? 0
      : getRequiredExp(playerSave.profile.level),
    gold: playerSave.currency.gold,
    ruby: playerSave.currency.ruby
  };
}

export function addExp(value) {
  let remaining = Math.max(0, Math.floor(Number(value) || 0));

  while (
    remaining > 0 &&
    playerSave.profile.level < GAME_CONFIG.maxLevel
  ) {
    const required = getRequiredExp(playerSave.profile.level);
    const needed = Math.max(1, required - playerSave.profile.exp);
    const applied = Math.min(remaining, needed);

    playerSave.profile.exp += applied;
    remaining -= applied;

    if (playerSave.profile.exp >= required) {
      playerSave.profile.level += 1;
      playerSave.profile.exp = 0;
    }
  }

  if (playerSave.profile.level >= GAME_CONFIG.maxLevel) {
    playerSave.profile.level = GAME_CONFIG.maxLevel;
    playerSave.profile.exp = 0;
  }

  return playerSave.profile.level;
}


export function addGold(amount) {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  playerSave.currency.gold += value;
  playerSave.statistics.totalGoldEarned += value;
}

export function spendGold(amount) {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  if (playerSave.currency.gold < value) return false;
  playerSave.currency.gold -= value;
  playerSave.statistics.totalGoldSpent += value;
  return true;
}

export function addRuby(amount) {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  playerSave.currency.ruby += value;
  playerSave.statistics.totalRubyEarned += value;
}

export function spendRuby(amount) {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  if (playerSave.currency.ruby < value) return false;
  playerSave.currency.ruby -= value;
  playerSave.statistics.totalRubySpent += value;
  return true;
}

export function addCaughtFish(fishId, {
  count = 1,
  size = 0,
  caughtAt = new Date().toISOString()
} = {}) {
  const amount = Math.max(1, Math.floor(Number(count) || 1));

  if (!playerSave.inventory.fish) playerSave.inventory.fish = {};
  if (!playerSave.fishCollection) playerSave.fishCollection = {};

  playerSave.inventory.fish[fishId] =
    Math.max(0, Number(playerSave.inventory.fish[fishId]) || 0) + amount;

  const previous = playerSave.fishCollection[fishId] ?? {};
  const previousCount = Number(previous.count ?? previous ?? 0) || 0;
  const previousMaxSize = Number(previous.maxSize ?? 0) || 0;

  playerSave.fishCollection[fishId] = {
    count: previousCount + amount,
    maxSize: Math.max(previousMaxSize, Number(size) || 0),
    firstCaughtAt: previous.firstCaughtAt || caughtAt,
    lastCaughtAt: caughtAt
  };

  playerSave.statistics.totalFishingCount += amount;
  playerSave.statistics.totalFishCaught += amount;
}

export function sellInventoryFish(fishId, quantity, unitPrice) {
  const amount = Math.max(0, Math.floor(Number(quantity) || 0));
  const price = Math.max(0, Math.floor(Number(unitPrice) || 0));
  const owned = Math.max(0, Number(playerSave.inventory.fish?.[fishId]) || 0);

  if (amount < 1 || owned < amount) return false;

  playerSave.inventory.fish[fishId] = owned - amount;
  if (playerSave.inventory.fish[fishId] <= 0) {
    delete playerSave.inventory.fish[fishId];
  }

  addGold(amount * price);
  return true;
}
