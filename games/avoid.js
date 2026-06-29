const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const game = document.getElementById("game");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");

let score = 0;
let scoreInterval;
let collisionInterval;
let isStarted = false;

startBtn.onclick = function () {
  if (isStarted) return;

  isStarted = true;
  score = 0;

  startScreen.style.display = "none";
  game.style.display = "block";
  scoreText.innerHTML = "점수 : 0";

  obstacle.classList.add("obstacleMove");

  scoreInterval = setInterval(function () {
    score++;
    scoreText.innerHTML = "점수 : " + score;
  }, 100);

  collisionInterval = setInterval(function () {
    const p = player.getBoundingClientRect();
    const o = obstacle.getBoundingClientRect();

    if (
      p.left < o.right &&
      p.right > o.left &&
      p.bottom > o.top &&
      p.top < o.bottom
    ) {
      clearInterval(scoreInterval);
      clearInterval(collisionInterval);

      alert("게임오버!\n점수 : " + score);
      location.reload();
    }
  }, 10);
};

document.addEventListener("keydown", function (e) {
  if (!isStarted) return;

  if (e.code === "Space") {
    if (!player.classList.contains("jump")) {
      player.classList.add("jump");

      setTimeout(function () {
        player.classList.remove("jump");
      }, 550);
    }
  }
});