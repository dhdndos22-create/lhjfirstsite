const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const game = document.getElementById("game");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");
const playerImg = document.getElementById("playerImg");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");



startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

let runFrame = 1;
let runAnimationTimer = null;

let nextObstacleTimeout = null;
let gameRunning = false;
let score = 0;

let obstacleX = -120;
let obstacleSpeed = 6;
let jumpTime = 550;
let obstacleType = "ground";

let scoreTimer = null;
let obstacleTimer = null;
let collisionTimer = null;
let firstObstacleTimer = null;



function startGame() {
  if (gameRunning) return;
  startRunAnimation();
  gameRunning = true;
  score = 0;

  obstacleX = -120;
  obstacleSpeed = 6;
  jumpTime = 550;
  obstacleType = "ground";

  startScreen.style.display = "none";
  game.style.display = "block";

  scoreText.textContent = "점수 : 0";
  obstacle.style.right = obstacleX + "px";
  player.style.setProperty("--jump-time", jumpTime + "ms");

  prepareNextObstacle();

  scoreTimer = setInterval(updateScore, 100);

  firstObstacleTimer = setTimeout(() => {
    startObstacle();
  }, 3000);

  collisionTimer = setInterval(checkCollision, 20);
}

function updateScore() {
  if (!gameRunning) return;

  score++;
  scoreText.textContent = "점수 : " + score;
}

function prepareNextObstacle() {
  obstacleType = Math.random() < 0.5 ? "ground" : "ball";

  obstacle.classList.remove("groundObstacle", "ballObstacle");

  if (obstacleType === "ground") {
    obstacle.classList.add("groundObstacle");
  } else {
    obstacle.classList.add("ballObstacle");
  }

  obstacleX = -120;
  obstacle.style.right = obstacleX + "px";
}

function startObstacle() {
  obstacleTimer = setInterval(moveObstacle, 16);
}

function moveObstacle() {
  if (!gameRunning) return;

  obstacleX += obstacleSpeed;
  obstacle.style.right = obstacleX + "px";

  const gameWidth = game.clientWidth;

  if (obstacleX > gameWidth + 120) {
    clearInterval(obstacleTimer);

    if (score < 1500) {
      obstacleSpeed = Math.min(obstacleSpeed + 0.4, 14);
      jumpTime = Math.max(jumpTime - 10, 360);

      player.style.setProperty("--jump-time", jumpTime + "ms");
    }

    prepareNextObstacle();

    const delay = 600 + Math.random() * 500;

    nextObstacleTimeout = setTimeout(function () {
      startObstacle();
    }, delay);
  }
}

function jump() {
  if (!gameRunning) return;

  if (player.classList.contains("jump")) return;

  playerImg.src = "../../images/player-jump.png";
  player.classList.add("jump");

  setTimeout(() => {
    player.classList.remove("jump");
    playerImg.src = "../../images/player-run1.png";
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
    bottom: p.bottom - 5
  };

  let obstacleHitbox;

  if (obstacleType === "ground") {
    obstacleHitbox = {
      left: o.left + 4,
      right: o.right - 4,
      top: o.top - 8 ,
      bottom: o.bottom - 4
    };
  } else {
    obstacleHitbox = {
      left: o.left + 5,
      right: o.right - 5,
      top: o.top + 5,
      bottom: o.bottom - 5
    };
  }

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
  clearInterval(runAnimationTimer);
  clearTimeout(firstObstacleTimer);
  clearTimeout(nextObstacleTimeout);

  finalScore.textContent = "점수 : " + score;
  gameOverScreen.classList.add("show");
}

document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    jump();
  }
});

document.addEventListener("touchstart", function () {
  jump();
});

function startRunAnimation() {
  clearInterval(runAnimationTimer);

  runAnimationTimer = setInterval(function () {
    if (!gameRunning) return;
    if (player.classList.contains("jump")) return;

    runFrame = runFrame === 1 ? 2 : 1;
    playerImg.src = `../../images/player-run${runFrame}.png`;
  }, 160);
}

function restartGame() {
  gameOverScreen.classList.remove("show");

  score = 0;
  obstacleX = -120;
  obstacleSpeed = 6;
  jumpTime = 550;
  obstacleType = "ground";

  player.classList.remove("jump");
  player.style.setProperty("--jump-time", jumpTime + "ms");

  obstacle.style.right = obstacleX + "px";
  scoreText.textContent = "점수 : 0";

  clearInterval(scoreTimer);
  clearInterval(obstacleTimer);
  clearInterval(collisionTimer);
  clearInterval(runAnimationTimer);
  clearTimeout(firstObstacleTimer);
  clearTimeout(nextObstacleTimeout);

  gameRunning = false;
  startGame();
}