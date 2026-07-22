
import { RARITY_LABELS } from "./data/game-config.js";

const STATE = Object.freeze({
  READY: "ready",
  CASTING: "casting",
  WAITING: "waiting",
  BITE: "bite",
  FIGHT: "fight",
  SUCCESS: "success",
  FAILED: "failed"
});

const RARITY_WEIGHT = Object.freeze({
  normal: 70,
  rare: 23,
  unique: 6,
  legendary: 1
});

const RARITY_DIFFICULTY = Object.freeze({
  normal: { power: 0.82, speed: 0.55, rest: 0.62 },
  rare: { power: 1.02, speed: 0.78, rest: 0.5 },
  unique: { power: 1.32, speed: 1.02, rest: 0.38 },
  legendary: { power: 1.68, speed: 1.28, rest: 0.25 }
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function weightedChoice(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;

  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.value;
  }

  return entries.at(-1)?.value ?? null;
}

export class StageFishingGame {
  constructor({
    root,
    fishList,
    onCatch,
    onStatusChange,
    onEnergyUse
  }) {
    this.root = root;
    this.fishList = fishList;
    this.onCatch = onCatch;
    this.onStatusChange = onStatusChange;
    this.onEnergyUse = onEnergyUse;

    this.canvas = root.querySelector("#fishingCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.castButton = root.querySelector("#castButton");
    this.catchButton = root.querySelector("#catchButton");
    this.reelButton = root.querySelector("#reelButton");
    this.resetButton = root.querySelector("#fishingResetButton");
    this.message = root.querySelector("#fishingMessage");
    this.subMessage = root.querySelector("#fishingSubMessage");
    this.castFill = root.querySelector("#castPowerFill");
    this.castMarker = root.querySelector("#castPowerMarker");
    this.distanceFill = root.querySelector("#fishDistanceFill");
    this.distanceText = root.querySelector("#fishDistanceText");
    this.tensionFill = root.querySelector("#lineTensionFill");
    this.tensionText = root.querySelector("#lineTensionText");
    this.behaviorText = root.querySelector("#fishBehaviorText");
    this.biteAlert = root.querySelector("#biteAlert");
    this.resultPanel = root.querySelector("#fishingResultPanel");
    this.resultImage = root.querySelector("#fishingResultImage");
    this.resultRarity = root.querySelector("#fishingResultRarity");
    this.resultName = root.querySelector("#fishingResultName");
    this.resultSize = root.querySelector("#fishingResultSize");
    this.resultReward = root.querySelector("#fishingResultReward");

    this.state = STATE.READY;
    this.running = false;
    this.frameId = 0;
    this.lastTime = 0;
    this.time = 0;

    this.castPower = 0;
    this.castDirection = 1;
    this.castHolding = false;
    this.reeling = false;
    this.castQuality = 0;
    this.bobber = { x: 0.5, y: 0.48, visible: false, splash: 0 };
    this.ripples = [];
    this.particles = [];

    this.selectedFish = null;
    this.fishSize = 0;
    this.distance = 100;
    this.tension = 24;
    this.behavior = "rest";
    this.behaviorTime = 0;
    this.biteDeadline = 0;
    this.biteTimer = null;
    this.waitTimer = null;
    this.fightElapsed = 0;
    this.fishX = 0.5;
    this.fishDirection = 1;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(root);

    this.bindEvents();
    this.resize();
    this.reset();
    this.startLoop();
  }

  bindEvents() {
    const startCast = (event) => {
      event.preventDefault();
      if (this.state !== STATE.READY) return;
      this.castHolding = true;
      this.castDirection = 1;
      this.castPower = 0;
      this.setMessage("힘을 모으는 중…", "좋은 구간에서 손을 떼세요.");
    };

    const releaseCast = (event) => {
      if (!this.castHolding) return;
      event?.preventDefault();
      this.castHolding = false;
      this.performCast();
    };

    this.castButton.addEventListener("pointerdown", startCast);
    window.addEventListener("pointerup", releaseCast);
    window.addEventListener("pointercancel", releaseCast);

    this.catchButton.addEventListener("click", () => this.tryHook());

    const startReel = (event) => {
      event.preventDefault();
      if (this.state === STATE.FIGHT) this.reeling = true;
    };
    const stopReel = () => {
      this.reeling = false;
    };

    this.reelButton.addEventListener("pointerdown", startReel);
    window.addEventListener("pointerup", stopReel);
    window.addEventListener("pointercancel", stopReel);
    this.resetButton.addEventListener("click", () => this.reset());
  }

  setFishList(fishList) {
    this.fishList = fishList;
  }

  startLoop() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();

    const frame = (now) => {
      if (!this.running) return;
      const dt = Math.min(0.034, Math.max(0, (now - this.lastTime) / 1000));
      this.lastTime = now;
      this.update(dt);
      this.draw();
      this.frameId = requestAnimationFrame(frame);
    };

    this.frameId = requestAnimationFrame(frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.waitTimer);
    clearTimeout(this.biteTimer);
  }

  resize() {
    const rect = this.root.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
  }

  reset() {
    clearTimeout(this.waitTimer);
    clearTimeout(this.biteTimer);
    this.state = STATE.READY;
    this.castHolding = false;
    this.reeling = false;
    this.castPower = 0;
    this.castDirection = 1;
    this.selectedFish = null;
    this.distance = 100;
    this.tension = 24;
    this.behavior = "rest";
    this.behaviorTime = 0;
    this.fightElapsed = 0;
    this.bobber.visible = false;
    this.ripples.length = 0;
    this.particles.length = 0;
    this.fishX = 0.5;
    this.resultPanel.hidden = true;
    this.biteAlert.hidden = true;
    this.castButton.hidden = false;
    this.catchButton.hidden = true;
    this.reelButton.hidden = true;
    this.resetButton.hidden = true;
    this.setMessage("캐스팅 준비 완료", "버튼을 길게 누른 뒤 좋은 구간에서 놓으세요.");
    this.updateMeters();
    this.onStatusChange?.("ready");
  }

  performCast() {
    if (this.state !== STATE.READY) return;

    const canUseEnergy = this.onEnergyUse?.() ?? true;
    if (!canUseEnergy) {
      this.setMessage("에너지가 부족합니다", "로비에서 에너지를 충전한 뒤 다시 시도하세요.");
      return;
    }

    this.state = STATE.CASTING;
    this.castButton.hidden = true;
    this.castQuality = 1 - Math.min(1, Math.abs(this.castPower - 0.73) / 0.73);
    this.castQuality = clamp(this.castQuality, 0.12, 1);

    this.castAnimation = {
      t: 0,
      duration: 0.72,
      startX: 0.47,
      startY: 0.88,
      endX: 0.35 + this.castPower * 0.3,
      endY: 0.36 + (1 - this.castPower) * 0.12
    };

    this.bobber.visible = true;
    this.setMessage("캐스팅!", this.castQuality > 0.82 ? "PERFECT!" : "찌가 날아갑니다.");
  }

  finishCast() {
    this.state = STATE.WAITING;
    this.bobber.splash = 1;
    this.ripples.push({ x: this.bobber.x, y: this.bobber.y, age: 0, life: 1.4 });
    this.spawnSplash(this.bobber.x, this.bobber.y, 16);

    const waitBase = random(1.6, 4.2);
    const waitSeconds = waitBase * (1.18 - this.castQuality * 0.42);
    this.setMessage("입질을 기다리는 중…", "찌의 움직임을 잘 살펴보세요.");

    this.waitTimer = setTimeout(() => this.beginBite(), waitSeconds * 1000);
  }

  chooseFish() {
    const rarityEntries = Object.keys(RARITY_WEIGHT).map((rarity) => ({
      value: rarity,
      weight: RARITY_WEIGHT[rarity] * (rarity === "legendary"
        ? 0.7 + this.castQuality * 0.6
        : 1)
    }));

    const rarity = weightedChoice(rarityEntries);
    const candidates = this.fishList.filter((fish) => fish.rarity === rarity);
    const pool = candidates.length ? candidates : this.fishList;
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
  }

  beginBite() {
    if (this.state !== STATE.WAITING) return;

    this.selectedFish = this.chooseFish();
    if (!this.selectedFish) {
      this.fail("물고기가 없습니다", "스테이지 데이터를 확인해주세요.");
      return;
    }

    this.state = STATE.BITE;
    this.catchButton.hidden = false;
    this.biteAlert.hidden = false;
    this.biteDeadline = performance.now() + 1450;
    this.setMessage("입질이다!", "지금 캐치 버튼을 누르세요!");
    this.bobber.splash = 1;
    this.spawnSplash(this.bobber.x, this.bobber.y, 22);
    this.ripples.push({ x: this.bobber.x, y: this.bobber.y, age: 0, life: 1.2 });

    this.biteTimer = setTimeout(() => {
      if (this.state === STATE.BITE) {
        this.fail("후킹 실패", "캐치 타이밍을 놓쳤습니다.");
      }
    }, 1500);
  }

  tryHook() {
    if (this.state !== STATE.BITE) return;
    clearTimeout(this.biteTimer);

    const remaining = this.biteDeadline - performance.now();
    if (remaining < 0) {
      this.fail("후킹 실패", "조금 늦었습니다.");
      return;
    }

    this.state = STATE.FIGHT;
    this.catchButton.hidden = true;
    this.biteAlert.hidden = true;
    this.reelButton.hidden = false;
    this.distance = 100;
    this.tension = 27;
    this.fightElapsed = 0;
    this.setBehavior("rest");
    this.setMessage("물고기와 힘겨루기!", "힘을 뺄 때 감고, 돌진할 때는 손을 떼세요.");
  }

  setBehavior(type) {
    const rarity = this.selectedFish?.rarity ?? "normal";
    const config = RARITY_DIFFICULTY[rarity];
    this.behavior = type;

    if (type === "rest") {
      this.behaviorTime = random(0.75, 1.45) * (1 + config.rest * 0.3);
      this.behaviorText.textContent = "휴식 · 지금 감으세요!";
    } else if (type === "pull") {
      this.behaviorTime = random(0.7, 1.35);
      this.behaviorText.textContent = "저항 중";
    } else {
      this.behaviorTime = random(0.48, 1.0);
      this.behaviorText.textContent = "돌진! 손을 떼세요!";
      this.spawnSplash(this.bobber.x, this.bobber.y, 12);
    }
  }

  chooseNextBehavior() {
    const rarity = this.selectedFish?.rarity ?? "normal";
    const difficulty = RARITY_DIFFICULTY[rarity];
    const roll = Math.random();

    if (roll < difficulty.rest) this.setBehavior("rest");
    else if (roll < 0.78) this.setBehavior("pull");
    else this.setBehavior("dash");
  }

  update(dt) {
    this.time += dt;

    if (this.castHolding && this.state === STATE.READY) {
      this.castPower += this.castDirection * dt * 0.92;
      if (this.castPower >= 1) {
        this.castPower = 1;
        this.castDirection = -1;
      } else if (this.castPower <= 0) {
        this.castPower = 0;
        this.castDirection = 1;
      }
    }

    if (this.state === STATE.CASTING && this.castAnimation) {
      const animation = this.castAnimation;
      animation.t += dt;
      const p = clamp(animation.t / animation.duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);

      this.bobber.x = animation.startX + (animation.endX - animation.startX) * eased;
      this.bobber.y = animation.startY
        + (animation.endY - animation.startY) * eased
        - Math.sin(Math.PI * p) * 0.24;

      if (p >= 1) {
        this.finishCast();
      }
    }

    if (this.state === STATE.WAITING) {
      this.bobber.y += Math.sin(this.time * 2.1) * dt * 0.0017;
      if (Math.random() < dt * 0.38) {
        this.ripples.push({
          x: this.bobber.x + random(-0.02, 0.02),
          y: this.bobber.y + random(-0.01, 0.01),
          age: 0,
          life: random(0.8, 1.3)
        });
      }
    }

    if (this.state === STATE.BITE) {
      this.bobber.y += Math.sin(this.time * 27) * dt * 0.017;
    }

    if (this.state === STATE.FIGHT) {
      this.updateFight(dt);
    }

    this.ripples.forEach((ripple) => ripple.age += dt);
    this.ripples = this.ripples.filter((ripple) => ripple.age < ripple.life);

    this.particles.forEach((particle) => {
      particle.age += dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += dt * 0.3;
    });
    this.particles = this.particles.filter((particle) => particle.age < particle.life);

    this.updateMeters();
  }

  updateFight(dt) {
    const rarity = this.selectedFish.rarity;
    const config = RARITY_DIFFICULTY[rarity];
    this.fightElapsed += dt;
    this.behaviorTime -= dt;

    if (this.behaviorTime <= 0) this.chooseNextBehavior();

    const reelForce = this.reeling ? 1 : 0;
    let distanceDelta = 0;
    let tensionDelta = 0;

    if (this.behavior === "rest") {
      distanceDelta = reelForce ? -17.5 * dt : 1.5 * dt;
      tensionDelta = reelForce ? 6.5 * dt : -22 * dt;
    } else if (this.behavior === "pull") {
      distanceDelta = reelForce ? -8.2 * dt : 4.6 * dt;
      tensionDelta = reelForce
        ? 18 * config.power * dt
        : -18 * dt;
    } else {
      distanceDelta = reelForce
        ? 3.8 * config.speed * dt
        : 8.5 * config.speed * dt;
      tensionDelta = reelForce
        ? 44 * config.power * dt
        : -30 * dt;
      this.fishX += this.fishDirection * dt * 0.35;
      if (this.fishX < 0.24 || this.fishX > 0.76) this.fishDirection *= -1;
    }

    this.distance = clamp(this.distance + distanceDelta, 0, 100);
    this.tension = clamp(this.tension + tensionDelta, 0, 100);

    const targetX = this.fishX;
    this.bobber.x += (targetX - this.bobber.x) * dt * 1.7;
    this.bobber.y += (0.47 + this.distance / 100 * 0.12 - this.bobber.y) * dt * 2.2;

    if (this.reeling && Math.random() < dt * 5) {
      this.ripples.push({ x: this.bobber.x, y: this.bobber.y, age: 0, life: 0.65 });
    }

    if (this.tension >= 100) {
      this.fail("낚싯줄이 끊어졌습니다", "돌진할 때는 릴에서 손을 떼세요.");
      return;
    }

    if (this.distance >= 100 && this.fightElapsed > 2.5) {
      this.fail("물고기가 도망갔습니다", "너무 오래 릴을 놓고 있었습니다.");
      return;
    }

    if (this.distance <= 0) {
      this.succeed();
    }
  }

  succeed() {
    this.state = STATE.SUCCESS;
    this.reeling = false;
    this.reelButton.hidden = true;
    this.resetButton.hidden = false;

    const min = this.selectedFish.minSize;
    const max = this.selectedFish.maxSize;
    this.fishSize = Math.round(random(min, max) * 10) / 10;
    const sizeRate = (this.fishSize - min) / Math.max(1, max - min);
    const reward = Math.round(this.selectedFish.baseGold * (0.85 + sizeRate * 0.45));

    this.resultPanel.hidden = false;
    this.resultPanel.dataset.rarity = this.selectedFish.rarity;
    this.resultImage.src = this.selectedFish.image;
    this.resultImage.alt = this.selectedFish.name;
    this.resultRarity.textContent = RARITY_LABELS[this.selectedFish.rarity];
    this.resultName.textContent = this.selectedFish.name;
    this.resultSize.textContent = `${this.fishSize.toFixed(1)} cm`;
    this.resultReward.textContent = `판매가 ${reward.toLocaleString("ko-KR")} G`;

    this.setMessage("낚시 성공!", "물고기가 인벤토리와 도감에 추가되었습니다.");
    this.spawnSplash(this.bobber.x, 0.75, 32);

    this.onCatch?.({
      fish: this.selectedFish,
      size: this.fishSize,
      reward
    });
    this.onStatusChange?.("success");
  }

  fail(title, detail) {
    clearTimeout(this.waitTimer);
    clearTimeout(this.biteTimer);
    this.state = STATE.FAILED;
    this.castHolding = false;
    this.reeling = false;
    this.castButton.hidden = true;
    this.catchButton.hidden = true;
    this.reelButton.hidden = true;
    this.resetButton.hidden = false;
    this.biteAlert.hidden = true;
    this.setMessage(title, detail);
    this.onStatusChange?.("failed");
  }

  setMessage(title, detail = "") {
    this.message.textContent = title;
    this.subMessage.textContent = detail;
  }

  updateMeters() {
    const castPercent = Math.round(this.castPower * 100);
    this.castFill.style.width = `${castPercent}%`;
    this.castMarker.style.left = `${castPercent}%`;

    const distancePercent = clamp(this.distance, 0, 100);
    const caughtPercent = 100 - distancePercent;
    this.distanceFill.style.width = `${caughtPercent}%`;
    this.distanceText.textContent = `${Math.round(distancePercent)}m`;

    this.tensionFill.style.width = `${clamp(this.tension, 0, 100)}%`;
    this.tensionFill.dataset.level =
      this.tension > 82 ? "danger" : this.tension > 58 ? "warning" : "safe";
    this.tensionText.textContent = `${Math.round(this.tension)}%`;
  }

  spawnSplash(x, y, count) {
    for (let i = 0; i < count; i += 1) {
      this.particles.push({
        x,
        y,
        vx: random(-0.15, 0.15),
        vy: random(-0.32, -0.08),
        age: 0,
        life: random(0.45, 0.9),
        size: random(1.5, 4)
      });
    }
  }

  draw() {
    const ctx = this.ctx;
    const width = this.width || 1;
    const height = this.height || 1;
    ctx.clearRect(0, 0, width, height);

    this.drawRipples(ctx, width, height);
    this.drawLineAndRod(ctx, width, height);
    this.drawBobber(ctx, width, height);
    this.drawParticles(ctx, width, height);
  }

  drawRipples(ctx, width, height) {
    ctx.save();
    this.ripples.forEach((ripple) => {
      const progress = ripple.age / ripple.life;
      const alpha = 1 - progress;
      const radiusX = (8 + progress * 42) * (width / 420);
      const radiusY = radiusX * 0.32;
      ctx.beginPath();
      ctx.ellipse(
        ripple.x * width,
        ripple.y * height,
        radiusX,
        radiusY,
        0,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = `rgba(205, 247, 255, ${alpha * 0.75})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.restore();
  }

  drawLineAndRod(ctx, width, height) {
    const rodBaseX = width * 0.52;
    const rodBaseY = height * 1.02;
    let rodTipX = width * 0.42;
    let rodTipY = height * 0.67;

    if (this.state === STATE.READY) {
      rodTipX = width * 0.41;
      rodTipY = height * 0.66;
    } else if (this.state === STATE.FIGHT) {
      const bend = this.tension / 100;
      rodTipX = width * (0.41 + (this.bobber.x - 0.5) * 0.22);
      rodTipY = height * (0.62 + bend * 0.075);
    }

    ctx.save();
    ctx.lineCap = "round";

    // rod shadow
    ctx.beginPath();
    ctx.moveTo(rodBaseX + 5, rodBaseY + 4);
    ctx.quadraticCurveTo(width * 0.49, height * 0.83, rodTipX + 4, rodTipY + 4);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = Math.max(8, width * 0.025);
    ctx.stroke();

    // basic starter rod
    const gradient = ctx.createLinearGradient(rodBaseX, rodBaseY, rodTipX, rodTipY);
    gradient.addColorStop(0, "#1c262e");
    gradient.addColorStop(0.45, "#175d79");
    gradient.addColorStop(1, "#7ac8dc");

    ctx.beginPath();
    ctx.moveTo(rodBaseX, rodBaseY);
    ctx.quadraticCurveTo(width * 0.49, height * 0.83, rodTipX, rodTipY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(6, width * 0.019);
    ctx.stroke();

    // handle
    ctx.beginPath();
    ctx.moveTo(rodBaseX, rodBaseY);
    ctx.lineTo(width * 0.5, height * 0.91);
    ctx.strokeStyle = "#20282c";
    ctx.lineWidth = Math.max(14, width * 0.042);
    ctx.stroke();

    // line
    if (this.bobber.visible) {
      ctx.beginPath();
      ctx.moveTo(rodTipX, rodTipY);
      const middleX = (rodTipX + this.bobber.x * width) / 2;
      const middleY = Math.min(height * 0.72, (rodTipY + this.bobber.y * height) / 2 + height * 0.05);
      ctx.quadraticCurveTo(
        middleX,
        middleY,
        this.bobber.x * width,
        this.bobber.y * height
      );
      ctx.strokeStyle = "rgba(236, 248, 255, 0.94)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawBobber(ctx, width, height) {
    if (!this.bobber.visible) return;

    const x = this.bobber.x * width;
    const y = this.bobber.y * height;
    const size = Math.max(8, width * 0.027);

    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.ellipse(0, size * 0.42, size * 1.35, size * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 28, 50, 0.28)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, size * 0.22, size * 0.82, 0, Math.PI);
    ctx.fillStyle = "#ef453d";
    ctx.fill();

    ctx.fillStyle = "#f6d45c";
    ctx.fillRect(-size * 0.12, -size * 1.65, size * 0.24, size * 0.85);
    ctx.restore();
  }

  drawParticles(ctx, width, height) {
    ctx.save();
    this.particles.forEach((particle) => {
      const alpha = 1 - particle.age / particle.life;
      ctx.beginPath();
      ctx.arc(
        particle.x * width,
        particle.y * height,
        particle.size,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(220, 250, 255, ${alpha})`;
      ctx.fill();
    });
    ctx.restore();
  }
}
