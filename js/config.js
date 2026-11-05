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
  //  ISLAS (mapas). tema: playa | jungla | desierto | nieve | volcan | fantasma | tormenta | cristal | gruta
  //  dificultad: multiplica la vida de los enemigos (y la mitad del exceso al daño)
  //  berries: multiplica los Berries ganados
  //  desbloqueo: { isla, minutos } → aguantar esos minutos en esa isla
  //  tormenta: true → cada cierto tiempo estalla la Gran Tormenta (viento, lluvia, rayos;
  //            la Resonancia de las órdenes se recarga el triple)
  // ---------------------------------------------------------------
  islas: [
    { id: 'calavera',   nombre: 'Isla Calavera',        tema: 'playa',    dificultad: 1.0, berries: 1.0,
      descripcion: 'La playa tropical donde naufragó tu tripulación. Cangrejos y soldados de la Armada patrullan la orilla.' },
    { id: 'esmeralda',  nombre: 'Jungla Esmeralda',     tema: 'jungla',   dificultad: 1.3, berries: 1.25, desbloqueo: { isla: 'calavera', minutos: 5 },
      descripcion: 'Una selva espesa donde la Armada busca un tesoro perdido entre árboles gigantes.' },
    { id: 'dunas',      nombre: 'Isla de las Dunas',    tema: 'desierto', dificultad: 1.6, berries: 1.5,  desbloqueo: { isla: 'esmeralda', minutos: 5 },
      descripcion: 'Un mar de arena bajo un sol que no perdona. Dicen que una pirámide esconde un oasis.' },
    { id: 'escarcha',   nombre: 'Isla Escarcha',        tema: 'nieve',    dificultad: 2.0, berries: 1.8,  desbloqueo: { isla: 'dunas', minutos: 5 },
      descripcion: 'Montañas heladas y ventiscas eternas. Solo los más duros sobreviven al frío.' },
    { id: 'ceniza',     nombre: 'Volcán Ceniza',        tema: 'volcan',   dificultad: 2.5, berries: 2.2,  desbloqueo: { isla: 'escarcha', minutos: 5 },
      descripcion: 'La tierra arde bajo tus botas. Ríos de lava y lluvia de brasas.' },
    { id: 'naufragios', nombre: 'Mar de los Naufragios', tema: 'fantasma', dificultad: 3.0, berries: 2.7,  desbloqueo: { isla: 'ceniza', minutos: 5 },
      descripcion: 'Un cementerio de barcos envuelto en niebla, iluminado por faroles que nadie enciende.' },
    { id: 'ojo',        nombre: 'Isla del Ojo de la Tormenta', tema: 'tormenta', dificultad: 3.4, berries: 3.0, desbloqueo: { isla: 'naufragios', minutos: 5 }, tormenta: true,
      descripcion: 'Una isla donde nunca deja de llover. Cada poco estalla la Gran Tormenta: viento, rayos… y Resonancia para quien sepa aprovecharla.' },
    { id: 'cristal',    nombre: 'Cumbres de Cristal',    tema: 'cristal',  dificultad: 3.8, berries: 3.4,  desbloqueo: { isla: 'ojo', minutos: 5 }, tormenta: true,
      descripcion: 'Montañas cubiertas de cristales que brillan con cada relámpago de la Gran Tormenta.' },
    { id: 'ecos',       nombre: 'Gruta de los Ecos',     tema: 'gruta',    dificultad: 4.2, berries: 3.8,  desbloqueo: { isla: 'cristal', minutos: 5 },
      descripcion: 'Una caverna bajo el mar iluminada por hongos y lagunas que brillan en la oscuridad.' },
  ],

  // ---------------------------------------------------------------
  //  ÓRDENES DEL FARO
  //  La orden activa se elige en el menú "Órdenes" y da 2 poderes (Q / E)
  //  que gastan Resonancia. Jugar con una orden suma puntos; al llegar a
  //  `puntosRango` se pronuncia un juramento y se sube de rango
  //  (poderes +25% y recarga -8% por rango; aura en rango 3 y alas de luz en 5).
  //  Puntos por partida: derribos + 100 por jefe + 0,5 por segundo.
  //  Al subir de nivel aparecen mejoras de la orden (mejorasOrden) y una
  //  mejora especial distinta en cada orden (campo `especial`).
  // ---------------------------------------------------------------
  ordenesSistema: {
    nombre: 'Órdenes del Faro',
    energia: 'Resonancia',
    energiaMax: 100,
    regenEnergia: 1.5,          // por segundo
    probConcha: 0.05,           // probabilidad de que un enemigo suelte una concha resonante (+20)
    rangos: ['Grumete', 'Marinero', 'Oficial', 'Capitán', 'Leyenda'],
    puntosRango: [0, 300, 1000, 2500, 6000],
    juramentos: [
      'Navegaré junto a mi tripulación, pase lo que pase.',
      'No dejaré a nadie atrás en la tormenta.',
      'Daré la cara aunque el mar entero se alce contra mí.',
      'Seré la luz que guía a los perdidos hasta puerto.',
      'Aunque todos los faros se apaguen, yo seguiré brillando.',
    ],
  },
  mejorasOrden: {
    pot:  { nombre: 'Juramento Ardiente', icono: '🔆', descripcion: '+25% de poder en los poderes de tu orden', max: 5 },
    rec:  { nombre: 'Disciplina',         icono: '⏱️', descripcion: '-12% de recarga en los poderes',           max: 4 },
    cos:  { nombre: 'Sintonía',           icono: '🎐', descripcion: 'Los poderes cuestan un 15% menos',          max: 3 },
    res:  { nombre: 'Gran Resonancia',    icono: '💠', descripcion: '+20 de Resonancia máxima y +0,5 por segundo', max: 3 },
    comp: { nombre: 'Vínculo',            icono: '🤝', descripcion: 'Tu compañero hace +50% de daño y dispara más rápido', max: 3 },
  },
  ordenes: [
    { id: 'vendaval', nombre: 'Guardianes del Vendaval', color: '#7fd3ff', precio: 0,
      lema: 'El viento no se detiene, y nosotros tampoco.', companero: { nombre: 'Gaviota de aire', forma: 'gaviota' },
      especial: { nombre: 'Doble Ráfaga', descripcion: 'La Ráfaga sale también hacia atrás y el Salto deja un remolino que golpea' },
      poderes: [
        { id: 'rafaga', nombre: 'Ráfaga', icono: '🌬️', descripcion: 'Golpe de viento en cono que lanza lejos a los enemigos', coste: 30, recarga: 6 },
        { id: 'salto', nombre: 'Salto del Céfiro', icono: '💨', descripcion: 'Impulso rápido hacia delante; eres intocable durante el salto', coste: 20, recarga: 4 } ] },
    { id: 'marea', nombre: 'Hijos de la Marea', color: '#3a8ee6', precio: 0,
      lema: 'Toda ola vuelve a la orilla.', companero: { nombre: 'Pececillo de espuma', forma: 'pez' },
      especial: { nombre: 'Mareas Gemelas', descripcion: 'La Gran Ola lanza tres olas en abanico' },
      poderes: [
        { id: 'ola', nombre: 'Gran Ola', icono: '🌊', descripcion: 'Una ola avanza arrastrando y golpeando a todo lo que toca', coste: 35, recarga: 7 },
        { id: 'escudo', nombre: 'Escudo de Agua', icono: '🫧', descripcion: 'Burbuja que absorbe daño durante 8 segundos', coste: 30, recarga: 12 } ] },
    { id: 'coral', nombre: 'Custodios del Coral', color: '#ff7f9f', precio: 0,
      lema: 'Lo que crece despacio, resiste para siempre.', companero: { nombre: 'Medusa luminosa', forma: 'medusa' },
      especial: { nombre: 'Arrecife Sanador', descripcion: 'Dentro del Arrecife Vivo te curas un 3% de vida por segundo' },
      poderes: [
        { id: 'arrecife', nombre: 'Arrecife Vivo', icono: '🪸', descripcion: 'Un círculo de coral que daña y frena a los enemigos 5 segundos', coste: 35, recarga: 9 },
        { id: 'bendicion', nombre: 'Bendición del Arrecife', icono: '💗', descripcion: 'Recuperas un 35% de vida poco a poco', coste: 40, recarga: 15 } ] },
    { id: 'bruma', nombre: 'Sombras de la Bruma', color: '#b8c4d0', precio: 800,
      lema: 'Quien no puede verte, no puede vencerte.', companero: { nombre: 'Zorro de niebla', forma: 'zorro' },
      especial: { nombre: 'Niebla Persistente', descripcion: 'Ecos de Bruma duran el doble y el Velo 2 segundos más' },
      poderes: [
        { id: 'velo', nombre: 'Velo de Niebla', icono: '🌫️', descripcion: 'Te vuelves invisible: los enemigos se pierden y no te dañan', coste: 40, recarga: 14 },
        { id: 'clones', nombre: 'Ecos de Bruma', icono: '👥', descripcion: 'Tres copias de niebla atraen a los enemigos y luego estallan', coste: 30, recarga: 10 } ] },
    { id: 'ascuas', nombre: 'Forjadores de Ascuas', color: '#ff6b2c', precio: 1200,
      lema: 'Del fuego sale el acero.', companero: { nombre: 'Salamandra de brasa', forma: 'salamandra' },
      especial: { nombre: 'Fuego Eterno', descripcion: 'Las quemaduras duran y hacen el doble' },
      poderes: [
        { id: 'llamarada', nombre: 'Llamarada', icono: '🔥', descripcion: 'Cono de fuego que deja ardiendo a los enemigos', coste: 35, recarga: 7 },
        { id: 'brasas', nombre: 'Armadura de Brasas', icono: '🛡️', descripcion: '+3 armadura y quemas a quien se acerque durante 6 segundos', coste: 30, recarga: 12 } ] },
    { id: 'abismo', nombre: 'Videntes del Abismo', color: '#8e7cf0', precio: 1600,
      lema: 'En lo más hondo, el tiempo se detiene.', companero: { nombre: 'Pulpito de tinta estelar', forma: 'pulpo' },
      especial: { nombre: 'Abismo Insondable', descripcion: 'La Marca alcanza a 10 enemigos y la Calma también hace daño' },
      poderes: [
        { id: 'calma', nombre: 'Calma Profunda', icono: '⏳', descripcion: 'El tiempo se ralentiza a tu alrededor durante 4 segundos', coste: 40, recarga: 13 },
        { id: 'marca', nombre: 'Marca del Abismo', icono: '👁️', descripcion: 'Marca a los 5 enemigos más fuertes: reciben +60% de daño', coste: 25, recarga: 9 } ] },
    { id: 'trueno', nombre: 'Heraldos del Trueno', color: '#f9ca24', precio: 2000,
      lema: 'Primero el relámpago, después el silencio.', companero: { nombre: 'Anguila de chispas', forma: 'anguila' },
      especial: { nombre: 'Tormenta Perfecta', descripcion: 'Tormenta lanza el doble de rayos' },
      poderes: [
        { id: 'tormenta', nombre: 'Tormenta', icono: '⛈️', descripcion: 'Una lluvia de rayos cae sobre los enemigos cercanos', coste: 40, recarga: 9 },
        { id: 'carga', nombre: 'Carga Eléctrica', icono: '⚡', descripcion: '+40% velocidad y descargas automáticas durante 5 segundos', coste: 30, recarga: 11 } ] },
    { id: 'ancla', nombre: 'Guardianes del Ancla', color: '#b08968', precio: 2500,
      lema: 'Firmes como la roca, pesados como el ancla.', companero: { nombre: 'Cangrejo de piedra', forma: 'cangrejo' },
      especial: { nombre: 'Réplica', descripcion: 'El Terremoto se repite una segunda vez' },
      poderes: [
        { id: 'terremoto', nombre: 'Terremoto', icono: '🪨', descripcion: 'Golpe en el suelo que aturde a los enemigos cercanos', coste: 35, recarga: 9 },
        { id: 'roca', nombre: 'Piel de Roca', icono: '🗿', descripcion: '+6 armadura durante 6 segundos y empuja a quien esté cerca', coste: 30, recarga: 12 } ] },
    { id: 'escarcha', nombre: 'Centinelas de la Escarcha', color: '#a8e6ff', precio: 3000,
      lema: 'El hielo guarda lo que el mar olvida.', companero: { nombre: 'Pingüino de escarcha', forma: 'pinguino' },
      especial: { nombre: 'Corazón Helado', descripcion: 'Ventisca un 50% más grande y 4 Lanzas de Hielo más' },
      poderes: [
        { id: 'ventisca', nombre: 'Ventisca', icono: '❄️', descripcion: 'Congela a los enemigos cercanos durante 2 segundos', coste: 40, recarga: 12 },
        { id: 'lanzas', nombre: 'Lanzas de Hielo', icono: '🧊', descripcion: 'Lanzas que atraviesan a todos los enemigos en línea', coste: 30, recarga: 6 } ] },
    { id: 'estrella', nombre: 'Navegantes de las Estrellas', color: '#ffe08a', precio: 4000,
      lema: 'Las estrellas siempre señalan el camino.', companero: { nombre: 'Búho estelar', forma: 'buho' },
      especial: { nombre: 'Constelación', descripcion: 'Lluvia de Estrellas lanza el doble de estrellas' },
      poderes: [
        { id: 'lluvia', nombre: 'Lluvia de Estrellas', icono: '☄️', descripcion: 'Estrellas fugaces caen sobre los enemigos', coste: 45, recarga: 12 },
        { id: 'atraccion', nombre: 'Atracción Estelar', icono: '🌟', descripcion: 'Atrae todas las monedas y objetos y te da experiencia', coste: 25, recarga: 15 } ] },
  ],

  // ---------------------------------------------------------------
  //  PERSONAJES JUGABLES
  //  arma: sable | pistola | rayo | ancla | canon | fuego | hielo | arpon | tambor | viento
  //  bonus: vida, recarga, area, velocidad (multiplicadores) y armadura (suma)
