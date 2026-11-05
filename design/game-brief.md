# Game Brief: Faro de Tormentas (Storm Beacon)

> Generado a partir del juego ya construido (`/reverse-document`). Es el documento de diseño
> del proyecto en el nivel `minimal`: los números concretos viven en `js/config.js`.

**One-sentence pitch:** Un pirata sobrevive 10 minutos a oleadas cada vez mayores en islas de tormenta. Sus armas disparan solas y el jugador elige mejoras, frutas y los poderes de su Orden del Faro hasta volverse una leyenda.

## Core loop
- Moverse esquivando y recoger experiencia de los enemigos derribados. Las armas atacan solas.
- Subir de nivel y elegir 1 de 3 cartas: armas, objetos, mejoras con rareza o mejoras de la Orden.
- Ganar Doblones de Faro al acabar, ganes o pierdas, y gastarlos en el Astillero, el Cofre, nuevos piratas y Órdenes.
- Volver a zarpar más fuerte, hacia islas nuevas que se desbloquean al aguantar 5 minutos en la anterior.

## Player goal & fail state — what "working" looks like
- Gana quien sobrevive 10:00 en la isla. Pierde quien llega a 0 de vida, salvo que le quede un "revivir".
- Una partida se siente completa cuando el jugador ve crecer su build y se enfrenta a un jefe. Al final debe recibir doblones y avanzar en alguna misión.

## MVP — what must exist to be the game
- Movimiento con teclado, táctil y mando; armas automáticas y oleadas que escalan con el tiempo y la isla.
- Experiencia, subidas de nivel con 3 opciones y jefes en minutos fijos.
- 9 islas temáticas con desbloqueo progresivo, y 8 piratas con armas iniciales distintas.
- Progresión permanente: Astillero, Cofre con rarezas e inventario de 3 ranuras, misiones y registro.
- 10 Órdenes del Faro con 2 poderes (Q/E), rangos y juramentos.
- Guardado local, idioma ES/EN, PWA, `.exe` de Windows y zip para itch.io.

## Out of scope — not building this
- Multijugador, cuentas en línea, tablas de clasificación en servidor.
- Compras con dinero real: el cofre se paga solo con moneda del juego.
- Personajes, nombres o escenarios con licencia de terceros. Todo el contenido es original.

## Build order
1. Bucle de combate y oleadas: hecho.
2. Progresión de partida (niveles, cartas, jefes): hecho.
3. Meta-progresión (Astillero, Cofre, misiones, islas): hecho.
4. Órdenes, poderes y tormentas: hecho.
5. Pulido: música adaptativa, ajustes de accesibilidad, mando y pruebas automáticas (esta versión).
6. Siguiente: equilibrio fino con datos de partidas reales (`/balance-check`, `/playtest-report`).

---
**Who it's for / what they feel:** Jugadores casuales de móvil y PC que quieren partidas de 10 minutos con sensación de poder creciente y "una más".

**Art & audio direction:** Dibujo vectorial chibi con contorno, islas pintadas por procedimiento; sonido y música sintetizados con Web Audio, distintos para cada isla.

**Reference game:** Un survivors-like de género (auto-ataque, oleadas, cartas al subir de nivel). Este proyecto añade islas temáticas, Órdenes con poderes activos y tormentas.
