const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

app.get("/", (_req, res) => {
  res.send("효종월드 오목 서버가 정상 실행 중입니다.");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const BOARD_SIZE = 19;
const rooms = {};

function makeRoomId() {
  let roomId;
  do {
    roomId = Math.random().toString(36).slice(2, 8);
  } while (rooms[roomId]);
  return roomId;
}

function createBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function getRoomList() {
  return Object.values(rooms).map((room) => ({
    roomId: room.roomId,
    roomName: room.roomName,
    playerCount: room.players.length,
    maxPlayers: 2,
    status: room.status
  }));
}

function sendRoomList() {
  io.emit("roomList", getRoomList());
}

function getPublicRoom(room) {
  return {
    roomId: room.roomId,
    roomName: room.roomName,
    hostId: room.hostId,
    players: room.players.map((player) => ({ ...player })),
    status: room.status,
    turn: room.turn,
    winnerColor: room.winnerColor
  };
}

function countDirection(board, row, col, dr, dc, color) {
  let count = 0;
  let nextRow = row + dr;
  let nextCol = col + dc;

  while (
    nextRow >= 0 &&
    nextRow < BOARD_SIZE &&
    nextCol >= 0 &&
    nextCol < BOARD_SIZE &&
    board[nextRow][nextCol] === color
  ) {
    count++;
    nextRow += dr;
    nextCol += dc;
  }

  return count;
}

function checkWin(board, row, col, color) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  return directions.some(([dr, dc]) => {
    const count =
      1 +
      countDirection(board, row, col, dr, dc, color) +
      countDirection(board, row, col, -dr, -dc, color);

    return count >= 5;
  });
}

function isBoardFull(board) {
  return board.every((row) => row.every((cell) => cell !== null));
}

function removePlayerFromRoom(socket, roomId, disconnected = false) {
  const room = rooms[roomId];
  if (!room) return;

  const leavingPlayer = room.players.find((player) => player.socketId === socket.id);
  if (!leavingPlayer) return;

  socket.leave(roomId);
  room.players = room.players.filter((player) => player.socketId !== socket.id);

  if (room.players.length === 0) {
    delete rooms[roomId];
    sendRoomList();
    return;
  }

  const remainingPlayer = room.players[0];
  remainingPlayer.isHost = true;
  remainingPlayer.ready = true;
  remainingPlayer.color = null;
  room.hostId = remainingPlayer.socketId;
  room.status = "waiting";
  room.board = createBoard();
  room.turn = "black";
  room.winnerColor = null;

  io.to(roomId).emit(
    "opponentLeft",
    disconnected ? "상대의 연결이 끊겼습니다." : "상대가 방을 나갔습니다."
  );
  io.to(roomId).emit("lobbyUpdated", getPublicRoom(room));
  sendRoomList();
}

io.on("connection", (socket) => {
  console.log("접속:", socket.id);

  socket.on("login", ({ username, password } = {}) => {
    if (!String(username || "").trim() || !String(password || "").trim()) {
      socket.emit("loginFailed", "유저명과 비밀번호를 입력해주세요.");
      return;
    }

    socket.emit("loginSuccess", { username: String(username).trim() });
  });

  socket.on("getRoomList", () => {
    socket.emit("roomList", getRoomList());
  });

  socket.on("createRoom", ({ roomName, nickname } = {}) => {
    const roomId = makeRoomId();
    const safeRoomName = String(roomName || "").trim().slice(0, 16) || "이름 없는 방";
    const safeNickname = String(nickname || "").trim().slice(0, 10) || "guest";

    rooms[roomId] = {
      roomId,
      roomName: safeRoomName,
      hostId: socket.id,
      players: [
        {
          socketId: socket.id,
          nickname: safeNickname,
          isHost: true,
          ready: true,
          color: null
        }
      ],
      status: "waiting",
      board: createBoard(),
      turn: "black",
      winnerColor: null
    };

    socket.join(roomId);
    socket.emit("roomCreated", {
      roomId,
      room: getPublicRoom(rooms[roomId])
    });
    io.to(roomId).emit("lobbyUpdated", getPublicRoom(rooms[roomId]));
    sendRoomList();
  });

  socket.on("joinRoom", ({ roomId, nickname } = {}) => {
    const room = rooms[roomId];

    if (!room) {
      socket.emit("joinRoomFailed", "존재하지 않는 방입니다.");
      return;
    }

    if (room.players.some((player) => player.socketId === socket.id)) {
      socket.emit("roomJoined", { roomId, room: getPublicRoom(room) });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit("joinRoomFailed", "이미 가득 찬 방입니다.");
      return;
    }

    if (room.status !== "waiting") {
      socket.emit("joinRoomFailed", "이미 게임이 시작된 방입니다.");
      return;
    }

    room.players.push({
      socketId: socket.id,
      nickname: String(nickname || "").trim().slice(0, 10) || "guest",
      isHost: false,
      ready: false,
      color: null
    });

    socket.join(roomId);
    socket.emit("roomJoined", { roomId, room: getPublicRoom(room) });
    io.to(roomId).emit("lobbyUpdated", getPublicRoom(room));
    sendRoomList();
  });

  socket.on("toggleReady", ({ roomId } = {}) => {
    const room = rooms[roomId];
    if (!room || room.status !== "waiting") return;

    const player = room.players.find((item) => item.socketId === socket.id);
    if (!player || player.isHost) return;

    player.ready = !player.ready;
    io.to(roomId).emit("lobbyUpdated", getPublicRoom(room));
  });

  socket.on("startGame", ({ roomId } = {}) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.hostId !== socket.id) {
      socket.emit("startGameFailed", "방장만 게임을 시작할 수 있습니다.");
      return;
    }

    if (room.players.length !== 2) {
      socket.emit("startGameFailed", "상대가 아직 없습니다.");
      return;
    }

    const guest = room.players.find((player) => !player.isHost);
    if (!guest || !guest.ready) {
      socket.emit("startGameFailed", "상대가 아직 준비하지 않았습니다.");
      return;
    }

    room.status = "playing";
    room.board = createBoard();
    room.turn = "black";
    room.winnerColor = null;

    const host = room.players.find((player) => player.isHost);
    host.color = "black";
    guest.color = "white";

    for (const player of room.players) {
      io.to(player.socketId).emit("multiGameStart", {
        roomId,
        room: getPublicRoom(room),
        color: player.color,
        turn: room.turn
      });
    }

    io.to(roomId).emit("lobbyUpdated", getPublicRoom(room));
    sendRoomList();
  });

  socket.on("placeStone", ({ roomId, row, col } = {}) => {
    const room = rooms[roomId];

    if (!room || room.status !== "playing") {
      socket.emit("moveRejected", "게임이 진행 중이 아닙니다.");
      return;
    }

    const player = room.players.find((item) => item.socketId === socket.id);
    if (!player || !player.color) {
      socket.emit("moveRejected", "플레이어 정보를 찾을 수 없습니다.");
      return;
    }

    const safeRow = Number(row);
    const safeCol = Number(col);

    if (!Number.isInteger(safeRow) || !Number.isInteger(safeCol)) return;
    if (safeRow < 0 || safeRow >= BOARD_SIZE || safeCol < 0 || safeCol >= BOARD_SIZE) return;

    if (room.turn !== player.color) {
      socket.emit("moveRejected", "상대 차례입니다.");
      return;
    }

    if (room.board[safeRow][safeCol] !== null) {
      socket.emit("moveRejected", "이미 돌이 놓인 자리입니다.");
      return;
    }

    room.board[safeRow][safeCol] = player.color;
    const won = checkWin(room.board, safeRow, safeCol, player.color);
    const draw = !won && isBoardFull(room.board);
    const nextTurn = player.color === "black" ? "white" : "black";

    if (!won && !draw) room.turn = nextTurn;

    io.to(roomId).emit("stonePlaced", {
      roomId,
      row: safeRow,
      col: safeCol,
      color: player.color,
      nextTurn: room.turn
    });

    if (won || draw) {
      room.status = "finished";
      room.winnerColor = won ? player.color : null;

      io.to(roomId).emit("multiGameOver", {
        roomId,
        winnerColor: room.winnerColor,
        winnerNickname: won ? player.nickname : null,
        isDraw: draw
      });

      sendRoomList();
    }
  });

  socket.on("leaveRoom", ({ roomId } = {}) => {
    removePlayerFromRoom(socket, roomId, false);
  });

  socket.on("disconnect", () => {
    console.log("나감:", socket.id);

    for (const roomId of Object.keys(rooms)) {
      if (rooms[roomId].players.some((player) => player.socketId === socket.id)) {
        removePlayerFromRoom(socket, roomId, true);
      }
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`효종월드 오목 서버 실행 중: ${PORT}`);
});
