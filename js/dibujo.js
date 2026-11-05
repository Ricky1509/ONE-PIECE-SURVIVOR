// =====================================================================
//  Dibujos procedurales (personajes y enemigos originales).
//  Se usan cuando no hay sprite y para generar los sprites de ejemplo
//  con tools/generar-sprites.js.
// =====================================================================
(() => {
const TAU = Math.PI * 2;

function sombra(c, r) {
  c.fillStyle = 'rgba(0,0,0,.2)';
  c.beginPath(); c.ellipse(0, r * 0.95, r * 0.9, r * 0.32, 0, 0, TAU); c.fill();
}

// ---- utilidades ----
const OL = '#1b1410';
function shade(hex, k) { // k>0 aclara, k<0 oscurece
  const n = parseInt(hex.slice(1), 16), ch = [n >> 16, (n >> 8) & 255, n & 255];
  const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return '#' + ch.map(v => f(v).toString(16).padStart(2, '0')).join('');
}
function rr(c, x, y, w, h, rad) {
  c.beginPath(); c.moveTo(x + rad, y); c.arcTo(x + w, y, x + w, y + h, rad); c.arcTo(x + w, y + h, x, y + h, rad);
  c.arcTo(x, y + h, x, y, rad); c.arcTo(x, y, x + w, y, rad); c.closePath();
}
function fs(c, fill, lw) { c.fillStyle = fill; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = OL; c.stroke(); } }

// Arma en la mano (dibujada con el origen en la mano, mirando a la derecha)
function armaEnMano(c, tipo, r, F, lw, t) {
  switch (tipo) {
    case 'sable':
      c.rotate(-1.0);
      c.beginPath(); c.moveTo(r * 0.12, -r * 0.07); c.quadraticCurveTo(r * 0.7, -r * 0.2, r * 1.15, -r * 0.02); c.lineTo(r * 1.08, r * 0.07);
      c.quadraticCurveTo(r * 0.65, -r * 0.04, r * 0.12, r * 0.06); c.closePath(); fs(c, F('#e3e9ef'), lw);
      c.beginPath(); c.moveTo(r * 0.2, -r * 0.03); c.quadraticCurveTo(r * 0.7, -r * 0.14, r * 1.05, -r * 0.01); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = lw * 0.6; c.stroke();
      c.beginPath(); c.arc(r * 0.1, 0, r * 0.14, -Math.PI * 0.6, Math.PI * 0.6); c.strokeStyle = F('#f6c945'); c.lineWidth = lw * 1.6; c.stroke();
      rr(c, -r * 0.2, -r * 0.05, r * 0.28, r * 0.1, r * 0.04); fs(c, F('#5a3519'), lw * 0.8);
      break;
    case 'pistola':
      c.rotate(-0.15);
      rr(c, 0, -r * 0.16, r * 0.62, r * 0.12, r * 0.04); fs(c, F('#5d6670'), lw);
      rr(c, r * 0.5, -r * 0.18, r * 0.12, r * 0.16, r * 0.03); fs(c, F('#f6c945'), lw * 0.8);
      c.beginPath(); c.moveTo(r * 0.05, -r * 0.08); c.lineTo(r * 0.25, -r * 0.08); c.lineTo(r * 0.08, r * 0.2); c.lineTo(-r * 0.12, r * 0.16); c.closePath(); fs(c, F('#7b4a24'), lw);
      c.beginPath(); c.arc(r * 0.06, -r * 0.2, r * 0.05, 0, Math.PI * 2); fs(c, F('#f6c945'), lw * 0.6);
      break;
    case 'rayo': {
      rr(c, -r * 0.05, -r * 1.05, r * 0.1, r * 1.35, r * 0.05); fs(c, F('#6b4226'), lw);
      const glow = 0.75 + Math.sin(t * 8) * 0.15;
      const g = c.createRadialGradient(0, -r * 1.15, 1, 0, -r * 1.15, r * 0.45 * glow);
      g.addColorStop(0, 'rgba(255,255,220,.95)'); g.addColorStop(0.5, 'rgba(255,230,90,.55)'); g.addColorStop(1, 'rgba(255,200,0,0)');
      c.fillStyle = g; c.beginPath(); c.arc(0, -r * 1.15, r * 0.45, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(0, -r * 1.15, r * 0.17, 0, Math.PI * 2); fs(c, F('#fff3a0'), lw);
      c.beginPath(); c.moveTo(-r * 0.2, -r * 1.02); c.quadraticCurveTo(0, -r * 0.92, r * 0.2, -r * 1.02); c.strokeStyle = F('#f6c945'); c.lineWidth = lw * 1.4; c.stroke();
      break;
    }
    case 'canon':
      c.rotate(-0.25);
      c.beginPath(); c.moveTo(-r * 0.05, -r * 0.14); c.lineTo(r * 0.62, -r * 0.2); c.lineTo(r * 0.7, -r * 0.3); c.lineTo(r * 0.78, -r * 0.3);
      c.lineTo(r * 0.78, r * 0.12); c.lineTo(r * 0.7, r * 0.12); c.lineTo(r * 0.62, r * 0.02); c.lineTo(-r * 0.05, r * 0.06); c.closePath();
      fs(c, F('#2f3640'), lw);
      rr(c, r * 0.15, -r * 0.18, r * 0.08, r * 0.26, r * 0.02); fs(c, F('#f6c945'), lw * 0.6);
      rr(c, -r * 0.25, -r * 0.02, r * 0.3, r * 0.22, r * 0.05); fs(c, F('#7b4a24'), lw);
      break;
    case 'hielo': {
      const g2 = c.createRadialGradient(r * 0.15, -r * 0.2, 1, r * 0.15, -r * 0.2, r * 0.5);
      g2.addColorStop(0, 'rgba(220,250,255,.9)'); g2.addColorStop(1, 'rgba(120,200,255,0)');
      c.fillStyle = g2; c.beginPath(); c.arc(r * 0.15, -r * 0.2, r * 0.5, 0, Math.PI * 2); c.fill();
      c.beginPath();
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + t * 2, rad = k % 2 ? r * 0.12 : r * 0.24; c.lineTo(r * 0.15 + Math.cos(a) * rad, -r * 0.2 + Math.sin(a) * rad); }
      c.closePath(); fs(c, F('#aee6ff'), lw * 0.8);
      break;
    }
    case 'arpon':
      c.rotate(-1.2);
      rr(c, -r * 0.45, -r * 0.04, r * 1.45, r * 0.08, r * 0.03); fs(c, F('#8a5a2b'), lw * 0.8);
      c.beginPath(); c.moveTo(r * 1.0, -r * 0.12); c.lineTo(r * 1.3, 0); c.lineTo(r * 1.0, r * 0.12); c.lineTo(r * 1.06, 0); c.closePath(); fs(c, F('#cfd8dc'), lw * 0.8);
      c.beginPath(); c.moveTo(r * 0.95, -r * 0.04); c.lineTo(r * 0.85, -r * 0.16); c.moveTo(r * 0.95, r * 0.04); c.lineTo(r * 0.85, r * 0.16); c.strokeStyle = F('#cfd8dc'); c.lineWidth = lw; c.stroke();
      break;
    case 'tambor':
      c.translate(-r * 0.05, r * 0.15);
      c.beginPath(); c.ellipse(0, r * 0.18, r * 0.32, r * 0.1, 0, 0, Math.PI * 2); fs(c, F('#7b2d26'), lw);
      rr(c, -r * 0.32, -r * 0.12, r * 0.64, r * 0.3, r * 0.02); fs(c, F('#c0392b'), lw);
      c.strokeStyle = F('#f6c945'); c.lineWidth = lw * 0.8; c.beginPath();
      for (let k = 0; k < 4; k++) { const x0 = -r * 0.32 + k * r * 0.16; c.moveTo(x0, -r * 0.1); c.lineTo(x0 + r * 0.16, r * 0.16); }
      c.stroke();
      c.beginPath(); c.ellipse(0, -r * 0.12, r * 0.32, r * 0.1, 0, 0, Math.PI * 2); fs(c, F('#f5ecd7'), lw);
      c.save(); c.rotate(-0.8 + Math.sin(t * 10) * 0.3); rr(c, 0, -r * 0.5, r * 0.06, r * 0.45, r * 0.03); fs(c, F('#8a5a2b'), lw * 0.6);
      c.beginPath(); c.arc(r * 0.03, -r * 0.52, r * 0.07, 0, Math.PI * 2); fs(c, F('#f5ecd7'), lw * 0.6); c.restore();
      break;
    case 'viento':
      c.strokeStyle = 'rgba(200,240,255,.85)'; c.lineWidth = lw;
      for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(r * 0.1, -r * 0.15, r * (0.15 + k * 0.1), t * 6 + k, t * 6 + k + 3.5); c.stroke(); }
      break;
    case 'ancla':
      c.translate(r * 0.1, r * 0.1); c.rotate(0.45);
      c.strokeStyle = F('#4b5a69'); c.lineWidth = r * 0.12;
      c.beginPath(); c.moveTo(0, r * 0.15); c.lineTo(0, -r * 0.75); c.moveTo(-r * 0.22, -r * 0.55); c.lineTo(r * 0.22, -r * 0.55); c.stroke();
      c.beginPath(); c.arc(0, -r * 0.05, r * 0.3, 0.15, Math.PI - 0.15); c.stroke();
      c.beginPath(); c.arc(0, -r * 0.84, r * 0.1, 0, Math.PI * 2); c.lineWidth = r * 0.07; c.stroke();
      break;
  }
}

