/* ========================= */
/* ANIMA — SCRIPT COMPLET    */
/* ========================= */

/* ─── DONNÉES ─── */

const EMOTIONS = {
  joie:      { label:"Joie",       color:"#FDBA74" },
  tristesse: { label:"Tristesse",  color:"#8BB8FF" },
  peur:      { label:"Peur",       color:"#B59CFF" },
  colere:    { label:"Colère",     color:"#FF7E8A" }
};

const EXPECTATIONS = [
  { title:"Mieux me comprendre",    desc:"Explorer ce qui se passe en moi.",   feedback:"Très bien. Nous allons explorer tes émotions ensemble." },
  { title:"M'apaiser",              desc:"Trouver un espace calme pour moi.",   feedback:"Prends ce temps pour toi, sans pression." },
  { title:"Explorer mes émotions",  desc:"Donner une forme à ce que je ressens.", feedback:"Exprime-toi librement — il n'y a pas de bonne réponse." }
];

const PALETTE_COLORS = [
  '#c026d3','#7c3aed','#0ea5e9','#06b6d4',
  '#10b981','#f59e0b','#ef4444','#ec4899',
  '#a855f7','#fbbf24','#6366f1','#f97316'
];

/* ─── ÉTAT GLOBAL ─── */

const state = {
  // Onboarding
  customEmotion: {
    name: '',
    desc: '',
    colors: [],
  },
  // App
  currentMode: 'draw',
  brush: { type: 'soft', size: 12 },
  signature: {
    emotion: 'tristesse',
    color: '#8BB8FF',
    intensity: 50,
    dragPoints: []
  }
};

/* ═══════════════════════════════════════
   ONBOARDING
═══════════════════════════════════════ */

/* Navigation entre steps */
function switchStep(n) {
  document.querySelectorAll('.onboarding-step').forEach(el => {
    el.classList.remove('active');
  });
  const target = document.querySelector(`.onboarding-step[data-step="${n}"]`);
  if (!target) return;
  // Force reflow pour animation
  target.style.display = 'block';
  requestAnimationFrame(() => { target.classList.add('active'); });
}

// Boutons retour
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.onclick = () => switchStep(Number(btn.dataset.back));
});

/* ── STEP 0 : SPLASH ── */
document.getElementById('to-step-1').onclick = () => switchStep(1);
document.getElementById('splash-login').onclick = () => {
  // Si déjà une émotion en localStorage, aller direct à l'app
  launchApp();
};

/* ── STEP 1 : INTENTION ── */
const expectationsContainer = document.getElementById('expectations');
EXPECTATIONS.forEach(item => {
  const card = document.createElement('button');
  card.className = 'choice-card';
  card.innerHTML = `<h3>${item.title}</h3><p>${item.desc}</p>`;
  card.onclick = () => {
    document.querySelectorAll('.choice-card').forEach(el => el.classList.remove('active'));
    card.classList.add('active');
    const fb = document.getElementById('feedback-card');
    fb.style.opacity = '0';
    setTimeout(() => {
      fb.innerHTML = item.feedback;
      fb.style.opacity = '1';
    }, 150);
  };
  expectationsContainer.appendChild(card);
});

document.getElementById('to-step-2').onclick = () => switchStep(2);

/* ── STEP 2 : COULEURS & NOM ── */

// Palette de couleurs
const obPalette = document.getElementById('ob-palette');
PALETTE_COLORS.forEach(c => {
  const sw = document.createElement('div');
  sw.className = 'pal-swatch';
  sw.style.background = c;
  sw.title = c;
  sw.onclick = () => toggleCustomColor(c);
  obPalette.appendChild(sw);
});
// Couleur libre
const customSwatch = document.createElement('div');
customSwatch.className = 'pal-swatch pal-custom';
const customInput = document.createElement('input');
customInput.type = 'color';
customInput.value = '#ffffff';
customInput.oninput = e => toggleCustomColor(e.target.value, true);
customSwatch.appendChild(customInput);
obPalette.appendChild(customSwatch);

function toggleCustomColor(c, force = false) {
  if (!force && state.customEmotion.colors.includes(c)) {
    state.customEmotion.colors = state.customEmotion.colors.filter(x => x !== c);
  } else {
    if (state.customEmotion.colors.length >= 3) state.customEmotion.colors.shift();
    if (!state.customEmotion.colors.includes(c)) state.customEmotion.colors.push(c);
  }
  renderSelectedColors();
  updateObPreview();
  syncDrawColors();
}

