export const SHOP_PRODUCT_DATA = Object.freeze({
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
    description: "낡은 낚싯대보다 성능이 향상된 레어 등급 낚싯대입니다.",
    image: null,
    price: Object.freeze({ type: "gold", amount: 1000 }),
    rewards: Object.freeze([
      Object.freeze({ type: "equipment", equipmentId: "good_rod", amount: 1 })
    ]),
    purchaseLimit: 1
  }),

  great_rod_product: Object.freeze({
    id: "great_rod_product",
    category: "equipment",
    name: "대단한 낚싯대",
    description: "좋은 낚싯대보다 성능이 높은 레어 등급 낚싯대입니다.",
    image: null,
    price: Object.freeze({ type: "gold", amount: 3000 }),
    rewards: Object.freeze([
      Object.freeze({ type: "equipment", equipmentId: "great_rod", amount: 1 })
    ]),
    purchaseLimit: 1
  })
});
