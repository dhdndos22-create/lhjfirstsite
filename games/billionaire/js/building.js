import {
  BUILDING_CONFIG
} from "./config.js";

import {
  state,
  getBuildingAutoIncome
} from "./state.js";

import {
  elements,
  updateMainUI,
  formatMoney
} from "./ui.js";

import {
  saveGameData
} from "./database.js";

const BUILDINGS_PER_PAGE = 4;

let currentBuildingPage = 1;
let buildingElements = null;

function getBuildingElements() {
  return {
    buildingMenuBtn:
      document.getElementById("buildingMenuBtn"),

    buildingPanel:
      document.getElementById("buildingPanel"),

    buildingPanelCloseBtn:
      document.getElementById(
        "buildingPanelCloseBtn"
      ),

    buildingList:
      document.getElementById("buildingList"),

    buildingTotalIncomeText:
      document.getElementById(
        "buildingTotalIncomeText"
      ),

    buildingTotalCountText:
      document.getElementById(
        "buildingTotalCountText"
      ),

    buildingPrevBtn:
      document.getElementById(
        "buildingPrevBtn"
      ),

    buildingNextBtn:
      document.getElementById(
        "buildingNextBtn"
      ),

    buildingPageText:
      document.getElementById(
        "buildingPageText"
      )
  };
}

export function initializeBuilding() {
  buildingElements = getBuildingElements();

  const requiredElements = [
    "buildingMenuBtn",
    "buildingPanel",
    "buildingPanelCloseBtn",
    "buildingList",
    "buildingTotalIncomeText",
    "buildingTotalCountText",
    "buildingPrevBtn",
    "buildingNextBtn",
    "buildingPageText"
  ];

  const missingElements =
    requiredElements.filter(function (name) {
      return !buildingElements[name];
    });

  if (missingElements.length > 0) {
    console.error(
      "건물 HTML 요소가 없습니다:",
      missingElements
    );

    return;
  }

  buildingElements.buildingMenuBtn
    .addEventListener(
      "click",
      openBuildingPanel
    );

  buildingElements.buildingPanelCloseBtn
    .addEventListener(
      "click",
      closeBuildingPanel
    );

  buildingElements.buildingPrevBtn
    .addEventListener(
      "click",
      goToPreviousBuildingPage
    );

  buildingElements.buildingNextBtn
    .addEventListener(
      "click",
      goToNextBuildingPage
    );

  buildingElements.buildingPanel
    .addEventListener(
      "click",
      function (event) {
        event.stopPropagation();
      }
    );

  renderBuildingList();
  updateBuildingUI();
}

function openBuildingPanel(event) {
  event.stopPropagation();

  elements.gameMenuPanel.classList.add(
    "hidden"
  );

  buildingElements.buildingPanel
    .classList.remove("hidden");

  renderBuildingList();
  updateBuildingUI();
}

function closeBuildingPanel() {
  buildingElements.buildingPanel
    .classList.add("hidden");
}

function getTotalPages() {
  return Math.max(
    1,
    Math.ceil(
      BUILDING_CONFIG.length /
      BUILDINGS_PER_PAGE
    )
  );
}

function goToPreviousBuildingPage() {
  if (currentBuildingPage <= 1) {
    return;
  }

  currentBuildingPage--;

  renderBuildingList();
  updatePaginationUI();
}

function goToNextBuildingPage() {
  const totalPages = getTotalPages();

  if (currentBuildingPage >= totalPages) {
    return;
  }

  currentBuildingPage++;

  renderBuildingList();
  updatePaginationUI();
}

export function renderBuildingList() {
  if (!buildingElements) {
    return;
  }

  const startIndex =
    (currentBuildingPage - 1) *
    BUILDINGS_PER_PAGE;

  const endIndex =
    startIndex + BUILDINGS_PER_PAGE;

  const pageBuildings =
    BUILDING_CONFIG.slice(
      startIndex,
      endIndex
    );

  buildingElements.buildingList.innerHTML =
    "";

  pageBuildings.forEach(
    function (building) {
      const card =
        createBuildingCard(building);

      buildingElements.buildingList
        .appendChild(card);
    }
  );

  updatePaginationUI();
}

