import {
  GAMBLING_CONFIG
} from "./config.js";

import {
  state
} from "./state.js";

import {
  elements,
  updateMainUI,
  formatMoney,
  formatPlainNumber
} from "./ui.js";

import {
  saveGameData
} from "./database.js";

/* =========================
   도박 화면 요소
========================= */

let gamblingElements = null;

/*
  HTML이 만들어진 뒤 initializeGambling()을 호출할 때
  필요한 요소들을 찾는다.

  모듈을 불러오는 순간 바로 찾지 않기 때문에,
  HTML 요소가 아직 없을 때 전체 JS가 중단되는 문제를 줄인다.
*/
function getGamblingElements() {
  return {
    gamblingMenuBtn:
      document.getElementById("gamblingMenuBtn"),

    gamblingPanel:
      document.getElementById("gamblingPanel"),

    gamblingPanelCloseBtn:
      document.getElementById(
        "gamblingPanelCloseBtn"
      ),

    gamblingTabButtons:
      document.querySelectorAll(
        ".gamblingTabBtn"
      ),

    gamblingSections:
      document.querySelectorAll(
        ".gamblingSection"
      ),

    /* 홀짝게임 */
    oddEvenBetInput:
      document.getElementById(
        "oddEvenBetInput"
      ),

    oddChoiceBtn:
      document.getElementById(
        "oddChoiceBtn"
      ),

    evenChoiceBtn:
      document.getElementById(
        "evenChoiceBtn"
      ),

    oddEvenPlayBtn:
      document.getElementById(
        "oddEvenPlayBtn"
      ),

    oddEvenCooldownText:
      document.getElementById(
        "oddEvenCooldownText"
      ),

    oddEvenResultText:
      document.getElementById(
        "oddEvenResultText"
      ),

    oddEvenStatsText:
      document.getElementById(
        "oddEvenStatsText"
      ),

    /* 주사위 게임 */
    diceBetInput:
      document.getElementById(
        "diceBetInput"
      ),

    diceNumberButtons:
      document.querySelectorAll(
        ".diceNumberBtn"
      ),

    dicePlayBtn:
      document.getElementById(
        "dicePlayBtn"
      ),

    diceCooldownText:
      document.getElementById(
        "diceCooldownText"
      ),

    diceResultText:
      document.getElementById(
        "diceResultText"
      ),

    diceStatsText:
      document.getElementById(
        "diceStatsText"
      ),

    /* 거지로또 */
    beggarLotteryBuyBtn:
      document.getElementById(
        "beggarLotteryBuyBtn"
      ),

    beggarLotteryCooldownText:
      document.getElementById(
        "beggarLotteryCooldownText"
      ),

    beggarLotteryResultText:
      document.getElementById(
        "beggarLotteryResultText"
      ),

    beggarLotteryStatsText:
      document.getElementById(
        "beggarLotteryStatsText"
      )
  };
}

/* =========================
   현재 선택 상태
========================= */

let selectedOddEven = null;
let selectedDiceNumber = null;

let cooldownTimer = null;
let isProcessing = false;

/* =========================
   초기화
========================= */

export function initializeGambling() {
  gamblingElements =
    getGamblingElements();

  const requiredElements = [
    "gamblingMenuBtn",
    "gamblingPanel",
    "gamblingPanelCloseBtn",
    "oddEvenBetInput",
    "oddChoiceBtn",
    "evenChoiceBtn",
    "oddEvenPlayBtn",
    "oddEvenCooldownText",
    "oddEvenResultText",
    "diceBetInput",
    "dicePlayBtn",
    "diceCooldownText",
    "diceResultText",
    "beggarLotteryBuyBtn",
    "beggarLotteryCooldownText",
    "beggarLotteryResultText"
  ];

  const missingElements =
    requiredElements.filter(
      function (name) {
        return !gamblingElements[name];
      }
    );

  if (missingElements.length > 0) {
    console.error(
      "도박 HTML 요소가 없습니다:",
      missingElements
    );

    return;
  }

  gamblingElements.gamblingMenuBtn
    .addEventListener(
      "click",
      openGamblingPanel
    );

  gamblingElements.gamblingPanelCloseBtn
    .addEventListener(
      "click",
      closeGamblingPanel
    );

  gamblingElements.gamblingPanel
    .addEventListener(
      "click",
      function (event) {
        event.stopPropagation();
      }
    );

  initializeTabs();
  initializeOddEvenGame();
  initializeDiceGame();
  initializeBeggarLottery();

  updateGamblingUI();
  startCooldownTimer();
}

