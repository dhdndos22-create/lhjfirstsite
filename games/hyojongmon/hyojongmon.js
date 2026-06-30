const TILE = 40;
const MAP_WIDTH = 16;
const MAP_HEIGHT = 10;

let player;
let cursors;
let mapLayer = [];
let battleText;
let inBattle = false;
let encounterCooldown = 0;

const monsters = [
  { name: "풀토리", emoji: "🌱", hp: 25 },
  { name: "불몽", emoji: "🔥", hp: 28 },
  { name: "물치", emoji: "💧", hp: 26 }
];

const mapData = [
  "WWWWWWWWWWWWWWWW",
  "W..............W",
  "W..GGG.........W",
  "W..GGG....WWW..W",
  "W...........W..W",
  "W......GGG..W..W",
  "W......GGG.....W",
  "W..............W",
  "W..............W",
  "WWWWWWWWWWWWWWWW"
];

class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
  }

  preload() {}

  create() {
    inBattle = false;
    encounterCooldown = 0;

    this.cameras.main.setBackgroundColor("#7fdcff");

    drawMap(this);

    player = this.add.rectangle(TILE * 2 + 20, TILE * 7 + 20, 28, 28, 0xffcc00);
    player.setStrokeStyle(3, 0x111111);

    this.add.text(player.x - 12, player.y - 14, "😀", {
      fontSize: "24px"
    }).setName("playerFace");

    cursors = this.input.keyboard.createCursorKeys();

    battleText = this.add.text(20, 20, "", {
      fontSize: "20px",
      color: "#111",
      backgroundColor: "#ffffff",
      padding: { x: 10, y: 6 }
    });
    battleText.setVisible(false);
  }

  update() {
    if (inBattle) return;

    movePlayer(this);

    if (encounterCooldown > 0) {
      encounterCooldown--;
    }

    checkGrassEncounter(this);
  }
}

class BattleScene extends Phaser.Scene {
  constructor() {
    super("BattleScene");
  }

  init(data) {
    this.monster = data.monster;
  }

  create() {
    this.cameras.main.setBackgroundColor("#f8fafc");

    this.add.rectangle(320, 200, 560, 300, 0xffffff)
      .setStrokeStyle(4, 0x111111);

    this.add.text(70, 70, "야생 몬스터가 나타났다!", {
      fontSize: "26px",
      color: "#111"
    });

    this.add.text(260, 130, this.monster.emoji, {
      fontSize: "80px"
    });

    this.add.text(245, 225, `${this.monster.name}  HP ${this.monster.hp}`, {
      fontSize: "24px",
      color: "#111"
    });

    const fightBtn = createButton(this, 150, 320, "공격");
    const catchBtn = createButton(this, 320, 320, "포획");
    const runBtn = createButton(this, 490, 320, "도망");

    fightBtn.on("pointerdown", () => {
      this.add.text(190, 370, `${this.monster.name}에게 공격했다!`, {
        fontSize: "20px",
        color: "#111"
      });
    });

    catchBtn.on("pointerdown", () => {
      const success = Math.random() < 0.5;

      if (success) {
        this.add.text(190, 370, `${this.monster.name} 포획 성공!`, {
          fontSize: "20px",
          color: "#111"
        });

        this.time.delayedCall(1200, () => {
          this.scene.start("WorldScene");
        });
      } else {
        this.add.text(190, 370, "포획 실패!", {
          fontSize: "20px",
          color: "#111"
        });
      }
    });

    runBtn.on("pointerdown", () => {
      this.scene.start("WorldScene");
    });
  }
}

function drawMap(scene) {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    mapLayer[y] = [];

    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = mapData[y][x];

      let color = 0x7bd957;

      if (tile === "W") color = 0x4b7f3f;
      if (tile === "G") color = 0x2faa45;

      const rect = scene.add.rectangle(
        x * TILE + TILE / 2,
        y * TILE + TILE / 2,
        TILE,
        TILE,
        color
      );

      rect.setStrokeStyle(1, 0x5ba55b);

      if (tile === "W") {
        scene.add.text(x * TILE + 8, y * TILE + 7, "🌳", {
          fontSize: "24px"
        });
      }

      if (tile === "G") {
        scene.add.text(x * TILE + 8, y * TILE + 7, "🌿", {
          fontSize: "24px"
        });
      }

      mapLayer[y][x] = tile;
    }
  }
}

function movePlayer(scene) {
  const speed = 3;
  let dx = 0;
  let dy = 0;

  if (cursors.left.isDown) dx = -speed;
  if (cursors.right.isDown) dx = speed;
  if (cursors.up.isDown) dy = -speed;
  if (cursors.down.isDown) dy = speed;

  if (dx === 0 && dy === 0) return;

  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (!isWall(nextX, nextY)) {
    player.x = nextX;
    player.y = nextY;

    const face = scene.children.getByName("playerFace");
    face.x = player.x - 12;
    face.y = player.y - 14;
  }
}

function isWall(x, y) {
  const tileX = Math.floor(x / TILE);
  const tileY = Math.floor(y / TILE);

  if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
    return true;
  }

  return mapLayer[tileY][tileX] === "W";
}

function checkGrassEncounter(scene) {
  const tileX = Math.floor(player.x / TILE);
  const tileY = Math.floor(player.y / TILE);

  if (mapLayer[tileY][tileX] !== "G") return;
  if (encounterCooldown > 0) return;

  encounterCooldown = 35;

  if (Math.random() < 0.035) {
    inBattle = true;

    const monster = Phaser.Utils.Array.GetRandom(monsters);

    battleText.setText(`야생 ${monster.name} 등장!`);
    battleText.setVisible(true);

    scene.time.delayedCall(700, () => {
      scene.scene.start("BattleScene", { monster });
    });
  }
}

function createButton(scene, x, y, text) {
  const box = scene.add.rectangle(x, y, 120, 48, 0x4a90e2)
    .setStrokeStyle(3, 0x111111)
    .setInteractive({ useHandCursor: true });

  scene.add.text(x - 26, y - 13, text, {
    fontSize: "22px",
    color: "#ffffff"
  });

  return box;
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 400,
  parent: "gameContainer",
  backgroundColor: "#7fdcff",
  scene: [WorldScene, BattleScene]
};

new Phaser.Game(config);