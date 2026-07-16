import { GAMBLING_CONFIG } from "./config.js";
import { state } from "./state.js";
import { elements, updateMainUI, formatMoney, formatPlainNumber } from "./ui.js";
import { saveGameData } from "./database.js";

let ui = null;
let selectedOddEven = null;
let selectedDiceNumber = null;
let cooldownTimer = null;
let isProcessing = false;

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function getElements() {
  return {
    menuBtn: document.getElementById("gamblingMenuBtn"),
    panel: document.getElementById("gamblingPanel"),
    closeBtn: document.getElementById("gamblingPanelCloseBtn"),
    home: document.getElementById("gamblingHome"),
    cards: document.querySelectorAll(".gamblingGameCard[data-section]"),
    backBtns: document.querySelectorAll(".gamblingBackBtn"),
    sections: document.querySelectorAll(".gamblingDetail"),
    totalPlays: document.getElementById("gamblingTotalPlaysText"),
    totalWins: document.getElementById("gamblingTotalWinsText"),
    oddEvenCardCooldown: document.getElementById("oddEvenCardCooldown"),
    diceCardCooldown: document.getElementById("diceCardCooldown"),
    lotteryCardCooldown: document.getElementById("lotteryCardCooldown"),
    commonLotteryCardCooldown: document.getElementById("commonLotteryCardCooldown"),

    oddEvenBetInput: document.getElementById("oddEvenBetInput"),
    oddChoiceBtn: document.getElementById("oddChoiceBtn"),
    evenChoiceBtn: document.getElementById("evenChoiceBtn"),
    oddEvenPlayBtn: document.getElementById("oddEvenPlayBtn"),
    oddEvenCooldownText: document.getElementById("oddEvenCooldownText"),
    oddEvenResultText: document.getElementById("oddEvenResultText"),
    oddEvenStatsText: document.getElementById("oddEvenStatsText"),
    oddEvenResultOverlay: document.getElementById("oddEvenResultOverlay"),
    oddEvenPopupIcon: document.getElementById("oddEvenPopupIcon"),
    oddEvenPopupTitle: document.getElementById("oddEvenPopupTitle"),
    oddEvenPopupMessage: document.getElementById("oddEvenPopupMessage"),
    oddEvenPopupConfirmBtn: document.getElementById("oddEvenPopupConfirmBtn"),

    diceBetInput: document.getElementById("diceBetInput"),
    diceNumberButtons: document.querySelectorAll(".diceNumberBtn"),
    dicePlayBtn: document.getElementById("dicePlayBtn"),
    diceCooldownText: document.getElementById("diceCooldownText"),
    diceResultText: document.getElementById("diceResultText"),
    diceStatsText: document.getElementById("diceStatsText"),
    diceAnimation: document.getElementById("diceAnimation"),

    beggarLotteryBuyBtn: document.getElementById("beggarLotteryBuyBtn"),
    beggarLotteryCooldownText: document.getElementById("beggarLotteryCooldownText"),
    beggarLotteryResultText: document.getElementById("beggarLotteryResultText"),
    beggarLotteryStatsText: document.getElementById("beggarLotteryStatsText"),

    commonLotteryBuyBtn: document.getElementById("commonLotteryBuyBtn"),
    commonLotteryCooldownText: document.getElementById("commonLotteryCooldownText"),
    commonLotteryResultText: document.getElementById("commonLotteryResultText"),
    commonLotteryStatsText: document.getElementById("commonLotteryStatsText")
  };
}

