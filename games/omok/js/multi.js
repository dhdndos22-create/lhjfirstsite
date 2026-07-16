const roomList = document.getElementById("roomList");
const roomNameInput = document.getElementById("roomNameInput");

const opponentName = document.getElementById("opponentName");
const opponentState = document.getElementById("opponentState");
const myName = document.getElementById("myName");
const myState = document.getElementById("myState");

const readyBtn = document.getElementById("readyBtn");
const startGameBtn = document.getElementById("startGameBtn");

let currentRoomId = null;
let currentRoom = null;
let myColor = null;
let multiTurn = null;
let multiGameStarted = false;
let isMultiMode = false;

function requestRoomList() {
  socket.emit("getRoomList");
}

function createRoom() {
  const roomName = roomNameInput.value.trim();

  if (roomName === "") {
    alert("방 이름을 입력해주세요!");
    return;
  }

  if (!socket.connected) {
    alert("서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  socket.emit("createRoom", {
    roomName,
    nickname
  });

  roomNameInput.value = "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

socket.on("roomList", (rooms) => {
  roomList.innerHTML = "";

  if (!Array.isArray(rooms) || rooms.length === 0) {
    roomList.innerHTML = `<p class="empty-room">아직 생성된 방이 없습니다.</p>`;
    return;
  }

  rooms.forEach((room) => {
    const roomCard = document.createElement("button");
    roomCard.classList.add("room-card");

    const isJoinable = room.status === "waiting" && room.playerCount < room.maxPlayers;
    roomCard.disabled = !isJoinable;

    roomCard.innerHTML = `
      <div>
        <strong>${escapeHtml(room.roomName)}</strong>
        <span>${room.playerCount}/${room.maxPlayers}</span>
      </div>
      <p>${room.status === "waiting" ? "대기중" : "게임중"}</p>
    `;

    roomCard.addEventListener("click", () => {
      socket.emit("joinRoom", {
        roomId: room.roomId,
        nickname
      });
    });

    roomList.appendChild(roomCard);
  });
});

function enterMultiRoom(roomId, room) {
  currentRoomId = roomId;
  currentRoom = room;
  isMultiMode = true;
  multiGameStarted = room.status === "playing";

  showScreen(gameScreen);
  showMultiUI();
  closeGameMenu();
  initBoard(handleMultiCellClick);
  renderGameRoom(room);
}

socket.on("roomCreated", ({ roomId, room }) => {
  enterMultiRoom(roomId, room);
  turnText.textContent = "상대 기다리는 중...";
});

socket.on("roomJoined", ({ roomId, room }) => {
  enterMultiRoom(roomId, room);
  turnText.textContent = "게임 준비중";
});

socket.on("joinRoomFailed", (message) => {
  alert(message);
});

socket.on("lobbyUpdated", (room) => {
  if (!currentRoomId || room.roomId !== currentRoomId) return;
  currentRoom = room;
  renderGameRoom(room);
});

function renderGameRoom(room) {
  const me = room.players.find((player) => player.socketId === socket.id);
  const opponent = room.players.find((player) => player.socketId !== socket.id);

  if (!me) return;

  myName.textContent = me.nickname;
  myState.textContent = getPlayerStateText(me);

  if (opponent) {
    opponentName.textContent = opponent.nickname;
    opponentState.textContent = getPlayerStateText(opponent);
  } else {
    opponentName.textContent = "상대 기다리는 중...";
    opponentState.textContent = "대기중";
  }

  if (room.status === "playing") {
    readyBtn.style.display = "none";
    startGameBtn.style.display = "none";
    return;
  }

  if (me.isHost) {
    readyBtn.style.display = "none";
    startGameBtn.style.display = "block";

    const guest = room.players.find((player) => !player.isHost);
    const canStart = Boolean(guest && guest.ready);

    startGameBtn.disabled = !canStart;
    startGameBtn.textContent = canStart ? "게임 시작" : "상대 준비 대기중";
  } else {
    readyBtn.style.display = "block";
    startGameBtn.style.display = "none";
    readyBtn.textContent = me.ready ? "준비 취소" : "준비하기";
  }
}

function getPlayerStateText(player) {
  if (currentRoom?.status === "playing" && player.color) {
    return player.color === "black" ? "⚫ 흑돌" : "⚪ 백돌";
  }

  if (player.isHost) return "방장";
  return player.ready ? "준비 완료" : "준비 전";
}

function toggleReady() {
  if (!currentRoomId || multiGameStarted) return;
  socket.emit("toggleReady", { roomId: currentRoomId });
}

function startMultiGame() {
  if (!currentRoomId || multiGameStarted) return;
  socket.emit("startGame", { roomId: currentRoomId });
}

function handleMultiCellClick(event) {
  if (!isMultiMode || !multiGameStarted || gameOver) return;

  if (myColor !== multiTurn) {
    turnText.textContent = "상대 차례입니다.";
    return;
  }

  const row = Number(event.currentTarget.dataset.row);
  const col = Number(event.currentTarget.dataset.col);

  if (board[row][col] !== null) return;

  socket.emit("placeStone", {
    roomId: currentRoomId,
    row,
    col
  });
}

function leaveRoom() {
  if (currentRoomId) {
    socket.emit("leaveRoom", { roomId: currentRoomId });
  }

  resetMultiState();
  showScreen(roomListScreen);
  requestRoomList();
}

function resetMultiState() {
  currentRoomId = null;
  currentRoom = null;
  myColor = null;
  multiTurn = null;
  multiGameStarted = false;
  isMultiMode = false;
  gameOver = false;
}

function updateTurnMessage() {
  if (!multiGameStarted || gameOver) return;

  const turnName = multiTurn === "black" ? "흑돌" : "백돌";
  const isMyTurn = myColor === multiTurn;

  turnText.textContent = isMyTurn
    ? `내 차례 (${turnName})`
    : `상대 차례 (${turnName})`;

  boardElement.classList.toggle("waiting-turn", !isMyTurn);
}

socket.on("startGameFailed", (message) => {
  alert(message);
});

socket.on("multiGameStart", ({ roomId, room, color, turn }) => {
  if (roomId !== currentRoomId) return;

  currentRoom = room;
  myColor = color;
  multiTurn = turn;
  multiGameStarted = true;
  gameOver = false;

  initBoard(handleMultiCellClick);
  renderGameRoom(room);
  updateTurnMessage();
});

socket.on("stonePlaced", ({ roomId, row, col, color, nextTurn }) => {
  if (roomId !== currentRoomId) return;

  placeStone(row, col, color);
  multiTurn = nextTurn;
  setBoardTurn(nextTurn);
  updateTurnMessage();
});

socket.on("moveRejected", (message) => {
  if (message) turnText.textContent = message;
});

socket.on("multiGameOver", ({ roomId, winnerColor, winnerNickname, isDraw }) => {
  if (roomId !== currentRoomId) return;

  gameOver = true;
  multiGameStarted = false;
  boardElement.classList.add("waiting-turn");

  if (isDraw) {
    turnText.textContent = "무승부!";
    setTimeout(() => alert("무승부입니다!"), 100);
    return;
  }

  const didIWin = winnerColor === myColor;
  turnText.textContent = didIWin
    ? `승리! (${winnerNickname})`
    : `패배... (${winnerNickname} 승리)`;

  setTimeout(() => {
    alert(didIWin ? "승리했습니다!" : `${winnerNickname}님이 승리했습니다.`);
  }, 100);
});

socket.on("opponentLeft", (message) => {
  if (!currentRoomId) return;

  multiGameStarted = false;
  gameOver = true;
  opponentName.textContent = "상대 없음";
  opponentState.textContent = "퇴장";
  turnText.textContent = message || "상대가 방을 나갔습니다.";
  boardElement.classList.add("waiting-turn");
});

socket.on("roomClosed", (message) => {
  alert(message || "방이 종료되었습니다.");
  resetMultiState();
  showScreen(roomListScreen);
  requestRoomList();
});
