const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const loginBox = $("#loginBox");
const settingsBox = $("#settingsBox");
const loginUsername = $("#loginUsername");
const loginPassword = $("#loginPassword");
const currentUserText = $("#currentUserText");
const welcomeName = $("#welcomeName");
const sideMenu = $("#sideMenu");
const menuDim = $("#menuDim");
const toast = $("#toast");
let mainSocket = null;
let toastTimer;

try {
  if (typeof io === "function") mainSocket = io("https://lhjfirstsite.onrender.com");
} catch (error) {
  console.warn("로그인 서버 연결을 시작하지 못했습니다.", error);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function openOverlay(element) {
  element.classList.add("show");
  element.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeOverlay(element) {
  element.classList.remove("show");
  element.setAttribute("aria-hidden", "true");
  if (!sideMenu.classList.contains("show")) document.body.style.overflow = "";
}

function updateUserUI(username = "guest") {
  currentUserText.textContent = username;
  welcomeName.textContent = username;
  $("#logoutBtn").textContent = username === "guest" ? "로그인" : "로그아웃";
}

function initLogin() {
  const savedUser = localStorage.getItem("hyojongUser");
  updateUserUI(savedUser || "guest");
}

function submitLogin() {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if (!username || !password) {
    showToast("유저명과 비밀번호를 입력해주세요.");
    return;
  }
  if (!mainSocket) {
    showToast("로그인 서버에 연결할 수 없습니다.");
    return;
  }
  mainSocket.emit("login", { username, password });
}

if (mainSocket) {
  mainSocket.on("loginSuccess", ({ username }) => {
    localStorage.setItem("hyojongUser", username);
    updateUserUI(username);
    closeOverlay(loginBox);
    showToast(`${username}님, 환영합니다!`);
  });
  mainSocket.on("loginFailed", (message) => showToast(message));
}

function openMenu() {
  sideMenu.classList.add("show");
  sideMenu.setAttribute("aria-hidden", "false");
  menuDim.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  sideMenu.classList.remove("show");
  sideMenu.setAttribute("aria-hidden", "true");
  menuDim.classList.remove("show");
  document.body.style.overflow = "";
}

function loadRecentGame() {
  const recent = JSON.parse(localStorage.getItem("hyojongRecentGame") || "null");
  const section = $("#recentSection");
  if (!recent?.href || !recent?.title) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  $("#recentCard").href = recent.href;
  $("#recentTitle").textContent = recent.title;
  $("#recentIcon").textContent = recent.icon || "🎮";
}

$$('[data-game]').forEach((card) => {
  card.addEventListener("click", () => {
    localStorage.setItem("hyojongRecentGame", JSON.stringify({
      id: card.dataset.game,
      title: card.dataset.title,
      icon: card.dataset.icon,
      href: card.getAttribute("href")
    }));
  });
});

$("#menuBtn").addEventListener("click", openMenu);
$("#menuCloseBtn").addEventListener("click", closeMenu);
menuDim.addEventListener("click", closeMenu);
$("#profileBtn").addEventListener("click", () => openOverlay(loginBox));
$("#loginCloseBtn").addEventListener("click", () => closeOverlay(loginBox));
$("#loginBtn").addEventListener("click", submitLogin);
loginPassword.addEventListener("keydown", (event) => { if (event.key === "Enter") submitLogin(); });
$("#guestBtn").addEventListener("click", () => {
  localStorage.removeItem("hyojongUser");
  updateUserUI("guest");
  closeOverlay(loginBox);
  showToast("guest로 시작합니다.");
});

$$('[data-action="home"]').forEach((button) => button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" })));
$$('[data-action="achievement"]').forEach((button) => button.addEventListener("click", () => showToast("업적 시스템은 준비 중이에요!")));
$$('[data-action="settings"]').forEach((button) => button.addEventListener("click", () => openOverlay(settingsBox)));
$$('[data-close="settings"]').forEach((button) => button.addEventListener("click", () => closeOverlay(settingsBox)));

$$('[data-side-action="profile"]').forEach((button) => button.addEventListener("click", () => { closeMenu(); openOverlay(loginBox); }));
$$('[data-side-action="settings"]').forEach((button) => button.addEventListener("click", () => { closeMenu(); openOverlay(settingsBox); }));
sideMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const motionToggle = $("#motionToggle");
const motionEnabled = localStorage.getItem("hyojongMotion") !== "off";
motionToggle.classList.toggle("active", motionEnabled);
motionToggle.setAttribute("aria-pressed", String(motionEnabled));
document.body.classList.toggle("no-motion", !motionEnabled);
motionToggle.addEventListener("click", () => {
  const enabled = !motionToggle.classList.contains("active");
  motionToggle.classList.toggle("active", enabled);
  motionToggle.setAttribute("aria-pressed", String(enabled));
  document.body.classList.toggle("no-motion", !enabled);
  localStorage.setItem("hyojongMotion", enabled ? "on" : "off");
});

$("#clearRecentBtn").addEventListener("click", () => {
  localStorage.removeItem("hyojongRecentGame");
  loadRecentGame();
  showToast("최근 플레이 기록을 지웠습니다.");
});

$("#logoutBtn").addEventListener("click", () => {
  const savedUser = localStorage.getItem("hyojongUser");
  if (!savedUser) {
    closeOverlay(settingsBox);
    openOverlay(loginBox);
    return;
  }
  localStorage.removeItem("hyojongUser");
  updateUserUI("guest");
  closeOverlay(settingsBox);
  showToast("로그아웃되었습니다.");
});

[loginBox, settingsBox].forEach((overlay) => {
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeOverlay(overlay);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeMenu();
  closeOverlay(loginBox);
  closeOverlay(settingsBox);
});

initLogin();
loadRecentGame();