// Pirata jugable (chibi con contorno). d = bloque `dibujo` del personaje en config.js
function pirata(c, x, y, r, d, face, t, moving, flash, conSombra = true) {
  c.save(); c.translate(x, y);
  if (conSombra) sombra(c, r);
  const fx = Math.cos(face) >= -0.01 ? 1 : -1;
  const ph = t * 12, sw = moving ? Math.sin(ph) : 0;
  c.translate(0, moving ? -Math.abs(Math.sin(ph)) * r * 0.12 : Math.sin(t * 3) * r * 0.025);
  c.scale(fx, 1);
  c.lineJoin = 'round'; c.lineCap = 'round';
  const F = col => flash ? '#fff' : col, lw = Math.max(1.2, r * 0.065);
  const coat = d.color, shirt = d.camisa || '#f5ecd7', pants = d.pantalon || '#34314a', hair = d.pelo || '#3a2416';

  // capa / faldones traseros
  if (d.capa) {
    c.beginPath(); c.moveTo(-r * 0.45, -r * 0.2);
    c.quadraticCurveTo(-r * 1.0 - sw * r * 0.08, r * 0.35, -r * 0.85 - sw * r * 0.15, r * 0.9);
    c.quadraticCurveTo(-r * 0.4, r * 0.8, r * 0.1, r * 0.85); c.lineTo(r * 0.35, -r * 0.15); c.closePath();
    fs(c, F(d.capa), lw);
  }
  // pelo largo (detrás)
  if (d.peinado === 'largo') {
    c.beginPath(); c.moveTo(-r * 0.6, -r * 1.0);
    c.quadraticCurveTo(-r * 1.0, -r * 0.3, -r * 0.75 - sw * r * 0.08, r * 0.3);
    c.quadraticCurveTo(-r * 0.45, r * 0.15, -r * 0.3, r * 0.22);
    c.quadraticCurveTo(-r * 0.15, -r * 0.2, r * 0.05, -r * 0.5); c.closePath();
    fs(c, F(shade(hair, -0.15)), lw);
  }
  // coleta (detrás)
  if (d.peinado === 'coleta') {
    c.beginPath(); c.moveTo(-r * 0.45, -r * 1.05);
    c.quadraticCurveTo(-r * 1.05, -r * 0.95, -r * 0.95 - sw * r * 0.1, -r * 0.2);
    c.quadraticCurveTo(-r * 0.8, -r * 0.55, -r * 0.4, -r * 0.7); c.closePath();
    fs(c, F(shade(hair, -0.1)), lw);
    c.beginPath(); c.arc(-r * 0.52, -r * 0.98, r * 0.09, 0, Math.PI * 2); fs(c, F(d.colorSombrero && d.sombrero === 'ninguno' ? d.colorSombrero : '#e74c3c'), lw * 0.7);
  }
  // brazo trasero
  rr(c, -r * 0.72, -r * 0.15 - sw * r * 0.05, r * 0.26, r * 0.55, r * 0.12); fs(c, F(shade(coat, -0.25)), lw);
  c.beginPath(); c.arc(-r * 0.59, r * 0.43 - sw * r * 0.05, r * 0.12, 0, Math.PI * 2); fs(c, F(shade(d.piel, -0.1)), lw);
  // piernas y botas
  for (const [lx, s] of [[-0.36, 1], [0.04, -1]]) {
    const o = s * sw * r * 0.14;
    rr(c, r * lx + o, r * 0.42, r * 0.3, r * 0.3, r * 0.06); fs(c, F(pants), lw);
    rr(c, r * lx + o - r * 0.02, r * 0.66, r * 0.4, r * 0.26, r * 0.09); fs(c, F('#4a2c17'), lw);
    rr(c, r * lx + o - r * 0.02, r * 0.66, r * 0.4, r * 0.07, r * 0.03); fs(c, F('#6e4422'));
  }
  // faldones del abrigo
  if (d.abrigo) {
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * r * 0.05, r * 0.4); c.lineTo(s * r * 0.62, r * 0.38);
      c.lineTo(s * r * (0.72 + 0.05 * sw), r * 0.82); c.lineTo(s * r * 0.15, r * 0.72); c.closePath();
      fs(c, F(shade(coat, -0.12)), lw);
    }
  }
  // torso
  const g = c.createLinearGradient(0, -r * 0.25, 0, r * 0.55);
  g.addColorStop(0, shade(coat, 0.15)); g.addColorStop(1, shade(coat, -0.2));
  c.beginPath(); c.moveTo(-r * 0.5, -r * 0.22); c.lineTo(r * 0.5, -r * 0.22);
  c.quadraticCurveTo(r * 0.68, r * 0.15, r * 0.6, r * 0.5); c.lineTo(-r * 0.6, r * 0.5);
  c.quadraticCurveTo(-r * 0.68, r * 0.15, -r * 0.5, -r * 0.22); c.closePath();
  fs(c, flash ? '#fff' : g, lw);
  // camisa en V, botones y cinturón
  c.beginPath(); c.moveTo(-r * 0.2, -r * 0.22); c.lineTo(r * 0.24, -r * 0.22); c.lineTo(r * 0.04, r * 0.3); c.closePath(); fs(c, F(shirt), lw * 0.8);
  if (d.panuelo) { c.beginPath(); c.moveTo(-r * 0.08, -r * 0.2); c.lineTo(r * 0.14, -r * 0.2); c.lineTo(r * 0.03, r * 0.02); c.closePath(); fs(c, F(d.panuelo), lw * 0.7); }
  c.fillStyle = F('#f6c945'); for (const by of [-0.05, 0.12]) { c.beginPath(); c.arc(r * 0.33, r * by, r * 0.045, 0, Math.PI * 2); c.fill(); }
  if (d.bandolera) { c.beginPath(); c.moveTo(-r * 0.45, -r * 0.2); c.lineTo(r * 0.55, r * 0.42); c.lineWidth = r * 0.12; c.strokeStyle = F('#5a3519'); c.stroke(); c.lineWidth = lw * 0.6; c.strokeStyle = OL; c.stroke(); }
  rr(c, -r * 0.62, r * 0.3, r * 1.24, r * 0.14, r * 0.04); fs(c, F('#2d1b10'), lw);
  rr(c, -r * 0.06, r * 0.28, r * 0.2, r * 0.18, r * 0.03); fs(c, F('#f6c945'), lw * 0.7);

  // cabeza
  c.beginPath(); c.arc(r * 0.05, -r * 0.78, r * 0.62, 0, Math.PI * 2);
  const gh = c.createRadialGradient(r * 0.25, -r * 1.0, r * 0.1, r * 0.05, -r * 0.78, r * 0.7);
  gh.addColorStop(0, shade(d.piel, 0.15)); gh.addColorStop(1, shade(d.piel, -0.15));
  fs(c, flash ? '#fff' : gh, lw);
  c.beginPath(); c.ellipse(-r * 0.38, -r * 0.72, r * 0.1, r * 0.14, 0, 0, Math.PI * 2); fs(c, F(shade(d.piel, -0.1)), lw * 0.8);
  // rubor
  c.fillStyle = 'rgba(255,90,90,.28)'; c.beginPath(); c.ellipse(r * 0.48, -r * 0.6, r * 0.1, r * 0.06, 0, 0, Math.PI * 2); c.fill();
  // ojos
  const eye = (ex) => {
    c.beginPath(); c.ellipse(ex, -r * 0.8, r * 0.1, r * 0.14, 0, 0, Math.PI * 2); fs(c, '#fff', lw * 0.7);
    c.fillStyle = d.ojos || '#2b1a10'; c.beginPath(); c.ellipse(ex + r * 0.03, -r * 0.78, r * 0.065, r * 0.09, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + r * 0.05, -r * 0.82, r * 0.025, 0, Math.PI * 2); c.fill();
  };
  if (d.parche) {
    c.beginPath(); c.moveTo(-r * 0.5, -r * 1.05); c.lineTo(r * 0.62, -r * 0.62); c.lineWidth = r * 0.05; c.strokeStyle = OL; c.stroke();
    c.beginPath(); c.ellipse(r * 0.42, -r * 0.8, r * 0.13, r * 0.12, 0, 0, Math.PI * 2); fs(c, '#1b1410');
    eye(r * 0.14);
  } else { eye(r * 0.14); eye(r * 0.42); }
  // cejas
  c.strokeStyle = OL; c.lineWidth = r * 0.05;
  c.beginPath(); c.moveTo(r * 0.04, -r * 1.0); c.lineTo(r * 0.22, -r * 0.97);
  if (!d.parche) { c.moveTo(r * 0.34, -r * 0.97); c.lineTo(r * 0.52, -r * 1.0); }
  c.stroke();
  // boca
  c.beginPath(); c.arc(r * 0.32, -r * 0.58, r * 0.09, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = r * 0.04; c.stroke();
  // barba
  if (d.barba) {
    const bc = d.colorBarba || '#e6e9ec';
    c.beginPath(); c.moveTo(-r * 0.3, -r * 0.7);
    c.quadraticCurveTo(-r * 0.35, -r * 0.1, r * 0.1, -r * 0.05); c.quadraticCurveTo(r * 0.55, -r * 0.1, r * 0.62, -r * 0.62);
    c.quadraticCurveTo(r * 0.35, -r * 0.48, r * 0.15, -r * 0.55); c.quadraticCurveTo(-r * 0.05, -r * 0.5, -r * 0.3, -r * 0.7); c.closePath();
    fs(c, F(bc), lw);
    c.beginPath(); c.moveTo(r * 0.08, -r * 0.6); c.quadraticCurveTo(r * 0.3, -r * 0.72, r * 0.55, -r * 0.6); c.quadraticCurveTo(r * 0.3, -r * 0.58, r * 0.08, -r * 0.6); fs(c, F(shade(bc, -0.08)), lw * 0.7);
  }
  // flequillo / peinado frontal
  c.beginPath();
  switch (d.peinado) {
    case 'largo': case 'melena': case 'coleta':
      c.moveTo(-r * 0.58, -r * 0.7); c.quadraticCurveTo(-r * 0.55, -r * 1.45, r * 0.15, -r * 1.38);
      c.quadraticCurveTo(r * 0.65, -r * 1.3, r * 0.68, -r * 0.92);
      c.lineTo(r * 0.5, -r * 1.05); c.lineTo(r * 0.38, -r * 0.94); c.lineTo(r * 0.24, -r * 1.08); c.lineTo(r * 0.08, -r * 0.96); c.lineTo(-r * 0.1, -r * 1.08);
      if (d.peinado === 'melena') { c.quadraticCurveTo(-r * 0.3, -r * 0.6, -r * 0.2, -r * 0.35); c.quadraticCurveTo(-r * 0.6, -r * 0.4, -r * 0.62, -r * 0.6); }
      else c.quadraticCurveTo(-r * 0.4, -r * 0.9, -r * 0.58, -r * 0.7);
      c.closePath(); fs(c, F(hair), lw);
      break;
    case 'corto':
      c.moveTo(-r * 0.55, -r * 0.75);
      for (let i = 0; i <= 6; i++) { const a = Math.PI * (1.05 + i * 0.15), rad = i % 2 ? r * 0.72 : r * 0.62; c.lineTo(r * 0.05 + Math.cos(a) * rad, -r * 0.82 + Math.sin(a) * rad); }
      c.quadraticCurveTo(r * 0.3, -r * 1.1, -r * 0.2, -r * 1.05); c.closePath(); fs(c, F(hair), lw);
      break;
  }
  // sombreros
  const hc = d.colorSombrero;
  switch (d.sombrero) {
    case 'tricornio':
      c.beginPath(); c.moveTo(-r * 0.85, -r * 1.12); c.quadraticCurveTo(-r * 0.3, -r * 2.0, r * 0.15, -r * 1.95);
      c.quadraticCurveTo(r * 0.75, -r * 1.95, r * 0.95, -r * 1.12); c.quadraticCurveTo(r * 0.05, -r * 1.42, -r * 0.85, -r * 1.12); c.closePath();
      fs(c, F(hc), lw);
      c.beginPath(); c.moveTo(-r * 0.8, -r * 1.14); c.quadraticCurveTo(r * 0.05, -r * 1.42, r * 0.92, -r * 1.14); c.strokeStyle = F('#f6c945'); c.lineWidth = r * 0.07; c.stroke();
      if (d.pluma) { c.beginPath(); c.moveTo(-r * 0.2, -r * 1.65); c.quadraticCurveTo(-r * 0.9, -r * 2.2 - sw * r * 0.05, -r * 1.25, -r * 1.7); c.quadraticCurveTo(-r * 0.75, -r * 1.85, -r * 0.2, -r * 1.65); fs(c, F(d.pluma), lw * 0.8); }
      c.beginPath(); c.arc(r * 0.1, -r * 1.55, r * 0.12, 0, Math.PI * 2); fs(c, F('#fff'), lw * 0.6);
      break;
    case 'panuelo':
      c.beginPath(); c.moveTo(-r * 0.58, -r * 0.92); c.quadraticCurveTo(-r * 0.4, -r * 1.55, r * 0.15, -r * 1.45);
      c.quadraticCurveTo(r * 0.7, -r * 1.35, r * 0.68, -r * 0.95); c.quadraticCurveTo(r * 0.05, -r * 1.12, -r * 0.58, -r * 0.92); c.closePath();
      fs(c, F(hc), lw);
      c.fillStyle = F('#fff'); for (const [px, py] of [[-0.25, -1.25], [0.1, -1.32], [0.42, -1.2], [-0.05, -1.12]]) { c.beginPath(); c.arc(r * px, r * py, r * 0.05, 0, Math.PI * 2); c.fill(); }
      for (const k of [0, 1]) { c.beginPath(); c.moveTo(-r * 0.55, -r * 1.0); c.lineTo(-r * (1.0 + k * 0.1), -r * (0.95 - k * 0.3) + sw * r * 0.06); c.lineTo(-r * (0.9 + k * 0.05), -r * (1.15 - k * 0.25)); c.closePath(); fs(c, F(shade(hc, -0.15)), lw * 0.8); }
      break;
    case 'boina':
      c.save(); c.translate(r * 0.12, -r * 1.32); c.rotate(-0.22);
      c.beginPath(); c.ellipse(0, 0, r * 0.78, r * 0.3, 0, 0, Math.PI * 2); fs(c, F(hc), lw);
      c.beginPath(); c.ellipse(0, r * 0.15, r * 0.6, r * 0.1, 0, 0, Math.PI); fs(c, F(shade(hc, -0.25)), lw * 0.7);
      c.beginPath(); c.arc(0, -r * 0.32, r * 0.07, 0, Math.PI * 2); fs(c, F(shade(hc, -0.2)), lw * 0.6);
      c.fillStyle = F('#f6c945'); c.beginPath();
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 - Math.PI / 2, rad = k % 2 ? r * 0.06 : r * 0.14; c.lineTo(r * 0.4 + Math.cos(a) * rad, -r * 0.02 + Math.sin(a) * rad); }
      c.fill(); c.restore();
      break;
    case 'gorro':
      c.beginPath(); c.moveTo(-r * 0.62, -r * 0.95); c.quadraticCurveTo(-r * 0.6, -r * 1.6, r * 0.05, -r * 1.6);
      c.quadraticCurveTo(r * 0.7, -r * 1.6, r * 0.72, -r * 0.95); c.closePath(); fs(c, F(hc), lw);
      rr(c, -r * 0.66, -r * 1.08, r * 1.42, r * 0.2, r * 0.08); fs(c, F(shade(hc, -0.2)), lw);
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = lw * 0.6;
      for (let k = 0; k < 5; k++) { const x0 = -r * 0.4 + k * r * 0.22; c.beginPath(); c.moveTo(x0, -r * 1.1); c.lineTo(x0 + r * 0.05, -r * 1.5); c.stroke(); }
      c.beginPath(); c.arc(r * 0.05, -r * 1.68, r * 0.13, 0, Math.PI * 2); fs(c, F('#f5ecd7'), lw * 0.8);
      break;
    case 'capitan':
      c.beginPath(); c.moveTo(-r * 1.05, -r * 1.12); c.quadraticCurveTo(-r * 0.4, -r * 1.3, 0, -r * 1.22); c.quadraticCurveTo(r * 0.45, -r * 1.3, r * 1.1, -r * 1.12);
      c.quadraticCurveTo(r * 0.55, -r * 2.15, r * 0.05, -r * 2.05); c.quadraticCurveTo(-r * 0.5, -r * 2.15, -r * 1.05, -r * 1.12); c.closePath();
      fs(c, F(hc), lw);
      c.beginPath(); c.moveTo(-r * 1.0, -r * 1.14); c.quadraticCurveTo(0, -r * 1.3, r * 1.05, -r * 1.14); c.strokeStyle = F('#f6c945'); c.lineWidth = r * 0.07; c.stroke();
      // calavera con tibias (símbolo pirata genérico)
      c.strokeStyle = F('#fff'); c.lineWidth = r * 0.06;
      c.beginPath(); c.moveTo(-r * 0.2, -r * 1.42); c.lineTo(r * 0.3, -r * 1.68); c.moveTo(r * 0.3, -r * 1.42); c.lineTo(-r * 0.2, -r * 1.68); c.stroke();
      c.beginPath(); c.arc(r * 0.05, -r * 1.62, r * 0.14, 0, Math.PI * 2); fs(c, F('#fff'));
      c.fillStyle = OL; c.beginPath(); c.arc(0, -r * 1.63, r * 0.035, 0, Math.PI * 2); c.arc(r * 0.1, -r * 1.63, r * 0.035, 0, Math.PI * 2); c.fill();
      break;
  }
  // brazo delantero con arma
  const hx = r * 0.62, hy = r * 0.22 + sw * r * 0.05;
  c.save(); c.translate(hx, hy); armaEnMano(c, d.arma, r, F, lw, t); c.restore();
  rr(c, r * 0.32, -r * 0.18 + sw * r * 0.05, r * 0.26, r * 0.48, r * 0.12); fs(c, F(shade(coat, -0.05)), lw);
  c.beginPath(); c.arc(hx, hy, r * 0.13, 0, Math.PI * 2); fs(c, F(d.piel), lw);
  c.restore();
}

