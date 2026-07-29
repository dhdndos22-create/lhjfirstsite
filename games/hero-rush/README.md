# 히어로러시 시작 버튼 최종 수정

기존 `lhjfirstsite/games/hero-rush/` 폴더를 이 폴더로 통째로 교체하세요.

## 실제 원인

JavaScript에서는 `startBackgroundImage`라는 id를 찾고 있었지만,
HTML의 시작 배경 이미지에는 해당 id가 없었습니다.

그래서 이미지 크기에 맞춰 투명 버튼 위치를 계산하는 함수가 실행되지 않았고,
버튼의 크기와 위치가 없는 상태였습니다.

## 수정 내용

- 시작 이미지에 `id="startBackgroundImage"` 추가
- 배경 이미지 속 게임 시작 버튼 위치를 실제 이미지 좌표로 계산
- click, pointerup, touchend를 모두 지원
- iPhone에서 투명 버튼 이벤트가 무시될 경우를 위한 보조 터치 처리 추가
- 별도의 시각 버튼은 표시하지 않음
- 배경 이미지에 그려진 파란색 게임 시작 버튼을 누르면 로비로 이동
