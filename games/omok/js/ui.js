// ---------- 화면 ----------

const startScreen = document.getElementById("startScreen");
const modeScreen = document.getElementById("modeScreen");
const roomListScreen = document.getElementById("roomListScreen");
const createRoomScreen = document.getElementById("createRoomScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");

function showScreen(screen){

    [
        startScreen,
        modeScreen,
        roomListScreen,
        createRoomScreen,
        lobbyScreen,
        gameScreen
    ].forEach(s=>s.classList.remove("active"));

    screen.classList.add("active");

}

// ---------- 닉네임 ----------

let nickname =
localStorage.getItem("omokNickname") || "게스트";

const nicknameText =
document.getElementById("nicknameText");

const nicknameInput =
document.getElementById("nicknameInput");

nicknameText.textContent = nickname;
nicknameInput.value = nickname;

function saveNickname(){

    const value =
    nicknameInput.value.trim();

    if(value===""){

        alert("닉네임을 입력하세요.");
        return;

    }

    nickname=value;

    localStorage.setItem(
        "omokNickname",
        nickname
    );

    nicknameText.textContent=nickname;

    closeUserMenu();

}

const userMenuBtn =
document.getElementById("userMenuBtn");

const userMenuBox =
document.getElementById("userMenuBox");

userMenuBtn.onclick=(e)=>{

    e.stopPropagation();

    userMenuBox.classList.toggle("show");

};

function closeUserMenu(){

    userMenuBox.classList.remove("show");

}

document.addEventListener("click",(e)=>{

    if(!e.target.closest(".user-menu-wrap")){

        closeUserMenu();

    }

});

document
.getElementById("saveNicknameBtn")
.onclick=saveNickname;