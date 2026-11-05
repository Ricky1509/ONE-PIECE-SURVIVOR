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

- **4 piratas:** Capitana Coral (sable), Bram el Certero (pistola), Lumi Brújula (rayos), Barbagris (ancla giratoria)
- **6 armas** (nivel 1–5): Sable, Pistola, Rayo de Tormenta, Ancla Giratoria, Cañonazo, Fruta Ígnea
- **8 objetos pasivos:** ron, botas, brújula, pólvora, reloj de arena, catalejo, loro, coraza
- **Enemigos:** soldados de la Armada, cangrejos, hombres-tiburón, capitanes y emboscadas cada 75 s
- **Jefes:** Comodoro de Hierro (3:00), Rey Kraken (6:00), Almirante Tormenta (9:00)
- **Recompensa:** sube con cada derrota; al final se muestra un cartel de "SE BUSCA" y se guarda el récord en el navegador

## Estructura del proyecto

```
index.html            página, estilos e interfaz
js/config.js          ⚙️ personajes, enemigos, jefes, armas y sprites (editable)
js/dibujo.js          dibujos hechos con código (se usan si falta un sprite)
js/juego.js           lógica del juego
sprites/              imágenes PNG de personajes y enemigos
tools/generar-sprites.js  genera los sprites de ejemplo desde js/dibujo.js
```

## Cambiar personajes y sprites

Todo se hace en `js/config.js`, sin tocar el código del juego.

1. Copia tu imagen en `sprites/` (por ejemplo `sprites/mi-pirata.png`).
2. En `js/config.js`, en el personaje o enemigo, apunta el bloque `sprite` a esa imagen:

```js
sprite: { src: 'sprites/mi-pirata.png', frames: 4, fps: 10, alto: 70, anclaY: 0.55 },
```

| Campo      | Qué es |
|------------|--------|
| `src`      | Ruta de la imagen (PNG con fondo transparente) |
| `frames`   | Número de fotogramas en la tira horizontal (1 si es una imagen fija) |
| `fps`      | Velocidad de la animación |
| `alto`     | Altura en pantalla. Referencia: piratas 70, soldado 48, jefes 150–185 |
| `anclaY`   | Altura (0–1) del centro del personaje dentro de la imagen; los "pies" quedan cerca de 0.8 |
| `mira`     | `'derecha'` o `'izquierda'`: hacia dónde mira el dibujo original. El juego lo voltea solo |
| `pixelado` | `true` para pixel art (sin suavizado) |

**Formato de la imagen:** una tira horizontal con todos los fotogramas del mismo tamaño, uno al lado del otro. Un pirata de 4 fotogramas de 64×64 px sería una imagen de 256×64 px. Los sprites de `sprites/` siguen ese formato y sirven de plantilla.

Si una imagen no existe o no carga, el juego usa el dibujo hecho con código y avisa en la consola del navegador. Para volver al dibujo, pon `sprite: null`.

También puedes cambiar `nombre`, `descripcion`, `arma`, `bonus` y estadísticas de enemigos (`vida`, `velocidad`, `dano`...), los nombres e iconos de armas y objetos, y en qué minuto salen los jefes.

### Volver a generar los sprites de ejemplo

```bash
npm i -D playwright
npx playwright install chromium
node tools/generar-sprites.js
```

## Probar en local

Abre `index.html` con doble clic, o sirve la carpeta con `npx serve .`.
