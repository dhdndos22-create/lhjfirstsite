const elements = {
  overlay: document.getElementById("unlockOverlay"),
  icon: document.getElementById("unlockIcon"),
  title: document.getElementById("unlockTitle"),
  message: document.getElementById("unlockMessage"),
  closeBtn: document.getElementById("unlockCloseBtn")
};

let activeResolve = null;

function closeUnlock() {
  elements.overlay.classList.add("hidden");
  if (activeResolve) {
    const resolve = activeResolve;
    activeResolve = null;
    resolve();
  }
}

elements.closeBtn.addEventListener("click", closeUnlock);
elements.overlay.addEventListener("click", event => {
  if (event.target === elements.overlay) closeUnlock();
});

export function showUnlockNotification({ icon = "🎉", title = "새 콘텐츠", message = "새로운 콘텐츠가 열렸습니다." } = {}) {
  if (activeResolve) return Promise.resolve();

  elements.icon.textContent = icon;
  elements.title.textContent = `${title} 해금!`;
  elements.message.textContent = message;
  elements.overlay.classList.remove("hidden");

  return new Promise(resolve => {
    activeResolve = resolve;
  });
}
