# Mar de Recompensas

Juego de supervivencia por oleadas (estilo *survivors*) con temática pirata, hecho en HTML5 Canvas y JavaScript, sin dependencias.

## Cómo jugar

Abre `index.html` en el navegador (doble clic), o sirve la carpeta:

```bash
npx serve .
```

- **Mover:** WASD / flechas, o arrastra el dedo en pantalla táctil
- **Atacar:** automático
- **Pausa:** P / Esc o el botón ⏸
- **Objetivo:** aguanta 10 minutos

## Contenido

- **6 islas** con temática propia (playa, jungla, desierto, nieve, volcán y cementerio de barcos): suelo, decoración, clima y tono de color distintos, más dificultad y más Berries en cada una. Se desbloquean aguantando 5 minutos en la anterior y se eligen en el centro del menú principal
- **8 piratas:** Capitana Coral (sable), Bram el Certero (pistola), Lumi Brújula (rayos), Barbagris (ancla), Bruno el Artillero (cañón), Nieves la Cartógrafa (hielo), Marea la Arponera (arpón) y Kai el Tamborilero (tambor). Los 6 últimos se desbloquean con Berries
- **10 armas** (nivel 1–5): Sable, Pistola, Rayo de Tormenta, Ancla Giratoria, Cañonazo, Fruta Ígnea, Fruta Glacial, Arpón, Tambor de Guerra y Fruta Vendaval
- **Mejoras con rareza** al subir de nivel (Común, Raro, Épico, Legendario): experiencia, daño, vida, velocidad, recarga, área, recogida, armadura, regeneración y Berries; se acumulan durante la partida
- **Frutas de poder** que caen de los enemigos (más a menudo de los capitanes): Dorada (doble experiencia), Furia (+50% daño), Brisa (+40% velocidad) y Coral (+5 armadura), con efecto temporal
- **8 objetos pasivos:** ron, botas, brújula, pólvora, reloj de arena, catalejo, loro, coraza
- **Enemigos:** soldados de la Armada, cangrejos, hombres-tiburón, capitanes y emboscadas cada 75 s
- **Jefes:** Comodoro de Hierro (3:00), Rey Kraken (6:00), Almirante Tormenta (9:00)
- **Recompensa:** sube con cada derrota; al final se muestra un cartel de "SE BUSCA" y se guarda el récord en el navegador
- **Astillero (progreso permanente):** cada partida da Berries para comprar mejoras permanentes (vida, daño, recarga, velocidad, área, imán, armadura, regeneración, experiencia, más Berries y un bote salvavidas para revivir) y desbloquear piratas. Las mejoras se pueden reembolsar
- **Cofre del Tesoro (gacha con Berries, sin dinero real) e Inventario:** 17 tesoros con rareza; los repetidos suben de nivel (hasta 5) y se equipan hasta 3 para tener bonus en todas las partidas. Legendario garantizado como máximo cada 50 tiradas
- **Misiones:** 22 objetivos (derrotas, tiempo, jefes, nivel, frutas, piratas, mejoras, tesoros...) que dan Berries al cobrarlas
- **Registro:** estadísticas, bestiario de enemigos descubiertos y guía de frutas
- **App instalable (PWA):** desde el móvil, "Añadir a pantalla de inicio"; funciona sin conexión

## Estructura del proyecto

```
index.html            página, estilos e interfaz
manifest.webmanifest  datos de la app instalable (nombre, icono, colores)
sw.js                 caché para jugar sin conexión (sube VERSION al publicar cambios)
icons/                iconos de la app
js/config.js          ⚙️ personajes, enemigos, jefes, armas y sprites (editable)
js/dibujo.js          dibujos hechos con código (se usan si falta un sprite)
js/islas.js           suelo, decoración, vista previa, clima y tono de cada isla
js/juego.js           lógica del juego
sprites/              imágenes PNG de personajes y enemigos
tools/generar-sprites.js  genera los sprites de ejemplo desde js/dibujo.js
```