function renderSelectedColors() {
  const el = document.getElementById('ob-selected-colors');
  if (!state.customEmotion.colors.length) {
    el.innerHTML = '<span class="no-color-hint">Aucune couleur choisie</span>';
    // reset swatch active states
    document.querySelectorAll('.pal-swatch').forEach(sw => {
      sw.classList.remove('active');
    });
    return;
  }
  el.innerHTML = '';
  state.customEmotion.colors.forEach((c, i) => {
    const chip = document.createElement('div');
    chip.className = 'sel-chip';
    chip.style.background = c;
    chip.title = 'Retirer';
    chip.onclick = () => {
      state.customEmotion.colors.splice(i, 1);
      renderSelectedColors();
      updateObPreview();
    };
    el.appendChild(chip);
  });
  // sync swatch active
  document.querySelectorAll('.pal-swatch:not(.pal-custom)').forEach(sw => {
    sw.classList.toggle('active', state.customEmotion.colors.includes(sw.style.background) ||
      state.customEmotion.colors.includes(rgbToHex(sw.style.background)));
  });
}

function rgbToHex(rgb) {
  // Simple converter for rgb() strings
  const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!m) return rgb;
  return '#' + [m[1],m[2],m[3]].map(n => (+n).toString(16).padStart(2,'0')).join('');
}

/* Live preview canvas – step 2 */
const obPreviewCanvas = document.getElementById('ob-preview-canvas');
const obPreviewCtx = obPreviewCanvas.getContext('2d');
let obPreviewT = 0;
let obPreviewAnim;

function updateObPreview() {
  state.customEmotion.name = document.getElementById('custom-emo-name').value;
  state.customEmotion.desc = document.getElementById('custom-emo-desc').value;
  document.getElementById('ob-preview-label').textContent = state.customEmotion.name || '—';
}

document.getElementById('custom-emo-name').oninput = updateObPreview;
document.getElementById('custom-emo-desc').oninput = updateObPreview;

