import { FISH_DATA, getFishByStage } from "./fish.js";

export const CASTING_CONFIG = Object.freeze({
  successMinPower: 0.64,
  successMaxPower: 0.82,
  perfectMinPower: 0.70,
  perfectMaxPower: 0.77
});

export const STAGE_RARITY_WEIGHTS = Object.freeze({
  1: Object.freeze({
    normal: 68,
    rare: 23,
    unique: 7,
    legendary: 2
  }),
  2: Object.freeze({
    normal: 58,
    rare: 27,
    unique: 11,
    legendary: 4
  }),
  3: Object.freeze({
    normal: 50,
    rare: 30,
    unique: 14,
    legendary: 6
  }),
  4: Object.freeze({
    normal: 42,
    rare: 32,
    unique: 18,
    legendary: 8
  }),
  5: Object.freeze({
    normal: 34,
    rare: 34,
    unique: 21,
    legendary: 11
  })
});

export const RARITY_BEHAVIORS = Object.freeze({
  normal: Object.freeze({
    hookWindowMs: 1250,
    startDistance: 24,
    startTension: 18,
    restDuration: Object.freeze([2.8, 4.2]),
    struggleDuration: Object.freeze([1.0, 1.7]),
    restTensionDrop: 16,
    struggleTensionRise: 7,
    escapeSpeed: 0.12,
    restPull: 0.72,
    strugglePull: 0.28,
    restTapTension: 5.2,
    struggleTapTension: 8,
    lineShake: 0.35,
    shadowScale: 0.72,
    splashPower: 0.7,
    phaseBias: 0
  }),
  rare: Object.freeze({
    hookWindowMs: 950,
    startDistance: 31,
    startTension: 24,
    restDuration: Object.freeze([2.2, 3.4]),
    struggleDuration: Object.freeze([1.3, 2.1]),
    restTensionDrop: 13,
    struggleTensionRise: 9.5,
    escapeSpeed: 0.25,
    restPull: 0.62,
    strugglePull: 0.22,
    restTapTension: 6,
    struggleTapTension: 9.2,
    lineShake: 0.65,
    shadowScale: 0.92,
    splashPower: 1,
    phaseBias: 0.08
  }),
  unique: Object.freeze({
    hookWindowMs: 690,
    startDistance: 40,
    startTension: 31,
    restDuration: Object.freeze([1.7, 2.7]),
    struggleDuration: Object.freeze([1.7, 2.8]),
    restTensionDrop: 10.5,
    struggleTensionRise: 12.5,
    escapeSpeed: 0.48,
    restPull: 0.54,
    strugglePull: 0.16,
    restTapTension: 6.8,
    struggleTapTension: 10.5,
    lineShake: 1,
    shadowScale: 1.22,
    splashPower: 1.45,
    phaseBias: 0.16
  }),
  legendary: Object.freeze({
    hookWindowMs: 480,
    startDistance: 52,
    startTension: 38,
    restDuration: Object.freeze([1.15, 2.1]),
    struggleDuration: Object.freeze([2.0, 3.4]),
    restTensionDrop: 8.5,
    struggleTensionRise: 15.5,
    escapeSpeed: 0.72,
    restPull: 0.46,
    strugglePull: 0.11,
    restTapTension: 7.8,
    struggleTapTension: 12.2,
    lineShake: 1.45,
    shadowScale: 1.62,
    splashPower: 2,
    phaseBias: 0.25
  })
});

