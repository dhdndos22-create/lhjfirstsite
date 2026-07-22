export const SHOP_PRODUCT_DATA = Object.freeze({
  energy_5: Object.freeze({
    id: "energy_5",
    category: "currency",
    name: "에너지 5개",
    description: "에너지 5를 즉시 획득합니다.",
    image: null,
    price: Object.freeze({ type: "gold", amount: 500 }),
    rewards: Object.freeze([
      Object.freeze({ type: "energy", amount: 5 })
    ]),
    purchaseLimit: null
  }),

  basic_worm_10: Object.freeze({
    id: "basic_worm_10",
    category: "consumable",
    name: "기본 지렁이 미끼 10개",
    description: "기본 지렁이 미끼 10개를 획득합니다.",
    image: null,
    price: Object.freeze({ type: "gold", amount: 300 }),
    rewards: Object.freeze([
      Object.freeze({ type: "item", itemId: "basic_worm", amount: 10 })
    ]),
    purchaseLimit: null
  }),

  basic_rod_product: Object.freeze({
    id: "basic_rod_product",
    category: "equipment",
    name: "낡은 낚싯대",
    description: "처음 사용하는 기본 낚싯대입니다.",
    image: null,
    price: Object.freeze({ type: "gold", amount: 0 }),
    rewards: Object.freeze([
      Object.freeze({ type: "equipment", equipmentId: "basic_rod", amount: 1 })
    ]),
    purchaseLimit: 1
  }),

  good_rod_product: Object.freeze({
    id: "good_rod_product",
    category: "equipment",
    name: "좋은 낚싯대",
    description: "유니크 물고기를 안정적으로 상대할 수 있는 테스트용 낚싯대입니다.",
    image: null,
    price: Object.freeze({ type: "gold", amount: 0 }),
    rewards: Object.freeze([
      Object.freeze({ type: "equipment", equipmentId: "good_rod", amount: 1 })
    ]),
    purchaseLimit: 1
  }),

  great_rod_product: Object.freeze({
    id: "great_rod_product",
    category: "equipment",
    name: "대단한 낚싯대",
    description: "레전더리 물고기까지 상대할 수 있는 테스트용 낚싯대입니다.",
    image: null,
    price: Object.freeze({ type: "gold", amount: 0 }),
    rewards: Object.freeze([
      Object.freeze({ type: "equipment", equipmentId: "great_rod", amount: 1 })
    ]),
    purchaseLimit: 1
  })
});
