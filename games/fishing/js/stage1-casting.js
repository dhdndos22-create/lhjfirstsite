
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
      state.biteActive = true;
      hookButton?.classList.add("is-biting");
      showToast("입질!", "bite", 1200);
      state.ripples.push({ x: state.bobber.x, y: state.bobber.y, age: 0, life: 0.7 });
      state.biteWindowTimer = window.setTimeout(() => {
        if (!state.biteActive || state.mode !== "waiting") return;
        state.biteActive = false;
        hookButton?.classList.remove("is-biting");
        showToast("입질을 놓쳤습니다", "fail", 1300);
        scheduleBite();
      }, 1150);
    }, delay);
  }

  function updatePowerUi() {
    const percent = Math.round(state.power * 100);
    powerFill.style.width = `${percent}%`;
    powerMarker.style.left = `${percent}%`;
    powerPercent.textContent = `${percent}%`;
  }

  function resetCasting() {
    window.clearTimeout(state.failureResetTimer);
    state.failureResetTimer = null;
    state.mode = "ready";
    state.holding = false;
    state.power = 0;
    state.direction = 1;
    state.cast = null;
    state.bobber.visible = false;
    state.ripples.length = 0;
    state.splashes.length = 0;
    clearBiteTimers();

    castingArea.hidden = false;
    castButton.hidden = false;
    afterCastControls.hidden = true;
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
    state.mode = "casting";
    state.castQuality = 1 - Math.min(1, Math.abs(state.power - 0.73) / 0.73);
    state.castQuality = clamp(state.castQuality, 0, 1);

    state.cast = {
      elapsed: 0,
      duration: 0.78,
      startX: 0.50,
      startY: 0.91,
      endX: 0.34 + state.power * 0.32,
      endY: 0.42 - state.power * 0.07
    };

    state.bobber.visible = true;
    state.bobber.x = state.cast.startX;
    state.bobber.y = state.cast.startY;
    castButton.hidden = true;

    const qualityText =
      state.castQuality >= 0.84 ? "PERFECT!" :
      state.castQuality >= 0.58 ? "GOOD!" :
      "캐스팅!";
    showToast(qualityText, "cast", 800);
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
      hookButton.disabled = true;
      showToast("낚시 실패! 입질 타이밍이 아닙니다", "fail", 1050);

      state.failureResetTimer = window.setTimeout(() => {
        resetCasting();
      }, 1100);
      return;
    }
    clearBiteTimers();
    state.mode = "hooked";
    showToast("후킹 성공! 낚시 게임 시작", "success", 1700);
    hookButton.textContent = "후킹 성공";
    hookButton.disabled = true;
    window.dispatchEvent(new CustomEvent("fishingworld:hook-success", { detail: { stageId: 1, castPower: state.power, castQuality: state.castQuality } }));
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
      ctx.quadraticCurveTo(
        (tipX + bobberX) / 2,
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
    const x = state.bobber.x * width;
    const y = state.bobber.y * height;
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
    attributeFilter: ["aria-hidden", "class"]
  });

  resizeCanvas();
  resetCasting();
  state.frameId = requestAnimationFrame(frame);
}
