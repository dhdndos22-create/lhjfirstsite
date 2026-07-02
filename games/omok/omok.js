const startScreen = document.getElementById("startScreen");
const modeScreen = document.getElementById("modeScreen");
const gameScreen = document.getElementById("gameScreen");

const startBtn = document.getElementById("startBtn");
const singleBtn = document.getElementById("singleBtn");
const multiBtn = document.getElementById("multiBtn");
const backToStartBtn = document.getElementById("backToStartBtn");
const backToModeBtn = document.getElementById("backToModeBtn");

const boardElement = document.getElementById("board");
const turnText = document.getElementById("turnText");
const resetBtn = document.getElementById("resetBtn");

const SIZE = 19;

let board = [];
let currentTurn = "black";
let gameOver = false;

function showScreen(screen) {
  startScreen.classList.remove("active");
  modeScreen.classList.remove("active");
  gameScreen.classList.remove("active");

  screen.classList.add("active");
}

startBtn.addEventListener("click", () => {
  showScreen(modeScreen);
});

backToStartBtn.addEventListener("click", () => {
  showScreen(startScreen);
});

backToModeBtn.addEventListener("click", () => {
  showScreen(modeScreen);
});

multiBtn.addEventListener("click", () => {
  alert("멀티 플레이는 아직 준비중입니다!");
});

singleBtn.addEventListener("click", () => {
  showScreen(gameScreen);
  initGame();
});

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

resetBtn.addEventListener("click", initGame);