/* =========================
   도박 패널
========================= */

function openGamblingPanel(event) {
  event.stopPropagation();

  elements.gameMenuPanel.classList.add(
    "hidden"
  );

  gamblingElements.gamblingPanel
    .classList.remove("hidden");

  updateGamblingUI();
}

function closeGamblingPanel() {
  gamblingElements.gamblingPanel
    .classList.add("hidden");
}

/* =========================
   탭
========================= */

function initializeTabs() {
  gamblingElements.gamblingTabButtons
    .forEach(function (button) {
      button.addEventListener(
        "click",
        function () {
          const targetId =
            button.dataset.target;

          showGamblingSection(
            targetId
          );
        }
      );
    });
}

function showGamblingSection(targetId) {
  gamblingElements.gamblingSections
    .forEach(function (section) {
      section.classList.toggle(
        "hidden",
        section.id !== targetId
      );
    });

  gamblingElements.gamblingTabButtons
    .forEach(function (button) {
      button.classList.toggle(
        "active",
        button.dataset.target === targetId
      );
    });
}

/* =========================
   홀짝게임 초기화
========================= */

function initializeOddEvenGame() {
  gamblingElements.oddChoiceBtn
    .addEventListener(
      "click",
      function () {
        selectOddEven("odd");
      }
    );

  gamblingElements.evenChoiceBtn
    .addEventListener(
      "click",
      function () {
        selectOddEven("even");
      }
    );

  gamblingElements.oddEvenPlayBtn
    .addEventListener(
      "click",
      playOddEven
    );

  gamblingElements.oddEvenBetInput
    .addEventListener(
      "input",
      updateGamblingUI
    );
}

function selectOddEven(choice) {
  selectedOddEven = choice;

  gamblingElements.oddChoiceBtn
    .classList.toggle(
      "selected",
      choice === "odd"
    );

  gamblingElements.evenChoiceBtn
    .classList.toggle(
      "selected",
      choice === "even"
    );

  updateGamblingUI();
}

/* =========================
   홀짝게임 실행
========================= */

async function playOddEven() {
  if (isProcessing) return;

  const cooldownRemaining =
    getCooldownRemaining(
      state.gamblingData
        .odd_even_last_played_at,
      GAMBLING_CONFIG
        .oddEven.cooldownMs
    );

  if (cooldownRemaining > 0) {
    showResult(
      gamblingElements
        .oddEvenResultText,
      `아직 ${formatRemainingTime(
        cooldownRemaining
      )} 남았습니다.`,
      false
    );

    return;
  }

  const betAmount =
    getValidBetAmount(
      gamblingElements
        .oddEvenBetInput.value
    );

  if (!betAmount) return;

  if (!selectedOddEven) {
    showResult(
      gamblingElements
        .oddEvenResultText,
      "홀 또는 짝을 선택해주세요.",
      false
    );

    return;
  }

  isProcessing = true;

  try {
    /*
      베팅 금액을 먼저 차감한다.
    */
    state.money -= betAmount;

    const computerNumber =
      Math.floor(
        Math.random() * 100
      ) + 1;

    const computerChoice =
      computerNumber % 2 === 0
        ? "even"
        : "odd";

    const success =
      computerChoice ===
      selectedOddEven;

    state.gamblingData.stats
      .odd_even_plays++;

    if (success) {
      const reward =
        betAmount *
        GAMBLING_CONFIG
          .oddEven.rewardMultiplier;

      state.money += reward;

      state.gamblingData.stats
        .odd_even_wins++;

      showResult(
        gamblingElements
          .oddEvenResultText,
        `성공! 컴퓨터 숫자는 ` +
        `${computerNumber}(${getOddEvenKorean(
          computerChoice
        )})입니다. ` +
        `${formatMoney(reward)}을 받았습니다.`,
        true
      );
    } else {
      showResult(
        gamblingElements
          .oddEvenResultText,
        `실패! 컴퓨터 숫자는 ` +
        `${computerNumber}(${getOddEvenKorean(
          computerChoice
        )})입니다. ` +
        `${formatMoney(betAmount)}을 잃었습니다.`,
        false
      );
    }

    state.gamblingData
      .odd_even_last_played_at =
        new Date().toISOString();

    gamblingElements
      .oddEvenBetInput.value = "";

    selectedOddEven = null;

    gamblingElements.oddChoiceBtn
      .classList.remove("selected");

    gamblingElements.evenChoiceBtn
      .classList.remove("selected");

    updateMainUI();
    updateGamblingUI();

    await saveGameData();
  } finally {
    isProcessing = false;
  }
}

