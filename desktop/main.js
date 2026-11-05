// Versión de escritorio (Windows) de Faro de Tormentas con Electron.
// Carga el juego desde app/ (copiado por preparar.js) en una ventana sin menús.
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

function crearVentana() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 560,
    backgroundColor: '#0b2a47',
    title: 'Faro de Tormentas',
    icon: path.join(__dirname, 'app', 'icons', 'icon-512.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  // F11: pantalla completa
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  // Los enlaces externos se abren en el navegador, nunca dentro del juego
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  // Prueba automática (CI): MDR_SMOKE=1 abre el juego, comprueba que carga y cierra
  if (process.env.MDR_SMOKE) {
    const errs = [];
    win.webContents.on('console-message', (e, ...a) => {
      const level = e.level ?? a[0], msg = e.message ?? a[1];
      if ((level === 3 || level === 'error') && !/ERR_|fonts\.g/.test(String(msg))) errs.push(String(msg));
    });
    win.webContents.on('render-process-gone', () => errs.push('render-process-gone'));
    win.webContents.once('did-finish-load', () => setTimeout(async () => {
      let ok = false;
      try { ok = await win.webContents.executeJavaScript('!!(window.MDR_CONFIG && window.MDR_ISLAS && window.__mdr && document.querySelector("#islaNombre").textContent)'); } catch (err) { errs.push(String(err)); }
      console.log('SMOKE carga=' + ok + ' errores=' + JSON.stringify(errs));
      app.exit(ok && !errs.length ? 0 : 1);
    }, 4000));
  }
  // Solo se permite la página del juego (soltar un archivo HTML en la ventana no lo carga)
  const INICIO = pathToFileURL(path.join(__dirname, 'app', 'index.html')).href;
  win.webContents.on('will-navigate', (e, url) => { if (url.split('#')[0] !== INICIO) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
}

app.whenReady().then(crearVentana);
app.on('window-all-closed', () => app.quit());