## Cambiar personajes y sprites

Todo se hace en `js/config.js`, sin tocar el código del juego.

1. Copia tu imagen en `sprites/` (por ejemplo `sprites/mi-pirata.png`).
2. En `js/config.js`, en el personaje o enemigo, apunta el bloque `sprite` a esa imagen:

```js
sprite: { src: 'sprites/mi-pirata.png', frames: 4, fps: 10, alto: 77, anclaY: 0.62 },
```

| Campo      | Qué es |
|------------|--------|
| `src`      | Ruta de la imagen (PNG con fondo transparente) |
| `frames`   | Número de fotogramas en la tira horizontal (1 si es una imagen fija) |
| `fps`      | Velocidad de la animación |
| `alto`     | Altura en pantalla. Referencia: piratas 77, soldado 48, jefes 150–185 |
| `anclaY`   | Altura (0–1) del centro del personaje dentro de la imagen; los "pies" quedan cerca de 0.8 |
| `mira`     | `'derecha'` o `'izquierda'`: hacia dónde mira el dibujo original. El juego lo voltea solo |
| `pixelado` | `true` para pixel art (sin suavizado) |

**Formato de la imagen:** una tira horizontal con todos los fotogramas del mismo tamaño, uno al lado del otro. Un pirata de 4 fotogramas de 64×64 px sería una imagen de 256×64 px. Los sprites de `sprites/` siguen ese formato y sirven de plantilla.

Si una imagen no existe o no carga, el juego usa el dibujo hecho con código y avisa en la consola del navegador. Para volver al dibujo, pon `sprite: null`.

También puedes cambiar `nombre`, `descripcion`, `arma`, `precio` (Berries para desbloquear), `bonus` y estadísticas de enemigos (`vida`, `velocidad`, `dano`...), los nombres e iconos de armas y objetos, y en qué minuto salen los jefes.

### Volver a generar los sprites de ejemplo

```bash
npm i -D playwright
npx playwright install chromium
node tools/generar-sprites.js
```

## Probar en local

Abre `index.html` con doble clic, o sirve la carpeta con `npx serve .`.

## Progreso entre partidas

Todo se configura en `js/config.js`: `misiones`, `frutas`, `mejorasPartida` (+ `rarezasPartida`), `cofre` y `tesoros`.

En `js/config.js`, el bloque `progreso` define cuántos Berries se ganan (por derribo, por segundo, por jefe y por victoria) y `mejoras` define cada mejora del Astillero: `valor` por nivel, `max` niveles y `precio` inicial (cada nivel cuesta `crecimientoPrecio` veces más).

El progreso se guarda en el navegador (`localStorage`). Si se juega desde otro navegador o dispositivo, empieza de cero.

## Publicar en internet (GitHub Pages)

1. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Cada vez que se actualiza `main`, el flujo `.github/workflows/pages.yml` publica el juego en
   `https://<usuario>.github.io/<repositorio>/`.

## Publicar en tiendas (iOS, Android, PC)

Ver [docs/TIENDAS.md](docs/TIENDAS.md).

## Versión para PC (Windows)

Descarga directa: **[MarDeRecompensas.exe](https://github.com/Ricky1509/ONE-PIECE-SURVIVOR/releases/download/escritorio/MarDeRecompensas.exe)**. No necesita instalación: se descarga y se abre.

- Windows puede mostrar el aviso "Windows protegió tu PC" porque el programa no está firmado: pulsa *Más información → Ejecutar de todas formas*.
- **F11** activa la pantalla completa. El progreso se guarda en el propio PC.
- Se compila automáticamente en GitHub Actions (`.github/workflows/escritorio.yml`) cada vez que cambia el juego en `main`, y se publica en la página de descargas (*Releases → escritorio*).

Para compilarlo a mano (necesita Node.js):

```bash
cd desktop
npm install
npm start      # probar en una ventana
npm run dist   # crear dist/MarDeRecompensas.exe (en Windows)
```
