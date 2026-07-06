const startBtn = document.getElementById("startBtn");
const singleBtn = document.getElementById("singleBtn");
const multiBtn = document.getElementById("multiBtn");
const backToStartBtn = document.getElementById("backToStartBtn");

const userMenuBtn = document.getElementById("userMenuBtn");
const saveNicknameBtn = document.getElementById("saveNicknameBtn");

const backToModeFromRoomBtn = document.getElementById("backToModeFromRoomBtn");

const createRoomBtn = document.getElementById("createRoomBtn");
const confirmCreateRoomBtn = document.getElementById("confirmCreateRoomBtn");
const cancelCreateRoomBtn = document.getElementById("cancelCreateRoomBtn");

const readyBtnElement = document.getElementById("readyBtn");
const startGameBtnElement = document.getElementById("startGameBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");

const menuBtn = document.getElementById("menuBtn");
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

userMenuBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  userMenuBox.classList.toggle("show");
});

saveNicknameBtn.addEventListener("click", saveNickname);

createRoomBtn.addEventListener("click", () => {
  showScreen(createRoomScreen);
});

cancelCreateRoomBtn.addEventListener("click", () => {
  showScreen(roomListScreen);
});

confirmCreateRoomBtn.addEventListener("click", createRoom);

readyBtnElement.addEventListener("click", toggleReady);
startGameBtnElement.addEventListener("click", startMultiGame);
leaveRoomBtn.addEventListener("click", leaveRoom);

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

  if (!event.target.closest(".user-menu-wrap")) {
    closeUserMenu();
  }
});