function drawPreviewOrb(ctx, w, h, t, colors) {
  ctx.clearRect(0, 0, w, h);
  const cols = colors.length ? colors : ['#c026d3', '#7c3aed'];
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) * 0.35;
  for (let i = 0; i < cols.length + 2; i++) {
    const angle = t * 0.008 + i * (Math.PI * 2 / (cols.length + 2));
    const ox = Math.sin(angle) * r * 0.28;
    const oy = Math.cos(angle * .8) * r * 0.28;
    const pr = r * (0.55 + Math.sin(t * 0.01 + i) * 0.18);
    const col = cols[i % cols.length];
    const grad = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, pr);
    grad.addColorStop(0, col + '99');
    grad.addColorStop(1, col + '00');
    ctx.beginPath();
    ctx.arc(cx + ox, cy + oy, pr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

function startObPreviewAnim() {
  if (obPreviewAnim) cancelAnimationFrame(obPreviewAnim);
  obPreviewCanvas.width = obPreviewCanvas.offsetWidth || 280;
  function frame() {
    obPreviewT++;
    drawPreviewOrb(obPreviewCtx, obPreviewCanvas.width, obPreviewCanvas.height, obPreviewT, state.customEmotion.colors);
    obPreviewAnim = requestAnimationFrame(frame);
  }
  frame();
}

document.getElementById('to-step-3').onclick = () => {
  stopObPreviewAnim();
  syncDrawColors();
  switchStep(3);
  initObDraw();
};

function stopObPreviewAnim() {
  if (obPreviewAnim) { cancelAnimationFrame(obPreviewAnim); obPreviewAnim = null; }
}

// Lance l'animation quand on arrive sur step 2
const origSwitchStep = switchStep;
// Patch: on surveille l'activation de step 2
const observer = new MutationObserver(() => {
  const step2 = document.querySelector('.onboarding-step[data-step="2"]');
  if (step2 && step2.classList.contains('active')) {
    startObPreviewAnim();
  }
});
observer.observe(document.getElementById('view-onboarding'), { subtree: true, attributeFilter: ['class'] });

/* ── STEP 3 : DESSIN ── */
let obDrawCtx, obDrawing = false, obBrushType = 'soft', obBrushSize = 12, obDrawColor = '#c026d3';

function syncDrawColors() {
  const strip = document.getElementById('ob-draw-colors');
  strip.innerHTML = '';
  const cols = state.customEmotion.colors.length
    ? state.customEmotion.colors
    : PALETTE_COLORS.slice(0, 6);
  obDrawColor = cols[0];
  cols.forEach((c, i) => {
    const sw = document.createElement('div');
    sw.className = 'dc-swatch' + (i === 0 ? ' active' : '');
    sw.style.background = c;
    sw.onclick = () => {
      obDrawColor = c;
      document.querySelectorAll('.dc-swatch').forEach(x => x.classList.remove('active'));
      sw.classList.add('active');
    };
    strip.appendChild(sw);
  });
}

function initObDraw() {
  const canvas = document.getElementById('ob-draw-canvas');
  const wrap = canvas.parentElement;
  canvas.width = wrap.offsetWidth || 380;
  canvas.height = 280;
  obDrawCtx = canvas.getContext('2d');
  obDrawCtx.fillStyle = 'rgba(5,6,10,1)';
  obDrawCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvas.onpointerdown = e => { obDrawing = true; obDrawStart(e); };
  canvas.onpointermove = e => { if (obDrawing) obDrawMove(e); };
  window.onpointerup = e => { obDrawing = false; obDrawCtx && obDrawCtx.beginPath(); endDraw(e); };
}

function obDrawStart(e) {
  obDrawCtx.beginPath();
  obDrawCtx.moveTo(e.offsetX, e.offsetY);
}

function obDrawMove(e) {
  obDrawCtx.lineCap = 'round';
  obDrawCtx.lineJoin = 'round';
  obDrawCtx.lineWidth = obBrushSize;
  obDrawCtx.shadowColor = obDrawColor;

  if (obBrushType === 'eraser') {
    obDrawCtx.globalCompositeOperation = 'destination-out';
    obDrawCtx.lineWidth = obBrushSize * 2;
    obDrawCtx.lineTo(e.offsetX, e.offsetY);
    obDrawCtx.stroke();
    obDrawCtx.globalCompositeOperation = 'source-over';
    return;
  }
  obDrawCtx.globalCompositeOperation = 'source-over';

  if (obBrushType === 'soft') {
    obDrawCtx.globalAlpha = .35;
    obDrawCtx.strokeStyle = obDrawColor;
    obDrawCtx.shadowBlur = 14;
  } else if (obBrushType === 'marker') {
    obDrawCtx.globalAlpha = .9;
    obDrawCtx.strokeStyle = obDrawColor;
    obDrawCtx.shadowBlur = 0;
  } else if (obBrushType === 'glow') {
    obDrawCtx.globalAlpha = .22;
    obDrawCtx.strokeStyle = obDrawColor;
    obDrawCtx.shadowBlur = 30;
  } else if (obBrushType === 'spray') {
    for (let i = 0; i < 14; i++) {
      obDrawCtx.beginPath();
      obDrawCtx.arc(
        e.offsetX + Math.random() * 24 - 12,
        e.offsetY + Math.random() * 24 - 12,
        Math.random() * 2.5, 0, Math.PI * 2
      );
      obDrawCtx.fillStyle = obDrawColor;
      obDrawCtx.globalAlpha = .7;
      obDrawCtx.shadowBlur = 0;
      obDrawCtx.fill();
    }
    return;
  }
  obDrawCtx.lineTo(e.offsetX, e.offsetY);
  obDrawCtx.stroke();
}

// Toolbar outils step 3
document.getElementById('ob-draw-toolbar').querySelectorAll('.tool-btn').forEach(btn => {
  btn.onclick = () => {
    document.getElementById('ob-draw-toolbar').querySelectorAll('.tool-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    obBrushType = btn.dataset.brush;
  };
});
document.getElementById('ob-brush-size').oninput = e => { obBrushSize = +e.target.value; };

document.getElementById('ob-skip-draw').onclick = () => {
  showFinalStep();
  switchStep(4);
};
document.getElementById('to-step-4').onclick = () => {
  showFinalStep();
  switchStep(4);
};

/* ── STEP 4 : FINAL ── */
let finalOrbAnim;

function showFinalStep() {
  const name = state.customEmotion.name || 'Sans nom';
  const desc = state.customEmotion.desc || 'Une émotion bien à toi.';
  document.getElementById('final-emo-name').textContent = name;
  document.getElementById('final-emo-desc').textContent = desc;

  // Orbe final
  const canvas = document.getElementById('final-orb-canvas');
  canvas.width = 200; canvas.height = 200;
  const ctx = canvas.getContext('2d');
  let t = 0;
  if (finalOrbAnim) cancelAnimationFrame(finalOrbAnim);
  function frame() {
    t++;
    drawPreviewOrb(ctx, 200, 200, t, state.customEmotion.colors);
    finalOrbAnim = requestAnimationFrame(frame);
  }
  frame();

  // Enregistre l'émotion personnalisée dans les EMOTIONS disponibles
  if (state.customEmotion.name) {
    const key = 'custom_' + Date.now();
    EMOTIONS[key] = {
      label: state.customEmotion.name,
      color: state.customEmotion.colors[0] || '#c026d3',
      custom: true
    };
  }
}

/* ── LANCEMENT APP ── */
document.getElementById('start-app').onclick = launchApp;

function launchApp() {
  if (finalOrbAnim) cancelAnimationFrame(finalOrbAnim);
  stopObPreviewAnim();
  observer.disconnect();

  document.getElementById('view-onboarding').classList.remove('active');
  document.getElementById('view-app').classList.add('active');

  // Injecte l'émotion custom dans la nav créer
  buildEmotionChips();
  // Met à jour le profil
  updateProfile();
  // Re-render gallery
  renderEntries();
  renderChart();
}

/* ═══════════════════════════════════════
   APP
═══════════════════════════════════════ */

/* ── MODES ── */
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.mode-btn').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    state.currentMode = btn.dataset.mode;
  };
});

