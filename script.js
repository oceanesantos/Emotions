/* ========================= */
/* JS COMPLET */
/* ========================= */

const EMOTIONS = {
  joie:{
    label:"Joie",
    color:"#FDBA74"
  },

  tristesse:{
    label:"Tristesse",
    color:"#8BB8FF"
  },

  peur:{
    label:"Peur",
    color:"#B59CFF"
  },

  colere:{
    label:"Colère",
    color:"#FF7E8A"
  }
};

const EXPECTATIONS = [

  {
    title:"Mieux me comprendre",
    feedback:"Très bien. Nous allons explorer tes émotions ensemble."
  },

  {
    title:"M’apaiser",
    feedback:"Prends ce temps pour toi."
  },

  {
    title:"Explorer mes émotions",
    feedback:"Exprime-toi librement."
  }

];

const state = {

  currentMode:"draw",

  brush:{
    type:"soft",
    size:12
  },

  signature:{
    emotion:"tristesse",
    color:"#8BB8FF",
    intensity:50,
    dragPoints:[]
  }

};

/* ONBOARDING */

const expectationsContainer =
document.getElementById("expectations");

EXPECTATIONS.forEach(item=>{

  const card = document.createElement("button");

  card.className = "choice-card";

  card.innerHTML = `
    <h3>${item.title}</h3>
  `;

  card.onclick = ()=>{

    document.querySelectorAll(".choice-card")
    .forEach(el=>el.classList.remove("active"));

    card.classList.add("active");

    document.getElementById("feedback-card")
    .innerHTML = item.feedback;

  };

  expectationsContainer.appendChild(card);

});

function switchStep(step){

  document.querySelectorAll(".onboarding-step")
  .forEach(el=>el.classList.remove("active"));

  document
  .querySelector(`.onboarding-step[data-step="${step}"]`)
  .classList.add("active");

}

document.getElementById("to-step-2")
.onclick = ()=> switchStep(2);

document.getElementById("to-step-3")
.onclick = ()=> switchStep(3);

document.getElementById("skip-step")
.onclick = ()=> switchStep(3);

document.getElementById("start-app")
.onclick = ()=>{

  document.getElementById("view-onboarding")
  .classList.remove("active");

  document.getElementById("view-app")
  .classList.add("active");

};

/* MODES */

document.querySelectorAll(".mode-btn")
.forEach(btn=>{

  btn.onclick = ()=>{

    document.querySelectorAll(".mode-btn")
    .forEach(el=>el.classList.remove("active"));

    btn.classList.add("active");

    state.currentMode = btn.dataset.mode;

  };

});

/* EMOTIONS */

const emotionChoices =
document.getElementById("emotion-choices");

Object.entries(EMOTIONS)
.forEach(([key,emotion])=>{

  const chip = document.createElement("button");

  chip.className = "chip";

  chip.textContent = emotion.label;

  chip.onclick = ()=>{

    state.signature.emotion = key;
    state.signature.color = emotion.color;

    document.getElementById("color-picker")
    .value = emotion.color;

    document.querySelectorAll(".chip")
    .forEach(el=>el.classList.remove("active"));

    chip.classList.add("active");

  };

  emotionChoices.appendChild(chip);

});

/* CANVAS */

const canvas =
document.getElementById("emotion-canvas");

const ctx =
canvas.getContext("2d");

let drawing = false;
let time = 0;

/* FEUTRES */

document.querySelectorAll(".tool-btn")
.forEach(btn=>{

  btn.onclick = ()=>{

    document.querySelectorAll(".tool-btn")
    .forEach(el=>el.classList.remove("active"));

    btn.classList.add("active");

    state.brush.type = btn.dataset.brush;

  };

});

document.getElementById("brush-size")
.addEventListener("input",(e)=>{

  state.brush.size = Number(e.target.value);

});

canvas.addEventListener("pointerdown",startDraw);
canvas.addEventListener("pointermove",draw);
window.addEventListener("pointerup",endDraw);

function startDraw(e){

  if(state.currentMode !== "draw") return;

  drawing = true;

  ctx.beginPath();

  ctx.moveTo(e.offsetX,e.offsetY);

}

