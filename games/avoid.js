const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

const game = document.getElementById("game");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");

let score = 0;
let isGameOver = false;
let isGameStarted = false;

let scoreInterval;
let collisionInterval;

startBtn.addEventListener("click", startGame);

function startGame() {
  isGameStarted = true;
  isGameOver = false;
  score = 0;

  scoreText.textContent = "점수: 0";

  startScreen.style.display = "none";
  game.style.display = "block";

  obstacle.classList.add("obstacle-move");

  scoreInterval = setInterval(() => {
    if (!isGameOver) {
      score++;
      scoreText.textContent = "점수: " + score;
    }
  }, 100);

  collisionInterval = setInterval(() => {
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    const isCollision =
      playerRect.left < obstacleRect.right &&
      playerRect.right > obstacleRect.left &&
      playerRect.bottom > obstacleRect.top &&
      playerRect.top < obstacleRect.bottom;

    if (isCollision) {
      gameOver();
    }
  }, 10);
}

function jump() {
  if (!isGameStarted || isGameOver) return;

  if (!player.classList.contains("jump")) {
    player.classList.add("jump");

    setTimeout(() => {
      player.classList.remove("jump");
    }, 550);
  }
}

document.addEventListener("keydown", function(event) {
  if (event.code === "Space") {
    jump();
  }
});

function gameOver() {
  isGameOver = true;

  clearInterval(scoreInterval);
  clearInterval(collisionInterval);

  alert("게임 오버! 점수: " + score);
  location.reload();
}