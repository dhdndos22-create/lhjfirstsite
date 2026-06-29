const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");

let score = 0;
let isGameOver = false;

function jump() {
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

let scoreInterval = setInterval(() => {
  if (!isGameOver) {
    score++;
    scoreText.textContent = "점수: " + score;
  }
}, 100);

let checkCollision = setInterval(() => {
  const playerRect = player.getBoundingClientRect();
  const obstacleRect = obstacle.getBoundingClientRect();

  const isCollision =
    playerRect.left < obstacleRect.right &&
    playerRect.right > obstacleRect.left &&
    playerRect.bottom > obstacleRect.top &&
    playerRect.top < obstacleRect.bottom;

  if (isCollision) {
    isGameOver = true;
    alert("게임 오버! 점수: " + score);
    location.reload();
  }
}, 10);