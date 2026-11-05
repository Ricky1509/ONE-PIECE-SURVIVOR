'use strict';
(() => {
const $ = s => document.querySelector(s);
const cvs = $('#c'), ctx = cvs.getContext('2d');
let W = 0, H = 0, DPR = 1, S = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cvs.width = Math.floor(W * DPR); cvs.height = Math.floor(H * DPR);
  S = Math.max(0.6, Math.min(1.15, Math.min(W, H) / 680));
}
addEventListener('resize', resize); resize();
const vw = () => W / S, vh = () => H / S;
const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);
const fmt = n => Math.floor(n).toLocaleString('es-ES');
const mmss = t => { t = Math.floor(t); return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
function hash(x, y) { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967295; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

// ---------- Sonido (sintetizado con Web Audio) ----------
let AC = null, master = null, noiseBuf = null, muted = store.get('mdr_muted', false);
function initAudio() {
  if (AC) return;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 6;
    master = AC.createGain(); master.gain.value = 0.8; master.connect(comp); comp.connect(AC.destination);
    noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch (e) { AC = null; }
}
// tono con barrido de frecuencia
function tone(type, f0, f1, dur, vol, delay = 0, attack = 0.004) {
  const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
}
// ruido filtrado (disparos, explosiones, golpes, viento)
function noise(dur, vol, type, f0, f1, q = 1, delay = 0, attack = 0.002) {
  const t = AC.currentTime + delay, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = noiseBuf; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.03);
}
let coinStep = 0, lastCoin = 0;
const PENTA = [0, 2, 4, 7, 9];
const SFX = {
  shot:   { gap: .05, f() { noise(.09, .32, 'bandpass', 2600, 700, .9); tone('triangle', 190, 55, .08, .22); } },
  cannon: { gap: .12, f() { noise(.3, .45, 'lowpass', 1400, 90, .7); tone('sine', 110, 38, .3, .4); } },
  boom:   { gap: .08, f() { noise(.5, .5, 'lowpass', 1100, 60, .6); tone('sine', 80, 30, .45, .35); } },
  slash:  { gap: .07, f() { noise(.14, .22, 'bandpass', 5000, 1300, 2.5, 0, .02); } },
  throw:  { gap: .08, f() { noise(.18, .18, 'bandpass', 1500, 500, 2, 0, .02); tone('sine', 300, 180, .1, .05); } },
  zap:    { gap: .06, f() { noise(.18, .16, 'highpass', 4000, 2000, .7); tone('square', 1900, 180, .12, .05); tone('sawtooth', 120, 60, .15, .06); } },
  ice:    { gap: .08, f() { tone('triangle', 2600, 1900, .12, .07); tone('sine', 3400, 3000, .18, .04, .03); noise(.08, .06, 'highpass', 6000, 6000, 1); } },
  drum:   { gap: .1, f() { tone('sine', 140, 48, .3, .5); noise(.12, .2, 'lowpass', 600, 200, 1); } },
  wind:   { gap: .3, f() { noise(.8, .1, 'bandpass', 400, 1400, 3, 0, .2); } },
  hit:    { gap: .045, f() { noise(.05, .1, 'lowpass', 1800, 500, 1); tone('sine', 240, 150, .045, .05); } },
  kill:   { gap: .04, f() { noise(.12, .08, 'bandpass', 900, 250, 1.2, 0, .01); } },
  // experiencia: campanita que sube de tono si recoges varias seguidas
  coin:   { gap: .03, f() {
    const now = AC.currentTime; coinStep = now - lastCoin < .35 ? coinStep + 1 : 0; lastCoin = now;
    const k = Math.min(coinStep, 14), fq = 880 * Math.pow(2, (PENTA[k % 5] + 12 * Math.floor(k / 5)) / 12);
    tone('sine', fq, fq, .14, .09); tone('triangle', fq * 2, fq * 2, .07, .03);
  } },
  level:  { gap: .2, f() { [523, 659, 784, 1047].forEach((fq, i) => { tone('triangle', fq, fq, .25, .14, i * .07); tone('sine', fq * 2, fq * 2, .15, .04, i * .07); }); } },
  fruit:  { gap: .2, f() { tone('sine', 400, 1100, .15, .12); tone('sine', 600, 1600, .15, .1, .08); tone('triangle', 1300, 1300, .25, .05, .16); } },
  chest:  { gap: .3, f() { [784, 988, 1175, 1568, 1976].forEach((fq, i) => tone('triangle', fq, fq, .3, .1, i * .06)); noise(.4, .05, 'highpass', 7000, 7000, 1, .1); } },
  hurt:   { gap: .25, f() { tone('sawtooth', 170, 70, .2, .14); noise(.15, .15, 'lowpass', 900, 200, 1); } },
  boss:   { gap: 1, f() { tone('sawtooth', 65, 62, 1.1, .16, 0, .08); tone('sawtooth', 98, 94, 1.1, .1, 0, .08); noise(1.0, .08, 'lowpass', 300, 100, 1, 0, .2); } },
  ui:     { gap: .05, f() { tone('triangle', 660, 880, .06, .06); } },
};
const lastSnd = {};
function snd(name) {
  if (!AC || muted || !SFX[name]) return;
  const now = AC.currentTime;
  if (lastSnd[name] && now - lastSnd[name] < SFX[name].gap) return;
  lastSnd[name] = now;
  try { SFX[name].f(); } catch (e) {}
}

// ---------- Datos (desde js/config.js) ----------
const CFG = window.MDR_CONFIG;
const CHARS = CFG.personajes.map(c => ({
  id: c.id, name: c.nombre, price: c.precio || 0, desc: c.descripcion || '', weapon: c.arma, sprite: c.sprite || null,
  dibujo: Object.assign({ color: '#d9483b', piel: '#f1c27d', sombrero: 'tricornio', colorSombrero: '#2b2118', arma: c.arma }, c.dibujo || {}),
  bonus: { maxHp: (c.bonus || {}).vida, cooldown: (c.bonus || {}).recarga, area: (c.bonus || {}).area, speed: (c.bonus || {}).velocidad, armor: (c.bonus || {}).armadura },
}));
const WEAPONS = {}; for (const k in CFG.armas) { const a = CFG.armas[k]; WEAPONS[k] = { name: a.nombre, icon: a.icono, desc: a.niveles }; }
const PASSIVES = {}; for (const k in CFG.pasivos) { const a = CFG.pasivos[k]; PASSIVES[k] = { name: a.nombre, icon: a.icono, desc: a.descripcion, max: a.max }; }
const ETYPES = {};
for (const k in CFG.enemigos) {
  const e = CFG.enemigos[k];
  ETYPES[k] = { hp: e.vida, spd: e.velocidad, dmg: e.dano, r: e.radio, xp: e.xp, bounty: e.recompensa, boss: e.jefe ? e.nombre : null, name: e.nombre, sprite: e.sprite || null };
}
const BOSS_TIMES = CFG.jefes.map(j => j.minuto * 60), BOSS_KINDS = CFG.jefes.map(j => j.tipo);
const WIN_TIME = (CFG.duracionMinutos || 10) * 60;

// ---------- Progreso permanente (Astillero) ----------
const MEJORAS = CFG.mejoras || {};
const PROG = Object.assign({ berriesPorDerribo: 0.5, berriesPorSegundo: 0.35, berriesPorJefe: 250, berriesPorVictoria: 1000, crecimientoPrecio: 1.6 }, CFG.progreso || {});
const SAVE_KEY = 'mdr_save';
let SAVE = Object.assign({ berries: 0, mejoras: {}, desbloqueados: [], partidas: 0, victorias: 0 }, store.get(SAVE_KEY, {}));
// Migración: partidas guardadas antes de renombrar la moneda a Berries
if (SAVE.doblones) { SAVE.berries = (SAVE.berries || 0) + SAVE.doblones; }
delete SAVE.doblones;
function saveGame() { store.set(SAVE_KEY, SAVE); }
const ml = k => Math.min(SAVE.mejoras[k] || 0, (MEJORAS[k] || {}).max || 0);   // nivel comprado
const pm = k => ml(k) * ((MEJORAS[k] || {}).valor || 0);                         // efecto total
const costAt = (k, l) => Math.round(MEJORAS[k].precio * Math.pow(PROG.crecimientoPrecio, l));
const upgradeCost = k => costAt(k, ml(k));
const isUnlocked = ch => !ch.price || SAVE.desbloqueados.includes(ch.id);

// ---------- Frutas, misiones, tesoros ----------
const FRUTAS = CFG.frutas || {};
const MISIONES = CFG.misiones || [];
const TESOROS = CFG.tesoros || {};
const COFRE = Object.assign({ precio: 250, precio10: 2250, garantiaLegendario: 50, probabilidades: { comun: 60, raro: 28, epico: 10, legendario: 2 },
  reembolso: { comun: 30, raro: 80, epico: 200, legendario: 600 }, nivelMax: 5, ranuras: 3 }, CFG.cofre || {});
const RAREZAS = { comun: { nombre: 'Común', color: '#95a5a6' }, raro: { nombre: 'Raro', color: '#3498db' }, epico: { nombre: 'Épico', color: '#9b59b6' }, legendario: { nombre: 'Legendario', color: '#f39c12' } };
const RAR_ORDER = ['comun', 'raro', 'epico', 'legendario'];
const MP = CFG.mejorasPartida || {};
const RP = Object.assign({ comun: 60, raro: 27, epico: 10, legendario: 3 }, CFG.rarezasPartida || {});
function rollRunRarity() { let tot = RAR_ORDER.reduce((a, r) => a + (RP[r] || 0), 0), x = Math.random() * tot; for (const r of RAR_ORDER) { x -= RP[r] || 0; if (x < 0) return r; } return 'comun'; }
const rs = k => (G && G.runStats[k]) || 0; // mejoras con rareza de esta partida
SAVE.cobradas = SAVE.cobradas || [];
SAVE.inv = SAVE.inv || {};
SAVE.equip = (SAVE.equip || []).filter(id => TESOROS[id] && SAVE.inv[id]);
SAVE.tiradas = SAVE.tiradas || 0; SAVE.pity = SAVE.pity || 0;
SAVE.stats = Object.assign({ derribos: 0, mejorTiempo: 0, mejorNivel: 0, frutas: 0, jefes: {}, piratas: [], maxArmas: 0, mejorRecompensa: 0, porTipo: {},
  mejorasCompradas: Object.values(SAVE.mejoras).reduce((a, b) => a + b, 0) }, SAVE.stats || {});
// Bonus de los tesoros equipados
const itemMul = id => 1 + 0.25 * ((SAVE.inv[id] || 1) - 1);
function ib(stat) { let v = 0; for (const id of SAVE.equip) { const it = TESOROS[id]; if (it && it.stats && it.stats[stat]) v += it.stats[stat] * itemMul(id); } return v; }
// Frutas activas
function buffMul(efecto) { let m = 1; if (G) for (const k in G.buffs) if (G.buffs[k] > 0 && FRUTAS[k] && FRUTAS[k].efecto === efecto && efecto !== 'armadura') m *= FRUTAS[k].valor; return m; }
function buffAdd(efecto) { let v = 0; if (G) for (const k in G.buffs) if (G.buffs[k] > 0 && FRUTAS[k] && FRUTAS[k].efecto === efecto) v += FRUTAS[k].valor; return v; }
function misionProgreso(m) {
  const st = SAVE.stats, [tipo, arg] = m.tipo.split(':');
  switch (tipo) {
    case 'derribos': return st.derribos;
    case 'tiempo': return st.mejorTiempo;
    case 'victorias': return SAVE.victorias;
    case 'jefe': return st.jefes[arg] || 0;
    case 'nivel': return st.mejorNivel;
    case 'frutas': return st.frutas;
    case 'piratas': return st.piratas.length;
    case 'mejoras': return st.mejorasCompradas;
    case 'armas': return st.maxArmas;
    case 'recompensa': return st.mejorRecompensa;
    case 'tiradas': return SAVE.tiradas;
    case 'tesoros': return Object.keys(SAVE.inv).filter(k => SAVE.inv[k] > 0).length;
    case 'islas': return ISLAS.filter(islaUnlocked).length;
  }
  return 0;
}
// ---------- Islas ----------
const ISLAS = (CFG.islas && CFG.islas.length) ? CFG.islas : [{ id: 'calavera', nombre: 'Isla Calavera', tema: 'playa', dificultad: 1, berries: 1, descripcion: '' }];
SAVE.islas = SAVE.islas || {};
let islaSel = Math.max(0, Math.min(SAVE.islaSel || 0, ISLAS.length - 1));
function islaUnlocked(is) { const d = is.desbloqueo; return !d || (SAVE.islas[d.isla] || 0) >= d.minutos * 60; }
const misionesListas = () => MISIONES.filter(m => misionProgreso(m) >= m.meta && !SAVE.cobradas.includes(m.id)).length;

// ---------- Sprites ----------
// Cada sprite es una tira horizontal de fotogramas. Si no carga, se usa el dibujo procedural.
const SPR = {};
function loadSprite(key, s) {
  if (!s || !s.src) return;
  const o = { ok: false, cfg: Object.assign({ frames: 1, fps: 8, alto: 64, anclaY: 0.55, mira: 'derecha', pixelado: false }, s), img: new Image(), white: null };
  o.img.onload = () => {
    o.fw = o.img.naturalWidth / o.cfg.frames; o.fh = o.img.naturalHeight;
    // versión blanca para el destello al recibir daño
    const cv = document.createElement('canvas'); cv.width = o.img.naturalWidth; cv.height = o.img.naturalHeight;
    const c = cv.getContext('2d'); c.drawImage(o.img, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height);
    o.white = cv; o.ok = true;
  };
  o.img.onerror = () => console.warn('[sprites] No se pudo cargar', s.src, '— se usa el dibujo por defecto');
  o.img.src = s.src;
  SPR[key] = o;
}
CHARS.forEach(c => loadSprite('pj:' + c.id, c.sprite));
for (const k in ETYPES) loadSprite('en:' + k, ETYPES[k].sprite);
// Dibuja un sprite centrado en (x, y). Devuelve false si no está disponible.
function drawSprite(c, key, x, y, frame, lookLeft, flash, alto) {
  const o = SPR[key]; if (!o || !o.ok) return false;
  const s = o.cfg, h = alto || s.alto, w = h * o.fw / o.fh, f = ((frame % s.frames) + s.frames) % s.frames;
  const flip = (s.mira === 'izquierda') ? !lookLeft : lookLeft;
  c.save(); c.translate(x, y); if (flip) c.scale(-1, 1);
  if (s.pixelado) c.imageSmoothingEnabled = false;
  c.drawImage(flash && o.white ? o.white : o.img, f * o.fw, 0, o.fw, o.fh, -w / 2, -h * s.anclaY, w, h);
  c.restore();
  return true;
}
function drawShadow(c, x, y, r) { c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x, y + r * 0.95, r * 0.9, r * 0.32, 0, 0, TAU); c.fill(); }
// Retrato para menús y cartel final
function drawPortrait(c, ch, x, y, r) {
  if (drawSprite(c, 'pj:' + ch.id, x, y, 0, false, false, r * 4)) return;
  MDR_DIBUJO.pirata(c, x, y, r, ch.dibujo, 0, 0, false, false);
}

