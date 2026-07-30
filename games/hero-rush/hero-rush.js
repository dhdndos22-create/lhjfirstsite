function updateMobileViewport() {
  const viewport = window.visualViewport;
  const viewportHeight = viewport ? viewport.height : window.innerHeight;
  const viewportOffsetTop = viewport ? viewport.offsetTop : 0;

  document.documentElement.style.setProperty(
    "--app-height",
    `${Math.round(viewportHeight)}px`
  );

  document.documentElement.style.setProperty(
    "--app-top",
    `${Math.round(viewportOffsetTop)}px`
  );
}

updateMobileViewport();

window.addEventListener("resize", updateMobileViewport, { passive: true });
window.addEventListener("orientationchange", updateMobileViewport, { passive: true });

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateMobileViewport, { passive: true });
  window.visualViewport.addEventListener("scroll", updateMobileViewport, { passive: true });
}

const screens = {
  start: document.getElementById("startScreen"),
  lobby: document.getElementById("lobbyScreen"),
  stage: document.getElementById("stageScreen"),
  battle: document.getElementById("battleScreen")
};

const gameStartBtn = document.getElementById("gameStartBtn");
const startBackgroundImage = document.getElementById("startBackgroundImage");
const homeBtn = document.getElementById("homeBtn");
const settingsBtn = document.getElementById("settingsBtn");
const menuBtn = document.getElementById("menuBtn");
const enterBtn = document.getElementById("enterBtn");
const integratedMenu = document.getElementById("integratedMenu");
const stageBackBtn = document.getElementById("stageBackBtn");
const battleStartBtn = document.getElementById("battleStartBtn");

const battleViewport = document.getElementById("battleViewport");
const battleWorld = document.getElementById("battleWorld");
const battlePlayer = document.getElementById("battlePlayer");
const battlePosition = document.getElementById("battlePosition");
const battleExitBtn = document.getElementById("battleExitBtn");
const joystickArea = document.getElementById("joystickArea");
const joystickBase = document.getElementById("joystickBase");
const joystickKnob = document.getElementById("joystickKnob");
const attackButton = document.getElementById("attackButton");
const countdownOverlay = document.getElementById("countdownOverlay");
const countdownTitle = document.getElementById("countdownTitle");
const countdownText = document.getElementById("countdownText");

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

/* =========================================================
   START SCREEN
   배경 이미지 속 "게임 시작" 영역을 실제 버튼으로 연결한다.
   pointerup + click을 모두 지원하되, 중복 실행은 잠금으로 방지한다.
   ========================================================= */
let startTransitionLocked = false;

function enterLobby() {
  if (startTransitionLocked || !screens.start.classList.contains("active")) return;

  startTransitionLocked = true;
  gameStartBtn.classList.add("pressed");

  window.setTimeout(() => {
    showScreen("lobby");
    gameStartBtn.classList.remove("pressed");
    startTransitionLocked = false;
  }, 90);
}

gameStartBtn.addEventListener("pointerdown", () => {
  gameStartBtn.classList.add("pressed");
});

gameStartBtn.addEventListener("pointercancel", () => {
  gameStartBtn.classList.remove("pressed");
});

gameStartBtn.addEventListener("pointerleave", () => {
  gameStartBtn.classList.remove("pressed");
});

gameStartBtn.addEventListener("pointerup", (event) => {
  event.preventDefault();
  enterLobby();
});

gameStartBtn.addEventListener("click", (event) => {
  event.preventDefault();
  enterLobby();
});

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

battleStartBtn.addEventListener("click", startStageOne);

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

    if (screens.battle.classList.contains("active")) {
      leaveBattle();
      return;
    }

    if (screens.stage.classList.contains("active")) {
      showScreen("lobby");
    }
  }
});


/* =========================================================
   STAGE 1 - 이동 프로토타입
   ========================================================= */

const WORLD_SIZE = 2500;
const PLAYER_SPEED = 260;
const JOYSTICK_RADIUS = 42;

const battleState = {
  running: false,
  countdown: false,
  playerX: WORLD_SIZE / 2,
  playerY: WORLD_SIZE / 2,
  moveX: 0,
  moveY: 0,
  joystickPointerId: null,
  lastFrameTime: 0,
  animationFrameId: null,
  keyState: {
    up: false,
    down: false,
    left: false,
    right: false
  }
};

function startStageOne() {
  showScreen("battle");
  resetBattleState();
  runBattleCountdown();
}

function resetBattleState() {
  battleState.running = false;
  battleState.countdown = true;
  battleState.playerX = WORLD_SIZE / 2;
  battleState.playerY = WORLD_SIZE / 2;
  battleState.moveX = 0;
  battleState.moveY = 0;
  battleState.lastFrameTime = performance.now();

  resetJoystick();
  updateBattleWorld();
  setPlayerMoving(false);
}