export function initializeGambling() {
  ui = getElements();
  const required = [
    "menuBtn", "panel", "closeBtn", "home",
    "oddEvenBetInput", "oddChoiceBtn", "evenChoiceBtn", "oddEvenPlayBtn",
    "diceBetInput", "dicePlayBtn", "diceAnimation", "beggarLotteryBuyBtn",
    "commonLotteryBuyBtn", "oddEvenResultOverlay", "oddEvenPopupConfirmBtn"
  ];
  const missing = required.filter((key) => !ui[key]);
  if (missing.length) {
    console.error("도박 HTML 요소가 없습니다:", missing);
    return;
  }

  ui.menuBtn.addEventListener("click", openPanel);
  ui.closeBtn.addEventListener("click", closePanel);
  ui.panel.addEventListener("click", (event) => event.stopPropagation());
  ui.cards.forEach((card) => card.addEventListener("click", () => showSection(card.dataset.section)));
  ui.backBtns.forEach((button) => button.addEventListener("click", showHome));

  ui.oddChoiceBtn.addEventListener("click", () => selectOddEven("odd"));
  ui.evenChoiceBtn.addEventListener("click", () => selectOddEven("even"));
  ui.oddEvenPlayBtn.addEventListener("click", playOddEven);
  ui.oddEvenBetInput.addEventListener("input", updateGamblingUI);

  ui.diceNumberButtons.forEach((button) => {
    button.addEventListener("click", () => selectDiceNumber(Number(button.dataset.number)));
  });
  ui.dicePlayBtn.addEventListener("click", playDice);
  ui.diceBetInput.addEventListener("input", updateGamblingUI);

  ui.beggarLotteryBuyBtn.addEventListener("click", buyBeggarLottery);
  ui.commonLotteryBuyBtn.addEventListener("click", buyCommonLottery);

  showHome();
  updateGamblingUI();
  cooldownTimer = setInterval(updateGamblingUI, 1000);
}

function openPanel(event) {
  event.stopPropagation();
  elements.gameMenuPanel.classList.add("hidden");
  ui.panel.classList.remove("hidden");
  showHome();
  updateGamblingUI();
}

function closePanel() {
  ui.panel.classList.add("hidden");
}

function showHome() {
  ui.home.classList.remove("hidden");
  ui.sections.forEach((section) => section.classList.add("hidden"));
}

function showSection(sectionId) {
  ui.home.classList.add("hidden");
  ui.sections.forEach((section) => section.classList.toggle("hidden", section.id !== sectionId));
  updateGamblingUI();
}

function selectOddEven(choice) {
  selectedOddEven = choice;
  ui.oddChoiceBtn.classList.toggle("selected", choice === "odd");
  ui.evenChoiceBtn.classList.toggle("selected", choice === "even");
  updateGamblingUI();
}

function selectDiceNumber(number) {
  selectedDiceNumber = number;
  ui.diceNumberButtons.forEach((button) => {
    button.classList.toggle("selected", Number(button.dataset.number) === number);
  });
  updateGamblingUI();
}

async function playOddEven() {
  if (isProcessing) return;
  const remaining = getCooldownRemaining(
    state.gamblingData.odd_even_last_played_at,
    GAMBLING_CONFIG.oddEven.cooldownMs
  );

  if (remaining > 0) {
    return showResult(
      ui.oddEvenResultText,
      `아직 ${formatRemainingTime(remaining)} 남았습니다.`,
      false
    );
  }

  const bet = getValidBetAmount(
    ui.oddEvenBetInput.value,
    ui.oddEvenResultText
  );

  if (!bet) return;
  if (!selectedOddEven) {
    return showResult(
      ui.oddEvenResultText,
      "홀 또는 짝을 선택해주세요.",
      false
    );
  }

  isProcessing = true;
  updateGamblingUI();

  try {
    state.money -= bet;

    const number = Math.floor(Math.random() * 100) + 1;
    const result = number % 2 === 0 ? "even" : "odd";
    const success = result === selectedOddEven;
    const reward = success
      ? bet * GAMBLING_CONFIG.oddEven.rewardMultiplier
      : 0;

    state.gamblingData.stats.odd_even_plays++;

    if (success) {
      state.money += reward;
      state.gamblingData.stats.odd_even_wins++;
    }

    state.gamblingData.odd_even_last_played_at =
      new Date().toISOString();

    ui.oddEvenBetInput.value = "";
    selectedOddEven = null;
    ui.oddChoiceBtn.classList.remove("selected");
    ui.evenChoiceBtn.classList.remove("selected");

    updateMainUI();
    updateGamblingUI();
    await saveGameData();

    await showOddEvenResultPopup({
      number,
      result,
      success,
      bet,
      reward
    });

    showResult(
      ui.oddEvenResultText,
      success
        ? `성공! ${number}(${result === "odd" ? "홀" : "짝"}) · ${formatMoney(reward)} 지급`
        : `실패! ${number}(${result === "odd" ? "홀" : "짝"}) · ${formatMoney(bet)} 손실`,
      success
    );
  } catch (error) {
    console.error("홀짝게임 처리 오류:", error);
    showResult(
      ui.oddEvenResultText,
      "홀짝게임 처리 중 오류가 발생했습니다.",
      false
    );
  } finally {
    isProcessing = false;
    updateGamblingUI();
  }
}