// ---------- Estado ----------
let G = null, state = 'menu', shake = 0, menuT = 0, curOpts = [], cardsReadyAt = 0;
const keys = new Set();
const joy = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };

function newGame(ch, isla) {
  G = {
    ch, isla, t: 0, kills: 0, bounty: 0, bosses: 0, spawnAcc: 0, nextSwarm: 75, bossIdx: 0, won: false,
    p: { x: 0, y: 0, r: 14, hp: 100, iframe: 0, hurtT: 0, face: 0, mvx: 0, mvy: 0, moving: false, xp: 0, lvl: 1, xpNext: 5 },
    weapons: [], passives: {}, enemies: [], bullets: [], balls: [], fx: [], coins: [], items: [], nums: [], parts: [],
    pending: 0, banner: null, st: null, revives: Math.floor(pm('revivir')), gold: 0,
    buffs: {}, waves: [], tornados: [], fruits: 0, bossKinds: [], killsBy: {}, runStats: {}, runPicks: [],
  };
  G.weapons.push({ id: ch.weapon, lvl: 1, t: 0.3 });
  recalc(); G.p.hp = G.st.maxHp;
  banner('🏝️ ' + isla.nombre);
}
function recalc() {
  const c = G.ch.bonus || {}, lv = k => G.passives[k] || 0, old = G.st;
  G.st = {
    might: (1 + 0.1 * lv('polvora')) * (1 + pm('dano') + ib('dano') + rs('dano')) * buffMul('dano'),
    cd: (c.cooldown || 1) * (1 - 0.08 * lv('reloj')) * Math.max(0.3, 1 - pm('recarga') - ib('recarga') - rs('recarga')),
    area: (c.area || 1) * (1 + 0.1 * lv('catalejo')) * (1 + pm('area') + ib('area') + rs('area')),
    amount: lv('loro'),
    speed: 150 * (c.speed || 1) * (1 + 0.1 * lv('botas')) * (1 + pm('velocidad') + ib('velocidad') + rs('velocidad')) * buffMul('velocidad'),
    magnet: 75 * (1 + 0.3 * lv('brujula')) * (1 + pm('iman') + ib('iman') + rs('iman')),
    armor: (c.armor || 0) + lv('coraza') + pm('armadura') + ib('armadura') + rs('armadura') + buffAdd('armadura'),
    regen: 0.3 * lv('coraza') + pm('regen') + ib('regen') + rs('regen'),
    maxHp: 100 * (c.maxHp || 1) * (1 + 0.2 * lv('ron')) * (1 + pm('vida') + ib('vida') + rs('vida')),
    xpMul: (1 + pm('experiencia') + ib('experiencia') + rs('experiencia')) * buffMul('experiencia'),
  };
  if (old && G.st.maxHp > old.maxHp) G.p.hp += G.st.maxHp - old.maxHp;
  G.p.hp = Math.min(G.p.hp, G.st.maxHp);
}

// ---------- Rejilla espacial ----------
const CELL = 64, grid = new Map();
let qid = 0;
const gk = (cx, cy) => (cx + 50000) * 100000 + (cy + 50000);
function buildGrid() {
  grid.clear();
  for (const e of G.enemies) {
    if (e.dead) continue;
    const m = e.r > 20 ? e.r : 0;
    const x0 = Math.floor((e.x - m) / CELL), x1 = Math.floor((e.x + m) / CELL), y0 = Math.floor((e.y - m) / CELL), y1 = Math.floor((e.y + m) / CELL);
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
      const k = gk(cx, cy); let a = grid.get(k); if (!a) { a = []; grid.set(k, a); } a.push(e);
    }
  }
}
function queryR(x, y, r, cb) {
  const id = ++qid, m = r + 20;
  const x0 = Math.floor((x - m) / CELL), x1 = Math.floor((x + m) / CELL), y0 = Math.floor((y - m) / CELL), y1 = Math.floor((y + m) / CELL);
  for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
    const a = grid.get(gk(cx, cy)); if (!a) continue;
    for (const e of a) { if (e.dead || e.q === id) continue; e.q = id; cb(e); }
  }
}
function nearestEnemy(x, y, maxD) {
  let best = null, bd = maxD * maxD;
  for (const e of G.enemies) { if (e.dead) continue; const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d < bd) { bd = d; best = e; } }
  return best;
}

// ---------- Combate ----------
function hurt(e, dmg, kx = 0, ky = 0) {
  if (e.dead) return;
  e.hp -= dmg; e.flash = 0.08;
  const kb = e.boss ? 0.08 : 1; e.kx += kx * kb; e.ky += ky * kb;
  if (G.nums.length < 90) G.nums.push({ x: e.x + rnd(-6, 6), y: e.y - e.r, v: Math.max(1, Math.round(dmg)), t: 0.6 });
  snd('hit');
  if (e.hp <= 0) killEnemy(e);
}
function killEnemy(e) {
  e.dead = true; G.kills++; G.bounty += e.bounty;
  dropCoin(e.x, e.y, e.xp);
  const col = { soldado: '#fff', cangrejo: '#e74c3c', tiburon: '#6c8fb3', capitan: '#1e3799' }[e.kind] || '#f6c945';
  for (let i = 0; i < (e.boss ? 40 : 5); i++) if (G.parts.length < 350) {
    const a = rnd(0, TAU), s = rnd(40, e.boss ? 260 : 140);
    G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: rnd(.3, .6), c: col, r: rnd(2, 4) });
  }
  G.killsBy[e.kind] = (G.killsBy[e.kind] || 0) + 1;
  if (G.fx.length < 120) G.fx.push({ k: 'poof', x: e.x, y: e.y, r: e.r, t: 0.35, max: 0.35 });
  snd('kill');
  if (e.boss) {
    G.bosses++; G.bossKinds.push(e.kind); G.items.push({ k: 'chest', x: e.x, y: e.y }); dropFruit(e.x + 30, e.y);
    banner('¡' + ETYPES[e.kind].boss + ' derrotado!'); shake = 12; snd('boom');
  } else {
    const r = Math.random();
    const pf = e.kind === 'capitan' ? (CFG.probabilidadFrutaCapitan ?? 0.08) : (CFG.probabilidadFruta ?? 0.004);
    if (Math.random() < pf) dropFruit(e.x, e.y);
    else if (r < 0.006) G.items.push({ k: 'food', x: e.x, y: e.y });
    else if (r < 0.0085) G.items.push({ k: 'magnet', x: e.x, y: e.y });
  }
}
function dropFruit(x, y) {
  const ks = Object.keys(FRUTAS); if (!ks.length) return;
  G.items.push({ k: 'fruit', f: ks[Math.random() * ks.length | 0], x, y });
}
function dropCoin(x, y, v) {
  if (G.coins.length > 450) { G.coins[Math.random() * G.coins.length | 0].v += v; return; }
  G.coins.push({ x, y, v, mag: false, sp: 0 });
}
function damagePlayer(d) {
  const p = G.p; p.hp -= Math.max(1, d - G.st.armor); p.iframe = 0.45; p.hurtT = 0.2; shake = 6; snd('hurt');
  if (p.hp > 0) return;
  if (G.revives > 0) { // Bote Salvavidas
    G.revives--; p.hp = G.st.maxHp * 0.5; p.iframe = 2.5;
    for (const e of G.enemies) { const dx = e.x - p.x, dy = e.y - p.y, dd = Math.hypot(dx, dy) || 1; if (dd < 260) { e.kx += dx / dd * 900; e.ky += dy / dd * 900; } }
    banner('¡Segunda oportunidad!'); snd('chest'); shake = 10;
    return;
  }
  p.hp = 0; endGame(false);
}
function addXp(v) {
  const p = G.p; p.xp += v * G.st.xpMul;
  while (p.xp >= p.xpNext) {
    p.xp -= p.xpNext; p.lvl++;
    p.xpNext = Math.floor(5 + p.lvl * 5.5 + Math.max(0, p.lvl - 20) * 6);
    G.pending++;
  }
}
function banner(text, boss) { G.banner = { text, t: 3, boss: !!boss }; }

