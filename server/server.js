const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

const rooms = {};

function makeRoomId() {
  return Math.random().toString(36).substring(2, 8);
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

io.on("connection", (socket) => {
  console.log("접속:", socket.id);
  socket.on("login", ({ username, password }) => {
    if (!username || !password) {
      socket.emit("loginFailed", "유저명과 비밀번호를 입력해주세요.");
      return;
    }

     socket.emit("loginSuccess", {
       username
      });
  });



  socket.on("getRoomList", () => {
    socket.emit("roomList", getRoomList());
  });

  socket.on("createRoom", ({ roomName, nickname }) => {
    const roomId = makeRoomId();
    
    rooms[roomId] = {
      roomId,
      roomName: roomName || "이름 없는 방",
      hostId: socket.id,
      players: [
        {
          socketId: socket.id,
          nickname: nickname || "게스트",
          isHost: true,
          ready: true
        }
      ],
      status: "waiting"
    };

    socket.join(roomId);

    socket.emit("roomCreated", {
      roomId,
      room: rooms[roomId]
    });

    io.to(roomId).emit("lobbyUpdated", rooms[roomId]);
    sendRoomList();
  });

  socket.on("joinRoom", ({ roomId, nickname }) => {
    const room = rooms[roomId];

    if (!room) {
      socket.emit("joinRoomFailed", "존재하지 않는 방입니다.");
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
      nickname: nickname || "게스트",
      isHost: false,
      ready: false
    });

    socket.join(roomId);

    socket.emit("roomJoined", {
      roomId,
      room
    });

    io.to(roomId).emit("lobbyUpdated", room);
    sendRoomList();
  });

  socket.on("toggleReady", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player || player.isHost) return;

    player.ready = !player.ready;

    io.to(roomId).emit("lobbyUpdated", room);
  });

  socket.on("startGame", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.hostId !== socket.id) {
      socket.emit("startGameFailed", "방장만 게임을 시작할 수 있습니다.");
      return;
    }

    if (room.players.length < 2) {
      socket.emit("startGameFailed", "상대가 아직 없습니다.");
      return;
    }

    const guest = room.players.find((p) => !p.isHost);

    if (!guest.ready) {
      socket.emit("startGameFailed", "상대가 아직 준비하지 않았습니다.");
      return;
    }

    room.status = "playing";

    io.to(roomId).emit("multiGameStart", {
      roomId,
      players: room.players
    });

    sendRoomList();
  });

  socket.on("leaveRoom", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    socket.leave(roomId);

    room.players = room.players.filter((p) => p.socketId !== socket.id);

    if (room.players.length === 0) {
      delete rooms[roomId];
    } else {
      room.hostId = room.players[0].socketId;
      room.players[0].isHost = true;
      room.players[0].ready = true;

      io.to(roomId).emit("lobbyUpdated", room);
    }

    sendRoomList();
  });

  socket.on("disconnect", () => {
    console.log("나감:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      const isInRoom = room.players.some((p) => p.socketId === socket.id);

      if (isInRoom) {
        room.players = room.players.filter((p) => p.socketId !== socket.id);

        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          room.hostId = room.players[0].socketId;
          room.players[0].isHost = true;
          room.players[0].ready = true;

          io.to(roomId).emit("lobbyUpdated", room);
        }
      }
    }

    sendRoomList();
  });
});

server.listen(PORT, () => {
  console.log(`오목 서버 실행 중: http://localhost:${PORT}`);
});