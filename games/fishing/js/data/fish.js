import { RARITIES } from "./game-config.js";

export const FISH_DATA = Object.freeze({
  anchovy: Object.freeze({
    id: "anchovy",
    name: "멸치",
    rarity: RARITIES.COMMON,
    description: "연안에서 흔히 만날 수 있는 작은 물고기입니다.",
    image: null,
    minSize: 5,
    maxSize: 20,
    baseGold: 30,
    baseExp: 10
  })
});