// ---------- Armas ----------
function sableSlash(w) {
  const L = w.lvl, p = G.p, st = G.st;
  const r = 80 * st.area * (L >= 4 ? 1.3 : 1);
  const dmg = 16 * (L >= 2 ? 1.3 : 1) * (L >= 4 ? 1.3 : 1) * st.might;
  const dirs = [p.face]; if (L >= 3) dirs.push(p.face + Math.PI);
  for (const a of dirs) {
    G.fx.push({ k: 'slash', a, r, t: 0.2, max: 0.2 });
    queryR(p.x, p.y, r, e => {
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (d > r + e.r) return;
      let da = Math.atan2(dy, dx) - a; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) < 1.15 || d < e.r + p.r + 6) hurt(e, dmg, dx / d * 200, dy / d * 200);
    });
  }
  snd('slash');
}
function updateWeapons(dt) {
  const p = G.p, st = G.st;
  for (const w of G.weapons) {
    const L = w.lvl;
    switch (w.id) {
      case 'sable': {
        w.t -= dt;
        if (w.pend > 0) { w.pend -= dt; if (w.pend <= 0) sableSlash(w); }
        if (w.t <= 0) { w.t = 1.1 * st.cd; sableSlash(w); if (L >= 5) w.pend = 0.18; }
        break;
      }
      case 'pistola': {
        w.t -= dt;
        if (w.t <= 0) {
          const tg = nearestEnemy(p.x, p.y, 520);
          if (!tg) { w.t = 0.1; break; }
          w.t = 0.75 * st.cd;
          const n = 1 + (+(L >= 2)) + (+(L >= 4)) + (+(L >= 5)) + st.amount;
          const pierce = L >= 5 ? 2 : (L >= 3 ? 1 : 0);
          const dmg = 11 * (L >= 4 ? 1.2 : 1) * st.might;
          const base = Math.atan2(tg.y - p.y, tg.x - p.x);
          for (let i = 0; i < n; i++) {
            const a = base + (i - (n - 1) / 2) * 0.13;
            G.bullets.push({ x: p.x, y: p.y, vx: Math.cos(a) * 560, vy: Math.sin(a) * 560, r: 4, dmg, pierce, life: 1.1, hit: new Set() });
          }
          snd('shot');
        }
        break;
      }
      case 'rayo': {
        w.t -= dt;
        if (w.t <= 0) {
          w.t = 1.5 * st.cd * (L >= 4 ? 0.85 : 1);
          const n = 1 + (+(L >= 2)) + (+(L >= 4)) + 2 * (+(L >= 5)) + st.amount;
          const dmg = 20 * (L >= 3 ? 1.4 : 1) * st.might, ar = 36 * st.area;
          const hw = vw() / 2 + 10, hh = vh() / 2 + 10;
          const cands = G.enemies.filter(e => !e.dead && Math.abs(e.x - p.x) < hw && Math.abs(e.y - p.y) < hh);
          let fired = 0;
          for (let i = 0; i < n && cands.length; i++) {
            const e = cands.splice(Math.random() * cands.length | 0, 1)[0];
            const ex = e.x, ey = e.y;
            G.fx.push({ k: 'bolt', x: ex, y: ey, r: ar, t: 0.28, max: 0.28, seed: Math.random() * 1000 | 0 });
            queryR(ex, ey, ar, o => { if (Math.hypot(o.x - ex, o.y - ey) < ar + o.r) hurt(o, dmg); });
            fired++;
          }
          if (fired) { snd('zap'); shake = Math.max(shake, 2); }
        }
        break;
      }
      case 'ancla': {
        const n = 1 + (+(L >= 2)) + (+(L >= 4)) + (+(L >= 5)) + st.amount;
        const R = 88 * st.area * (L >= 3 ? 1.3 : 1);
        const dmg = 9 * (L >= 3 ? 1.3 : 1) * st.might;
        w.ang = (w.ang || 0) + dt * 3.2 * (L >= 5 ? 1.4 : 1);
        w.pos = [];
        for (let i = 0; i < n; i++) {
          const a = w.ang + i * TAU / n, ax = p.x + Math.cos(a) * R, ay = p.y + Math.sin(a) * R;
          w.pos.push([ax, ay, a]);
          queryR(ax, ay, 16, e => {
            if (Math.hypot(e.x - ax, e.y - ay) >= e.r + 16) return;
            if ((e.lh.ancla || 0) > G.t) return;
            e.lh.ancla = G.t + 0.5;
            const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
            hurt(e, dmg, dx / d * 240, dy / d * 240);
          });
        }
        break;
      }
      case 'canon': {
        w.t -= dt;
        if (w.t <= 0) {
          w.t = 2.4 * st.cd;
          const n = 1 + (+(L >= 2)) + (+(L >= 4)) + 2 * (+(L >= 5)) + st.amount;
          const ar = 60 * st.area * (L >= 3 ? 1.4 : 1), dmg = 28 * (L >= 4 ? 1.3 : 1) * st.might;
          const cands = G.enemies.filter(e => !e.dead && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 380 * 380);
          for (let i = 0; i < n; i++) {
            let tx, ty;
            if (cands.length) { const e = cands[Math.random() * cands.length | 0]; tx = e.x; ty = e.y; }
            else { const a = rnd(0, TAU); tx = p.x + Math.cos(a) * 160; ty = p.y + Math.sin(a) * 160; }
            G.balls.push({ sx: p.x, sy: p.y, tx, ty, t: 0, dur: rnd(.55, .7), ar, dmg });
          }
          snd('cannon');
        }
        break;
      }
      case 'fuego': {
        w.R = 58 * st.area * (1 + 0.25 * (+(L >= 2)) + 0.25 * (+(L >= 4)));
        w.t -= dt;
        if (w.t <= 0) {
          w.t = 0.4 * st.cd * (L >= 5 ? 0.5 : 1);
          const dmg = 5 * (L >= 3 ? 1.4 : 1) * st.might, R = w.R;
          queryR(p.x, p.y, R, e => { if (Math.hypot(e.x - p.x, e.y - p.y) < R + e.r * 0.5) hurt(e, dmg); });
        }
        break;
      }
      case 'hielo': {
        w.t -= dt;
        if (w.t <= 0) {
          w.t = 1.4 * st.cd;
          const n = 6 + 2 * (+(L >= 2)) + 2 * (+(L >= 4)) + 2 * st.amount;
          const dmg = 8 * (L >= 3 ? 1.4 : 1) * st.might, slowT = L >= 4 ? 2.5 : 1.5, slowA = L >= 5 ? 0.8 : 0.5, off = rnd(0, TAU);
          for (let i = 0; i < n; i++) {
            const a = off + i * TAU / n;
            G.bullets.push({ kind: 'hielo', x: p.x, y: p.y, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, r: 6, dmg, pierce: 0, life: 0.9 * st.area, hit: new Set(), slowT, slowA });
          }
          snd('ice');
        }
        break;
      }
      case 'arpon': {
        w.t -= dt;
        if (w.t <= 0) {
          w.t = 1.6 * st.cd;
          const tg = nearestEnemy(p.x, p.y, 450), base = tg ? Math.atan2(tg.y - p.y, tg.x - p.x) : p.face;
          const n = 1 + (+(L >= 2)) + (+(L >= 4)) + st.amount, dmg = 22 * (L >= 3 ? 1.3 : 1) * st.might, spd = L >= 5 ? 620 : 480;
          for (let i = 0; i < n; i++) {
            const a = base + (i - (n - 1) / 2) * 0.35;
            G.bullets.push({ kind: 'arpon', x: p.x, y: p.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: 8, dmg, pierce: 1e9, life: 3, out: L >= 5 ? 0.6 : 0.45, hit: new Set() });
          }
          snd('throw');
        }
        break;
      }
      case 'tambor': {
        const R = 140 * st.area * (L >= 2 ? 1.25 : 1), dmg = 12 * (L >= 3 ? 1.4 : 1) * st.might;
        const wave = () => { G.waves.push({ x: p.x, y: p.y, R, r: 0, dmg, hit: new Set() }); snd('drum'); };
        w.t -= dt;
        if (w.pend > 0) { w.pend -= dt; if (w.pend <= 0) wave(); }
        if (w.t <= 0) { w.t = 2.0 * st.cd * (L >= 4 ? 0.8 : 1); wave(); if (L >= 5) w.pend = 0.35; }
        break;
      }
      case 'viento': {
        w.t -= dt;
        if (w.t <= 0) {
          w.t = 3.2 * st.cd;
          const n = 1 + (+(L >= 2)) + (+(L >= 4)) + st.amount;
          for (let i = 0; i < n; i++) {
            const a = rnd(0, TAU);
            G.tornados.push({ x: p.x, y: p.y, vx: Math.cos(a) * 100, vy: Math.sin(a) * 100, R: 34 * st.area * (L >= 3 ? 1.3 : 1),
              dmg: 7 * (L >= 3 ? 1.4 : 1) * st.might, life: L >= 5 ? 6 : 3, tick: 0, ph: rnd(0, TAU) });
          }
          snd('wind');
        }
        break;
      }
    }
  }
}

// ---------- Enemigos ----------
function spawnEnemy(kind, x, y) {
  const T = ETYPES[kind], t = G.t, dif = G.isla.dificultad || 1, hm = (T.boss ? 1 + t / 300 : 1 + t / 90) * dif;
  G.enemies.push({
    kind, x, y, r: T.r, hp: T.hp * hm, maxHp: T.hp * hm, spd: T.spd * rnd(.9, 1.1), dmg: T.dmg * (1 + t / 400) * (1 + (dif - 1) * 0.5),
    xp: T.xp, bounty: T.bounty, boss: !!T.boss, kx: 0, ky: 0, flash: 0, lh: {}, dead: false, ph: rnd(0, TAU), seed: Math.random() * 16 | 0, dash: 0, dashCd: 4, q: 0,
  });
}
function ringPos(bias) {
  const p = G.p, R = Math.hypot(vw(), vh()) / 2 + 40;
  let a = rnd(0, TAU);
  if (bias && p.moving && Math.random() < 0.6) a = Math.atan2(p.mvy, p.mvx) + rnd(-0.9, 0.9);
  return [p.x + Math.cos(a) * R, p.y + Math.sin(a) * R];
}
function pickKind(t) {
  const r = Math.random() * 100;
  if (t < 60) return r < 85 ? 'soldado' : 'cangrejo';
  if (t < 180) return r < 55 ? 'soldado' : r < 85 ? 'cangrejo' : 'tiburon';
  if (t < 360) return r < 40 ? 'soldado' : r < 65 ? 'cangrejo' : r < 90 ? 'tiburon' : 'capitan';
  return r < 28 ? 'soldado' : r < 52 ? 'cangrejo' : r < 84 ? 'tiburon' : 'capitan';
}
function updateSpawns(dt) {
  const t = G.t, p = G.p;
  G.spawnAcc += dt * (0.9 + t / 38);
  const cap = Math.min(320, 60 + t * 0.6);
  while (G.spawnAcc >= 1) {
    G.spawnAcc -= 1;
    if (G.enemies.length >= cap) continue;
    const [x, y] = ringPos(true); spawnEnemy(pickKind(t), x, y);
  }
  if (t >= G.nextSwarm) {
    G.nextSwarm += 75;
    const n = 24 + Math.floor(t / 30), kind = t > 300 ? 'tiburon' : 'cangrejo', R = Math.hypot(vw(), vh()) / 2 + 20;
    for (let i = 0; i < n; i++) { const a = i / n * TAU; spawnEnemy(kind, p.x + Math.cos(a) * R, p.y + Math.sin(a) * R); }
    banner('¡Emboscada! Te rodean');
  }
  if (G.bossIdx < BOSS_KINDS.length && t >= BOSS_TIMES[G.bossIdx]) {
    const k = BOSS_KINDS[G.bossIdx++], [x, y] = ringPos(false);
    spawnEnemy(k, x, y); banner('¡' + ETYPES[k].boss + ' se acerca!', true); snd('boss'); shake = 8;
  }
}
function updateEnemies(dt) {
  const p = G.p, farR = Math.hypot(vw(), vh()) * 0.75, kd = Math.pow(0.0005, dt);
  for (const e of G.enemies) {
    if (e.dead) continue;
    const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (!e.boss && d > farR) { const [x, y] = ringPos(true); e.x = x; e.y = y; continue; }
    let sp = e.spd, ux = dx / d, uy = dy / d;
    if (e.slowT > 0) { e.slowT -= dt; sp *= 1 - (e.slowA || 0.5); if (e.slowT <= 0) e.slowA = 0; }
    if (e.boss) {
      e.dashCd -= dt;
      if (e.dash > 0) { e.dash -= dt; sp *= 3.2; ux = e.ddx; uy = e.ddy; }
      else if (e.dashCd <= 0 && d < 500) { e.dash = 0.55; e.dashCd = rnd(3.5, 5.5); e.ddx = ux; e.ddy = uy; }
    }
    e.x += (ux * sp + e.kx) * dt; e.y += (uy * sp + e.ky) * dt;
    e.kx *= kd; e.ky *= kd; e.flash -= dt; e.ph += dt * 8;
    if (d < e.r + p.r && p.iframe <= 0 && state === 'play') damagePlayer(e.dmg);
  }
  // separación para que no se apilen
  for (const e of G.enemies) {
    if (e.dead) continue;
    queryR(e.x, e.y, e.r, o => {
      if (o === e) return;
      const dx = e.x - o.x, dy = e.y - o.y, rr = e.r + o.r, d2 = dx * dx + dy * dy;
      if (d2 >= rr * rr || d2 < 0.01) return;
      const d = Math.sqrt(d2), push = (rr - d) * 0.5, me = e.boss ? 12 : 1, mo = o.boss ? 12 : 1;
      const fe = mo / (me + mo), fo = me / (me + mo);
      e.x += dx / d * push * fe; e.y += dy / d * push * fe;
      o.x -= dx / d * push * fo; o.y -= dy / d * push * fo;
    });
  }
}

