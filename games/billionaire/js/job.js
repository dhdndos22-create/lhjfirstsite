import { JOB_CHOICES } from "./config.js";
import { state } from "./state.js";

import {
  elements,
  updateMainUI,
  formatMoney,
  formatPlainNumber
} from "./ui.js";

import { saveGameData } from "./database.js";

const jobElements = {
  jobMenuBtn:
    document.getElementById("jobMenuBtn"),

  jobPanel:
    document.getElementById("jobPanel"),

  jobPanelCloseBtn:
    document.getElementById(
      "jobPanelCloseBtn"
    ),

  jobLevelText:
    document.getElementById("jobLevelText"),

  nextJobLevelText:
    document.getElementById(
      "nextJobLevelText"
    ),

  jobClickBonusText:
    document.getElementById(
      "jobClickBonusText"
    ),

  jobAutoBonusText:
    document.getElementById(
      "jobAutoBonusText"
    ),

  jobLevelUpBtn:
    document.getElementById(
      "jobLevelUpBtn"
    ),

  jobLevelUpCostText:
    document.getElementById(
      "jobLevelUpCostText"
    ),

  jobHistoryList:
    document.getElementById(
      "jobHistoryList"
    ),

  jobChoiceOverlay:
    document.getElementById(
      "jobChoiceOverlay"
    ),

  jobChoiceLevelText:
    document.getElementById(
      "jobChoiceLevelText"
    ),

  jobChoiceList:
    document.getElementById(
      "jobChoiceList"
    )
};

export function initializeJob() {
  jobElements.jobMenuBtn.addEventListener(
    "click",
    openJobPanel
  );

  jobElements.jobPanelCloseBtn.addEventListener(
    "click",
    closeJobPanel
  );

  jobElements.jobPanel.addEventListener(
    "click",
    function (event) {
      event.stopPropagation();
    }
  );

  jobElements.jobLevelUpBtn.addEventListener(
    "click",
    upgradeJobLevel
  );

  updateJobUI();
}

function openJobPanel(event) {
  event.stopPropagation();

  elements.gameMenuPanel.classList.add(
    "hidden"
  );

  jobElements.jobPanel.classList.remove(
    "hidden"
  );

  updateJobUI();

  if (
    state.jobData.pending_selection_level !==
    null
  ) {
    openJobChoice();
  }
}

function closeJobPanel() {
  jobElements.jobPanel.classList.add(
    "hidden"
  );
}

async function upgradeJobLevel() {
  if (
    state.jobData.pending_selection_level !==
    null
  ) {
    openJobChoice();
    return;
  }

  if (
    state.money <
    state.jobData.level_up_cost
  ) {
    return;
  }

  state.money -=
    state.jobData.level_up_cost;

  state.jobData.level++;

  state.jobData.level_up_cost =
    Math.floor(
      state.jobData.level_up_cost * 1.35
    );

  if (
    state.jobData.level % 10 === 0
  ) {
    state.jobData.pending_selection_level =
      state.jobData.level;
  }

  updateMainUI();
  updateJobUI();

  await saveGameData();

  if (
    state.jobData.pending_selection_level !==
    null
  ) {
    openJobChoice();
  }
}

function openJobChoice() {
  const pendingLevel =
    state.jobData.pending_selection_level;

  if (pendingLevel === null) return;

  jobElements.jobChoiceLevelText.textContent =
    `직업 레벨 ${pendingLevel} 달성`;

  jobElements.jobChoiceList.innerHTML = "";

  JOB_CHOICES.forEach(function (job) {
    const card =
      document.createElement("button");

    card.type = "button";
    card.className = "jobChoiceCard";

    const clickEffect =
      job.clickBonus > 0
        ? `클릭당 수입 +${formatPlainNumber(
            job.clickBonus
          )}원`
        : "클릭 수입 증가 없음";

    const autoEffect =
      job.autoBonus > 0
        ? `초당 수입 +${formatPlainNumber(
            job.autoBonus
          )}원`
        : "초당 수입 증가 없음";

    card.innerHTML = `
      <div class="jobChoiceIcon">
        ${job.icon}
      </div>

      <h3>${job.name}</h3>

      <p>${clickEffect}</p>
      <p>${autoEffect}</p>
    `;

    card.addEventListener(
      "click",
      function () {
        selectJob(job);
      }
    );

    jobElements.jobChoiceList.appendChild(
      card
    );
  });

  jobElements.jobChoiceOverlay.classList.remove(
    "hidden"
  );
}

async function selectJob(job) {
  const selectedLevel =
    state.jobData.pending_selection_level;

  if (selectedLevel === null) return;

  state.jobData.click_bonus +=
    job.clickBonus;

  state.jobData.auto_bonus +=
    job.autoBonus;

  state.jobData.selected_jobs.push({
    level: selectedLevel,
    id: job.id,
    name: job.name,

    click_bonus: job.clickBonus,
    auto_bonus: job.autoBonus,

    selected_at:
      new Date().toISOString()
  });

  state.jobData.pending_selection_level =
    null;

  jobElements.jobChoiceOverlay.classList.add(
    "hidden"
  );

  updateMainUI();
  updateJobUI();

  await saveGameData();
}

export function updateJobUI() {
  jobElements.jobLevelText.textContent =
    state.jobData.level;

  const nextJobLevel =
    Math.ceil(
      (state.jobData.level + 1) / 10
    ) * 10;

  jobElements.nextJobLevelText.textContent =
    state.jobData.pending_selection_level !==
    null
      ? "지금 취업 가능"
      : `레벨 ${nextJobLevel}`;

  jobElements.jobClickBonusText.textContent =
    formatMoney(
      state.jobData.click_bonus
    );

  jobElements.jobAutoBonusText.textContent =
    `${formatMoney(
      state.jobData.auto_bonus
    )} / 초`;

  jobElements.jobLevelUpCostText.textContent =
    `비용: ${formatMoney(
      state.jobData.level_up_cost
    )}`;

  if (
    state.jobData.pending_selection_level !==
    null
  ) {
    jobElements.jobLevelUpBtn.disabled =
      false;

    jobElements.jobLevelUpBtn.innerHTML = `
      취업 선택하기
      <span>
        직업을 선택해야 다음 레벨로 갈 수 있습니다.
      </span>
    `;
  } else {
    jobElements.jobLevelUpBtn.disabled =
      state.money <
      state.jobData.level_up_cost;

    jobElements.jobLevelUpBtn.innerHTML = `
      직업 레벨업
      <span>
        비용: ${formatMoney(
          state.jobData.level_up_cost
        )}
      </span>
    `;
  }

  renderJobHistory();
}

function renderJobHistory() {
  const jobs =
    state.jobData.selected_jobs;

  if (jobs.length === 0) {
    jobElements.jobHistoryList.textContent =
      "아직 직업이 없습니다.";

    return;
  }

  jobElements.jobHistoryList.innerHTML = "";

  [...jobs]
    .reverse()
    .forEach(function (job) {
      const item =
        document.createElement("div");

      item.className = "jobHistoryItem";

      item.textContent =
        `Lv.${job.level} ${job.name}` +
        ` · 클릭 +${formatPlainNumber(
          job.click_bonus
        )}원` +
        ` · 초당 +${formatPlainNumber(
          job.auto_bonus
        )}원`;

      jobElements.jobHistoryList.appendChild(
        item
      );
    });
}