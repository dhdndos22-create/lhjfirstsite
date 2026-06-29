const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const game = document.getElementById("game");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");

let score = 0;
let scoreInterval;
let collisionInterval;
let obstacleInterval;
let obstacleStartTimeout;

let isStarted = false;
let obstacleActive = false;

let obstacleSpeed = 1700;
let jumpSpeed = 550;
let obstacleX = -80;

startBtn.onclick = function () {
  if (isStarted) return;

  isStarted = true;
  obstacleActive = false;
  score = 0;
  obstacleSpeed = 1700;
  jumpSpeed = 550;
  obstacleX = -80;

  startScreen.style.display = "none";
  game.style.display = "block";
  scoreText.innerHTML = "점수 : 0";

  obstacle.style.right = obstacleX + "px";

  scoreInterval = setInterval(function () {
    score++;
    scoreText.innerHTML = "점수 : " + score;
  }, 100);

  obstacleStartTimeout = setTimeout(function () {
    obstacleActive = true;
    obstacleX = -80;
    moveObstacle();
  }, 3000);

const p = player.getBoundingClientRect();
const o = obstacle.getBoundingClientRect();

// 플레이어 충돌 영역을 살짝 줄임
const playerHitbox = {
    left: p.left + 12,
    right: p.right - 12,
    top: p.top + 10,
    bottom: p.bottom - 8
};

// 장애물도 살짝 줄임
const obstacleHitbox = {
    left: o.left + 3,
    right: o.right - 3,
    top: o.top + 3,
    bottom: o.bottom - 3
};

if (
    playerHitbox.left < obstacleHitbox.right &&
    playerHitbox.right > obstacleHitbox.left &&
    playerHitbox.bottom > obstacleHitbox.top &&
    playerHitbox.top < obstacleHitbox.bottom
){
    gameOver();
}

function moveObstacle() {
  clearInterval(obstacleInterval);

  obstacleInterval = setInterval(function () {
    obstacleX += 8;

    obstacle.style.right = obstacleX + "px";

    if (obstacleX > 950) {
      obstacleX = -80;

      obstacleSpeed = Math.max(700, obstacleSpeed - 40);
      jumpSpeed = Math.max(350, jumpSpeed - 8);

      clearInterval(obstacleInterval);
      moveObstacle();
    }
  }, obstacleSpeed / 100);
}

function jump() {
  if (!isStarted) return;

  if (!player.classList.contains("jump")) {
    player.classList.add("jump");

    setTimeout(function () {
      player.classList.remove("jump");
    }, jumpSpeed);
  }
}

function gameOver() {
  clearInterval(scoreInterval);
  clearInterval(collisionInterval);
  clearInterval(obstacleInterval);
  clearTimeout(obstacleStartTimeout);

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