/*
  피싱월드 안전 캐릭터 합성 시스템

  핵심:
  - 화면에 레이어를 직접 겹치지 않는다.
  - 숨겨진 Canvas에서 먼저 완성 캐릭터 개체 1개를 만든다.
  - 모든 정규 장비 PNG는 1024×1536 전체 캔버스여야 한다.
  - 크기가 틀리거나 로딩에 실패한 장비는 자동으로 건너뛴다.
  - 합성 실패 시 마지막 정상 캐릭터 또는 기본 완성 이미지로 복구한다.
*/

export const CHARACTER_STANDARD = Object.freeze({
  width: 1024,
  height: 1536,
  centerX: 512,
  groundY: 1450,
  format: "PNG",
  transparent: true
});

export const CHARACTER_LAYER_ORDER = Object.freeze([
  "base",
  "bottom",
  "shoes",
  "top",
  "rodBack",
  "bodyFront",
  "rodFront",
  "head"
]);

export const DEFAULT_COMPLETE_CHARACTER =
  "./images/player/complete/main-character-1.png";

/*
  현재 배포본은 정상 출력이 우선이므로 완성 캐릭터 PNG를 기본 베이스로 사용한다.

  나중에 진짜 장비 교체를 시작할 때:
  1. 장비가 제거된 clean base를 1024×1536로 제작한다.
  2. base.src를 clean base 경로로 교체한다.
  3. 각 장비를 동일 규격으로 등록한다.
  4. 모든 레이어는 좌표 보정 없이 (0, 0)에 합성된다.
*/
export const CHARACTER_CATALOG = Object.freeze({
  base: Object.freeze({
    "base-main-001": Object.freeze({
      id: "base-main-001",
      name: "메인 캐릭터 1",
      src: DEFAULT_COMPLETE_CHARACTER,
      required: true
    })
  }),

  head: Object.freeze({
    "head-none": Object.freeze({
      id: "head-none",
      name: "머리 장비 없음",
      src: null
    })
  }),

  top: Object.freeze({
    "top-none": Object.freeze({
      id: "top-none",
      name: "상의 장비 없음",
      src: null
    })
  }),

  bottom: Object.freeze({
    "bottom-none": Object.freeze({
      id: "bottom-none",
      name: "하의 장비 없음",
      src: null
    })
  }),

  shoes: Object.freeze({
    "shoes-none": Object.freeze({
      id: "shoes-none",
      name: "신발 장비 없음",
      src: null
    })
  }),

  rodBack: Object.freeze({
    "rod-back-none": Object.freeze({
      id: "rod-back-none",
      name: "뒤쪽 낚싯대 없음",
      src: null
    })
  }),

  bodyFront: Object.freeze({
    "body-front-none": Object.freeze({
      id: "body-front-none",
      name: "앞쪽 몸 레이어 없음",
      src: null
    })
  }),

  rodFront: Object.freeze({
    "rod-front-none": Object.freeze({
      id: "rod-front-none",
      name: "앞쪽 낚싯대 없음",
      src: null
    })
  })
});

export const DEFAULT_EQUIPMENT = Object.freeze({
  base: "base-main-001",
  bottom: "bottom-none",
  shoes: "shoes-none",
  top: "top-none",
  rodBack: "rod-back-none",
  bodyFront: "body-front-none",
  rodFront: "rod-front-none",
  head: "head-none"
});

const canvas = document.createElement("canvas");
canvas.width = CHARACTER_STANDARD.width;
canvas.height = CHARACTER_STANDARD.height;

const context = canvas.getContext("2d", {
  alpha: true,
  desynchronized: true
});

if (!context) {
  throw new Error("캐릭터 Canvas를 생성하지 못했습니다.");
}

const imageCache = new Map();
const targets = new Set();

let currentObjectUrl = null;
let lastGoodObjectUrl = null;
let composeToken = 0;