/* ── ÉMOTIONS ── */
function buildEmotionChips() {
  const container = document.getElementById('emotion-choices');
  container.innerHTML = '';
  Object.entries(EMOTIONS).forEach(([key, emotion]) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = emotion.label;
    if (emotion.custom) {
      chip.style.borderLeft = `3px solid ${emotion.color}`;
    }
    chip.onclick = () => {
      state.signature.emotion = key;
      state.signature.color = emotion.color;
      document.getElementById('color-picker').value = emotion.color;
      document.querySelectorAll('.chip').forEach(el => el.classList.remove('active'));
      chip.classList.add('active');
    };
    container.appendChild(chip);
  });
  // Sélectionne la première par défaut
  container.querySelector('.chip')?.click();
}

/* ── CANVAS PRINCIPAL ── */
const canvas = document.getElementById('emotion-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let time = 0;

document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tool-btn').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    state.brush.type = btn.dataset.brush;
  };
});

document.getElementById('brush-size').oninput = e => { state.brush.size = +e.target.value; };

canvas.addEventListener('pointerdown', startDraw);
canvas.addEventListener('pointermove', drawOnCanvas);

function startDraw(e) {
  if (state.currentMode !== 'draw') return;
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function drawOnCanvas(e) {
  if (state.currentMode === 'modulate') {
    const rect = canvas.getBoundingClientRect();
    state.signature.dragPoints.push({
      x: (e.clientX - rect.left) * (520 / rect.width),
      y: (e.clientY - rect.top) * (520 / rect.height),
      power: 20
    });
    if (state.signature.dragPoints.length > 20) state.signature.dragPoints.shift();
    return;
  }
  if (!drawing) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = state.brush.size;
  ctx.shadowColor = state.signature.color;

  if (state.brush.type === 'soft') { ctx.globalAlpha = .35; ctx.strokeStyle = state.signature.color; ctx.shadowBlur = 12; }
  else if (state.brush.type === 'marker') { ctx.globalAlpha = .9; ctx.strokeStyle = state.signature.color; ctx.shadowBlur = 0; }
  else if (state.brush.type === 'glow') { ctx.globalAlpha = .25; ctx.strokeStyle = state.signature.color; ctx.shadowBlur = 28; }
  else if (state.brush.type === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; return; }
  else if (state.brush.type === 'spray') {
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(e.offsetX + Math.random()*20-10, e.offsetY + Math.random()*20-10, Math.random()*3, 0, Math.PI*2);
      ctx.fillStyle = state.signature.color;
      ctx.globalAlpha = .7;
      ctx.fill();
    }
    return;
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function endDraw() { drawing = false; ctx.beginPath(); }
window.addEventListener('pointerup', endDraw);

/* BLOB MODULÉ */
function drawBlob() {
  if (state.currentMode !== 'modulate') return;
  time += .03;
  ctx.clearRect(0, 0, 520, 520);
  const center = 260;
  ctx.beginPath();
  for (let i = 0; i < 120; i++) {
    const angle = (Math.PI * 2 / 120) * i;
    let radius = 120 + Math.sin(angle*3+time)*20 + Math.cos(angle*5+time)*12;
    state.signature.dragPoints.forEach(pt => {
      radius += Math.sin((pt.x-center)*.01 + (pt.y-center)*.01) * 2;
    });
    const x = center + Math.cos(angle)*radius;
    const y = center + Math.sin(angle)*radius;
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.closePath();
  const gradient = ctx.createRadialGradient(center,center,40,center,center,180);
  gradient.addColorStop(0, state.signature.color);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.shadowBlur = 40;
  ctx.shadowColor = state.signature.color;
  ctx.fill();
}

function animate() { drawBlob(); requestAnimationFrame(animate); }
animate();

/* ── SAVE ── */
document.getElementById('save-entry').onclick = () => {
  const image = canvas.toDataURL();
  const entries = JSON.parse(localStorage.getItem('emotionEntries') || '[]');
  entries.unshift({
    image,
    emotion: EMOTIONS[state.signature.emotion]?.label || state.signature.emotion,
    color: state.signature.color,
    notes: document.getElementById('journal-notes').value,
    date: new Date().toLocaleDateString('fr-FR')
  });
  localStorage.setItem('emotionEntries', JSON.stringify(entries));
  renderEntries();
  renderChart();
  document.getElementById('gallery-dot').classList.add('active');
  // Flash save feedback
  const btn = document.getElementById('save-entry');
  const orig = btn.textContent;
  btn.textContent = '✓ Sauvegardé';
  setTimeout(() => { btn.textContent = orig; }, 1600);
};

/* ── GALLERY ── */
function renderEntries() {
  const list = document.getElementById('entries-list');
  list.innerHTML = '';
  const entries = JSON.parse(localStorage.getItem('emotionEntries') || '[]');
  if (!entries.length) {
    list.innerHTML = '<p style="color:rgba(255,255,255,.2);font-size:.85rem;text-align:center;padding:40px 0">Aucune création encore.<br>Commence à dessiner !</p>';
    return;
  }
  entries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'glass-card entry-card';
    card.innerHTML = `
      <div class="entry-preview">
        <img src="${entry.image}" alt="${entry.emotion}">
      </div>
      <div class="entry-info">
        <h3 style="color:${entry.color || '#fff'}">${entry.emotion}</h3>
        <p>${entry.notes || 'Aucune note.'}</p>
        <small>${entry.date}</small>
      </div>
    `;
    list.appendChild(card);
  });
}

/* ── CHART ── */
function renderChart() {
  const chart = document.getElementById('chart-bars');
  chart.innerHTML = '';
  const emotions = Object.values(EMOTIONS);
  for (let i = 0; i < 7; i++) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = (30 + Math.random() * 70) + '%';
    const emo = emotions[i % emotions.length];
    bar.style.background = `linear-gradient(180deg, ${emo.color}, ${emo.color}44)`;
    bar.style.borderRadius = '12px 12px 6px 6px';
    chart.appendChild(bar);
  }
}

