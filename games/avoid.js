const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const game = document.getElementById("game");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");

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
    obstacleX = -100;

    if (score < 500) {
        obstacleSpeed = Math.min(obstacleSpeed + 0.18, 10.5);
        jumpTime = Math.max(jumpTime - 5, 430);
    }

    player.style.setProperty("--jump-time", jumpTime + "ms");
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