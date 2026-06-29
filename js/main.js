const mainMenu = document.getElementById("mainMenu");
const gameMenu = document.getElementById("gameMenu");

function toggleMenu() {
  if (mainMenu.classList.contains("show") || gameMenu.classList.contains("show")) {
    mainMenu.classList.remove("show");
    gameMenu.classList.remove("show");
  } else {
    mainMenu.classList.add("show");
  }
}

function openGameMenu() {
  mainMenu.classList.remove("show");
  gameMenu.classList.add("show");
}

function backToMainMenu() {
  gameMenu.classList.remove("show");
  mainMenu.classList.add("show");
}