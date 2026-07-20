# 피싱월드 캐릭터 장비 이미지 제작 규칙

## 핵심 구조

장비 레이어는 화면에 직접 겹쳐 출력하지 않습니다.

1. 기본 몸, 머리, 상의, 하의, 신발, 낚싯대 레이어를 불러옵니다.
2. 숨겨진 Canvas에서 하나의 완성 캐릭터 PNG로 합성합니다.
3. 완성된 캐릭터 개체 하나만 로비, 프로필, 낚시 화면 등에 출력합니다.

## 정규 장비 PNG 규격

앞으로 제작하는 모든 신규 장비는 반드시 아래 규칙을 지켜야 합니다.

- 파일 형식: 투명 PNG
- 이미지 크기: 1024 × 1536
- 방향: 정면
- 캐릭터 중심선: X = 512
- 발바닥 기준선: Y = 1450
- 이미지를 장비 크기만큼 잘라 저장하지 않습니다.
- 모든 파일은 1024 × 1536 전체 캔버스를 유지합니다.
- 장비가 없는 부분은 전부 투명하게 둡니다.
- 기본 캐릭터의 위치, 크기, 자세를 절대 움직이지 않습니다.
- 장비를 그릴 때 기본 몸 이미지를 참고 레이어로 사용하되 최종 PNG에는 장비만 남깁니다.

## 레이어 순서

1. base
2. bottom
3. shoes
4. top
5. rod
6. frontHand
7. head

## 파일명 규칙

- 머리: head-이름-번호.png
- 상의: top-이름-번호.png
- 하의: bottom-이름-번호.png
- 신발: shoes-이름-번호.png
- 낚싯대: rod-이름-번호.png

예시:

- head-strawhat-002.png
- top-raincoat-002.png
- bottom-jeans-002.png
- shoes-boots-002.png
- rod-carbon-002.png

## 신규 정규 장비 등록 예시

```javascript
"head-strawhat-002": {
  id: "head-strawhat-002",
  name: "밀짚모자",
  src: "./images/player/head/head-strawhat-002.png",
  fullCanvas: true
}
```

`fullCanvas: true`인 장비는 별도 좌표 없이 Canvas의 0, 0 위치에 1024×1536 크기로 합성됩니다.

현재 첫 세트는 참고 시트에서 분리한 초기 이미지라 임시 placement가 들어 있습니다.
앞으로 만드는 장비부터 정규 규격을 지키면 placement를 사용할 필요가 없습니다.
