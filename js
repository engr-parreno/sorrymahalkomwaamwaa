// ─────────────────────────────────────────
//  CANVAS SETUP
// ─────────────────────────────────────────
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
let W = 0, H = 0, t = 0;
let scrollY    = 0;
let lastScroll = 0;
let lastTS     = 0;

function resize() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

// ─────────────────────────────────────────
//  CURSOR
// ─────────────────────────────────────────
const cur = document.getElementById('cursor');
let mx = W / 2, my = H / 2;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});

// ─────────────────────────────────────────
//  TOOLTIP
// ─────────────────────────────────────────
const tipEl   = document.getElementById('tip');
let   tipTimer = null;

function showTip(text, x, y) {
  tipEl.textContent   = text;
  tipEl.style.left    = (x + 16) + 'px';
  tipEl.style.top     = (y - 10) + 'px';
  tipEl.style.opacity = '1';
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => { tipEl.style.opacity = '0'; }, 1800);
}

// ─────────────────────────────────────────
//  STARS
// ─────────────────────────────────────────
const STAR_COLORS = ['#ffffff', '#e9d5ff', '#fde68a', '#f9a8d4', '#c7d2fe', '#a5f3fc'];

const stars = Array.from({ length: 180 }, () => ({
  x:     Math.random(),
  y:     Math.random() * 0.72,
  r:     Math.random() * 1.8 + 0.2,
  base:  Math.random() * 0.55 + 0.15,
  spd:   Math.random() * 2.2 + 0.6,
  phase: Math.random() * Math.PI * 2,
  depth: Math.random() * 0.8 + 0.2,
  color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  burst: 0,
  held:  false,
  heldT: 0,
}));

const starMessages = [
  'make a wish 🌠',
  "that one's yours 💜",
  'I see you ✨',
  'still shining for you',
  '+ one more star ⭐',
];

// ─────────────────────────────────────────
//  SHOOTING STARS
// ─────────────────────────────────────────
let shoots = [];