// ---------- Bucle de juego ----------
function update(dt) {
  const p = G.p, st = G.st;
  G.t += dt;
  // movimiento
  let ix = 0, iy = 0;
  if (keys.has('a') || keys.has('arrowleft')) ix--;
  if (keys.has('d') || keys.has('arrowright')) ix++;
  if (keys.has('w') || keys.has('arrowup')) iy--;
  if (keys.has('s') || keys.has('arrowdown')) iy++;
  if (joy.active) {
    const dx = joy.x - joy.ox, dy = joy.y - joy.oy, d = Math.hypot(dx, dy);
    if (d > 6) { const m = Math.min(1, d / 50); ix = dx / d * m; iy = dy / d * m; }
  }
  const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
  p.moving = il > 0.05;
  if (p.moving) { p.mvx = ix; p.mvy = iy; p.face = Math.atan2(iy, ix); }
  p.x += ix * st.speed * dt; p.y += iy * st.speed * dt;
  p.iframe -= dt; p.hurtT -= dt;
  p.hp = Math.min(st.maxHp, p.hp + st.regen * dt);

  let buffChanged = false;
  for (const k in G.buffs) if (G.buffs[k] > 0) { G.buffs[k] -= dt; if (G.buffs[k] <= 0) { G.buffs[k] = 0; buffChanged = true; } }
  if (buffChanged) recalc();

  buildGrid();
  updateWeapons(dt);

  for (const b of G.bullets) {
    if (b.kind === 'arpon') { // va, se frena y vuelve a la mano
      b.out -= dt;
      if (b.out <= 0) {
        if (!b.back) { b.back = true; b.hit.clear(); }
        const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy) || 1, sp = Math.hypot(b.vx, b.vy);
        b.vx = dx / d * sp; b.vy = dy / d * sp;
        if (d < 22) { b.life = 0; continue; }
      }
    }
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0) continue;
    queryR(b.x, b.y, b.r, e => {
      if (b.life <= 0 || b.hit.has(e)) return;
      if ((e.x - b.x) ** 2 + (e.y - b.y) ** 2 < (e.r + b.r) ** 2) {
        b.hit.add(e);
        if (b.slowT) { e.slowT = Math.max(e.slowT || 0, b.slowT); e.slowA = Math.max(e.slowA || 0, b.slowA); }
        hurt(e, b.dmg, b.vx * 0.25, b.vy * 0.25);
        if (b.pierce-- <= 0) b.life = 0;
      }
    });
  }
  G.bullets = G.bullets.filter(b => b.life > 0);

  for (const c of G.balls) {
    c.t += dt;
    if (c.t >= c.dur && !c.done) {
      c.done = true;
      G.fx.push({ k: 'boom', x: c.tx, y: c.ty, r: c.ar, t: 0.35, max: 0.35 });
      queryR(c.tx, c.ty, c.ar, e => {
        const dx = e.x - c.tx, dy = e.y - c.ty, d = Math.hypot(dx, dy) || 1;
        if (d < c.ar + e.r) hurt(e, c.dmg, dx / d * 260, dy / d * 260);
      });
      snd('boom'); shake = Math.max(shake, 3);
    }
  }
  G.balls = G.balls.filter(c => !c.done);

  for (const wv of G.waves) {
    wv.r += dt * wv.R * 2.4; wv.x = p.x; wv.y = p.y;
    queryR(wv.x, wv.y, wv.r, e => {
      if (wv.hit.has(e)) return;
      const dx = e.x - wv.x, dy = e.y - wv.y, d = Math.hypot(dx, dy) || 1;
      if (d < wv.r + e.r && d > wv.r - 30) { wv.hit.add(e); hurt(e, wv.dmg, dx / d * 420, dy / d * 420); }
    });
  }
  G.waves = G.waves.filter(wv => wv.r < wv.R);
  for (const tw of G.tornados) {
    tw.life -= dt; tw.ph += dt * 10;
    const dx = p.x - tw.x, dy = p.y - tw.y, d = Math.hypot(dx, dy) || 1, cur = Math.atan2(tw.vy, tw.vx);
    const back = d > 280 ? Math.sign(Math.sin(Math.atan2(dy, dx) - cur)) * 2.5 * dt : 0;
    const a = cur + rnd(-1.5, 1.5) * dt + back;
    tw.vx = Math.cos(a) * 100; tw.vy = Math.sin(a) * 100; tw.x += tw.vx * dt; tw.y += tw.vy * dt;
    tw.tick -= dt;
    if (tw.tick <= 0) {
      tw.tick = 0.3;
      queryR(tw.x, tw.y, tw.R, e => { const ex = tw.x - e.x, ey = tw.y - e.y, dd = Math.hypot(ex, ey) || 1; if (dd < tw.R + e.r) hurt(e, tw.dmg, ex / dd * 120, ey / dd * 120); });
    }
  }
  G.tornados = G.tornados.filter(tw => tw.life > 0);

  updateEnemies(dt);
  G.enemies = G.enemies.filter(e => !e.dead);

  for (const c of G.coins) {
    const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy) || 1;
    if (c.mag || d < st.magnet) { c.mag = true; c.sp = (c.sp || 140) + dt * 900; c.x += dx / d * Math.min(c.sp * dt, d); c.y += dy / d * Math.min(c.sp * dt, d); }
    if (d < p.r + 8) { c.dead = true; addXp(c.v); snd('coin'); }
  }
  G.coins = G.coins.filter(c => !c.dead);

  let openChest = false;
  for (const it of G.items) {
    const dx = p.x - it.x, dy = p.y - it.y, d = Math.hypot(dx, dy) || 1;
    if (d < 50) { it.x += dx / d * 220 * dt; it.y += dy / d * 220 * dt; }
    if (d < p.r + 14) {
      it.dead = true;
      if (it.k === 'food') { p.hp = Math.min(st.maxHp, p.hp + st.maxHp * 0.3); banner('+30% vida'); snd('level'); }
      else if (it.k === 'magnet') { for (const c of G.coins) c.mag = true; banner('¡Caracola imantada!'); snd('chest'); }
      else if (it.k === 'chest') { G.bounty += 1e6; G.pending++; openChest = true; snd('chest'); }
      else if (it.k === 'fruit') { const fr = FRUTAS[it.f]; G.buffs[it.f] = fr.duracion; G.fruits++; recalc(); banner(fr.nombre + ': ' + fr.descripcion); snd('fruit'); }
    }
  }
  G.items = G.items.filter(i => !i.dead);

  for (const f of G.fx) f.t -= dt;
  G.fx = G.fx.filter(f => f.t > 0);
  for (const n of G.nums) { n.t -= dt; n.y -= 40 * dt; }
  G.nums = G.nums.filter(n => n.t > 0);
  for (const q of G.parts) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.92; q.vy *= 0.92; }
  G.parts = G.parts.filter(q => q.t > 0);
  if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }

  updateSpawns(dt);
  if (state !== 'play') return;
  if (G.t >= WIN_TIME) { G.won = true; G.bounty += 1e8; endGame(true); return; }
  if (G.pending > 0) openLevelUp(openChest);
}

// ---------- Dibujo ----------
function drawGround(cx, cy, tema) { MDR_ISLAS.drawGround(ctx, tema, cx, cy, vw() / 2, vh() / 2, menuT); }

