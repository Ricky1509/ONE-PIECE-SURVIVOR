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

// ---------------- decoraciones ----------------
function sombra(c, x, y, rx, ry) { c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); }
function palmera(c, x, y, h) {
  sombra(c, x + 8, y + 4, 30, 10);
  c.strokeStyle = '#8a5a2b'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 8, y - 25, x + 2, y - 48); c.stroke();
  c.fillStyle = '#2e8b57';
  for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + h * 40; c.beginPath(); c.ellipse(x + 2 + Math.cos(a) * 16, y - 48 + Math.sin(a) * 9, 18, 6, a, 0, TAU); c.fill(); }
  c.fillStyle = '#6b4226'; c.beginPath(); c.arc(x + 2, y - 46, 4, 0, TAU); c.fill();
}
function roca(c, x, y, s, col, luz) {
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 14 * s, 9 * s, 0.3, 0, TAU); c.fill();
  c.fillStyle = luz; c.beginPath(); c.ellipse(x - 3 * s, y - 3 * s, 7 * s, 4 * s, 0.3, 0, TAU); c.fill();
}
const DECO = {
  playa(c, h, x, y, ix, iy) {
    if (h < 0.04) palmera(c, x, y, h);
    else if (h < 0.10) roca(c, x, y, 1, '#9c8f7a', '#b8ab94');
    else if (h < 0.16) { c.fillStyle = '#e8774a'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, r = k % 2 ? 3 : 8; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill(); }
    else if (h < 0.20) { c.fillStyle = '#7ec8d8'; c.beginPath(); c.ellipse(x, y, 26, 12, h * 20, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x - 6, y - 3, 8, 2, h * 20, 0, TAU); c.fill(); }
    else if (h < 0.23) { // concha
      c.fillStyle = '#f6c1c7'; c.beginPath(); c.moveTo(x, y + 6); for (let k = 0; k <= 6; k++) { const a = Math.PI + k / 6 * Math.PI; c.lineTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); } c.closePath(); c.fill();
      c.strokeStyle = '#d98c96'; c.lineWidth = 1; for (let k = 1; k < 6; k++) { const a = Math.PI + k / 6 * Math.PI; c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); c.stroke(); }
    }
    else return false;
    return true;
  },
  jungla(c, h, x, y, ix, iy) {
    if (h < 0.07) { // árbol grande
      sombra(c, x + 10, y + 10, 40, 16);
      c.fillStyle = '#5a3a1e'; c.fillRect(x - 4, y - 10, 8, 20);
      for (const [ox, oy, r, col] of [[-16, -16, 22, '#2f6b2a'], [16, -18, 20, '#2f6b2a'], [0, -32, 24, '#357a2f'], [-6, -22, 14, '#4c9a3c'], [10, -36, 10, '#5fb04a']]) { c.fillStyle = col; c.beginPath(); c.arc(x + ox, y + oy, r, 0, TAU); c.fill(); }
    } else if (h < 0.15) { // arbusto
      sombra(c, x + 4, y + 8, 22, 7);
      for (const [ox, oy, r] of [[-10, 0, 11], [9, 1, 10], [0, -7, 12]]) { c.fillStyle = '#3d7d33'; c.beginPath(); c.arc(x + ox, y + oy, r, 0, TAU); c.fill(); }
      c.fillStyle = '#5ea94b'; c.beginPath(); c.arc(x - 3, y - 10, 5, 0, TAU); c.fill();
      c.fillStyle = '#e74c3c'; for (const [ox, oy] of [[-8, -2], [6, -5], [2, 3]]) { c.beginPath(); c.arc(x + ox, y + oy, 2, 0, TAU); c.fill(); }
    } else if (h < 0.22) { // flores
      const cols = ['#ff7eb6', '#ffd166', '#c084fc', '#ff9f43'];
      for (let k = 0; k < 4; k++) {
        const fx = x + (hash(ix + k, iy * 3) - 0.5) * 40, fy = y + (hash(ix * 5, iy + k) - 0.5) * 30;
        c.fillStyle = cols[(k + ix) & 3]; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; c.beginPath(); c.arc(fx + Math.cos(a) * 3, fy + Math.sin(a) * 3, 2.4, 0, TAU); c.fill(); }
        c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(fx, fy, 1.6, 0, TAU); c.fill();
      }
    } else if (h < 0.28) { // helecho
      c.strokeStyle = '#2f6b2a'; c.lineWidth = 2;
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x, y + 6); c.quadraticCurveTo(x + k * 8, y - 6, x + k * 14, y - 4 + Math.abs(k) * 4); c.stroke(); }
    } else if (h < 0.31) { c.fillStyle = '#5b4a2e'; c.beginPath(); c.ellipse(x, y, 24, 11, h * 10, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.ellipse(x - 5, y - 2, 8, 2, h * 10, 0, TAU); c.fill(); }
    else return false;
    return true;
  },
  desierto(c, h, x, y, ix, iy) {
    if (h < 0.05) { // cactus
      sombra(c, x + 8, y + 4, 18, 6);
      c.fillStyle = '#3f8f4a'; c.strokeStyle = '#2b6a35'; c.lineWidth = 2;
      const cap = (rx, ry, w, hh) => { c.beginPath(); c.moveTo(rx, ry + hh); c.lineTo(rx, ry + w / 2); c.arc(rx + w / 2, ry + w / 2, w / 2, Math.PI, 0); c.lineTo(rx + w, ry + hh); c.closePath(); c.fill(); c.stroke(); };
      cap(x - 6, y - 40, 12, 40); cap(x - 18, y - 28, 9, 14); cap(x + 9, y - 32, 9, 16);
      c.fillRect(x - 13, y - 16, 8, 5); c.fillRect(x + 5, y - 18, 8, 5);
      c.fillStyle = '#ffd6e0'; c.beginPath(); c.arc(x, y - 40, 3, 0, TAU); c.fill();
    } else if (h < 0.11) roca(c, x, y, 1.1, '#b06a3f', '#cf8a5a');
    else if (h < 0.25) { // ondas de duna
      c.strokeStyle = 'rgba(160,105,45,.35)'; c.lineWidth = 2;
      for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x - 30, y + k * 8); c.quadraticCurveTo(x, y - 8 + k * 8, x + 30, y + k * 8); c.stroke(); }
    } else if (h < 0.30) { // matorral seco
      c.strokeStyle = '#8b6b3e'; c.lineWidth = 1.5;
      for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + h * 9; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * 6, y + Math.sin(a) * 12, x + Math.cos(a + .6) * 11, y + Math.sin(a + .6) * 8); c.stroke(); }
    } else return false;
    return true;
  },
  nieve(c, h, x, y, ix, iy) {
    if (h < 0.07) { // pino nevado
      sombra(c, x + 10, y + 6, 26, 9);
      c.fillStyle = '#5a3a1e'; c.fillRect(x - 3, y - 8, 6, 12);
      for (let k = 0; k < 3; k++) {
        const w = 26 - k * 6, yy = y - 8 - k * 14;
        c.fillStyle = '#245b40'; c.beginPath(); c.moveTo(x - w, yy); c.lineTo(x, yy - 22); c.lineTo(x + w, yy); c.closePath(); c.fill();
        c.fillStyle = '#fbfdff'; c.beginPath(); c.moveTo(x - w * 0.55, yy - 10); c.lineTo(x, yy - 22); c.lineTo(x + w * 0.55, yy - 10); c.quadraticCurveTo(x, yy - 6, x - w * 0.55, yy - 10); c.fill();
      }
    } else if (h < 0.14) { // hielo
      c.fillStyle = '#bfe3f5'; c.beginPath(); c.ellipse(x, y, 28, 13, h * 12, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 12, y - 2); c.lineTo(x - 2, y - 6); c.moveTo(x + 2, y + 3); c.lineTo(x + 12, y - 1); c.stroke();
    } else if (h < 0.20) { roca(c, x, y, 1, '#7f8c99', '#97a3ad'); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x - 2, y - 6, 10, 4, 0.3, 0, TAU); c.fill(); }
    else if (h < 0.28) { c.fillStyle = 'rgba(140,175,210,.35)'; c.beginPath(); c.ellipse(x + 3, y + 4, 26, 9, 0, 0, TAU); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(x, y, 24, 9, 0, 0, TAU); c.fill(); }
    else return false;
    return true;
  },
  volcan(c, h, x, y, ix, iy, t) {
    if (h < 0.06) { // charco de lava
      const pulse = 0.75 + Math.sin(t * 2 + h * 50) * 0.25;
      const g = c.createRadialGradient(x, y, 2, x, y, 40);
      g.addColorStop(0, `rgba(255,200,80,${0.9 * pulse})`); g.addColorStop(0.5, `rgba(255,90,20,${0.6 * pulse})`); g.addColorStop(1, 'rgba(255,60,0,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 40, 0, TAU); c.fill();
      c.fillStyle = '#ff7a1a'; c.beginPath(); c.ellipse(x, y, 22, 11, h * 9, 0, TAU); c.fill();
      c.fillStyle = '#ffd25e'; c.beginPath(); c.ellipse(x - 4, y - 2, 9, 4, h * 9, 0, TAU); c.fill();
    } else if (h < 0.14) { // grieta de lava
      c.strokeStyle = `rgba(255,${120 + Math.sin(t * 3 + h * 40) * 40 | 0},30,.9)`; c.lineWidth = 3; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x - 30, y - 6); c.lineTo(x - 14, y + 4); c.lineTo(x - 2, y - 6); c.lineTo(x + 12, y + 6); c.lineTo(x + 30, y - 2); c.stroke();
    } else if (h < 0.22) { // roca volcánica
      c.fillStyle = '#1f1a1a'; c.beginPath(); c.moveTo(x - 16, y + 6); c.lineTo(x - 10, y - 10); c.lineTo(x + 4, y - 14); c.lineTo(x + 16, y - 2); c.lineTo(x + 10, y + 8); c.closePath(); c.fill();
      c.fillStyle = '#4a3c3c'; c.beginPath(); c.moveTo(x - 8, y - 8); c.lineTo(x + 3, y - 11); c.lineTo(x + 6, y - 4); c.closePath(); c.fill();
    } else if (h < 0.26) { // fumarola
      c.fillStyle = '#2a2222'; c.beginPath(); c.ellipse(x, y, 10, 5, 0, 0, TAU); c.fill();
      for (let k = 0; k < 3; k++) { const ph = (t * 0.6 + k / 3 + h) % 1; c.fillStyle = `rgba(160,150,150,${0.35 * (1 - ph)})`; c.beginPath(); c.arc(x + Math.sin(ph * 6) * 4, y - ph * 40, 6 + ph * 10, 0, TAU); c.fill(); }
    } else return false;
    return true;
  },
  fantasma(c, h, x, y, ix, iy, t) {
    if (h < 0.05) { // mástil roto
      c.save(); c.translate(x, y); c.rotate(h * 30);
      c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-36, 4, 72, 8);
      c.fillStyle = '#5c4630'; c.fillRect(-36, -5, 72, 10); c.fillStyle = '#6f5640'; c.fillRect(-36, -5, 72, 3);
      c.fillStyle = '#d8d0b8'; c.beginPath(); c.moveTo(10, -5); c.lineTo(30, -26); c.lineTo(34, -5); c.closePath(); c.fill();
      c.restore();
    } else if (h < 0.11) { // barril
      sombra(c, x + 4, y + 10, 14, 5);
      c.fillStyle = '#6b4a2b'; c.beginPath(); c.ellipse(x, y, 12, 14, 0, 0, TAU); c.fill();
      c.strokeStyle = '#2b2b2b'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 12, y - 5); c.lineTo(x + 12, y - 5); c.moveTo(x - 12, y + 5); c.lineTo(x + 12, y + 5); c.stroke();
    } else if (h < 0.16) { // farol fantasma
      const fl = 0.7 + Math.sin(t * 4 + h * 80) * 0.3;
      const g = c.createRadialGradient(x, y - 10, 1, x, y - 10, 34); g.addColorStop(0, `rgba(150,255,200,${0.55 * fl})`); g.addColorStop(1, 'rgba(150,255,200,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y - 10, 34, 0, TAU); c.fill();
      c.fillStyle = '#2b2b2b'; c.fillRect(x - 6, y - 18, 12, 16); c.fillStyle = `rgba(190,255,220,${fl})`; c.fillRect(x - 4, y - 16, 8, 12);
    } else if (h < 0.22) roca(c, x, y, 1.2, '#2c353c', '#3c464e');
    else if (h < 0.30) { // algas
      c.strokeStyle = '#2d5a45'; c.lineWidth = 3;
      for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + k * 6, y + 6); c.quadraticCurveTo(x + k * 6 + Math.sin(t * 2 + k) * 6, y - 8, x + k * 8, y - 20); c.stroke(); }
    } else return false;
    return true;
  },
};