function spawnShoot() {
  shoots.push({
    x:   Math.random() * 0.6 + 0.1,
    y:   Math.random() * 0.3,
    vx:  (Math.random() * 0.009 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
    vy:  Math.random() * 0.005 + 0.003,
    len: Math.random() * 0.12 + 0.06,
    life: 1,
  });
}

(function scheduleShoot() {
  setTimeout(() => { spawnShoot(); scheduleShoot(); }, 4000 + Math.random() * 5000);
})();

// ─────────────────────────────────────────
//  CONSTELLATION LINES
// ─────────────────────────────────────────
let constellLines = [];

// ─────────────────────────────────────────
//  MOUSE TRAIL
// ─────────────────────────────────────────
const trail = [];
document.addEventListener('mousemove', e => {
  trail.push({ x: e.clientX, y: e.clientY });
  if (trail.length > 20) trail.shift();
});

// ─────────────────────────────────────────
//  RIPPLES
// ─────────────────────────────────────────
let ripples = [];

// ─────────────────────────────────────────
//  LILY DEFINITIONS & STATE
// ─────────────────────────────────────────
const LILY_DEFS = [
  { px: 0.34, basePy: 0.090, size: 0.068, hue: 340, alpha: 0.90, spinSpeed: 0.038, swayAmp: 0.018, swayOff: 0.0 },
  { px: 0.50, basePy: 0.130, size: 0.092, hue: 335, alpha: 1.00, spinSpeed: 0.032, swayAmp: 0.022, swayOff: 1.8 },
  { px: 0.66, basePy: 0.087, size: 0.060, hue: 345, alpha: 0.86, spinSpeed: 0.044, swayAmp: 0.016, swayOff: 3.4 },
];

const lilyState = LILY_DEFS.map(() => ({ bloom: 0, spin: 0 }));

// ─────────────────────────────────────────
//  FLOATING PETALS
// ─────────────────────────────────────────
const petals = Array.from({ length: 18 }, () => ({
  x:     Math.random(),
  y:     Math.random(),
  r:     Math.random() * 4 + 2,
  vx:    (Math.random() - 0.5) * 0.0004,
  vy:    Math.random() * 0.0006 + 0.0003,
  rot:   Math.random() * Math.PI * 2,
  vrot:  (Math.random() - 0.5) * 0.03,
  alpha: Math.random() * 0.5 + 0.2,
  hue:   Math.random() < 0.6 ? 330 + Math.random() * 20 : 270 + Math.random() * 30,
}));

// ─────────────────────────────────────────
//  DRAW: PETAL PARTICLE
// ─────────────────────────────────────────
function drawPetal(x, y, r, rot, alpha, hue) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, `hsla(${hue}, 85%, 85%, 1)`);
  g.addColorStop(1, `hsla(${hue}, 80%, 75%, 0)`);
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────
//  DRAW: LILY PAD
// ─────────────────────────────────────────
function drawPad(x, y, rx, ry, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = 0.52;
  const g = ctx.createRadialGradient(-rx * 0.2, -ry * 0.2, 0, 0, 0, Math.max(rx, ry));
  g.addColorStop(0, '#4a7c20');
  g.addColorStop(1, '#1a3a0a');
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0.2, Math.PI * 2 - 0.2);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────
//  DRAW: WATER LILY FLOWER
// ─────────────────────────────────────────
function drawLily(x, y, r, hue, alpha, spin, bloom) {
  const R = r * (1 + bloom * 0.32);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.globalAlpha = Math.min(1, alpha + bloom * 0.1);

  // outer 14 petals
  for (let i = 0; i < 14; i++) {
    ctx.save();
    ctx.rotate((i / 14) * Math.PI * 2);
    const g = ctx.createLinearGradient(0, 0, 0, -R);
    g.addColorStop(0,    `hsla(${hue},    88%, 82%, 0.92)`);
    g.addColorStop(0.55, `hsla(${hue},    85%, 70%, 0.85)`);
    g.addColorStop(1,    `hsla(${hue+10}, 78%, 93%, 0.45)`);
    ctx.beginPath();
    ctx.moveTo(-R * 0.11, 0);
    ctx.bezierCurveTo(-R * 0.17, -R * 0.33, -R * 0.13, -R * 0.72, 0, -R);
    ctx.bezierCurveTo( R * 0.13, -R * 0.72,  R * 0.17, -R * 0.33, R * 0.11, 0);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  // inner 8 petals
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i / 8) * Math.PI * 2 + Math.PI / 8);
    const g = ctx.createLinearGradient(0, 0, 0, -R * 0.56);
    g.addColorStop(0, `hsla(${hue+5}, 92%, 76%, 0.97)`);
    g.addColorStop(1, `hsla(${hue-5}, 82%, 88%, 0.65)`);
    ctx.beginPath();
    ctx.moveTo(-R * 0.08, 0);
    ctx.bezierCurveTo(-R * 0.12, -R * 0.22, -R * 0.08, -R * 0.50, 0, -R * 0.56);
    ctx.bezierCurveTo( R * 0.08, -R * 0.50,  R * 0.12, -R * 0.22, R * 0.08, 0);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  // bloom glow
  if (bloom > 0.04) {
    ctx.globalAlpha = bloom * 0.3;
    const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.3);
    gl.addColorStop(0, 'rgba(249,168,212,0.55)');
    gl.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = gl;
    ctx.fill();
  }

  // stamen
  ctx.globalAlpha = Math.min(1, alpha + bloom * 0.1);
  const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.19);
  sg.addColorStop(0,   '#fffde7');
  sg.addColorStop(0.5, '#fbbf24');
  sg.addColorStop(1,   '#f59e0b');
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.19, 0, Math.PI * 2);
  ctx.fillStyle = sg;
  ctx.fill();

  ctx.restore();
}

// ─────────────────────────────────────────
//  BURST HELPER (DOM emojis)
// ─────────────────────────────────────────
function burst(cx, cy, pieces, n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className   = 'burst';
      el.textContent = pieces[i % pieces.length];
      el.style.left  = (cx + (Math.random() - 0.5) * 90) + 'px';
      el.style.top   = cy + 'px';
      el.style.animationDelay = (Math.random() * 0.35) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    }, i * 45);
  }
}

// ─────────────────────────────────────────
//  CANVAS INTERACTIONS
// ─────────────────────────────────────────
let holdStarIdx = null;
let holdTimer   = null;

canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  stars.forEach((s, i) => {
    if (Math.hypot(cx - s.x * W, cy - s.y * H) < 14) {
      holdStarIdx  = i;
      s.held       = true;
      holdTimer    = setTimeout(() => {
        s.burst = 2;
        showTip('✨ a wish just left', e.clientX, e.clientY);
        spawnShoot();
        spawnShoot();
        burst(e.clientX, e.clientY, ['✨', '⭐', '💫', '🌟'], 12);
      }, 600);
    }
  });
});