async function playDice() {
  if (isProcessing) return;
  const remaining = getCooldownRemaining(
    state.gamblingData.dice_last_played_at,
    GAMBLING_CONFIG.dice.cooldownMs
  );

  if (remaining > 0) {
    return showResult(
      ui.diceResultText,
      `아직 ${formatRemainingTime(remaining)} 남았습니다.`,
      false
    );
  }

  const bet = getValidBetAmount(
    ui.diceBetInput.value,
    ui.diceResultText
  );

  if (!bet) return;
  if (!Number.isInteger(selectedDiceNumber)) {
    return showResult(
      ui.diceResultText,
      "1부터 6 중 하나를 선택해주세요.",
      false
    );
  }

  isProcessing = true;
  updateGamblingUI();

  try {
    state.money -= bet;
    const result = Math.floor(Math.random() * 6) + 1;

    showResult(
      ui.diceResultText,
      "주사위를 굴리는 중입니다...",
      true
    );

    await playDiceAnimation(result);

    const success = result === selectedDiceNumber;
    state.gamblingData.stats.dice_plays++;

    if (success) {
      const reward = bet * GAMBLING_CONFIG.dice.rewardMultiplier;
      state.money += reward;
      state.gamblingData.stats.dice_wins++;
      showResult(
        ui.diceResultText,
        `성공! 주사위 ${result} · ${formatMoney(reward)} 지급`,
        true
      );
    } else {
      showResult(
        ui.diceResultText,
        `실패! 주사위 ${result} · ${formatMoney(bet)} 손실`,
        false
      );
    }

    state.gamblingData.dice_last_played_at =
      new Date().toISOString();
    ui.diceBetInput.value = "";
    selectedDiceNumber = null;
    ui.diceNumberButtons.forEach((button) =>
      button.classList.remove("selected")
    );

    updateMainUI();
    updateGamblingUI();
    await saveGameData();
  } catch (error) {
    console.error("주사위게임 처리 오류:", error);
    showResult(
      ui.diceResultText,
      "주사위게임 처리 중 오류가 발생했습니다.",
      false
    );
  } finally {
    isProcessing = false;
    updateGamblingUI();
  }
}

async function buyBeggarLottery() {
  if (isProcessing) return;
  const config = GAMBLING_CONFIG.beggarLottery;
  const remaining = getCooldownRemaining(state.gamblingData.beggar_lottery_last_bought_at, config.cooldownMs);
  if (remaining > 0) return showResult(ui.beggarLotteryResultText, `아직 ${formatRemainingTime(remaining)} 남았습니다.`, false);
  if (state.money < config.price) return showResult(ui.beggarLotteryResultText, `${formatMoney(config.price)}이 필요합니다.`, false);

  isProcessing = true;
  try {
    state.money -= config.price;
    const random = Math.random() * 100;
    const result = config.rewards.find((item) => random >= item.min && random < item.max);
    const reward = result?.reward ?? 0;
    state.money += reward;

    const lottery = state.gamblingData.lottery;
    lottery.beggar_ticket_count++;
    lottery.beggar_total_spent += config.price;
    lottery.beggar_total_won += reward;
    state.gamblingData.beggar_lottery_last_bought_at = new Date().toISOString();

    showResult(ui.beggarLotteryResultText, reward > 0 ? `축하합니다! ${result.label}!` : "아쉽지만 꽝입니다.", reward > 0);
    updateMainUI();
    updateGamblingUI();
    await saveGameData();
  } finally {
    isProcessing = false;
  }
}

