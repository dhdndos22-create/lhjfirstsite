const socket = io("https://lhjfirstsite.onrender.com");

socket.on("connect", () => {
  console.log("서버 연결 성공:", socket.id);
});