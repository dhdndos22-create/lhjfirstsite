const startScreen = document.getElementById("startScreen");
const modeScreen = document.getElementById("modeScreen");
const roomListScreen = document.getElementById("roomListScreen");
const gameScreen = document.getElementById("gameScreen");

const startBtn = document.getElementById("startBtn");
const singleBtn = document.getElementById("singleBtn");
const multiBtn = document.getElementById("multiBtn");
const backToStartBtn = document.getElementById("backToStartBtn");
const backToModeFromRoomBtn = document.getElementById("backToModeFromRoomBtn");

const userMenuBtn = document.getElementById("userMenuBtn");
const userMenuBox = document.getElementById("userMenuBox");
const nicknameText = document.getElementById("nicknameText");
const nicknameInput = document.getElementById("nicknameInput");
const saveNicknameBtn = document.getElementById("saveNicknameBtn");
const createRoomBtn = document.getElementById("createRoomBtn");

const menuBtn = document.getElementById("menuBtn");
const gameMenu = document.getElementById("gameMenu");
const menuResetBtn = document.getElementById("menuResetBtn");
const menuModeBtn = document.getElementById("menuModeBtn");

const boardElement = document.getElementById("board");
const turnText = document.getElementById("turnText");

const SIZE = 19;

let board = [];
let currentTurn = "black";
let gameOver = false;
let nickname = localStorage.getItem("omokNickname") || "게스트";

nicknameText.textContent = nickname;
nicknameInput.value = nickname;

function showScreen(screen) {
  startScreen.classList.remove("active");
  modeScreen.classList.remove("active");
  roomListScreen.classList.remove("active");
  gameScreen.classList.remove("active");

  screen.classList.add("active");
}

startBtn.addEventListener("click", () => {
  showScreen(modeScreen);
});

backToStartBtn.addEventListener("click", () => {
  showScreen(startScreen);
});

singleBtn.addEventListener("click", () => {
  showScreen(gameScreen);
  closeGameMenu();
  initGame();
});

multiBtn.addEventListener("click", () => {
  showScreen(roomListScreen);
});

backToModeFromRoomBtn.addEventListener("click", () => {
  closeUserMenu();
  showScreen(modeScreen);
});

userMenuBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  userMenuBox.classList.toggle("show");
});

saveNicknameBtn.addEventListener("click", () => {
  const newNickname = nicknameInput.value.trim();

  if (newNickname === "") {
    alert("닉네임을 입력해주세요!");
    return;
  }

  nickname = newNickname;
  localStorage.setItem("omokNickname", nickname);
  nicknameText.textContent = nickname;
  closeUserMenu();

  alert(`닉네임이 '${nickname}'으로 설정되었습니다.`);
});

createRoomBtn.addEventListener("click", () => {
  alert("방 만들기 기능은 다음 단계에서 추가할 예정입니다!");
});

menuBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  gameMenu.classList.toggle("show");
});

menuResetBtn.addEventListener("click", () => {
  closeGameMenu();
  initGame();
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

function closeGameMenu() {
  gameMenu.classList.remove("show");
}

function closeUserMenu() {
  userMenuBox.classList.remove("show");
}

function initGame() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  currentTurn = "black";
  gameOver = false;
  turnText.textContent = "흑돌";
  boardElement.innerHTML = "";

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handleCellClick);
      boardElement.appendChild(cell);
    }
  }
}

function handleCellClick(event) {
  if (gameOver) return;

  const cell = event.currentTarget;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);

  if (board[row][col] !== null) return;

  board[row][col] = currentTurn;
  drawStone(cell, currentTurn);

  if (checkWin(row, col, currentTurn)) {
    gameOver = true;

    const winner = currentTurn === "black" ? "흑돌" : "백돌";
    turnText.textContent = `${winner} 승리!`;

    setTimeout(() => {
      alert(`${winner} 승리!`);
    }, 100);

    return;
  }

  currentTurn = currentTurn === "black" ? "white" : "black";
  turnText.textContent = currentTurn === "black" ? "흑돌" : "백돌";
}

function drawStone(cell, color) {
  const stone = document.createElement("div");
  stone.classList.add("stone", color);
  cell.appendChild(stone);
}

function checkWin(row, col, color) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    count += countStones(row, col, dr, dc, color);
    count += countStones(row, col, -dr, -dc, color);

    if (count >= 5) return true;
  }

  return false;
}

function countStones(row, col, dr, dc, color) {
  let count = 0;
  let nextRow = row + dr;
  let nextCol = col + dc;

  while (
    nextRow >= 0 &&
    nextRow < SIZE &&
    nextCol >= 0 &&
    nextCol < SIZE &&
    board[nextRow][nextCol] === color
  ) {
    count++;
    nextRow += dr;
    nextCol += dc;
  }

  return count;
}