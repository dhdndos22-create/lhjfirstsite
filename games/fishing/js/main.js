const state = {
  nickname: "효종",
  level: 1,
  exp: 24,
  maxExp: 100,
  gold: 10000,
  gems: 50
};

const elements = {
  startScreen: document.getElementById("startScreen"),
  lobbyScreen: document.getElementById("lobbyScreen"),
  startBtn: document.getElementById("startBtn"),
  startMenuBtn: document.getElementById("startMenuBtn"),
  lobbyMenuBtn: document.getElementById("lobbyMenuBtn"),
  sideMenu: document.getElementById("sideMenu"),
  nicknameText: document.getElementById("nicknameText"),
  levelText: document.getElementById("levelText"),
  expBar: document.getElementById("expBar"),
  goldText: document.getElementById("goldText"),
  gemText: document.getElementById("gemText"),
  goFishingBtn: document.getElementById("goFishingBtn"),
  changeStageBtn: document.getElementById("changeStageBtn"),
  menuLobbyBtn: document.getElementById("menuLobbyBtn"),
  menuHomeBtn: document.getElementById("menuHomeBtn"),
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modalTitle"),
  modalMessage: document.getElementById("modalMessage"),
  modalIcon: document.getElementById("modalIcon"),
  modalCloseBtn: document.getElementById("modalCloseBtn"),
  screenTransition: document.getElementById("screenTransition")
};

function formatNumber(value) {
  return Number(value).toLocaleString("ko-KR");
}

function renderPlayerInfo() {
  elements.nicknameText.textContent = state.nickname;
  elements.levelText.textContent = `Lv.${state.level}`;
  elements.goldText.textContent = formatNumber(state.gold);
  elements.gemText.textContent = formatNumber(state.gems);

  const expPercent = Math.max(0, Math.min(100, (state.exp / state.maxExp) * 100));
  elements.expBar.style.width = `${expPercent}%`;
}

function showLobby() {
  closeSideMenu();
  elements.startScreen.classList.add("hidden");
  elements.lobbyScreen.classList.remove("hidden");
  renderPlayerInfo();
}

function showStartScreen() {
  closeSideMenu();
  elements.lobbyScreen.classList.add("hidden");
  elements.startScreen.classList.remove("hidden");
}

function openSideMenu() {
  elements.sideMenu.classList.add("open");
  elements.sideMenu.setAttribute("aria-hidden", "false");
}

function closeSideMenu() {
  elements.sideMenu.classList.remove("open");
  elements.sideMenu.setAttribute("aria-hidden", "true");
}

function openModal(title, message, icon = "🚧") {
  elements.modalTitle.textContent = title;
  elements.modalMessage.textContent = message;
  elements.modalIcon.textContent = icon;
  elements.modal.classList.remove("hidden");
}

function closeModal() {
  elements.modal.classList.add("hidden");
}

function showPreparingFeature(name) {
  closeSideMenu();
  openModal(name, `${name} 기능은 다음 개발 단계에서 추가할 예정입니다.`);
}

function startFishingTransition() {
  elements.screenTransition.classList.add("active");

  window.setTimeout(() => {
    elements.screenTransition.classList.remove("active");
    openModal(
      "동네 연못",
      "낚시 플레이 화면은 다음 단계에서 구현됩니다.",
      "🐟"
    );
  }, 900);
}

elements.startBtn.addEventListener("click", showLobby);
elements.startMenuBtn.addEventListener("click", openSideMenu);
elements.lobbyMenuBtn.addEventListener("click", openSideMenu);
elements.menuLobbyBtn.addEventListener("click", showLobby);

elements.menuHomeBtn.addEventListener("click", () => {
  location.href = "../../index.html";
});

elements.goFishingBtn.addEventListener("click", startFishingTransition);
elements.changeStageBtn.addEventListener("click", () => showPreparingFeature("스테이지"));

elements.modalCloseBtn.addEventListener("click", closeModal);
elements.modal.querySelector(".modal-backdrop").addEventListener("click", closeModal);

document.querySelectorAll("[data-close-menu]").forEach((button) => {
  button.addEventListener("click", closeSideMenu);
});

document.querySelectorAll("[data-menu]").forEach((button) => {
  button.addEventListener("click", () => {
    showPreparingFeature(button.dataset.menu);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (!elements.modal.classList.contains("hidden")) {
    closeModal();
    return;
  }

  closeSideMenu();
});

renderPlayerInfo();
