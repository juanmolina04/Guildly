// Datos de ejemplo para la demo de Guildly.
//
//   npm run seed           crea (o refresca) usuarios, publicaciones, comentarios y favoritos de ejemplo
//   npm run seed -- --clear   borra todo lo que creó este script (no toca tus datos reales)
//
// Es seguro ejecutarlo varias veces: usa ids fijos, así que no duplica nada. Al volver a
// ejecutarlo, las fechas se recalculan respecto a "ahora" (útil para refrescar el medidor
// de actividad justo antes de la demo). Requiere backend/serviceAccountKey.json.

const { db } = require('../src/config/firebase');

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const POINTS = { post: 10, comment: 3 };

// Usuarios ficticios (solo existen en Firestore, no pueden iniciar sesión).
const USERS = {
  lucia: 'lucia_g',
  camilo: 'camilo_dev',
  sofi: 'sofi_plays',
  mateo: 'mateo_x',
  dani: 'dani_pixel',
};

// daysAgo: hace cuántos días se publicó (las de menos de 7 días cuentan para el medidor).
// Cada comentario puede traer "replies". Los textos son ejemplos inventados para la demo.
const CONTENT = {
  1: {
    followers: ['lucia', 'camilo', 'sofi', 'dani'],
    posts: [
      {
        by: 'lucia', tag: 'guia', daysAgo: 2, title: 'Cómo sobrevivir tu primera noche',
        body: 'Antes de que anochezca, consigue madera y haz una mesa de crafteo. Con unas pocas tablas puedes hacer un refugio rápido: cava en una colina, tapa la entrada con bloques y listo. Así los monstruos no te alcanzan.',
        comments: [
          { by: 'camilo', text: 'Muy útil, yo siempre dejaba una antorcha dentro para ver mejor.', hours: 30, replies: [{ by: 'lucia', text: 'Buen punto, así no se te llena de oscuridad el refugio.', hours: 26 }] },
          { by: 'mateo', text: 'Gracias, con esto ya no me van a sorprender en la noche.', hours: 20 },
        ],
      },
      {
        by: 'mateo', tag: 'pregunta', daysAgo: 1, title: '¿Cuál es la mejor forma de conseguir hierro?',
        body: 'Llevo varias horas explorando cuevas y casi no encuentro hierro. ¿Hay alguna altura o truco para encontrarlo más rápido?',
        comments: [
          { by: 'sofi', text: 'Cava en forma de escalera hacia abajo y mira las paredes de las cuevas, ahí se ve mucho mineral.', hours: 10, replies: [{ by: 'mateo', text: '¡Probé eso y funcionó! Gracias.', hours: 6 }] },
        ],
      },
      {
        by: 'dani', tag: 'discusion', daysAgo: 4, title: '¿Supervivencia o creativo?',
        body: 'Me cuesta decidir qué modo disfrutar más. En supervivencia hay reto, pero en creativo puedo construir sin límites. ¿Ustedes cuál prefieren?',
        comments: [
          { by: 'lucia', text: 'Supervivencia para empezar, y creativo cuando quiero construir algo grande.', hours: 70 },
        ],
      },
      {
        by: 'camilo', tag: 'noticia', daysAgo: 6, title: 'Bienvenidos al gremio de Minecraft',
        body: 'Este es el espacio para compartir guías, dudas y proyectos. Recuerda ser amable con los demás y usar la etiqueta correcta en cada publicación.',
        comments: [],
      },
    ],
  },
  2: {
    followers: ['sofi', 'mateo', 'dani'],
    posts: [
      {
        by: 'sofi', tag: 'guia', daysAgo: 3, title: 'Consejos para no frustrarte al inicio',
        body: 'Explora con calma y aprende los patrones de ataque de cada enemigo antes de pelear. Cuando tengas la oportunidad, guarda en bancas para no perder el progreso.',
        comments: [
          { by: 'dani', text: 'Aprender los patrones lo cambia todo, gracias por el consejo.', hours: 50, replies: [{ by: 'sofi', text: '¡Exacto! La paciencia es la clave.', hours: 45 }] },
        ],
      },
      {
        by: 'dani', tag: 'pregunta', daysAgo: 9, title: '¿Vale la pena explorar todo el mapa?',
        body: 'Siento que me pierdo mucho. ¿Recomiendan seguir una ruta o explorar sin guía?',
        comments: [
          { by: 'lucia', text: 'Yo exploré sin guía y lo disfruté más, pero me perdí un buen rato.', hours: 200 },
        ],
      },
      {
        by: 'mateo', tag: 'discusion', daysAgo: 10, title: 'El mejor ambiente del juego',
        body: 'Para mí la música y la atmósfera lo hacen especial. ¿Cuál fue su zona favorita?',
        comments: [],
      },
    ],
  },
  3: {
    followers: ['camilo', 'lucia'],
    posts: [
      {
        by: 'camilo', tag: 'guia', daysAgo: 2, title: 'Qué hacer en tu primer día',
        body: 'Recoge madera, haz una casa sencilla y consigue algo de equipo básico. Una vivienda te permite tener un lugar seguro y atraer a los primeros vecinos.',
        comments: [
          { by: 'sofi', text: 'La casa es lo primero, sin ella la noche es complicada.', hours: 36 },
        ],
      },
      {
        by: 'lucia', tag: 'pregunta', daysAgo: 5, title: '¿Qué clase me recomiendan para empezar?',
        body: 'No sé si elegir cuerpo a cuerpo o a distancia. Quiero algo que no sea tan difícil la primera vez.',
        comments: [
          { by: 'camilo', text: 'A distancia es más cómodo para empezar, evitas muchos golpes.', hours: 90, replies: [{ by: 'lucia', text: 'Gracias, voy a probar esa opción.', hours: 85 }] },
        ],
      },
      {
        by: 'mateo', tag: 'discusion', daysAgo: 11, title: 'Construir versus explorar',
        body: '¿Prefieren pasar el tiempo construyendo su base o explorando nuevas zonas?',
        comments: [],
      },
    ],
  },
  4: {
    followers: ['lucia', 'sofi', 'mateo', 'camilo', 'dani'],
    posts: [
      {
        by: 'lucia', tag: 'guia', daysAgo: 1, title: 'Qué sembrar en primavera para ganar dinero',
        body: 'La coliflor y la papa son buenas opciones para empezar. Riega todos los días y vende los primeros cultivos para comprar más semillas.',
        comments: [
          { by: 'dani', text: 'Con esto logré mejorar mi granja en pocos días.', hours: 14, replies: [{ by: 'lucia', text: '¡Qué bien! Sigue así.', hours: 10 }] },
          { by: 'camilo', text: 'La papa me dio buenas ganancias, gracias.', hours: 8 },
        ],
      },
      {
        by: 'sofi', tag: 'discusion', daysAgo: 2, title: '¿Granja o minas primero?',
        body: 'Me cuesta organizar mi tiempo. ¿Prefieren dedicar los primeros días a cultivar o a explorar las minas?',
        comments: [
          { by: 'mateo', text: 'Yo empiezo con la granja y las minas cuando tengo energía de sobra.', hours: 30 },
        ],
      },
      {
        by: 'dani', tag: 'pregunta', daysAgo: 3, title: '¿Cómo mejoro la relación con los vecinos?',
        body: 'Quiero llevarme bien con todos, pero no sé qué regalos les gustan.',
        comments: [
          { by: 'lucia', text: 'Cada vecino tiene gustos distintos, observa sus reacciones al regalarles algo.', hours: 60 },
        ],
      },
    ],
  },
  5: {
    followers: ['dani', 'mateo'],
    posts: [
      {
        by: 'dani', tag: 'guia', daysAgo: 4, title: 'Cómo practicar el movimiento sin frustrarte',
        body: 'Practica una pantalla a la vez y no te presiones. Si fallas, respira y repite: cada intento te ayuda a mejorar.',
        comments: [
          { by: 'sofi', text: 'Me ayudó mucho tomar descansos cortos.', hours: 80 },
        ],
      },
      {
        by: 'mateo', tag: 'discusion', daysAgo: 9, title: 'El mensaje del juego',
        body: 'Más allá de la dificultad, me gustó cómo habla de superarse a uno mismo. ¿Qué opinan?',
        comments: [],
      },
    ],
  },
  6: {
    followers: ['mateo'],
    posts: [
      {
        by: 'sofi', tag: 'guia', daysAgo: 8, title: 'Consejos para jugar como tripulante',
        body: 'Presta atención a quién se mueve de forma extraña y no sigas a otros jugadores sin pensar. Comunica lo que viste con claridad durante las reuniones.',
        comments: [],
      },
      {
        by: 'camilo', tag: 'noticia', daysAgo: 12, title: 'Partida amistosa de la comunidad',
        body: 'Estamos organizando una partida entre miembros del gremio. Si quieres unirte, comenta aquí.',
        comments: [
          { by: 'mateo', text: 'Cuenten conmigo.', hours: 250 },
        ],
      },
    ],
  },
  7: {
    followers: ["lucia"],
    posts: [
      { by: 'lucia', tag: 'guia', daysAgo: 1, title: "Cómo no frustrarte en tus primeros intentos",
        body: "Cada muerte te deja algo: recursos y mejoras. Prueba armas distintas y quédate con la que mejor se sienta, no con la que dicen que es más fuerte.",
        comments: [{ by: 'mateo', text: 'Muy útil, gracias por compartirlo.', hours: 21 }] },
      { by: 'camilo', tag: 'pregunta', daysAgo: 3, title: "¿Qué arma recomiendan para empezar?",
        body: "Quiero algo que perdone errores. ¿Qué armas les funcionaron mejor al inicio?",
        comments: [{ by: 'sofi', text: "Una de ataque rápido te deja practicar sin miedo.", hours: 18, replies: [{ by: 'camilo', text: "Gracias, la voy a probar.", hours: 14 }] }] },
    ],
  },
  8: {
    followers: ["camilo", "sofi"],
    posts: [
      { by: 'camilo', tag: 'guia', daysAgo: 2, title: "Consejos para tu primera partida",
        body: "Habla con todos y no tengas prisa. Cada decisión cambia la historia, así que explora con calma y disfruta los diálogos.",
        comments: [{ by: 'dani', text: 'Muy útil, gracias por compartirlo.', hours: 45 }] },
      { by: 'sofi', tag: 'discusion', daysAgo: 5, title: "¿Qué escena los marcó más?",
        body: "Hay momentos que no esperaba. Comparto el mío sin spoilers: la música me dejó pensando.",
        comments: [{ by: 'mateo', text: "La música de este juego es de lo mejor que he escuchado.", hours: 42, replies: [{ by: 'sofi', text: "Totalmente de acuerdo.", hours: 38 }] }] },
    ],
  },
  9: {
    followers: ["sofi", "mateo", "dani"],
    posts: [
      { by: 'sofi', tag: 'guia', daysAgo: 3, title: "Cómo prepararte para los jefes",
        body: "Memoriza cada fase del jefe y no te desesperes. Practicar el esquive antes de atacar te ahorra muchos intentos.",
        comments: [{ by: 'lucia', text: 'Muy útil, gracias por compartirlo.', hours: 69 }] },
      { by: 'mateo', tag: 'pregunta', daysAgo: 7, title: "¿Mejor jugar solo o en cooperativo?",
        body: "Estoy dudando entre jugar solo o con un amigo. ¿Qué experiencia les gustó más?",
        comments: [] },
    ],
  },
  10: {
    followers: ["mateo", "dani", "lucia", "camilo"],
    posts: [
      { by: 'mateo', tag: 'guia', daysAgo: 5, title: "Primeras cosas que mejorar",
        body: "No gastes todo de inmediato: elige un estilo de juego y mejora solo lo que combine con él. Aprende a esquivar antes de atacar.",
        comments: [{ by: 'camilo', text: 'Muy útil, gracias por compartirlo.', hours: 117 }] },
      { by: 'dani', tag: 'pregunta', daysAgo: 10, title: "¿Qué ruta recomiendan al inicio?",
        body: "Hay varias rutas y no sé cuál elegir. ¿Cuál les resultó más amable?",
        comments: [{ by: 'lucia', text: "Empieza por la más corta para aprender las mecánicas.", hours: 114, replies: [{ by: 'dani', text: "Buen consejo, gracias.", hours: 110 }] }] },
    ],
  },
  11: {
    followers: ["dani"],
    posts: [
      { by: 'dani', tag: 'guia', daysAgo: 6, title: "Cómo armar un buen mazo",
        body: "Menos cartas suele ser mejor: un mazo pequeño y coherente funciona más que uno lleno de opciones sin relación.",
        comments: [{ by: 'sofi', text: 'Muy útil, gracias por compartirlo.', hours: 141 }] },
      { by: 'lucia', tag: 'discusion', daysAgo: 8, title: "¿Prefieren mazos de ataque o de defensa?",
        body: "Siempre dudo entre aprovechar el daño o cuidar la vida. ¿Ustedes qué priorizan?",
        comments: [{ by: 'camilo', text: "Defensa primero, así tienes tiempo de armar la combinación.", hours: 138, replies: [{ by: 'lucia', text: "Voy a probarlo en mi siguiente partida.", hours: 134 }] }] },
    ],
  },
  12: {
    followers: ["lucia", "camilo"],
    posts: [
      { by: 'lucia', tag: 'guia', daysAgo: 8, title: "Orden recomendado para tu primera fábrica",
        body: "Empieza con lo básico: hierro, cobre y energía. Deja espacio entre las líneas, porque ampliar después es mucho más fácil.",
        comments: [{ by: 'mateo', text: 'Muy útil, gracias por compartirlo.', hours: 189 }] },
      { by: 'camilo', tag: 'pregunta', daysAgo: 11, title: "¿Cómo organizan sus cintas?",
        body: "Mi base ya parece un laberinto. ¿Qué trucos usan para mantener todo ordenado?",
        comments: [] },
    ],
  },
  13: {
    followers: ["camilo", "sofi", "mateo"],
    posts: [
      { by: 'camilo', tag: 'guia', daysAgo: 2, title: "Primeros pasos con tu colonia",
        body: "Prioriza comida, refugio y defensa antes de expandirte. Una colonia estable vale más que una grande desordenada.",
        comments: [{ by: 'dani', text: 'Muy útil, gracias por compartirlo.', hours: 45 }] },
      { by: 'sofi', tag: 'discusion', daysAgo: 6, title: "¿Cuál fue su peor desastre?",
        body: "Cuéntenme sus historias más caóticas, siempre terminan en anécdota.",
        comments: [{ by: 'mateo', text: "A mí se me incendió media colonia por un descuido.", hours: 42, replies: [{ by: 'sofi', text: "Jaja, nos pasa a todos.", hours: 38 }] }] },
    ],
  },
  14: {
    followers: ["sofi", "mateo", "dani", "lucia"],
    posts: [
      { by: 'sofi', tag: 'guia', daysAgo: 4, title: "Cómo sobrevivir tus primeras noches",
        body: "Construye un refugio simple, mantente cerca de tu base y no te aventures lejos sin comida. Con paciencia todo mejora.",
        comments: [{ by: 'lucia', text: 'Muy útil, gracias por compartirlo.', hours: 93 }] },
      { by: 'mateo', tag: 'pregunta', daysAgo: 9, title: "¿Mejor jugar en grupo?",
        body: "Quiero organizar una partida con amigos. ¿Cuántos jugadores recomiendan?",
        comments: [{ by: 'dani', text: "Con tres o cuatro funciona muy bien.", hours: 90, replies: [{ by: 'mateo', text: "Perfecto, armaré el grupo.", hours: 86 }] }] },
    ],
  },
  15: {
    followers: ["mateo"],
    posts: [
      { by: 'mateo', tag: 'guia', daysAgo: 9, title: "Primeras horas bajo el agua",
        body: "Vigila tu oxígeno y explora cerca de tu cápsula. Anota los lugares interesantes para volver con mejores herramientas.",
        comments: [{ by: 'camilo', text: 'Muy útil, gracias por compartirlo.', hours: 213 }] },
      { by: 'dani', tag: 'discusion', daysAgo: 11, title: "¿Les da miedo la profundidad?",
        body: "Confieso que al bajar más de la cuenta me asusto. ¿Les pasa igual?",
        comments: [] },
    ],
  },
  16: {
    followers: ["dani", "lucia"],
    posts: [
      { by: 'dani', tag: 'guia', daysAgo: 1, title: "Consejos para sobrevivir el primer invierno",
        body: "Prepara comida, ropa y una fogata con anticipación. Los inviernos castigan a quien llega sin recursos.",
        comments: [{ by: 'sofi', text: 'Muy útil, gracias por compartirlo.', hours: 21 }] },
      { by: 'lucia', tag: 'pregunta', daysAgo: 4, title: "¿Qué personaje prefieren?",
        body: "Cada personaje tiene su estilo. ¿Cuál les gusta más y por qué?",
        comments: [{ by: 'camilo', text: "Me gusta el que tiene más vida para empezar.", hours: 18, replies: [{ by: 'lucia', text: "Lo voy a elegir entonces.", hours: 14 }] }] },
    ],
  },
  17: {
    followers: ["lucia", "camilo", "sofi"],
    posts: [
      { by: 'lucia', tag: 'guia', daysAgo: 3, title: "Cómo mejorar tu partida rápido",
        body: "Combina armas que se complementen y recoge todo lo que puedas. Moverte constantemente es la clave para sobrevivir.",
        comments: [{ by: 'mateo', text: 'Muy útil, gracias por compartirlo.', hours: 69 }] },
      { by: 'camilo', tag: 'discusion', daysAgo: 7, title: "¿Cuál es su combinación favorita?",
        body: "Buscando ideas para mi próxima partida, cuéntenme qué combinaciones les funcionan.",
        comments: [{ by: 'sofi', text: "Una de área y otra de daño constante funciona muy bien.", hours: 66, replies: [{ by: 'camilo', text: "Excelente idea.", hours: 62 }] }] },
    ],
  },
  18: {
    followers: ["camilo", "sofi", "mateo", "dani"],
    posts: [
      { by: 'camilo', tag: 'guia', daysAgo: 7, title: "Cómo disfrutar su historia",
        body: "Lee con calma y deja que tu personaje se defina con tus decisiones. No hay una forma correcta de jugarlo.",
        comments: [{ by: 'dani', text: 'Muy útil, gracias por compartirlo.', hours: 165 }] },
      { by: 'sofi', tag: 'discusion', daysAgo: 12, title: "¿Qué rasgo de personaje eligieron?",
        body: "Quiero rejugarlo con otra personalidad. ¿Qué les funcionó mejor?",
        comments: [] },
    ],
  },
  19: {
    followers: ["sofi"],
    posts: [
      { by: 'sofi', tag: 'guia', daysAgo: 2, title: "Consejos antes de crear tu personaje",
        body: "Tómate tu tiempo eligiendo clase y trasfondo. Habla con tus compañeros: sus historias también son parte del juego.",
        comments: [{ by: 'lucia', text: 'Muy útil, gracias por compartirlo.', hours: 45 }] },
      { by: 'mateo', tag: 'pregunta', daysAgo: 4, title: "¿Qué clase recomiendan?",
        body: "Voy a empezar y no sé qué clase elegir. ¿Cuál se disfruta más?",
        comments: [{ by: 'dani', text: "Una clase versátil te deja probar de todo.", hours: 42, replies: [{ by: 'mateo', text: "Gracias, la elegiré.", hours: 38 }] }] },
    ],
  },
  20: {
    followers: ["mateo", "dani"],
    posts: [
      { by: 'mateo', tag: 'guia', daysAgo: 5, title: "Cómo sobrevivir al inicio",
        body: "No tengas miedo de huir y volver más fuerte. Explorar otras zonas te da recursos para enfrentar lo que te frenó.",
        comments: [{ by: 'camilo', text: 'Muy útil, gracias por compartirlo.', hours: 117 }] },
      { by: 'dani', tag: 'pregunta', daysAgo: 8, title: "¿Cuál es su estilo de combate?",
        body: "Estoy escogiendo mi estilo. ¿Prefieren combate cercano o a distancia?",
        comments: [{ by: 'lucia', text: "A distancia es más seguro para aprender.", hours: 114, replies: [{ by: 'dani', text: "Lo intentaré así.", hours: 110 }] }] },
    ],
  },
  21: {
    followers: ["dani", "lucia", "camilo"],
    posts: [
      { by: 'dani', tag: 'guia', daysAgo: 10, title: "Cómo resolver los puzles sin ayuda",
        body: "Observa bien el entorno antes de actuar: casi siempre la solución está a la vista. Si te atoras, descansa y vuelve.",
        comments: [{ by: 'sofi', text: 'Muy útil, gracias por compartirlo.', hours: 237 }] },
      { by: 'lucia', tag: 'discusion', daysAgo: 14, title: "¿Cuál fue el puzle más ingenioso?",
        body: "Hay salas realmente brillantes. ¿Cuál recuerdan con más cariño?",
        comments: [] },
    ],
  },
  22: {
    followers: ["lucia", "camilo", "sofi", "mateo"],
    posts: [
      { by: 'lucia', tag: 'guia', daysAgo: 4, title: "Cómo jugar mejor en equipo",
        body: "Quédate cerca de tus compañeros y comunica lo que ves. Nadie sobrevive solo contra una horda.",
        comments: [{ by: 'mateo', text: 'Muy útil, gracias por compartirlo.', hours: 93 }] },
      { by: 'camilo', tag: 'pregunta', daysAgo: 9, title: "¿Cuántos jugadores es ideal?",
        body: "Quiero organizar partidas. ¿Cuántos jugadores se necesitan para pasarla bien?",
        comments: [{ by: 'sofi', text: "Con cuatro es lo ideal.", hours: 90, replies: [{ by: 'camilo', text: "Listo, armamos equipo.", hours: 86 }] }] },
    ],
  },
  23: {
    followers: ["camilo"],
    posts: [
      { by: 'camilo', tag: 'guia', daysAgo: 6, title: "Cómo mejorar tu control del auto",
        body: "Practica el salto y el control en el aire en entrenamiento libre. Dominar la velocidad te da ventaja en cada jugada.",
        comments: [{ by: 'dani', text: 'Muy útil, gracias por compartirlo.', hours: 141 }] },
      { by: 'sofi', tag: 'discusion', daysAgo: 8, title: "¿Mejor modo 1 contra 1 o por equipos?",
        body: "Siempre dudo entre ambos. ¿Cuál prefieren?",
        comments: [{ by: 'mateo', text: "Por equipos es más emocionante.", hours: 138, replies: [{ by: 'sofi', text: "Buena opción.", hours: 134 }] }] },
    ],
  },
  25: {
    followers: ["sofi", "mateo"],
    posts: [
      { by: 'sofi', tag: 'guia', daysAgo: 1, title: "Cómo planear tus movimientos",
        body: "Observa antes de entrar a cada sala y busca un patrón. Moverte rápido es importante, pero planear lo es más.",
        comments: [{ by: 'lucia', text: 'Muy útil, gracias por compartirlo.', hours: 21 }] },
      { by: 'mateo', tag: 'discusion', daysAgo: 4, title: "¿Les gusta la banda sonora?",
        body: "La música marca el ritmo del juego. ¿Cuál es su canción favorita?",
        comments: [] },
    ],
  },
  26: {
    followers: ["mateo", "dani", "lucia"],
    posts: [
      { by: 'mateo', tag: 'guia', daysAgo: 1, title: "Consejos para no frustrarte con los saltos",
        body: "Practica un tramo a la vez y descansa si te frustras. El movimiento fluido llega con repetición.",
        comments: [{ by: 'camilo', text: 'Muy útil, gracias por compartirlo.', hours: 21 }] },
      { by: 'dani', tag: 'discusion', daysAgo: 5, title: "¿Qué escena los emocionó?",
        body: "Es un juego muy emotivo. ¿Hubo algún momento que les marcara?",
        comments: [{ by: 'lucia', text: "El inicio ya te atrapa.", hours: 18, replies: [{ by: 'dani', text: "Estoy de acuerdo.", hours: 14 }] }] },
    ],
  },
};

