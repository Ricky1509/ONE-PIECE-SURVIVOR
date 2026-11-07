// Service worker: guarda el juego en caché para jugar sin conexión.
// Sube VERSION cada vez que publiques cambios para que los móviles se actualicen.
const VERSION = 'mdr-v14';
const ARCHIVOS = [
  './', 'index.html', 'manifest.webmanifest',
  'js/config.js', 'js/i18n-en.js', 'js/i18n.js', 'js/dibujo.js', 'js/islas.js', 'js/juego.js',
  'icons/icon-192.png', 'icons/icon-512.png',
  'sprites/coral.png', 'sprites/bram.png', 'sprites/lumi.png', 'sprites/barba.png',
  'sprites/soldado.png', 'sprites/cangrejo.png', 'sprites/tiburon.png', 'sprites/capitan.png',
  'sprites/comodoro.png', 'sprites/kraken.png', 'sprites/almirante.png',
  'sprites/bruno.png', 'sprites/nieves.png', 'sprites/marea.png', 'sprites/kai.png',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(ARCHIVOS.map(f => c.add(new Request(f, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mdr-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Red primero (para recibir actualizaciones), caché si no hay conexión
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })
      .then(r => r || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