DECO.tormenta = function (c, h, x, y, ix, iy, t) {
  if (h < 0.06) { // árbol doblado por el viento
    sombra(c, x + 10, y + 4, 26, 8);
    c.strokeStyle = '#3d2b1f'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 6, y - 22, x + 22, y - 36); c.stroke();
    const sw = Math.sin(t * 3 + h * 50) * 3;
    for (const [ox, oy, r] of [[22, -40, 14], [34, -38, 11], [12, -44, 10]]) { c.fillStyle = '#3f5a3a'; c.beginPath(); c.ellipse(x + ox + sw, y + oy, r * 1.3, r * 0.8, 0.3, 0, TAU); c.fill(); }
  } else if (h < 0.14) { // charco con ondas de lluvia
    c.fillStyle = '#3c4f60'; c.beginPath(); c.ellipse(x, y, 26, 12, h * 9, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(200,220,240,.45)'; c.lineWidth = 1;
    for (let k = 0; k < 2; k++) { const q = (t * 1.5 + k * 0.5 + h * 7) % 1; c.beginPath(); c.ellipse(x + (k ? 8 : -6), y + (k ? -2 : 3), 3 + q * 9, (3 + q * 9) * 0.45, 0, 0, TAU); c.globalAlpha = 1 - q; c.stroke(); c.globalAlpha = 1; }
  } else if (h < 0.22) roca(c, x, y, 1.3, '#3d454d', '#58626b');
  else if (h < 0.32) { c.strokeStyle = '#4f6a48'; c.lineWidth = 2; const sw = Math.sin(t * 4 + h * 30) * 3; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 4, y + 4); c.quadraticCurveTo(x + k * 4 + 6 + sw, y - 4, x + k * 4 + 12 + sw, y - 8); c.stroke(); } }
  else return false;
  return true;
};
DECO.cristal = function (c, h, x, y, ix, iy, t) {
  const glow = 0.6 + Math.sin(t * 2 + h * 40) * 0.25, cols = ['#9b8cff', '#6fe3ff', '#ff9bd8'], col = cols[(ix + iy * 3 + 99) % 3 | 0] || cols[0];
  if (h < 0.08) { // racimo de cristales
    const g = c.createRadialGradient(x, y - 14, 2, x, y - 14, 46); g.addColorStop(0, col + Math.round(glow * 120).toString(16).padStart(2, '0')); g.addColorStop(1, col + '00');
    c.fillStyle = g; c.beginPath(); c.arc(x, y - 14, 46, 0, TAU); c.fill();
    for (const [ox, hh, w, a] of [[-10, 30, 8, -0.3], [0, 44, 10, 0], [11, 26, 7, 0.35], [5, 18, 6, 0.6]]) {
      c.save(); c.translate(x + ox, y); c.rotate(a); c.fillStyle = col; c.strokeStyle = '#ffffffaa'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -hh * 0.75); c.lineTo(0, -hh); c.lineTo(w / 2, -hh * 0.75); c.lineTo(w / 2, 0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-w / 2 + 1, -hh * 0.7, w * 0.3, hh * 0.6); c.restore();
    }
  } else if (h < 0.18) { c.fillStyle = col; c.globalAlpha = 0.8; c.beginPath(); c.moveTo(x - 4, y + 3); c.lineTo(x, y - 12); c.lineTo(x + 4, y + 3); c.closePath(); c.fill(); c.globalAlpha = 1; }
  else if (h < 0.24) roca(c, x, y, 1.2, '#26223a', '#3a3554');
  else if (h < 0.32) { c.fillStyle = `rgba(120,240,255,${glow * 0.6})`; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x + (hash(ix + k, iy) - 0.5) * 40, y + (hash(ix, iy + k) - 0.5) * 30, 1.8, 0, TAU); c.fill(); } }
  else return false;
  return true;
};
DECO.gruta = function (c, h, x, y, ix, iy, t) {
  const glow = 0.6 + Math.sin(t * 1.5 + h * 60) * 0.3;
  if (h < 0.08) { // hongos luminosos
    for (const [ox, oy, r, col] of [[-8, 0, 9, '#4ff0d0'], [7, 4, 7, '#ff7ad9'], [0, -6, 6, '#4ff0d0']]) {
      const g = c.createRadialGradient(x + ox, y + oy - 6, 1, x + ox, y + oy - 6, r * 3); g.addColorStop(0, col + Math.round(glow * 140).toString(16).padStart(2, '0')); g.addColorStop(1, col + '00');
      c.fillStyle = g; c.beginPath(); c.arc(x + ox, y + oy - 6, r * 3, 0, TAU); c.fill();
      c.fillStyle = '#d8d2c0'; c.fillRect(x + ox - 1.5, y + oy - 6, 3, 8);
      c.fillStyle = col; c.beginPath(); c.arc(x + ox, y + oy - 6, r, Math.PI, 0); c.fill();
    }
  } else if (h < 0.15) { // estalagmita
    sombra(c, x + 4, y + 2, 12, 4); c.fillStyle = '#4a5560'; c.beginPath(); c.moveTo(x - 10, y + 2); c.lineTo(x - 2, y - 34); c.lineTo(x + 3, y - 30); c.lineTo(x + 10, y + 2); c.closePath(); c.fill();
    c.fillStyle = '#5f6b77'; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x - 2, y - 30); c.lineTo(x + 1, y); c.closePath(); c.fill();
  } else if (h < 0.22) { // laguna luminosa
    const g = c.createRadialGradient(x, y, 2, x, y, 34); g.addColorStop(0, `rgba(80,240,220,${glow * 0.8})`); g.addColorStop(1, 'rgba(80,240,220,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, 34, 0, TAU); c.fill(); c.fillStyle = '#0f4a52'; c.beginPath(); c.ellipse(x, y, 22, 10, h * 8, 0, TAU); c.fill();
  } else if (h < 0.35) { c.fillStyle = `rgba(120,255,220,${glow * 0.5})`; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + (hash(ix + k, iy) - 0.5) * 40, y + (hash(ix, iy + k) - 0.5) * 30, 1.6, 0, TAU); c.fill(); } }
  else return false;
  return true;
};