async function buyCommonLottery() {
  if (isProcessing) return;
  const config = GAMBLING_CONFIG.commonLottery;
  const remaining = getCooldownRemaining(
    state.gamblingData.common_lottery_last_bought_at,
    config.cooldownMs
  );

  if (remaining > 0) {
    return showResult(
      ui.commonLotteryResultText,
      `아직 ${formatRemainingTime(remaining)} 남았습니다.`,
      false
    );
  }

  if (state.money < config.price) {
    return showResult(
      ui.commonLotteryResultText,
      `${formatMoney(config.price)}이 필요합니다.`,
      false
    );
  }

  isProcessing = true;
  try {
    state.money -= config.price;

    const random = Math.random() * 100;
    const result = config.rewards.find(
      (item) => random >= item.min && random < item.max
    );
    const reward = result?.reward ?? 0;
    state.money += reward;

    const lottery = state.gamblingData.lottery;
    lottery.common_ticket_count++;
    lottery.common_total_spent += config.price;
    lottery.common_total_won += reward;

    state.gamblingData.common_lottery_last_bought_at =
      new Date().toISOString();

    showResult(
      ui.commonLotteryResultText,
      reward > 0
        ? `축하합니다! ${result.label}!`
        : "아쉽지만 꽝입니다.",
      reward > 0
    );

    updateMainUI();
    updateGamblingUI();
    await saveGameData();
  } finally {
    isProcessing = false;
  }
}

export function updateGamblingUI() {
  if (!ui) return;
  const oddRemaining = getCooldownRemaining(state.gamblingData.odd_even_last_played_at, GAMBLING_CONFIG.oddEven.cooldownMs);
  const diceRemaining = getCooldownRemaining(state.gamblingData.dice_last_played_at, GAMBLING_CONFIG.dice.cooldownMs);
  const lotteryRemaining = getCooldownRemaining(state.gamblingData.beggar_lottery_last_bought_at, GAMBLING_CONFIG.beggarLottery.cooldownMs);
  const commonLotteryRemaining = getCooldownRemaining(
    state.gamblingData.common_lottery_last_bought_at,
    GAMBLING_CONFIG.commonLottery.cooldownMs
  );

  setCooldown(ui.oddEvenCooldownText, ui.oddEvenCardCooldown, oddRemaining, "플레이");
  setCooldown(ui.diceCooldownText, ui.diceCardCooldown, diceRemaining, "플레이");
  setCooldown(ui.beggarLotteryCooldownText, ui.lotteryCardCooldown, lotteryRemaining, "구매");
  setCooldown(
    ui.commonLotteryCooldownText,
    ui.commonLotteryCardCooldown,
    commonLotteryRemaining,
    "구매"
  );

  const oddBet = Number(ui.oddEvenBetInput.value);
  ui.oddEvenPlayBtn.disabled = isProcessing || oddRemaining > 0 || !selectedOddEven || !Number.isFinite(oddBet) || oddBet <= 0 || oddBet > state.money;

  const diceBet = Number(ui.diceBetInput.value);
  ui.dicePlayBtn.disabled = isProcessing || diceRemaining > 0 || !selectedDiceNumber || !Number.isFinite(diceBet) || diceBet <= 0 || diceBet > state.money;

  ui.beggarLotteryBuyBtn.disabled = lotteryRemaining > 0 || state.money < GAMBLING_CONFIG.beggarLottery.price;
  ui.beggarLotteryBuyBtn.textContent = `거지로또 구매 (${formatMoney(GAMBLING_CONFIG.beggarLottery.price)})`;

  ui.commonLotteryBuyBtn.disabled =
    commonLotteryRemaining > 0 ||
    state.money < GAMBLING_CONFIG.commonLottery.price;
  ui.commonLotteryBuyBtn.textContent =
    `서민로또 구매 (${formatMoney(GAMBLING_CONFIG.commonLottery.price)})`;

  const stats = state.gamblingData.stats;
  const totalPlays = stats.odd_even_plays + stats.dice_plays;
  const totalWins = stats.odd_even_wins + stats.dice_wins;
  ui.totalPlays.textContent = `${formatPlainNumber(totalPlays)}회`;
  ui.totalWins.textContent = `${formatPlainNumber(totalWins)}회`;
  ui.oddEvenStatsText.textContent = `플레이 ${formatPlainNumber(stats.odd_even_plays)}회 · 성공 ${formatPlainNumber(stats.odd_even_wins)}회`;
  ui.diceStatsText.textContent = `플레이 ${formatPlainNumber(stats.dice_plays)}회 · 성공 ${formatPlainNumber(stats.dice_wins)}회`;

  const lottery = state.gamblingData.lottery;
  ui.beggarLotteryStatsText.textContent = `구매 ${formatPlainNumber(lottery.beggar_ticket_count)}회 · 총 사용 ${formatMoney(lottery.beggar_total_spent)} · 총 당첨 ${formatMoney(lottery.beggar_total_won)}`;
  ui.commonLotteryStatsText.textContent = `구매 ${formatPlainNumber(lottery.common_ticket_count)}회 · 총 사용 ${formatMoney(lottery.common_total_spent)} · 총 당첨 ${formatMoney(lottery.common_total_won)}`;
}

