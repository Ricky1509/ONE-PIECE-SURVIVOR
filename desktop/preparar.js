// Copia los archivos del juego a desktop/app y el icono a desktop/build.
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const app = path.join(__dirname, 'app');
fs.rmSync(app, { recursive: true, force: true });
fs.mkdirSync(app, { recursive: true });
for (const f of ['index.html', 'manifest.webmanifest', 'js', 'sprites', 'icons']) {
  fs.cpSync(path.join(raiz, f), path.join(app, f), { recursive: true });
}
fs.mkdirSync(path.join(__dirname, 'build'), { recursive: true });
fs.copyFileSync(path.join(raiz, 'icons', 'icon-512.png'), path.join(__dirname, 'build', 'icon.png'));
console.log('Juego copiado en desktop/app');
