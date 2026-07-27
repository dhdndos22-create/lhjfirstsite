const screens = {
  start: document.getElementById("startScreen"),
  lobby: document.getElementById("lobbyScreen"),
  stage: document.getElementById("stageScreen")
};

const toast = document.getElementById("lobbyToast");
const settingsModal = document.getElementById("settingsModal");
let toastTimer;

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1500);
}

function openSettings() {
  settingsModal.classList.add("open");
  settingsModal.setAttribute("aria-hidden", "false");
}

function closeSettings() {
  settingsModal.classList.remove("open");
  settingsModal.setAttribute("aria-hidden", "true");
}

document.getElementById("gameStartBtn").addEventListener("click", () => showScreen("lobby"));
document.getElementById("enterStageBtn").addEventListener("click", () => showScreen("stage"));
document.getElementById("stageBackBtn").addEventListener("click", () => showScreen("lobby"));
document.getElementById("settingsBtn").addEventListener("click", openSettings);

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", closeSettings);
});

document.querySelectorAll(".menu-action").forEach((button) => {
  button.addEventListener("click", () => showToast(`${button.dataset.menu} 화면은 다음 단계에서 연결됩니다.`));
});

document.getElementById("integratedMenuBtn").addEventListener("click", () => {
  showToast("통합 메뉴: 업적 · 인벤토리 · 우편 · 챔피언 · 장비");
});

document.getElementById("previousChampionBtn").addEventListener("click", () => showToast("이전 챔피언은 아직 잠겨 있습니다."));
document.getElementById("nextChampionBtn").addEventListener("click", () => showToast("다음 챔피언은 아직 잠겨 있습니다."));
document.getElementById("stagePlayBtn").addEventListener("click", () => alert("스테이지 1 전투 화면은 다음 단계에서 구현합니다."));
