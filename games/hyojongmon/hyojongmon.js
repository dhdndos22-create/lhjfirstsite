const mobileInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  select: false
};

class HyojongmonWorld extends Phaser.Scene {
  constructor() {
    super("HyojongmonWorld");
  }

  preload() {}

  create() {
    this.speed = 170;
    this.encounterCooldown = false;

    this.cameras.main.setBackgroundColor("#8ee873");

    this.drawWorld();

    this.grassArea = this.add.rectangle(620, 170, 180, 120, 0x2ecc71);
    this.grassArea.setStrokeStyle(4, 0x1e8449);
    this.grassArea.setDepth(2);

    this.add.text(565, 145, "풀숲", {
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setDepth(3);

    this.walls = this.physics.add.staticGroup();

    this.createWall(400, 20, 800, 40);
    this.createWall(400, 580, 800, 40);
    this.createWall(20, 300, 40, 600);
    this.createWall(780, 300, 40, 600);
    this.createWall(230, 180, 130, 80);
    this.createWall(570, 430, 170, 80);

    this.player = this.add.rectangle(400, 300, 34, 34, 0x3498db);
    this.player.setStrokeStyle(3, 0xffffff);
    this.player.setDepth(10);

    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.walls);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.add.text(20, 20, "효종몬 월드", {
      fontSize: "24px",
      color: "#ffffff",
      fontStyle: "bold",
      backgroundColor: "#00000088",
      padding: { x: 10, y: 6 }
    }).setDepth(100);

    this.add.text(20, 60, "방향키 또는 화면 안 조작패드로 이동", {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: { x: 10, y: 5 }
    }).setDepth(100);

    this.createInGameControls();
  }

  drawWorld() {
    const g = this.add.graphics();
    g.setDepth(0);

    g.fillStyle(0x8ee873, 1);
    g.fillRect(0, 0, 800, 600);

    g.fillStyle(0xd8b56d, 1);
    g.fillRect(0, 240, 800, 120);
    g.fillRect(340, 0, 120, 600);
  }

  createWall(x, y, width, height) {
    const wall = this.add.rectangle(x, y, width, height, 0x6b4f2a);
    wall.setDepth(5);

    this.physics.add.existing(wall, true);
    this.walls.add(wall);
  }

  createInGameControls() {
    const baseX = 115;
    const baseY = 490;

    const alpha = 0.38;
    const dpadColor = 0x111111;

    const parts = [
      this.add.rectangle(baseX, baseY, 46, 46, dpadColor, alpha),
      this.add.rectangle(baseX, baseY - 43, 46, 46, dpadColor, alpha),
      this.add.rectangle(baseX, baseY + 43, 46, 46, dpadColor, alpha),
      this.add.rectangle(baseX - 43, baseY, 46, 46, dpadColor, alpha),
      this.add.rectangle(baseX + 43, baseY, 46, 46, dpadColor, alpha)
    ];

    parts.forEach((part) => {
      part.setStrokeStyle(2, 0xffffff, 0.35);
      part.setDepth(1000);
    });

    this.createDpadButton(baseX, baseY - 43, "▲", "up");
    this.createDpadButton(baseX, baseY + 43, "▼", "down");
    this.createDpadButton(baseX - 43, baseY, "◀", "left");
    this.createDpadButton(baseX + 43, baseY, "▶", "right");

    const aButton = this.add.circle(690, 500, 36, 0x4a90e2, 0.42)
      .setStrokeStyle(3, 0xffffff, 0.65)
      .setDepth(1000)
      .setInteractive();

    this.add.text(690, 500, "A", {
      fontSize: "28px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(1001);

    this.bindButton(aButton, "select");
  }

  createDpadButton(x, y, label, key) {
    const hitArea = this.add.rectangle(x, y, 46, 46, 0xffffff, 0)
      .setDepth(1002)
      .setInteractive();

    this.add.text(x, y, label, {
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(1001);

    this.bindButton(hitArea, key);
  }

  bindButton(button, key) {
    button.on("pointerdown", () => {
      mobileInput[key] = true;
    });

    button.on("pointerup", () => {
      mobileInput[key] = false;
    });

    button.on("pointerout", () => {
      mobileInput[key] = false;
    });

    button.on("pointerupoutside", () => {
      mobileInput[key] = false;
    });
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
  backgroundColor: "#8ee873",
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

new Phaser.Game(config);