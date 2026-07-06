const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("서버 연결 성공:", socket.id);
});