canvas.addEventListener('mouseup', () => {
  if (holdStarIdx !== null) {
    clearTimeout(holdTimer);
    stars[holdStarIdx].held = false;
    holdStarIdx = null;
  }
});

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  let hit = false;

  // lily click
  LILY_DEFS.forEach((def, i) => {
    const lx    = W * def.px;
    const swayY = Math.sin(t * 0.6 + def.swayOff) * H * def.swayAmp;
    const ly    = H * 0.83 - H * def.basePy + swayY;
    if (Math.hypot(cx - lx, cy - ly) < W * def.size * 1.5) {
      lilyState[i].bloom = 1.2;
      burst(e.clientX, e.clientY, ['🌸', '🌷', '💜', '🩷'], 10);
      showTip('she bloomed ✿', e.clientX, e.clientY);
      hit = true;
    }
  });

  if (!hit) {
    // star single click
    let hitStar = false;
    stars.forEach(s => {
      if (Math.hypot(cx - s.x * W, cy - s.y * H) < 12) {
        s.burst = 1;
        showTip(starMessages[Math.floor(Math.random() * starMessages.length)], e.clientX, e.clientY);
        hitStar = true;
      }
    });

    // constellation on empty sky
    if (!hitStar && cy < H * 0.72) {
      const nx = cx / W, ny = cy / H;
      let best = null, bestD = Infinity;
      stars.forEach((s, i) => {
        const d = Math.hypot(nx - s.x, ny - s.y);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best !== null && bestD < 0.22) {
        stars.forEach((s, j) => {
          if (j !== best && Math.hypot(stars[best].x - s.x, stars[best].y - s.y) < 0.16) {
            constellLines.push({ i: best, j, life: 1 });
          }
        });
      }
    }

    // water ripple
    if (cy > H * 0.65) {
      ripples.push({ x: cx, y: cy, age: 0, max: 85 + Math.random() * 55 });
    }
  }
});

