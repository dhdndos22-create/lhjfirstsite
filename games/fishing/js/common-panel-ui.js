export const PANEL_DEFINITIONS = Object.freeze({
  shop: {
    title: "상점",
    ariaLabel: "피싱월드 상점",
    tabs: [
      { id: "equipment", label: "장비" },
      { id: "consumable", label: "소모품" },
      { id: "currency", label: "제화" }
    ],
    defaultTab: "currency",
    emptyMessage: "상품카드는 별도 컴포넌트로 이 영역에 배치합니다."
  },
  inventory: {
    title: "인벤토리",
    ariaLabel: "피싱월드 인벤토리",
    tabs: [
      { id: "consumable", label: "소모품" },
      { id: "bait", label: "미끼" }
    ],
    defaultTab: "consumable",
    emptyMessage: "인벤토리 목록카드는 별도 컴포넌트로 이 영역에 배치합니다."
  },
  equipment: {
    title: "장비",
    ariaLabel: "피싱월드 장비",
    tabs: [],
    defaultTab: null,
    emptyMessage: "장비 카드는 별도 컴포넌트로 이 영역에 배치합니다."
  },
  draw: {
    title: "뽑기",
    ariaLabel: "피싱월드 뽑기",
    tabs: [],
    defaultTab: null,
    emptyMessage: "뽑기 콘텐츠가 이 영역에 배치됩니다."
  },
  achievement: {
    title: "업적",
    ariaLabel: "피싱월드 업적",
    tabs: [],
    defaultTab: null,
    emptyMessage: "업적 목록이 이 영역에 배치됩니다."
  },
  mail: {
    title: "우편",
    ariaLabel: "피싱월드 우편",
    tabs: [],
    defaultTab: null,
    emptyMessage: "우편 목록이 이 영역에 배치됩니다."
  }
});

export class CommonPanelUI {
  constructor({ screen, title, tabs, body, pagination }) {
    this.screen = screen;
    this.title = title;
    this.tabs = tabs;
    this.body = body;
    this.pagination = pagination;
    this.currentType = null;
    this.currentTab = null;
    this.onTabChange = null;
  }

  open(type, { onTabChange } = {}) {
    const definition = PANEL_DEFINITIONS[type];
    if (!definition) throw new Error(`알 수 없는 공통 패널 타입: ${type}`);

    this.currentType = type;
    this.currentTab = definition.defaultTab;
    this.onTabChange = typeof onTabChange === "function" ? onTabChange : null;

    this.screen.setAttribute("aria-label", definition.ariaLabel);
    this.title.textContent = definition.title;
    this.renderTabs(definition.tabs);
    this.hidePagination();
    this.renderEmpty(definition.emptyMessage);

    if (this.onTabChange) {
      this.onTabChange(this.currentTab, this);
    }
  }

  renderTabs(tabItems) {
    this.tabs.innerHTML = "";
    this.tabs.hidden = tabItems.length === 0;

    tabItems.forEach((tab) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "common-panel-tab";
      button.dataset.tab = tab.id;
      button.textContent = tab.label;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(tab.id === this.currentTab));
      button.classList.toggle("is-active", tab.id === this.currentTab);

      button.addEventListener("click", () => {
        this.currentTab = tab.id;
        [...this.tabs.querySelectorAll(".common-panel-tab")].forEach((item) => {
          const active = item.dataset.tab === tab.id;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });

        if (this.onTabChange) this.onTabChange(tab.id, this);
      });

      this.tabs.appendChild(button);
    });
  }

  setBody(content) {
    this.body.innerHTML = "";
    if (typeof content === "string") {
      this.body.innerHTML = content;
      return;
    }
    if (content instanceof Node) this.body.appendChild(content);
  }

  renderEmpty(message) {
    this.setBody(`<div class="common-panel-placeholder"><p>${message}</p></div>`);
  }

  showPagination({ page, totalPages, onPrev, onNext }) {
    this.pagination.hidden = false;
    const prev = this.pagination.querySelector("#commonPrevButton");
    const next = this.pagination.querySelector("#commonNextButton");
    const indicator = this.pagination.querySelector("#commonPageIndicator");

    indicator.textContent = `${page} / ${totalPages}`;
    prev.disabled = page <= 1;
    next.disabled = page >= totalPages;
    prev.onclick = onPrev || null;
    next.onclick = onNext || null;
  }

  hidePagination() {
    this.pagination.hidden = true;
  }
}