function drawPlayer(p, t, flash) {
  const r = p.r * 1.25, lookLeft = Math.cos(p.face) < -0.01;
  const o = SPR['pj:' + G.ch.id];
  if (o && o.ok) {
    drawShadow(ctx, p.x, p.y, r);
    const frame = p.moving ? Math.floor(t * o.cfg.fps) : 0;
    drawSprite(ctx, 'pj:' + G.ch.id, p.x, p.y, frame, lookLeft, flash);
  } else MDR_DIBUJO.pirata(ctx, p.x, p.y, r, G.ch.dibujo, p.face, t, p.moving, flash);
}
function drawEnemy(e) {
  const r = e.r, key = 'en:' + e.kind, o = SPR[key];
  if (o && o.ok) {
    drawShadow(ctx, e.x, e.y, r);
    drawSprite(ctx, key, e.x, e.y, Math.floor(G.t * o.cfg.fps) + e.seed, G.p.x < e.x, e.flash > 0);
  } else MDR_DIBUJO.enemigo(ctx, e.kind, e.x, e.y, r, e.ph, e.flash > 0);
  if (e.slowT > 0) { ctx.fillStyle = 'rgba(150,220,255,.35)'; ctx.beginPath(); ctx.arc(e.x, e.y, r * 1.1, 0, TAU); ctx.fill(); }
  if (!e.boss && e.hp < e.maxHp && e.maxHp > 40) {
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(e.x - r, e.y - r * 1.6, r * 2, 3);
    ctx.fillStyle = '#e74c3c'; ctx.fillRect(e.x - r, e.y - r * 1.6, r * 2 * Math.max(0, e.hp / e.maxHp), 3);
  }
}
function drawAnchor(x, y, a) {
  const c = ctx; c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2);
  c.strokeStyle = '#2c3e50'; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, -12); c.lineTo(0, 12); c.moveTo(-7, -6); c.lineTo(7, -6); c.stroke();
  c.beginPath(); c.arc(0, 4, 11, 0.2, Math.PI - 0.2); c.stroke();
  c.beginPath(); c.arc(0, -15, 3.5, 0, TAU); c.stroke();
  c.restore();
}
// Fruta de poder (diseño original: fruta redonda con espirales y hoja)
function drawFruit(c, x, y, r, col, t) {
  c.save(); c.translate(x, y);
  const g = c.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.4);
  g.addColorStop(0, col + '88'); g.addColorStop(1, col + '00');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * (2.2 + Math.sin(t * 6) * 0.2), 0, TAU); c.fill();
  c.fillStyle = col; c.strokeStyle = '#1b1410'; c.lineWidth = 1.5;
  c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 1.4;
  for (const [ox, oy] of [[-r * 0.35, -r * 0.2], [r * 0.4, r * 0.15], [-r * 0.1, r * 0.5]]) { c.beginPath(); c.arc(ox, oy, r * 0.28, 0, Math.PI * 1.5); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(-r * 0.4, -r * 0.45, r * 0.22, r * 0.12, -0.6, 0, TAU); c.fill();
  c.strokeStyle = '#5a3519'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -r); c.quadraticCurveTo(r * 0.1, -r * 1.4, r * 0.3, -r * 1.5); c.stroke();
  c.fillStyle = '#2e8b57'; c.beginPath(); c.ellipse(r * 0.45, -r * 1.3, r * 0.45, r * 0.2, -0.5, 0, TAU); c.fill();
  c.restore();
}
function drawChest(x, y, t) {
  const c = ctx; c.save(); c.translate(x, y + Math.sin(t * 4) * 2);
  c.fillStyle = 'rgba(246,201,69,.35)'; c.beginPath(); c.arc(0, 0, 22 + Math.sin(t * 6) * 3, 0, TAU); c.fill();
  c.fillStyle = '#8e5a2b'; c.fillRect(-14, -6, 28, 16); c.fillStyle = '#6e4220'; c.fillRect(-14, -12, 28, 7);
  c.fillStyle = '#f6c945'; c.fillRect(-15, -6, 30, 2); c.fillRect(-3, -8, 6, 7); c.fillRect(-14, -12, 2, 22); c.fillRect(12, -12, 2, 22);
  c.restore();
}

function drawWorld() {
  const p = G.p, t = G.t;
  drawGround(p.x, p.y, G.isla.tema);
  // monedas
  for (const c of G.coins) {
    const big = c.v >= 8, mid = c.v >= 3, r = big ? 7 : mid ? 5.5 : 4.5;
    ctx.fillStyle = big ? '#e8b923' : mid ? '#cfd8dc' : '#cd7f32';
    ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(c.x - r * 0.3, c.y - r * 0.3, r * 0.35, 0, TAU); ctx.fill();
  }
  for (const it of G.items) {
    if (it.k === 'chest') { drawChest(it.x, it.y, t); continue; }
    if (it.k === 'fruit') { drawFruit(ctx, it.x, it.y + Math.sin(t * 5) * 2, 9, FRUTAS[it.f].color, t); continue; }
    ctx.font = '22px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(it.k === 'food' ? '🍗' : '🧲', it.x, it.y + Math.sin(t * 5) * 2);
  }
  // aura de fuego
  const fw = G.weapons.find(w => w.id === 'fuego');
  if (fw && fw.R) {
    const R = fw.R * (1 + Math.sin(t * 10) * 0.03);
    const g = ctx.createRadialGradient(p.x, p.y, R * 0.2, p.x, p.y, R);
    g.addColorStop(0, 'rgba(255,200,60,.05)'); g.addColorStop(0.7, 'rgba(255,120,30,.22)'); g.addColorStop(1, 'rgba(255,60,0,.0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,110,20,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.95, 0, TAU); ctx.stroke();
  }
  // enemigos (ordenados por y para profundidad)
  const es = G.enemies.slice().sort((a, b) => a.y - b.y);
  for (const e of es) drawEnemy(e);
  // jugador
  const blink = p.iframe > 0 && Math.floor(t * 20) % 2 === 0;
  if (!blink) drawPlayer(p, t, p.hurtT > 0);
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(p.x - 18, p.y + 22, 36, 5);
  ctx.fillStyle = p.hp / G.st.maxHp > 0.3 ? '#2ecc71' : '#e74c3c'; ctx.fillRect(p.x - 18, p.y + 22, 36 * (p.hp / G.st.maxHp), 5);
  // anclas
  for (const w of G.weapons) if (w.id === 'ancla' && w.pos) {
    for (const [ax, ay, a] of w.pos) {
      ctx.strokeStyle = 'rgba(80,80,80,.5)'; ctx.setLineDash([3, 4]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ax, ay); ctx.stroke(); ctx.setLineDash([]);
      drawAnchor(ax, ay, a);
    }
  }
  // ondas del tambor
  for (const wv of G.waves) {
    ctx.strokeStyle = `rgba(255,220,150,${0.9 * (1 - wv.r / wv.R)})`; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(p.x, p.y, wv.r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - wv.r / wv.R)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, wv.r - 8), 0, TAU); ctx.stroke();
  }
  // tornados
  for (const tw of G.tornados) {
    const al = Math.min(1, tw.life * 2);
    ctx.fillStyle = `rgba(0,0,0,${0.12 * al})`; ctx.beginPath(); ctx.ellipse(tw.x, tw.y + 6, tw.R * 0.7, tw.R * 0.25, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(225,240,250,${0.75 * al})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(tw.x + Math.sin(tw.ph + i) * 4, tw.y - i * tw.R * 0.28, tw.R * (0.3 + i * 0.13), tw.R * (0.1 + i * 0.03), 0, tw.ph + i, tw.ph + i + 4.5); ctx.stroke();
    }
  }
  // balas
  for (const b of G.bullets) {
    if (b.kind === 'arpon') {
      ctx.strokeStyle = 'rgba(120,90,60,.45)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx) + (b.back ? Math.PI : 0));
      ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(6, 0); ctx.stroke();
      ctx.fillStyle = '#dfe6ee'; ctx.strokeStyle = '#1b1410'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(3, -7); ctx.lineTo(6, 0); ctx.lineTo(3, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore(); continue;
    }
    if (b.kind === 'hielo') {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx));
      ctx.fillStyle = '#c9f2ff'; ctx.strokeStyle = '#3b8fd0'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(0, -4.5); ctx.lineTo(-8, 0); ctx.lineTo(0, 4.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore(); continue;
    }
    ctx.strokeStyle = 'rgba(255,220,120,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * 0.03, b.y - b.vy * 0.03); ctx.stroke();
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
  }
  // balas de cañón
  for (const c of G.balls) {
    const k = c.t / c.dur, x = c.sx + (c.tx - c.sx) * k, y = c.sy + (c.ty - c.sy) * k, h = Math.sin(Math.PI * k) * 90;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x, y, 7, 3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(x, y - h, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#666'; ctx.beginPath(); ctx.arc(x - 2, y - h - 2, 2, 0, TAU); ctx.fill();
  }
  // efectos
  for (const f of G.fx) {
    const k = 1 - f.t / f.max;
    if (f.k === 'slash') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(f.a);
      ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k)})`; ctx.lineWidth = 12 * (1 - k) + 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, f.r * 0.75, -1.1, -1.1 + 2.2 * Math.min(1, k * 2.5)); ctx.stroke();
      ctx.strokeStyle = `rgba(180,220,255,${0.6 * (1 - k)})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, f.r * 0.95, -1.0, -1.0 + 2.0 * Math.min(1, k * 2.5)); ctx.stroke();
      ctx.restore();
    } else if (f.k === 'bolt') {
      const a = 1 - k;
      ctx.strokeStyle = `rgba(255,250,180,${a})`; ctx.lineWidth = 4; ctx.beginPath();
      let bx = f.x, by = f.y - 320; ctx.moveTo(bx, by);
      for (let i = 1; i <= 8; i++) { by = f.y - 320 + i * 40; bx = f.x + (i < 8 ? (hash(f.seed, i) - 0.5) * 40 : 0); ctx.lineTo(bx, by); }
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,200,${a * 0.5})`; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.6 + k * 0.4), 0, TAU); ctx.fill();
    } else if (f.k === 'poof') {
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * TAU + f.x, d = f.r * (0.2 + k * 0.9);
        ctx.fillStyle = `rgba(245,240,230,${0.55 * (1 - k)})`;
        ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d * 0.7 - k * 10, f.r * (0.45 + k * 0.4), 0, TAU); ctx.fill();
      }
    } else if (f.k === 'boom') {
      ctx.fillStyle = `rgba(255,${150 - k * 100 | 0},40,${0.7 * (1 - k)})`; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.4 + k * 0.7), 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(90,80,70,${0.4 * (1 - k)})`; ctx.beginPath(); ctx.arc(f.x, f.y - k * 20, f.r * 0.5 * (0.5 + k), 0, TAU); ctx.fill();
    }
  }
  for (const q of G.parts) { ctx.globalAlpha = Math.min(1, q.t * 3); ctx.fillStyle = q.c; ctx.fillRect(q.x - q.r / 2, q.y - q.r / 2, q.r, q.r); }
  ctx.globalAlpha = 1;
  ctx.font = '900 13px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const n of G.nums) {
    ctx.globalAlpha = Math.min(1, n.t * 3); ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.strokeText(n.v, n.x, n.y); ctx.fillStyle = '#fff'; ctx.fillText(n.v, n.x, n.y);
  }
  ctx.globalAlpha = 1;
}

function drawHUD() {
  const p = G.p;
  // barra de experiencia
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, 12);
  ctx.fillStyle = '#3fa7f5'; ctx.fillRect(0, 0, W * (p.xp / p.xpNext), 12);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, W, 12);
  ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = '#000';
  const txt = (s, x, y, font, align = 'left', col = '#fff') => { ctx.font = font; ctx.textAlign = align; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); };
  txt('Nivel ' + p.lvl, 10, 72, '900 15px Nunito, sans-serif', 'left', '#9fd8ff');
  let fy = 96;
  for (const k in G.buffs) if (G.buffs[k] > 0) {
    const fr = FRUTAS[k]; drawFruit(ctx, 18, fy, 6, fr.color, G.t);
    ctx.lineWidth = 4; txt(`${fr.nombre} ${Math.ceil(G.buffs[k])}s`, 32, fy, '900 13px Nunito, sans-serif', 'left', fr.color); fy += 22;
  }
  txt(mmss(G.t), W / 2, 36, '40px "Pirata One", serif', 'center');
  txt('☠ ' + fmt(G.kills), 10, 28, '900 16px Nunito, sans-serif');
  txt('💰 ' + fmt(G.bounty), 10, 50, '900 16px Nunito, sans-serif', 'left', '#f6c945');
  // iconos de equipo
  ctx.font = '20px serif'; let x = 10; const y = H - 26;
  for (const w of G.weapons) {
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x, y - 16, 34, 32);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '20px serif'; ctx.fillText(WEAPONS[w.id].icon, x + 17, y);
    txt(w.lvl, x + 31, y + 11, '900 11px Nunito, sans-serif', 'right', '#f6c945'); x += 38;
  }
  x += 6;
  for (const id in G.passives) {
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x, y - 12, 26, 24);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '15px serif'; ctx.fillText(PASSIVES[id].icon, x + 13, y);
    txt(G.passives[id], x + 24, y + 9, '900 10px Nunito, sans-serif', 'right', '#9fe'); x += 29;
  }
  // jefe
  const boss = G.enemies.find(e => e.boss);
  if (boss) {
    const bw = Math.min(420, W - 40), bx = (W - bw) / 2, by = 64;
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(bx, by, bw, 12);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(bx, by, bw * Math.max(0, boss.hp / boss.maxHp), 12);
    ctx.strokeStyle = '#f6c945'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, 12);
    ctx.lineWidth = 4; ctx.strokeStyle = '#000';
    txt(ETYPES[boss.kind].boss, W / 2, by + 26, '22px "Pirata One", serif', 'center', '#f6c945');
    // flecha hacia el jefe si está fuera de pantalla
    const dx = (boss.x - p.x) * S, dy = (boss.y - p.y) * S;
    if (Math.abs(dx) > W / 2 || Math.abs(dy) > H / 2) {
      const a = Math.atan2(dy, dx), k = Math.min((W / 2 - 30) / Math.abs(Math.cos(a) || 1e-6), (H / 2 - 30) / Math.abs(Math.sin(a) || 1e-6));
      ctx.save(); ctx.translate(W / 2 + Math.cos(a) * k, H / 2 + Math.sin(a) * k); ctx.rotate(a);
      ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -10); ctx.lineTo(-8, 10); ctx.fill(); ctx.restore();
    }
  }
  if (G.banner) {
    const b = G.banner; ctx.globalAlpha = Math.min(1, b.t * 2);
    ctx.lineWidth = 6; txt(b.text, W / 2, H * 0.28, (b.boss ? 40 : 30) + 'px "Pirata One", serif', 'center', b.boss ? '#ff6b5b' : '#f6c945');
    ctx.globalAlpha = 1;
  }
  if (joy.active) {
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(joy.ox, joy.oy, 50, 0, TAU); ctx.stroke();
    const dx = joy.x - joy.ox, dy = joy.y - joy.oy, d = Math.hypot(dx, dy), m = Math.min(d, 50) / (d || 1);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(joy.ox + dx * m, joy.oy + dy * m, 22, 0, TAU); ctx.fill();
  }
}