//  dibujo (respaldo sin sprite): color (abrigo), camisa, pantalon, piel, pelo,
//    peinado (largo|melena|coleta|corto|calvo), ojos, sombrero (tricornio|panuelo|boina|capitan|gorro|ninguno),
//    colorSombrero, pluma, abrigo, capa, panuelo, bandolera, barba, colorBarba, parche
  // ---------------------------------------------------------------
  personajes: [
    {
      id: 'coral',
      nombre: 'Capitana Coral',
      descripcion: 'Espadachina temeraria. +20% de vida.',
      arma: 'sable',
      precio: 0, // Berries para desbloquearlo (0 = disponible desde el inicio)
      bonus: { vida: 1.2 },
      sprite: { src: 'sprites/coral.png', frames: 4, fps: 10, alto: 77, anclaY: 0.62 },
      dibujo: { color: '#b3261e', camisa: '#f5ecd7', piel: '#f3c89a', pelo: '#3b1f4a', peinado: 'largo', sombrero: 'tricornio', colorSombrero: '#22191a', pluma: '#e74c3c', abrigo: true, panuelo: '#f6c945' },
    },
    {
      id: 'bram',
      nombre: 'Bram el Certero',
      descripcion: 'Tirador de élite. Recarga un 10% más rápido.',
      arma: 'pistola',
      precio: 0,
      bonus: { recarga: 0.9 },
      sprite: { src: 'sprites/bram.png', frames: 4, fps: 10, alto: 77, anclaY: 0.62 },
      dibujo: { color: '#2e6fbf', camisa: '#ecf0f1', pantalon: '#3d2b1f', piel: '#a86b3c', pelo: '#1b1410', peinado: 'corto', sombrero: 'panuelo', colorSombrero: '#d63031', bandolera: true },
    },
    {
      id: 'lumi',
      nombre: 'Lumi Brújula',
      descripcion: 'Domina las tormentas. +15% de área.',
      arma: 'rayo',
      precio: 800,
      bonus: { area: 1.15 },
      sprite: { src: 'sprites/lumi.png', frames: 4, fps: 10, alto: 77, anclaY: 0.62 },
      dibujo: { color: '#f2b51b', camisa: '#2c3e50', pantalon: '#2c3e7a', piel: '#ffe0bd', pelo: '#17a589', peinado: 'melena', ojos: '#1f5fa8', sombrero: 'boina', colorSombrero: '#6c5ce7', capa: '#263a7a' },
    },
    {
      id: 'barba',
      nombre: 'Barbagris',
      descripcion: 'Viejo lobo de mar. Lento, +40% vida y armadura.',
      arma: 'ancla',
      precio: 1500,
      bonus: { vida: 1.4, velocidad: 0.9, armadura: 1 },
      sprite: { src: 'sprites/barba.png', frames: 4, fps: 10, alto: 77, anclaY: 0.62 },
      dibujo: { color: '#4f5d6b', camisa: '#d6cdb4', piel: '#e0ac69', pelo: '#dfe3e6', peinado: 'calvo', sombrero: 'capitan', colorSombrero: '#1b2f6b', barba: true, parche: true, abrigo: true },
    },
    {
      id: 'bruno',
      nombre: 'Bruno el Artillero',
      descripcion: 'Experto en cañones. +10% vida y área.',
      arma: 'canon',
      precio: 1000,
      bonus: { vida: 1.1, area: 1.1 },
      sprite: { src: 'sprites/bruno.png', frames: 4, fps: 10, alto: 77, anclaY: 0.62 },
      dibujo: { color: '#7b4a24', camisa: '#e8d9b5', pantalon: '#3d3b52', piel: '#8d5524', pelo: '#1b1410', peinado: 'corto', sombrero: 'gorro', colorSombrero: '#2e8b57', bandolera: true, barba: true, colorBarba: '#2b1a10' },
    },
    {
      id: 'nieves',
      nombre: 'Nieves la Cartógrafa',
      descripcion: 'Dibujó los mapas de los mares helados. Recarga un 8% más rápido.',
      arma: 'hielo',
      precio: 2000,
      bonus: { recarga: 0.92 },
      sprite: { src: 'sprites/nieves.png', frames: 4, fps: 10, alto: 77, anclaY: 0.62 },
      dibujo: { color: '#d6e4f0', camisa: '#2c5d8a', pantalon: '#34495e', piel: '#f6d6c4', pelo: '#eef4f8', peinado: 'coleta', ojos: '#2e86c1', sombrero: 'ninguno', capa: '#5dade2' },
    },
    {
      id: 'marea',
      nombre: 'Marea la Arponera',
      descripcion: 'Cazadora de monstruos marinos. +10% velocidad.',
      arma: 'arpon',
      precio: 3000,
      bonus: { velocidad: 1.1 },
      sprite: { src: 'sprites/marea.png', frames: 4, fps: 10, alto: 77, anclaY: 0.62 },
      dibujo: { color: '#138d75', camisa: '#0e6655', pantalon: '#0b3d33', piel: '#c68642', pelo: '#6c3483', peinado: 'coleta', sombrero: 'panuelo', colorSombrero: '#f1c40f' },
    },
    {
      id: 'kai',
      nombre: 'Kai el Tamborilero',
      descripcion: 'Su tambor hace temblar la cubierta. +15% vida y armadura.',
      arma: 'tambor',
      precio: 4000,
      bonus: { vida: 1.15, armadura: 1 },
      sprite: { src: 'sprites/kai.png', frames: 4, fps: 10, alto: 77, anclaY: 0.62 },
      dibujo: { color: '#7d3c98', camisa: '#f5ecd7', pantalon: '#2d2a3e', piel: '#e0ac69', pelo: '#f5b041', peinado: 'corto', sombrero: 'ninguno', panuelo: '#e74c3c', abrigo: true },
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
  //  PROGRESO ENTRE PARTIDAS (Astillero)
  //  Al terminar cada partida ganas Berries:
  //    derribos × berriesPorDerribo + segundos × berriesPorSegundo
  //    + jefes × berriesPorJefe + (victoria ? berriesPorVictoria : 0)
  //  Cada mejora cuesta `precio` × crecimientoPrecio ^ nivel actual.
  //  `valor` es lo que suma cada nivel.
  // ---------------------------------------------------------------
  progreso: {
    berriesPorDerribo: 0.5,
    berriesPorSegundo: 0.35,
    berriesPorJefe: 250,
    berriesPorVictoria: 1000,
    crecimientoPrecio: 1.6,
  },
  mejoras: {
    vida:        { nombre: 'Casco Reforzado',  icono: '❤️', descripcion: '+10% vida máxima',          valor: 0.10, max: 5, precio: 100 },
    dano:        { nombre: 'Forja de Sables',  icono: '⚔️', descripcion: '+5% daño',                  valor: 0.05, max: 5, precio: 150 },
    recarga:     { nombre: 'Tripulación Ágil', icono: '⏳', descripcion: '-3% tiempo de recarga',     valor: 0.03, max: 5, precio: 150 },
    velocidad:   { nombre: 'Velas Nuevas',     icono: '⛵', descripcion: '+4% velocidad',             valor: 0.04, max: 4, precio: 100 },
    area:        { nombre: 'Cañones Anchos',   icono: '🎯', descripcion: '+5% área de ataque',        valor: 0.05, max: 4, precio: 120 },
    iman:        { nombre: 'Red de Pesca',     icono: '🧲', descripcion: '+15% radio de recogida',    valor: 0.15, max: 4, precio: 80 },
    armadura:    { nombre: 'Planchas de Hierro', icono: '🛡️', descripcion: '+1 armadura',            valor: 1,    max: 3, precio: 250 },
    regen:       { nombre: 'Cocinero de a Bordo', icono: '🍲', descripcion: '+0.2 vida por segundo',  valor: 0.2,  max: 4, precio: 120 },
    experiencia: { nombre: 'Cuaderno de Bitácora', icono: '📜', descripcion: '+8% experiencia',       valor: 0.08, max: 4, precio: 150 },
    codicia:     { nombre: 'Cofre sin Fondo',  icono: '🪙', descripcion: '+10% Berries al terminar', valor: 0.10, max: 5, precio: 100 },
    revivir:     { nombre: 'Bote Salvavidas',  icono: '🛟', descripcion: 'Revives 1 vez por partida con 50% de vida', valor: 1, max: 1, precio: 1500 },
  },

  // ---------------------------------------------------------------
  //  FRUTAS DE PODER (caen de los enemigos; efecto temporal)
  //  efecto: experiencia | dano | velocidad | armadura
  // ---------------------------------------------------------------
  probabilidadFruta: 0.004,       // por enemigo normal
  probabilidadFrutaCapitan: 0.08, // por capitán de la Armada
  frutas: {
    dorada: { nombre: 'Fruta Dorada', descripcion: 'Doble de experiencia', efecto: 'experiencia', valor: 2,   duracion: 20, color: '#f6c945' },
    furia:  { nombre: 'Fruta Furia',  descripcion: '+50% de daño',         efecto: 'dano',        valor: 1.5, duracion: 15, color: '#e74c3c' },
    brisa:  { nombre: 'Fruta Brisa',  descripcion: '+40% de velocidad',    efecto: 'velocidad',   valor: 1.4, duracion: 15, color: '#48c9b0' },
    coral:  { nombre: 'Fruta Coral',  descripcion: '+5 de armadura',       efecto: 'armadura',    valor: 5,   duracion: 15, color: '#ff8fab' },
  },

  // ---------------------------------------------------------------
  //  MISIONES (recompensa en Berries; se cobran en el menú Misiones)
  //  tipo: derribos | tiempo (segundos) | victorias | jefe:<id> | nivel
  //        | frutas | piratas | mejoras | armas | recompensa | tiradas | tesoros | islas | rango | ordenes
  // ---------------------------------------------------------------
  misiones: [
    { id: 'k1', nombre: 'Primera sangre',         descripcion: 'Derrota 100 enemigos en total',           tipo: 'derribos', meta: 100,   recompensa: 100 },
    { id: 'k2', nombre: 'Azote de la Armada',     descripcion: 'Derrota 1.000 enemigos en total',         tipo: 'derribos', meta: 1000,  recompensa: 400 },
    { id: 'k3', nombre: 'Leyenda del mar',        descripcion: 'Derrota 10.000 enemigos en total',        tipo: 'derribos', meta: 10000, recompensa: 2000 },
    { id: 't1', nombre: 'Superviviente',          descripcion: 'Aguanta 3 minutos en una partida',        tipo: 'tiempo',   meta: 180,   recompensa: 150 },
    { id: 't2', nombre: 'Piel curtida',           descripcion: 'Aguanta 6 minutos en una partida',        tipo: 'tiempo',   meta: 360,   recompensa: 400 },
    { id: 'w1', nombre: 'Rey de la isla',         descripcion: 'Gana una partida (aguanta 10 minutos)',   tipo: 'victorias', meta: 1,    recompensa: 1500 },
    { id: 'w2', nombre: 'Terror de los siete mares', descripcion: 'Gana 5 partidas',                       tipo: 'victorias', meta: 5,    recompensa: 3000 },
    { id: 'b1', nombre: 'Hierro oxidado',         descripcion: 'Derrota al Comodoro de Hierro',           tipo: 'jefe:comodoro',  meta: 1, recompensa: 300 },
    { id: 'b2', nombre: 'Calamar a la plancha',   descripcion: 'Derrota al Rey Kraken',                   tipo: 'jefe:kraken',    meta: 1, recompensa: 600 },
    { id: 'b3', nombre: 'Calma tras la tormenta', descripcion: 'Derrota al Almirante Tormenta',           tipo: 'jefe:almirante', meta: 1, recompensa: 1000 },
    { id: 'l1', nombre: 'Grumete',                descripcion: 'Llega al nivel 10 en una partida',        tipo: 'nivel',    meta: 10,    recompensa: 150 },
    { id: 'l2', nombre: 'Veterano',               descripcion: 'Llega al nivel 25 en una partida',        tipo: 'nivel',    meta: 25,    recompensa: 500 },
    { id: 'f1', nombre: 'Frutero',                descripcion: 'Come 5 frutas de poder',                  tipo: 'frutas',   meta: 5,     recompensa: 200 },
    { id: 'f2', nombre: 'Gran banquete',          descripcion: 'Come 30 frutas de poder',                 tipo: 'frutas',   meta: 30,    recompensa: 600 },
    { id: 'p1', nombre: 'Tripulación',            descripcion: 'Juega con 3 piratas distintos',           tipo: 'piratas',  meta: 3,     recompensa: 300 },
    { id: 'p2', nombre: 'Flota completa',         descripcion: 'Juega con los 8 piratas',                 tipo: 'piratas',  meta: 8,     recompensa: 1500 },
    { id: 'm1', nombre: 'Astillero en marcha',    descripcion: 'Compra 5 mejoras en el Astillero',        tipo: 'mejoras',  meta: 5,     recompensa: 200 },
    { id: 'm2', nombre: 'Barco de guerra',        descripcion: 'Compra 20 mejoras en el Astillero',       tipo: 'mejoras',  meta: 20,    recompensa: 800 },
    { id: 'a1', nombre: 'Arsenal flotante',       descripcion: 'Ten 6 armas a la vez en una partida',     tipo: 'armas',    meta: 6,     recompensa: 400 },
    { id: 'g1', nombre: 'Buscador de tesoros',    descripcion: 'Abre el Cofre del Tesoro por primera vez', tipo: 'tiradas', meta: 1,  recompensa: 150 },
    { id: 'g2', nombre: 'Coleccionista',          descripcion: 'Consigue 10 tesoros distintos',           tipo: 'tesoros',  meta: 10,    recompensa: 1000 },
    { id: 'i1', nombre: 'Explorador',             descripcion: 'Desbloquea 3 islas',                      tipo: 'islas',    meta: 3,     recompensa: 500 },
    { id: 'i2', nombre: 'Cartógrafo de los mares', descripcion: 'Desbloquea las 9 islas',                 tipo: 'islas',    meta: 9,     recompensa: 3000 },
    { id: 'o1', nombre: 'Primer juramento',       descripcion: 'Llega al rango Marinero en una orden',    tipo: 'rango',    meta: 2,     recompensa: 300 },
    { id: 'o2', nombre: 'Leyenda del Faro',       descripcion: 'Llega al rango Leyenda en una orden',     tipo: 'rango',    meta: 5,     recompensa: 3000 },
    { id: 'o3', nombre: 'Las diez órdenes',       descripcion: 'Desbloquea las 10 órdenes',               tipo: 'ordenes',  meta: 10,    recompensa: 2000 },
    { id: 's1', nombre: 'Ojo de la tormenta',     descripcion: 'Sobrevive a 3 Grandes Tormentas',         tipo: 'tormentas', meta: 3,    recompensa: 800 },
    { id: 'r1', nombre: 'Se busca',               descripcion: 'Consigue 50.000.000 de recompensa en una partida', tipo: 'recompensa', meta: 5e7, recompensa: 700 },
  ],

  // ---------------------------------------------------------------
  //  MEJORAS CON RAREZA DENTRO DE LA PARTIDA (aparecen al subir de nivel)
  //  valores = [Común, Raro, Épico, Legendario]; se acumulan sin límite.
  //  stat: experiencia, dano, vida, velocidad, recarga, area, iman, armadura, regen, berries
  // ---------------------------------------------------------------
  rarezasPartida: { comun: 60, raro: 27, epico: 10, legendario: 3 },
  mejorasPartida: {
    experiencia: { nombre: 'Instinto Pirata',   icono: '📜', stat: 'experiencia', valores: [0.05, 0.08, 0.12, 0.20] },
    dano:        { nombre: 'Filo Afilado',      icono: '⚔️', stat: 'dano',        valores: [0.05, 0.08, 0.12, 0.20] },
    vida:        { nombre: 'Corazón de Roble',  icono: '❤️', stat: 'vida',        valores: [0.06, 0.10, 0.15, 0.25] },
    velocidad:   { nombre: 'Viento a Favor',    icono: '💨', stat: 'velocidad',   valores: [0.03, 0.05, 0.08, 0.12] },
    recarga:     { nombre: 'Manos Rápidas',     icono: '⏱️', stat: 'recarga',     valores: [0.03, 0.05, 0.07, 0.10] },
    area:        { nombre: 'Gran Alcance',      icono: '🎯', stat: 'area',        valores: [0.04, 0.07, 0.10, 0.15] },
    iman:        { nombre: 'Olfato de Tesoro',  icono: '🧲', stat: 'iman',        valores: [0.10, 0.15, 0.25, 0.40] },
    armadura:    { nombre: 'Piel de Tiburón',   icono: '🛡️', stat: 'armadura',    valores: [0.5, 1, 1.5, 2.5] },
    regen:       { nombre: 'Ron Curativo',      icono: '🍶', stat: 'regen',       valores: [0.15, 0.25, 0.4, 0.7] },
    berries:     { nombre: 'Bolsillos Hondos',  icono: '🪙', stat: 'berries',     valores: [0.05, 0.08, 0.12, 0.20] },
  },

  // ---------------------------------------------------------------
  //  COFRE DEL TESORO (gacha con Berries) E INVENTARIO
  //  Cada tirada da un tesoro. Si ya lo tienes, sube de nivel (máx. nivelMax,
  //  cada nivel +25% de su efecto); si está al máximo, devuelve Berries.
  //  Los tesoros equipados (hasta `ranuras`) dan sus bonus en todas las partidas.
  //  stats: dano, vida, velocidad, area, iman, experiencia, berries (fracción: 0.05 = 5%),
  //         recarga (fracción que se reduce), armadura y regen (valor fijo)
  // ---------------------------------------------------------------
  cofre: {
    precio: 250,          // 1 tirada
    precio10: 2250,       // 10 tiradas (la última garantiza Raro o mejor)
    garantiaLegendario: 50, // como mucho cada 50 tiradas sale un Legendario
    probabilidades: { comun: 60, raro: 28, epico: 10, legendario: 2 },
    reembolso: { comun: 30, raro: 80, epico: 200, legendario: 600 },
    nivelMax: 5,
    ranuras: 3,
  },
  tesoros: {
    lona:      { nombre: 'Parche de Lona',       icono: '🩹', rareza: 'comun',      stats: { vida: 0.05 } },
    botas:     { nombre: 'Botas Remendadas',     icono: '🥾', rareza: 'comun',      stats: { velocidad: 0.03 } },
    brujula:   { nombre: 'Brújula Vieja',        icono: '🧭', rareza: 'comun',      stats: { iman: 0.10 } },
    pedernal:  { nombre: 'Pedernal',             icono: '🪨', rareza: 'comun',      stats: { dano: 0.03 } },
    reloj:     { nombre: 'Reloj Oxidado',        icono: '⌚', rareza: 'comun',      stats: { recarga: 0.02 } },
    sable:     { nombre: 'Sable de Bronce',      icono: '🗡️', rareza: 'raro',       stats: { dano: 0.07 } },
    chaleco:   { nombre: 'Chaleco de Cuero',     icono: '🦺', rareza: 'raro',       stats: { armadura: 1 } },
    catalejo:  { nombre: 'Catalejo de Latón',    icono: '🔭', rareza: 'raro',       stats: { area: 0.08 } },
    amuleto:   { nombre: 'Amuleto de Sal',       icono: '🧿', rareza: 'raro',       stats: { regen: 0.3 } },
    monedero:  { nombre: 'Monedero de Seda',     icono: '👛', rareza: 'raro',       stats: { berries: 0.10 } },
    perla:     { nombre: 'Perla del Abismo',     icono: '🔮', rareza: 'epico',      stats: { dano: 0.12, area: 0.05 } },
    mapa:      { nombre: 'Mapa Estelar',         icono: '🗺️', rareza: 'epico',      stats: { experiencia: 0.15 } },
    caparazon: { nombre: 'Coraza de Caparazón',  icono: '🐢', rareza: 'epico',      stats: { armadura: 2, vida: 0.10 } },
    pluma:     { nombre: 'Pluma de Albatros',    icono: '🪶', rareza: 'epico',      stats: { velocidad: 0.08, recarga: 0.05 } },
    corona:    { nombre: 'Corona del Rey Kraken', icono: '👑', rareza: 'legendario', stats: { dano: 0.15, vida: 0.15 } },
    timon:     { nombre: 'Timón de los Siete Vientos', icono: '☸️', rareza: 'legendario', stats: { velocidad: 0.12, recarga: 0.10, iman: 0.15 } },
    doblon:    { nombre: 'Moneda Maldita',       icono: '🪙', rareza: 'legendario', stats: { berries: 0.30, experiencia: 0.20 } },
  },

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
    hielo:   { nombre: 'Fruta Glacial', icono: '❄️', niveles: ['Fragmentos de hielo en círculo que ralentizan', '+2 fragmentos', '+40% daño', '+2 fragmentos, ralentizan más tiempo', 'Congela: ralentiza un 80%'] },
    arpon:   { nombre: 'Arpón', icono: '🔱', niveles: ['Arpón que atraviesa y vuelve a tu mano', '+1 arpón', '+30% daño', '+1 arpón', 'Más rápido y de más alcance'] },
    tambor:  { nombre: 'Tambor de Guerra', icono: '🥁', niveles: ['Onda expansiva que empuja a los enemigos', '+25% radio', '+40% daño', '-20% recarga', 'Doble onda'] },
    viento:  { nombre: 'Fruta Vendaval', icono: '🌪️', niveles: ['Tornados que arrastran y golpean', '+1 tornado', '+30% tamaño y +40% daño', '+1 tornado', 'Los tornados duran el doble'] },
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