function draw(e){

  if(state.currentMode === "modulate"){

    const rect = canvas.getBoundingClientRect();

    const x =
    (e.clientX - rect.left) * (520/rect.width);

    const y =
    (e.clientY - rect.top) * (520/rect.height);

    state.signature.dragPoints.push({
      x,
      y,
      power:20
    });

    if(state.signature.dragPoints.length > 20){

      state.signature.dragPoints.shift();

    }

    return;

  }

  if(!drawing) return;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = state.brush.size;

  if(state.brush.type === "soft"){

    ctx.globalAlpha = .35;
    ctx.strokeStyle = state.signature.color;
    ctx.shadowBlur = 12;

  }

  if(state.brush.type === "marker"){

    ctx.globalAlpha = .9;
    ctx.strokeStyle = state.signature.color;
    ctx.shadowBlur = 0;

  }

  if(state.brush.type === "glow"){

    ctx.globalAlpha = .25;
    ctx.strokeStyle = state.signature.color;
    ctx.shadowBlur = 28;

  }

  if(state.brush.type === "eraser"){

    ctx.globalCompositeOperation = "destination-out";

  }else{

    ctx.globalCompositeOperation = "source-over";

  }

  if(state.brush.type === "spray"){

    for(let i=0;i<12;i++){

      ctx.beginPath();

      ctx.arc(
        e.offsetX + Math.random()*20-10,
        e.offsetY + Math.random()*20-10,
        Math.random()*3,
        0,
        Math.PI*2
      );

      ctx.fillStyle = state.signature.color;

      ctx.fill();

    }

    return;

  }

  ctx.lineTo(e.offsetX,e.offsetY);

  ctx.stroke();

}

function endDraw(){

  drawing = false;

  ctx.beginPath();

}

/* BLOB */

function drawBlob(){

  if(state.currentMode !== "modulate") return;

  time += .03;

  ctx.clearRect(0,0,520,520);

  const center = 260;

  ctx.beginPath();

  for(let i=0;i<120;i++){

    const angle = (Math.PI*2/120)*i;

    let radius =
    120
    + Math.sin(angle*3+time)*20
    + Math.cos(angle*5+time)*12;

    state.signature.dragPoints.forEach(point=>{

      const dx = point.x - center;
      const dy = point.y - center;

      radius += Math.sin(dx*.01 + dy*.01) * 2;

    });

    const x = center + Math.cos(angle)*radius;
    const y = center + Math.sin(angle)*radius;

    if(i===0){
      ctx.moveTo(x,y);
    }else{
      ctx.lineTo(x,y);
    }

  }

  ctx.closePath();

  const gradient =
  ctx.createRadialGradient(
    center,
    center,
    40,
    center,
    center,
    180
  );

  gradient.addColorStop(0,state.signature.color);
  gradient.addColorStop(1,"transparent");

  ctx.fillStyle = gradient;

  ctx.shadowBlur = 40;
  ctx.shadowColor = state.signature.color;

  ctx.fill();

}

function animate(){

  if(state.currentMode === "modulate"){

    drawBlob();

  }

  requestAnimationFrame(animate);

}

animate();

/* SAVE */

document.getElementById("save-entry")
.onclick = ()=>{

  const image =
  canvas.toDataURL();

  const entries =
  JSON.parse(localStorage.getItem("emotionEntries") || "[]");

  entries.unshift({

    image,
    emotion:state.signature.emotion,
    notes:document.getElementById("journal-notes").value,
    date:new Date().toLocaleDateString("fr-FR")

  });

  localStorage.setItem(
    "emotionEntries",
    JSON.stringify(entries)
  );

  renderEntries();
  renderChart();

  document
  .getElementById("gallery-dot")
  .classList.add("active");

};

/* GALLERY */

function renderEntries(){

  const list =
  document.getElementById("entries-list");

  list.innerHTML = "";

  const entries =
  JSON.parse(localStorage.getItem("emotionEntries") || "[]");

  entries.forEach(entry=>{

    const card =
    document.createElement("div");

    card.className =
    "glass-card entry-card";

    card.innerHTML = `
      <div class="entry-preview">
        <img src="${entry.image}">
      </div>

      <div>
        <h3>${entry.emotion}</h3>
        <p>${entry.notes || "Aucune note."}</p>
        <small>${entry.date}</small>
      </div>
    `;

    list.appendChild(card);

  });

}

/* CHART */

function renderChart(){

  const chart =
  document.getElementById("chart-bars");

  chart.innerHTML = "";

  for(let i=0;i<7;i++){

    const bar =
    document.createElement("div");

    bar.className = "bar";

    bar.style.height =
    Math.random()*100 + "%";

    chart.appendChild(bar);

  }

}

renderEntries();
renderChart();

/* NAVIGATION */

document.querySelectorAll(".nav-item")
.forEach(btn=>{

  btn.onclick = ()=>{

    document.querySelectorAll(".nav-item")
    .forEach(el=>el.classList.remove("active"));

    btn.classList.add("active");

    const target = btn.dataset.screen;

    document.querySelectorAll(".screen")
    .forEach(el=>el.classList.remove("active"));

    document
    .getElementById(`screen-${target}`)
    .classList.add("active");

    if(target === "gallery"){

      document
      .getElementById("gallery-dot")
      .classList.remove("active");

    }

  };

});