let frameDt = 0.016;
function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#ecd8a2'; ctx.fillRect(0, 0, W, H);
  if (!G || state === 'menu' || state === 'select') {
    const tema = ISLAS[islaSel].tema;
    ctx.setTransform(DPR * S, 0, 0, DPR * S, DPR * W / 2, DPR * H / 2);
    const cx = menuT * 40, cy = menuT * 15;
    ctx.translate(-cx, -cy); drawGround(cx, cy, tema);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    MDR_ISLAS.overlay(ctx, tema, W, H, menuT); MDR_ISLAS.ambient(ctx, tema, W, H, frameDt, menuT);
    if (state === 'menu') { const cv = $('#islaPreview'); MDR_ISLAS.drawPreview(cv.getContext('2d'), tema, cv.width, cv.height, menuT, islaSel * 1.7); }
    return;
  }
  const sx = shake > 0 ? rnd(-shake, shake) : 0, sy = shake > 0 ? rnd(-shake, shake) : 0;
  ctx.setTransform(DPR * S, 0, 0, DPR * S, DPR * (W / 2 + sx), DPR * (H / 2 + sy));
  ctx.translate(-G.p.x, -G.p.y);
  drawWorld();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  MDR_ISLAS.overlay(ctx, G.isla.tema, W, H, G.t);
  MDR_ISLAS.ambient(ctx, G.isla.tema, W, H, state === 'play' ? frameDt : 0, G.t);
  // viñeta roja al recibir daño
  if (G.p.hurtT > 0) { ctx.fillStyle = `rgba(200,0,0,${G.p.hurtT})`; ctx.fillRect(0, 0, W, H); }
  drawHUD();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000); last = now; frameDt = dt;
  menuT += dt;
  if (state === 'play' && G) update(dt);
  shake = Math.max(0, shake - dt * 30);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------- Interfaz ----------
const show = id => $('#' + id).classList.add('show');
const hide = id => $('#' + id).classList.remove('show');
function setTopBtns(v) { $('#topbtns').style.display = v ? 'flex' : 'none'; }
function renderHome() {
  const is = ISLAS[islaSel], un = islaUnlocked(is);
  $('#islaNombre').textContent = is.nombre;
  $('#islaDesc').textContent = is.descripcion || '';
  const n = Math.max(1, Math.min(5, Math.round(((is.dificultad || 1) - 1) / 0.5) + 1));
  $('#islaInfo').innerHTML = `Dificultad <span class="stars">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span> · Berries ×${is.berries || 1}` + (SAVE.islas[is.id] ? ` · Mejor: ${mmss(SAVE.islas[is.id])}` : '');
  const lock = $('#islaLock');
  if (un) lock.classList.remove('on');
  else { const req = ISLAS.find(i => i.id === is.desbloqueo.isla); lock.innerHTML = `<b>🔒</b>Aguanta ${is.desbloqueo.minutos}:00 en ${req ? req.nombre : is.desbloqueo.isla} para desbloquearla`; lock.classList.add('on'); }
  $('#bPlay').disabled = !un;
  $('#islaDots').innerHTML = ISLAS.map((i, k) => `<i class="${k === islaSel ? 'on' : ''} ${islaUnlocked(i) ? '' : 'lock'}"></i>`).join('');
}
function moveIsla(d) { islaSel = (islaSel + d + ISLAS.length) % ISLAS.length; SAVE.islaSel = islaSel; saveGame(); renderHome(); snd('ui'); }
function refreshBest() {
  renderHome();
  const b = store.get('mdr_best', null);
  $('#best').textContent = b ? `Mayor recompensa: 💰 ${fmt(b.bounty)} (${b.name})` : '';
  $('#gold').textContent = `🪙 ${fmt(SAVE.berries)} Berries` + (SAVE.partidas ? ` · ${SAVE.partidas} partidas` : '');
  const nb = misionesListas(), bd = $('#misBadge'); bd.textContent = nb; bd.classList.toggle('on', nb > 0);
}
function buildSelect() {
  const box = $('#chars'); box.innerHTML = '';
  $('#selGold').textContent = `🪙 ${fmt(SAVE.berries)}`;
  CHARS.forEach(ch => {
    const btn = document.createElement('button'); btn.className = 'card';
    const cv = document.createElement('canvas'); cv.width = 240; cv.height = 200; cv.style.width = '120px'; cv.style.height = '100px';
    const c2 = cv.getContext('2d'); c2.scale(2, 2); drawPortrait(c2, ch, 60, 58, 28);
    btn.appendChild(cv);
    btn.insertAdjacentHTML('beforeend', `<div class="nm">${ch.name}</div><div class="lv">${WEAPONS[ch.weapon].icon} ${WEAPONS[ch.weapon].name}</div><div class="ds">${ch.desc}</div>`);
    if (isUnlocked(ch)) btn.onclick = () => startGame(ch);
    else {
      const can = SAVE.berries >= ch.price;
      btn.classList.add('locked'); if (!can) btn.classList.add('poor');
      btn.insertAdjacentHTML('beforeend', `<div class="cost">🔒 ${can ? 'Desbloquear' : 'Necesitas'}: 🪙 ${fmt(ch.price)}</div>`);
      btn.onclick = () => {
        if (SAVE.berries < ch.price) return;
        SAVE.berries -= ch.price; SAVE.desbloqueados.push(ch.id); saveGame(); snd('chest'); buildSelect();
      };
    }
    box.appendChild(btn);
  });
}
let shopFrom = 'menu';
function buildShop() {
  $('#shopGold').textContent = `🪙 ${fmt(SAVE.berries)} Berries`;
  const box = $('#upg'); box.innerHTML = '';
  for (const k in MEJORAS) {
    const m = MEJORAS[k], l = ml(k), maxed = l >= m.max, cost = maxed ? 0 : upgradeCost(k), can = !maxed && SAVE.berries >= cost;
    const b = document.createElement('button'); b.className = 'card upg' + (maxed ? ' maxed' : can ? '' : ' poor');
    b.innerHTML = `<div class="ic">${m.icono}</div><div class="nm">${m.nombre}</div>
      <div class="pips">${'<i class="on"></i>'.repeat(l)}${'<i></i>'.repeat(m.max - l)}</div>
      <div class="ds">${m.descripcion}</div><div class="cost">${maxed ? 'Máximo' : '🪙 ' + fmt(cost)}</div>`;
    b.onclick = () => {
      if (maxed || SAVE.berries < cost) return;
      SAVE.berries -= cost; SAVE.mejoras[k] = l + 1; SAVE.stats.mejorasCompradas++; saveGame(); snd('level'); buildShop();
    };
    box.appendChild(b);
  }
  let spent = 0; for (const k in MEJORAS) for (let i = 0; i < ml(k); i++) spent += costAt(k, i);
  const r = $('#bRefund'); r.disabled = spent === 0; r.textContent = spent ? `Reembolsar mejoras (+🪙 ${fmt(spent)})` : 'Reembolsar mejoras';
  r.onclick = () => { if (!spent) return; SAVE.berries += spent; SAVE.mejoras = {}; saveGame(); buildShop(); };
}
function openShop(from) { shopFrom = from; hide(from); buildShop(); show('shop'); state = 'shop'; }
function closeShop() { hide('shop'); if (shopFrom === 'over') { show('over'); state = 'over'; } else { refreshBest(); show('menu'); state = 'menu'; } }

// ---------- Paneles del menú ----------
let panelFrom = 'menu';
function openPanel(id, from, build) { panelFrom = from; hide(from); build(); show(id); state = id; }
function closePanel(id) { hide(id); if (panelFrom === 'over') { show('over'); state = 'over'; } else { refreshBest(); show('menu'); state = 'menu'; } }
const goldLine = () => `🪙 ${fmt(SAVE.berries)} Berries`;

function buildMissions() {
  $('#misGold').textContent = goldLine();
  $('#misCount').textContent = `${SAVE.cobradas.length} / ${MISIONES.length} completadas`;
  const box = $('#misList'); box.innerHTML = '';
  const rank = m => SAVE.cobradas.includes(m.id) ? 2 : misionProgreso(m) >= m.meta ? 0 : 1;
  for (const m of MISIONES.slice().sort((a, b) => rank(a) - rank(b))) {
    const prog = Math.min(misionProgreso(m), m.meta), done = prog >= m.meta, claimed = SAVE.cobradas.includes(m.id);
    const f = v => m.tipo === 'tiempo' ? mmss(v) : fmt(v);
    const d = document.createElement('div'); d.className = 'mis' + (claimed ? ' claimed' : done ? ' ready' : '');
    d.innerHTML = `<div class="mi">${claimed ? '✅' : done ? '🎁' : '📜'}</div><div class="mb"><div class="mn">${m.nombre}</div><div class="md">${m.descripcion}</div>
      <div class="bar"><i style="width:${prog / m.meta * 100}%"></i></div><div class="mp">${f(prog)} / ${f(m.meta)}</div></div>`;
    const b = document.createElement('button'); b.className = 'claim'; b.disabled = !done || claimed;
    b.textContent = claimed ? 'Cobrada' : `🪙 ${fmt(m.recompensa)}`;
    b.onclick = () => { if (!done || claimed) return; SAVE.cobradas.push(m.id); SAVE.berries += m.recompensa; saveGame(); snd('chest'); buildMissions(); };
    d.appendChild(b); box.appendChild(d);
  }
}

