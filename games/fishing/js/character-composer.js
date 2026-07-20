/*
  피싱월드 캐릭터 합성기

  원칙
  1. 화면에는 레이어를 직접 출력하지 않는다.
  2. 장비 레이어들을 숨겨진 Canvas에서 먼저 합성한다.
  3. 합성 결과 Blob URL 하나를 로비/프로필/게임 화면에 재사용한다.
  4. 신규 장비 이미지는 CHARACTER_STANDARD 규칙을 반드시 따른다.
*/

export const CHARACTER_STANDARD = Object.freeze({
  canvasWidth: 1024,
  canvasHeight: 1536,

  // 모든 신규 장비 PNG는 반드시 아래 규격으로 제작한다.
  rules: Object.freeze({
    format: "PNG",
    background: "transparent",
    width: 1024,
    height: 1536,
    anchorX: 512,
    groundY: 1450,
    direction: "front",
    note:
      "이미지를 부위 크기로 자르지 말고 1024×1536 전체 캔버스를 유지하며, " +
      "기본 캐릭터와 같은 좌표에 장비만 그리고 나머지는 투명하게 둔다."
  }),

  layerOrder: Object.freeze([
    "base",
    "bottom",
    "shoes",
    "top",
    "rod",
    "frontHand",
    "head"
  ])
});

/*
  현재 첫 세트는 참고 시트에서 분리된 초기 이미지이므로,
  아래 placement를 사용해 1024×1536 캐릭터 캔버스 안에 정렬한다.

  앞으로 새로 제작할 정규 장비는 fullCanvas: true로 등록하고
  x/y/width/height를 지정하지 않는다.
*/
export const CHARACTER_ASSETS = Object.freeze({
  base: Object.freeze({
    id: "player-base",
    src: "./images/player/base/player-base.png",
    placement: Object.freeze({ x: 215, y: 110, width: 594, height: 1320 })
  }),

  frontHand: Object.freeze({
    id: "player-front-hand",
    src: "./images/player/base/player-front-hand.png",
    placement: Object.freeze({ x: 175, y: 575, width: 230, height: 450 })
  }),

  head: Object.freeze({
    "head-none": Object.freeze({
      id: "head-none",
      name: "착용 안 함",
      src: null,
      fullCanvas: true
    }),

    "head-cap-001": Object.freeze({
      id: "head-cap-001",
      name: "초보 낚시 모자",
      src: "./images/player/head/head-cap-001.png",
      placement: Object.freeze({ x: 300, y: 55, width: 455, height: 360 })
    })
  }),

  top: Object.freeze({
    "top-none": Object.freeze({
      id: "top-none",
      name: "기본 민소매",
      src: null,
      fullCanvas: true
    }),

    "top-vest-001": Object.freeze({
      id: "top-vest-001",
      name: "초보 낚시 조끼",
      src: "./images/player/top/top-vest-001.png",
      placement: Object.freeze({ x: 245, y: 470, width: 550, height: 620 })
    })
  }),

  bottom: Object.freeze({
    "bottom-none": Object.freeze({
      id: "bottom-none",
      name: "기본 하의",
      src: null,
      fullCanvas: true
    }),

    "bottom-shorts-001": Object.freeze({
      id: "bottom-shorts-001",
      name: "초보 반바지",
      src: "./images/player/bottom/bottom-shorts-001.png",
      placement: Object.freeze({ x: 315, y: 900, width: 400, height: 390 })
    })
  }),

  shoes: Object.freeze({
    "shoes-none": Object.freeze({
      id: "shoes-none",
      name: "맨발",
      src: null,
      fullCanvas: true
    }),

    "shoes-sneakers-001": Object.freeze({
      id: "shoes-sneakers-001",
      name: "초보 운동화",
      src: "./images/player/shoes/shoes-sneakers-001.png",
      placement: Object.freeze({ x: 300, y: 1190, width: 430, height: 300 })
    })
  }),

  rod: Object.freeze({
    "rod-none": Object.freeze({
      id: "rod-none",
      name: "낚싯대 없음",
      src: null,
      fullCanvas: true
    }),

    "rod-basic-001": Object.freeze({
      id: "rod-basic-001",
      name: "초보 낚싯대",
      src: "./images/player/rod/rod-basic-001.png",
      placement: Object.freeze({ x: 15, y: 160, width: 455, height: 1300 })
    })
  })
});

