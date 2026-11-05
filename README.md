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

## Estructura del código

Todo está en `index.html`:

- `CHARS`, `WEAPONS`, `PASSIVES`, `ETYPES`: datos de personajes, armas, objetos y enemigos
- `updateWeapons`, `updateEnemies`, `updateSpawns`: lógica de juego
- `drawPirate`, `drawEnemy`, `drawGround`: dibujo procedural (sin imágenes)
