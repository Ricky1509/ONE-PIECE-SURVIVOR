# Cambios

## 1.2.0
- **Animación del Cofre:** el cofre cae, tiembla y brilla por la rendija. Al abrirse salen rayos de luz, partículas y el tesoro, con el color de la mejor rareza. En Épico y Legendario la luz empieza blanca y luego cambia de color, y el suspense dura más. Cada rareza tiene su sonido. Se puede adelantar tocando la pantalla, con una tecla o con el mando.
- **Equipo por partes del cuerpo:** 7 ranuras (Sombrero, Arma, Abrigo, Guantes, Botas, Amuleto y Reliquia). Cada tesoro va en su ranura y hay 12 tesoros nuevos, así que cada ranura tiene piezas Común, Rara, Épica y Legendaria. Los guardados antiguos colocan cada tesoro equipado en su ranura. El inventario se puede filtrar por ranura.
- **Móvil en horizontal:** la portada se reorganiza a lo ancho (menús a los lados, la isla junto a su información y el botón Zarpar visible sin desplazar), la pantalla final pone el cartel a la izquierda y los botones a la derecha, y los menús y cartas son más compactos.
- Modo admin oculto (7 toques en el título) y mejoras de UX y accesibilidad (foco, botones de 44 px, barra de vida, contraste).

## 1.1.0: Estudio completo (Claude Code Game Studios)

### Para jugadores
- **Arreglado:** las partidas ya no se congelan en el minuto 1:15 (emboscada), al llegar el primer jefe ni al pronunciar un juramento. El fallo llegó con la versión en inglés.
- **Arreglado:** un guardado dañado ya no impide abrir el juego. Se repara solo y se conserva todo lo válido.
- **Música nueva:** banda sonora generada en tiempo real, distinta en cada isla. Se intensifica con el paso de los minutos y cuando aparece un jefe, y se apaga en pausa.
- **Ajustes (⚙️):** volumen de música y de efectos; temblor de pantalla, destellos de pantalla y números de daño activables o no; idioma. Están en la portada y en la pausa.
- **Mando:** stick o cruceta para moverse, X/LB y Y/RB para los poderes, Start para pausar, y A/B para navegar por todos los menús.
- **Primera partida:** aviso con los controles según el dispositivo (teclado, táctil o mando).
- **Pulido:** los números de daño saltan al aparecer y los golpes fuertes se ven más grandes y dorados. Al subir de nivel hay un destello dorado.
- **Balance:**
  - El primer jefe llega en el minuto 3:30 (antes 3:00, coincidía con la llegada de los capitanes).
  - Los rangos de Orden cuestan más puntos (1.000 / 4.000 / 10.000 / 24.000). Antes se llegaba a Leyenda en una sola victoria.
  - Velo de Niebla: la recarga empieza cuando termina la invisibilidad (antes podía ser permanente).
  - La recarga de las armas tiene un mínimo de ×0,25.
  - Fruta Arena hace menos daño y sus charcos duran menos (era 3,7 veces más fuerte que la media).
  - Fruta Glacial hace más daño y atraviesa a un enemigo desde el nivel 3.
  - Los capitanes sueltan menos frutas (3 % en vez de 8 %).
  - La misión de mejoras cuenta las mejoras que tienes: comprar y devolver ya no la completa.
- **Escritorio (.exe):** soltar un archivo dentro de la ventana ya no lo abre en el juego.
- **Modo sin conexión:** si no hay red, se abre el juego guardado en caché, y ya no se borra la caché de otras webs de GitHub Pages.

### Para desarrollo
- Claude Code Game Studios instalado (`.claude/`) y documento de diseño en `design/game-brief.md`.
- Pruebas automáticas en GitHub Actions (`.github/workflows/pruebas.yml`):
  - sintaxis de los scripts;
  - comprobación de traducciones (`tests/i18n-check.js`);
  - prueba de humo en Chromium (`tests/smoke.js`), en ES y EN, con guardados corruptos y con mando simulado.
- El bucle del juego captura los errores: un fallo puntual ya no congela la partida.
- Informes de auditoría en `production/qa/`.

## 1.0.0
- Primera versión publicada: 9 islas, 8 piratas, 10 Órdenes, Astillero, Cofre, misiones, ES/EN, web, PWA y `.exe`.