function buildRegistro() {
  const S = SAVE.stats, jefes = Object.values(S.jefes).reduce((a, b) => a + b, 0);
  const rows = [['🎮', 'Partidas', SAVE.partidas], ['🏆', 'Victorias', SAVE.victorias], ['☠️', 'Enemigos derrotados', fmt(S.derribos)],
    ['⏱️', 'Mejor tiempo', mmss(S.mejorTiempo)], ['⭐', 'Mejor nivel', S.mejorNivel], ['💰', 'Mayor recompensa', fmt(S.mejorRecompensa)],
    ['🍈', 'Frutas comidas', S.frutas], ['👑', 'Jefes derrotados', jefes], ['🏴‍☠️', 'Piratas desbloqueados', `${CHARS.filter(isUnlocked).length} / ${CHARS.length}`],
    ['⚓', 'Mejoras compradas', S.mejorasCompradas], ['🎁', 'Tesoros', `${Object.keys(SAVE.inv).length} / ${Object.keys(TESOROS).length}`],
    ['📜', 'Misiones', `${SAVE.cobradas.length} / ${MISIONES.length}`]];
  $('#regStats').innerHTML = rows.map(([i, n, v]) => `<div class="st"><span>${i}</span><b>${v}</b><small>${n}</small></div>`).join('');
  $('#regIslas').innerHTML = ISLAS.map(i => `<div class="st"><span>${islaUnlocked(i) ? '🏝️' : '🔒'}</span><b>${SAVE.islas[i.id] ? mmss(SAVE.islas[i.id]) : '--:--'}</b><small>${i.nombre}</small></div>`).join('');
  const box = $('#bestiario'); box.innerHTML = '';
  for (const k in ETYPES) {
    const n = S.porTipo[k] || 0, cv = document.createElement('canvas'); cv.width = 140; cv.height = 140; cv.style.width = cv.style.height = '70px';
    const c2 = cv.getContext('2d'); c2.scale(2, 2);
    if (!drawSprite(c2, 'en:' + k, 35, 38, 0, false, false, 60)) MDR_DIBUJO.enemigo(c2, k, 35, 38, 15, 0, false, false);
    const d = document.createElement('div'); d.className = 'beast' + (n ? '' : ' unknown');
    d.appendChild(cv);
    d.insertAdjacentHTML('beforeend', `<div class="bn">${n ? ETYPES[k].name : '???'}</div><div class="bc">${n ? '☠ ' + fmt(n) : 'Sin descubrir'}</div>`);
    box.appendChild(d);
  }
  const fb = $('#frutasInfo'); fb.innerHTML = '';
  for (const k in FRUTAS) {
    const fr = FRUTAS[k], cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; cv.style.width = cv.style.height = '32px';
    const c2 = cv.getContext('2d'); c2.scale(2, 2); drawFruit(c2, 16, 18, 7, fr.color, 0);
    const d = document.createElement('div'); d.className = 'fruit-row'; d.appendChild(cv);
    d.insertAdjacentHTML('beforeend', `<div><b style="color:${fr.color}">${fr.nombre}</b><br><small>${fr.descripcion} durante ${fr.duracion}s</small></div>`);
    fb.appendChild(d);
  }
}

// --- Tesoros: textos de bonus ---
const STAT_TXT = { dano: v => `+${Math.round(v * 100)}% daño`, vida: v => `+${Math.round(v * 100)}% vida`, velocidad: v => `+${Math.round(v * 100)}% velocidad`,
  area: v => `+${Math.round(v * 100)}% área`, iman: v => `+${Math.round(v * 100)}% recogida`, experiencia: v => `+${Math.round(v * 100)}% experiencia`,
  berries: v => `+${Math.round(v * 100)}% Berries`, recarga: v => `-${Math.round(v * 100)}% recarga`, armadura: v => `+${+v.toFixed(1)} armadura`, regen: v => `+${+v.toFixed(2)} vida/s` };
function itemText(id, lvl) { const it = TESOROS[id], m = 1 + 0.25 * ((lvl || 1) - 1); return Object.entries(it.stats || {}).map(([k, v]) => (STAT_TXT[k] || (x => k + ' ' + x))(v * m)).join(' · '); }
function itemCard(id, extra = '') {
  const it = TESOROS[id], rz = RAREZAS[it.rareza] || RAREZAS.comun, lvl = SAVE.inv[id] || 0;
  return `<div class="ic">${it.icono}</div><div class="nm">${it.nombre}</div><div class="rz" style="color:${rz.color}">${rz.nombre}${lvl ? ' · Nv ' + lvl : ''}</div><div class="ds">${itemText(id, lvl || 1)}</div>${extra}`;
}

// --- Cofre del Tesoro (gacha con Berries) ---
function rollRarity(minRank) {
  const P = COFRE.probabilidades, pool = RAR_ORDER.filter((r, i) => i >= minRank && P[r] > 0 && Object.values(TESOROS).some(t => t.rareza === r));
  let tot = pool.reduce((a, r) => a + P[r], 0), x = Math.random() * tot;
  for (const r of pool) { x -= P[r]; if (x < 0) return r; }
  return pool[pool.length - 1];
}
function pullOne(minRank) {
  const forced = SAVE.pity >= COFRE.garantiaLegendario - 1 && Object.values(TESOROS).some(t => t.rareza === 'legendario');
  const rar = forced ? 'legendario' : rollRarity(minRank);
  SAVE.pity = rar === 'legendario' ? 0 : SAVE.pity + 1; SAVE.tiradas++;
  const ids = Object.keys(TESOROS).filter(id => TESOROS[id].rareza === rar), id = ids[Math.random() * ids.length | 0], cur = SAVE.inv[id] || 0;
  if (!cur) { SAVE.inv[id] = 1; return { id, tag: '¡NUEVO!' }; }
  if (cur < COFRE.nivelMax) { SAVE.inv[id] = cur + 1; return { id, tag: `Sube a Nv ${cur + 1}` }; }
  const rb = COFRE.reembolso[rar] || 0; SAVE.berries += rb; return { id, tag: `Máximo: +${fmt(rb)} 🪙` };
}
function doPull(n) {
  const cost = n === 10 ? COFRE.precio10 : COFRE.precio;
  if (SAVE.berries < cost || !Object.keys(TESOROS).length) return;
  SAVE.berries -= cost;
  const res = [];
  for (let i = 0; i < n; i++) res.push(pullOne(n === 10 && i === 9 ? 1 : 0));
  for (const r of res) if (!SAVE.equip.includes(r.id) && SAVE.equip.length < COFRE.ranuras) SAVE.equip.push(r.id);
  saveGame(); snd('chest');
  const box = $('#pullRes'); box.innerHTML = '';
  res.forEach((r, i) => {
    const rz = RAREZAS[TESOROS[r.id].rareza] || RAREZAS.comun, d = document.createElement('div');
    d.className = 'card loot rar-' + TESOROS[r.id].rareza; d.style.borderColor = rz.color; d.style.animationDelay = (i * 0.08) + 's';
    d.innerHTML = itemCard(r.id, `<div class="tag">${r.tag}</div>`); box.appendChild(d);
  });
  buildCofre(false);
}
function buildCofre(clear = true) {
  $('#cofGold').textContent = goldLine();
  const P = COFRE.probabilidades;
  $('#cofRates').innerHTML = RAR_ORDER.map(r => `<span style="color:${RAREZAS[r].color}">${RAREZAS[r].nombre} ${P[r]}%</span>`).join(' · ') +
    `<br>Legendario garantizado en ${Math.max(1, COFRE.garantiaLegendario - SAVE.pity)} tiradas como máximo`;
  const b1 = $('#bPull1'), b10 = $('#bPull10');
  b1.textContent = `Abrir 1 · 🪙 ${fmt(COFRE.precio)}`; b10.textContent = `Abrir 10 · 🪙 ${fmt(COFRE.precio10)}`;
  b1.disabled = SAVE.berries < COFRE.precio; b10.disabled = SAVE.berries < COFRE.precio10;
  if (clear) $('#pullRes').innerHTML = '<div class="hint">Cada tirada da un tesoro permanente. Los repetidos suben de nivel.</div>';
}

// --- Inventario ---
function buildInventario() {
  $('#invGold').textContent = goldLine();
  const slots = $('#invSlots'); slots.innerHTML = '';
  for (let i = 0; i < COFRE.ranuras; i++) {
    const id = SAVE.equip[i], d = document.createElement('button'); d.className = 'slot';
    if (id) { const rz = RAREZAS[TESOROS[id].rareza]; d.style.borderColor = rz.color; d.innerHTML = `<span class="si">${TESOROS[id].icono}</span><small>${TESOROS[id].nombre}</small>`; d.onclick = () => { SAVE.equip.splice(i, 1); saveGame(); buildInventario(); }; }
    else { d.innerHTML = '<span class="si">➕</span><small>Vacío</small>'; d.disabled = true; }
    slots.appendChild(d);
  }
  const tot = {};
  for (const id of SAVE.equip) for (const [k, v] of Object.entries(TESOROS[id].stats || {})) tot[k] = (tot[k] || 0) + v * itemMul(id);
  $('#invTotal').textContent = Object.keys(tot).length ? 'Bonus equipados: ' + Object.entries(tot).map(([k, v]) => (STAT_TXT[k] || (x => k))(v)).join(' · ') : 'Equipa tesoros para obtener bonus en todas tus partidas.';
  const grid = $('#invGrid'); grid.innerHTML = '';
  const ids = Object.keys(TESOROS).sort((a, b) => RAR_ORDER.indexOf(TESOROS[b].rareza) - RAR_ORDER.indexOf(TESOROS[a].rareza) || (SAVE.inv[b] ? 1 : 0) - (SAVE.inv[a] ? 1 : 0));
  for (const id of ids) {
    const owned = (SAVE.inv[id] || 0) > 0, eq = SAVE.equip.includes(id), rz = RAREZAS[TESOROS[id].rareza] || RAREZAS.comun;
    const b = document.createElement('button'); b.className = 'card loot' + (owned ? '' : ' unknown') + (eq ? ' equipped' : ''); b.style.borderColor = rz.color;
    b.innerHTML = owned ? itemCard(id, `<div class="tag">${eq ? '✔ Equipado' : 'Equipar'}</div>`) : `<div class="ic">❔</div><div class="nm">???</div><div class="rz" style="color:${rz.color}">${rz.nombre}</div>`;
    b.onclick = () => {
      if (!owned) return;
      if (eq) SAVE.equip = SAVE.equip.filter(x => x !== id);
      else if (SAVE.equip.length < COFRE.ranuras) SAVE.equip.push(id);
      else { $('#invTotal').textContent = `Tienes las ${COFRE.ranuras} ranuras ocupadas: toca un tesoro equipado para quitarlo.`; return; }
      saveGame(); buildInventario();
    };
    grid.appendChild(b);
  }
}