/* =========================
   주사위 게임 초기화
========================= */

function initializeDiceGame() {
  gamblingElements.diceNumberButtons
    .forEach(function (button) {
      button.addEventListener(
        "click",
        function () {
          selectDiceNumber(
            Number(
              button.dataset.number
            )
          );
        }
      );
    });

  gamblingElements.dicePlayBtn
    .addEventListener(
      "click",
      playDice
    );

  gamblingElements.diceBetInput
    .addEventListener(
      "input",
      updateGamblingUI
    );
}

function selectDiceNumber(number) {
  selectedDiceNumber = number;

  gamblingElements.diceNumberButtons
    .forEach(function (button) {
      button.classList.toggle(
        "selected",
        Number(
          button.dataset.number
        ) === number
      );
    });

  updateGamblingUI();
}

/* =========================
   주사위 게임 실행
========================= */

async function playDice() {
  if (isProcessing) return;

  const cooldownRemaining =
    getCooldownRemaining(
      state.gamblingData
        .dice_last_played_at,
      GAMBLING_CONFIG
        .dice.cooldownMs
    );

  if (cooldownRemaining > 0) {
    showResult(
      gamblingElements
        .diceResultText,
      `아직 ${formatRemainingTime(
        cooldownRemaining
      )} 남았습니다.`,
      false
    );

    return;
  }

  const betAmount =
    getValidBetAmount(
      gamblingElements
        .diceBetInput.value
    );

  if (!betAmount) return;

  if (
    !Number.isInteger(
      selectedDiceNumber
    ) ||
    selectedDiceNumber <
      GAMBLING_CONFIG
        .dice.minNumber ||
    selectedDiceNumber >
      GAMBLING_CONFIG
        .dice.maxNumber
  ) {
    showResult(
      gamblingElements
        .diceResultText,
      "1부터 6 중 하나를 선택해주세요.",
      false
    );

    return;
  }

  isProcessing = true;

  try {
    state.money -= betAmount;

    const computerDice =
      Math.floor(
        Math.random() *
        (
          GAMBLING_CONFIG
            .dice.maxNumber -
          GAMBLING_CONFIG
            .dice.minNumber +
          1
        )
      ) +
      GAMBLING_CONFIG
        .dice.minNumber;

    const success =
      computerDice ===
      selectedDiceNumber;

    state.gamblingData.stats
      .dice_plays++;

    if (success) {
      const reward =
        betAmount *
        GAMBLING_CONFIG
          .dice.rewardMultiplier;

      state.money += reward;

      state.gamblingData.stats
        .dice_wins++;

      showResult(
        gamblingElements
          .diceResultText,
        `성공! 주사위는 ${computerDice}입니다. ` +
        `${formatMoney(reward)}을 받았습니다.`,
        true
      );
    } else {
      showResult(
        gamblingElements
          .diceResultText,
        `실패! 주사위는 ${computerDice}입니다. ` +
        `${formatMoney(betAmount)}을 잃었습니다.`,
        false
      );
    }

    state.gamblingData
      .dice_last_played_at =
        new Date().toISOString();

    gamblingElements
      .diceBetInput.value = "";

    selectedDiceNumber = null;

    gamblingElements.diceNumberButtons
      .forEach(function (button) {
        button.classList.remove(
          "selected"
        );
      });

    updateMainUI();
    updateGamblingUI();

    await saveGameData();
  } finally {
    isProcessing = false;
  }
}

