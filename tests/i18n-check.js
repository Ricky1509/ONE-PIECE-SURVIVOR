// Comprueba que cada texto t('…') del juego tiene traducción al inglés en js/i18n-en.js.
// Uso: node tests/i18n-check.js   (sale con código 1 si falta alguna)
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = {};
require(path.join(root, 'js/i18n-en.js'));
const ui = window.MDR_I18N_EN.ui;
const src = fs.readFileSync(path.join(root, 'js/juego.js'), 'utf8');
// t('…') o t("…") con un literal simple como primer argumento
const re = /\bt\(\s*(['"])((?:\\.|(?!\1).)*)\1/g;
const missing = new Set(); let total = 0, m;
while ((m = re.exec(src))) {
  const key = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"');
  total++;
  if (ui[key] === undefined) missing.add(key);
}
// atributos data-i18n-html del HTML
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const mm of html.matchAll(/data-i18n-html="([^"]+)"/g)) { total++; if (ui[mm[1]] === undefined) missing.add(mm[1]); }
if (missing.size) {
  console.error(`Faltan ${missing.size} traducciones (de ${total} textos):`);
  for (const k of missing) console.error('  ' + JSON.stringify(k));
  process.exit(1);
}
console.log(`i18n OK: ${total} textos con traducción al inglés.`);
