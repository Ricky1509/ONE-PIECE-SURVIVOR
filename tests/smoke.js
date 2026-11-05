// Prueba de humo del juego en un navegador sin ventana (Playwright + Chromium).
// Recorre el camino crítico: menú → ajustes → zarpar → jugar → subir de nivel →
// pausa → mando → derrota → menú, en español e inglés, y con un guardado corrupto.
// Uso: node tests/smoke.js            (EVIDENCE=1 guarda capturas en production/qa/evidence/)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const EVID = process.env.EVIDENCE ? path.join(root, 'production/qa/evidence') : null;
let fails = 0;
const check = (ok, msg) => { console.log((ok ? '  ✔ ' : '  ✘ ') + msg); if (!ok) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run(browser, base, lang, opts = {}) {
  console.log(`\n▶ ${lang.toUpperCase()}${opts.save ? ' · ' + opts.name : ''}`);
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  // el bucle del juego captura las excepciones y las escribe con console.error: también cuentan
  page.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_FAILED|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  // Chromium sin ventana: el bloqueo de Google Fonts no debe contar como error del juego
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.addInitScript(([lang, save]) => {
    if (!sessionStorage.getItem('init')) {
      localStorage.clear(); localStorage.setItem('mdr_lang', lang);
      if (save !== null) localStorage.setItem('mdr_save', save);
      sessionStorage.setItem('init', '1');
    }
    const pad = { connected: true, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
    window.__pad = pad; navigator.getGamepads = () => (window.__padOn ? [pad] : []);
  }, [lang, opts.save === undefined ? null : opts.save]);
  await page.goto(base + '/index.html'); await sleep(500);
  if (!(await page.evaluate(() => !!window.__mdr))) { check(false, 'el juego arranca' + (errors.length ? ': ' + errors.join(' | ') : '')); await page.close(); return; }
  const st = () => page.evaluate(() => __mdr.state);
  const shot = async n => { if (EVID) await page.screenshot({ path: path.join(EVID, `smoke-${lang}-${n}.png`) }); };

  check(await page.evaluate(() => document.querySelector('#menu').classList.contains('show')), 'menú visible');
  check(await page.evaluate(l => document.documentElement.lang === l, lang), `idioma activo: ${lang}`);
  await shot('menu');
  await page.click('#bOpts'); check(await st() === 'ajustes', 'ajustes abre');
  await shot('ajustes');
  await page.click('#oNums'); check(await page.evaluate(() => JSON.parse(localStorage.getItem('mdr_opts')).nums === false), 'ajuste guardado');
  await page.click('#oNums');
  await page.click('#ajustes .back'); check(await st() === 'menu', 'ajustes cierra');
  for (const id of ['bOrd', 'bShop', 'bCofre', 'bInv', 'bMis', 'bReg', 'bAyuda']) {
    await page.click('#' + id); const s = await st(); check(s !== 'menu', `panel ${id} abre (${s})`);
    await page.keyboard.press('Escape'); await sleep(50);
    if (await st() !== 'menu') { await page.evaluate(() => { const b = [...document.querySelectorAll('.ov.show .back, .ov.show #bShopBack')].pop(); b && b.click(); }); }
  }
  check(await st() === 'menu', 'vuelve al menú desde los paneles');
  await page.click('#bPlay'); check(await st() === 'select', 'selección de pirata');
  await page.click('#chars .card'); await sleep(300); check(await st() === 'play', 'la partida empieza');
  await sleep(2500);
  check(await page.evaluate(() => __mdr.G.t > 1.5), 'el tiempo avanza');
  check(await page.evaluate(() => __mdr.G.enemies.length > 0), 'aparecen enemigos');
  await page.keyboard.down('d'); await sleep(500); await page.keyboard.up('d');
  check(await page.evaluate(() => __mdr.G.p.x > 30), 'teclado mueve al jugador');
  await page.evaluate(() => { window.__padOn = true; __pad.axes[1] = 1; }); await sleep(400); await page.evaluate(() => { __pad.axes[1] = 0; window.__padOn = false; });
  check(await page.evaluate(() => __mdr.G.p.y > 30), 'mando mueve al jugador');
  await page.evaluate(() => { __mdr.G.pending = 2; }); await sleep(400);
  check(await st() === 'levelup', 'subida de nivel muestra cartas');
  await shot('levelup');
  for (let i = 0; i < 6 && await st() === 'levelup'; i++) { await sleep(300); await page.keyboard.press('1'); }
  check(await st() === 'play', 'se elige mejora con teclado');
  // regresión: la emboscada del 1:15, el jefe y el juramento congelaban el juego (t() tapado por una variable local)
  await page.evaluate(() => { __mdr.G.p.hp = 1e9; __mdr.G.t = 74.5; }); await sleep(1200);
  check(await page.evaluate(() => __mdr.G.t > 75.3), 'la emboscada del 1:15 no congela el juego');
  await page.evaluate(() => { __mdr.G.t = 209.5; }); await sleep(1200);
  check(await page.evaluate(() => __mdr.G.t > 210.3 && __mdr.G.enemies.some(e => e.boss)), 'aparece el primer jefe sin errores');
  await page.evaluate(() => __mdr.oath(1)); await sleep(2500); await shot('juramento');
  await page.keyboard.press('x'); await sleep(400);
  check(await page.evaluate(() => !__mdr.G.oath && __mdr.state === 'play'), 'el juramento se muestra y se cierra');
  const t0 = await page.evaluate(() => __mdr.G.t); await sleep(500);
  check(await page.evaluate(t0 => __mdr.G.t > t0, t0), 'la partida sigue tras el juramento');
  await page.keyboard.press('Escape'); check(await st() === 'pause', 'pausa');
  await page.keyboard.press('Escape'); check(await st() === 'play', 'reanudar');
  await sleep(1500); await shot('play');
  const gold0 = await page.evaluate(() => __mdr.SAVE.berries);
  await page.evaluate(() => __mdr.end(false)); await sleep(800);
  check(await st() === 'over', 'pantalla final');
  check(await page.evaluate(g => __mdr.SAVE.berries >= g && Number.isFinite(__mdr.SAVE.berries), gold0), 'recompensa válida');
  await shot('over');
  await page.click('#bMenu'); check(await st() === 'menu', 'vuelve al menú');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('mdr_save')).partidas >= 1), 'partida guardada');
  check(errors.length === 0, 'sin errores de JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await page.close();
}

(async () => {
  if (EVID) fs.mkdirSync(EVID, { recursive: true });
  await new Promise(r => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  try {
    await run(browser, base, 'es');
    await run(browser, base, 'en');
    await run(browser, base, 'es', { name: 'guardado corrupto', save: '{"berries":"mucho","mejoras":[1,2],"desbloqueados":"x","stats":{"jefes":null,"piratas":{}},"inv":null,"equip":{},"islas":5,"ordenes":[],"ordenDesb":"y","cobradas":7}' });
    await run(browser, base, 'en', { name: 'guardado ilegible', save: '{roto' });
  } finally { await browser.close(); server.close(); }
  console.log(fails ? `\n✘ ${fails} comprobaciones fallidas` : '\n✔ Prueba de humo superada');
  process.exit(fails ? 1 : 0);
})();