/* =========================
   거지로또 초기화
========================= */

function initializeBeggarLottery() {
  gamblingElements
    .beggarLotteryBuyBtn
    .addEventListener(
      "click",
      buyBeggarLottery
    );
}

/* =========================
   거지로또 구매
========================= */

async function buyBeggarLottery() {
  if (isProcessing) return;

  const config =
    GAMBLING_CONFIG
      .beggarLottery;

  const cooldownRemaining =
    getCooldownRemaining(
      state.gamblingData
        .beggar_lottery_last_bought_at,
      config.cooldownMs
    );

  if (cooldownRemaining > 0) {
    showResult(
      gamblingElements
        .beggarLotteryResultText,
      `아직 ${formatRemainingTime(
        cooldownRemaining
      )} 남았습니다.`,
      false
    );

    return;
  }

  if (state.money < config.price) {
    showResult(
      gamblingElements
        .beggarLotteryResultText,
      `거지로또 구매에는 ` +
      `${formatMoney(config.price)}이 필요합니다.`,
      false
    );

    return;
  }

  isProcessing = true;

  try {
    state.money -= config.price;

    const randomValue =
      Math.random() * 100;

    const result =
      config.rewards.find(
        function (rewardData) {
          return (
            randomValue >=
              rewardData.min &&
            randomValue <
              rewardData.max
          );
        }
      );

    const reward =
      result?.reward ?? 0;

    state.money += reward;

    state.gamblingData.lottery
      .beggar_ticket_count++;

    state.gamblingData.lottery
      .beggar_total_spent +=
        config.price;

    state.gamblingData.lottery
      .beggar_total_won +=
        reward;

    state.gamblingData
      .beggar_lottery_last_bought_at =
        new Date().toISOString();

    if (reward > 0) {
      showResult(
        gamblingElements
          .beggarLotteryResultText,
        `축하합니다! ${result.label}!`,
        true
      );
    } else {
      showResult(
        gamblingElements
          .beggarLotteryResultText,
        "아쉽지만 꽝입니다.",
        false
      );
    }

    updateMainUI();
    updateGamblingUI();

    await saveGameData();
  } finally {
    isProcessing = false;
  }
}

/* =========================
   도박 UI 갱신
========================= */

export function updateGamblingUI() {
  if (!gamblingElements) return;

  updateOddEvenUI();
  updateDiceUI();
  updateBeggarLotteryUI();
  updateGamblingStats();
}

function updateOddEvenUI() {
  const remaining =
    getCooldownRemaining(
      state.gamblingData
        .odd_even_last_played_at,
      GAMBLING_CONFIG
        .oddEven.cooldownMs
    );

  gamblingElements
    .oddEvenCooldownText
    .textContent =
      remaining > 0
        ? `다음 플레이까지: ` +
          formatRemainingTime(
            remaining
          )
        : "지금 플레이 가능";

  const betAmount =
    Number(
      gamblingElements
        .oddEvenBetInput.value
    );

  gamblingElements
    .oddEvenPlayBtn.disabled =
      remaining > 0 ||
      !selectedOddEven ||
      !Number.isFinite(betAmount) ||
      betAmount <= 0 ||
      betAmount > state.money;
}

function updateDiceUI() {
  const remaining =
    getCooldownRemaining(
      state.gamblingData
        .dice_last_played_at,
      GAMBLING_CONFIG
        .dice.cooldownMs
    );

  gamblingElements
    .diceCooldownText
    .textContent =
      remaining > 0
        ? `다음 플레이까지: ` +
          formatRemainingTime(
            remaining
          )
        : "지금 플레이 가능";

  const betAmount =
    Number(
      gamblingElements
        .diceBetInput.value
    );

  gamblingElements
    .dicePlayBtn.disabled =
      remaining > 0 ||
      !selectedDiceNumber ||
      !Number.isFinite(betAmount) ||
      betAmount <= 0 ||
      betAmount > state.money;
}

