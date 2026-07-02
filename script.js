const solutionInput = document.getElementById('solutionInput');
const checkBtn = document.getElementById('checkBtn');
const errorMsg = document.getElementById('errorMsg');
const startScreen = document.getElementById('startScreen');
const scanScreen = document.getElementById('scanScreen');
const bridgeScreen = document.getElementById('bridgeScreen');
const successScreen = document.getElementById('successScreen');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const noHint = document.getElementById('noHint');
const photoInput = document.getElementById('photoInput');
const framedCanvas = document.getElementById('framedCanvas');
const teamName = document.getElementById('teamName');
const finishBtn = document.getElementById('finishBtn');
const finishHint = document.getElementById('finishHint');

let uploadedPhoto = null;
let logoImage = null;

function normalize(value) {
  return value.trim().toUpperCase().replace(/Ü/g, 'UE').replace(/\s/g, '');
}

function show(screen) {
  [startScreen, scanScreen, bridgeScreen, successScreen].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

checkBtn.addEventListener('click', checkSolution);
solutionInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') checkSolution();
});

function checkSolution() {
  const value = normalize(solutionInput.value);
  if (value === 'BRUECKE') {
    errorMsg.classList.remove('visible');
    show(scanScreen);
    setTimeout(() => {
      fireConfetti();
      show(bridgeScreen);
    }, 2600);
  } else {
    errorMsg.classList.add('visible');
  }
}

noBtn.addEventListener('click', () => noHint.classList.remove('hidden'));
yesBtn.addEventListener('click', () => {
  show(successScreen);
  fireConfetti();
});

photoInput.addEventListener('change', async () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  uploadedPhoto = await loadImageFromFile(file);
  await drawWinnerImage();
  framedCanvas.classList.remove('hidden');
});

teamName.addEventListener('input', () => {
  if (uploadedPhoto) drawWinnerImage();
});

finishBtn.addEventListener('click', async () => {
  if (!uploadedPhoto) {
    finishHint.textContent = 'Nehmt zuerst ein Siegerfoto auf.';
    finishHint.classList.remove('hidden');
    return;
  }
  await drawWinnerImage();
  downloadCanvas();
  finishHint.textContent = 'Euer Galileo-IP Siegerbild wurde erstellt und gespeichert.';
  finishHint.classList.remove('hidden');
  fireConfetti();
});

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function loadLogo() {
  if (logoImage) return Promise.resolve(logoImage);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      logoImage = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = 'logo.png';
  });
}

function coverImage(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

async function drawWinnerImage() {
  if (!uploadedPhoto) return;

  const canvas = framedCanvas;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const orange = '#f58220';
  const dark = '#222222';
  const gray = '#646b72';
  const light = '#ffffff';
  const team = teamName.value.trim() || 'Team Würzburg';
  const date = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, W, H);

  // subtle dotted Galileo background
  ctx.fillStyle = 'rgba(245,130,32,0.18)';
  for (let yy = 28; yy < H; yy += 34) {
    for (let xx = 28; xx < W; xx += 34) {
      ctx.beginPath();
      ctx.arc(xx, yy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Polaroid card
  const cardX = 64;
  const cardY = 64;
  const cardW = W - 128;
  const cardH = H - 128;
  roundRect(ctx, cardX, cardY, cardW, cardH, 34, light);
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 18;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // photo area
  const photoX = 104;
  const photoY = 190;
  const photoW = W - 208;
  const photoH = 760;
  ctx.save();
  roundedClip(ctx, photoX, photoY, photoW, photoH, 24);
  coverImage(ctx, uploadedPhoto, photoX, photoY, photoW, photoH);
  ctx.restore();

  // orange separator
  ctx.fillStyle = orange;
  ctx.fillRect(104, 990, W - 208, 8);

  // logo
  const logo = await loadLogo();
  if (logo) {
    const logoW = 145;
    const logoH = logo.height * (logoW / logo.width);
    ctx.drawImage(logo, 104, 96, logoW, logoH);
  }

  // top text
  ctx.fillStyle = gray;
  ctx.font = '700 29px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Würzburg Geocaching', W - 104, 115);
  ctx.fillStyle = orange;
  ctx.font = '800 31px Arial, sans-serif';
  ctx.fillText('Challenge geschafft', W - 104, 154);

  // bottom text
  ctx.textAlign = 'left';
  ctx.fillStyle = dark;
  ctx.font = '900 52px Arial, sans-serif';
  ctx.fillText(team, 104, 1076);

  ctx.fillStyle = gray;
  ctx.font = '600 30px Arial, sans-serif';
  ctx.fillText('Mission erfolgreich an der Alten Mainbrücke', 104, 1125);

  ctx.fillStyle = orange;
  ctx.font = '800 28px Arial, sans-serif';
  ctx.fillText(`Galileo-IP · ${date}`, 104, 1182);

  // small surveying line element
  ctx.strokeStyle = orange;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(W - 250, 1167);
  ctx.lineTo(W - 104, 1167);
  ctx.stroke();
  ctx.fillStyle = orange;
  ctx.beginPath();
  ctx.arc(W - 250, 1167, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W - 104, 1167, 9, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fillStyle) ctx.fillStyle = fillStyle;
}

function roundedClip(ctx, x, y, w, h, r) {
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
}

function downloadCanvas() {
  const link = document.createElement('a');
  const safeTeam = (teamName.value.trim() || 'Team').replace(/[^a-z0-9äöüß_-]+/gi, '_');
  link.download = `Galileo-IP_Geocaching_${safeTeam}.png`;
  link.href = framedCanvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function fireConfetti() {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const pieces = [];
  const colors = ['#f58220', '#646b72', '#222222', '#ffffff'];
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * .4,
      r: 4 + Math.random() * 7,
      c: colors[Math.floor(Math.random() * colors.length)],
      vx: -2 + Math.random() * 4,
      vy: 3 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: -.15 + Math.random() * .3
    });
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * .65);
      ctx.restore();
    });
    frame++;
    if (frame < 150) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}
