// =====================================================================
//  Islas: suelo y decoración por temática, vista previa del menú,
//  clima (partículas en pantalla) y tono de color de cada isla.
//  Temáticas: playa | jungla | desierto | nieve | volcan | fantasma
// =====================================================================
(() => {
const TAU = Math.PI * 2;
function hash(x, y) { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967295; }

const TEMAS = {
  playa:    { base: ['#ecd8a2', '#e6d098'], speck: 'rgba(150,110,60,.25)', agua: ['#3aa3d9', '#1d6fa5'], orilla: '#f3e2b3' },
  jungla:   { base: ['#6a9b45', '#62923f'], speck: 'rgba(25,60,20,.28)',   agua: ['#2f9e9a', '#16615f'], orilla: '#d8c48a' },
  desierto: { base: ['#eac37e', '#e3b971'], speck: 'rgba(140,90,40,.25)',  agua: ['#41a8c9', '#1e6f8c'], orilla: '#f2d9a0' },
  nieve:    { base: ['#eef4f8', '#e5edf3'], speck: 'rgba(110,140,175,.25)', agua: ['#6fb3d9', '#2c6e98'], orilla: '#d5e4ee' },
  volcan:   { base: ['#433737', '#3b3030'], speck: 'rgba(255,120,40,.22)',  agua: ['#2b4a5e', '#14242e'], orilla: '#2a2222' },
  fantasma: { base: ['#4b5762', '#44505a'], speck: 'rgba(150,255,200,.14)', agua: ['#2d4c55', '#122228'], orilla: '#3a4148' },
  tormenta: { base: ['#5b6670', '#55606a'], speck: 'rgba(20,30,40,.25)',    agua: ['#3c5568', '#1a2a36'], orilla: '#6d7780' },
  cristal:  { base: ['#3b3652', '#36314b'], speck: 'rgba(150,220,255,.22)', agua: ['#3a3f78', '#191b3d'], orilla: '#4a4566' },
  gruta:    { base: ['#202b34', '#1c262e'], speck: 'rgba(120,255,220,.18)', agua: ['#123a44', '#071a20'], orilla: '#2a353e' },
};

// ---------------- utilidades de dibujo ----------------
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mix(hex, k) { const n = parseInt(hex.slice(1), 16), ch = [n >> 16, (n >> 8) & 255, n & 255]; return '#' + ch.map(v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))).toString(16).padStart(2, '0')).join(''); }
function sombra(c, x, y, rx, ry, a = 0.18) { const g = c.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.save(); c.translate(x, y); c.scale(1, ry / rx); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, rx, 0, TAU); c.fill(); c.restore(); }
function volG(c, x, y, r, col) { const g = c.createRadialGradient(x - r * 0.4, y - r * 0.5, r * 0.08, x, y, r * 1.2); g.addColorStop(0, mix(col, 0.35)); g.addColorStop(0.55, col); g.addColorStop(1, mix(col, -0.45)); return g; }
function blob(c, x, y, r, rnd, n = 9, j = 0.25) { c.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * TAU, rr = r * (1 - j / 2 + rnd() * j); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.8; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); }
function rocaS(c, x, y, s, col, rnd) {
  sombra(c, x + 3 * s, y + 6 * s, 18 * s, 6 * s, 0.25);
  const pts = []; for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI, r = s * (12 + rnd() * 6); pts.push([x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 0.95]); }
  c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.quadraticCurveTo(x, y + 7 * s, pts[0][0], pts[0][1]); c.closePath();
  c.fillStyle = volG(c, x, y - 6 * s, 16 * s, col); c.fill(); c.lineWidth = 1.2; c.strokeStyle = mix(col, -0.6); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.moveTo(pts[2][0], pts[2][1]); c.lineTo(pts[4][0], pts[4][1]); c.lineTo(x - 2 * s, y - 4 * s); c.closePath(); c.fill();
  c.strokeStyle = mix(col, -0.35); c.lineWidth = 0.8; c.beginPath(); c.moveTo(x - 4 * s, y - 10 * s); c.lineTo(x + 1 * s, y - 4 * s); c.lineTo(x + 6 * s, y - 7 * s); c.stroke();
}
function hojaPalma(c, x0, y0, a, len, col) {
  c.save(); c.translate(x0, y0); c.rotate(a);
  const g = c.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, mix(col, 0.25)); g.addColorStop(1, mix(col, -0.35));
  c.fillStyle = g; c.beginPath(); c.moveTo(0, 0);
  for (let i = 1; i <= 8; i++) { const q = i / 8; c.lineTo(len * q, -7 * Math.sin(Math.PI * q) - (i % 2) * 2 + q * 6); }
  for (let i = 8; i >= 1; i--) { const q = i / 8; c.lineTo(len * q, 5 * Math.sin(Math.PI * q) + (i % 2) * 2 + q * 6); }
  c.closePath(); c.fill(); c.strokeStyle = mix(col, -0.55); c.lineWidth = 0.8; c.stroke();
  c.strokeStyle = mix(col, 0.4); c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.5, 1, len, 6); c.stroke();
  c.restore();
}
function palmaS(c, x, y, rnd) {
  const lean = (rnd() - 0.5) * 30, top = [x + lean, y - 70];
  sombra(c, x + 20, y + 4, 42, 12, 0.22);
  for (let i = 0; i < 9; i++) {
    const q = i / 9, px = x + lean * q * q, py = y - 70 * q, w = 7 - q * 2.5;
    c.fillStyle = volG(c, px, py, w * 1.4, i % 2 ? '#8a5a2b' : '#7a4d24'); c.beginPath(); c.ellipse(px, py, w, 5, 0, 0, TAU); c.fill();
    c.strokeStyle = '#4a2c14'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(px, py, w, 5, 0, 0, Math.PI); c.stroke();
  }
  const n = 7 + (rnd() * 2 | 0);
  for (let k = 0; k < n; k++) { const a = k / n * TAU + rnd() * 0.4; hojaPalma(c, top[0], top[1], a, 30 + rnd() * 12, k % 2 ? '#2f8f4e' : '#3aa35a'); }
  for (let k = 0; k < 3; k++) { const cx = top[0] + (k - 1) * 5, cy = top[1] + 4 + (k % 2) * 2; c.fillStyle = volG(c, cx, cy, 4, '#6b4226'); c.beginPath(); c.arc(cx, cy, 3.6, 0, TAU); c.fill(); }
}
function arbolS(c, x, y, rnd, cols) {
  sombra(c, x + 14, y + 6, 48, 16, 0.28);
  const tr = c.createLinearGradient(x - 6, 0, x + 6, 0); tr.addColorStop(0, '#3d2614'); tr.addColorStop(0.5, '#6b4423'); tr.addColorStop(1, '#3d2614');
  c.fillStyle = tr; c.beginPath(); c.moveTo(x - 7, y + 4); c.quadraticCurveTo(x - 4, y - 20, x - 5, y - 34); c.lineTo(x + 5, y - 34); c.quadraticCurveTo(x + 4, y - 20, x + 8, y + 4); c.closePath(); c.fill();
  c.strokeStyle = '#2b1a0c'; c.lineWidth = 1; c.stroke();
  const lobes = [[-20, -40, 22], [20, -42, 21], [0, -58, 25], [-12, -64, 16], [14, -66, 15], [0, -38, 18]];
  for (const [ox, oy, r] of lobes) { const rr = r * (0.9 + rnd() * 0.2); c.fillStyle = volG(c, x + ox, y + oy, rr, cols[(rnd() * cols.length) | 0]); blob(c, x + ox, y + oy, rr, rnd, 10, 0.18); c.fill(); c.strokeStyle = 'rgba(10,40,10,.45)'; c.lineWidth = 1; c.stroke(); }
  c.fillStyle = 'rgba(255,255,220,.18)'; for (let i = 0; i < 10; i++) { c.beginPath(); c.arc(x - 20 + rnd() * 30, y - 72 + rnd() * 30, 2 + rnd() * 3, 0, TAU); c.fill(); }
}
function pinoS(c, x, y, rnd, nieve) {
  sombra(c, x + 12, y + 4, 30, 10, 0.25);
  c.fillStyle = '#4a2c14'; c.fillRect(x - 3, y - 10, 6, 14);
  for (let k = 0; k < 4; k++) {
    const w = 28 - k * 6, yy = y - 8 - k * 15, h = 22;
    const g = c.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, '#1e5a3c'); g.addColorStop(0.5, '#2f7a52'); g.addColorStop(1, '#174a31');
    c.fillStyle = g; c.beginPath(); c.moveTo(x - w, yy);
    for (let i = 0; i <= 6; i++) c.lineTo(x - w + i * w / 3, yy + (i % 2 ? 3 : 0));
    c.lineTo(x, yy - h); c.closePath(); c.fill(); c.strokeStyle = '#0f3322'; c.lineWidth = 0.8; c.stroke();
    if (nieve) { c.fillStyle = '#fbfdff'; c.beginPath(); c.moveTo(x - w * 0.6, yy - h * 0.45); c.lineTo(x, yy - h); c.lineTo(x + w * 0.6, yy - h * 0.45); for (let i = 0; i <= 5; i++) c.lineTo(x + w * 0.6 - i * w * 0.24, yy - h * 0.45 + (i % 2 ? 3 : -1)); c.closePath(); c.fill(); c.strokeStyle = 'rgba(120,160,200,.6)'; c.stroke(); }
  }
}
function cactusS(c, x, y, rnd) {
  sombra(c, x + 10, y + 4, 22, 7, 0.25);
  const body = (bx, by, w, h) => {
    const g = c.createLinearGradient(bx, 0, bx + w, 0); g.addColorStop(0, '#2f7a3c'); g.addColorStop(0.45, '#58b062'); g.addColorStop(1, '#245f2f');
    c.fillStyle = g; c.beginPath(); c.moveTo(bx, by + h); c.lineTo(bx, by + w / 2); c.arc(bx + w / 2, by + w / 2, w / 2, Math.PI, 0); c.lineTo(bx + w, by + h); c.closePath(); c.fill();
    c.strokeStyle = '#1c4d26'; c.lineWidth = 1; c.stroke();
    c.strokeStyle = 'rgba(20,70,30,.5)'; for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(bx + w * k / 3, by + w / 2); c.lineTo(bx + w * k / 3, by + h); c.stroke(); }
    c.fillStyle = '#f5f0d0'; for (let k = 0; k < h / 6; k++) { c.fillRect(bx + 1 + (k % 2) * (w - 3), by + w / 2 + k * 6, 1.2, 1.2); }
  };
  const H = 40 + rnd() * 14; body(x - 7, y - H, 14, H);
  if (rnd() > 0.2) { body(x - 22, y - H * 0.65, 10, H * 0.32); c.fillStyle = '#3f8f4a'; c.fillRect(x - 17, y - H * 0.38, 12, 6); }
  if (rnd() > 0.3) { body(x + 11, y - H * 0.75, 10, H * 0.38); c.fillStyle = '#3f8f4a'; c.fillRect(x + 5, y - H * 0.42, 10, 6); }
  if (rnd() > 0.4) { c.fillStyle = '#ff7eb6'; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; c.beginPath(); c.ellipse(x + Math.cos(a) * 3, y - H - 1 + Math.sin(a) * 2, 2.5, 1.5, a, 0, TAU); c.fill(); } c.fillStyle = '#ffe36b'; c.beginPath(); c.arc(x, y - H - 1, 1.5, 0, TAU); c.fill(); }
}
function arbustoS(c, x, y, rnd, col, frutos) {
  sombra(c, x + 5, y + 8, 26, 8, 0.22);
  for (const [ox, oy, r] of [[-11, 0, 11], [10, 1, 10], [0, -8, 13], [-4, 4, 9]]) { c.fillStyle = volG(c, x + ox, y + oy, r, col); blob(c, x + ox, y + oy, r, rnd, 9, 0.2); c.fill(); c.strokeStyle = mix(col, -0.55); c.lineWidth = 0.8; c.stroke(); }
  if (frutos) for (let k = 0; k < 5; k++) { const fx = x - 10 + rnd() * 20, fy = y - 10 + rnd() * 14; c.fillStyle = volG(c, fx, fy, 2.5, frutos); c.beginPath(); c.arc(fx, fy, 2.3, 0, TAU); c.fill(); }
}
function charcoS(c, x, y, rnd, deep, shallow, rx = 30) {
  const ry = rx * 0.45; c.save(); c.translate(x, y); c.rotate((rnd() - 0.5) * 0.6);
  blob(c, 0, 0, rx, rnd, 12, 0.18); c.fillStyle = shallow; c.fill();
  const g = c.createRadialGradient(-rx * 0.2, -ry * 0.2, 2, 0, 0, rx * 0.8); g.addColorStop(0, mix(deep, 0.25)); g.addColorStop(1, deep);
  c.scale(1, 0.5); blob(c, 0, 0, rx * 0.75, rnd, 10, 0.2); c.fillStyle = g; c.fill(); c.restore();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - rx * 0.25, y - ry * 0.25, rx * 0.25, 1.6, -0.2, 0, TAU); c.fill();
}
function conchaS(c, x, y, rnd, col) {
  c.save(); c.translate(x, y); c.rotate((rnd() - 0.5) * 1.5);
  c.fillStyle = volG(c, 0, -2, 8, col); c.beginPath(); c.moveTo(0, 5); for (let k = 0; k <= 8; k++) { const a = Math.PI + k / 8 * Math.PI; c.lineTo(Math.cos(a) * 8, Math.sin(a) * 8 + 1); } c.closePath(); c.fill();
  c.strokeStyle = mix(col, -0.4); c.lineWidth = 0.8; c.stroke(); for (let k = 1; k < 8; k++) { const a = Math.PI + k / 8 * Math.PI; c.beginPath(); c.moveTo(0, 5); c.lineTo(Math.cos(a) * 8, Math.sin(a) * 8 + 1); c.stroke(); }
  c.restore();
}
function estrellaS(c, x, y, rnd) {
  c.save(); c.translate(x, y); c.rotate(rnd() * TAU);
  c.fillStyle = volG(c, 0, 0, 10, '#e8774a'); c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, r = k % 2 ? 3.5 : 10; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
  c.strokeStyle = '#a0461f'; c.lineWidth = 0.8; c.stroke(); c.fillStyle = '#ffd0a8'; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU - Math.PI / 2; for (let q = 1; q < 3; q++) { c.beginPath(); c.arc(Math.cos(a) * q * 3, Math.sin(a) * q * 3, 0.8, 0, TAU); c.fill(); } }
  c.restore();
}
function troncoS(c, x, y, rnd, col, musgo) {
  c.save(); c.translate(x, y); c.rotate((rnd() - 0.5) * 0.8);
  sombra(c, 4, 8, 40, 8, 0.25);
  const g = c.createLinearGradient(0, -8, 0, 8); g.addColorStop(0, mix(col, 0.3)); g.addColorStop(0.5, col); g.addColorStop(1, mix(col, -0.5));
  c.fillStyle = g; c.beginPath(); c.moveTo(-34, -6); c.lineTo(30, -7); c.quadraticCurveTo(36, 0, 30, 7); c.lineTo(-34, 6); c.closePath(); c.fill(); c.strokeStyle = mix(col, -0.65); c.lineWidth = 1; c.stroke();
  c.strokeStyle = mix(col, -0.35); c.lineWidth = 0.8; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-28 + k * 14, -5); c.quadraticCurveTo(-22 + k * 14, 0, -28 + k * 14 + 4, 5); c.stroke(); }
  c.fillStyle = mix(col, 0.2); c.beginPath(); c.ellipse(-34, 0, 3, 6, 0, 0, TAU); c.fill(); c.strokeStyle = mix(col, -0.5); c.beginPath(); c.ellipse(-34, 0, 1.6, 3.5, 0, 0, TAU); c.stroke();
  if (musgo) { c.fillStyle = musgo; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(-20 + k * 8 + rnd() * 4, -6 + rnd() * 2, 2.5 + rnd() * 2, 0, TAU); c.fill(); } }
  c.restore();
}
function setasS(c, x, y, rnd, cap, glow) {
  for (let k = 0; k < 3; k++) {
    const ox = x + (k - 1) * 8 + rnd() * 3, h = 6 + rnd() * 6, r = 4 + rnd() * 3;
    if (glow) { const g = c.createRadialGradient(ox, y - h, 1, ox, y - h, r * 3.5); g.addColorStop(0, cap + 'aa'); g.addColorStop(1, cap + '00'); c.fillStyle = g; c.beginPath(); c.arc(ox, y - h, r * 3.5, 0, TAU); c.fill(); }
    c.fillStyle = '#efe6d2'; c.fillRect(ox - 1.3, y - h, 2.6, h);
    c.fillStyle = volG(c, ox, y - h - 1, r, cap); c.beginPath(); c.arc(ox, y - h, r, Math.PI, 0); c.quadraticCurveTo(ox, y - h + 2, ox - r, y - h); c.fill(); c.strokeStyle = mix(cap, -0.5); c.lineWidth = 0.7; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(ox - r * 0.3, y - h - r * 0.45, 0.9, 0, TAU); c.arc(ox + r * 0.35, y - h - r * 0.3, 0.7, 0, TAU); c.fill();
  }
}
function cristalesS(c, x, y, rnd, cols) {
  sombra(c, x + 4, y + 3, 22, 6, 0.3);
  const list = [[-11, 30, 9, -0.3], [0, 48, 12, 0.02], [12, 28, 8, 0.35], [6, 18, 6, 0.6], [-5, 16, 5, -0.6]];
  for (const [ox, hh, w, a] of list) {
    const col = cols[(rnd() * cols.length) | 0], H = hh * (0.85 + rnd() * 0.3);
    c.save(); c.translate(x + ox, y); c.rotate(a);
    c.fillStyle = mix(col, -0.3); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -H * 0.78); c.lineTo(0, -H); c.lineTo(w / 2, -H * 0.78); c.lineTo(w / 2, 0); c.closePath(); c.fill();
    c.fillStyle = mix(col, 0.25); c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -H * 0.78); c.lineTo(0, -H); c.lineTo(0, 0); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -H * 0.78); c.lineTo(0, -H); c.lineTo(w / 2, -H * 0.78); c.lineTo(w / 2, 0); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(-w / 2 + 1.2, -H * 0.7, 1.4, H * 0.55);
    c.restore();
  }
}
function tablonesS(c, x, y, rnd) {
  c.save(); c.translate(x, y); c.rotate((rnd() - 0.5) * 0.5);
  sombra(c, 3, 6, 38, 16, 0.25);
  for (let k = 0; k < 4; k++) {
    const yy = -18 + k * 10, len = 50 + rnd() * 20, x0 = -len / 2 + (rnd() - 0.5) * 10;
    const g = c.createLinearGradient(0, yy, 0, yy + 9); g.addColorStop(0, '#7a5c40'); g.addColorStop(1, '#4a3420');
    c.fillStyle = g; c.beginPath(); c.moveTo(x0, yy); c.lineTo(x0 + len, yy); c.lineTo(x0 + len - 4, yy + 4); c.lineTo(x0 + len, yy + 9); c.lineTo(x0, yy + 9); c.closePath(); c.fill(); c.strokeStyle = '#2b1d10'; c.lineWidth = 0.8; c.stroke();
    c.strokeStyle = 'rgba(30,20,10,.35)'; c.beginPath(); c.moveTo(x0 + 4, yy + 3); c.quadraticCurveTo(x0 + len / 2, yy + 5, x0 + len - 8, yy + 3); c.stroke();
    c.fillStyle = '#9aa0a6'; c.beginPath(); c.arc(x0 + 5, yy + 4.5, 1.1, 0, TAU); c.arc(x0 + len - 9, yy + 4.5, 1.1, 0, TAU); c.fill();
  }
  c.restore();
}
function barrilS(c, x, y) {
  sombra(c, x + 4, y + 12, 16, 5, 0.3);
  const g = c.createLinearGradient(x - 12, 0, x + 12, 0); g.addColorStop(0, '#4a2f18'); g.addColorStop(0.45, '#8a5a30'); g.addColorStop(1, '#3a2412');
  c.fillStyle = g; c.beginPath(); c.moveTo(x - 10, y - 14); c.quadraticCurveTo(x - 14, y, x - 10, y + 12); c.lineTo(x + 10, y + 12); c.quadraticCurveTo(x + 14, y, x + 10, y - 14); c.closePath(); c.fill(); c.strokeStyle = '#24160a'; c.lineWidth = 1; c.stroke();
  c.strokeStyle = '#555c63'; c.lineWidth = 2; for (const yy of [-8, 6]) { c.beginPath(); c.moveTo(x - 12, y + yy); c.quadraticCurveTo(x, y + yy + 2, x + 12, y + yy); c.stroke(); }
  c.fillStyle = '#6b4a2b'; c.beginPath(); c.ellipse(x, y - 14, 10, 3.5, 0, 0, TAU); c.fill(); c.strokeStyle = '#24160a'; c.lineWidth = 0.8; c.stroke();
}
function cajaS(c, x, y, rnd) {
  sombra(c, x + 5, y + 10, 20, 6, 0.3);
  c.save(); c.translate(x, y); c.rotate((rnd() - 0.5) * 0.4);
  c.fillStyle = '#8a6a44'; c.fillRect(-12, -12, 24, 22); c.fillStyle = '#a7845a'; c.beginPath(); c.moveTo(-12, -12); c.lineTo(-6, -18); c.lineTo(18, -18); c.lineTo(12, -12); c.closePath(); c.fill();
  c.fillStyle = '#6e5234'; c.beginPath(); c.moveTo(12, -12); c.lineTo(18, -18); c.lineTo(18, 4); c.lineTo(12, 10); c.closePath(); c.fill();
  c.strokeStyle = '#3d2b16'; c.lineWidth = 1; c.strokeRect(-12, -12, 24, 22); c.beginPath(); c.moveTo(-12, -12); c.lineTo(12, 10); c.moveTo(12, -12); c.lineTo(-12, 10); c.stroke();
  c.restore();
}
function algasS(c, x, y, rnd, col) { for (let k = -2; k <= 2; k++) { const h = 14 + rnd() * 12; c.strokeStyle = k % 2 ? col : mix(col, 0.25); c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + k * 4, y + 4); c.bezierCurveTo(x + k * 4 + 6, y - h * 0.3, x + k * 4 - 6, y - h * 0.6, x + k * 5, y - h); c.stroke(); } }
function heleS(c, x, y, rnd) { for (let k = -3; k <= 3; k++) { const a = -Math.PI / 2 + k * 0.32; c.save(); c.translate(x, y + 4); c.rotate(a + Math.PI / 2); const len = 16 + rnd() * 6; c.strokeStyle = '#2f6b2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(3, -len * 0.5, 0, -len); c.stroke(); for (let q = 1; q < 6; q++) { c.fillStyle = q % 2 ? '#3f8a35' : '#4e9e41'; c.beginPath(); c.ellipse(1.5, -len * q / 6, 3.2, 1.2, 0.4, 0, TAU); c.ellipse(-1.5, -len * q / 6, 3.2, 1.2, -0.4, 0, TAU); c.fill(); } c.restore(); } }
function floresS(c, x, y, rnd) { const cols = ['#ff7eb6', '#ffd166', '#c084fc', '#ff9f43', '#7fd3ff']; for (let k = 0; k < 6; k++) { const fx = x + (rnd() - 0.5) * 44, fy = y + (rnd() - 0.5) * 30, col = cols[(rnd() * cols.length) | 0]; c.strokeStyle = '#3f7a32'; c.lineWidth = 1; c.beginPath(); c.moveTo(fx, fy + 6); c.lineTo(fx, fy); c.stroke(); for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; c.fillStyle = volG(c, fx + Math.cos(a) * 2.6, fy + Math.sin(a) * 2.6, 2.6, col); c.beginPath(); c.arc(fx + Math.cos(a) * 2.6, fy + Math.sin(a) * 2.6, 2.2, 0, TAU); c.fill(); } c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(fx, fy, 1.4, 0, TAU); c.fill(); } }
function montonNieveS(c, x, y, rnd) { sombra(c, x + 4, y + 6, 30, 8, 0.15); c.fillStyle = volG(c, x, y - 2, 26, '#f4f9ff'); blob(c, x, y, 26, rnd, 12, 0.15); c.fill(); c.strokeStyle = 'rgba(140,175,210,.6)'; c.lineWidth = 1; c.stroke(); c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(x - 8, y - 8, 8, 2, -0.2, 0, TAU); c.fill(); }
function hieloS(c, x, y, rnd) { c.save(); c.translate(x, y); c.rotate((rnd() - 0.5) * 0.5); blob(c, 0, 0, 30, rnd, 10, 0.2); const g = c.createLinearGradient(-30, -12, 30, 12); g.addColorStop(0, '#e2f6ff'); g.addColorStop(0.5, '#a9dcf3'); g.addColorStop(1, '#7cc2e3'); c.fillStyle = g; c.fill(); c.strokeStyle = '#6aa8c8'; c.lineWidth = 1; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-14, -4); c.lineTo(-4, 2); c.lineTo(6, -3); c.lineTo(16, 3); c.moveTo(-4, 2); c.lineTo(-2, 9); c.stroke(); c.restore(); }
function grietaS(c, x, y, rnd, col, glow) { const pts = [[x - 30, y - 4]]; for (let i = 1; i <= 6; i++) pts.push([x - 30 + i * 10, y + (rnd() - 0.5) * 12]); if (glow) { c.strokeStyle = glow; c.lineWidth = 7; c.globalAlpha = 0.35; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); c.globalAlpha = 1; } c.strokeStyle = col; c.lineWidth = 2.5; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); c.lineWidth = 1.2; c.beginPath(); c.moveTo(pts[3][0], pts[3][1]); c.lineTo(pts[3][0] + 6, pts[3][1] + 10); c.stroke(); }
function estalagmitaS(c, x, y, rnd) { sombra(c, x + 4, y + 2, 14, 4, 0.3); for (const [ox, h, w] of [[0, 38, 11], [-9, 22, 7], [8, 16, 6]]) { const g = c.createLinearGradient(x + ox - w, 0, x + ox + w, 0); g.addColorStop(0, '#6b7783'); g.addColorStop(0.4, '#8a96a2'); g.addColorStop(1, '#3e4852'); c.fillStyle = g; c.beginPath(); c.moveTo(x + ox - w, y + 2); c.quadraticCurveTo(x + ox - w * 0.3, y - h * 0.5, x + ox, y - h); c.quadraticCurveTo(x + ox + w * 0.3, y - h * 0.5, x + ox + w, y + 2); c.closePath(); c.fill(); c.strokeStyle = '#2a323a'; c.lineWidth = 0.8; c.stroke(); } }

