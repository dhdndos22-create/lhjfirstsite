const mainMenu = document.getElementById("mainMenu");
const gameMenu = document.getElementById("gameMenu");

const mainSocket = io("https://lhjfirstsite.onrender.com");

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

/* 로그인 시스템 */

const loginBox = document.getElementById("loginBox");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const guestBtn = document.getElementById("guestBtn");
const currentUserText = document.getElementById("currentUserText");
const logoutBtn = document.getElementById("logoutBtn");

function setGuestUI() {
  currentUserText.textContent = "guest";
  logoutBtn.textContent = "로그인";
}

function setLoginUI(username) {
  currentUserText.textContent = username;
  logoutBtn.textContent = "로그아웃";
}

function initLogin() {
  const savedUser = localStorage.getItem("hyojongUser");

  if (savedUser) {
    setLoginUI(savedUser);
    loginBox.classList.remove("show");
  } else {
    setGuestUI();
    loginBox.classList.add("show");
  }
}

loginBtn.addEventListener("click", () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  if (username === "" || password === "") {
    alert("유저명과 비밀번호를 입력해주세요.");
    return;
  }

  mainSocket.emit("login", {
    username,
    password
  });
});

mainSocket.on("loginSuccess", ({ username }) => {
  localStorage.setItem("hyojongUser", username);
  setLoginUI(username);
  loginBox.classList.remove("show");
});

mainSocket.on("loginFailed", (message) => {
  alert(message);
});

guestBtn.addEventListener("click", () => {
  localStorage.removeItem("hyojongUser");
  setGuestUI();
  loginBox.classList.remove("show");
});

logoutBtn.addEventListener("click", () => {
  const savedUser = localStorage.getItem("hyojongUser");

  if (savedUser) {
    localStorage.removeItem("hyojongUser");
    setGuestUI();
  }

  loginUsername.value = "";
  loginPassword.value = "";
  loginBox.classList.add("show");
});

initLogin();