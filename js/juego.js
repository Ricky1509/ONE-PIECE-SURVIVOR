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

// ---------- Sonido (sintetizado) ----------
let AC = null, muted = store.get('mdr_muted', false);
function initAudio() { if (AC) return; try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
const SOUNDS = {
  hit: { type: 'square', f0: 260, f1: 120, d: .05, v: .025, gap: .05 },
  coin: { type: 'sine', f0: 900, f1: 1500, d: .06, v: .035, gap: .045 },
  level: { type: 'triangle', f0: 400, f1: 1300, d: .4, v: .12, gap: .2 },
  hurt: { type: 'sawtooth', f0: 220, f1: 60, d: .16, v: .07, gap: .25 },
  boom: { type: 'sawtooth', f0: 130, f1: 30, d: .3, v: .07, gap: .08 },
  zap: { type: 'square', f0: 1700, f1: 300, d: .12, v: .03, gap: .06 },
  shot: { type: 'square', f0: 700, f1: 200, d: .05, v: .025, gap: .05 },
  slash: { type: 'triangle', f0: 900, f1: 250, d: .09, v: .04, gap: .08 },
  boss: { type: 'sawtooth', f0: 70, f1: 160, d: .9, v: .14, gap: 1 },
  chest: { type: 'triangle', f0: 600, f1: 1800, d: .5, v: .1, gap: .3 },
};
const lastSnd = {};
function snd(name) {
  if (!AC || muted) return;
  const now = AC.currentTime, d = SOUNDS[name];
  if (lastSnd[name] && now - lastSnd[name] < d.gap) return;
  lastSnd[name] = now;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = d.type; o.frequency.setValueAtTime(d.f0, now); o.frequency.exponentialRampToValueAtTime(d.f1, now + d.d);
  g.gain.setValueAtTime(d.v, now); g.gain.exponentialRampToValueAtTime(0.0001, now + d.d);
  o.connect(g).connect(AC.destination); o.start(now); o.stop(now + d.d + .02);
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

function newGame(ch) {
  G = {
    ch, t: 0, kills: 0, bounty: 0, bosses: 0, spawnAcc: 0, nextSwarm: 75, bossIdx: 0, won: false,
    p: { x: 0, y: 0, r: 14, hp: 100, iframe: 0, hurtT: 0, face: 0, mvx: 0, mvy: 0, moving: false, xp: 0, lvl: 1, xpNext: 5 },
    weapons: [], passives: {}, enemies: [], bullets: [], balls: [], fx: [], coins: [], items: [], nums: [], parts: [],
    pending: 0, banner: null, st: null, revives: Math.floor(pm('revivir')), gold: 0,
  };
  G.weapons.push({ id: ch.weapon, lvl: 1, t: 0.3 });
  recalc(); G.p.hp = G.st.maxHp;
}
function recalc() {
  const c = G.ch.bonus || {}, lv = k => G.passives[k] || 0, old = G.st;
  G.st = {
    might: (1 + 0.1 * lv('polvora')) * (1 + pm('dano')),
    cd: (c.cooldown || 1) * (1 - 0.08 * lv('reloj')) * Math.max(0.3, 1 - pm('recarga')),
    area: (c.area || 1) * (1 + 0.1 * lv('catalejo')) * (1 + pm('area')),
    amount: lv('loro'),
    speed: 150 * (c.speed || 1) * (1 + 0.1 * lv('botas')) * (1 + pm('velocidad')),
    magnet: 75 * (1 + 0.3 * lv('brujula')) * (1 + pm('iman')),
    armor: (c.armor || 0) + lv('coraza') + pm('armadura'),
    regen: 0.3 * lv('coraza') + pm('regen'),
    maxHp: 100 * (c.maxHp || 1) * (1 + 0.2 * lv('ron')) * (1 + pm('vida')),
    xpMul: 1 + pm('experiencia'),
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
  if (e.boss) {
    G.bosses++; G.items.push({ k: 'chest', x: e.x, y: e.y });
    banner('¡' + ETYPES[e.kind].boss + ' derrotado!'); shake = 12; snd('boom');
  } else {
    const r = Math.random();
    if (r < 0.006) G.items.push({ k: 'food', x: e.x, y: e.y });
    else if (r < 0.0085) G.items.push({ k: 'magnet', x: e.x, y: e.y });
  }
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
          snd('shot');
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
    }
  }
}

// ---------- Enemigos ----------
function spawnEnemy(kind, x, y) {
  const T = ETYPES[kind], t = G.t, hm = T.boss ? 1 + t / 300 : 1 + t / 90;
  G.enemies.push({
    kind, x, y, r: T.r, hp: T.hp * hm, maxHp: T.hp * hm, spd: T.spd * rnd(.9, 1.1), dmg: T.dmg * (1 + t / 400),
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

  buildGrid();
  updateWeapons(dt);

  for (const b of G.bullets) {
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0) continue;
    queryR(b.x, b.y, b.r, e => {
      if (b.life <= 0 || b.hit.has(e)) return;
      if ((e.x - b.x) ** 2 + (e.y - b.y) ** 2 < (e.r + b.r) ** 2) {
        b.hit.add(e); hurt(e, b.dmg, b.vx * 0.25, b.vy * 0.25);
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
function drawGround(cx, cy) {
  const T = 110, hw = vw() / 2 + T, hh = vh() / 2 + T;
  const x0 = Math.floor((cx - hw) / T), x1 = Math.floor((cx + hw) / T), y0 = Math.floor((cy - hh) / T), y1 = Math.floor((cy + hh) / T);
  for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
    const h = hash(ix, iy), X = ix * T, Y = iy * T;
    ctx.fillStyle = h < 0.5 ? '#ecd8a2' : '#e6d098';
    ctx.fillRect(X, Y, T + 1, T + 1);
    const dx = X + 20 + hash(ix + 999, iy - 777) * 70, dy = Y + 20 + hash(ix - 55, iy + 31) * 70;
    if (h < 0.04) { // palmera
      ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(dx + 6, dy + 4, 30, 10, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.quadraticCurveTo(dx + 8, dy - 25, dx + 2, dy - 48); ctx.stroke();
      ctx.fillStyle = '#2e8b57';
      for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + h * 40; ctx.beginPath(); ctx.ellipse(dx + 2 + Math.cos(a) * 16, dy - 48 + Math.sin(a) * 9, 18, 6, a, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#6b4226'; ctx.beginPath(); ctx.arc(dx + 2, dy - 46, 4, 0, TAU); ctx.fill();
    } else if (h < 0.10) { // roca
      ctx.fillStyle = '#9c8f7a'; ctx.beginPath(); ctx.ellipse(dx, dy, 14, 9, 0.3, 0, TAU); ctx.fill();
      ctx.fillStyle = '#b8ab94'; ctx.beginPath(); ctx.ellipse(dx - 3, dy - 3, 7, 4, 0.3, 0, TAU); ctx.fill();
    } else if (h < 0.16) { // estrella de mar
      ctx.fillStyle = '#e8774a'; ctx.beginPath();
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, rr = k % 2 ? 3 : 8; ctx.lineTo(dx + Math.cos(a) * rr, dy + Math.sin(a) * rr); }
      ctx.fill();
    } else if (h < 0.20) { // charco
      ctx.fillStyle = '#7ec8d8'; ctx.beginPath(); ctx.ellipse(dx, dy, 26, 12, h * 20, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(dx - 6, dy - 3, 8, 2, h * 20, 0, TAU); ctx.fill();
    } else if (h < 0.22) { // huesos
      ctx.strokeStyle = '#f4efe2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dx - 9, dy - 6); ctx.lineTo(dx + 9, dy + 6); ctx.moveTo(dx + 9, dy - 6); ctx.lineTo(dx - 9, dy + 6); ctx.stroke();
    } else if (h < 0.45) {
      ctx.fillStyle = 'rgba(150,110,60,.25)';
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(dx + hash(ix + k, iy) * 40 - 20, dy + hash(ix, iy + k) * 40 - 20, 1.6, 0, TAU); ctx.fill(); }
    }
  }
}

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
function drawChest(x, y, t) {
  const c = ctx; c.save(); c.translate(x, y + Math.sin(t * 4) * 2);
  c.fillStyle = 'rgba(246,201,69,.35)'; c.beginPath(); c.arc(0, 0, 22 + Math.sin(t * 6) * 3, 0, TAU); c.fill();
  c.fillStyle = '#8e5a2b'; c.fillRect(-14, -6, 28, 16); c.fillStyle = '#6e4220'; c.fillRect(-14, -12, 28, 7);
  c.fillStyle = '#f6c945'; c.fillRect(-15, -6, 30, 2); c.fillRect(-3, -8, 6, 7); c.fillRect(-14, -12, 2, 22); c.fillRect(12, -12, 2, 22);
  c.restore();
}

function drawWorld() {
  const p = G.p, t = G.t;
  drawGround(p.x, p.y);
  // monedas
  for (const c of G.coins) {
    const big = c.v >= 8, mid = c.v >= 3, r = big ? 7 : mid ? 5.5 : 4.5;
    ctx.fillStyle = big ? '#e8b923' : mid ? '#cfd8dc' : '#cd7f32';
    ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(c.x - r * 0.3, c.y - r * 0.3, r * 0.35, 0, TAU); ctx.fill();
  }
  for (const it of G.items) {
    if (it.k === 'chest') { drawChest(it.x, it.y, t); continue; }
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
  // balas
  for (const b of G.bullets) {
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

function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#ecd8a2'; ctx.fillRect(0, 0, W, H);
  if (!G || state === 'menu' || state === 'select') {
    ctx.setTransform(DPR * S, 0, 0, DPR * S, DPR * W / 2, DPR * H / 2);
    const cx = menuT * 40, cy = menuT * 15;
    ctx.translate(-cx, -cy); drawGround(cx, cy);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return;
  }
  const sx = shake > 0 ? rnd(-shake, shake) : 0, sy = shake > 0 ? rnd(-shake, shake) : 0;
  ctx.setTransform(DPR * S, 0, 0, DPR * S, DPR * (W / 2 + sx), DPR * (H / 2 + sy));
  ctx.translate(-G.p.x, -G.p.y);
  drawWorld();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  // viñeta roja al recibir daño
  if (G.p.hurtT > 0) { ctx.fillStyle = `rgba(200,0,0,${G.p.hurtT})`; ctx.fillRect(0, 0, W, H); }
  drawHUD();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000); last = now;
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
function refreshBest() {
  const b = store.get('mdr_best', null);
  $('#best').textContent = b ? `Mayor recompensa: 💰 ${fmt(b.bounty)} (${b.name})` : '';
  $('#gold').textContent = `🪙 ${fmt(SAVE.berries)} Berries` + (SAVE.partidas ? ` · ${SAVE.partidas} partidas` : '');
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
      SAVE.berries -= cost; SAVE.mejoras[k] = l + 1; saveGame(); snd('level'); buildShop();
    };
    box.appendChild(b);
  }
  let spent = 0; for (const k in MEJORAS) for (let i = 0; i < ml(k); i++) spent += costAt(k, i);
  const r = $('#bRefund'); r.disabled = spent === 0; r.textContent = spent ? `Reembolsar mejoras (+🪙 ${fmt(spent)})` : 'Reembolsar mejoras';
  r.onclick = () => { if (!spent) return; SAVE.berries += spent; SAVE.mejoras = {}; saveGame(); buildShop(); };
}
function openShop(from) { shopFrom = from; hide(from); buildShop(); show('shop'); state = 'shop'; }
function closeShop() { hide('shop'); if (shopFrom === 'over') { show('over'); state = 'over'; } else { refreshBest(); show('menu'); state = 'menu'; } }

function startGame(ch) {
  initAudio(); if (AC && AC.state === 'suspended') AC.resume();
  newGame(ch); hide('select'); hide('over'); hide('menu'); setTopBtns(true); state = 'play'; last = performance.now();
}
function getOptions(n) {
  const opts = [];
  for (const w of G.weapons) if (w.lvl < 5) opts.push({ type: 'w', id: w.id, lvl: w.lvl + 1 });
  if (G.weapons.length < 6) for (const id in WEAPONS) if (!G.weapons.find(w => w.id === id)) opts.push({ type: 'w', id, lvl: 1 });
  const pc = Object.keys(G.passives).length;
  for (const id in PASSIVES) { const l = G.passives[id] || 0; if (l < PASSIVES[id].max && (l > 0 || pc < 6)) opts.push({ type: 'p', id, lvl: l + 1 }); }
  const res = shuffle(opts).slice(0, n);
  if (!res.length) res.push({ type: 'heal' }, { type: 'gold' });
  return res;
}
function optInfo(o) {
  if (o.type === 'w') { const d = WEAPONS[o.id]; return { icon: d.icon, name: d.name, tag: o.lvl === 1 ? '¡Nueva arma!' : 'Nivel ' + o.lvl, desc: d.desc[o.lvl - 1] }; }
  if (o.type === 'p') { const d = PASSIVES[o.id]; return { icon: d.icon, name: d.name, tag: o.lvl === 1 ? '¡Nuevo objeto!' : 'Nivel ' + o.lvl, desc: d.desc }; }
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
    b.innerHTML = `<div class="key">${i + 1}</div><div class="ic">${inf.icon}</div><div class="nm">${inf.name}</div><div class="lv">${inf.tag}</div><div class="ds">${inf.desc}</div>`;
    b.onclick = () => chooseOpt(o);
    box.appendChild(b);
  });
  show('levelup');
}
function chooseOpt(o) {
  if (performance.now() < cardsReadyAt || state !== 'levelup') return;
  if (o.type === 'w') { const w = G.weapons.find(x => x.id === o.id); if (w) w.lvl++; else G.weapons.push({ id: o.id, lvl: 1, t: 0.2 }); }
  else if (o.type === 'p') { G.passives[o.id] = o.lvl; recalc(); }
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
    📜 Experiencia: ×${st.xpMul.toFixed(2)} · 🛟 Revivir: ${G.revives}`;
  show('pause');
}
function resumeGame() { if (state !== 'pause') return; hide('pause'); state = 'play'; last = performance.now(); }
function endGame(won) {
  state = 'over'; setTopBtns(false); joy.active = false;
  const best = store.get('mdr_best', null);
  const record = !best || G.bounty > best.bounty;
  if (record) store.set('mdr_best', { bounty: G.bounty, name: G.ch.name });
  const base = G.kills * PROG.berriesPorDerribo + G.t * PROG.berriesPorSegundo + G.bosses * PROG.berriesPorJefe + (won ? PROG.berriesPorVictoria : 0);
  G.gold = Math.floor(base * (1 + pm('codicia')));
  SAVE.berries += G.gold; SAVE.partidas++; if (won) SAVE.victorias++; saveGame();
  const pc = $('#portrait'), c2 = pc.getContext('2d');
  c2.setTransform(1, 0, 0, 1, 0, 0); c2.fillStyle = '#d9c18c'; c2.fillRect(0, 0, 220, 180);
  c2.fillStyle = 'rgba(120,80,30,.15)'; for (let i = 0; i < 40; i++) c2.fillRect(Math.random() * 220, Math.random() * 180, 2, 2);
  drawPortrait(c2, G.ch, 110, 98, 42);
  $('#oName').textContent = G.ch.name;
  $('#oBounty').textContent = '💰 ' + fmt(G.bounty);
  $('#oStats').textContent = `Tiempo ${mmss(G.t)} · Nivel ${G.p.lvl} · Derribados ${fmt(G.kills)} · Jefes ${G.bosses}`;
  $('#oMsg').textContent = (won ? '¡Sobreviviste 10 minutos! Eres la leyenda de los mares.' : 'Has caído… pero tu leyenda crece.') + (record ? ' ¡Nueva recompensa récord!' : '');
  $('#oGold').textContent = `+${fmt(G.gold)} 🪙 Berries · Total: ${fmt(SAVE.berries)}`;
  setTimeout(() => show('over'), won ? 200 : 500);
}

$('#bPlay').onclick = () => { initAudio(); buildSelect(); hide('menu'); show('select'); state = 'select'; };
$('#bBack').onclick = () => { hide('select'); show('menu'); state = 'menu'; refreshBest(); };
$('#bShop').onclick = () => { initAudio(); openShop('menu'); };
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