// Catálogo por temática: [peso, nombre, dibujo(c, x, y, rnd), animación opcional(c, x, y, t, h)]
// Los dibujos estáticos se pintan una vez en un lienzo aparte (caché) y se reutilizan.
const CAT = {
  playa: [
    [5, 'palma', (c, x, y, r) => palmaS(c, x, y, r)],
    [6, 'roca', (c, x, y, r) => rocaS(c, x, y, 0.8 + r() * 0.5, '#9c8f7a', r)],
    [5, 'estrella', (c, x, y, r) => estrellaS(c, x, y, r)],
    [5, 'conchas', (c, x, y, r) => { conchaS(c, x - 8, y, r, '#f6c1c7'); conchaS(c, x + 8, y + 4, r, '#f3e3b5'); }],
    [5, 'poza', (c, x, y, r) => charcoS(c, x, y, r, '#3aa0c8', '#9fd8e8')],
    [4, 'madera', (c, x, y, r) => troncoS(c, x, y, r, '#b49a78')],
    [4, 'algas', (c, x, y, r) => algasS(c, x, y, r, '#5a8a4a')],
    [3, 'arbusto', (c, x, y, r) => arbustoS(c, x, y, r, '#4f9a49', null)],
  ],
  jungla: [
    [7, 'arbol', (c, x, y, r) => arbolS(c, x, y, r, ['#2f6b2a', '#357a2f', '#3f8a35'])],
    [6, 'arbusto', (c, x, y, r) => arbustoS(c, x, y, r, '#3d7d33', '#e74c3c')],
    [5, 'flores', (c, x, y, r) => floresS(c, x, y, r)],
    [5, 'helecho', (c, x, y, r) => heleS(c, x, y, r)],
    [4, 'tronco', (c, x, y, r) => troncoS(c, x, y, r, '#6b4a2b', '#4f9a3c')],
    [4, 'setas', (c, x, y, r) => setasS(c, x, y, r, '#d9483b', false)],
    [3, 'charco', (c, x, y, r) => charcoS(c, x, y, r, '#4a3e26', '#6b5a38', 26)],
    [3, 'roca', (c, x, y, r) => rocaS(c, x, y, 0.9, '#7d8a6a', r)],
  ],
  desierto: [
    [6, 'cactus', (c, x, y, r) => cactusS(c, x, y, r)],
    [7, 'roca', (c, x, y, r) => rocaS(c, x, y, 0.8 + r() * 0.6, '#b06a3f', r)],
    [5, 'matorral', (c, x, y, r) => { c.strokeStyle = '#8b6b3e'; c.lineWidth = 1.4; for (let k = 0; k < 14; k++) { const a = r() * TAU, l = 8 + r() * 8; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.6, y + Math.sin(a) * l * 0.3 - 4, x + Math.cos(a) * l, y + Math.sin(a) * l * 0.5 - 2); c.stroke(); } }],
    [4, 'piedras', (c, x, y, r) => { for (let k = 0; k < 5; k++) rocaS(c, x + (r() - 0.5) * 40, y + (r() - 0.5) * 20, 0.3 + r() * 0.2, '#c08a5a', r); }],
    [3, 'oasis', (c, x, y, r) => { charcoS(c, x, y, r, '#2f9fc4', '#8fd3e0', 26); arbustoS(c, x + 24, y - 4, r, '#4f9a49', null); }],
    [3, 'madera', (c, x, y, r) => troncoS(c, x, y, r, '#c9b08a')],
  ],
  nieve: [
    [8, 'pino', (c, x, y, r) => pinoS(c, x, y, r, true)],
    [5, 'hielo', (c, x, y, r) => hieloS(c, x, y, r)],
    [5, 'roca', (c, x, y, r) => { rocaS(c, x, y, 0.9, '#7f8c99', r); c.fillStyle = '#fbfdff'; blob(c, x - 2, y - 12, 11, r, 8, 0.3); c.fill(); }],
    [6, 'monton', (c, x, y, r) => montonNieveS(c, x, y, r)],
    [3, 'arbusto', (c, x, y, r) => { arbustoS(c, x, y, r, '#5d7d6a', '#c0392b'); c.fillStyle = 'rgba(255,255,255,.85)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x - 10 + k * 7, y - 12 + (k % 2) * 3, 5, 2, 0, 0, TAU); c.fill(); } }],
  ],
  volcan: [
    [5, 'lava', (c, x, y, r) => { charcoS(c, x, y, r, '#ff7a1a', '#3a1f14', 28); }, (c, x, y, t, h) => { const p = 0.7 + Math.sin(t * 2 + h * 50) * 0.3, g = c.createRadialGradient(x, y, 2, x, y, 42); g.addColorStop(0, `rgba(255,220,120,${0.6 * p})`); g.addColorStop(0.5, `rgba(255,90,20,${0.35 * p})`); g.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 42, 0, TAU); c.fill(); }],
    [6, 'grieta', (c, x, y, r) => grietaS(c, x, y, r, '#ff8a2a', '#ff5a10')],
    [7, 'roca', (c, x, y, r) => rocaS(c, x, y, 0.8 + r() * 0.6, '#2b2424', r)],
    [4, 'obsidiana', (c, x, y, r) => cristalesS(c, x, y, r, ['#1a1420', '#2b2238'])],
    [3, 'fumarola', (c, x, y, r) => { c.fillStyle = volG(c, x, y, 12, '#2a2222'); c.beginPath(); c.ellipse(x, y, 12, 5, 0, 0, TAU); c.fill(); }, (c, x, y, t, h) => { for (let k = 0; k < 3; k++) { const ph = (t * 0.6 + k / 3 + h) % 1; c.fillStyle = `rgba(150,140,140,${0.35 * (1 - ph)})`; c.beginPath(); c.arc(x + Math.sin(ph * 6) * 4, y - ph * 44, 6 + ph * 11, 0, TAU); c.fill(); } }],
  ],
  fantasma: [
    [7, 'tablones', (c, x, y, r) => tablonesS(c, x, y, r)],
    [5, 'barril', (c, x, y) => barrilS(c, x, y)],
    [4, 'caja', (c, x, y, r) => cajaS(c, x, y, r)],
    [4, 'farol', (c, x, y) => { c.fillStyle = '#2b2b2b'; c.fillRect(x - 1.5, y - 30, 3, 30); c.fillRect(x - 7, y - 44, 14, 16); c.fillStyle = '#1b1b1b'; c.beginPath(); c.moveTo(x - 8, y - 44); c.lineTo(x, y - 50); c.lineTo(x + 8, y - 44); c.closePath(); c.fill(); }, (c, x, y, t, h) => { const fl = 0.7 + Math.sin(t * 4 + h * 80) * 0.3, g = c.createRadialGradient(x, y - 36, 1, x, y - 36, 40); g.addColorStop(0, `rgba(150,255,200,${0.6 * fl})`); g.addColorStop(1, 'rgba(150,255,200,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y - 36, 40, 0, TAU); c.fill(); c.fillStyle = `rgba(200,255,225,${fl})`; c.fillRect(x - 5, y - 42, 10, 12); }],
    [5, 'roca', (c, x, y, r) => rocaS(c, x, y, 1, '#2c353c', r)],
    [4, 'algas', (c, x, y, r) => algasS(c, x, y, r, '#2d5a45')],
    [3, 'charco', (c, x, y, r) => charcoS(c, x, y, r, '#13262c', '#24414a', 30)],
  ],
  tormenta: [
    [6, 'arbol', (c, x, y, r) => { c.save(); c.translate(x, y); c.transform(1, 0, -0.25, 1, 0, 0); arbolS(c, 0, 0, r, ['#3f5a3a', '#4a6845', '#36503a']); c.restore(); }],
    [6, 'charco', (c, x, y, r) => charcoS(c, x, y, r, '#2c4152', '#3c5568', 28), (c, x, y, t, h) => { c.strokeStyle = 'rgba(200,220,240,.45)'; c.lineWidth = 1; for (let k = 0; k < 2; k++) { const q = (t * 1.5 + k * 0.5 + h * 7) % 1; c.globalAlpha = 1 - q; c.beginPath(); c.ellipse(x + (k ? 8 : -6), y + (k ? -2 : 2), 2 + q * 9, (2 + q * 9) * 0.45, 0, 0, TAU); c.stroke(); } c.globalAlpha = 1; }],
    [7, 'roca', (c, x, y, r) => rocaS(c, x, y, 1 + r() * 0.4, '#3d454d', r)],
    [4, 'hierba', (c, x, y, r) => { for (let k = -3; k <= 3; k++) { c.strokeStyle = k % 2 ? '#4f6a48' : '#5f7d56'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + k * 4, y + 4); c.quadraticCurveTo(x + k * 4 + 7, y - 6, x + k * 4 + 14, y - 10 - r() * 4); c.stroke(); } }],
    [3, 'tronco', (c, x, y, r) => troncoS(c, x, y, r, '#4a3a2c', '#4f6a48')],
  ],
  cristal: [
    [7, 'cristales', (c, x, y, r) => cristalesS(c, x, y, r, ['#9b8cff', '#6fe3ff', '#ff9bd8'])],
    [6, 'roca', (c, x, y, r) => rocaS(c, x, y, 1, '#2a2540', r)],
    [5, 'esquirlas', (c, x, y, r) => { for (let k = 0; k < 4; k++) { const ox = x + (r() - 0.5) * 36, oy = y + (r() - 0.5) * 20; c.save(); c.translate(ox, oy); c.rotate((r() - 0.5) * 1.4); c.fillStyle = ['#9b8cff', '#6fe3ff'][k % 2]; c.beginPath(); c.moveTo(-3, 2); c.lineTo(0, -10); c.lineTo(3, 2); c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.8; c.stroke(); c.restore(); } }],
    [3, 'grieta', (c, x, y, r) => grietaS(c, x, y, r, '#6fe3ff', '#6fe3ff')],
  ],
  gruta: [
    [6, 'setas', (c, x, y, r) => setasS(c, x, y, r, r() > 0.5 ? '#4ff0d0' : '#ff7ad9', true)],
    [6, 'estalagmita', (c, x, y, r) => estalagmitaS(c, x, y, r)],
    [5, 'laguna', (c, x, y, r) => charcoS(c, x, y, r, '#0f4a52', '#1a6a72', 26), (c, x, y, t, h) => { const g = c.createRadialGradient(x, y, 2, x, y, 38); g.addColorStop(0, `rgba(80,240,220,${0.35 + Math.sin(t * 1.5 + h * 60) * 0.15})`); g.addColorStop(1, 'rgba(80,240,220,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 38, 0, TAU); c.fill(); }],
    [5, 'roca', (c, x, y, r) => rocaS(c, x, y, 1, '#3a4550', r)],
    [3, 'cristales', (c, x, y, r) => cristalesS(c, x, y, r, ['#4ff0d0', '#7fd3ff'])],
  ],
};
// Detalles pequeños esparcidos (piedrecitas, hierba, huellas...)
const DET = {
  playa: (c, x, y, r) => { if (r() < 0.5) { c.fillStyle = ['#c9b48a', '#b8a27a', '#e9dcc0'][(r() * 3) | 0]; c.beginPath(); c.ellipse(x, y, 2 + r() * 2, 1.4 + r(), r() * 3, 0, TAU); c.fill(); } else { c.fillStyle = 'rgba(160,130,90,.35)'; c.beginPath(); c.ellipse(x, y, 3, 1.6, 0.3, 0, TAU); c.ellipse(x + 7, y - 6, 3, 1.6, 0.3, 0, TAU); c.fill(); } },
  jungla: (c, x, y, r) => { c.strokeStyle = r() < 0.5 ? '#3f7a32' : '#55963f'; c.lineWidth = 1.2; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + k * 3, y); c.lineTo(x + k * 4 + (r() - 0.5) * 3, y - 6 - r() * 4); c.stroke(); } },
  desierto: (c, x, y, r) => { c.fillStyle = ['#c9935a', '#b07a48', '#e2b884'][(r() * 3) | 0]; c.beginPath(); c.ellipse(x, y, 1.6 + r() * 2, 1.2 + r(), r() * 3, 0, TAU); c.fill(); },
  nieve: (c, x, y, r) => { c.fillStyle = 'rgba(150,180,215,.35)'; c.beginPath(); c.ellipse(x, y, 3, 1.5, 0, 0, TAU); c.ellipse(x + 5, y + 6, 3, 1.5, 0, 0, TAU); c.fill(); },
  volcan: (c, x, y, r) => { c.fillStyle = r() < 0.3 ? '#ff7a1a' : '#1c1616'; c.beginPath(); c.arc(x, y, 1 + r() * 1.8, 0, TAU); c.fill(); },
  fantasma: (c, x, y, r) => { c.fillStyle = '#3a2f26'; c.fillRect(x, y, 6 + r() * 6, 2); },
  tormenta: (c, x, y, r) => { c.fillStyle = '#4b555e'; c.beginPath(); c.ellipse(x, y, 2 + r() * 2, 1.4, 0, 0, TAU); c.fill(); },
  cristal: (c, x, y, r) => { c.fillStyle = r() < 0.4 ? '#9b8cff' : '#2a2540'; c.beginPath(); c.arc(x, y, 1.2 + r(), 0, TAU); c.fill(); },
  gruta: (c, x, y, r) => { c.fillStyle = r() < 0.4 ? 'rgba(120,255,220,.7)' : '#2c3741'; c.beginPath(); c.arc(x, y, 1 + r(), 0, TAU); c.fill(); },
};

// Caché de dibujos estáticos (cada objeto se pinta una vez a doble resolución)
const SCACHE = new Map();
function spriteDeco(tema, i, v, fn) {
  const key = tema + ':' + i + ':' + v; let s = SCACHE.get(key);
  if (!s) {
    const W = 200, Hh = 200, cv = document.createElement('canvas'); cv.width = W * 2; cv.height = Hh * 2;
    const c = cv.getContext('2d'); c.scale(2, 2); fn(c, W / 2, Hh * 0.68, mulberry(v * 7919 + i * 104729 + tema.length));
    s = { cv, W, H: Hh, ox: W / 2, oy: Hh * 0.68 }; SCACHE.set(key, s);
  }
  return s;
}
// Textura de suelo (repetible) por temática
const TEX = new Map();
function texture(tema) {
  if (TEX.has(tema)) return TEX.get(tema);
  const th = TEMAS[tema] || TEMAS.playa, N = 256, cv = document.createElement('canvas'); cv.width = cv.height = N;
  const c = cv.getContext('2d'), r = mulberry(tema.length * 977 + 13);
  c.fillStyle = th.base[0]; c.fillRect(0, 0, N, N);
  const wrap = f => { for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) { c.save(); c.translate(dx, dy); f(); c.restore(); } };
  // manchas suaves
  for (let i = 0; i < 26; i++) { const x = r() * N, y = r() * N, rad = 20 + r() * 50, light = r() < 0.5, col = light ? mix(th.base[0], 0.12) : mix(th.base[0], -0.1);
    wrap(() => { const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, col + 'aa'); g.addColorStop(1, col + '00'); c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); }); }
  // grano
  for (let i = 0; i < 2600; i++) { const x = r() * N, y = r() * N, k = r(); c.fillStyle = k < 0.5 ? mix(th.base[0], -0.08 - r() * 0.12) : mix(th.base[0], 0.08 + r() * 0.12); c.globalAlpha = 0.5 + r() * 0.5; c.fillRect(x, y, 1 + r() * 1.4, 1 + r() * 1.4); }
  c.globalAlpha = 1;
  // detalle propio de cada temática
  const strokes = (n, f) => { for (let i = 0; i < n; i++) { const x = r() * N, y = r() * N; wrap(() => f(x, y)); } };
  if (tema === 'playa' || tema === 'desierto') strokes(22, (x, y) => { c.strokeStyle = tema === 'playa' ? 'rgba(255,255,240,.28)' : 'rgba(150,95,40,.22)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 22, y); c.quadraticCurveTo(x, y - 5, x + 22, y); c.stroke(); });
  if (tema === 'jungla') strokes(420, (x, y) => { c.strokeStyle = r() < 0.5 ? 'rgba(40,90,30,.5)' : 'rgba(120,180,80,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 3, y - 3 - r() * 4); c.stroke(); });
  if (tema === 'nieve') strokes(160, (x, y) => { c.fillStyle = r() < 0.6 ? 'rgba(255,255,255,.9)' : 'rgba(160,200,235,.5)'; c.fillRect(x, y, 1.2, 1.2); });
  if (tema === 'volcan' || tema === 'tormenta' || tema === 'cristal' || tema === 'gruta') strokes(14, (x, y) => { c.strokeStyle = tema === 'volcan' ? 'rgba(10,6,6,.5)' : tema === 'cristal' ? 'rgba(150,130,255,.25)' : 'rgba(10,15,20,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) c.lineTo(x + (k + 1) * 8 * (r() < 0.5 ? 1 : -1) * 0.6, y + (k + 1) * 6 * (r() - 0.3)); c.stroke(); });
  if (tema === 'fantasma') strokes(30, (x, y) => { c.fillStyle = 'rgba(15,25,30,.25)'; c.beginPath(); c.ellipse(x, y, 10 + r() * 14, 4 + r() * 5, r() * 3, 0, TAU); c.fill(); });
  if (tema === 'gruta') strokes(90, (x, y) => { c.fillStyle = 'rgba(80,200,170,.18)'; c.beginPath(); c.arc(x, y, 1 + r() * 2.5, 0, TAU); c.fill(); });
  TEX.set(tema, cv); return cv;
}
const PAT = new WeakMap();
function pattern(c, tema) { let m = PAT.get(c); if (!m) { m = {}; PAT.set(c, m); } if (!m[tema]) m[tema] = c.createPattern(texture(tema), 'repeat'); return m[tema]; }

// Suelo infinito: textura + variaciones grandes + objetos + detalles.
function drawGround(c, tema, cx, cy, hw, hh, t = 0) {
  const th = TEMAS[tema] || TEMAS.playa, cat = CAT[tema] || CAT.playa, det = DET[tema], T = 110;
  const X0 = cx - hw - T, Y0 = cy - hh - T, X1 = cx + hw + T, Y1 = cy + hh + T;
  c.fillStyle = pattern(c, tema); c.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
  // variaciones grandes de tono (rompen la repetición)
  const B = 420;
  for (let by = Math.floor(Y0 / B); by <= Math.floor(Y1 / B); by++) for (let bx = Math.floor(X0 / B); bx <= Math.floor(X1 / B); bx++) {
    const h = hash(bx * 3 + 11, by * 5 - 7), x = bx * B + hash(bx, by + 99) * B, y = by * B + hash(bx - 31, by) * B, rad = 180 + h * 160;
    const col = h < 0.5 ? mix(th.base[0], 0.12) : mix(th.base[0], -0.14);
    const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, col + '88'); g.addColorStop(1, col + '00'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  const x0 = Math.floor(X0 / T), x1 = Math.floor(X1 / T), y0 = Math.floor(Y0 / T), y1 = Math.floor(Y1 / T);
  // detalles pequeños
  if (det) for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
    const r = mulberry((ix * 73856093) ^ (iy * 19349663)); const n = 2 + (r() * 3 | 0);
    for (let k = 0; k < n; k++) det(c, ix * T + r() * T, iy * T + r() * T, r);
  }
  // objetos (ordenados por fila para que los de abajo tapen a los de arriba)
  const tot = cat.reduce((a, e) => a + e[0], 0);
  for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
    const h = hash(ix, iy); if (h > 0.46) continue;
    let pick = hash(ix + 17, iy - 23) * tot, i = 0; while (pick > cat[i][0]) { pick -= cat[i][0]; i++; }
    const e = cat[i], v = (hash(ix - 5, iy + 9) * 3) | 0;
    const x = ix * T + 20 + hash(ix + 999, iy - 777) * 70, y = iy * T + 20 + hash(ix - 55, iy + 31) * 70;
    if (e[3]) e[3](c, x, y, t, h);
    const s = spriteDeco(tema, i, v, e[2]); c.drawImage(s.cv, x - s.ox, y - s.oy, s.W, s.H);
  }
}

// Vista previa de la isla para el menú (vista aérea)
function drawPreview(c, tema, w, h, t, seed = 0) {
  const th = TEMAS[tema] || TEMAS.playa;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, th.agua[0]); g.addColorStop(1, th.agua[1]);
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2;
  for (let i = 0; i < 14; i++) { const wx = (hash(i, seed) * w + t * 12) % (w + 40) - 20, wy = hash(seed, i) * h; c.beginPath(); c.arc(wx, wy, 8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38;
  const blob = (k) => {
    c.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = i / 48 * TAU, r = R * k * (1 + 0.1 * Math.sin(3 * a + seed) + 0.06 * Math.sin(7 * a + seed * 2) + 0.04 * Math.sin(11 * a));
      c.lineTo(cx + Math.cos(a) * r * 1.35, cy + Math.sin(a) * r);
    }
    c.closePath();
  };
  c.fillStyle = 'rgba(255,255,255,.35)'; blob(1.1 + Math.sin(t * 1.5) * 0.01); c.fill();
  c.fillStyle = th.orilla; blob(1.04); c.fill();
  blob(0.95); c.save(); c.clip();
  c.translate(cx, cy); c.scale(0.5, 0.5);
  drawGround(c, tema, 0, 0, w, h, t);
  c.restore();
  // elemento central de cada isla
  c.save(); c.translate(cx, cy);
  if (tema === 'volcan') {
    c.fillStyle = '#2a2020'; c.beginPath(); c.moveTo(-70, 30); c.lineTo(-18, -50); c.lineTo(18, -50); c.lineTo(70, 30); c.closePath(); c.fill();
    c.fillStyle = '#ff7a1a'; c.beginPath(); c.ellipse(0, -50, 18, 6, 0, 0, TAU); c.fill();
    c.strokeStyle = '#ff7a1a'; c.lineWidth = 4; c.beginPath(); c.moveTo(-6, -46); c.lineTo(-14, -20); c.lineTo(-8, 4); c.stroke();
    for (let k = 0; k < 3; k++) { const ph = (t * 0.4 + k / 3) % 1; c.fillStyle = `rgba(90,80,80,${0.5 * (1 - ph)})`; c.beginPath(); c.arc(Math.sin(ph * 5) * 8, -58 - ph * 50, 10 + ph * 16, 0, TAU); c.fill(); }
  } else if (tema === 'nieve') {
    for (const [ox, s] of [[-40, 0.8], [20, 1]]) {
      c.fillStyle = '#7f93a6'; c.beginPath(); c.moveTo(ox - 50 * s, 30); c.lineTo(ox, -60 * s); c.lineTo(ox + 50 * s, 30); c.closePath(); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(ox - 20 * s, -24 * s); c.lineTo(ox, -60 * s); c.lineTo(ox + 20 * s, -24 * s); c.lineTo(ox + 6 * s, -30 * s); c.lineTo(ox - 6 * s, -22 * s); c.closePath(); c.fill();
    }
  } else if (tema === 'fantasma') {
    c.rotate(-0.25);
    c.fillStyle = '#3d2f24'; c.beginPath(); c.moveTo(-70, -8); c.lineTo(60, -14); c.quadraticCurveTo(80, 0, 60, 14); c.lineTo(-70, 8); c.closePath(); c.fill();
    c.fillStyle = '#5c4630'; c.fillRect(-10, -60, 6, 60);
    c.fillStyle = 'rgba(220,220,200,.7)'; c.beginPath(); c.moveTo(-4, -56); c.lineTo(26, -40); c.lineTo(-4, -22); c.closePath(); c.fill();
  } else if (tema === 'tormenta') {
    c.fillStyle = 'rgba(40,48,60,.85)';
    for (const [ox, oy, r] of [[-50, -70, 34], [-10, -82, 40], [36, -72, 32], [10, -60, 30]]) { c.beginPath(); c.arc(ox + Math.sin(t + ox) * 3, oy, r, 0, TAU); c.fill(); }
    if (Math.sin(t * 2.3) > 0.8) { c.strokeStyle = '#fff6b0'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -55); c.lineTo(-12, -20); c.lineTo(4, -18); c.lineTo(-8, 18); c.stroke(); }
  } else if (tema === 'cristal') {
    for (const [ox, hh, w, col] of [[-40, 70, 22, '#9b8cff'], [0, 100, 28, '#6fe3ff'], [38, 64, 20, '#ff9bd8']]) {
      c.fillStyle = col; c.strokeStyle = '#ffffffaa'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(ox - w / 2, 30); c.lineTo(ox - w / 2, 30 - hh * 0.75); c.lineTo(ox, 30 - hh); c.lineTo(ox + w / 2, 30 - hh * 0.75); c.lineTo(ox + w / 2, 30); c.closePath(); c.fill(); c.stroke();
    }
  } else if (tema === 'gruta') {
    c.fillStyle = '#3c4650'; c.beginPath(); c.ellipse(0, 0, 80, 50, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#060c10'; c.beginPath(); c.ellipse(0, 4, 46, 34, 0, Math.PI, 0); c.fill();
    const g = c.createRadialGradient(0, -6, 2, 0, -6, 40); g.addColorStop(0, 'rgba(80,240,220,.6)'); g.addColorStop(1, 'rgba(80,240,220,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -6, 40, 0, TAU); c.fill();
  } else if (tema === 'desierto') {
    c.fillStyle = '#d9a35f'; c.beginPath(); c.moveTo(-60, 26); c.lineTo(-10, -40); c.lineTo(40, 26); c.closePath(); c.fill();
    c.fillStyle = '#c38c4c'; c.beginPath(); c.moveTo(-10, -40); c.lineTo(40, 26); c.lineTo(10, 26); c.closePath(); c.fill();
    c.fillStyle = '#56b4d3'; c.beginPath(); c.ellipse(55, -10, 18, 8, 0, 0, TAU); c.fill();
  }
  c.restore();
  // niebla / tono
  if (tema === 'fantasma') { c.fillStyle = 'rgba(200,230,230,.12)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse((k * 140 + t * 15) % (w + 200) - 100, h * (0.25 + k * 0.17), 120, 30, 0, 0, TAU); c.fill(); } }
  c.restore();
}

// ---------------- clima (partículas en pantalla) ----------------
const CLIMA = {
  nieve:    { n: 80, spawn: (W, H, init) => ({ x: Math.random() * W, y: init ? Math.random() * H : -10, vx: (Math.random() - 0.5) * 30, vy: 30 + Math.random() * 40, r: 1.5 + Math.random() * 2.5, ph: Math.random() * TAU }) },
  volcan:   { n: 50, spawn: (W, H, init) => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 10, vx: (Math.random() - 0.5) * 20, vy: -(30 + Math.random() * 50), r: 1 + Math.random() * 2, ph: Math.random() * TAU }) },
  jungla:   { n: 26, spawn: (W, H) => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, r: 2, ph: Math.random() * TAU }) },
  desierto: { n: 34, spawn: (W, H, init) => ({ x: init ? Math.random() * W : -30, y: Math.random() * H, vx: 260 + Math.random() * 160, vy: (Math.random() - 0.5) * 20, r: 10 + Math.random() * 25, ph: 0 }) },
  fantasma: { n: 12, spawn: (W, H, init) => ({ x: init ? Math.random() * W : -200, y: Math.random() * H, vx: 10 + Math.random() * 15, vy: 0, r: 90 + Math.random() * 120, ph: Math.random() * TAU }) },
  tormenta: { n: 90, spawn: (W, H, init) => ({ x: Math.random() * (W + 200), y: init ? Math.random() * H : -20, vx: -140, vy: 700 + Math.random() * 200, r: 12 + Math.random() * 10, ph: 0 }) },
  cristal:  { n: 40, spawn: (W, H) => ({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: -6, r: 1 + Math.random() * 2, ph: Math.random() * TAU }) },
  gruta:    { n: 40, spawn: (W, H, init) => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 10, vx: (Math.random() - 0.5) * 10, vy: -(8 + Math.random() * 18), r: 1.5 + Math.random() * 2, ph: Math.random() * TAU }) },
  playa:    { n: 6, spawn: (W, H, init) => ({ x: init ? Math.random() * W : -40, y: Math.random() * H * 0.6, vx: 40 + Math.random() * 30, vy: (Math.random() - 0.5) * 10, r: 1, ph: Math.random() * TAU }) },
};
const AMB = { tema: null, ps: [] };
function ambient(c, tema, W, H, dt, t) {
  const cfg = CLIMA[tema];
  if (AMB.tema !== tema) { AMB.tema = tema; AMB.ps = cfg ? Array.from({ length: cfg.n }, () => cfg.spawn(W, H, true)) : []; }
  if (!cfg) return;
  for (let i = 0; i < AMB.ps.length; i++) {
    const p = AMB.ps[i]; p.ph += dt * 2;
    p.x += (p.vx + (tema === 'nieve' ? Math.sin(p.ph) * 15 : 0)) * dt; p.y += p.vy * dt;
    if (tema === 'jungla') { p.vx += (Math.random() - 0.5) * 30 * dt; p.vy += (Math.random() - 0.5) * 30 * dt; }
    if (p.x < -260 || p.x > W + 260 || p.y < -30 || p.y > H + 30) AMB.ps[i] = cfg.spawn(W, H, tema === 'jungla');
  }
  for (const p of AMB.ps) {
    switch (tema) {
      case 'nieve': c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill(); break;
      case 'volcan': c.fillStyle = `rgba(255,${140 + Math.sin(p.ph * 3) * 60 | 0},40,${0.6 + Math.sin(p.ph * 4) * 0.3})`; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill(); break;
      case 'jungla': { const a = 0.4 + Math.sin(p.ph * 2) * 0.4; c.fillStyle = `rgba(220,255,120,${a})`; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill(); c.fillStyle = `rgba(220,255,120,${a * 0.25})`; c.beginPath(); c.arc(p.x, p.y, p.r * 4, 0, TAU); c.fill(); break; }
      case 'desierto': c.strokeStyle = 'rgba(240,210,150,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.r, p.y); c.stroke(); break;
      case 'fantasma': c.fillStyle = 'rgba(200,225,230,.07)'; c.beginPath(); c.ellipse(p.x, p.y, p.r, p.r * 0.35, 0, 0, TAU); c.fill(); break;
      case 'tormenta': c.strokeStyle = 'rgba(190,210,235,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + p.vx * 0.02, p.y - p.r); c.stroke(); break;
      case 'cristal': { const a = Math.max(0, Math.sin(p.ph * 2)); c.fillStyle = `rgba(200,240,255,${a})`; c.beginPath(); c.moveTo(p.x, p.y - p.r * 3); c.lineTo(p.x + p.r, p.y); c.lineTo(p.x, p.y + p.r * 3); c.lineTo(p.x - p.r, p.y); c.closePath(); c.fill(); break; }
      case 'gruta': { const a = 0.4 + Math.sin(p.ph * 2) * 0.3; c.fillStyle = `rgba(120,255,220,${a})`; c.beginPath(); c.arc(p.x + Math.sin(p.ph) * 6, p.y, p.r, 0, TAU); c.fill(); break; }
      case 'playa': { // gaviotas lejanas
        c.strokeStyle = 'rgba(60,60,60,.45)'; c.lineWidth = 1.5; const f = Math.sin(p.ph * 3) * 3;
        c.beginPath(); c.moveTo(p.x - 7, p.y - f); c.quadraticCurveTo(p.x - 3, p.y - 4, p.x, p.y); c.quadraticCurveTo(p.x + 3, p.y - 4, p.x + 7, p.y - f); c.stroke(); break;
      }
    }
  }
}
// Tono de color de la isla sobre el mundo
function overlay(c, tema, W, H, t) {
  const vig = (col, a) => { const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(${col},${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); };
  switch (tema) {
    case 'jungla': vig('10,40,10', 0.35); break;
    case 'desierto': c.fillStyle = 'rgba(255,170,60,.07)'; c.fillRect(0, 0, W, H); vig('120,60,10', 0.25); break;
    case 'nieve': c.fillStyle = 'rgba(190,225,255,.08)'; c.fillRect(0, 0, W, H); vig('120,160,200', 0.3); break;
    case 'volcan': vig('140,20,0', 0.45 + Math.sin(t * 1.5) * 0.05); break;
    case 'fantasma': c.fillStyle = 'rgba(10,25,45,.32)'; c.fillRect(0, 0, W, H); vig('0,0,0', 0.55); break;
    case 'tormenta': c.fillStyle = 'rgba(20,28,40,.3)'; c.fillRect(0, 0, W, H); vig('0,0,10', 0.5); break;
    case 'cristal': vig('40,10,70', 0.5); break;
    case 'gruta': c.fillStyle = 'rgba(0,8,14,.35)'; c.fillRect(0, 0, W, H); vig('0,0,0', 0.7); break;
    default: vig('0,40,80', 0.15);
  }
}

window.MDR_ISLAS = { TEMAS, drawGround, drawPreview, ambient, overlay };
})();
