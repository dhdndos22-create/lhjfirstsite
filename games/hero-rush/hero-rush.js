const gameStartBtn = document.getElementById("gameStartBtn");
const startMessage = document.getElementById("startMessage");
let messageTimer = null;

gameStartBtn.addEventListener("click", () => {
  startMessage.textContent = "히어로러시 전투 화면을 준비 중입니다.";
  startMessage.classList.add("show");

  window.clearTimeout(messageTimer);
  messageTimer = window.setTimeout(() => {
    startMessage.classList.remove("show");
  }, 1800);
});