// 개별 물고기의 성격만 덮어씁니다. 이후 2~5스테이지 물고기도 여기에 추가하면 됩니다.
export const FISH_BEHAVIOR_OVERRIDES = Object.freeze({
  drink_can: Object.freeze({
    startDistance: 18,
    escapeSpeed: 0,
    struggleTensionRise: 2.5,
    lineShake: 0.08,
    shadowScale: 0.48,
    behaviorType: "dead_weight"
  }),
  loach: Object.freeze({
    struggleDuration: Object.freeze([0.65, 1.15]),
    restDuration: Object.freeze([1.3, 2.1]),
    lineShake: 0.72,
    behaviorType: "dart"
  }),
  sea_monkey: Object.freeze({
    startDistance: 17,
    startTension: 11,
    behaviorType: "tiny"
  }),
  tadpole: Object.freeze({
    escapeSpeed: 0.19,
    lineShake: 0.5,
    behaviorType: "hop"
  }),
  minnow: Object.freeze({
    struggleDuration: Object.freeze([0.8, 1.4]),
    lineShake: 0.82,
    behaviorType: "dart"
  }),
  tree_frog: Object.freeze({
    struggleTensionRise: 11,
    restDuration: Object.freeze([1.4, 2.2]),
    behaviorType: "hop"
  }),
  crucian_carp: Object.freeze({
    restDuration: Object.freeze([2.8, 4.1]),
    struggleDuration: Object.freeze([1.5, 2.3]),
    behaviorType: "steady"
  }),
  crayfish: Object.freeze({
    restPull: 0.51,
    strugglePull: 0.14,
    startTension: 29,
    behaviorType: "bottom_hold"
  }),
  largemouth_bass: Object.freeze({
    struggleTensionRise: 14.5,
    struggleDuration: Object.freeze([1.1, 2.6]),
    escapeSpeed: 0.68,
    lineShake: 1.25,
    behaviorType: "burst"
  }),
  flounder: Object.freeze({
    restPull: 0.39,
    strugglePull: 0.09,
    startDistance: 44,
    startTension: 36,
    behaviorType: "bottom_hold"
  }),
  king_crab: Object.freeze({
    startDistance: 48,
    restPull: 0.34,
    strugglePull: 0.07,
    startTension: 42,
    escapeSpeed: 0.16,
    behaviorType: "heavy"
  }),
  golden_carp: Object.freeze({
    hookWindowMs: 430,
    lineShake: 1.75,
    splashPower: 2.35,
    phaseBias: 0.32,
    behaviorType: "chaotic"
  }),
  giant_crayfish: Object.freeze({
    hookWindowMs: 455,
    startDistance: 58,
    startTension: 44,
    restPull: 0.31,
    strugglePull: 0.055,
    struggleTensionRise: 17,
    escapeSpeed: 0.28,
    behaviorType: "boss_heavy"
  })
});

function chooseWeightedKey(weightMap) {
  const entries = Object.entries(weightMap);
  const total = entries.reduce((sum, [, weight]) => sum + Number(weight || 0), 0);
  let roll = Math.random() * total;

  for (const [key, weight] of entries) {
    roll -= Number(weight || 0);
    if (roll < 0) return key;
  }

  return entries[0]?.[0] ?? "normal";
}

export function chooseFishForStage(stageId) {
  const numericStageId = Number(stageId);
  const fishList = getFishByStage(numericStageId);
  const weights =
    STAGE_RARITY_WEIGHTS[numericStageId] ??
    STAGE_RARITY_WEIGHTS[1];

  const rarity = chooseWeightedKey(weights);
  const rarityCandidates = fishList.filter((fish) => fish.rarity === rarity);
  const candidates = rarityCandidates.length > 0 ? rarityCandidates : fishList;

  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

export function getFishingBehavior(fish) {
  if (!fish) return { ...RARITY_BEHAVIORS.normal };

  return {
    ...RARITY_BEHAVIORS[fish.rarity],
    ...(FISH_BEHAVIOR_OVERRIDES[fish.id] ?? {})
  };
}

export function randomBehaviorRange(range) {
  const [min, max] = range;
  return min + Math.random() * (max - min);
}

export function createCatchResult(fish) {
  const min = Number(fish?.minSize ?? 1);
  const max = Number(fish?.maxSize ?? min);
  const size = Math.round((min + Math.random() * Math.max(0, max - min)) * 10) / 10;

  return Object.freeze({
    fishId: fish.id,
    size,
    exp: Number(fish.baseExp || 0),
    goldValue: Number(fish.baseGold || 0),
    caughtAt: new Date().toISOString()
  });
}
