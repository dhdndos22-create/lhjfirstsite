function startSingleGame() {
  showScreen(gameScreen);
  closeGameMenu();
  initBoard();

  boardElement.addEventListener("click", handleSingleBoardClick);
}

function handleSingleBoardClick(event) {
  if (!event.target.classList.contains("cell")) return;
  if (isGameOver()) return;

  const cell = event.target;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const color = getCurrentTurn();

  const success = placeStone(row, col, color);
  if (!success) return;

  if (checkWin(row, col, color)) {
    setGameOver(true);

    const winner = color === "black" ? "흑돌" : "백돌";
    turnText.textContent = `${winner} 승리!`;

    setTimeout(() => {
      alert(`${winner} 승리!`);
    }, 100);

    return;
  }

  switchTurn();
}