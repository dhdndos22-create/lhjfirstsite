import { EQUIPMENT_CATEGORIES, RARITIES } from "./game-config.js";

export const EQUIPMENT_DATA = Object.freeze({
  basic_rod: Object.freeze({
    id: "basic_rod",
    name: "낡은 낚싯대",
    category: EQUIPMENT_CATEGORIES.ROD,
    rarity: RARITIES.COMMON,
    description: "처음 지급되는 기본 낚싯대입니다.",
    image: null,
    sellPrice: 50,
    stats: Object.freeze({
      biteChanceBonus: 0,
      rareChanceBonus: 0,
      goldBonusRate: 0,
      expBonusRate: 0
    })
  })
});
