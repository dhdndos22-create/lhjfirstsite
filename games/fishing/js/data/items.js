import { ITEM_CATEGORIES, RARITIES } from "./game-config.js";

export const ITEM_DATA = Object.freeze({
  energy_drink_small: Object.freeze({
    id: "energy_drink_small",
    name: "작은 에너지 음료",
    category: ITEM_CATEGORIES.CONSUMABLE,
    rarity: RARITIES.COMMON,
    description: "사용하면 에너지 5를 획득합니다.",
    image: null,
    stackable: true,
    maxStack: null,
    sellPrice: 100,
    effect: Object.freeze({ type: "energy", amount: 5 })
  }),

  basic_worm: Object.freeze({
    id: "basic_worm",
    name: "기본 지렁이 미끼",
    category: ITEM_CATEGORIES.BAIT,
    rarity: RARITIES.COMMON,
    description: "가장 기본적인 낚시 미끼입니다.",
    image: null,
    stackable: true,
    maxStack: null,
    sellPrice: 20,
    fishingEffect: Object.freeze({
      biteChanceBonus: 0,
      rareChanceBonus: 0
    })
  })
});
