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

function requestRoomList() {
  socket.emit("getRoomList");
}

function createRoom() {
  const roomName = roomNameInput.value.trim();

  if (roomName === "") {
    alert("방 이름을 입력해주세요!");
    return;
  }

  socket.emit("createRoom", {
    roomName,
    nickname
  });

  roomNameInput.value = "";
}

socket.on("roomList", (rooms) => {
  roomList.innerHTML = "";

  if (rooms.length === 0) {
    roomList.innerHTML = `<p class="empty-room">아직 생성된 방이 없습니다.</p>`;
    return;
  }

  rooms.forEach((room) => {
    const roomCard = document.createElement("button");
    roomCard.classList.add("room-card");

    roomCard.innerHTML = `
      <div>
        <strong>${room.roomName}</strong>
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

socket.on("roomCreated", ({ roomId, room }) => {
  currentRoomId = roomId;
  currentRoom = room;

  showScreen(gameScreen);
  showMultiUI();
  closeGameMenu();
  initBoard();

  turnText.textContent = "상대 기다리는 중...";
  renderGameRoom(room);
});

socket.on("roomJoined", ({ roomId, room }) => {
  currentRoomId = roomId;
  currentRoom = room;

  showScreen(gameScreen);
  showMultiUI();
  closeGameMenu();
  initBoard();

  turnText.textContent = "게임 준비중";
  renderGameRoom(room);
});

socket.on("joinRoomFailed", (message) => {
  alert(message);
});

socket.on("lobbyUpdated", (room) => {
  currentRoom = room;
  renderGameRoom(room);
});

function renderGameRoom(room) {
  const me = room.players.find((p) => p.socketId === socket.id);
  const opponent = room.players.find((p) => p.socketId !== socket.id);

  if (!me) return;

  myName.textContent = me.nickname;
  myState.textContent = me.isHost
    ? "방장"
    : me.ready
      ? "준비 완료"
      : "준비 전";

  if (opponent) {
    opponentName.textContent = opponent.nickname;
    opponentState.textContent = opponent.isHost
      ? "방장"
      : opponent.ready
        ? "준비 완료"
        : "준비 전";
  } else {
    opponentName.textContent = "상대 기다리는 중...";
    opponentState.textContent = "대기중";
  }

  if (me.isHost) {
    readyBtn.style.display = "none";
    startGameBtn.style.display = "block";

    const guest = room.players.find((p) => !p.isHost);
    const canStart = guest && guest.ready;

    startGameBtn.disabled = !canStart;
    startGameBtn.textContent = canStart ? "게임 시작" : "상대 준비 대기중";
  } else {
    readyBtn.style.display = "block";
    startGameBtn.style.display = "none";

    readyBtn.textContent = me.ready ? "준비 취소" : "준비하기";
  }

  if (room.status === "playing") {
    readyBtn.style.display = "none";
    startGameBtn.style.display = "none";
    turnText.textContent = "멀티 게임 진행중";
  }
}

function toggleReady() {
  if (!currentRoomId) return;

  socket.emit("toggleReady", {
    roomId: currentRoomId
  });
}

function startMultiGame() {
  if (!currentRoomId) return;

  socket.emit("startGame", {
    roomId: currentRoomId
  });
}

function leaveRoom() {
  if (!currentRoomId) {
    showScreen(roomListScreen);
    return;
  }

  socket.emit("leaveRoom", {
    roomId: currentRoomId
  });

  currentRoomId = null;
  currentRoom = null;

  showScreen(roomListScreen);
  requestRoomList();
}

socket.on("startGameFailed", (message) => {
  alert(message);
});

socket.on("multiGameStart", ({ roomId }) => {
  currentRoomId = roomId;

  turnText.textContent = "게임 시작!";
  readyBtn.style.display = "none";
  startGameBtn.style.display = "none";
});