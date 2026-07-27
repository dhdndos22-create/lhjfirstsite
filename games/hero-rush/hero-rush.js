const screens = {
  start: document.getElementById("startScreen"),
  lobby: document.getElementById("lobbyScreen"),
  stage: document.getElementById("stageScreen")
};

const gameStartBtn = document.getElementById("gameStartBtn");
const homeBtn = document.getElementById("homeBtn");
const settingsBtn = document.getElementById("settingsBtn");
const menuBtn = document.getElementById("menuBtn");
const enterBtn = document.getElementById("enterBtn");
const integratedMenu = document.getElementById("integratedMenu");
const stageBackBtn = document.getElementById("stageBackBtn");
const battleStartBtn = document.getElementById("battleStartBtn");

const modalBackdrop = document.getElementById("modalBackdrop");
const settingsModal = document.getElementById("settingsModal");
const infoModal = document.getElementById("infoModal");
const infoTitle = document.getElementById("infoTitle");
const infoText = document.getElementById("infoText");
const toast = document.getElementById("toast");

let toastTimer = null;

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => {
    const isActive = key === name;
    screen.hidden = !isActive;
    screen.classList.toggle("active", isActive);
  });

  integratedMenu.classList.remove("open");
  closeModal();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1700);
}

function openModal(modal) {
  modalBackdrop.hidden = false;
  settingsModal.hidden = modal !== settingsModal;
  infoModal.hidden = modal !== infoModal;
}

function closeModal() {
  modalBackdrop.hidden = true;
  settingsModal.hidden = true;
  infoModal.hidden = true;
}

gameStartBtn.addEventListener("click", () => showScreen("lobby"));

homeBtn.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

settingsBtn.addEventListener("click", () => openModal(settingsModal));

menuBtn.addEventListener("click", () => {
  integratedMenu.classList.toggle("open");
});

integratedMenu.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-menu]");
  if (!button) return;

  const menuName = button.dataset.menu;
  infoTitle.textContent = menuName;
  infoText.textContent = `${menuName} 화면은 다음 개발 단계에서 연결됩니다.`;
  integratedMenu.classList.remove("open");
  openModal(infoModal);
});

enterBtn.addEventListener("click", () => showScreen("stage"));
stageBackBtn.addEventListener("click", () => showScreen("lobby"));

battleStartBtn.addEventListener("click", () => {
  showToast("푸른 초원 전투 화면은 다음 단계에서 연결됩니다.");
});

document.querySelectorAll(".modal-close").forEach((button) => {
  button.addEventListener("click", closeModal);
});

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!modalBackdrop.hidden) {
      closeModal();
      return;
    }

    if (screens.stage.classList.contains("active")) {
      showScreen("lobby");
    }
  }
});

showScreen("start");