/* ── PROFIL ── */
function updateProfile() {
  const name = state.customEmotion.name;
  if (name) {
    document.getElementById('profile-emo-name').textContent = name;
    document.getElementById('profile-emo-desc').textContent = state.customEmotion.desc || 'Une émotion bien à toi.';
  }
  // Orbe profil
  const profileCanvas = document.createElement('canvas');
  profileCanvas.width = 80; profileCanvas.height = 80;
  const pCtx = profileCanvas.getContext('2d');
  let pT = 0;
  const profileAvatar = document.getElementById('profile-avatar');
  profileAvatar.innerHTML = '';
  profileAvatar.appendChild(profileCanvas);
  function pFrame() {
    pT++;
    drawPreviewOrb(pCtx, 80, 80, pT, state.customEmotion.colors.length ? state.customEmotion.colors : ['#c026d3','#7c3aed']);
    requestAnimationFrame(pFrame);
  }
  pFrame();
}

/* ── NAVIGATION ── */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.screen;
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(`screen-${target}`).classList.add('active');
    if (target === 'gallery') {
      document.getElementById('gallery-dot').classList.remove('active');
    }
  };
});

/* ── COLOR PICKER ── */
document.getElementById('color-picker').oninput = e => {
  state.signature.color = e.target.value;
};

/* ── INIT ── */
renderEntries();
renderChart();
