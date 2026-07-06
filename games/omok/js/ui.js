const startScreen = document.getElementById("startScreen");
const modeScreen = document.getElementById("modeScreen");
const roomListScreen = document.getElementById("roomListScreen");
const createRoomScreen = document.getElementById("createRoomScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");

let nickname = localStorage.getItem("omokNickname") || "게스트";

const nicknameText = document.getElementById("nicknameText");
const nicknameInput = document.getElementById("nicknameInput");
const userMenuBox = document.getElementById("userMenuBox");
const gameMenu = document.getElementById("gameMenu");

nicknameText.textContent = nickname;
nicknameInput.value = nickname;

function showScreen(screen) {
  [
    startScreen,
    modeScreen,
    roomListScreen,
    createRoomScreen,
    lobbyScreen,
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