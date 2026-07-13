/* =========================
   효종월드 공용 확인창
========================= */

const confirmElements = {
  overlay:
    document.getElementById(
      "confirmOverlay"
    ),

  icon:
    document.getElementById(
      "confirmIcon"
    ),

  title:
    document.getElementById(
      "confirmTitle"
    ),

  message:
    document.getElementById(
      "confirmMessage"
    ),

  detail:
    document.getElementById(
      "confirmDetail"
    ),

  cancelBtn:
    document.getElementById(
      "confirmCancelBtn"
    ),

  acceptBtn:
    document.getElementById(
      "confirmAcceptBtn"
    )
};

let activeResolve = null;

function closeConfirm(result) {
  confirmElements.overlay.classList.add(
    "hidden"
  );

  if (activeResolve) {
    activeResolve(result);
    activeResolve = null;
  }
}

confirmElements.cancelBtn.addEventListener(
  "click",
  function () {
    closeConfirm(false);
  }
);

confirmElements.acceptBtn.addEventListener(
  "click",
  function () {
    closeConfirm(true);
  }
);

/*
  팝업 바깥쪽을 누르면 취소
*/
confirmElements.overlay.addEventListener(
  "click",
  function (event) {
    if (
      event.target ===
      confirmElements.overlay
    ) {
      closeConfirm(false);
    }
  }
);

/*
  Escape 키로 취소
*/
document.addEventListener(
  "keydown",
  function (event) {
    if (
      event.key === "Escape" &&
      !confirmElements.overlay.classList
        .contains("hidden")
    ) {
      closeConfirm(false);
    }
  }
);

export function showConfirm({
  icon = "❓",
  title = "확인",
  message = "진행하시겠습니까?",
  detail = "",
  acceptText = "예",
  cancelText = "아니요"
} = {}) {
  /*
    확인창이 이미 열린 상태에서 다시 호출되는 것을 방지
  */
  if (activeResolve) {
    return Promise.resolve(false);
  }

  confirmElements.icon.textContent =
    icon;

  confirmElements.title.textContent =
    title;

  confirmElements.message.textContent =
    message;

  confirmElements.detail.innerHTML =
    detail;

  confirmElements.acceptBtn.textContent =
    acceptText;

  confirmElements.cancelBtn.textContent =
    cancelText;

  confirmElements.overlay.classList.remove(
    "hidden"
  );

  return new Promise(function (resolve) {
    activeResolve = resolve;
  });
}