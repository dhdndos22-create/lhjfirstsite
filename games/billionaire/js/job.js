import { JOB_CHOICES, calculateJobReward } from "./config.js";
import { state, getNextAvailableJobLevel } from "./state.js";
import { elements, updateMainUI, formatMoney, formatPlainNumber } from "./ui.js";
import { saveGameData } from "./database.js";

const jobElements = {
  jobMenuBtn: document.getElementById("jobMenuBtn"),
  jobPanel: document.getElementById("jobPanel"),
  jobPanelCloseBtn: document.getElementById("jobPanelCloseBtn"),
  jobPlayerLevelText: document.getElementById("jobPlayerLevelText"),
  nextJobLevelText: document.getElementById("nextJobLevelText"),
  jobClaimedCountText: document.getElementById("jobClaimedCountText"),
  jobClickBonusText: document.getElementById("jobClickBonusText"),
  jobAutoBonusText: document.getElementById("jobAutoBonusText"),
  jobChoiceOpenBtn: document.getElementById("jobChoiceOpenBtn"),
  jobHistoryList: document.getElementById("jobHistoryList"),
  jobChoiceOverlay: document.getElementById("jobChoiceOverlay"),
  jobChoiceLevelText: document.getElementById("jobChoiceLevelText"),
  jobChoiceList: document.getElementById("jobChoiceList")
};

export function initializeJob() {
  jobElements.jobMenuBtn.addEventListener("click", openJobPanel);
  jobElements.jobPanelCloseBtn.addEventListener("click", closeJobPanel);
  jobElements.jobChoiceOpenBtn.addEventListener("click", openJobChoice);
  jobElements.jobPanel.addEventListener("click", event => event.stopPropagation());
  updateJobUI();
  renderJobHistory();
}

function openJobPanel(event) {
  event.stopPropagation();
  elements.gameMenuPanel.classList.add("hidden");
  jobElements.jobPanel.classList.remove("hidden");
  updateJobUI();
  renderJobHistory();
}

function closeJobPanel() {
  jobElements.jobPanel.classList.add("hidden");
}

export async function refreshJobOpportunity({ openChoice = false, save = false } = {}) {
  const nextLevel = getNextAvailableJobLevel();
  const changed = state.jobData.pending_selection_level !== nextLevel;
  state.jobData.pending_selection_level = nextLevel;

  updateJobUI();

  if (changed && save) {
    await saveGameData();
  }

  if (openChoice && nextLevel !== null) {
    openJobChoice();
  }

  return nextLevel;
}

function openJobChoice() {
  const pendingLevel = state.jobData.pending_selection_level;
  if (pendingLevel === null) return;

  jobElements.jobChoiceLevelText.textContent =
    `플레이어 레벨 ${pendingLevel} 달성`;
  jobElements.jobChoiceList.innerHTML = "";

  JOB_CHOICES.forEach(function (job) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "jobChoiceCard";

    const reward = calculateJobReward(job, pendingLevel);

    const clickEffect = reward.clickBonus > 0
      ? `클릭당 수입 +${formatPlainNumber(reward.clickBonus)}원`
      : "클릭 수입 증가 없음";

    const autoEffect = reward.autoBonus > 0
      ? `초당 수입 +${formatPlainNumber(reward.autoBonus)}원`
      : "초당 수입 증가 없음";

    card.innerHTML = `
      <div class="jobChoiceIcon">${job.icon}</div>
      <h3>${job.name}</h3>
      <p>${clickEffect}</p>
      <p>${autoEffect}</p>
    `;

    card.addEventListener("click", () => selectJob(job));
    jobElements.jobChoiceList.appendChild(card);
  });

  jobElements.jobChoiceOverlay.classList.remove("hidden");
}

async function selectJob(job) {
  const selectedLevel = state.jobData.pending_selection_level;
  if (selectedLevel === null) return;

  const reward = calculateJobReward(job, selectedLevel);

  state.jobData.click_bonus += reward.clickBonus;
  state.jobData.auto_bonus += reward.autoBonus;

  state.jobData.selected_jobs.push({
    level: selectedLevel,
    id: job.id,
    name: job.name,
    click_bonus: reward.clickBonus,
    auto_bonus: reward.autoBonus,
    selected_at: new Date().toISOString()
  });

  if (!state.jobData.claimed_levels.includes(selectedLevel)) {
    state.jobData.claimed_levels.push(selectedLevel);
    state.jobData.claimed_levels.sort((a, b) => a - b);
  }

  state.jobData.pending_selection_level = getNextAvailableJobLevel();
  jobElements.jobChoiceOverlay.classList.add("hidden");

  updateMainUI();
  updateJobUI();
  renderJobHistory();
  await saveGameData();

  if (state.jobData.pending_selection_level !== null) {
    openJobChoice();
  }
}

export function updateJobUI() {
  jobElements.jobPlayerLevelText.textContent = state.level;
  jobElements.jobClaimedCountText.textContent =
    `${state.jobData.claimed_levels.length} / 10회`;

  const pendingLevel = state.jobData.pending_selection_level;
  let nextTarget = null;

  for (let level = 10; level <= 100; level += 10) {
    if (!state.jobData.claimed_levels.includes(level)) {
      nextTarget = level;
      break;
    }
  }

  if (pendingLevel !== null) {
    jobElements.nextJobLevelText.textContent = `Lv.${pendingLevel} 취업 가능`;
  } else if (nextTarget !== null) {
    jobElements.nextJobLevelText.textContent = `Lv.${nextTarget}`;
  } else {
    jobElements.nextJobLevelText.textContent = "모든 취업 완료";
  }

  jobElements.jobClickBonusText.textContent = formatMoney(state.jobData.click_bonus);
  jobElements.jobAutoBonusText.textContent = `${formatMoney(state.jobData.auto_bonus)} / 초`;

  jobElements.jobChoiceOpenBtn.classList.toggle("hidden", pendingLevel === null);
  jobElements.jobChoiceOpenBtn.disabled = pendingLevel === null;
}

export function renderJobHistory() {
  const jobs = state.jobData.selected_jobs;

  if (jobs.length === 0) {
    jobElements.jobHistoryList.textContent = "아직 선택한 직업이 없습니다.";
    return;
  }

  jobElements.jobHistoryList.innerHTML = "";
  [...jobs].reverse().forEach(function (job) {
    const item = document.createElement("div");
    item.className = "jobHistoryItem";
    item.textContent =
      `Lv.${job.level} ${job.name}` +
      ` · 클릭 +${formatPlainNumber(job.click_bonus)}원` +
      ` · 초당 +${formatPlainNumber(job.auto_bonus)}원`;
    jobElements.jobHistoryList.appendChild(item);
  });
}
