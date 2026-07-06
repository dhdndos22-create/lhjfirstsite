const roomList = document.getElementById("roomList");
const roomNameInput = document.getElementById("roomNameInput");

const lobbyRoomName = document.getElementById("lobbyRoomName");
const playerList = document.getElementById("playerList");
const lobbyMessage = document.getElementById("lobbyMessage");

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

  const me = room.players.find((p) => p.socketId === socket.id);
  const isHost = me && me.isHost;

  room.players.forEach((player) => {
    const card = document.createElement("div");
    card.classList.add("player-card");

    const hostIcon = player.isHost ? "👑 " : "";
    const state = player.isHost
      ? "방장"
      : player.ready
        ? "준비 완료"
        : "준비 전";

    card.innerHTML = `
      <span class="player-name">${hostIcon}${player.nickname}</span>
      <span class="player-state">${state}</span>
    `;

    playerList.appendChild(card);
  });

  lobbyMessage.textContent =
    room.players.length < 2 ? "상대를 기다리는 중..." : "상대가 입장했습니다.";

  if (isHost) {
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

  alert("게임을 시작합니다!");

  showScreen(gameScreen);
  closeGameMenu();
  initBoard();

  turnText.textContent = "멀티 게임 시작!";
});