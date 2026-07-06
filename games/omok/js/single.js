function startSingleGame() {
  showScreen(gameScreen);
  closeGameMenu();
  initBoard(handleSingleCellClick);
}

function handleSingleCellClick(event) {
  if (gameOver) return;

  const cell = event.currentTarget;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const color = currentTurn;

  const success = placeStone(row, col, color);
  if (!success) return;

  if (checkWin(row, col, color)) {
    gameOver = true;

    const winner = color === "black" ? "흑돌" : "백돌";
    turnText.textContent = `${winner} 승리!`;

    setTimeout(() => {
      alert(`${winner} 승리!`);
    }, 100);

    return;
  }

  switchTurn();
}