const canvas = document.createElement("canvas");
canvas.width = CHARACTER_STANDARD.canvasWidth;
canvas.height = CHARACTER_STANDARD.canvasHeight;

const context = canvas.getContext("2d", {
  alpha: true,
  desynchronized: true
});

if (!context) {
  throw new Error("Canvas 2D Context를 생성하지 못했습니다.");
}

const imageCache = new Map();
const registeredTargets = new Set();

let currentCharacterObjectUrl = null;
let composeSequence = 0;

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
      () => reject(new Error(`캐릭터 이미지를 불러오지 못했습니다: ${src}`)),
      { once: true }
    );

    image.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

function getAsset(slot, itemId) {
  const group = CHARACTER_ASSETS[slot];
  const asset = group?.[itemId];

  if (!asset) {
    throw new Error(`존재하지 않는 캐릭터 장비입니다: ${slot}/${itemId}`);
  }

  return asset;
}

function drawAsset(image, asset) {
  if (!image) {
    return;
  }

  if (asset.fullCanvas) {
    context.drawImage(
      image,
      0,
      0,
      CHARACTER_STANDARD.canvasWidth,
      CHARACTER_STANDARD.canvasHeight
    );
    return;
  }

  const placement = asset.placement;

  if (!placement) {
    throw new Error(`캐릭터 레이어 placement가 없습니다: ${asset.id}`);
  }

  context.drawImage(
    image,
    placement.x,
    placement.y,
    placement.width,
    placement.height
  );
}

function getLayerAssets(equipment) {
  return [
    CHARACTER_ASSETS.base,
    getAsset("bottom", equipment.bottom),
    getAsset("shoes", equipment.shoes),
    getAsset("top", equipment.top),
    getAsset("rod", equipment.rod),
    CHARACTER_ASSETS.frontHand,
    getAsset("head", equipment.head)
  ];
}

function canvasToBlob() {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("완성 캐릭터 PNG를 생성하지 못했습니다."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

/*
  장비 레이어들을 먼저 하나의 완성 캐릭터 PNG 개체로 합성한다.
  반환값은 화면에 사용할 Blob URL 하나다.
*/
export async function composeCharacterObject(equipment) {
  const sequence = ++composeSequence;
  const assets = getLayerAssets(equipment);

  const images = await Promise.all(
    assets.map((asset) => loadImage(asset.src))
  );

  if (sequence !== composeSequence) {
    return currentCharacterObjectUrl;
  }

  context.clearRect(
    0,
    0,
    CHARACTER_STANDARD.canvasWidth,
    CHARACTER_STANDARD.canvasHeight
  );

  assets.forEach((asset, index) => {
    drawAsset(images[index], asset);
  });

  const blob = await canvasToBlob();
  const nextUrl = URL.createObjectURL(blob);

  if (currentCharacterObjectUrl) {
    URL.revokeObjectURL(currentCharacterObjectUrl);
  }

  currentCharacterObjectUrl = nextUrl;
  return currentCharacterObjectUrl;
}

export function registerCharacterTarget(imageElement) {
  if (!(imageElement instanceof HTMLImageElement)) {
    return;
  }

  registeredTargets.add(imageElement);

  if (currentCharacterObjectUrl) {
    imageElement.src = currentCharacterObjectUrl;
  }
}

export function unregisterCharacterTarget(imageElement) {
  registeredTargets.delete(imageElement);
}

export function applyCharacterObjectToTargets(characterObjectUrl) {
  registeredTargets.forEach((imageElement) => {
    imageElement.src = characterObjectUrl;
  });
}

export async function updateCharacterObjectEverywhere(equipment) {
  const characterObjectUrl = await composeCharacterObject(equipment);
  applyCharacterObjectToTargets(characterObjectUrl);
  return characterObjectUrl;
}

export function getCurrentCharacterObjectUrl() {
  return currentCharacterObjectUrl;
}

/*
  신규 장비 등록 전 검사 도우미.
  정규 장비는 반드시 1024×1536 전체 투명 캔버스여야 한다.
*/
export async function validateFullCanvasAsset(src) {
  const image = await loadImage(src);

  return {
    valid:
      image.width === CHARACTER_STANDARD.canvasWidth &&
      image.height === CHARACTER_STANDARD.canvasHeight,
    width: image.width,
    height: image.height,
    expectedWidth: CHARACTER_STANDARD.canvasWidth,
    expectedHeight: CHARACTER_STANDARD.canvasHeight
  };
}