// Juegos del 7 al 26 (menos Fall Guys, que se deja vacío a propósito para mostrar el estado "sin publicaciones").
// Cada fila: [id, título guía, texto guía, título pregunta, texto pregunta, respuesta, agradecimiento]
const QUICK = [
  [7, 'Primeras armas para empezar', 'Prueba todas las armas en tus primeros intentos. Cada una cambia por completo tu forma de pelear, y conviene quedarte con la que se sienta más cómoda.', '¿Qué bendiciones recomiendan?', 'Siempre dudo entre mejorar el ataque o la defensa. ¿Qué elegirían al inicio?', 'Yo priorizo la defensa al inicio, así llegas más lejos y aprendes los patrones.', 'Probé eso y llegué mucho más lejos, gracias.'],
  [8, 'Consejos para tu primera partida', 'Habla con todos los personajes y no te apresures. Tus decisiones cambian cómo reaccionan los demás, así que juega con calma.', '¿Vale la pena una segunda partida?', 'Terminé una vez y me quedé con curiosidad. ¿Cambia mucho si juego distinto?', 'Sí, cambia bastante. Te recomiendo probar una forma de jugar muy distinta.', 'Lo voy a intentar este fin de semana.'],
  [9, 'Cómo aprender los jefes sin desesperarte', 'Fíjate en los patrones de cada jefe y repite con calma. Morir es parte de aprender, y cada intento te enseña algo nuevo.', '¿Mejor jugar solo o con un amigo?', 'Me dicen que en pareja es más divertido, pero también más caótico. ¿Qué opinan?', 'En pareja es más divertido, aunque cuesta más coordinarse.', 'Buen dato, buscaré con quién jugarlo.'],
  [10, 'Cómo mejorar tu movimiento', 'Aprende a esquivar y a mantener distancia. Un buen movimiento vale más que mucho daño, sobre todo en las zonas difíciles.', '¿Qué ruta recomiendan al inicio?', 'Me cuesta decidir qué camino tomar. ¿Alguna ruta fácil para aprender?', 'Empieza por la ruta más tranquila para aprender los enemigos.', 'Gracias, ya me sentí más seguro.'],
  [11, 'Ideas para armar un buen mazo', 'No agregues cartas solo porque son fuertes. Un mazo pequeño y coherente suele funcionar mejor que uno enorme sin plan.', '¿Cuándo conviene quitar cartas?', 'Siempre guardo todas mis cartas. ¿Cuándo es mejor eliminar alguna?', 'Quita las básicas cuando ya tengas un plan claro.', 'Con eso mi mazo mejoró bastante.'],
  [12, 'Cómo organizar tu primera fábrica', 'Planifica espacio entre las líneas de producción y no te apresures a ampliar. Una base ordenada te ahorra muchos problemas después.', '¿Cómo evitar que se me llene de cintas?', 'Mi fábrica parece un enredo. ¿Algún consejo para mantener el orden?', 'Dibuja un plano sencillo y deja pasillos entre cada sección.', 'Excelente idea, voy a reorganizar todo.'],
  [13, 'Cómo cuidar a tu colonia', 'Vigila el ánimo de tus colonos y asegura comida y refugio antes de expandirte. Los problemas pequeños se vuelven grandes con rapidez.', '¿Qué colonos conviene elegir al inicio?', 'No sé qué habilidades priorizar al empezar. ¿Qué me recomiendan?', 'Busca variedad: alguien que cultive, alguien que construya y alguien que cure.', 'Buen consejo, lo aplico en mi próxima colonia.'],
  [14, 'Cómo preparar tu primera base', 'Construye cerca de recursos, con un buen refugio y una fogata. Explora de a poco y vuelve a tu base antes de la noche.', '¿Mejor jugar solo o en grupo?', 'Quiero jugarlo con amigos pero no sé si sea más fácil así.', 'En grupo es más fácil y más divertido, se reparten las tareas.', 'Entonces armo un grupo, gracias.'],
  [15, 'Cómo explorar sin quedarte sin oxígeno', 'Vuelve a la superficie antes de que se agote el aire y lleva siempre recursos básicos. Explora de a poco y marca lo que encuentres.', '¿Vale la pena construir una base temprano?', 'No sé si conviene construir pronto o seguir explorando primero.', 'Una base pequeña ayuda mucho, así guardas cosas y descansas.', 'Genial, empiezo a construir ahora.'],
  [16, 'Cómo sobrevivir tus primeros días', 'Recoge comida, prepara una fogata y no te alejes demasiado de tu base. La noche es peligrosa, así que organízate con tiempo.', '¿Cómo reparto las tareas con mi grupo?', 'Somos tres y siempre terminamos haciendo lo mismo. ¿Alguna idea?', 'Asignen roles: uno explora, otro cocina y otro construye.', 'Lo probamos y funcionó mucho mejor.'],
  [17, 'Cómo mejorar tus partidas', 'Muévete constantemente y recoge mejoras sin arriesgarte demasiado. Combinar armas bien es la clave para llegar más lejos.', '¿Qué combinaciones recomiendan?', 'Siempre pierdo a los pocos minutos. ¿Hay combinaciones fáciles para empezar?', 'Empieza con armas de área, son más fáciles de manejar.', 'Con esa combinación duré mucho más.'],
  [18, 'Cómo disfrutar la historia al máximo', 'Lee con calma y explora todas las opciones de diálogo. Cada decisión cambia cómo se desarrolla la investigación.', '¿Qué habilidades conviene priorizar?', 'No sé qué construcción de personaje elegir al empezar.', 'Elige la que más se parezca a tu forma de pensar, todas funcionan.', 'Gracias, ya me animé a empezar.'],
  [19, 'Cómo armar tu grupo ideal', 'Combina distintos roles: alguien que pelee de cerca, alguien a distancia y alguien de apoyo. Así cubres casi cualquier situación.', '¿Qué clase me recomiendan para empezar?', 'Hay muchas opciones y no sé cuál elegir para mi primera partida.', 'Empieza con una clase sencilla para aprender y luego prueba otras.', 'Buena idea, empiezo con algo simple.'],
  [20, 'Consejos para explorar sin frustrarte', 'No pelees con todo. Si un jefe te cuesta, explora otra zona y vuelve más fuerte. El mundo abierto te lo permite.', '¿Qué estilo de combate recomiendan?', 'Voy a empezar y quiero un estilo cómodo para los primeros jefes.', 'A distancia es más cómodo al inicio, pierdes menos vida.', 'Perfecto, voy a probarlo.'],
  [21, 'Cómo resolver los puzles sin ayuda', 'Observa bien la sala antes de actuar y piensa dónde puedes colocar los portales. Casi siempre la solución es más simple de lo que parece.', '¿Se disfruta más en cooperativo?', 'Estoy dudando entre jugarlo solo o con un amigo.', 'En cooperativo hay puzles distintos y es muy divertido.', 'Lo juego con mi amigo entonces.'],
  [22, 'Cómo sobrevivir con tu equipo', 'Manténganse juntos y cubran los costados. Comuniquen cuando se acerque una horda y compartan los objetos de curación.', '¿Qué personaje conviene elegir?', 'Quiero jugar con amigos y no sé a quién elegir.', 'Elige el que te guste más, las diferencias son pequeñas.', 'Listo, ya elegí.'],
  [23, 'Cómo mejorar tu control del auto', 'Practica en solitario antes de jugar partidas. Dominar el control del auto vale más que cualquier truco avanzado.', '¿Cómo mejoro mi puntería?', 'Siento que fallo muchos tiros. ¿Cómo practico mejor?', 'Usa los entrenamientos y repite los mismos tiros varias veces.', 'Practicaré eso todos los días.'],
  [25, 'Cómo mejorar tu ritmo', 'Aprende los patrones de cada nivel y avanza con calma. Una vez que entiendes el recorrido, repetirlo se vuelve más fácil.', '¿Qué opinan de la banda sonora?', 'La música me parece lo mejor del juego. ¿Cuál es su canción favorita?', 'Para mí la música hace que el juego sea especial.', 'Totalmente de acuerdo.'],
  [26, 'Cómo avanzar sin frustrarte', 'Practica cada salto con calma y usa los puntos de guardado con frecuencia. El juego premia la paciencia y la precisión.', '¿Cuál fue su momento favorito?', 'Hay escenas que me emocionaron mucho. ¿Cuál fue la que más recuerdan?', 'Para mí fue la primera vez que se abre una nueva zona.', 'Sí, esa parte es muy bonita.'],
];

