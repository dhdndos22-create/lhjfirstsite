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

    if (this.sys.game.device.input.touch) {
       this.createInGameControls();
    }
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
    const baseX = 135;
    const baseY = 475;

    const buttonSize = 70;
    const buttonGap = 65;
    const alpha = 0.38;
    const dpadColor = 0x111111;

    this.dpadParts = [
      this.add.rectangle(baseX, baseY, buttonSize, buttonSize, dpadColor, alpha),
      this.add.rectangle(baseX, baseY - buttonGap, buttonSize, buttonSize, dpadColor, alpha),
      this.add.rectangle(baseX, baseY + buttonGap, buttonSize, buttonSize, dpadColor, alpha),
      this.add.rectangle(baseX - buttonGap, baseY, buttonSize, buttonSize, dpadColor, alpha),
      this.add.rectangle(baseX + buttonGap, baseY, buttonSize, buttonSize, dpadColor, alpha)
    ];

    this.dpadParts.forEach((part) => {
      part.setStrokeStyle(2, 0xffffff, 0.35);
      part.setDepth(1000);
    });

    this.createDpadButton(baseX, baseY - buttonGap, "▲", "up", buttonSize);
    this.createDpadButton(baseX, baseY + buttonGap, "▼", "down", buttonSize);
    this.createDpadButton(baseX - buttonGap, baseY, "◀", "left", buttonSize);
    this.createDpadButton(baseX + buttonGap, baseY, "▶", "right", buttonSize);

    const aButton = this.add.circle(680, 490, 54, 0x4a90e2, 0.42)
      .setStrokeStyle(4, 0xffffff, 0.65)
      .setDepth(1000)
      .setInteractive();

    const aText = this.add.text(680, 490, "A", {
      fontSize: "40px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(1001);

    this.bindButton(aButton, "select", aButton, aText);
  }

  createDpadButton(x, y, label, key, size) {
    const visualButton = this.add.rectangle(x, y, size, size, 0x111111, 0)
      .setDepth(1000);

    const hitArea = this.add.rectangle(x, y, size, size, 0xffffff, 0)
      .setDepth(1002)
      .setInteractive();

    const buttonText = this.add.text(x, y, label, {
      fontSize: "30px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(1001);

    this.bindButton(hitArea, key, visualButton, buttonText);
  }

  bindButton(hitArea, key, visualObject, textObject) {
    const pressButton = () => {
      mobileInput[key] = true;

      this.tweens.killTweensOf([visualObject, textObject]);

      this.tweens.add({
        targets: [visualObject, textObject],
        scaleX: 0.94,
        scaleY: 0.94,
        alpha: 0.85,
        duration: 60,
        ease: "Power1"
      });
    };

    const releaseButton = () => {
      mobileInput[key] = false;

      this.tweens.killTweensOf([visualObject, textObject]);

      this.tweens.add({
        targets: [visualObject, textObject],
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 80,
        ease: "Back.easeOut"
      });
    };

    hitArea.on("pointerdown", pressButton);
    hitArea.on("pointerup", releaseButton);
    hitArea.on("pointerout", releaseButton);
    hitArea.on("pointerupoutside", releaseButton);
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