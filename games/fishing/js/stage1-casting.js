import {
  CASTING_CONFIG,
  chooseFishForStage,
  getFishingBehavior,
  randomBehaviorRange,
  createCatchResult
} from "./data/fishing-behaviors.js";

const root = document.getElementById("fishingStageScreen");
const canvas = document.getElementById("stage1CastingCanvas");

if (root && canvas) {
  const ctx = canvas.getContext("2d");
  const castButton = document.getElementById("stage1CastButton");
  const resetButton = document.getElementById("stage1CastResetButton");
  const buttonText = document.getElementById("stage1CastButtonText");
  const afterCastControls = document.getElementById("stage1AfterCastControls");
  const hookButton = document.getElementById("stage1HookButton");
  const eventToast = document.getElementById("stage1EventToast");
  const castingArea = document.getElementById("stage1CastingArea");
  const reelingArea = document.getElementById("stage1ReelingArea");
  const reelButton = document.getElementById("stage1ReelButton");
  const distanceText = document.getElementById("stage1DistanceText");
  const distanceFill = document.getElementById("stage1DistanceFill");
  const tensionText = document.getElementById("stage1TensionText");
  const tensionTrack = document.getElementById("stage1TensionTrack");
  const tensionFill = document.getElementById("stage1TensionFill");
  const fishStateText = document.getElementById("stage1FishState");
  const catchResult = document.getElementById("stage1CatchResult");
  const catchRarity = document.getElementById("stage1CatchRarity");
  const catchImage = document.getElementById("stage1CatchImage");
  const catchName = document.getElementById("stage1CatchName");
  const catchSize = document.getElementById("stage1CatchSize");
  const catchExp = document.getElementById("stage1CatchExp");
  const catchGold = document.getElementById("stage1CatchGold");
  const catchConfirmButton = document.getElementById("stage1CatchConfirmButton");
  const powerPanel = document.querySelector(".casting-power-panel");
  const powerFill = document.getElementById("castingPowerFill");
  const powerMarker = document.getElementById("castingPowerMarker");
  const powerPercent = document.getElementById("castingPowerPercent");

  const state = {
    mode: "ready",
    holding: false,
    power: 0,
    direction: 1,
    castQuality: 0,
    biteTimer: null,
    biteWindowTimer: null,
    biteActive: false,
    toastTimer: null,
    failureResetTimer: null,
    reelingStartTimer: null,
    distance: 30,
    maxDistance: 30,
    tension: 25,
    fishPhase: "rest",
    fishPhaseElapsed: 0,
    fishPhaseDuration: 2.8,
    lastReelTapAt: 0,
    hookedFish: null,
    rarityProfile: getFishingBehavior(null),
    catchData: null,
    reelingElapsed: 0,
    auraPulse: 0,
    lastTime: performance.now(),
    frameId: 0,
    width: 0,
    height: 0,
    bobber: {
      visible: false,
      x: 0.5,
      y: 0.83
    },
    cast: null,
    ripples: [],
    splashes: []
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function resizeCanvas() {
    const rect = root.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    state.width = rect.width;
    state.height = rect.height;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function showToast(message, type = "normal", duration = 1100) {
    if (!eventToast) return;
    window.clearTimeout(state.toastTimer);
    eventToast.textContent = message;
    eventToast.dataset.type = type;
    eventToast.hidden = false;
    state.toastTimer = window.setTimeout(() => { eventToast.hidden = true; }, duration);
  }

  function clearBiteTimers() {
    window.clearTimeout(state.biteTimer);
    window.clearTimeout(state.biteWindowTimer);
    state.biteTimer = null;
    state.biteWindowTimer = null;
    state.biteActive = false;
    hookButton?.classList.remove("is-biting");
  }

  function scheduleBite() {
    clearBiteTimers();
    const delay = 1800 + Math.random() * 3200;

    state.biteTimer = window.setTimeout(() => {
      if (state.mode !== "waiting") return;

      // 입질이 시작되는 바로 이 순간 물고기가 결정됩니다.
      state.hookedFish = chooseFishForStage(1);
      state.rarityProfile = getFishingBehavior(state.hookedFish);
      state.biteActive = true;

      hookButton?.classList.add("is-biting");
      hookButton.dataset.rarity = state.hookedFish.rarity;
      root.dataset.hookedRarity = state.hookedFish.rarity;

      const biteMessages = {
        normal: "입질!",
        rare: "강한 입질!",
        unique: "엄청난 입질!",
        legendary: "수면 아래에서 전설적인 기운이 느껴진다!"
      };

      showToast(
        biteMessages[state.hookedFish.rarity] ?? "입질!",
        state.hookedFish.rarity === "legendary" ? "legendary" : "bite",
        Math.min(1300, state.rarityProfile.hookWindowMs + 350)
      );

      const rippleCount =
        state.hookedFish.rarity === "legendary" ? 4 :
        state.hookedFish.rarity === "unique" ? 3 : 1;

      for (let i = 0; i < rippleCount; i += 1) {
        state.ripples.push({
          x: state.bobber.x,
          y: state.bobber.y,
          age: -i * 0.08,
          life: 0.65 + i * 0.12
        });
      }

      state.biteWindowTimer = window.setTimeout(() => {
        if (!state.biteActive || state.mode !== "waiting") return;

        state.biteActive = false;
        hookButton?.classList.remove("is-biting");
        delete hookButton.dataset.rarity;
        showToast("입질을 놓쳤습니다", "fail", 1100);

        state.hookedFish = null;
        state.rarityProfile = getFishingBehavior(null);
        delete root.dataset.hookedRarity;
        scheduleBite();
      }, state.rarityProfile.hookWindowMs);
    }, delay);
  }

  function updateReelingUi() {
    const distanceRatio = clamp(state.distance / state.maxDistance, 0, 1);
    const tensionRatio = clamp(state.tension / 100, 0, 1);

    distanceText.textContent = state.distance.toFixed(1);
    distanceFill.style.width = `${distanceRatio * 100}%`;
    tensionText.textContent = `${Math.round(state.tension)}%`;
    tensionFill.style.width = `${tensionRatio * 100}%`;

    const zone =
      state.tension >= 82 ? "danger" :
      state.tension >= 58 ? "warning" :
      "safe";

    tensionTrack.dataset.zone = zone;
  }

  function setFishPhase(phase) {
    const profile = state.rarityProfile;
    const fish = state.hookedFish;

    // 유니크/레전더리는 가끔 짧은 페이크 휴식 뒤 즉시 재폭주합니다.
    if (
      phase === "rest" &&
      ["unique", "legendary"].includes(fish?.rarity) &&
      Math.random() < profile.phaseBias
    ) {
      phase = "fake";
    }

    state.fishPhase = phase;
    state.fishPhaseElapsed = 0;

    if (phase === "struggle") {
      state.fishPhaseDuration = randomBehaviorRange(profile.struggleDuration);

      const messages = {
        normal: "물고기가 버틴다! 천천히!",
        rare: "물고기가 빠르게 도망친다!",
        unique: "강력한 폭주! 지금은 장력 조절!",
        legendary: "전설의 폭주! 릴을 멈춰라!"
      };

      if (profile.behaviorType === "bottom_hold") {
        fishStateText.textContent = "바닥에 붙어 버틴다! 무리하지 마세요!";
      } else if (profile.behaviorType === "heavy" || profile.behaviorType === "boss_heavy") {
        fishStateText.textContent = "엄청난 무게다! 천천히 끌어올리세요!";
      } else if (profile.behaviorType === "burst") {
        fishStateText.textContent = "갑작스러운 돌진! 릴을 멈추세요!";
      } else {
        fishStateText.textContent = messages[fish?.rarity] ?? messages.normal;
      }

      reelingArea.dataset.phase = "struggle";
    } else if (phase === "fake") {
      state.fishPhaseDuration = 0.42 + Math.random() * 0.42;
      fishStateText.textContent = "힘이 빠진 것 같다...?";
      reelingArea.dataset.phase = "fake";
    } else {
      state.fishPhaseDuration = randomBehaviorRange(profile.restDuration);

      const messages = {
        normal: "힘이 빠졌다! 릴을 감으세요!",
        rare: "빈틈이다! 빠르게 연타!",
        unique: "강한 기운이 약해졌다! 연타!",
        legendary: "전설의 기운이 잠잠해졌다! 지금이다!"
      };

      fishStateText.textContent = messages[fish?.rarity] ?? messages.normal;
      reelingArea.dataset.phase = "rest";
    }
  }

  function beginReeling() {
    window.clearTimeout(state.reelingStartTimer);
    state.reelingStartTimer = null;

    if (!state.hookedFish) {
      resetCasting();
      return;
    }

    const profile = state.rarityProfile;

    state.mode = "reeling";
    state.maxDistance = profile.startDistance;
    state.distance = state.maxDistance;
    state.tension = profile.startTension;
    state.lastReelTapAt = 0;
    state.reelingElapsed = 0;
    state.auraPulse = 0;

    afterCastControls.hidden = true;
    reelingArea.hidden = false;
    reelingArea.dataset.rarity = state.hookedFish.rarity;
    reelButton.disabled = false;

    setFishPhase("rest");
    updateReelingUi();

    const startMessages = {
      normal: "릴링 시작!",
      rare: "쉽지 않은 녀석이다!",
      unique: "유니크급의 강한 기운!",
      legendary: "레전더리급 출현!"
    };

    showToast(
      startMessages[state.hookedFish.rarity],
      state.hookedFish.rarity,
      state.hookedFish.rarity === "legendary" ? 1500 : 1050
    );
  }

  function finishReeling(success, message) {
    if (state.mode !== "reeling") return;

    state.mode = success ? "caught" : "line-broken";
    reelButton.disabled = true;
    reelingArea.dataset.phase = success ? "success" : "failed";

    if (!success) {
      fishStateText.textContent = "낚싯줄이 끊어졌다!";
      showToast(message, "fail", 1500);

      window.dispatchEvent(new CustomEvent("fishingworld:reeling-failed", {
        detail: {
          stageId: 1,
          distance: state.distance,
          tension: state.tension,
          fishId: state.hookedFish?.id ?? null,
          fish: state.hookedFish
        }
      }));

      state.failureResetTimer = window.setTimeout(resetCasting, 1700);
      return;
    }

    const fish = state.hookedFish;
    state.catchData = createCatchResult(fish);

    try {
      window.FishingWorldFish?.catch(fish.id, {
        size: state.catchData.size,
        exp: state.catchData.exp,
        caughtAt: state.catchData.caughtAt
      });
    } catch (error) {
      console.error("물고기 저장 실패:", error);
    }

    fishStateText.textContent = `${fish.name}를 끌어올렸다!`;
    showToast(`${fish.name} 낚시 성공!`, fish.rarity, 1050);

    window.dispatchEvent(new CustomEvent("fishingworld:reeling-success", {
      detail: {
        stageId: 1,
        distance: state.distance,
        tension: state.tension,
        fishId: fish.id,
        fish,
        catchData: state.catchData
      }
    }));

    window.setTimeout(() => {
      showCatchResult();
    }, 650);
  }

  function showCatchResult() {
    const fish = state.hookedFish;
    const data = state.catchData;
    if (!fish || !data) {
      resetCasting();
      return;
    }

    const rarityLabels = {
      normal: "노말",
      rare: "레어",
      unique: "유니크",
      legendary: "레전더리"
    };

    reelingArea.hidden = true;
    catchResult.hidden = false;
    catchResult.dataset.rarity = fish.rarity;
    catchRarity.textContent = rarityLabels[fish.rarity] ?? fish.rarity;
    catchImage.src = fish.image;
    catchImage.alt = fish.name;
    catchName.textContent = fish.name;
    catchSize.textContent = `${data.size.toFixed(1)}cm`;
    catchExp.textContent = `+${data.exp.toLocaleString("ko-KR")} EXP`;
    catchGold.textContent = `${data.goldValue.toLocaleString("ko-KR")} G`;
  }

  function handleReelTap(event) {
    if (state.mode !== "reeling") return;
    event?.preventDefault();

    const now = performance.now();
    const tapGap = now - state.lastReelTapAt;
    state.lastReelTapAt = now;

    const isStruggling =
      state.fishPhase === "struggle" ||
      state.fishPhase === "fake";
    const profile = state.rarityProfile;
    const rapidTapBonus =
      !isStruggling && tapGap > 0 && tapGap < 230 ? 0.13 : 0;

    const distancePull = isStruggling
      ? profile.strugglePull
      : profile.restPull + rapidTapBonus;

    const tensionGain = isStruggling
      ? profile.struggleTapTension
      : profile.restTapTension;

    state.distance = Math.max(0, state.distance - distancePull);
    state.tension = Math.min(110, state.tension + tensionGain);

    reelButton.classList.remove("is-tapped");
    void reelButton.offsetWidth;
    reelButton.classList.add("is-tapped");

    updateReelingUi();

    if (state.tension >= 100) {
      finishReeling(false, "낚싯줄이 끊어졌습니다!");
    } else if (state.distance <= 0) {
      finishReeling(true, "낚시 성공!");
    }
  }

  function updatePowerUi() {
    const percent = Math.round(state.power * 100);
    powerFill.style.width = `${percent}%`;
    powerMarker.style.left = `${percent}%`;
    powerPercent.textContent = `${percent}%`;
  }

  function resetCasting() {
    window.clearTimeout(state.failureResetTimer);
    window.clearTimeout(state.reelingStartTimer);
    state.failureResetTimer = null;
    state.reelingStartTimer = null;
    state.mode = "ready";
    state.holding = false;
    state.power = 0;
    state.direction = 1;
    state.cast = null;
    state.hookedFish = null;
    state.rarityProfile = getFishingBehavior(null);
    state.catchData = null;
    state.reelingElapsed = 0;
    state.auraPulse = 0;
    state.bobber.visible = false;
    state.ripples.length = 0;
    state.splashes.length = 0;
    clearBiteTimers();

    castingArea.hidden = false;
    castButton.hidden = false;
    afterCastControls.hidden = true;
    reelingArea.hidden = true;
    catchResult.hidden = true;
    reelingArea.dataset.phase = "";
    delete reelingArea.dataset.rarity;
    delete root.dataset.hookedRarity;
    root.classList.remove("hooked-unique", "hooked-legendary");
    delete hookButton.dataset.rarity;
    reelButton.disabled = false;
    powerPanel.hidden = false;
    buttonText.textContent = "캐스팅";
    hookButton.disabled = false;
    hookButton.textContent = "후킹";
    updatePowerUi();
  }

  function startHolding(event) {
    if (state.mode !== "ready") return;
    event.preventDefault();
    state.holding = true;
    state.power = 0;
    state.direction = 1;
    buttonText.textContent = "캐스팅";
  }

  function releaseHolding(event) {
    if (!state.holding || state.mode !== "ready") return;
    event?.preventDefault();
    state.holding = false;
    beginCast();
  }

  function beginCast() {
    const power = state.power;
    const isSuccess =
      power >= CASTING_CONFIG.successMinPower &&
      power <= CASTING_CONFIG.successMaxPower;

    if (!isSuccess) {
      state.mode = "cast-failed";
      castButton.hidden = true;
      showToast("캐스팅 실패! 초록 구간에 맞추세요", "fail", 1150);

      state.failureResetTimer = window.setTimeout(() => {
        resetCasting();
      }, 1200);
      return;
    }

    state.mode = "casting";
    state.castQuality =
      power >= CASTING_CONFIG.perfectMinPower &&
      power <= CASTING_CONFIG.perfectMaxPower
        ? 1
        : 0.72;

    state.cast = {
      elapsed: 0,
      duration: 0.78,
      startX: 0.50,
      startY: 0.91,
      endX: 0.34 + power * 0.32,
      endY: 0.42 - power * 0.07
    };

    state.bobber.visible = true;
    state.bobber.x = state.cast.startX;
    state.bobber.y = state.cast.startY;
    castButton.hidden = true;

    showToast(
      state.castQuality >= 1 ? "PERFECT!" : "GOOD!",
      "cast",
      800
    );
  }

  function finishCast() {
    state.mode = "waiting";
    state.cast = null;
    castingArea.hidden = true;
    afterCastControls.hidden = false;

    state.ripples.push({
      x: state.bobber.x,
      y: state.bobber.y,
      age: 0,
      life: 1.5
    });

    for (let i = 0; i < 22; i += 1) {
      state.splashes.push({
        x: state.bobber.x,
        y: state.bobber.y,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -0.08 - Math.random() * 0.19,
        age: 0,
        life: 0.45 + Math.random() * 0.48,
        size: 1.5 + Math.random() * 3.3
      });
    }
    scheduleBite();
  }

  function handleHook() {
    if (state.mode !== "waiting") return;
    if (!state.biteActive) {
      clearBiteTimers();
      state.mode = "failed";
      state.hookedFish = null;
      state.rarityProfile = getFishingBehavior(null);
      delete root.dataset.hookedRarity;
      hookButton.disabled = true;
      showToast("낚시 실패! 입질 타이밍이 아닙니다", "fail", 1050);

      state.failureResetTimer = window.setTimeout(() => {
        resetCasting();
      }, 1100);
      return;
    }
    clearBiteTimers();
    state.mode = "hooked";
    const rarity = state.hookedFish?.rarity ?? "normal";
    const hookMessages = {
      normal: "후킹 성공!",
      rare: "강한 녀석이 걸렸다!",
      unique: "유니크급의 강력한 기운!",
      legendary: "전설적인 존재가 걸렸다!"
    };

    showToast(hookMessages[rarity], rarity, rarity === "legendary" ? 1450 : 900);
    root.classList.remove("hooked-unique", "hooked-legendary");

    if (rarity === "unique" || rarity === "legendary") {
      root.classList.add(`hooked-${rarity}`);
      window.setTimeout(() => {
        root.classList.remove(`hooked-${rarity}`);
      }, rarity === "legendary" ? 1450 : 1000);
    }

    hookButton.textContent = "후킹 성공";
    hookButton.disabled = true;
    castingArea.hidden = true;

    window.dispatchEvent(new CustomEvent("fishingworld:hook-success", {
      detail: {
        stageId: 1,
        castPower: state.power,
        castQuality: state.castQuality,
        fishId: state.hookedFish?.id ?? null,
        rarity: state.hookedFish?.rarity ?? null
      }
    }));

    state.reelingStartTimer = window.setTimeout(beginReeling, 650);
  }

  function update(delta) {
    if (state.holding && state.mode === "ready") {
      state.power += state.direction * delta * 0.95;

      if (state.power >= 1) {
        state.power = 1;
        state.direction = -1;
      } else if (state.power <= 0) {
        state.power = 0;
        state.direction = 1;
      }

      updatePowerUi();
    }

    if (state.mode === "casting" && state.cast) {
      state.cast.elapsed += delta;
      const progress = clamp(state.cast.elapsed / state.cast.duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      state.bobber.x =
        state.cast.startX +
        (state.cast.endX - state.cast.startX) * eased;

      state.bobber.y =
        state.cast.startY +
        (state.cast.endY - state.cast.startY) * eased -
        Math.sin(Math.PI * progress) * 0.27;

      if (progress >= 1) finishCast();
    }

    if (state.mode === "reeling") {
      const profile = state.rarityProfile;
      state.reelingElapsed += delta;
      state.auraPulse += delta;
      state.fishPhaseElapsed += delta;

      if (state.fishPhase === "struggle") {
        state.tension += profile.struggleTensionRise * delta;
        state.distance = Math.min(
          state.maxDistance,
          state.distance + profile.escapeSpeed * delta
        );

        // 등급이 높을수록 수면과 찌가 더 격하게 흔들립니다.
        const splashChance =
          0.9 * profile.splashPower * delta;

        if (Math.random() < splashChance) {
          state.splashes.push({
            x: state.bobber.x + (Math.random() - 0.5) * 0.12,
            y: state.bobber.y + (Math.random() - 0.5) * 0.035,
            vx: (Math.random() - 0.5) * 0.28 * profile.splashPower,
            vy: -0.08 - Math.random() * 0.16 * profile.splashPower,
            age: 0,
            life: 0.35 + Math.random() * 0.35,
            size: 1.5 + Math.random() * 2.8 * profile.splashPower
          });
        }
      } else {
        state.tension -= profile.restTensionDrop * delta;
      }

      state.tension = clamp(state.tension, 0, 110);

      if (state.fishPhaseElapsed >= state.fishPhaseDuration) {
        setFishPhase(
          state.fishPhase === "struggle"
            ? "rest"
            : "struggle"
        );
      }

      updateReelingUi();

      if (state.tension >= 100) {
        finishReeling(false, "낚싯줄이 끊어졌습니다!");
      } else if (state.distance <= 0) {
        finishReeling(true, "낚시 성공!");
      }
    }

    state.ripples.forEach((ripple) => {
      ripple.age += delta;
    });
    state.ripples = state.ripples.filter(
      (ripple) => ripple.age < ripple.life
    );

    state.splashes.forEach((particle) => {
      particle.age += delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 0.42 * delta;
    });
    state.splashes = state.splashes.filter(
      (particle) => particle.age < particle.life
    );
  }

  function drawRod() {
    const width = state.width;
    const height = state.height;

    const baseX = width * 0.53;
    const baseY = height * 1.02;
    const tipX = width * 0.43;
    const tipY = height * 0.67;

    ctx.save();
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(baseX + 4, baseY + 3);
    ctx.quadraticCurveTo(
      width * 0.50,
      height * 0.84,
      tipX + 3,
      tipY + 3
    );
    ctx.strokeStyle = "rgba(0, 0, 0, 0.34)";
    ctx.lineWidth = Math.max(8, width * 0.024);
    ctx.stroke();

    const rodGradient = ctx.createLinearGradient(
      baseX,
      baseY,
      tipX,
      tipY
    );
    rodGradient.addColorStop(0, "#20292d");
    rodGradient.addColorStop(0.45, "#215d73");
    rodGradient.addColorStop(1, "#91d5df");

    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(
      width * 0.50,
      height * 0.84,
      tipX,
      tipY
    );
    ctx.strokeStyle = rodGradient;
    ctx.lineWidth = Math.max(6, width * 0.018);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(width * 0.51, height * 0.91);
    ctx.strokeStyle = "#252b2d";
    ctx.lineWidth = Math.max(14, width * 0.043);
    ctx.stroke();

    if (state.bobber.visible) {
      const bobberX = state.bobber.x * width;
      const bobberY = state.bobber.y * height;

      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      const shakeStrength =
        state.mode === "reeling" && state.fishPhase === "struggle"
          ? state.rarityProfile.lineShake
          : 0;
      const lineWave =
        Math.sin(state.reelingElapsed * (10 + shakeStrength * 4)) *
        width * 0.012 * shakeStrength;

      ctx.quadraticCurveTo(
        (tipX + bobberX) / 2 + lineWave,
        Math.min(height * 0.75, (tipY + bobberY) / 2 + height * 0.055),
        bobberX,
        bobberY
      );
      ctx.strokeStyle = "rgba(240, 250, 255, 0.95)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawBobber() {
    if (!state.bobber.visible) return;

    const width = state.width;
    const height = state.height;
    const profile = state.rarityProfile;
    const activeShake =
      state.mode === "reeling" && state.fishPhase === "struggle"
        ? profile.lineShake
        : state.biteActive
          ? profile.lineShake * 0.7
          : 0;
    const shakeX =
      Math.sin(performance.now() * 0.024) * activeShake * width * 0.006;
    const shakeY =
      Math.cos(performance.now() * 0.031) * activeShake * height * 0.003;
    const x = state.bobber.x * width + shakeX;
    const y = state.bobber.y * height + shakeY;
    const size = Math.max(7, width * 0.025);

    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.ellipse(
      0,
      size * 0.48,
      size * 1.3,
      size * 0.34,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(0, 24, 42, 0.3)";
    ctx.fill();

    ctx.fillStyle = "#f4dc63";
    ctx.fillRect(
      -size * 0.11,
      -size * 1.55,
      size * 0.22,
      size * 0.8
    );

    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = "#f5f5ee";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, size * 0.15, size * 0.84, 0, Math.PI);
    ctx.fillStyle = "#ec4940";
    ctx.fill();

    ctx.restore();
  }

  function drawHookedFishPresence() {
    if (
      !state.hookedFish ||
      !["hooked", "reeling"].includes(state.mode)
    ) {
      return;
    }

    const rarity = state.hookedFish.rarity;
    const profile = state.rarityProfile;
    const width = state.width;
    const height = state.height;
    const time = state.reelingElapsed || performance.now() / 1000;

    const centerX =
      state.bobber.x * width +
      Math.sin(time * (rarity === "legendary" ? 1.8 : 2.7)) *
        width * 0.09 * profile.lineShake;

    const centerY =
      state.bobber.y * height +
      height * (rarity === "legendary" ? 0.12 : 0.085) +
      Math.cos(time * 2.1) * height * 0.012;

    const shadowWidth = width * 0.12 * profile.shadowScale;
    const shadowHeight = shadowWidth * 0.28;

    ctx.save();

    if (rarity === "unique" || rarity === "legendary") {
      const pulse = 0.5 + Math.sin(state.auraPulse * 5) * 0.15;
      const aura = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        shadowWidth * 1.8
      );

      if (rarity === "legendary") {
        aura.addColorStop(0, `rgba(255, 222, 82, ${pulse * 0.5})`);
        aura.addColorStop(0.45, `rgba(255, 174, 55, ${pulse * 0.22})`);
      } else {
        aura.addColorStop(0, `rgba(184, 86, 255, ${pulse * 0.42})`);
        aura.addColorStop(0.45, `rgba(89, 202, 255, ${pulse * 0.18})`);
      }

      aura.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(centerX, centerY, shadowWidth * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha =
      rarity === "legendary" ? 0.48 :
      rarity === "unique" ? 0.38 :
      rarity === "rare" ? 0.28 : 0.2;

    ctx.fillStyle = "#031826";
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      shadowWidth,
      shadowHeight,
      Math.sin(time * 1.7) * 0.18,
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (rarity === "legendary") {
      ctx.globalAlpha = 0.5 + Math.sin(time * 6) * 0.18;
      ctx.strokeStyle = "rgba(255, 224, 104, 0.9)";
      ctx.lineWidth = 2;

      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          shadowWidth * (1.1 + i * 0.26),
          shadowHeight * (1.5 + i * 0.22),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawEffects() {
    const width = state.width;
    const height = state.height;

    state.ripples.forEach((ripple) => {
      const progress = ripple.age / ripple.life;
      const alpha = 1 - progress;
      const radiusX = 9 + progress * width * 0.12;

      ctx.beginPath();
      ctx.ellipse(
        ripple.x * width,
        ripple.y * height,
        radiusX,
        radiusX * 0.27,
        0,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = `rgba(218, 249, 255, ${alpha * 0.8})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    });

    state.splashes.forEach((particle) => {
      const alpha = 1 - particle.age / particle.life;

      ctx.beginPath();
      ctx.arc(
        particle.x * width,
        particle.y * height,
        particle.size,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(225, 251, 255, ${alpha})`;
      ctx.fill();
    });
  }

  function draw() {
    if (state.width < 1 || state.height < 1) return;
    ctx.clearRect(0, 0, state.width, state.height);
    drawHookedFishPresence();
    drawEffects();
    drawRod();
    drawBobber();
  }

  function frame(now) {
    const delta = Math.min(0.034, (now - state.lastTime) / 1000);
    state.lastTime = now;

    if (root.getAttribute("aria-hidden") === "false") {
      if (state.width < 1) resizeCanvas();
      update(delta);
      draw();
    }

    state.frameId = requestAnimationFrame(frame);
  }

  castButton?.addEventListener("pointerdown", startHolding);
  window.addEventListener("pointerup", releaseHolding);
  window.addEventListener("pointercancel", releaseHolding);
  resetButton?.addEventListener("click", resetCasting);
  hookButton?.addEventListener("click", handleHook);
  reelButton?.addEventListener("pointerdown", handleReelTap);
  catchConfirmButton?.addEventListener("click", resetCasting);
  window.addEventListener("resize", resizeCanvas);

  const screenObserver = new MutationObserver(() => {
    if (root.getAttribute("aria-hidden") === "false") {
      requestAnimationFrame(() => {
        resizeCanvas();
        resetCasting();
      });
    }
  });

  screenObserver.observe(root, {
    attributes: true,
    attributeFilter: ["aria-hidden"]
  });

  resizeCanvas();
  resetCasting();
  state.frameId = requestAnimationFrame(frame);
}
