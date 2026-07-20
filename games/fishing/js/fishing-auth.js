const USER_STORAGE_KEY = "hyojongUser";
const HYOJONG_WORLD_HOME = "../../index.html";

/**
 * 효종월드 메인 페이지가 저장한 로그인 유저명을 가져온다.
 * 현재 효종월드 로그인은 localStorage의 hyojongUser 값을 사용한다.
 */
export function getLoggedInUsername() {
  const value = localStorage.getItem(USER_STORAGE_KEY);

  if (typeof value !== "string") {
    return null;
  }

  const username = value.trim();
  return username.length > 0 ? username : null;
}

export function isLoggedIn() {
  return getLoggedInUsername() !== null;
}

/**
 * 로그인하지 않은 사용자는 효종월드 메인 로그인 화면으로 돌려보낸다.
 */
export function requireHyojongLogin() {
  const username = getLoggedInUsername();

  if (username) {
    return username;
  }

  alert("피싱월드는 효종월드 로그인이 필요합니다.");
  window.location.href = HYOJONG_WORLD_HOME;
  return null;
}

/**
 * 다른 탭에서 로그아웃했을 때 피싱월드도 즉시 로그인 상태를 잃게 한다.
 */
export function watchHyojongLogin(onLogout) {
  window.addEventListener("storage", (event) => {
    if (event.key !== USER_STORAGE_KEY) {
      return;
    }

    if (!getLoggedInUsername()) {
      onLogout?.();
    }
  });
}
