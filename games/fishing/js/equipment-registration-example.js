/*
  신규 장비 추가 예제

  1. PNG를 정확히 1024×1536 투명 캔버스로 제작
  2. CHARACTER_CATALOG의 해당 슬롯에 아래처럼 등록
  3. 좌표, width, height, scale 값은 넣지 않음
*/

"head-strawhat-002": {
  id: "head-strawhat-002",
  name: "밀짚모자",
  src: "./images/player/head/head-strawhat-002.png"
}

/*
  중요:
  현재 기본 캐릭터 PNG에는 기존 모자와 옷이 포함되어 있다.
  진짜 '교체형' 장비 시스템으로 전환하려면
  장비가 제거된 clean base 이미지가 먼저 필요하다.

  clean base 준비 후 CHARACTER_CATALOG.base의 src만
  clean base 경로로 바꾸면 나머지 합성 코드는 그대로 사용할 수 있다.
*/
