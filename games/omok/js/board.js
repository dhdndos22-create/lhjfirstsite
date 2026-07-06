const boardElement = document.getElementById("board");
const turnText = document.getElementById("turnText");

const SIZE = 19;

let board = [];
let currentTurn = "black";
let gameOver = false;

function initBoard(cellClickHandler) {
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

      if (cellClickHandler) {
        cell.addEventListener("click", cellClickHandler);
      }

      boardElement.appendChild(cell);
    }
  }
}

function placeStone(row, col, color) {
  if (board[row][col] !== null) return false;

  board[row][col] = color;

  const cell = boardElement.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );

  const stone = document.createElement("div");
  stone.classList.add("stone", color);
  cell.appendChild(stone);

  return true;
}

function switchTurn() {
  currentTurn = currentTurn === "black" ? "white" : "black";
  turnText.textContent = currentTurn === "black" ? "흑돌" : "백돌";
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