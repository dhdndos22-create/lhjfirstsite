import { EMPLOYEE_CONFIG, GAME_BALANCE } from "./config.js";
import { state, getEmployeeAutoIncome } from "./state.js";
import { elements, updateMainUI, formatMoney } from "./ui.js";
import { saveGameData } from "./database.js";

const EMPLOYEES_PER_PAGE = 4;
let currentEmployeePage = 1;
let employeeElements = null;
let isProcessing = false;

function getEmployeeElements() {
  return {
    employeeMenuBtn: document.getElementById("employeeMenuBtn"),
    employeePanel: document.getElementById("employeePanel"),
    employeePanelCloseBtn: document.getElementById("employeePanelCloseBtn"),
    employeeList: document.getElementById("employeeList"),
    employeeTotalCountText: document.getElementById("employeeTotalCountText"),
    employeeTotalIncomeText: document.getElementById("employeeTotalIncomeText"),
    employeePrevBtn: document.getElementById("employeePrevBtn"),
    employeeNextBtn: document.getElementById("employeeNextBtn"),
    employeePageText: document.getElementById("employeePageText")
  };
}

export function initializeEmployee() {
  employeeElements = getEmployeeElements();

  const missingElements = Object.entries(employeeElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error("알바 고용 HTML 요소가 없습니다:", missingElements);
    return;
  }

  employeeElements.employeeMenuBtn.addEventListener("click", openEmployeePanel);
  employeeElements.employeePanelCloseBtn.addEventListener("click", closeEmployeePanel);
  employeeElements.employeePrevBtn.addEventListener("click", goToPreviousEmployeePage);
  employeeElements.employeeNextBtn.addEventListener("click", goToNextEmployeePage);
  employeeElements.employeePanel.addEventListener("click", (event) => event.stopPropagation());

  renderEmployeeList();
  updateEmployeeUI();
}

function openEmployeePanel(event) {
  event.stopPropagation();
  elements.gameMenuPanel.classList.add("hidden");
  employeeElements.employeePanel.classList.remove("hidden");
  renderEmployeeList();
  updateEmployeeUI();
}

function closeEmployeePanel() {
  employeeElements.employeePanel.classList.add("hidden");
}

function getTotalEmployeePages() {
  return Math.max(1, Math.ceil(EMPLOYEE_CONFIG.length / EMPLOYEES_PER_PAGE));
}

function goToPreviousEmployeePage() {
  if (currentEmployeePage <= 1) return;
  currentEmployeePage--;
  renderEmployeeList();
}

function goToNextEmployeePage() {
  if (currentEmployeePage >= getTotalEmployeePages()) return;
  currentEmployeePage++;
  renderEmployeeList();
}

export function renderEmployeeList() {
  if (!employeeElements?.employeeList) return;

  const startIndex = (currentEmployeePage - 1) * EMPLOYEES_PER_PAGE;
  const pageEmployees = EMPLOYEE_CONFIG.slice(startIndex, startIndex + EMPLOYEES_PER_PAGE);

  employeeElements.employeeList.innerHTML = "";
  pageEmployees.forEach((employee) => {
    employeeElements.employeeList.appendChild(createEmployeeCard(employee));
  });

  updateEmployeePagination();
}

function createEmployeeCard(employee) {
  const savedEmployee = getSavedEmployee(employee.id);
  const hired = savedEmployee.hired;
  const level = savedEmployee.level;
  const maxLevel = Number(GAME_BALANCE.EMPLOYEE.MAX_LEVEL);
  const isMaxLevel = hired && level >= maxLevel;
  const currentIncome = hired ? calculateEmployeeIncome(employee, level) : 0;
  const nextIncome = hired
    ? calculateEmployeeIncome(employee, Math.min(level + 1, maxLevel))
    : Number(employee.baseAutoIncome);
  const actionCost = hired
    ? calculateEmployeeUpgradeCost(employee, level)
    : Number(employee.hireCost);

  const card = document.createElement("div");
  card.className = "standardCard employeeCard";
  card.dataset.employeeId = employee.id;
  card.innerHTML = `
    <div class="employeeCardTop">
      <span class="employeeIcon">${employee.icon}</span>
      <div>
        <h3>${employee.name}</h3>
        <p>${hired ? `알바 Lv.${level}` : "미고용"}</p>
      </div>
    </div>
    <div class="employeeDetail">
      ${hired ? `
        <p><span>현재 초당 수입</span><strong>${formatMoney(currentIncome)} / 초</strong></p>
        <p><span>${isMaxLevel ? "최대 레벨 수입" : "다음 레벨 수입"}</span><strong>${formatMoney(nextIncome)} / 초</strong></p>
        <p><span>업그레이드 비용</span><strong>${isMaxLevel ? "최대 레벨" : formatMoney(actionCost)}</strong></p>
      ` : `
        <p><span>고용 비용</span><strong>${formatMoney(employee.hireCost)}</strong></p>
        <p><span>고용 시 수입</span><strong>${formatMoney(employee.baseAutoIncome)} / 초</strong></p>
        <p><span>고용 가능 인원</span><strong>1명</strong></p>
      `}
    </div>
  `;

  const actionButton = document.createElement("button");
  actionButton.type = "button";
  actionButton.className = "standardPrimaryBtn employeeActionBtn";
  actionButton.textContent = hired
    ? (isMaxLevel ? "최대 레벨" : `업그레이드 (${formatMoney(actionCost)})`)
    : `고용 (${formatMoney(actionCost)})`;
  actionButton.disabled = isMaxLevel || state.money < actionCost || isProcessing;
  actionButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (hired) {
      await upgradeEmployee(employee.id);
    } else {
      await hireEmployee(employee.id);
    }
  });

  card.appendChild(actionButton);
  return card;
}