function loadImage(src) {
  if (!src) {
    return Promise.resolve(null);
  }

  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";

    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener(
      "error",
      () => reject(new Error(`이미지 로딩 실패: ${src}`)),
      { once: true }
    );

    image.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

function getItem(slot, itemId) {
  const item = CHARACTER_CATALOG[slot]?.[itemId];

  if (!item) {
    throw new Error(`등록되지 않은 장비: ${slot}/${itemId}`);
  }

  return item;
}

function validateImageSize(image, item) {
  if (!image) {
    return true;
  }

  const valid =
    image.naturalWidth === CHARACTER_STANDARD.width &&
    image.naturalHeight === CHARACTER_STANDARD.height;

  if (!valid) {
    console.warn(
      `[캐릭터 레이어 제외] ${item.id}: ` +
      `${image.naturalWidth}×${image.naturalHeight}, ` +
      `필수 규격 ${CHARACTER_STANDARD.width}×${CHARACTER_STANDARD.height}`
    );
  }

  return valid;
}

function canvasToBlob() {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("캐릭터 PNG Blob 생성 실패"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

function normalizeEquipment(equipment = {}) {
  return {
    ...DEFAULT_EQUIPMENT,
    ...equipment
  };
}

export async function composeCharacterObject(equipment = {}) {
  const token = ++composeToken;
  const normalized = normalizeEquipment(equipment);

  const layerItems = CHARACTER_LAYER_ORDER.map((slot) => {
    return getItem(slot, normalized[slot]);
  });

  const loaded = await Promise.all(
    layerItems.map(async (item) => {
      if (!item.src) {
        return { item, image: null, valid: true };
      }

      try {
        const image = await loadImage(item.src);
        return {
          item,
          image,
          valid: validateImageSize(image, item)
        };
      } catch (error) {
        console.error(error);

        return {
          item,
          image: null,
          valid: false
        };
      }
    })
  );

  if (token !== composeToken) {
    return currentObjectUrl || lastGoodObjectUrl || DEFAULT_COMPLETE_CHARACTER;
  }

  const baseLayer = loaded.find(({ item }) => item.required);

  if (!baseLayer?.image || !baseLayer.valid) {
    console.error("필수 기본 캐릭터 레이어가 올바르지 않습니다.");
    return lastGoodObjectUrl || DEFAULT_COMPLETE_CHARACTER;
  }

  context.clearRect(
    0,
    0,
    CHARACTER_STANDARD.width,
    CHARACTER_STANDARD.height
  );

  for (const layer of loaded) {
    if (!layer.image || !layer.valid) {
      continue;
    }

    context.drawImage(
      layer.image,
      0,
      0,
      CHARACTER_STANDARD.width,
      CHARACTER_STANDARD.height
    );
  }

  try {
    const blob = await canvasToBlob();
    const nextUrl = URL.createObjectURL(blob);

    if (currentObjectUrl && currentObjectUrl.startsWith("blob:")) {
      URL.revokeObjectURL(currentObjectUrl);
    }

    currentObjectUrl = nextUrl;
    lastGoodObjectUrl = nextUrl;

    return nextUrl;
  } catch (error) {
    console.error("캐릭터 합성 실패:", error);
    return lastGoodObjectUrl || DEFAULT_COMPLETE_CHARACTER;
  }
}

export function registerCharacterTarget(imageElement) {
  if (!(imageElement instanceof HTMLImageElement)) {
    return;
  }

  targets.add(imageElement);

  if (currentObjectUrl) {
    imageElement.src = currentObjectUrl;
  }
}

export function unregisterCharacterTarget(imageElement) {
  targets.delete(imageElement);
}

export function applyCharacterObject(url) {
  targets.forEach((imageElement) => {
    imageElement.src = url;
  });
}

export async function rebuildCharacterEverywhere(equipment) {
  const url = await composeCharacterObject(equipment);
  applyCharacterObject(url);
  return url;
}

export async function inspectEquipmentAsset(src) {
  try {
    const image = await loadImage(src);

    return {
      valid:
        image.naturalWidth === CHARACTER_STANDARD.width &&
        image.naturalHeight === CHARACTER_STANDARD.height,
      width: image.naturalWidth,
      height: image.naturalHeight,
      expectedWidth: CHARACTER_STANDARD.width,
      expectedHeight: CHARACTER_STANDARD.height
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      expectedWidth: CHARACTER_STANDARD.width,
      expectedHeight: CHARACTER_STANDARD.height
    };
  }
}
