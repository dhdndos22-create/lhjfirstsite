import { ITEM_CATEGORIES, RARITIES } from "./game-config.js";

export const ITEM_DATA = Object.freeze({
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
