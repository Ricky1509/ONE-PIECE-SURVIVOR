// =====================================================================
//  CONFIGURACIÓN DEL JUEGO — edita este archivo para cambiar nombres,
//  estadísticas y sprites sin tocar el resto del código.
// =====================================================================
//
//  SPRITES
//  -------
//  Cada personaje o enemigo puede tener un bloque `sprite`:
//
//    sprite: {
//      src: 'sprites/coral.png', // ruta a la imagen (PNG con transparencia)
//      frames: 4,                // nº de fotogramas en una tira horizontal
//      fps: 8,                   // velocidad de la animación
//      alto: 70,                 // alto en pantalla (unidades del mundo)
//      anclaY: 0.55,             // 0 = arriba, 1 = abajo: punto de la imagen
//                                //   que coincide con el centro del personaje
//      mira: 'derecha',          // hacia dónde mira el dibujo original
//      pixelado: false,          // true para pixel art (sin suavizado)
//    }
//
//  La imagen debe ser una tira horizontal: todos los fotogramas del mismo
//  tamaño, uno al lado del otro. Si la imagen no existe o falla al cargar,
//  el juego usa el dibujo hecho con código (bloque `dibujo`).
//  Para quitar un sprite, borra el bloque `sprite` o pon `sprite: null`.
//
// =====================================================================

