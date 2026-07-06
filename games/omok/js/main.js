const startBtn = document.getElementById("startBtn");
const singleBtn = document.getElementById("singleBtn");
const multiBtn = document.getElementById("multiBtn");
const backToStartBtn = document.getElementById("backToStartBtn");
const backToModeFromRoomBtn = document.getElementById("backToModeFromRoomBtn");

const createRoomBtn = document.getElementById("createRoomBtn");
const confirmCreateRoomBtn = document.getElementById("confirmCreateRoomBtn");
const cancelCreateRoomBtn = document.getElementById("cancelCreateRoomBtn");

const menuBtn = document.getElementById("menuBtn");
const gameMenu = document.getElementById("gameMenu");
const menuResetBtn = document.getElementById("menuResetBtn");
const menuModeBtn = document.getElementById("menuModeBtn");

startBtn.addEventListener("click", () => {
  showScreen(modeScreen);
});

backToStartBtn.addEventListener("click", () => {
  showScreen(startScreen);
});

singleBtn.addEventListener("click", () => {
  startSingleGame();
});

multiBtn.addEventListener("click", () => {
  showScreen(roomListScreen);
  requestRoomList();
});

backToModeFromRoomBtn.addEventListener("click", () => {
  closeUserMenu();
  showScreen(modeScreen);
});

createRoomBtn.addEventListener("click", () => {
  showScreen(createRoomScreen);
});

cancelCreateRoomBtn.addEventListener("click", () => {
  showScreen(roomListScreen);
});

confirmCreateRoomBtn.addEventListener("click", () => {
  createRoom();
});

menuBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  gameMenu.classList.toggle("show");
});

menuResetBtn.addEventListener("click", () => {
  closeGameMenu();
  startSingleGame();
});

menuModeBtn.addEventListener("click", () => {
  closeGameMenu();
  showScreen(modeScreen);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".menu-wrap")) {
    closeGameMenu();
  }
});

function closeGameMenu() {
  gameMenu.classList.remove("show");
}