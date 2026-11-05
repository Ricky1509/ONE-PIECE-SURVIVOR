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

// Pirata jugable. d = bloque `dibujo` del personaje en config.js
function pirata(c, x, y, r, d, face, t, moving, flash, conSombra = true) {
  c.save(); c.translate(x, y);
  if (conSombra) sombra(c, r);
  if (moving) c.translate(0, -Math.abs(Math.sin(t * 12)) * r * 0.18);
  const fx = Math.cos(face) >= -0.01 ? 1 : -1;
  c.fillStyle = '#3b2a20';
  const step = moving ? Math.sin(t * 12) * r * 0.12 : 0;
  c.fillRect(-r * 0.5, r * 0.55 + step, r * 0.35, r * 0.4); c.fillRect(r * 0.15, r * 0.55 - step, r * 0.35, r * 0.4);
  c.fillStyle = flash ? '#fff' : d.color; c.beginPath(); c.ellipse(0, r * 0.22, r * 0.8, r * 0.68, 0, 0, TAU); c.fill();
  c.fillStyle = '#2d1b10'; c.fillRect(-r * 0.78, r * 0.42, r * 1.56, r * 0.16);
  c.fillStyle = '#f6c945'; c.fillRect(-r * 0.12, r * 0.4, r * 0.24, r * 0.2);
  c.fillStyle = flash ? '#fff' : d.piel; c.beginPath(); c.arc(0, -r * 0.55, r * 0.6, 0, TAU); c.fill();
  if (d.barba) { c.fillStyle = '#dfe3e6'; c.beginPath(); c.arc(fx * r * 0.08, -r * 0.35, r * 0.45, 0.1, Math.PI - 0.1); c.fill(); }
  c.fillStyle = '#1b1410';
  c.beginPath(); c.arc(fx * r * 0.3, -r * 0.58, r * 0.08, 0, TAU); c.fill();
  if (d.barba) {
    c.fillRect(fx * r * -0.12 - r * 0.12, -r * 0.68, r * 0.24, r * 0.16);
    c.strokeStyle = '#1b1410'; c.lineWidth = Math.max(1.5, r * 0.07); c.beginPath(); c.moveTo(-r * 0.55, -r * 0.85); c.lineTo(r * 0.55, -r * 0.5); c.stroke();
  } else { c.beginPath(); c.arc(fx * r * -0.02, -r * 0.58, r * 0.08, 0, TAU); c.fill(); }
  c.fillStyle = d.colorSombrero;
  switch (d.sombrero) {
    case 'tricornio':
      c.beginPath(); c.moveTo(-r * 0.95, -r * 0.85); c.quadraticCurveTo(0, -r * 1.85, r * 0.95, -r * 0.85); c.quadraticCurveTo(0, -r * 1.1, -r * 0.95, -r * 0.85); c.fill();
      c.strokeStyle = '#f6c945'; c.lineWidth = Math.max(1.5, r * 0.08); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -r * 1.25, r * 0.12, 0, TAU); c.fill();
      break;
    case 'panuelo':
      c.beginPath(); c.arc(0, -r * 0.62, r * 0.63, Math.PI, 0); c.fill();
      c.beginPath(); c.moveTo(-fx * r * 0.55, -r * 0.7); c.lineTo(-fx * r * 1.0, -r * 0.45); c.lineTo(-fx * r * 0.9, -r * 0.85); c.fill();
      c.fillStyle = '#fff'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(-r * 0.3 + k * r * 0.3, -r * 0.92, r * 0.06, 0, TAU); c.fill(); }
      break;
    case 'boina':
      c.save(); c.translate(fx * r * 0.12, -r * 1.05); c.rotate(-fx * 0.2);
      c.beginPath(); c.ellipse(0, 0, r * 0.7, r * 0.26, 0, 0, TAU); c.fill();
      c.fillRect(-r * 0.04, -r * 0.4, r * 0.08, r * 0.2); c.restore();
      break;
    case 'capitan':
      c.beginPath(); c.arc(0, -r * 0.95, r * 0.55, Math.PI, 0); c.fill();
      c.beginPath(); c.ellipse(0, -r * 0.95, r * 1.05, r * 0.22, 0, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -r * 1.18, r * 0.13, 0, TAU); c.fill();
      break;
  }
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