function startGame(ch) {
  initAudio(); if (AC && AC.state === 'suspended') AC.resume();
  if (!SAVE.stats.piratas.includes(ch.id)) { SAVE.stats.piratas.push(ch.id); saveGame(); }
  const isla = (G && state === 'over' && G.isla) || ISLAS[islaSel];
  newGame(ch, isla); hide('select'); hide('over'); hide('menu'); setTopBtns(true); state = 'play'; last = performance.now();
}
function getOptions(n) {
  const opts = [];
  for (const w of G.weapons) if (w.lvl < 5) opts.push({ type: 'w', id: w.id, lvl: w.lvl + 1 });
  if (G.weapons.length < 6) for (const id in WEAPONS) if (!G.weapons.find(w => w.id === id)) opts.push({ type: 'w', id, lvl: 1 });
  const pc = Object.keys(G.passives).length;
  for (const id in PASSIVES) { const l = G.passives[id] || 0; if (l < PASSIVES[id].max && (l > 0 || pc < 6)) opts.push({ type: 'p', id, lvl: l + 1 }); }
  // mejoras con rareza: siempre disponibles; 1-2 por subida (más si ya no quedan armas/objetos)
  const ids = shuffle(Object.keys(MP));
  const nb = opts.length ? (Math.random() < 0.5 ? 1 : 2) : n;
  const res = shuffle(opts).slice(0, Math.max(0, n - nb));
  for (const id of ids) { if (res.length >= n) break; res.push({ type: 'b', id, rar: rollRunRarity() }); }
  if (!res.length) res.push({ type: 'heal' }, { type: 'gold' });
  return shuffle(res);
}
function optInfo(o) {
  if (o.type === 'w') { const d = WEAPONS[o.id]; return { icon: d.icon, name: d.name, tag: o.lvl === 1 ? '¡Nueva arma!' : 'Nivel ' + o.lvl, desc: d.desc[o.lvl - 1] }; }
  if (o.type === 'p') { const d = PASSIVES[o.id]; return { icon: d.icon, name: d.name, tag: o.lvl === 1 ? '¡Nuevo objeto!' : 'Nivel ' + o.lvl, desc: d.desc }; }
  if (o.type === 'b') { const d = MP[o.id], ri = RAR_ORDER.indexOf(o.rar), v = d.valores[ri]; return { icon: d.icono, name: d.name || d.nombre, tag: RAREZAS[o.rar].nombre, desc: (STAT_TXT[d.stat] || (x => d.stat + ' ' + x))(v), rar: o.rar }; }
  if (o.type === 'heal') return { icon: '🍗', name: 'Banquete', tag: 'Extra', desc: 'Recupera un 50% de vida' };
  return { icon: '💰', name: 'Botín', tag: 'Extra', desc: '+500.000 de recompensa' };
}
function openLevelUp(isChest) {
  state = 'levelup'; snd('level');
  curOpts = getOptions(isChest ? 4 : 3);
  $('#luTitle').textContent = isChest ? '¡Cofre del tesoro!' : '¡Nivel ' + G.p.lvl + '!';
  $('#luSub').textContent = isChest ? '+1.000.000 de recompensa. Elige tu botín:' : (G.pending > 1 ? `Mejoras pendientes: ${G.pending}` : 'Elige una mejora');
  const box = $('#opts'); box.innerHTML = '';
  cardsReadyAt = performance.now() + 250;
  curOpts.forEach((o, i) => {
    const inf = optInfo(o), b = document.createElement('button'); b.className = 'card';
    b.innerHTML = `<div class="key">${i + 1}</div><div class="ic">${inf.icon}</div><div class="nm">${inf.name}</div><div class="lv"${inf.rar ? ` style="color:${RAREZAS[inf.rar].color}"` : ''}>${inf.tag}</div><div class="ds">${inf.desc}</div>`;
    if (inf.rar) { b.classList.add('rar-' + inf.rar); b.style.borderColor = RAREZAS[inf.rar].color; }
    b.onclick = () => chooseOpt(o);
    box.appendChild(b);
  });
  show('levelup');
}
function chooseOpt(o) {
  if (performance.now() < cardsReadyAt || state !== 'levelup') return;
  if (o.type === 'w') { const w = G.weapons.find(x => x.id === o.id); if (w) w.lvl++; else G.weapons.push({ id: o.id, lvl: 1, t: 0.2 }); }
  else if (o.type === 'p') { G.passives[o.id] = o.lvl; recalc(); }
  else if (o.type === 'b') { const d = MP[o.id], v = d.valores[RAR_ORDER.indexOf(o.rar)]; G.runStats[d.stat] = (G.runStats[d.stat] || 0) + v; G.runPicks.push(o); recalc(); }
  else if (o.type === 'heal') G.p.hp = Math.min(G.st.maxHp, G.p.hp + G.st.maxHp * 0.5);
  else G.bounty += 5e5;
  G.pending--;
  hide('levelup');
  if (G.pending > 0) openLevelUp(false); else { state = 'play'; last = performance.now(); }
}
function pauseGame() {
  if (state !== 'play') return;
  state = 'pause';
  const st = G.st;
  $('#pStats').innerHTML = `
    <b>${G.ch.name}</b> · Nivel ${G.p.lvl} · ${mmss(G.t)}<br>
    ❤️ Vida: ${Math.ceil(G.p.hp)} / ${Math.round(st.maxHp)}<br>
    ⚔️ Daño: ×${st.might.toFixed(2)} · ⏳ Recarga: ×${st.cd.toFixed(2)}<br>
    🔭 Área: ×${st.area.toFixed(2)} · 👢 Velocidad: ${Math.round(st.speed)}<br>
    🛡️ Armadura: ${st.armor} · 🦜 Proyectiles extra: ${st.amount}<br>
    📜 Experiencia: ×${st.xpMul.toFixed(2)} · 🛟 Revivir: ${G.revives}
    ${G.runPicks.length ? '<br>✨ Mejoras de la partida: ' + G.runPicks.map(o => `<span style="color:${RAREZAS[o.rar].color}">${MP[o.id].icono}</span>`).join(' ') : ''}`;
  show('pause');
}
function resumeGame() { if (state !== 'pause') return; hide('pause'); state = 'play'; last = performance.now(); }
function endGame(won) {
  state = 'over'; setTopBtns(false); joy.active = false;
  const best = store.get('mdr_best', null);
  const record = !best || G.bounty > best.bounty;
  if (record) store.set('mdr_best', { bounty: G.bounty, name: G.ch.name });
  const unlockedBefore = ISLAS.filter(islaUnlocked).map(i => i.id);
  SAVE.islas[G.isla.id] = Math.max(SAVE.islas[G.isla.id] || 0, Math.floor(G.t));
  const nuevas = ISLAS.filter(i => islaUnlocked(i) && !unlockedBefore.includes(i.id));
  const base = (G.isla.berries || 1) * G.kills * PROG.berriesPorDerribo + (G.isla.berries || 1) * (G.t * PROG.berriesPorSegundo + G.bosses * PROG.berriesPorJefe + (won ? PROG.berriesPorVictoria : 0));
  G.gold = Math.floor(base * (1 + pm('codicia') + ib('berries') + rs('berries')));
  SAVE.berries += G.gold; SAVE.partidas++; if (won) SAVE.victorias++;
  const S = SAVE.stats;
  S.derribos += G.kills; S.mejorTiempo = Math.max(S.mejorTiempo, Math.floor(G.t)); S.mejorNivel = Math.max(S.mejorNivel, G.p.lvl);
  S.frutas += G.fruits; S.maxArmas = Math.max(S.maxArmas, G.weapons.length); S.mejorRecompensa = Math.max(S.mejorRecompensa, G.bounty);
  for (const k of G.bossKinds) S.jefes[k] = (S.jefes[k] || 0) + 1;
  for (const k in G.killsBy) S.porTipo[k] = (S.porTipo[k] || 0) + G.killsBy[k];
  saveGame();
  const pc = $('#portrait'), c2 = pc.getContext('2d');
  c2.setTransform(1, 0, 0, 1, 0, 0); c2.fillStyle = '#d9c18c'; c2.fillRect(0, 0, 220, 180);
  c2.fillStyle = 'rgba(120,80,30,.15)'; for (let i = 0; i < 40; i++) c2.fillRect(Math.random() * 220, Math.random() * 180, 2, 2);
  drawPortrait(c2, G.ch, 110, 98, 42);
  $('#oName').textContent = G.ch.name;
  $('#oBounty').textContent = '💰 ' + fmt(G.bounty);
  $('#oStats').textContent = `Tiempo ${mmss(G.t)} · Nivel ${G.p.lvl} · Derribados ${fmt(G.kills)} · Jefes ${G.bosses}`;
  $('#oMsg').textContent = (nuevas.length ? `🏝️ ¡Nueva isla desbloqueada: ${nuevas.map(i => i.nombre).join(', ')}! ` : '') + (won ? '¡Sobreviviste 10 minutos! Eres la leyenda de los mares.' : 'Has caído… pero tu leyenda crece.') + (record ? ' ¡Nueva recompensa récord!' : '');
  const ml_ = misionesListas();
  $('#oGold').textContent = `+${fmt(G.gold)} 🪙 Berries · Total: ${fmt(SAVE.berries)}` + (ml_ ? ` · 📜 ¡${ml_} misión${ml_ > 1 ? 'es' : ''} por cobrar!` : '');
  setTimeout(() => show('over'), won ? 200 : 500);
}

$('#bPlay').onclick = () => { initAudio(); if (!islaUnlocked(ISLAS[islaSel])) return; snd('ui'); buildSelect(); hide('menu'); show('select'); state = 'select'; };
$('#islaPrev').onclick = () => { initAudio(); moveIsla(-1); };
$('#islaNext').onclick = () => { initAudio(); moveIsla(1); };
$('#bAyuda').onclick = () => { initAudio(); openPanel('ayuda', 'menu', () => {}); };
$('#ayuda .back').onclick = () => closePanel('ayuda');
$('#bBack').onclick = () => { hide('select'); show('menu'); state = 'menu'; refreshBest(); };
$('#bShop').onclick = () => { initAudio(); openShop('menu'); };
$('#bMis').onclick = () => { initAudio(); openPanel('missions', 'menu', buildMissions); };
$('#bMis2').onclick = () => openPanel('missions', 'over', buildMissions);
$('#bReg').onclick = () => { initAudio(); openPanel('registro', 'menu', buildRegistro); };
$('#bCofre').onclick = () => { initAudio(); openPanel('cofre', 'menu', buildCofre); };
$('#bInv').onclick = () => { initAudio(); openPanel('inv', 'menu', buildInventario); };
$('#bPull1').onclick = () => doPull(1);
$('#bPull10').onclick = () => doPull(10);
for (const id of ['missions', 'registro', 'cofre', 'inv']) $('#' + id + ' .back').onclick = () => closePanel(id);
$('#bShop2').onclick = () => openShop('over');
$('#bShopBack').onclick = () => closeShop();
$('#bPause').onclick = () => pauseGame();
$('#bResume').onclick = () => resumeGame();
$('#bQuit').onclick = () => { hide('pause'); setTopBtns(false); G = null; state = 'menu'; refreshBest(); show('menu'); };
$('#bRetry').onclick = () => { const ch = G.ch; hide('over'); startGame(ch); };
$('#bMenu').onclick = () => { hide('over'); G = null; state = 'menu'; refreshBest(); show('menu'); };
const bMute = $('#bMute');
const setMuteIcon = () => { bMute.textContent = muted ? '🔇' : '🔊'; };
bMute.onclick = () => { muted = !muted; store.set('mdr_muted', muted); setMuteIcon(); };
setMuteIcon(); refreshBest();

addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k.startsWith('arrow') || k === ' ') e.preventDefault();
  keys.add(k);
  if ((k === 'p' || k === 'escape') && state === 'play') pauseGame();
  else if ((k === 'p' || k === 'escape') && state === 'pause') resumeGame();
  if (state === 'menu' && (k === 'arrowleft' || k === 'a')) moveIsla(-1);
  if (state === 'menu' && (k === 'arrowright' || k === 'd')) moveIsla(1);
  if (state === 'levelup' && /^[1-4]$/.test(k)) { const o = curOpts[+k - 1]; if (o) chooseOpt(o); }
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => { keys.clear(); joy.active = false; pauseGame(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });

cvs.addEventListener('pointerdown', e => {
  if (state !== 'play' || joy.active) return;
  joy.active = true; joy.id = e.pointerId; joy.ox = joy.x = e.clientX; joy.oy = joy.y = e.clientY;
  try { cvs.setPointerCapture(e.pointerId); } catch (err) {}
});
cvs.addEventListener('pointermove', e => { if (joy.active && e.pointerId === joy.id) { joy.x = e.clientX; joy.y = e.clientY; } });
const endJoy = e => { if (e.pointerId === joy.id) joy.active = false; };
cvs.addEventListener('pointerup', endJoy); cvs.addEventListener('pointercancel', endJoy);

// gancho de pruebas
window.__mdr = { get G() { return G; }, get state() { return state; }, get SAVE() { return SAVE; } };
})();
