// Genera los sprites de ejemplo (tiras PNG de 4 fotogramas) en sprites/
// a partir de los dibujos procedurales de js/dibujo.js.
//
// Uso:  npm i -D playwright && npx playwright install chromium
//       node tools/generar-sprites.js
//
// Formato de salida (el mismo que debe tener cualquier sprite propio):
//   - tira horizontal de FRAMES fotogramas cuadrados, fondo transparente
//   - el personaje mira a la derecha
//   - el centro del personaje está al 55 % de la altura (anclaY: 0.55)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'sprites');
const FRAMES = 4;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<!DOCTYPE html><html><body></body></html>');
  await page.addScriptTag({ path: path.join(ROOT, 'js/config.js') });
  await page.addScriptTag({ path: path.join(ROOT, 'js/dibujo.js') });

  const sheets = await page.evaluate((FRAMES) => {
    const CFG = window.MDR_CONFIG, D = window.MDR_DIBUJO, out = {};
    function sheet(r, drawFrame) {
      const size = Math.ceil(r * 4), cv = document.createElement('canvas');
      cv.width = size * FRAMES; cv.height = size;
      const c = cv.getContext('2d');
      for (let i = 0; i < FRAMES; i++) drawFrame(c, i * size + size / 2, size * 0.55, i);
      return cv.toDataURL('image/png');
    }
    for (const pj of CFG.personajes) {
      const r = 35; // radio de dibujo: alto en juego 70 = r*4 / 2
      out[pj.id] = sheet(r, (c, x, y, i) => D.pirata(c, x, y, r, pj.dibujo, 0, i / FRAMES * (Math.PI * 2 / 12), true, false, false));
    }
    for (const k in CFG.enemigos) {
      const r = CFG.enemigos[k].radio * 2; // doble resolución; alto en juego = radio * 4
      out[k] = sheet(r, (c, x, y, i) => D.enemigo(c, k, x, y, r, i / FRAMES * Math.PI * 2, false, false));
    }
    return out;
  }, FRAMES);

  for (const [name, url] of Object.entries(sheets)) {
    const file = path.join(OUT, name + '.png');
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
    console.log('✔', path.relative(ROOT, file));
  }
  await browser.close();
})();