const KEYS = Object.keys(USERS);
QUICK.forEach(([id, gt, gb, qt, qb, ans, thanks], i) => {
  const a = KEYS[i % 5];
  const b = KEYS[(i + 1) % 5];
  const c = KEYS[(i + 2) % 5];
  const d = KEYS[(i + 3) % 5];
  // La actividad varía por juego: unos con publicaciones recientes y otros con más días de antigüedad.
  const recent = 1 + (i % 6);
  CONTENT[id] = {
    followers: [a, b, c, d].slice(0, 1 + (i % 4)),
    posts: [
      {
        by: a, tag: 'guia', daysAgo: recent, title: gt, body: gb,
        comments: [{ by: b, text: thanks, hours: recent * 24 - 6 }],
      },
      {
        by: c, tag: 'pregunta', daysAgo: recent + 1 + (i % 3), title: qt, body: qb,
        comments: [{ by: d, text: ans, hours: (recent + 1) * 24 - 10, replies: [{ by: c, text: thanks, hours: (recent + 1) * 24 - 14 }] }],
      },
    ],
  };
});

// Construye todos los documentos a partir de CONTENT.
function build(now) {
  const docs = { users: {}, posts: {}, comments: {}, scores: {}, favorites: {} };
  const iso = (ms) => new Date(ms).toISOString();

  for (const [key, name] of Object.entries(USERS)) {
    docs.users[`seed-${key}`] = {
      uid: `seed-${key}`,
      email: `${name}@ejemplo.guildly`,
      displayName: name,
      createdAt: iso(now - 14 * DAY),
    };
  }

  const addScore = (gameId, key, action) => {
    const id = `${gameId}_seed-${key}`;
    const score = (docs.scores[id] ??= {
      gameId: Number(gameId),
      userId: `seed-${key}`,
      userName: USERS[key],
      points: 0,
      posts: 0,
      comments: 0,
    });
    score.points += POINTS[action];
    score[action === 'post' ? 'posts' : 'comments'] += 1;
  };

  for (const [gameId, game] of Object.entries(CONTENT)) {
    game.posts.forEach((post, i) => {
      const postId = `seed-p-${gameId}-${i + 1}`;
      const postTime = now - post.daysAgo * DAY;
      let commentCount = 0;

      post.comments.forEach((comment, j) => {
        const commentId = `seed-c-${gameId}-${i + 1}-${j + 1}`;
        docs.comments[commentId] = {
          id: commentId, postId, gameId: Number(gameId), text: comment.text,
          authorId: `seed-${comment.by}`, authorName: USERS[comment.by],
          parentId: null, createdAt: iso(now - comment.hours * HOUR),
        };
        addScore(gameId, comment.by, 'comment');
        commentCount += 1;

        (comment.replies || []).forEach((reply, k) => {
          const replyId = `seed-r-${gameId}-${i + 1}-${j + 1}-${k + 1}`;
          docs.comments[replyId] = {
            id: replyId, postId, gameId: Number(gameId), text: reply.text,
            authorId: `seed-${reply.by}`, authorName: USERS[reply.by],
            parentId: commentId, createdAt: iso(now - reply.hours * HOUR),
          };
          addScore(gameId, reply.by, 'comment');
          commentCount += 1;
        });
      });

      docs.posts[postId] = {
        id: postId, gameId: Number(gameId), title: post.title, body: post.body, tag: post.tag,
        authorId: `seed-${post.by}`, authorName: USERS[post.by], commentCount, createdAt: iso(postTime),
      };
      addScore(gameId, post.by, 'post');
    });

    game.followers.forEach((key) => {
      docs.favorites[`seed-${key}_${gameId}`] = {
        userId: `seed-${key}`, gameId: Number(gameId), createdAt: iso(now - 5 * DAY),
      };
    });
  }
  return docs;
}

async function main(args = []) {
  const clear = args.includes('--clear');
  const docs = build(Date.now());
  const jobs = [];

  for (const [collection, items] of Object.entries(docs)) {
    for (const [id, data] of Object.entries(items)) {
      const ref = db.collection(collection).doc(id);
      jobs.push(clear ? ref.delete() : ref.set(data));
    }
  }
  await Promise.all(jobs);

  const counts = Object.entries(docs).map(([name, items]) => `${Object.keys(items).length} ${name}`);
  console.log(`${clear ? 'Borrados' : 'Creados'}: ${counts.join(', ')}.`);
}

module.exports = { main, build };

if (require.main === module) {
  main(process.argv.slice(2))
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('No se pudo completar:', error.message);
      process.exit(1);
    });
}