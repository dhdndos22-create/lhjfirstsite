const startButton = document.getElementById("startButton");
const bubbleLayer = document.getElementById("bubbleLayer");

const PRESS_DURATION = 170;
const BUBBLE_COUNT_MIN = 7;
const BUBBLE_COUNT_MAX = 11;

let pressTimer = null;

/*
  모바일 브라우저의 주소창이 나타나거나 사라질 때도
  게임 영역이 실제 보이는 화면 높이를 정확히 채우도록 한다.
*/
function updateAppHeight() {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty(
    "--app-height",
    `${Math.round(viewportHeight)}px`
  );
}

updateAppHeight();
window.addEventListener("resize", updateAppHeight);
window.addEventListener("orientationchange", updateAppHeight);
window.visualViewport?.addEventListener("resize", updateAppHeight);

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createBubble(x, y, index) {
  const bubble = document.createElement("span");
  const size = randomBetween(10, 27);
  const duration = randomBetween(620, 1050);
  const rise = randomBetween(70, 145);
  const sway = randomBetween(-34, 34);

  bubble.className = "click-bubble";
  bubble.style.setProperty("--bubble-x", `${x + randomBetween(-62, 62)}px`);
  bubble.style.setProperty("--bubble-y", `${y + randomBetween(-8, 30)}px`);
  bubble.style.setProperty("--bubble-size", `${size}px`);
  bubble.style.setProperty("--bubble-duration", `${duration}ms`);
  bubble.style.setProperty("--bubble-rise", `${rise}px`);
  bubble.style.setProperty("--bubble-sway", `${sway}px`);
  bubble.style.animationDelay = `${index * 18}ms`;

  bubble.addEventListener(
    "animationend",
    () => {
      bubble.remove();
    },
    { once: true }
  );

  bubbleLayer.appendChild(bubble);
}

function playBubbleEffect(button) {
  const screenRect = bubbleLayer.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();

  const centerX =
    buttonRect.left - screenRect.left + buttonRect.width / 2;

  const centerY =
    buttonRect.top - screenRect.top + buttonRect.height * 0.7;

  const count = Math.floor(
    randomBetween(BUBBLE_COUNT_MIN, BUBBLE_COUNT_MAX + 1)
  );

  for (let index = 0; index < count; index += 1) {
    createBubble(centerX, centerY, index);
  }
}

function pressButton(button) {
  window.clearTimeout(pressTimer);

  button.classList.remove("is-pressed");

  /*
    같은 버튼을 빠르게 연속 클릭해도 애니메이션이 다시 시작되도록
    브라우저의 레이아웃 계산을 한 번 발생시킨다.
  */
  void button.offsetWidth;

  button.classList.add("is-pressed");
  playBubbleEffect(button);

  pressTimer = window.setTimeout(() => {
    button.classList.remove("is-pressed");
  }, PRESS_DURATION);
}

startButton.addEventListener("pointerdown", () => {
  pressButton(startButton);
});

startButton.addEventListener("pointerup", () => {
  window.setTimeout(() => {
    startButton.classList.remove("is-pressed");
  }, 70);
});

startButton.addEventListener("pointercancel", () => {
  startButton.classList.remove("is-pressed");
});

startButton.addEventListener("pointerleave", (event) => {
  if (event.buttons > 0) {
    startButton.classList.remove("is-pressed");
  }
});

/*
  현재 단계에서는 로비나 실제 게임 화면으로 이동하지 않는다.
  따라서 클릭 시 버튼 애니메이션만 실행된다.
  나중에 게임 화면을 만들면 이 click 이벤트 안에서 화면 전환 함수를 호출한다.
*/
startButton.addEventListener("click", () => {
  console.log("피싱월드 게임 시작 버튼 클릭");
});

/* 키보드 Enter / Space 입력에서도 같은 효과를 재생한다. */
startButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    pressButton(startButton);
  }
});