window.MDR_CONFIG = {
  titulo: 'Mar de Recompensas',
  duracionMinutos: 10,

  // ---------------------------------------------------------------
  //  PERSONAJES JUGABLES
  //  arma: sable | pistola | rayo | ancla | canon | fuego
  //  bonus: vida, recarga, area, velocidad (multiplicadores) y armadura (suma)
  // ---------------------------------------------------------------
  personajes: [
    {
      id: 'coral',
      nombre: 'Capitana Coral',
      descripcion: 'Espadachina temeraria. +20% de vida.',
      arma: 'sable',
      bonus: { vida: 1.2 },
      sprite: { src: 'sprites/coral.png', frames: 4, fps: 10, alto: 70, anclaY: 0.55 },
      dibujo: { color: '#d9483b', piel: '#f1c27d', sombrero: 'tricornio', colorSombrero: '#2b2118' },
    },
    {
      id: 'bram',
      nombre: 'Bram el Certero',
      descripcion: 'Tirador de élite. Recarga un 10% más rápido.',
      arma: 'pistola',
      bonus: { recarga: 0.9 },
      sprite: { src: 'sprites/bram.png', frames: 4, fps: 10, alto: 70, anclaY: 0.55 },
      dibujo: { color: '#3a7bd5', piel: '#c68642', sombrero: 'panuelo', colorSombrero: '#d63031' },
    },
    {
      id: 'lumi',
      nombre: 'Lumi Brújula',
      descripcion: 'Domina las tormentas. +15% de área.',
      arma: 'rayo',
      bonus: { area: 1.15 },
      sprite: { src: 'sprites/lumi.png', frames: 4, fps: 10, alto: 70, anclaY: 0.55 },
      dibujo: { color: '#f0a92e', piel: '#ffdbac', sombrero: 'boina', colorSombrero: '#6c5ce7' },
    },
    {
      id: 'barba',
      nombre: 'Barbagris',
      descripcion: 'Viejo lobo de mar. Lento, +40% vida y armadura.',
      arma: 'ancla',
      bonus: { vida: 1.4, velocidad: 0.9, armadura: 1 },
      sprite: { src: 'sprites/barba.png', frames: 4, fps: 10, alto: 70, anclaY: 0.55 },
      dibujo: { color: '#5d6d7e', piel: '#e0ac69', sombrero: 'capitan', colorSombrero: '#1e3799', barba: true },
    },
  ],

  // ---------------------------------------------------------------
  //  ENEMIGOS
  //  Los identificadores (soldado, cangrejo...) son fijos porque el
  //  juego los usa para decidir las oleadas; cambia nombre, stats y sprite.
  //  Los que tienen `jefe: true` aparecen en los minutos de `jefes`.
  // ---------------------------------------------------------------
  enemigos: {
    soldado:   { nombre: 'Soldado de la Armada', vida: 12,   velocidad: 72,  dano: 8,  radio: 12, xp: 1,   recompensa: 1000,
                 sprite: { src: 'sprites/soldado.png', frames: 4, fps: 8, alto: 48, anclaY: 0.55 } },
    cangrejo:  { nombre: 'Cangrejo Saltarín',    vida: 8,    velocidad: 118, dano: 6,  radio: 10, xp: 1,   recompensa: 800,
                 sprite: { src: 'sprites/cangrejo.png', frames: 4, fps: 10, alto: 40, anclaY: 0.55 } },
    tiburon:   { nombre: 'Hombre-tiburón',       vida: 48,   velocidad: 56,  dano: 14, radio: 18, xp: 3,   recompensa: 3000,
                 sprite: { src: 'sprites/tiburon.png', frames: 4, fps: 8, alto: 72, anclaY: 0.55 } },
    capitan:   { nombre: 'Capitán de la Armada', vida: 130,  velocidad: 62,  dano: 18, radio: 20, xp: 8,   recompensa: 10000,
                 sprite: { src: 'sprites/capitan.png', frames: 4, fps: 8, alto: 80, anclaY: 0.55 } },
    comodoro:  { nombre: 'Comodoro de Hierro',   vida: 1400, velocidad: 66,  dano: 25, radio: 38, xp: 60,  recompensa: 5e6, jefe: true,
                 sprite: { src: 'sprites/comodoro.png', frames: 4, fps: 6, alto: 152, anclaY: 0.55 } },
    kraken:    { nombre: 'Rey Kraken',           vida: 4200, velocidad: 58,  dano: 30, radio: 46, xp: 120, recompensa: 2e7, jefe: true,
                 sprite: { src: 'sprites/kraken.png', frames: 4, fps: 6, alto: 184, anclaY: 0.55 } },
    almirante: { nombre: 'Almirante Tormenta',   vida: 9000, velocidad: 72,  dano: 36, radio: 42, xp: 200, recompensa: 8e7, jefe: true,
                 sprite: { src: 'sprites/almirante.png', frames: 4, fps: 6, alto: 168, anclaY: 0.55 } },
  },

  // Orden y minuto de aparición de los jefes
  jefes: [
    { tipo: 'comodoro', minuto: 3 },
    { tipo: 'kraken', minuto: 6 },
    { tipo: 'almirante', minuto: 9 },
  ],

  // ---------------------------------------------------------------
  //  TEXTOS DE ARMAS Y OBJETOS (la lógica de cada arma está en juego.js)
  // ---------------------------------------------------------------
  armas: {
    sable:   { nombre: 'Sable', icono: '🗡️', niveles: ['Tajo frontal que empuja', '+30% daño', 'Tajo también hacia atrás', '+30% daño y área', 'Tajos dobles'] },
    pistola: { nombre: 'Pistola', icono: '🔫', niveles: ['Dispara al enemigo más cercano', '+1 bala', 'Las balas atraviesan 1 enemigo', '+1 bala, +20% daño', '+1 bala, atraviesan 2'] },
    rayo:    { nombre: 'Rayo de Tormenta', icono: '⚡', niveles: ['Fulmina enemigos al azar', '+1 rayo', '+40% daño', '+1 rayo, -15% recarga', '+2 rayos'] },
    ancla:   { nombre: 'Ancla Giratoria', icono: '⚓', niveles: ['Un ancla gira a tu alrededor', '+1 ancla', '+30% daño y radio', '+1 ancla', '+1 ancla y gira más rápido'] },
    canon:   { nombre: 'Cañonazo', icono: '💣', niveles: ['Bala de cañón explosiva', '+1 bala', '+40% área de explosión', '+1 bala, +30% daño', '+2 balas'] },
    fuego:   { nombre: 'Fruta Ígnea', icono: '🔥', niveles: ['Aura de fuego que quema', '+25% radio', '+40% daño', '+25% radio', 'Quema el doble de rápido'] },
  },
  pasivos: {
    ron:      { nombre: 'Barril de Ron', icono: '🍺', descripcion: '+20% vida máxima', max: 5 },
    botas:    { nombre: 'Botas de Cubierta', icono: '👢', descripcion: '+10% velocidad', max: 5 },
    brujula:  { nombre: 'Brújula Imantada', icono: '🧭', descripcion: '+30% radio de recogida', max: 5 },
    polvora:  { nombre: 'Pólvora Negra', icono: '🧨', descripcion: '+10% daño', max: 5 },
    reloj:    { nombre: 'Reloj de Arena', icono: '⏳', descripcion: '-8% tiempo de recarga', max: 5 },
    catalejo: { nombre: 'Catalejo', icono: '🔭', descripcion: '+10% área de ataque', max: 5 },
    loro:     { nombre: 'Loro Pirata', icono: '🦜', descripcion: '+1 proyectil a todas las armas', max: 2 },
    coraza:   { nombre: 'Coraza de Concha', icono: '🐚', descripcion: '+1 armadura, +0.3 vida/s', max: 5 },
  },
};