// ─────────────────────────────────────────
//  MAIN RENDER LOOP
// ─────────────────────────────────────────
function frame(ts) {
  const dt = Math.min((ts - lastTS) / 16.667, 2.5);
  lastTS = ts;
  t     += 0.007 * dt;
  lastScroll += (scrollY - lastScroll) * 0.08;

  ctx.clearRect(0, 0, W, H);

  // — Background gradient (shifts with scroll)
  const scrollFrac = lastScroll / (document.body.scrollHeight - window.innerHeight || 1);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,    `hsl(${270 + scrollFrac * 20}, 80%, ${3  + scrollFrac * 4}%)`);
  bg.addColorStop(0.4,  `hsl(${258 + scrollFrac * 15}, 75%, ${7  + scrollFrac * 4}%)`);
  bg.addColorStop(0.75, `hsl(${252 + scrollFrac * 10}, 70%, ${11 + scrollFrac * 3}%)`);
  bg.addColorStop(1,    `hsl(${246 + scrollFrac *  8}, 65%, ${15 + scrollFrac * 3}%)`);
  ctx.fillStyle  = bg;
  ctx.globalAlpha = 1;
  ctx.fillRect(0, 0, W, H);

  // — Nebula blobs
  const np = lastScroll * 0.12;
  [
    [0.25, 0.18, '#7c3aed', 0.055],
    [0.78, 0.28, '#be185d', 0.040],
    [0.55, 0.50, '#4f46e5', 0.038],
  ].forEach(([nx, ny, nc, no]) => {
    const n = ctx.createRadialGradient(nx*W, ny*H - np*0.6, 0, nx*W, ny*H - np*0.6, W*0.38);
    n.addColorStop(0, nc + Math.round(no * 255).toString(16).padStart(2, '0'));
    n.addColorStop(1, 'transparent');
    ctx.fillStyle  = n;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, W, H);
  });

  // — Mouse trail
  if (trail.length > 2) {
    ctx.save();
    for (let i = 1; i < trail.length; i++) {
      ctx.globalAlpha = (i / trail.length) * 0.16;
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth   = (i / trail.length) * 2.5;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x,     trail[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // — Constellation lines
  constellLines = constellLines.filter(l => l.life > 0);
  constellLines.forEach(l => {
    l.life -= 0.007 * dt;
    const sa = stars[l.i], sb = stars[l.j];
    ctx.globalAlpha  = l.life * 0.3;
    ctx.strokeStyle  = '#c4b5fd';
    ctx.lineWidth    = 0.7;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(sa.x * W, sa.y * H);
    ctx.lineTo(sb.x * W, sb.y * H);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // — Stars (with scroll parallax)
  stars.forEach(s => {
    if (s.burst > 0) s.burst -= 0.032 * dt;
    s.heldT = s.held
      ? Math.min(1, s.heldT + 0.06 * dt)
      : Math.max(0, s.heldT - 0.04 * dt);

    const sy = s.y * H - lastScroll * s.depth * 0.18;
    if (sy < -20 || sy > H + 20) return;   // cull off-screen

    const tw = Math.max(0, s.base + Math.sin(t * s.spd + s.phase) * 0.35 + s.burst * 0.7 + s.heldT * 0.4);
    const sr = s.r + s.burst * 3 + s.heldT * 2;

    ctx.globalAlpha = Math.min(1, tw);
    ctx.beginPath();
    ctx.arc(s.x * W, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();

    if (sr > 1.4 || s.burst > 0.1 || s.held) {
      ctx.globalAlpha = tw * 0.2;
      ctx.beginPath();
      ctx.arc(s.x * W, sy, sr * 4, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
    }

    if (s.r > 1.4) {
      ctx.globalAlpha = tw * 0.13;
      ctx.strokeStyle = s.color;
      ctx.lineWidth   = 0.6;
      ctx.beginPath();
      ctx.moveTo(s.x*W - sr*3, sy); ctx.lineTo(s.x*W + sr*3, sy);
      ctx.moveTo(s.x*W, sy - sr*3); ctx.lineTo(s.x*W, sy + sr*3);
      ctx.stroke();
    }
  });

  // — Shooting stars
  shoots = shoots.filter(s => s.life > 0);
  shoots.forEach(s => {
    s.x    += s.vx  * dt;
    s.y    += s.vy  * dt;
    s.life -= 0.025 * dt;
    ctx.globalAlpha  = s.life * 0.85;
    ctx.strokeStyle  = '#fff';
    ctx.lineWidth    = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x * W, s.y * H);
    ctx.lineTo((s.x - s.vx * s.len) * W, (s.y - s.vy * s.len) * H);
    ctx.stroke();
    ctx.globalAlpha = s.life * 0.5;
    const sg = ctx.createRadialGradient(s.x*W, s.y*H, 0, s.x*W, s.y*H, 5);
    sg.addColorStop(0, 'rgba(255,255,255,0.9)');
    sg.addColorStop(1, 'transparent');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // — Water shimmer
  ctx.globalAlpha = 0.09;
  for (let i = 0; i < 4; i++) {
    const wy = H * 0.8 + Math.sin(t * 0.7 + i * 0.9) * 3;
    ctx.beginPath();
    ctx.ellipse(W / 2, wy, W * (0.3 + i * 0.06), H * 0.02, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth   = 1;
    ctx.stroke();
  }

  // — Ripples
  ripples = ripples.filter(r => r.age < r.max);
  ripples.forEach(r => {
    r.age += 1.4 * dt;
    ctx.globalAlpha = (1 - r.age / r.max) * 0.28;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.age * 1.3, r.age * 0.42, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth   = 1;
    ctx.stroke();
  });

  // — Floating petals
  petals.forEach(p => {
    p.x   += p.vx * dt + Math.sin(t * 0.5 + p.y * 3) * 0.0003;
    p.y   += p.vy * dt;
    p.rot += p.vrot * dt;
    if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
    if (p.x < -0.05 || p.x > 1.05) p.x = Math.random();
    drawPetal(p.x * W, p.y * H, p.r, p.rot, p.alpha, p.hue);
  });

  // — Lily pads + flowers (sway & float)
  const baseY = H * 0.83;
  const pulse = Math.sin(t) * 0.02;

  LILY_DEFS.forEach((def, i) => {
    const st = lilyState[i];
    st.spin += def.spinSpeed * 0.007 * dt;
    if (st.bloom > 0) st.bloom -= 0.028 * dt;

    const swayX = Math.sin(t * 0.8 + def.swayOff) * W * 0.012;
    const swayY = Math.sin(t * 0.6 + def.swayOff) * H * 0.018;
    const lx    = W * def.px + swayX;
    const ly    = baseY - H * def.basePy + swayY;

    drawPad(lx, baseY + swayY * 0.3, W * (def.size + 0.02), H * 0.03, Math.sin(t * 0.4 + def.swayOff) * 0.06);
    drawLily(lx, ly, W * def.size * (1 + pulse), def.hue, def.alpha, st.spin, Math.max(0, st.bloom));
  });

  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);