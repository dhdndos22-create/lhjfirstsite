export const ACHIEVEMENT_DATA = Object.freeze({
  first_catch: Object.freeze({
    id: "first_catch",
    name: "첫 낚시",
    description: "물고기를 1마리 잡으세요.",
    metric: "totalFishCaught",
    target: 1,
    reward: Object.freeze({ type: "gold", amount: 500 })
  }),

  catch_100: Object.freeze({
    id: "catch_100",
    name: "숙련된 낚시꾼",
    description: "물고기를 총 100마리 잡으세요.",
    metric: "totalFishCaught",
    target: 100,
    reward: Object.freeze({ type: "energy", amount: 20 })
  })
});
