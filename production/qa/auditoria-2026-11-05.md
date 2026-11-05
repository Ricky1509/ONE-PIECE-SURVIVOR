# Auditoría del estudio (2026-11-05)

Agentes que participaron: `lead-programmer` + `security-engineer` (`/code-review`, `/security-audit`, `/bug-report`), `economy-designer` + `systems-designer` (`/balance-check`) y `performance-analyst` (`/perf-profile`). La revisión de `ux-designer` + `accessibility-specialist` no terminó porque se agotó el límite de uso. Las comprobaciones de UX que sí se hicieron están al final.

## Errores

| # | Gravedad | Problema | Estado |
|---|---|---|---|
| 1 | Crítica | `t()` (traducción) tapado por una variable local `t` en `updateSpawns` y `drawOath`: la partida se congelaba en la emboscada del 1:15, al llegar un jefe y en el primer juramento | Corregido. Hay prueba de regresión en `tests/smoke.js` |
| 2 | Alta | Un guardado `mdr_save` corrupto o editado impedía cargar el juego. Un inventario con nivel 1e300 colgaba la pestaña | Corregido: `sanitizeSave()` valida tipos, rangos e ids |
| 3 | Media | Comprar y devolver mejoras completaba misiones gratis | Corregido: la misión cuenta los niveles que tienes |
| 4 | Baja | La réplica de Terremoto se perdía a veces (≈4 %) por un temporizador que se descontaba dos veces | Corregido |
| 5 | Baja | El service worker borraba las cachés de otras webs del mismo dominio y no tenía página de respaldo sin conexión | Corregido (`mdr-v9`) |
| 6 | Baja | En Electron, soltar un HTML en la ventana lo cargaba con el origen del juego | Corregido: solo se permite `index.html` |
| — | Robustez | Una excepción en el bucle paraba `requestAnimationFrame` para siempre | El bucle ahora captura los errores y los escribe en la consola |

## Balance (modelo analítico, sin datos de partidas reales)

- **Muro en el minuto 3:00:** llegaban a la vez los capitanes y el primer jefe. El jefe pasa al 3:30.
- **Rangos de Orden:** se llegaba a Leyenda en una sola victoria. Ahora los rangos piden `[0, 1000, 4000, 10000, 24000]` puntos.
- **Velo de Niebla:** daba hasta un 100 % de tiempo invisible. Ahora la recarga empieza al acabar el efecto (41–59 % de uso).
- **Recarga apilable:** bajaba hasta ×0,1. Ahora tiene un mínimo de ×0,25.
- **Fruta Arena:** su DPS contra grupos era 3,7 veces la mediana. Ahora el daño base es 3,5 y los charcos duran 6 s a nivel 5, unas 1,6 veces la mediana.
- **Fruta Glacial:** se quedaba en 0,21 veces la mediana. Ahora hace 11 de daño y perfora desde el nivel 3.
- **Frutas por victoria:** ~61; ahora ~33 (`probabilidadFrutaCapitan` pasa de 0,08 a 0,03).
- **Vigilar con datos reales:** la mejora del arma inicial sale poco al principio, la partida se vuelve más fácil después del minuto 7, la armadura alta en la isla 1 y el apilado de "Bolsillos Hondos".

## Rendimiento
- 390 enemigos en pantalla: fotograma medio de 16,6 ms y p95 de 16,8 ms, dentro del presupuesto de 60 FPS (Chromium sin ventana, 1280×720).

## UX y accesibilidad (añadido en esta versión)
- **Ajustes:**
  - volumen de música y de efectos;
  - temblor de pantalla;
  - destellos de pantalla: sin ellos, el daño se marca con un borde rojo en vez de llenar la pantalla, y el rayo de la tormenta brilla un 80 % menos;
  - números de daño.
- **Navegación sin ratón:**
  - con mando, por todos los menús (navegación espacial, A/B);
  - con teclado: Esc vuelve atrás y el foco es visible.
- **Aviso de controles:** en las dos primeras partidas, según el dispositivo.

## Evidencias
- `node tests/smoke.js` con `EVIDENCE=1` guarda capturas en `production/qa/evidence/`. En CI se suben como el artefacto `capturas-prueba-humo`.
