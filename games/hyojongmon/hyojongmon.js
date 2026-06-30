const mobileInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  select: false
};

function bindMobileButton(id, key) {
  const button = document.getElementById(id);

  if (!button) return;

  button.addEventListener("touchstart", (e) => {
    e.preventDefault();
    mobileInput[key] = true;
  });

  button.addEventListener("touchend", (e) => {
    e.preventDefault();
    mobileInput[key] = false;
  });

  button.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    mobileInput[key] = false;
  });

  button.addEventListener("mousedown", () => {
    mobileInput[key] = true;
  });

  button.addEventListener("mouseup", () => {
    mobileInput[key] = false;
  });

  button.addEventListener("mouseleave", () => {
    mobileInput[key] = false;
  });
}

bindMobileButton("btnUp", "up");
bindMobileButton("btnDown", "down");
bindMobileButton("btnLeft", "left");
bindMobileButton("btnRight", "right");
bindMobileButton("btnSelect", "select");

class HyojongmonWorld extends Phaser.Scene {
  constructor() {
    super("HyojongmonWorld");
  }

  preload() {}

  create() {
    this.speed = 170;

    // 배경
    this.add.rectangle(400, 300, 800, 600, 0x8ee873);

    // 길
    this.add.rectangle(400, 300, 800, 120, 0xd8b56d);
    this.add.rectangle(400, 300, 120, 600, 0xd8b56d);

    // 풀숲
    this.grassArea = this.add.rectangle(620, 170, 180, 120, 0x2ecc71);
    this.grassArea.setStrokeStyle(4, 0x1e8449);

    this.add.text(565, 145, "풀숲", {
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold"
    });

    // 벽 그룹
    this.walls = this.physics.add.staticGroup();

    this.createWall(400, 20, 800, 40);
    this.createWall(400, 580, 800, 40);
    this.createWall(20, 300, 40, 600);
    this.createWall(780, 300, 40, 600);

    // 장애물
    this.createWall(230, 180, 130, 80);
    this.createWall(570, 430, 170, 80);

    // 플레이어
    this.player = this.physics.add.rectangle(400, 300, 34, 34, 0x3498db);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.walls);

    // 키보드 방향키
    this.cursors = this.input.keyboard.createCursorKeys();

    this.infoText = this.add.text(20, 20, "효종몬 월드", {
      fontSize: "24px",
      color: "#ffffff",
      fontStyle: "bold",
      backgroundColor: "#00000088",
      padding: {
        x: 10,
        y: 6
      }
    });

    this.noticeText = this.add.text(20, 60, "방향키 또는 화면 버튼으로 이동", {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: {
        x: 10,
        y: 5
      }
    });

    this.encounterCooldown = false;
  }

  createWall(x, y, width, height) {
    const wall = this.add.rectangle(x, y, width, height, 0x6b4f2a);
    this.physics.add.existing(wall, true);
    this.walls.add(wall);
  }

  update() {
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || mobileInput.left) {
      velocityX = -this.speed;
    } else if (this.cursors.right.isDown || mobileInput.right) {
      velocityX = this.speed;
    }

    if (this.cursors.up.isDown || mobileInput.up) {
      velocityY = -this.speed;
    } else if (this.cursors.down.isDown || mobileInput.down) {
      velocityY = this.speed;
    }

    this.player.body.setVelocity(velocityX, velocityY);

    if (velocityX !== 0 && velocityY !== 0) {
      this.player.body.velocity.normalize().scale(this.speed);
    }

    this.checkGrassEncounter();

    if (mobileInput.select) {
      console.log("선택 버튼 눌림");
    }
  }

  checkGrassEncounter() {
    const playerBounds = this.player.getBounds();
    const grassBounds = this.grassArea.getBounds();

    const isInGrass = Phaser.Geom.Intersects.RectangleToRectangle(
      playerBounds,
      grassBounds
    );

    if (isInGrass && !this.encounterCooldown) {
      this.encounterCooldown = true;

      const randomChance = Phaser.Math.Between(1, 100);

      if (randomChance <= 3) {
        alert("야생 효종몬이 나타났다!");
      }

      this.time.delayedCall(800, () => {
        this.encounterCooldown = false;
      });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "gameContainer",
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [HyojongmonWorld]
};

const game = new Phaser.Game(config);