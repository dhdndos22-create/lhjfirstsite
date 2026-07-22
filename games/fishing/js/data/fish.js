import { RARITIES } from "./game-config.js";

function freezeFish(data) {
  return Object.freeze(data);
}

/**
 * 도감과 낚시 시스템이 함께 사용하는 원본 생물 데이터입니다.
 *
 * image:
 *   실제 이미지 파일을 연결할 경로입니다.
 * stageIds:
 *   해당 생물이 출현하는 스테이지 목록입니다.
 * isBoss:
 *   스테이지 보스 또는 최상위 개체 여부입니다.
 */
export const FISH_DATA = Object.freeze({
  drink_can: freezeFish({
    id: "drink_can",
    name: "음료수 캔",
    type: "junk",
    rarity: RARITIES.NORMAL,
    description: "누군가 연못에 버린 찌그러진 음료수 캔입니다.",
    image: "./images/fish/stage1/drink-can.png",
    stageIds: Object.freeze([1]),
    minSize: 8,
    maxSize: 18,
    baseGold: 5,
    baseExp: 2,
    isBoss: false
  }),

  loach: freezeFish({
    id: "loach",
    name: "미꾸라지",
    type: "fish",
    rarity: RARITIES.NORMAL,
    description: "진흙 바닥을 빠르게 헤엄치는 미끄러운 민물고기입니다.",
    image: "./images/fish/stage1/loach.png",
    stageIds: Object.freeze([1]),
    minSize: 8,
    maxSize: 22,
    baseGold: 20,
    baseExp: 6,
    isBoss: false
  }),

  sea_monkey: freezeFish({
    id: "sea_monkey",
    name: "씨몽키",
    type: "creature",
    rarity: RARITIES.NORMAL,
    description: "연못 속에서 떼를 지어 움직이는 아주 작은 생물입니다.",
    image: "./images/fish/stage1/sea-monkey.png",
    stageIds: Object.freeze([1]),
    minSize: 1,
    maxSize: 3,
    baseGold: 15,
    baseExp: 5,
    isBoss: false
  }),

  tadpole: freezeFish({
    id: "tadpole",
    name: "올챙이",
    type: "creature",
    rarity: RARITIES.NORMAL,
    description: "곧 개구리가 될 작은 올챙이입니다.",
    image: "./images/fish/stage1/tadpole.png",
    stageIds: Object.freeze([1]),
    minSize: 3,
    maxSize: 8,
    baseGold: 18,
    baseExp: 5,
    isBoss: false
  }),

  minnow: freezeFish({
    id: "minnow",
    name: "송사리",
    type: "fish",
    rarity: RARITIES.RARE,
    description: "작지만 민첩해서 쉽게 낚이지 않는 연못의 작은 물고기입니다.",
    image: "./images/fish/stage1/minnow.png",
    stageIds: Object.freeze([1]),
    minSize: 3,
    maxSize: 7,
    baseGold: 55,
    baseExp: 14,
    isBoss: false
  }),

  tree_frog: freezeFish({
    id: "tree_frog",
    name: "청개구리",
    type: "creature",
    rarity: RARITIES.RARE,
    description: "수초 위를 뛰어다니다 낚싯줄에 매달린 청개구리입니다.",
    image: "./images/fish/stage1/tree-frog.png",
    stageIds: Object.freeze([1]),
    minSize: 3,
    maxSize: 7,
    baseGold: 65,
    baseExp: 16,
    isBoss: false
  }),

  crucian_carp: freezeFish({
    id: "crucian_carp",
    name: "붕어",
    type: "fish",
    rarity: RARITIES.RARE,
    description: "초보자의 연못을 대표하는 튼튼한 민물고기입니다.",
    image: "./images/fish/stage1/crucian-carp.png",
    stageIds: Object.freeze([1]),
    minSize: 12,
    maxSize: 36,
    baseGold: 85,
    baseExp: 20,
    isBoss: false
  }),

  crayfish: freezeFish({
    id: "crayfish",
    name: "가재",
    type: "creature",
    rarity: RARITIES.RARE,
    description: "집게를 치켜들고 버티는 연못의 작은 갑각류입니다.",
    image: "./images/fish/stage1/crayfish.png",
    stageIds: Object.freeze([1]),
    minSize: 7,
    maxSize: 18,
    baseGold: 95,
    baseExp: 22,
    isBoss: false
  }),

  largemouth_bass: freezeFish({
    id: "largemouth_bass",
    name: "베스",
    type: "fish",
    rarity: RARITIES.UNIQUE,
    description: "강한 힘으로 낚싯줄을 끌고 가는 연못의 포식자입니다.",
    image: "./images/fish/stage1/largemouth-bass.png",
    stageIds: Object.freeze([1]),
    minSize: 25,
    maxSize: 65,
    baseGold: 240,
    baseExp: 55,
    isBoss: false
  }),

  flounder: freezeFish({
    id: "flounder",
    name: "광어",
    type: "fish",
    rarity: RARITIES.UNIQUE,
    description: "어째서 연못에 들어왔는지 알 수 없는 수상한 광어입니다.",
    image: "./images/fish/stage1/flounder.png",
    stageIds: Object.freeze([1]),
    minSize: 30,
    maxSize: 85,
    baseGold: 300,
    baseExp: 65,
    isBoss: false
  }),

  king_crab: freezeFish({
    id: "king_crab",
    name: "킹크랩",
    type: "creature",
    rarity: RARITIES.UNIQUE,
    description: "연못 깊은 곳에 숨어 있던 거대한 바다 갑각류입니다.",
    image: "./images/fish/stage1/king-crab.png",
    stageIds: Object.freeze([1]),
    minSize: 45,
    maxSize: 120,
    baseGold: 420,
    baseExp: 85,
    isBoss: false
  }),

  golden_carp: freezeFish({
    id: "golden_carp",
    name: "황금 잉어",
    type: "fish",
    rarity: RARITIES.LEGENDARY,
    description: "찬란한 황금빛 비늘을 가진 초보자의 연못 전설입니다.",
    image: "./images/fish/stage1/golden-carp.png",
    stageIds: Object.freeze([1]),
    minSize: 55,
    maxSize: 140,
    baseGold: 1500,
    baseExp: 250,
    isBoss: true
  }),

  giant_crayfish: freezeFish({
    id: "giant_crayfish",
    name: "거대 가재",
    type: "creature",
    rarity: RARITIES.LEGENDARY,
    description: "오랫동안 연못을 지배해 온 갑옷 같은 껍질의 거대 가재입니다.",
    image: "./images/fish/stage1/giant-crayfish.png",
    stageIds: Object.freeze([1]),
    minSize: 80,
    maxSize: 180,
    baseGold: 1800,
    baseExp: 300,
    isBoss: true
  })
});

export const STAGE_1_FISH_IDS = Object.freeze([
  "drink_can",
  "loach",
  "sea_monkey",
  "tadpole",
  "minnow",
  "tree_frog",
  "crucian_carp",
  "crayfish",
  "largemouth_bass",
  "flounder",
  "king_crab",
  "golden_carp",
  "giant_crayfish"
]);

export function getFishById(fishId) {
  return FISH_DATA[fishId] ?? null;
}

export function getFishByStage(stageId) {
  const numericStageId = Number(stageId);

  return Object.values(FISH_DATA).filter((fish) =>
    fish.stageIds.includes(numericStageId)
  );
}

export function getFishByStageAndRarity(stageId, rarity) {
  return getFishByStage(stageId).filter((fish) => fish.rarity === rarity);
}
