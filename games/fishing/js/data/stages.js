export const STAGE_DATA = Object.freeze([
  Object.freeze({
    id: 1,
    key: "beginner_pond",
    name: "초보자의 연못",
    description: "낚시를 처음 시작하는 초보 낚시꾼을 위한 평온한 연못입니다.",
    difficulty: 1,
    requiredLevel: 1,
    previousStageId: null,
    requiredCollectionRate: 0,
    fishPool: Object.freeze([]),
    backgroundImage: "./images/stages/stage-1-island.png",
    imageStyle: Object.freeze({ scale: 0.98, offsetX: 0, offsetY: 8 })
  }),
  Object.freeze({
    id: 2,
    key: "rough_valley",
    name: "거친 골짜기",
    description: "빠른 물살과 바위가 가득한 골짜기입니다.",
    difficulty: 2,
    requiredLevel: 10,
    previousStageId: 1,
    requiredCollectionRate: 100,
    fishPool: Object.freeze([]),
    backgroundImage: "./images/stages/stage-2-island.png",
    imageStyle: Object.freeze({ scale: 0.94, offsetX: 0, offsetY: 10 })
  }),
  Object.freeze({
    id: 3,
    key: "bewitching_lake",
    name: "미혹의 호수",
    description: "안개 속에서 정체를 알 수 없는 물고기가 나타나는 호수입니다.",
    difficulty: 3,
    requiredLevel: 25,
    previousStageId: 2,
    requiredCollectionRate: 100,
    fishPool: Object.freeze([]),
    backgroundImage: "./images/stages/stage-3-island-safe.png?v=20260721c",
    imageStyle: Object.freeze({ scale: 0.86, offsetX: 0, offsetY: 18 })
  }),
  Object.freeze({
    id: 4,
    key: "abyssal_sea",
    name: "심연의 바다",
    description: "거대한 파도 아래 강력한 바다 생물이 숨어 있는 해역입니다.",
    difficulty: 4,
    requiredLevel: 45,
    previousStageId: 3,
    requiredCollectionRate: 100,
    fishPool: Object.freeze([]),
    backgroundImage: "./images/stages/stage-4-island-safe.png?v=20260721c",
    imageStyle: Object.freeze({ scale: 0.82, offsetX: 0, offsetY: 18 })
  }),
  Object.freeze({
    id: 5,
    key: "deep_sea",
    name: "심해",
    description: "빛조차 닿지 않는 최종 낚시 구역입니다.",
    difficulty: 5,
    requiredLevel: 70,
    previousStageId: 4,
    requiredCollectionRate: 100,
    fishPool: Object.freeze([]),
    backgroundImage: "./images/stages/stage-5-island-safe.png?v=20260721c",
    imageStyle: Object.freeze({ scale: 0.80, offsetX: 0, offsetY: 20 })
  })
]);

export function getStageById(stageId) {
  return STAGE_DATA.find((stage) => stage.id === Number(stageId)) ?? null;
}
