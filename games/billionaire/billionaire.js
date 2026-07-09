const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const startBtn = document.getElementById("startBtn");
const homeBtn = document.getElementById("homeBtn");

const clickArea = document.getElementById("clickArea");

const moneyText = document.getElementById("moneyText");
const levelText = document.getElementById("levelText");
const clickPowerText = document.getElementById("clickPowerText");
const autoIncomeText = document.getElementById("autoIncomeText");

const clickUpgradeBtn = document.getElementById("clickUpgradeBtn");
const autoUpgradeBtn = document.getElementById("autoUpgradeBtn");
const levelUpBtn = document.getElementById("levelUpBtn");

const clickUpgradeCostText = document.getElementById("clickUpgradeCostText");
const autoUpgradeCostText = document.getElementById("autoUpgradeCostText");
const levelUpCostText = document.getElementById("levelUpCostText");

let money = 0;
let level = 1;

let clickPower = 1;
let autoIncome = 0;

let clickUpgradeLevel = 0;
let autoUpgradeLevel = 0;

let clickUpgradeCost = 50;
let autoUpgradeCost = 100;
let levelUpCost = 500;

startBtn.addEventListener("click", startGame);

homeBtn.addEventListener("click", function () {
  location.href = "../../index.html";
});

function startGame() {
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  // 지금은 임시 localStorage 저장.
  // 다음 단계에서 Supabase 저장/불러오기로 교체할 예정.
  loadLocalSave();
  calculateOfflineReward();
  updateUI();
}

clickArea.addEventListener("click", function (e) {
  earnMoneyByClick(e.clientX, e.clientY);
});

function earnMoneyByClick(x, y) {
  money += clickPower;
  createCoinEffect(x, y);
  updateUI();
  saveLocal();
}

function createCoinEffect(x, y) {
  const coinCount = Math.floor(Math.random() * 3) + 3; // 3~5개

  for (let i = 0; i < coinCount; i++) {
    const coin = document.createElement("div");
    coin.className = "coin";
    coin.textContent = "🪙";

    const randomX = (Math.random() - 0.5) * 120;
    const randomY = -Math.random() * 120 - 40;

    coin.style.left = `${x}px`;
    coin.style.top = `${y}px`;
    coin.style.setProperty("--x", `${randomX}px`);
    coin.style.setProperty("--y", `${randomY}px`);

    document.body.appendChild(coin);

    setTimeout(function () {
      coin.remove();
    }, 700);
  }
}

clickUpgradeBtn.addEventListener("click", function (e) {
  e.stopPropagation();

  if (money < clickUpgradeCost) return;

  money -= clickUpgradeCost;
  clickUpgradeLevel++;
  clickPower += 1 + Math.floor(clickUpgradeLevel / 5);

  clickUpgradeCost = Math.floor(clickUpgradeCost * 1.35);

  updateUI();
  saveLocal();
});

autoUpgradeBtn.addEventListener("click", function (e) {
  e.stopPropagation();

  if (money < autoUpgradeCost) return;

  money -= autoUpgradeCost;
  autoUpgradeLevel++;
  autoIncome += 1 + Math.floor(autoUpgradeLevel / 4);

  autoUpgradeCost = Math.floor(autoUpgradeCost * 1.4);

  updateUI();
  saveLocal();
});

levelUpBtn.addEventListener("click", function (e) {
  e.stopPropagation();

  if (money < levelUpCost) return;

  money -= levelUpCost;
  level++;

  levelUpCost = Math.floor(levelUpCost * 1.8);

  updateUI();
  saveLocal();
});

setInterval(function () {
  if (gameScreen.classList.contains("hidden")) return;

  money += autoIncome;
  updateUI();
}, 1000);

setInterval(function () {
  if (gameScreen.classList.contains("hidden")) return;

  saveLocal();
}, 5000);

function updateUI() {
  moneyText.textContent = formatMoney(money);
  levelText.textContent = level;

  clickPowerText.textContent = formatMoney(clickPower);
  autoIncomeText.textContent = `${formatMoney(autoIncome)} / 초`;

  clickUpgradeCostText.textContent = `비용: ${formatMoney(clickUpgradeCost)}`;
  autoUpgradeCostText.textContent = `비용: ${formatMoney(autoUpgradeCost)}`;
  levelUpCostText.textContent = `비용: ${formatMoney(levelUpCost)}`;

  clickUpgradeBtn.disabled = money < clickUpgradeCost;
  autoUpgradeBtn.disabled = money < autoUpgradeCost;
  levelUpBtn.disabled = money < levelUpCost;
}

function formatMoney(value) {
  value = Math.floor(value);

  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}억`;
  }

  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}만`;
  }

  return `${value.toLocaleString()}원`;
}

function saveLocal() {
  const saveData = {
    money,
    level,
    clickPower,
    autoIncome,
    clickUpgradeLevel,
    autoUpgradeLevel,
    clickUpgradeCost,
    autoUpgradeCost,
    levelUpCost,
    lastSavedAt: Date.now()
  };

  localStorage.setItem("billionaire_save", JSON.stringify(saveData));
}

function loadLocalSave() {
  const saved = localStorage.getItem("billionaire_save");

  if (!saved) return;

  const data = JSON.parse(saved);

  money = data.money ?? 0;
  level = data.level ?? 1;
  clickPower = data.clickPower ?? 1;
  autoIncome = data.autoIncome ?? 0;
  clickUpgradeLevel = data.clickUpgradeLevel ?? 0;
  autoUpgradeLevel = data.autoUpgradeLevel ?? 0;
  clickUpgradeCost = data.clickUpgradeCost ?? 50;
  autoUpgradeCost = data.autoUpgradeCost ?? 100;
  levelUpCost = data.levelUpCost ?? 500;
}

function calculateOfflineReward() {
  const saved = localStorage.getItem("billionaire_save");
  if (!saved) return;

  const data = JSON.parse(saved);
  if (!data.lastSavedAt) return;

  const now = Date.now();
  const offlineSeconds = Math.floor((now - data.lastSavedAt) / 1000);

  if (offlineSeconds <= 0) return;

  const offlineReward = offlineSeconds * autoIncome;
  money += offlineReward;

  saveLocal();
}