const EMOTIONS = {
    joie: {
      label: "Joie",
      color: "#FDBA74",
      details: ["Sérénité", "Gratitude", "Excitation", "Soulagement", "Fierté", "Enthousiasme"],
      waveform: "soft"
    },
    tristesse: {
      label: "Tristesse",
      color: "#8BB8FF",
      details: ["Nostalgie", "Solitude", "Déception", "Manque", "Mélancolie", "Chagrin"],
      waveform: "droop"
    },
    peur: {
      label: "Peur",
      color: "#B59CFF",
      details: ["Stress", "Anxiété", "Vulnérabilité", "Inquiétude", "Insécurité", "Appréhension"],
      waveform: "sharp"
    },
    colere: {
      label: "Colère",
      color: "#FF7E8A",
      details: ["Frustration", "Tension", "Irritation", "Impuissance", "Agacement", "Révolte"],
      waveform: "spiky"
    },
    honte: {
      label: "Honte",
      color: "#C39EFF",
      details: ["Gêne", "Culpabilité", "Embarras", "Retrait", "Malaise", "Auto-jugement"],
      waveform: "folded"
    }
  };
  
  const TEXTURES = ["Brume", "Fluide", "Lumière", "Grain", "Particules"];
  const DAY_TIMES = ["Matin", "Midi", "Après-midi", "Soir", "Nuit"];
  
  const BLOB_SIZE = 520;
  const MOBILE_THRESHOLD = 430;
  
  const state = {
    currentScreen: "onboarding",
    libraryView: "timeline",
  
    signature: {
      emotionKey: "tristesse",
      color: "#8BB8FF",
      intensity: 42,
      texture: "Brume",
      dragPoints: []
    },
  
    journal: {
      emotionKey: "joie",
      timeOfDay: "Matin",
      detail: "Sérénité",
      intensity: 50,
      notes: ""
    },
  
    animationTime: 0,
    journalAnimationTime: 0
  };
  
  const storageKey = "emotion-organic-library-v2";
  
  function getEntries() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  }
  
  function setEntries(entries) {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }
  
  const onboardingEmotionContainer = document.getElementById("onboarding-emotions");
  const journalEmotionContainer = document.getElementById("journal-emotions");
  const textureChoices = document.getElementById("texture-choices");
  const timeChoices = document.getElementById("time-choices");
  const detailChoices = document.getElementById("detail-choices");
  
  const baseColorInput = document.getElementById("base-color");
  const colorValue = document.getElementById("color-value");
  const baseIntensity = document.getElementById("base-intensity");
  const baseIntensityValue = document.getElementById("base-intensity-value");
  const journalIntensity = document.getElementById("journal-intensity");
  const journalIntensityValue = document.getElementById("journal-intensity-value");
  const journalNotes = document.getElementById("journal-notes");
  
  const previewEmotionPill = document.getElementById("preview-emotion-pill");
  const previewTexturePill = document.getElementById("preview-texture-pill");
  const journalPreviewEmotion = document.getElementById("journal-preview-emotion");
  const journalPreviewDetail = document.getElementById("journal-preview-detail");
  const journalPreviewTime = document.getElementById("journal-preview-time");
  
  const blobCanvas = document.getElementById("blob-canvas");
  const blobCtx = blobCanvas.getContext("2d");
  
  const journalPreviewCanvas = document.getElementById("journal-preview-canvas");
  const journalPreviewCtx = journalPreviewCanvas.getContext("2d");
  
  const canvasInteractiveZone = document.getElementById("canvas-interactive-zone");
  const entriesList = document.getElementById("entries-list");
  const calendarGrid = document.getElementById("calendar-grid");
  
  function createButton(label, active, onClick, extraClass = "choice-btn") {
    const btn = document.createElement("button");
    btn.className = `${extraClass}${active ? " active" : ""}`;
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }
  
  function renderOnboardingEmotions() {
    onboardingEmotionContainer.innerHTML = "";
    Object.entries(EMOTIONS).forEach(([key, emotion]) => {
      onboardingEmotionContainer.appendChild(
        createButton(
          emotion.label,
          state.signature.emotionKey === key,
          () => {
            state.signature.emotionKey = key;
            if (!state.signature.colorManuallyChanged) {
              state.signature.color = emotion.color;
              baseColorInput.value = emotion.color;
              colorValue.textContent = emotion.color.toUpperCase();
            }
            renderOnboardingEmotions();
            updatePreviewMeta();
          }
        )
      );
    });
  }
  
  function renderJournalEmotions() {
    journalEmotionContainer.innerHTML = "";
    Object.entries(EMOTIONS).forEach(([key, emotion]) => {
      journalEmotionContainer.appendChild(
        createButton(
          emotion.label,
          state.journal.emotionKey === key,
          () => {
            state.journal.emotionKey = key;
            state.journal.detail = EMOTIONS[key].details[0];
            renderJournalEmotions();
            renderDetailChoices();
            updateJournalMeta();
          }
        )
      );
    });
  }
  
  function renderTextureChoices() {
    textureChoices.innerHTML = "";
    TEXTURES.forEach((texture) => {
      textureChoices.appendChild(
        createButton(
          texture,
          state.signature.texture === texture,
          () => {
            state.signature.texture = texture;
            renderTextureChoices();
            updatePreviewMeta();
          }
        )
      );
    });
  }
  
  function renderTimeChoices() {
    timeChoices.innerHTML = "";
    DAY_TIMES.forEach((time) => {
      timeChoices.appendChild(
        createButton(
          time,
          state.journal.timeOfDay === time,
          () => {
            state.journal.timeOfDay = time;
            renderTimeChoices();
            updateJournalMeta();
          }
        )
      );
    });
  }
  
  function renderDetailChoices() {
    detailChoices.innerHTML = "";
    EMOTIONS[state.journal.emotionKey].details.forEach((detail) => {
      detailChoices.appendChild(
        createButton(
          detail,
          state.journal.detail === detail,
          () => {
            state.journal.detail = detail;
            renderDetailChoices();
            updateJournalMeta();
          }
        )
      );
    });
  }
  
  function updatePreviewMeta() {
    previewEmotionPill.textContent = EMOTIONS[state.signature.emotionKey].label;
    previewTexturePill.textContent = state.signature.texture;
  }
  
  function updateJournalMeta() {
    journalPreviewEmotion.textContent = EMOTIONS[state.journal.emotionKey].label;
    journalPreviewDetail.textContent = state.journal.detail;
    journalPreviewTime.textContent = state.journal.timeOfDay;
  }
  
  function switchScreen(screen) {
    state.currentScreen = screen;
  
    document.querySelectorAll(".screen").forEach((el) => {
      el.classList.toggle("active", el.id === `screen-${screen}`);
    });
  
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.screen === screen);
    });
  
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchScreen(btn.dataset.screen));
  });
  
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.libraryView = btn.dataset.libraryView;
  
      document.querySelectorAll(".tab-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.libraryView === state.libraryView);
      });
  
      document.querySelectorAll(".library-view").forEach((view) => {
        view.classList.toggle("active", view.id === `view-${state.libraryView}`);
      });
    });
  });
  
  baseColorInput.addEventListener("input", (e) => {
    state.signature.color = e.target.value;
    state.signature.colorManuallyChanged = true;
    colorValue.textContent = e.target.value.toUpperCase();
  });
  
  baseIntensity.addEventListener("input", (e) => {
    state.signature.intensity = Number(e.target.value);
    baseIntensityValue.textContent = e.target.value;
  });
  
  journalIntensity.addEventListener("input", (e) => {
    state.journal.intensity = Number(e.target.value);
    journalIntensityValue.textContent = e.target.value;
  });
  
  journalNotes.addEventListener("input", (e) => {
    state.journal.notes = e.target.value;
  });
  
  document.getElementById("reset-shape-btn").addEventListener("click", () => {
    state.signature.dragPoints = [];
  });
  
  document.getElementById("save-signature-btn").addEventListener("click", () => {
    switchScreen("journal");
  });
  
  document.getElementById("save-entry-btn").addEventListener("click", () => {
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      emotionKey: state.journal.emotionKey,
      emotionLabel: EMOTIONS[state.journal.emotionKey].label,
      timeOfDay: state.journal.timeOfDay,
      detail: state.journal.detail,
      intensity: state.journal.intensity,
      notes: state.journal.notes.trim(),
      color: state.signature.color,
      texture: state.signature.texture,
      signatureEmotionKey: state.signature.emotionKey,
      dragPoints: state.signature.dragPoints,
      createdAt: new Date().toISOString()
    };
  
    const entries = getEntries();
    entries.unshift(entry);
    setEntries(entries);
  
    state.journal.notes = "";
    journalNotes.value = "";
    state.journal.intensity = 50;
    journalIntensity.value = 50;
    journalIntensityValue.textContent = "50";
  
    renderEntries();
    renderCalendar();
    switchScreen("library");
  });
  
  function todayKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }
  
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }
  
  function getTextureModifier(texture) {
    switch (texture) {
      case "Fluide":
        return { blur: 18, alpha: 0.9, grain: 0 };
      case "Lumière":
        return { blur: 30, alpha: 0.72, grain: 0 };
      case "Grain":
        return { blur: 10, alpha: 0.88, grain: 18 };
      case "Particules":
        return { blur: 16, alpha: 0.8, grain: 12 };
      case "Brume":
      default:
        return { blur: 26, alpha: 0.76, grain: 0 };
    }
  }
  
  function getWaveformValue(angle, time, waveform, amplitude) {
    let wave =
      Math.sin(angle * 3 + time) * amplitude * 0.34 +
      Math.cos(angle * 5 - time * 1.25) * amplitude * 0.22;
  
    if (waveform === "spiky") {
      wave += Math.max(0, Math.sin(angle * 8 + time)) * amplitude * 0.56;
    }
  
    if (waveform === "sharp") {
      wave += Math.abs(Math.cos(angle * 6 + time)) * amplitude * 0.34;
    }
  
    if (waveform === "droop") {
      wave += Math.sin(angle - Math.PI / 3) * amplitude * 0.4;
    }
  
    if (waveform === "folded") {
      wave += Math.cos(angle * 2 + time) * amplitude * 0.18;
    }
  
    return wave;
  }
  
  function applyDragInfluence(angle, dragPoints, center) {
    let result = 0;
  
    dragPoints.forEach((point) => {
      const pointAngle = Math.atan2(point.y - center, point.x - center);
      const delta = Math.atan2(Math.sin(angle - pointAngle), Math.cos(angle - pointAngle));
      const falloff = Math.max(0, 1 - Math.abs(delta) / 1.05);
      result += falloff * point.power;
    });
  
    return result;
  }
  
  function drawOrganicBlob(ctx, config) {
    const {
      color,
      intensity,
      dragPoints = [],
      waveform = "soft",
      texture = "Brume",
      time = 0,
      size = BLOB_SIZE
    } = config;
  
    ctx.clearRect(0, 0, size, size);
  
    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.223;
    const amplitude = 10 + intensity * 0.42;
    const steps = 120;
    const textureConfig = getTextureModifier(texture);
  
    ctx.save();
  
    const pulse = 1 + intensity / 1400 + Math.sin(time * 1.15) * 0.016;
    ctx.translate(centerX, centerY);
    ctx.scale(pulse, pulse);
    ctx.translate(-centerX, -centerY);
  
    const grad = ctx.createRadialGradient(
      centerX - size * 0.04,
      centerY - size * 0.046,
      size * 0.05,
      centerX,
      centerY,
      size * 0.35
    );
    grad.addColorStop(0, hexToRgba(color, 0.98));
    grad.addColorStop(0.55, hexToRgba(color, 0.55));
    grad.addColorStop(1, hexToRgba(color, 0.18));
  
    ctx.shadowBlur = textureConfig.blur;
    ctx.shadowColor = color;
    ctx.fillStyle = grad;
  
    ctx.beginPath();
  
    for (let i = 0; i <= steps; i++) {
      const angle = (Math.PI * 2 * i) / steps;
      const wave = getWaveformValue(angle, time, waveform, amplitude);
      const drag = applyDragInfluence(angle, dragPoints, centerX);
      const radius = baseRadius + wave + drag;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
  
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  
    ctx.closePath();
    ctx.globalAlpha = textureConfig.alpha;
    ctx.fill();
  
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.35;
    ctx.strokeStyle = hexToRgba(color, 0.62);
    ctx.stroke();
  
    if (textureConfig.grain > 0) {
      drawGrain(ctx, centerX, centerY, baseRadius + amplitude * 0.4, color, textureConfig.grain);
    }
  
    if (texture === "Particules") {
      drawParticles(ctx, centerX, centerY, baseRadius + 30, color, time);
    }
  
    ctx.restore();
  }
  
  function drawGrain(ctx, cx, cy, radius, color, amount) {
    ctx.save();
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 0.9;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
  
      ctx.beginPath();
      ctx.fillStyle = hexToRgba(color, 0.15);
      ctx.arc(x, y, Math.random() * 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  
  function drawParticles(ctx, cx, cy, radius, color, time) {
    ctx.save();
    for (let i = 0; i < 18; i++) {
      const a = (Math.PI * 2 * i) / 18 + time * 0.14;
      const x = cx + Math.cos(a) * (radius + Math.sin(time + i) * 14);
      const y = cy + Math.sin(a) * (radius + Math.cos(time * 0.8 + i) * 14);
  
      ctx.beginPath();
      ctx.fillStyle = hexToRgba(color, 0.22);
      ctx.arc(x, y, 2 + Math.sin(time + i) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  
  function hexToRgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  function animateMainBlob() {
    state.animationTime += 0.032;
  
    const waveform = EMOTIONS[state.signature.emotionKey].waveform;
  
    drawOrganicBlob(blobCtx, {
      color: state.signature.color,
      intensity: state.signature.intensity,
      dragPoints: state.signature.dragPoints,
      waveform,
      texture: state.signature.texture,
      time: state.animationTime,
      size: BLOB_SIZE
    });
  
    requestAnimationFrame(animateMainBlob);
  }
  
  function animateJournalBlob() {
    state.journalAnimationTime += 0.036;
  
    const waveform = EMOTIONS[state.journal.emotionKey].waveform;
  
    drawOrganicBlob(journalPreviewCtx, {
      color: state.signature.color,
      intensity: state.journal.intensity,
      dragPoints: state.signature.dragPoints,
      waveform,
      texture: state.signature.texture,
      time: state.journalAnimationTime,
      size: BLOB_SIZE
    });
  
    requestAnimationFrame(animateJournalBlob);
  }
  
  let isDrawing = false;
  
  function normalizePointerPosition(clientX, clientY, rect) {
    const x = ((clientX - rect.left) / rect.width) * BLOB_SIZE;
    const y = ((clientY - rect.top) / rect.height) * BLOB_SIZE;
    return { x, y };
  }
  
  function addDragPoint(clientX, clientY) {
    const rect = blobCanvas.getBoundingClientRect();
    const { x, y } = normalizePointerPosition(clientX, clientY, rect);
  
    state.signature.dragPoints.push({
      x,
      y,
      power: 8 + state.signature.intensity / 7
    });
  
    if (state.signature.dragPoints.length > 12) {
      state.signature.dragPoints.shift();
    }
  }
  
  canvasInteractiveZone.addEventListener("pointerdown", (e) => {
    isDrawing = true;
    addDragPoint(e.clientX, e.clientY);
  });
  
  canvasInteractiveZone.addEventListener("pointermove", (e) => {
    if (!isDrawing) return;
    addDragPoint(e.clientX, e.clientY);
  });
  
  window.addEventListener("pointerup", () => {
    isDrawing = false;
  });
  
  canvasInteractiveZone.addEventListener(
    "touchmove",
    (e) => {
      if (!e.touches.length) return;
      e.preventDefault();
    },
    { passive: false }
  );
  
  function renderEntries() {
    const entries = getEntries();
    entriesList.innerHTML = "";
  
    if (!entries.length) {
      entriesList.innerHTML = `
        <div class="glass-card empty-state">
          Aucune émotion enregistrée pour le moment. Commence par créer une entrée dans le journal.
        </div>
      `;
      return;
    }
  
    entries.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "glass-card entry-card";
  
      const preview = document.createElement("div");
      preview.className = "entry-preview";
  
      const canvas = document.createElement("canvas");
      canvas.width = 190;
      canvas.height = 190;
      canvas.className = "entry-canvas";
      preview.appendChild(canvas);
  
      const content = document.createElement("div");
      content.className = "entry-content";
  
      content.innerHTML = `
        <h3>${entry.emotionLabel}</h3>
        <div class="entry-meta">
          <span class="pill soft">${entry.detail}</span>
          <span class="pill soft">${entry.timeOfDay}</span>
          <span class="pill soft">Intensité ${entry.intensity}</span>
          <span class="pill soft">${entry.texture}</span>
        </div>
        <div class="entry-date">${formatDate(entry.createdAt)}</div>
        <div class="entry-notes">${entry.notes || "Aucune note pour cette émotion."}</div>
      `;
  
      card.appendChild(preview);
      card.appendChild(content);
      entriesList.appendChild(card);
  
      const ctx = canvas.getContext("2d");
      drawOrganicBlob(ctx, {
        color: entry.color,
        intensity: entry.intensity,
        dragPoints: entry.dragPoints || [],
        waveform: EMOTIONS[entry.emotionKey].waveform,
        texture: entry.texture || "Brume",
        time: 2.2,
        size: 190
      });
    });
  }
  
  function renderCalendar() {
    const entries = getEntries();
  
    const grouped = entries.reduce((acc, item) => {
      const key = item.createdAt.slice(0, 10);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  
    calendarGrid.innerHTML = "";
  
    const days = Array.from({ length: 35 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (34 - i));
      const key = todayKey(d);
      return { key, count: grouped[key] || 0 };
    });
  
    days.forEach((day) => {
      const cell = document.createElement("div");
      cell.className = "calendar-cell";
  
      const opacity = day.count === 0 ? 0.04 : Math.min(0.16 + day.count * 0.12, 0.7);
      cell.style.background = `rgba(255,255,255,${opacity})`;
      cell.title = `${day.key} · ${day.count} émotion(s)`;
      cell.textContent = day.key.slice(-2);
  
      calendarGrid.appendChild(cell);
    });
  }
  
  function init() {
    baseColorInput.value = state.signature.color;
    colorValue.textContent = state.signature.color.toUpperCase();
    baseIntensity.value = state.signature.intensity;
    baseIntensityValue.textContent = state.signature.intensity;
  
    journalIntensity.value = state.journal.intensity;
    journalIntensityValue.textContent = state.journal.intensity;
  
    renderOnboardingEmotions();
    renderJournalEmotions();
    renderTextureChoices();
    renderTimeChoices();
    renderDetailChoices();
  
    updatePreviewMeta();
    updateJournalMeta();
  
    renderEntries();
    renderCalendar();
  
    animateMainBlob();
    animateJournalBlob();
  }
  
  init();

  function updateIphoneTime(){

    const now = new Date()
    
    let hours = now.getHours()
    let minutes = now.getMinutes()
    
    if(minutes < 10){
    minutes = "0" + minutes
    }
    
    document.getElementById("iphone-time").textContent = hours + ":" + minutes
    
    }
    
    updateIphoneTime()
    
    setInterval(updateIphoneTime,60000)