function updateBeggarLotteryUI() {
  const config =
    GAMBLING_CONFIG
      .beggarLottery;

  const remaining =
    getCooldownRemaining(
      state.gamblingData
        .beggar_lottery_last_bought_at,
      config.cooldownMs
    );

  gamblingElements
    .beggarLotteryCooldownText
    .textContent =
      remaining > 0
        ? `다음 구매까지: ` +
          formatRemainingTime(
            remaining
          )
        : "지금 구매 가능";

  gamblingElements
    .beggarLotteryBuyBtn.disabled =
      remaining > 0 ||
      state.money < config.price;

  gamblingElements
    .beggarLotteryBuyBtn.textContent =
      `거지로또 구매 ` +
      `(${formatMoney(config.price)})`;
}

function updateGamblingStats() {
  if (
    gamblingElements
      .oddEvenStatsText
  ) {
    gamblingElements
      .oddEvenStatsText
      .textContent =
        `플레이 ` +
        `${formatPlainNumber(
          state.gamblingData
            .stats.odd_even_plays
        )}회 · 성공 ` +
        `${formatPlainNumber(
          state.gamblingData
            .stats.odd_even_wins
        )}회`;
  }

  if (
    gamblingElements
      .diceStatsText
  ) {
    gamblingElements
      .diceStatsText
      .textContent =
        `플레이 ` +
        `${formatPlainNumber(
          state.gamblingData
            .stats.dice_plays
        )}회 · 성공 ` +
        `${formatPlainNumber(
          state.gamblingData
            .stats.dice_wins
        )}회`;
  }

  if (
    gamblingElements
      .beggarLotteryStatsText
  ) {
    const lottery =
      state.gamblingData.lottery;

    gamblingElements
      .beggarLotteryStatsText
      .textContent =
        `구매 ${formatPlainNumber(
          lottery.beggar_ticket_count
        )}회 · 총 사용 ` +
        `${formatMoney(
          lottery.beggar_total_spent
        )} · 총 당첨 ` +
        `${formatMoney(
          lottery.beggar_total_won
        )}`;
  }
}

/* =========================
   재사용 대기시간
========================= */

function startCooldownTimer() {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
  }

  cooldownTimer = setInterval(
    function () {
      updateGamblingUI();
    },
    1000
  );
}

function getCooldownRemaining(
  lastPlayedAt,
  cooldownMs
) {
  if (!lastPlayedAt) {
    return 0;
  }

  const lastPlayedTime =
    new Date(lastPlayedAt).getTime();

  if (
    !Number.isFinite(
      lastPlayedTime
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    lastPlayedTime +
      cooldownMs -
      Date.now()
  );
}

function formatRemainingTime(
  milliseconds
) {
  const totalSeconds =
    Math.ceil(
      milliseconds / 1000
    );

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const seconds =
    totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}초`;
  }

  return (
    `${minutes}분 ` +
    `${seconds
      .toString()
      .padStart(2, "0")}초`
  );
}

/* =========================
   공통 검증 및 표시
========================= */

function getValidBetAmount(
  inputValue
) {
  const amount =
    Math.floor(
      Number(inputValue)
    );

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    alert(
      "베팅 금액을 올바르게 입력해주세요."
    );

    return null;
  }

  if (amount > state.money) {
    alert(
      "보유 금액보다 많이 베팅할 수 없습니다."
    );

    return null;
  }

  return amount;
}

function getOddEvenKorean(choice) {
  return choice === "odd"
    ? "홀"
    : "짝";
}

function showResult(
  element,
  message,
  success
) {
  element.textContent = message;

  element.classList.remove(
    "success",
    "failure"
  );

  element.classList.add(
    success
      ? "success"
      : "failure"
  );
}