// Suelo infinito por baldosas. cx, cy = centro de la cámara; hw, hh = media vista
function drawGround(c, tema, cx, cy, hw, hh, t = 0) {
  const th = TEMAS[tema] || TEMAS.playa, deco = DECO[tema] || DECO.playa, T = 110;
  const x0 = Math.floor((cx - hw - T) / T), x1 = Math.floor((cx + hw + T) / T), y0 = Math.floor((cy - hh - T) / T), y1 = Math.floor((cy + hh + T) / T);
  for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
    const h = hash(ix, iy), X = ix * T, Y = iy * T;
    c.fillStyle = h < 0.5 ? th.base[0] : th.base[1]; c.fillRect(X, Y, T + 1, T + 1);
    if (tema === 'fantasma' && hash(ix + 7, iy - 3) < 0.35) { // tablones de naufragio
      c.fillStyle = '#4d3f33'; c.fillRect(X + 6, Y + 6, T - 12, T - 12);
      c.strokeStyle = '#3a2f26'; c.lineWidth = 2;
      for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(X + 6, Y + 6 + k * (T - 12) / 5); c.lineTo(X + T - 6, Y + 6 + k * (T - 12) / 5); c.stroke(); }
    }
  }
  // decoraciones en una segunda pasada para que no queden tapadas por la baldosa vecina
  for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
    const h = hash(ix, iy), X = ix * T, Y = iy * T;
    const dx = X + 20 + hash(ix + 999, iy - 777) * 70, dy = Y + 20 + hash(ix - 55, iy + 31) * 70;
    if (!deco(c, h, dx, dy, ix, iy, t) && h < 0.5) {
      c.fillStyle = th.speck;
      for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(dx + hash(ix + k, iy) * 40 - 20, dy + hash(ix, iy + k) * 40 - 20, 1.6, 0, TAU); c.fill(); }
    }
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
