# 피싱월드 시작 화면

현재 포함된 기능

- 버튼이 제거된 피싱월드 시작 배경 이미지
- 투명 배경 게임 시작 버튼 이미지
- 두 이미지를 서로 다른 레이어로 배치
- 게임 시작 버튼 영역만 클릭 가능
- 버튼 누름 애니메이션
- 작은 거품이 꼬로록 올라오는 클릭 효과
- PC와 모바일 화면 대응
- 로비 및 실제 게임 화면은 아직 없음

## 실행 방법

`index.html`을 브라우저에서 열거나 VS Code의 Live Server로 실행하세요.

## 파일 구조

fishing-world-start/
├─ index.html
├─ css/
│  └─ fishing-world.css
├─ js/
│  └─ fishing-world.js
└─ images/
   ├─ start-background.png
   └─ start-button.png

## 버튼 위치 조절

`css/fishing-world.css`의 `.start-button`에서 아래 값을 조절하면 됩니다.

- `top`: 버튼의 세로 위치
- `width`: 버튼 크기
