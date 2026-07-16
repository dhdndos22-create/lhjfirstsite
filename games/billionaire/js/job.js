import {
  JOB_CHOICES,
  calculateJobReward,
  getJobChoicesByLevel
} from "./config.js";
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

const configuredJobLevels = Object.keys(JOB_CHOICES)
  .map(Number)
  .filter(Number.isInteger)
  .sort((a, b) => a - b);

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

  const availableJobs = getJobChoicesByLevel(pendingLevel);
  if (availableJobs.length === 0) return;

  jobElements.jobChoiceLevelText.textContent =
    `플레이어 레벨 ${pendingLevel} 달성`;
  jobElements.jobChoiceList.innerHTML = "";

  availableJobs.forEach(function (job) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "jobChoiceCard";

    const reward = calculateJobReward(job);

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

    card.addEventListener("click", () => selectJob(job, pendingLevel));
    jobElements.jobChoiceList.appendChild(card);
  });

  jobElements.jobChoiceOverlay.classList.remove("hidden");
}

async function selectJob(job, selectedLevel) {
  if (!Number.isInteger(selectedLevel)) return;
  if (state.jobData.claimed_levels.includes(selectedLevel)) return;

  const reward = calculateJobReward(job);
  const selectedJob = {
    id: job.id,
    name: job.name,
    icon: job.icon,
    level: selectedLevel,
    selected_level: selectedLevel,
    click_bonus: reward.clickBonus,
    auto_bonus: reward.autoBonus
  };

  // 새 직업을 고르면 이전 직업 효과는 사라지고 현재 직업 효과로 교체된다.
  state.jobData.current_job = selectedJob;
  state.jobData.click_bonus = reward.clickBonus;
  state.jobData.auto_bonus = reward.autoBonus;
  state.jobData.selected_jobs.push(selectedJob);
  state.jobData.claimed_levels.push(selectedLevel);
  state.jobData.claimed_levels.sort((a, b) => a - b);
  state.jobData.pending_selection_level = null;

  jobElements.jobChoiceOverlay.classList.add("hidden");
  updateMainUI();
  updateJobUI();
  renderJobHistory();

  await refreshJobOpportunity({ openChoice: false, save: false });
  await saveGameData();
}

export function updateJobUI() {
  jobElements.jobPlayerLevelText.textContent = state.level;
  jobElements.jobClaimedCountText.textContent =
    `${state.jobData.claimed_levels.length} / ${configuredJobLevels.length}회`;

  const pendingLevel = state.jobData.pending_selection_level;
  const nextTarget = configuredJobLevels.find(level =>
    !state.jobData.claimed_levels.includes(level)
  ) ?? null;

  if (pendingLevel !== null) {
    jobElements.nextJobLevelText.textContent = `Lv.${pendingLevel} 취업 가능`;
  } else if (nextTarget !== null) {
    jobElements.nextJobLevelText.textContent = `Lv.${nextTarget}`;
  } else {
    jobElements.nextJobLevelText.textContent = "현재 등록된 취업 완료";
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

    const level = Number(job.selected_level ?? job.level ?? 0);
    const isCurrent = state.jobData.current_job &&
      Number(state.jobData.current_job.selected_level ?? state.jobData.current_job.level) === level;

    item.textContent =
      `${isCurrent ? "[현재] " : ""}Lv.${level} ${job.name}` +
      ` · 클릭 +${formatPlainNumber(job.click_bonus)}원` +
      ` · 초당 +${formatPlainNumber(job.auto_bonus)}원`;
    jobElements.jobHistoryList.appendChild(item);
  });
}