async function runBattleCountdown() {
  countdownOverlay.classList.remove("hidden");
  countdownTitle.textContent = "1 - 푸른 초원";

  const steps = [
    { text: "READY", wait: 650 },
    { text: "3", wait: 620 },
    { text: "2", wait: 620 },
    { text: "1", wait: 620 },
    { text: "START!", wait: 650 }
  ];

  for (const step of steps) {
    if (!screens.battle.classList.contains("active")) return;
    countdownText.textContent = step.text;
    await wait(step.wait);
  }

  countdownOverlay.classList.add("hidden");
  battleState.countdown = false;
  battleState.running = true;
  battleState.lastFrameTime = performance.now();

  window.cancelAnimationFrame(battleState.animationFrameId);
  battleState.animationFrameId = window.requestAnimationFrame(updateBattle);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function updateBattle(timestamp) {
  if (!battleState.running || !screens.battle.classList.contains("active")) return;

  const delta = Math.min((timestamp - battleState.lastFrameTime) / 1000, 0.033);
  battleState.lastFrameTime = timestamp;

  const keyboardVector = getKeyboardVector();
  let moveX = keyboardVector.x || battleState.moveX;
  let moveY = keyboardVector.y || battleState.moveY;

  if (keyboardVector.x !== 0 || keyboardVector.y !== 0) {
    moveX = keyboardVector.x;
    moveY = keyboardVector.y;
  }

  const length = Math.hypot(moveX, moveY);

  if (length > 0.04 && !battleState.countdown) {
    const normalizedX = moveX / Math.max(1, length);
    const normalizedY = moveY / Math.max(1, length);

    battleState.playerX += normalizedX * PLAYER_SPEED * delta;
    battleState.playerY += normalizedY * PLAYER_SPEED * delta;

    const edgePadding = 120;
    battleState.playerX = clamp(battleState.playerX, edgePadding, WORLD_SIZE - edgePadding);
    battleState.playerY = clamp(battleState.playerY, edgePadding, WORLD_SIZE - edgePadding);

    setPlayerMoving(true);

    if (normalizedX < -0.08) {
      battlePlayer.classList.add("face-left");
    } else if (normalizedX > 0.08) {
      battlePlayer.classList.remove("face-left");
    }
  } else {
    setPlayerMoving(false);
  }

  updateBattleWorld();
  battleState.animationFrameId = window.requestAnimationFrame(updateBattle);
}

function updateBattleWorld() {
  const viewportWidth = battleViewport.clientWidth;
  const viewportHeight = battleViewport.clientHeight;

  const worldX = viewportWidth / 2 - battleState.playerX;
  const worldY = viewportHeight / 2 - battleState.playerY;

  battleWorld.style.transform = `translate3d(${worldX}px, ${worldY}px, 0)`;
  battlePosition.textContent =
    `${Math.round(battleState.playerX)}, ${Math.round(battleState.playerY)}`;
}

function setPlayerMoving(isMoving) {
  battlePlayer.classList.toggle("walking", isMoving);
  battlePlayer.classList.toggle("idle", !isMoving);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getKeyboardVector() {
  const x = Number(battleState.keyState.right) - Number(battleState.keyState.left);
  const y = Number(battleState.keyState.down) - Number(battleState.keyState.up);

  if (x === 0 && y === 0) return { x: 0, y: 0 };

  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

function updateJoystick(pointerX, pointerY) {
  const rect = joystickBase.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let deltaX = pointerX - centerX;
  let deltaY = pointerY - centerY;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance > JOYSTICK_RADIUS) {
    deltaX = (deltaX / distance) * JOYSTICK_RADIUS;
    deltaY = (deltaY / distance) * JOYSTICK_RADIUS;
  }

  joystickKnob.style.transform =
    `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

  battleState.moveX = deltaX / JOYSTICK_RADIUS;
  battleState.moveY = deltaY / JOYSTICK_RADIUS;
}

function resetJoystick() {
  battleState.joystickPointerId = null;
  battleState.moveX = 0;
  battleState.moveY = 0;
  joystickKnob.style.transform = "translate(-50%, -50%)";
}

joystickArea.addEventListener("pointerdown", (event) => {
  if (!screens.battle.classList.contains("active")) return;

  battleState.joystickPointerId = event.pointerId;
  joystickArea.setPointerCapture(event.pointerId);
  updateJoystick(event.clientX, event.clientY);
  event.preventDefault();
});

joystickArea.addEventListener("pointermove", (event) => {
  if (event.pointerId !== battleState.joystickPointerId) return;
  updateJoystick(event.clientX, event.clientY);
  event.preventDefault();
});

function finishJoystick(event) {
  if (event.pointerId !== battleState.joystickPointerId) return;

  if (joystickArea.hasPointerCapture(event.pointerId)) {
    joystickArea.releasePointerCapture(event.pointerId);
  }

  resetJoystick();
}

joystickArea.addEventListener("pointerup", finishJoystick);
joystickArea.addEventListener("pointercancel", finishJoystick);
joystickArea.addEventListener("lostpointercapture", resetJoystick);

attackButton.addEventListener("click", () => {
  showToast("기본 공격은 다음 단계에서 연결됩니다.");
});

battleExitBtn.addEventListener("click", leaveBattle);

function leaveBattle() {
  battleState.running = false;
  battleState.countdown = false;
  window.cancelAnimationFrame(battleState.animationFrameId);
  resetJoystick();
  showScreen("stage");
}

window.addEventListener("keydown", (event) => {
  if (!screens.battle.classList.contains("active")) return;

  if (["ArrowUp", "w", "W"].includes(event.key)) battleState.keyState.up = true;
  if (["ArrowDown", "s", "S"].includes(event.key)) battleState.keyState.down = true;
  if (["ArrowLeft", "a", "A"].includes(event.key)) battleState.keyState.left = true;
  if (["ArrowRight", "d", "D"].includes(event.key)) battleState.keyState.right = true;
});

window.addEventListener("keyup", (event) => {
  if (["ArrowUp", "w", "W"].includes(event.key)) battleState.keyState.up = false;
  if (["ArrowDown", "s", "S"].includes(event.key)) battleState.keyState.down = false;
  if (["ArrowLeft", "a", "A"].includes(event.key)) battleState.keyState.left = false;
  if (["ArrowRight", "d", "D"].includes(event.key)) battleState.keyState.right = false;
});

window.addEventListener("resize", () => {
  if (screens.battle.classList.contains("active")) {
    updateBattleWorld();
  }
});




