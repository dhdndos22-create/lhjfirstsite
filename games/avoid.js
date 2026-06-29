const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const game = document.getElementById("game");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");

let score = 0;
let scoreInterval;
let collisionInterval;
let obstacleStartTimeout;
let isStarted = false;
let obstacleActive = false;

let obstacleSpeed = 1.7;
let jumpSpeed = 0.55;

startBtn.onclick = function () {
  if (isStarted) return;

  isStarted = true;
  obstacleActive = false;
  score = 0;

  obstacleSpeed = 1.7;
  jumpSpeed = 0.55;

  startScreen.style.display = "none";
  game.style.display = "block";
  scoreText.innerHTML = "점수 : 0";

  game.style.setProperty("--obstacle-speed", obstacleSpeed + "s");
  game.style.setProperty("--jump-speed", jumpSpeed + "s");

  obstacle.classList.remove("obstacleMove");
  obstacle.style.right = "-80px";

  scoreInterval = setInterval(function () {
    score++;
    scoreText.innerHTML = "점수 : " + score;
    increaseDifficulty();
  }, 100);

  obstacleStartTimeout = setTimeout(function () {
    obstacleActive = true;
    obstacle.classList.add("obstacleMove");
  }, 3000);

  collisionInterval = setInterval(function () {
    if (!obstacleActive) return;

    const p = player.getBoundingClientRect();
    const o = obstacle.getBoundingClientRect();

    if (
      p.left < o.right &&
      p.right > o.left &&
      p.bottom > o.top &&
      p.top < o.bottom
    ) {
      gameOver();
    }
  }, 10);
};

function increaseDifficulty() {
  if (score % 50 === 0 && score > 0) {
    obstacleSpeed = Math.max(0.75, obstacleSpeed - 0.08);
    jumpSpeed = Math.max(0.35, jumpSpeed - 0.02);

    game.style.setProperty("--obstacle-speed", obstacleSpeed + "s");
    game.style.setProperty("--jump-speed", jumpSpeed + "s");

    if (obstacleActive) {
      obstacle.classList.remove("obstacleMove");
      void obstacle.offsetWidth;
      obstacle.classList.add("obstacleMove");
    }
  }
}

function jump() {
  if (!isStarted) return;

  if (!player.classList.contains("jump")) {
    player.classList.add("jump");

    setTimeout(function () {
      player.classList.remove("jump");
    }, jumpSpeed * 1000);
  }
}

function gameOver() {
  clearInterval(scoreInterval);
  clearInterval(collisionInterval);
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