function marinero(c, r, flash, coat, cap, trim, opt) {
  const F = col => flash ? '#fff' : col;
  c.fillStyle = F(coat); c.beginPath(); c.ellipse(0, r * 0.25, r * 0.8, r * 0.65, 0, 0, TAU); c.fill();
  c.fillStyle = F(trim); c.fillRect(-r * 0.12, -r * 0.15, r * 0.24, r * 0.9);
  if (opt.charreteras) { c.fillStyle = '#f6c945'; c.fillRect(-r * 0.85, -r * 0.05, r * 0.35, r * 0.14); c.fillRect(r * 0.5, -r * 0.05, r * 0.35, r * 0.14); }
  c.fillStyle = F(opt.piel || '#f0c8a0'); c.beginPath(); c.arc(0, -r * 0.5, r * 0.55, 0, TAU); c.fill();
  c.fillStyle = '#222'; c.beginPath(); c.arc(-r * 0.18, -r * 0.5, r * 0.07, 0, TAU); c.arc(r * 0.18, -r * 0.5, r * 0.07, 0, TAU); c.fill();
  c.strokeStyle = '#222'; c.lineWidth = Math.max(1, r * 0.06); c.beginPath(); c.moveTo(-r * 0.3, -r * 0.68); c.lineTo(-r * 0.08, -r * 0.6); c.moveTo(r * 0.3, -r * 0.68); c.lineTo(r * 0.08, -r * 0.6); c.stroke();
  c.fillStyle = F(cap);
  if (opt.bicornio) {
    c.beginPath(); c.moveTo(-r * 1.0, -r * 0.8); c.quadraticCurveTo(0, -r * 1.7, r * 1.0, -r * 0.8); c.closePath(); c.fill();
    c.strokeStyle = '#f6c945'; c.lineWidth = Math.max(2, r * 0.06); c.stroke();
  } else {
    c.beginPath(); c.ellipse(0, -r * 0.95, r * 0.6, r * 0.22, 0, 0, TAU); c.fill();
    c.fillStyle = '#2b4c7e'; c.fillRect(-r * 0.6, -r * 0.95, r * 1.2, r * 0.12);
  }
}

