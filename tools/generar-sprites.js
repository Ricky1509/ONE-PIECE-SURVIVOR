// Genera los sprites de ejemplo (tiras PNG de 4 fotogramas) en sprites/
// a partir de los dibujos procedurales de js/dibujo.js.
//
// Uso:  npm i -D playwright && npx playwright install chromium
//       node tools/generar-sprites.js
//
// Formato de salida (el mismo que debe tener cualquier sprite propio):
//   - tira horizontal de FRAMES fotogramas cuadrados, fondo transparente
//   - el personaje mira a la derecha
//   - el centro del personaje está al 62 % (piratas) o 55 % (enemigos) de la altura → anclaY
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
    // k = tamaño del fotograma en radios; ay = altura del centro (anclaY)
    function sheet(r, drawFrame, k = 4, ay = 0.55) {
      const size = Math.ceil(r * k), cv = document.createElement('canvas');
      cv.width = size * FRAMES; cv.height = size;
      const c = cv.getContext('2d');
      for (let i = 0; i < FRAMES; i++) drawFrame(c, i * size + size / 2, size * ay, i);
      return cv.toDataURL('image/png');
    }
    for (const pj of CFG.personajes) {
      const r = 35; // radio de dibujo (doble resolución); fotograma 4.4r, centro al 62 % → alto 77, anclaY 0.62
      out[pj.id] = sheet(r, (c, x, y, i) => D.pirata(c, x, y, r, Object.assign({ arma: pj.arma }, pj.dibujo), 0, i / FRAMES * (Math.PI * 2 / 12), true, false, false), 4.4, 0.62);
    }
    for (const k in CFG.enemigos) {
      const r = CFG.enemigos[k].radio * 2; // doble resolución; alto en juego = radio * 4
      out[k] = sheet(r, (c, x, y, i) => D.enemigo(c, k, x, y, r, i / FRAMES * Math.PI * 2, false, false));
    }
    return out;
  }, FRAMES);

  // Iconos de la app (PWA / tiendas): pirata original sobre fondo marino
  const icons = await page.evaluate(() => {
    const out = {};
    for (const size of [192, 512]) {
      const cv = document.createElement('canvas'); cv.width = cv.height = size;
      const c = cv.getContext('2d');
      const g = c.createLinearGradient(0, 0, 0, size); g.addColorStop(0, '#1d6fa5'); g.addColorStop(1, '#0b2a47');
      c.fillStyle = g; c.fillRect(0, 0, size, size);
      c.fillStyle = '#ecd8a2'; c.beginPath(); c.ellipse(size / 2, size * 0.86, size * 0.42, size * 0.12, 0, 0, Math.PI * 2); c.fill();
      window.MDR_DIBUJO.pirata(c, size / 2, size * 0.66, size * 0.19, Object.assign({ arma: window.MDR_CONFIG.personajes[0].arma }, window.MDR_CONFIG.personajes[0].dibujo), 0, 0, false, false, false);
      out['icon-' + size] = cv.toDataURL('image/png');
    }
    return out;
  });
  fs.mkdirSync(path.join(ROOT, 'icons'), { recursive: true });
  for (const [name, url] of Object.entries(icons)) {
    const file = path.join(ROOT, 'icons', name + '.png');
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
    console.log('✔', path.relative(ROOT, file));
  }

  for (const [name, url] of Object.entries(sheets)) {
    const file = path.join(OUT, name + '.png');
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
    console.log('✔', path.relative(ROOT, file));
  }
  await browser.close();
})();
