const startScreen = document.getElementById("startScreen");
const modeScreen = document.getElementById("modeScreen");
const roomListScreen = document.getElementById("roomListScreen");
const createRoomScreen = document.getElementById("createRoomScreen");
const gameScreen = document.getElementById("gameScreen");

let nickname = localStorage.getItem("omokNickname") || "게스트";

const nicknameText = document.getElementById("nicknameText");
const nicknameInput = document.getElementById("nicknameInput");
const userMenuBox = document.getElementById("userMenuBox");
const gameMenu = document.getElementById("gameMenu");

const opponentPanel = document.getElementById("opponentPanel");
const myPanel = document.getElementById("myPanel");
const multiControlBox = document.getElementById("multiControlBox");

nicknameText.textContent = nickname;
nicknameInput.value = nickname;

function showScreen(screen) {
  [
    startScreen,
    modeScreen,
    roomListScreen,
    createRoomScreen,
    gameScreen
  ].forEach((s) => s.classList.remove("active"));

  screen.classList.add("active");
}

function saveNickname() {
  const value = nicknameInput.value.trim();

  if (value === "") {
    alert("닉네임을 입력해주세요!");
    return;
  }

  nickname = value;
  localStorage.setItem("omokNickname", nickname);
  nicknameText.textContent = nickname;
  closeUserMenu();
}

function closeUserMenu() {
  userMenuBox.classList.remove("show");
}

function closeGameMenu() {
  gameMenu.classList.remove("show");
}

function showMultiUI() {
  opponentPanel.style.display = "flex";
  myPanel.style.display = "flex";
  multiControlBox.style.display = "block";
}

function hideMultiUI() {
  opponentPanel.style.display = "none";
  myPanel.style.display = "none";
  multiControlBox.style.display = "none";
}