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
const photoPreview = document.getElementById('photoPreview');
const finishBtn = document.getElementById('finishBtn');
const finishHint = document.getElementById('finishHint');

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

photoInput.addEventListener('change', () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  photoPreview.src = URL.createObjectURL(file);
  photoPreview.classList.remove('hidden');
});

finishBtn.addEventListener('click', () => {
  finishHint.classList.remove('hidden');
  fireConfetti();
});

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
