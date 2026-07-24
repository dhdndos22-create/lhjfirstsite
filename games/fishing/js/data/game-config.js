export const GAME_CONFIG = Object.freeze({
  saveVersion: 2,
  maxLevel: 100,
  initialLevel: 1,
  initialExp: 0,
  initialGold: 0,
  initialRuby: 0
});

export const ITEM_CATEGORIES = Object.freeze({
  CONSUMABLE: "consumable",
  BAIT: "bait"
});

export const EQUIPMENT_CATEGORIES = Object.freeze({
  ROD: "rod",
  REEL: "reel",
  LINE: "line",
  FLOAT: "float"
});

export const RARITIES = Object.freeze({
  // 피싱월드 도감에서 사용하는 4단계 희귀도
  NORMAL: "normal",
  RARE: "rare",
  UNIQUE: "unique",
  LEGENDARY: "legendary",

  // 기존 데이터와의 호환성을 위해 유지
  COMMON: "normal",
  UNCOMMON: "rare",
  EPIC: "unique"
});

export const RARITY_LABELS = Object.freeze({
  [RARITIES.NORMAL]: "노말",
  [RARITIES.RARE]: "레어",
  [RARITIES.UNIQUE]: "유니크",
  [RARITIES.LEGENDARY]: "레전더리"
});

export const RARITY_ORDER = Object.freeze([
  RARITIES.NORMAL,
  RARITIES.RARE,
  RARITIES.UNIQUE,
  RARITIES.LEGENDARY
]);