function createBuildingCard(building) {
  const ownedCount =
    getOwnedBuildingCount(building.id);

  const nextPrice =
    calculateBuildingPrice(
      building,
      ownedCount
    );

  const totalIncome =
    ownedCount *
    Number(building.autoIncome);

  const card =
    document.createElement("div");

  card.className = "buildingCard";
  card.dataset.buildingId =
    building.id;

  card.innerHTML = `
    <div class="buildingTitle">
      <span class="buildingIcon">
        ${building.icon}
      </span>

      <div>
        <h3>${building.name}</h3>
        <p>
          1개당 ${formatMoney(
            building.autoIncome
          )} / 초
        </p>
      </div>
    </div>

    <div class="buildingDetail">
      <p>
        <span>보유</span>
        <strong>
          ${ownedCount.toLocaleString()}개
        </strong>
      </p>

      <p>
        <span>현재 총수입</span>
        <strong>
          ${formatMoney(totalIncome)} / 초
        </strong>
      </p>

      <p>
        <span>다음 가격</span>
        <strong>
          ${formatMoney(nextPrice)}
        </strong>
      </p>
    </div>
  `;

  const buyButton =
    document.createElement("button");

  buyButton.type = "button";
  buyButton.className =
    "buildingBuyBtn";

  buyButton.textContent =
    `구매 (${formatMoney(nextPrice)})`;

  buyButton.disabled =
    state.money < nextPrice;

  buyButton.addEventListener(
    "click",
    async function (event) {
      event.stopPropagation();

      await buyBuilding(
        building.id
      );
    }
  );

  card.appendChild(buyButton);

  return card;
}

async function buyBuilding(buildingId) {
  const building =
    BUILDING_CONFIG.find(
      function (item) {
        return item.id === buildingId;
      }
    );

  if (!building) {
    return;
  }

  const ownedCount =
    getOwnedBuildingCount(
      building.id
    );

  const price =
    calculateBuildingPrice(
      building,
      ownedCount
    );

  if (state.money < price) {
    alert("보유금이 부족합니다.");
    return;
  }

  state.money -= price;

  state.buildingData.owned[
    building.id
  ] = ownedCount + 1;

  state.buildingData
    .total_purchases++;

  updateMainUI();
  updateBuildingUI();
  renderBuildingList();

  await saveGameData();
}

export function calculateBuildingPrice(
  building,
  ownedCount
) {
  const basePrice =
    Number(building.basePrice);

  const growth =
    Number(building.priceGrowth);

  const count = Math.max(
    0,
    Math.floor(
      Number(ownedCount) || 0
    )
  );

  return Math.max(
    1,
    Math.floor(
      basePrice *
      Math.pow(growth, count)
    )
  );
}

export function updateBuildingUI() {
  if (!buildingElements) {
    return;
  }

  const totalCount =
    getTotalBuildingCount();

  const totalIncome =
    getBuildingAutoIncome();

  buildingElements
    .buildingTotalCountText
    .textContent =
      `${totalCount.toLocaleString()}개`;

  buildingElements
    .buildingTotalIncomeText
    .textContent =
      `${formatMoney(totalIncome)} / 초`;

  updateVisiblePurchaseButtons();
  updatePaginationUI();
}

function updateVisiblePurchaseButtons() {
  const cards =
    buildingElements.buildingList
      .querySelectorAll(
        ".buildingCard"
      );

  cards.forEach(function (card) {
    const buildingId =
      card.dataset.buildingId;

    const building =
      BUILDING_CONFIG.find(
        function (item) {
          return item.id === buildingId;
        }
      );

    if (!building) {
      return;
    }

    const ownedCount =
      getOwnedBuildingCount(
        building.id
      );

    const nextPrice =
      calculateBuildingPrice(
        building,
        ownedCount
      );

    const buyButton =
      card.querySelector(
        ".buildingBuyBtn"
      );

    if (!buyButton) {
      return;
    }

    buyButton.disabled =
      state.money < nextPrice;
  });
}

function updatePaginationUI() {
  if (!buildingElements) {
    return;
  }

  const totalPages =
    getTotalPages();

  if (currentBuildingPage > totalPages) {
    currentBuildingPage = totalPages;
  }

  buildingElements
    .buildingPageText
    .textContent =
      `${currentBuildingPage} / ${totalPages}`;

  buildingElements
    .buildingPrevBtn.disabled =
      currentBuildingPage <= 1;

  buildingElements
    .buildingNextBtn.disabled =
      currentBuildingPage >= totalPages;
}

function getOwnedBuildingCount(
  buildingId
) {
  return Math.max(
    0,
    Math.floor(
      Number(
        state.buildingData
          .owned[buildingId] ?? 0
      )
    )
  );
}

function getTotalBuildingCount() {
  return BUILDING_CONFIG.reduce(
    function (total, building) {
      return (
        total +
        getOwnedBuildingCount(
          building.id
        )
      );
    },
    0
  );
}