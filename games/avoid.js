const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const game = document.getElementById("game");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");

let nextObstacleTimeout = null;
let gameRunning = false;
let score = 0;

let playerBaseBottom = 58;
let obstacleX = -100;
let obstacleSpeed = 6;
let jumpTime = 550;

let scoreTimer = null;
let obstacleTimer = null;
let collisionTimer = null;
let firstObstacleTimer = null;

startBtn.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;

  obstacleX = -100;
  obstacleSpeed = 6;
  jumpTime = 550;

  startScreen.style.display = "none";
  game.style.display = "block";

  scoreText.textContent = "점수 : 0";
  obstacle.style.right = obstacleX + "px";
  player.style.setProperty("--jump-time", jumpTime + "ms");

  scoreTimer = setInterval(updateScore, 100);

  firstObstacleTimer = setTimeout(() => {
    startObstacle();
  }, 3000);

  collisionTimer = setInterval(checkCollision, 10);
}

function updateScore() {
  if (!gameRunning) return;

  score++;
  scoreText.textContent = "점수 : " + score;
}

function startObstacle() {
  obstacleTimer = setInterval(moveObstacle, 16);
}

function moveObstacle() {
  if (!gameRunning) return;

  obstacleX += obstacleSpeed;
  obstacle.style.right = obstacleX + "px";

  const gameWidth = game.clientWidth;

  if (obstacleX > gameWidth + 100) {
    clearInterval(obstacleTimer);

    // 1000점 전까지만 난이도 증가
    if (score < 1500) {
      // 기존 0.18의 1.25배 = 0.225

      obstacleSpeed = Math.min(obstacleSpeed + 0.27, 12);
      jumpTime = Math.max(jumpTime - 7.5, 400);
      

      player.style.setProperty("--jump-time", jumpTime + "ms");
    }

    obstacleX = -100;

    // 장애물 텀 살짝 빠르게: 0.9초 ~ 1.6초
    const delay = 600 + Math.random() * 500;

    nextObstacleTimeout = setTimeout(function () {
      obstacle.style.right = obstacleX + "px";
      obstacleTimer = setInterval(moveObstacle, 16);
    }, delay);
  }
}

function jump() {
  if (!gameRunning) return;

  if (player.classList.contains("jump")) return;

  player.classList.add("jump");

  setTimeout(() => {
    player.classList.remove("jump");
  }, jumpTime);
}

function checkCollision() {
  if (!gameRunning) return;

  const p = player.getBoundingClientRect();
  const o = obstacle.getBoundingClientRect();

  const playerHitbox = {
    left: p.left + 18,
    right: p.right - 18,
    top: p.top + 18,
    bottom: p.bottom - 12
  };

  const obstacleHitbox = {
    left: o.left + 4,
    right: o.right - 4,
    top: o.top + 4,
    bottom: o.bottom - 4
  };

  const isCollision =
    playerHitbox.left < obstacleHitbox.right &&
    playerHitbox.right > obstacleHitbox.left &&
    playerHitbox.top < obstacleHitbox.bottom &&
    playerHitbox.bottom > obstacleHitbox.top;

  if (isCollision) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;

  clearInterval(scoreTimer);
  clearInterval(obstacleTimer);
  clearInterval(collisionTimer);
  clearTimeout(firstObstacleTimer);
  clearTimeout(nextObstacleTimeout);

  alert("게임오버!\n점수 : " + score);

  location.reload();
}

document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    jump();
  }
});

document.addEventListener("touchstart", function () {
  jump();
});