// Enemigo por tipo. ph = fase de animación (radianes)
function enemigo(c, kind, x, y, r, ph, flash, conSombra = true) {
  const f = flash, F = col => f ? '#fff' : col;
  c.save(); c.translate(x, y);
  if (conSombra) { c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, r * 0.9, r * 0.9, r * 0.3, 0, 0, TAU); c.fill(); }
  c.translate(0, Math.sin(ph) * r * 0.1);
  switch (kind) {
    case 'soldado': marinero(c, r, f, '#f4f4f4', '#ffffff', '#2b4c7e', {}); break;
    case 'capitan': marinero(c, r, f, '#1e3799', '#ffffff', '#f4f4f4', { charreteras: true, bicornio: true }); break;
    case 'comodoro': marinero(c, r, f, '#57606f', '#2f3542', '#a4b0be', { charreteras: true, bicornio: true, piel: '#d9b38c' }); break;
    case 'almirante': {
      c.fillStyle = F('#f6e58d'); c.beginPath(); c.moveTo(-r * 1.1, -r * 0.1); c.lineTo(-r * 0.6 + Math.sin(ph) * r * 0.07, r * 1.0); c.lineTo(r * 0.6 - Math.sin(ph) * r * 0.07, r * 1.0); c.lineTo(r * 1.1, -r * 0.1); c.fill();
      marinero(c, r, f, '#130f40', '#ffffff', '#f6e58d', { charreteras: true, bicornio: true });
      c.strokeStyle = '#f9ca24'; c.lineWidth = r * 0.07; c.beginPath(); c.moveTo(-r * 0.2, -r * 1.5); c.lineTo(r * 0.05, -r * 1.25); c.lineTo(-r * 0.1, -r * 1.2); c.lineTo(r * 0.15, -r * 0.95); c.stroke();
      break;
    }
    case 'cangrejo': {
      c.strokeStyle = F('#a93226'); c.lineWidth = Math.max(2, r * 0.2);
      for (let k = -1; k <= 1; k += 2) for (let j = 0; j < 3; j++) { c.beginPath(); c.moveTo(k * r * 0.5, r * (0.1 + j * 0.4)); c.lineTo(k * r * 1.2, r * (0.4 + j * 0.5) + Math.sin(ph + j) * r * 0.2); c.stroke(); }
      c.fillStyle = F('#e74c3c'); c.beginPath(); c.ellipse(0, 0, r, r * 0.7, 0, 0, TAU); c.fill();
      const snap = Math.abs(Math.sin(ph)) * 0.5;
      for (let k = -1; k <= 1; k += 2) { c.beginPath(); c.arc(k * r * 1.15, -r * 0.6, r * 0.45, k > 0 ? Math.PI * 0.75 + snap : -Math.PI * 0.25 + snap, k > 0 ? Math.PI * 2.6 - snap : Math.PI * 1.6 - snap); c.lineTo(k * r * 1.15, -r * 0.6); c.fill(); }
      c.fillStyle = '#fff'; c.beginPath(); c.arc(-r * 0.3, -r * 0.65, r * 0.2, 0, TAU); c.arc(r * 0.3, -r * 0.65, r * 0.2, 0, TAU); c.fill();
      c.fillStyle = '#000'; c.beginPath(); c.arc(-r * 0.3, -r * 0.65, r * 0.1, 0, TAU); c.arc(r * 0.3, -r * 0.65, r * 0.1, 0, TAU); c.fill();
      break;
    }
    case 'tiburon': {
      c.fillStyle = F('#4a6fa5'); c.beginPath(); c.moveTo(-r * 0.2, -r * 0.7); c.lineTo(r * 0.15, -r * 1.35); c.lineTo(r * 0.45, -r * 0.6); c.fill();
      c.beginPath(); c.ellipse(0, 0, r * 0.85, r * 0.9, 0, 0, TAU); c.fill();
      c.fillStyle = F('#dfe6ee'); c.beginPath(); c.ellipse(0, r * 0.25, r * 0.55, r * 0.55, 0, 0, TAU); c.fill();
      c.fillStyle = '#7a1d0c'; c.beginPath(); c.ellipse(0, r * 0.05, r * 0.45, r * 0.18, 0, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.beginPath();
      for (let k = 0; k < 5; k++) { const x0 = -r * 0.4 + k * r * 0.2; c.moveTo(x0, -r * 0.08); c.lineTo(x0 + r * 0.1, r * 0.08); c.lineTo(x0 + r * 0.2, -r * 0.08); }
      c.fill();
      c.fillStyle = '#ff3b30'; c.beginPath(); c.arc(-r * 0.32, -r * 0.4, r * 0.1, 0, TAU); c.arc(r * 0.32, -r * 0.4, r * 0.1, 0, TAU); c.fill();
      break;
    }
    case 'kraken': {
      c.fillStyle = F('#7d3c98');
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * TAU, wv = Math.sin(ph + k) * 0.35;
        c.save(); c.rotate(a + wv);
        c.beginPath(); c.moveTo(r * 0.4, -r * 0.18); c.quadraticCurveTo(r * 1.1, -r * 0.4, r * 1.5, 0); c.quadraticCurveTo(r * 1.1, r * 0.25, r * 0.4, r * 0.18); c.fill();
        c.restore();
      }
      c.beginPath(); c.ellipse(0, -r * 0.1, r * 0.8, r * 0.85, 0, 0, TAU); c.fill();
      c.fillStyle = F('#a569bd'); for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(-r * 0.4 + k * r * 0.27, -r * 0.55, r * 0.08, 0, TAU); c.fill(); }
      c.fillStyle = '#f9e79f'; c.beginPath(); c.arc(-r * 0.3, -r * 0.05, r * 0.2, 0, TAU); c.arc(r * 0.3, -r * 0.05, r * 0.2, 0, TAU); c.fill();
      c.fillStyle = '#000'; c.fillRect(-r * 0.34, -r * 0.18, r * 0.08, r * 0.26); c.fillRect(r * 0.26, -r * 0.18, r * 0.08, r * 0.26);
      break;
    }
    default: // tipo desconocido: círculo genérico
      c.fillStyle = F('#888'); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
  }
  c.restore();
}

window.MDR_DIBUJO = { pirata, enemigo };
})();
