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
    energy: playerSave.currency.energy
  };
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

export function addEnergy(amount) {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  playerSave.currency.energy += value;
}

export function spendEnergy(amount = GAME_CONFIG.fishingEnergyCost) {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  if (playerSave.currency.energy < value) return false;
  playerSave.currency.energy -= value;
  playerSave.statistics.totalEnergySpent += value;
  return true;
}
