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

let waitingPlayer = null;
const rooms = {};

const SIZE = 19;

function createBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function checkWin(board, row, col, color) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (const [dr, dc] of directions) {
    let count = 1;
    count += countStones(board, row, col, dr, dc, color);
    count += countStones(board, row, col, -dr, -dc, color);

    if (count >= 5) return true;
  }

  return false;
}

function countStones(board, row, col, dr, dc, color) {
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

io.on("connection", (socket) => {
  console.log("접속:", socket.id);

  socket.on("joinGame", () => {
    if (waitingPlayer && waitingPlayer.id !== socket.id) {
      const roomId = `room-${waitingPlayer.id}-${socket.id}`;

      socket.join(roomId);
      waitingPlayer.join(roomId);

      rooms[roomId] = {
        board: createBoard(),
        players: {
          black: waitingPlayer.id,
          white: socket.id
        },
        turn: "black",
        gameOver: false
      };

      waitingPlayer.emit("gameStart", {
        roomId,
        color: "black",
        message: "게임 시작! 당신은 흑돌입니다."
      });

      socket.emit("gameStart", {
        roomId,
        color: "white",
        message: "게임 시작! 당신은 백돌입니다."
      });

      io.to(roomId).emit("turnChanged", "black");

      waitingPlayer = null;
    } else {
      waitingPlayer = socket;
      socket.emit("waiting", "상대를 기다리는 중...");
    }
  });

  socket.on("placeStone", ({ roomId, row, col }) => {
    const room = rooms[roomId];
    if (!room || room.gameOver) return;

    const color = room.players.black === socket.id ? "black" : "white";

    if (room.turn !== color) return;
    if (room.board[row][col] !== null) return;

    room.board[row][col] = color;

    io.to(roomId).emit("stonePlaced", {
      row,
      col,
      color
    });

    if (checkWin(room.board, row, col, color)) {
      room.gameOver = true;
      io.to(roomId).emit("gameOver", color);
      return;
    }

    room.turn = color === "black" ? "white" : "black";
    io.to(roomId).emit("turnChanged", room.turn);
  });

  socket.on("disconnect", () => {
    console.log("나감:", socket.id);

    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }

    for (const roomId in rooms) {
      const room = rooms[roomId];

      if (
        room.players.black === socket.id ||
        room.players.white === socket.id
      ) {
        io.to(roomId).emit("opponentLeft", "상대가 나갔습니다.");
        delete rooms[roomId];
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`오목 서버 실행 중: http://localhost:${PORT}`);
});