function setCooldown(detailElement, cardElement, remaining, action) {
  const text = remaining > 0 ? `다음 ${action}까지: ${formatRemainingTime(remaining)}` : `지금 ${action} 가능`;
  if (detailElement) detailElement.textContent = text;
  if (cardElement) cardElement.textContent = text;
}

function getCooldownRemaining(lastPlayedAt, cooldownMs) {
  if (!lastPlayedAt) return 0;
  const time = new Date(lastPlayedAt).getTime();
  if (!Number.isFinite(time)) return 0;
  return Math.max(0, time + cooldownMs - Date.now());
}

function formatRemainingTime(milliseconds) {
  const secondsTotal = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(secondsTotal / 60);
  const seconds = secondsTotal % 60;
  return minutes > 0 ? `${minutes}분 ${String(seconds).padStart(2, "0")}초` : `${seconds}초`;
}

function getValidBetAmount(value, resultElement) {
  const amount = Math.floor(Number(value));
  if (!Number.isFinite(amount) || amount <= 0) {
    showResult(resultElement, "베팅 금액을 올바르게 입력해주세요.", false);
    return null;
  }
  if (amount > state.money) {
    showResult(resultElement, "보유 금액보다 많이 베팅할 수 없습니다.", false);
    return null;
  }
  return amount;
}

function playDiceAnimation(finalNumber) {
  return new Promise((resolve) => {
    if (!ui.diceAnimation) {
      resolve();
      return;
    }

    ui.diceAnimation.classList.add("rolling");

    const intervalId = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * DICE_FACES.length);
      ui.diceAnimation.textContent = DICE_FACES[randomIndex];
    }, 80);

    window.setTimeout(() => {
      window.clearInterval(intervalId);
      ui.diceAnimation.classList.remove("rolling");
      ui.diceAnimation.textContent = DICE_FACES[finalNumber - 1];
      ui.diceAnimation.classList.add("landed");

      window.setTimeout(() => {
        ui.diceAnimation.classList.remove("landed");
        resolve();
      }, 280);
    }, 1100);
  });
}

function showOddEvenResultPopup({ number, result, success, bet, reward }) {
  return new Promise((resolve) => {
    const overlay = ui.oddEvenResultOverlay;
    const button = ui.oddEvenPopupConfirmBtn;

    if (!overlay || !button) {
      resolve();
      return;
    }

    let revealed = false;

    ui.oddEvenPopupIcon.textContent = "❓";
    ui.oddEvenPopupTitle.textContent = "결과 확인";
    ui.oddEvenPopupMessage.textContent =
      "결과를 확인하시겠습니까?";
    button.textContent = "결과 확인";
    overlay.classList.remove("hidden");

    button.onclick = function () {
      if (!revealed) {
        revealed = true;
        const resultLabel = result === "odd" ? "홀" : "짝";

        ui.oddEvenPopupIcon.textContent = success ? "🎉" : "😢";
        ui.oddEvenPopupTitle.textContent = success ? "당첨!" : "아쉽습니다";
        ui.oddEvenPopupMessage.innerHTML = success
          ? `<strong>결과: ${number} (${resultLabel})</strong><br><br>${formatMoney(reward)}을 지급받았습니다.`
          : `<strong>결과: ${number} (${resultLabel})</strong><br><br>${formatMoney(bet)}을 잃었습니다.`;
        button.textContent = "확인";
        return;
      }

      overlay.classList.add("hidden");
      button.onclick = null;
      resolve();
    };
  });
}

function showResult(element, message, success) {
  element.textContent = message;
  element.classList.remove("success", "failure");
  element.classList.add(success ? "success" : "failure");
}
