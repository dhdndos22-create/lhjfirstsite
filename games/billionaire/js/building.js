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

/* =========================
   건물 화면 요소
========================= */

let buildingElements = null;

function getBuildingElements() {
  return {
    buildingMenuBtn:
      document.getElementById(
        "buildingMenuBtn"
      ),

    buildingPanel:
      document.getElementById(
        "buildingPanel"
      ),

    buildingPanelCloseBtn:
      document.getElementById(
        "buildingPanelCloseBtn"
      ),

    buildingList:
      document.getElementById(
        "buildingList"
      ),

    buildingTotalIncomeText:
      document.getElementById(
        "buildingTotalIncomeText"
      ),

    buildingTotalCountText:
      document.getElementById(
        "buildingTotalCountText"
      )
  };
}

/* =========================
   초기화
========================= */

export function initializeBuilding() {
  buildingElements =
    getBuildingElements();

  const requiredElements = [
    "buildingMenuBtn",
    "buildingPanel",
    "buildingPanelCloseBtn",
    "buildingList",
    "buildingTotalIncomeText",
    "buildingTotalCountText"
  ];

  const missingElements =
    requiredElements.filter(
      function (name) {
        return !buildingElements[name];
      }
    );

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

/* =========================
   패널 열고 닫기
========================= */

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

/* =========================
   건물 목록 생성
========================= */

export function renderBuildingList() {
  if (
    !buildingElements ||
    !buildingElements.buildingList
  ) {
    return;
  }

  buildingElements.buildingList.innerHTML =
    "";

  BUILDING_CONFIG.forEach(
    function (building) {
      const card =
        createBuildingCard(building);

      buildingElements.buildingList
        .appendChild(card);
    }
  );
}

function createBuildingCard(building) {
  const ownedCount =
    getOwnedBuildingCount(building.id);

  const nextPrice =
    calculateBuildingPrice(
      building,
      ownedCount
    );

  const buildingIncome =
    ownedCount *
    Number(building.autoIncome);

  const card =
    document.createElement("div");

  card.className = "buildingCard";
  card.dataset.buildingId =
    building.id;

  const infoBox =
    document.createElement("div");

  infoBox.className =
    "buildingInfo";

  const title =
    document.createElement("div");

  title.className =
    "buildingTitle";

  title.innerHTML = `
    <span class="buildingIcon">
      ${building.icon}
    </span>

    <div>
      <h3>${building.name}</h3>

      <p>
        1개당
        ${formatMoney(
          building.autoIncome
        )} / 초
      </p>
    </div>
  `;

  const detail =
    document.createElement("div");

  detail.className =
    "buildingDetail";

  detail.innerHTML = `
    <p>
      보유
      <strong>
        ${ownedCount.toLocaleString()}개
      </strong>
    </p>

    <p>
      현재 총수입
      <strong>
        ${formatMoney(
          buildingIncome
        )} / 초
      </strong>
    </p>

    <p>
      다음 구매 가격
      <strong>
        ${formatMoney(
          nextPrice
        )}
      </strong>
    </p>
  `;

  infoBox.appendChild(title);
  infoBox.appendChild(detail);

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

  card.appendChild(infoBox);
  card.appendChild(buyButton);

  return card;
}

/* =========================
   건물 구매
========================= */

async function buyBuilding(buildingId) {
  const building =
    BUILDING_CONFIG.find(
      function (item) {
        return item.id === buildingId;
      }
    );

  if (!building) {
    console.error(
      "존재하지 않는 건물입니다:",
      buildingId
    );

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
    alert(
      "보유금이 부족합니다."
    );

    return;
  }

  state.money -= price;

  state.buildingData.owned[
    building.id
  ] = ownedCount + 1;

  state.buildingData
    .total_purchases++;

  updateMainUI();
  renderBuildingList();
  updateBuildingUI();

  await saveGameData();
}

/* =========================
   가격 계산
========================= */

export function calculateBuildingPrice(
  building,
  ownedCount
) {
  const basePrice =
    Number(building.basePrice);

  const growth =
    Number(building.priceGrowth);

  const count =
    Math.max(
      0,
      Math.floor(
        Number(ownedCount) || 0
      )
    );

  const calculatedPrice =
    basePrice *
    Math.pow(
      growth,
      count
    );

  return Math.max(
    1,
    Math.floor(
      calculatedPrice
    )
  );
}

/* =========================
   건물 UI 갱신
========================= */

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
      `${formatMoney(
        totalIncome
      )} / 초`;

  updateBuildingPurchaseButtons();
}

/*
  매초 전체 건물 목록을 다시 만들지 않고,
  현재 존재하는 구매 버튼의 활성화 상태만 갱신한다.
*/
function updateBuildingPurchaseButtons() {
  const cards =
    buildingElements.buildingList
      .querySelectorAll(
        ".buildingCard"
      );

  cards.forEach(
    function (card) {
      const buildingId =
        card.dataset.buildingId;

      const building =
        BUILDING_CONFIG.find(
          function (item) {
            return (
              item.id === buildingId
            );
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
    }
  );
}

/* =========================
   보유 수량 계산
========================= */

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