async function hireEmployee(employeeId) {
  if (isProcessing) return;

  const employee = findEmployeeConfig(employeeId);
  if (!employee) return;

  const savedEmployee = getSavedEmployee(employeeId);
  if (savedEmployee.hired) return;

  const hireCost = Number(employee.hireCost);
  if (state.money < hireCost) {
    alert("고용 비용이 부족합니다.");
    return;
  }

  isProcessing = true;
  try {
    state.money -= hireCost;
    state.employeeData.employees[employeeId] = { hired: true, level: 1 };
    state.employeeData.total_hired = getTotalHiredCount();
    updateMainUI();
    renderEmployeeList();
    updateEmployeeUI();
    await saveGameData();
  } finally {
    isProcessing = false;
    updateEmployeeUI();
  }
}

async function upgradeEmployee(employeeId) {
  if (isProcessing) return;

  const employee = findEmployeeConfig(employeeId);
  const savedEmployee = getSavedEmployee(employeeId);
  if (!employee || !savedEmployee.hired) return;

  if (savedEmployee.level >= Number(GAME_BALANCE.EMPLOYEE.MAX_LEVEL)) {
    return;
  }

  const upgradeCost = calculateEmployeeUpgradeCost(employee, savedEmployee.level);
  if (state.money < upgradeCost) {
    alert("업그레이드 비용이 부족합니다.");
    return;
  }

  isProcessing = true;
  try {
    state.money -= upgradeCost;
    state.employeeData.employees[employeeId].level = savedEmployee.level + 1;
    updateMainUI();
    renderEmployeeList();
    updateEmployeeUI();
    await saveGameData();
  } finally {
    isProcessing = false;
    updateEmployeeUI();
  }
}

export function calculateEmployeeIncome(employee, level) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  const incomeGrowth = Number(employee.incomeGrowth || 1);

  return Math.max(
    1,
    Math.floor(
      Number(employee.baseAutoIncome) *
      Math.pow(incomeGrowth, safeLevel - 1)
    )
  );
}

export function calculateEmployeeUpgradeCost(employee, currentLevel) {
  const safeLevel = Math.max(1, Math.floor(Number(currentLevel) || 1));
  const baseUpgradeCost =
    Number(employee.hireCost) *
    Number(GAME_BALANCE.EMPLOYEE.UPGRADE_BASE_RATE);
  return Math.max(
    1,
    Math.floor(baseUpgradeCost * Math.pow(Number(employee.upgradeGrowth), safeLevel - 1))
  );
}

export function updateEmployeeUI() {
  if (!employeeElements) return;

  employeeElements.employeeTotalCountText.textContent = `${getTotalHiredCount().toLocaleString()}명`;
  employeeElements.employeeTotalIncomeText.textContent = `${formatMoney(getEmployeeAutoIncome())} / 초`;
  updateVisibleEmployeeButtons();
  updateEmployeePagination();
}

function updateVisibleEmployeeButtons() {
  employeeElements.employeeList.querySelectorAll(".employeeCard").forEach((card) => {
    const employee = findEmployeeConfig(card.dataset.employeeId);
    if (!employee) return;

    const savedEmployee = getSavedEmployee(employee.id);
    const isMaxLevel =
      savedEmployee.hired &&
      savedEmployee.level >= Number(GAME_BALANCE.EMPLOYEE.MAX_LEVEL);
    const actionCost = savedEmployee.hired
      ? calculateEmployeeUpgradeCost(employee, savedEmployee.level)
      : Number(employee.hireCost);
    const button = card.querySelector(".employeeActionBtn");
    if (button) button.disabled = isMaxLevel || state.money < actionCost || isProcessing;
  });
}

function updateEmployeePagination() {
  if (!employeeElements) return;

  const totalPages = getTotalEmployeePages();
  currentEmployeePage = Math.min(currentEmployeePage, totalPages);
  employeeElements.employeePageText.textContent = `${currentEmployeePage} / ${totalPages}`;
  employeeElements.employeePrevBtn.disabled = currentEmployeePage <= 1;
  employeeElements.employeeNextBtn.disabled = currentEmployeePage >= totalPages;
}

function findEmployeeConfig(employeeId) {
  return EMPLOYEE_CONFIG.find((employee) => employee.id === employeeId);
}

function getSavedEmployee(employeeId) {
  if (!state.employeeData.employees[employeeId]) {
    state.employeeData.employees[employeeId] = { hired: false, level: 0 };
  }
  return state.employeeData.employees[employeeId];
}

function getTotalHiredCount() {
  return EMPLOYEE_CONFIG.reduce(
    (total, employee) => total + (getSavedEmployee(employee.id).hired ? 1 : 0),
    0
  );
}
