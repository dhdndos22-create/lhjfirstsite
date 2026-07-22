import { EQUIPMENT_CATEGORIES, RARITIES } from "./game-config.js";

export const EQUIPMENT_DATA = Object.freeze({
  basic_rod: Object.freeze({
    id: "basic_rod",
    name: "낡은 낚싯대",
    category: EQUIPMENT_CATEGORIES.ROD,
    rarity: RARITIES.COMMON,
    description: "처음 지급되는 기본 낚싯대입니다. 판매할 수 없습니다.",
    image: null,
    sellPrice: 0,
    sellable: false,
    stats: Object.freeze({
      reelPower: 1,
      rodControl: 1,
      lineStrength: 100,
      biteChanceBonus: 0,
      rareChanceBonus: 0,
      goldBonusRate: 0,
      expBonusRate: 0
    })
  }),

  good_rod: Object.freeze({
    id: "good_rod",
    name: "좋은 낚싯대",
    category: EQUIPMENT_CATEGORIES.ROD,
    rarity: RARITIES.UNIQUE,
    description: "유니크 물고기를 낡은 낚싯대로 노말 물고기를 상대하는 정도로 제압할 수 있는 테스트용 낚싯대입니다.",
    image: null,
    sellPrice: 0,
    sellable: true,
    stats: Object.freeze({
      reelPower: 2.45,
      rodControl: 2.05,
      lineStrength: 145,
      biteChanceBonus: 0,
      rareChanceBonus: 0,
      goldBonusRate: 0,
      expBonusRate: 0
    })
  }),

  great_rod: Object.freeze({
    id: "great_rod",
    name: "대단한 낚싯대",
    category: EQUIPMENT_CATEGORIES.ROD,
    rarity: RARITIES.LEGENDARY,
    description: "좋은 낚싯대보다 조금 더 강하며 레전더리 물고기를 잡을 수 있도록 제작된 테스트용 낚싯대입니다.",
    image: null,
    sellPrice: 0,
    sellable: true,
    stats: Object.freeze({
      reelPower: 3.05,
      rodControl: 2.55,
      lineStrength: 175,
      biteChanceBonus: 0,
      rareChanceBonus: 0,
      goldBonusRate: 0,
      expBonusRate: 0
    })
  })
});

export function getRodFishingStats(rodId) {
  const rod = EQUIPMENT_DATA[rodId] ?? EQUIPMENT_DATA.basic_rod;
  return {
    reelPower: Number(rod.stats?.reelPower) || 1,
    rodControl: Number(rod.stats?.rodControl) || 1,
    lineStrength: Number(rod.stats?.lineStrength) || 100
  };
}
