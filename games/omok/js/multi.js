const socket = io("http://localhost:3000");

const roomList = document.getElementById("roomList");
const roomNameInput = document.getElementById("roomNameInput");

const lobbyRoomName = document.getElementById("lobbyRoomName");
const playerList = document.getElementById("playerList");
const lobbyMessage = document.getElementById("lobbyMessage");

const readyBtn = document.getElementById("readyBtn");
const startGameBtn = document.getElementById("startGameBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");

let currentRoomId = null;
let currentRoom = null;

function requestRoomList() {
  socket.emit("getRoomList");
}

socket.on("connect", () => {
  console.log("서버 연결 성공:", socket.id);
});

socket.on("roomList", (rooms) => {
  renderRoomList(rooms);
});

function renderRoomList(rooms) {
  roomList.innerHTML = "";

  if (rooms.length === 0) {
    roomList.innerHTML = `<p class="empty-room">아직 생성된 방이 없습니다.</p>`;
    return;
  }

  rooms.forEach((room) => {
    const roomCard = document.createElement("button");
    roomCard.classList.add("room-card");

    const statusText = room.status === "waiting" ? "대기중" : "게임중";

    roomCard.innerHTML = `
      <div>
        <strong>${room.roomName}</strong>
        <span>${room.playerCount}/${room.maxPlayers}</span>
      </div>
      <p>${statusText}</p>
    `;

    roomCard.addEventListener("click", () => {
      socket.emit("joinRoom", {
        roomId: room.roomId,
        nickname
      });
    });

    roomList.appendChild(roomCard);
  });
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

socket.on("roomCreated", ({ roomId, room }) => {
  currentRoomId = roomId;
  currentRoom = room;
  renderLobby(room);
  showScreen(lobbyScreen);
});

socket.on("roomJoined", ({ roomId, room }) => {
  currentRoomId = roomId;
  currentRoom = room;
  renderLobby(room);
  showScreen(lobbyScreen);
});

socket.on("joinRoomFailed", (message) => {
  alert(message);
});

socket.on("lobbyUpdated", (room) => {
  currentRoom = room;
  renderLobby(room);
});

function renderLobby(room) {
  lobbyRoomName.textContent = room.roomName;
  playerList.innerHTML = "";

  const myPlayer = room.players.find((p) => p.socketId === socket.id);
  const isMeHost = myPlayer && myPlayer.isHost;

  room.players.forEach((player) => {
    const playerCard = document.createElement("div");
    playerCard.classList.add("player-card");

    const hostIcon = player.isHost ? "👑 " : "";
    const readyText = player.isHost
      ? "방장"
      : player.ready
        ? "준비 완료"
        : "준비 전";

    playerCard.innerHTML = `
      <span class="player-name">${hostIcon}${player.nickname}</span>
      <span class="player-state">${readyText}</span>
    `;

    playerList.appendChild(playerCard);
  });

  if (room.players.length < 2) {
    lobbyMessage.textContent = "상대를 기다리는 중...";
  } else {
    lobbyMessage.textContent = "상대가 입장했습니다.";
  }

  if (isMeHost) {
    readyBtn.style.display = "none";
    startGameBtn.style.display = "block";

    const guest = room.players.find((p) => !p.isHost);
    const canStart = guest && guest.ready;

    startGameBtn.disabled = !canStart;
    startGameBtn.textContent = canStart
      ? "게임 시작"
      : "상대 준비 대기중";
  } else {
    readyBtn.style.display = "block";
    startGameBtn.style.display = "none";

    readyBtn.textContent = myPlayer.ready ? "준비 취소" : "준비하기";
  }
}

readyBtn.addEventListener("click", () => {
  if (!currentRoomId) return;

  socket.emit("toggleReady", {
    roomId: currentRoomId
  });
});

startGameBtn.addEventListener("click", () => {
  if (!currentRoomId) return;

  socket.emit("startGame", {
    roomId: currentRoomId
  });
});

leaveRoomBtn.addEventListener("click", () => {
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
});

socket.on("startGameFailed", (message) => {
  alert(message);
});

socket.on("multiGameStart", ({ roomId, players }) => {
  alert("게임을 시작합니다!");

  currentRoomId = roomId;

  showScreen(gameScreen);
  closeGameMenu();
  initBoard();

  turnText.textContent = "멀티 게임 시작!";
});