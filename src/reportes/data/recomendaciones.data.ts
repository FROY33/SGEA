// Mensajes de recomendación personalizados por factor_id y categoría de NE

export const NOMBRES_FACTORES: Record<number, string> = {
  1: 'Profesor',
  2: 'Sobrecarga académica',
  3: 'Creencias sobre rendimiento',
  4: 'Intervenciones en público',
  5: 'Clima social',
  6: 'Exámenes',
  7: 'Valor de los contenidos',
  8: 'Dificultad de participación',
};

type Categoria = 'Bajo' | 'Medio' | 'Alto';

export const RECOMENDACIONES_POR_FACTOR: Record<number, Record<Categoria, string[]>> = {
  1: {
    Bajo: [
      'Tu relación con los profesores parece estar en buen punto. Aprovecha para hacer preguntas cuando lo necesites.',
    ],
    Medio: [
      'Si algo de la dinámica con tus profesores te incomoda, considera hablarlo en horario de asesoría.',
      'Acercarte a tus profesores para aclarar dudas puede ayudar a reducir esta tensión.',
    ],
    Alto: [
      'La relación con tus profesores está generando bastante tensión. Buscar una conversación directa o apoyo de un tutor puede ayudarte.',
      'Si sientes que la dinámica con los docentes es muy pesada, el departamento de tutorías puede mediar.',
    ],
  },
  2: {
    Bajo: [
      'Manejas bien tu carga académica. Sigue organizando tus tiempos como lo has hecho.',
    ],
    Medio: [
      'Intenta dividir tus pendientes en bloques pequeños usando un calendario o lista de tareas.',
      'Prioriza tus actividades por fecha límite para evitar acumulación de trabajo.',
    ],
    Alto: [
      'Tu carga académica está muy alta. Considera hablar con tus profesores sobre extensiones o replantear tu carga de materias.',
      'Es momento de pedir ayuda para organizar tu tiempo: un tutor académico puede ayudarte a priorizar.',
    ],
  },
  3: {
    Bajo: [
      'Tienes una percepción saludable de tu rendimiento. Sigue reconociendo tus logros.',
    ],
    Medio: [
      'Compara tu progreso con tus propias metas, no con el de otros compañeros.',
      'Reconoce los avances pequeños, no solo el resultado final.',
    ],
    Alto: [
      'Pareces tener expectativas muy exigentes contigo mismo. Hablar con un psicólogo educativo puede ayudarte a replantear esas creencias.',
      'Sentir que no rindes lo suficiente es común, pero si te agobia, busca apoyo psicopedagógico.',
    ],
  },
  4: {
    Bajo: [
      'Te sientes cómodo hablando en público, una habilidad muy valiosa. Sigue practicándola.',
    ],
    Medio: [
      'Practicar tus presentaciones frente a un amigo o grabándote puede darte más confianza.',
      'Técnicas de respiración antes de exponer pueden ayudarte a sentirte más seguro.',
    ],
    Alto: [
      'Hablar en público te genera mucha ansiedad. Considera talleres de oratoria o apoyo psicológico para trabajar esto gradualmente.',
      'Empieza exponiendo en grupos pequeños para ganar confianza poco a poco.',
    ],
  },
  5: {
    Bajo: [
      'Tienes una buena relación con tus compañeros. Ese ambiente social es un soporte importante.',
    ],
    Medio: [
      'Buscar más espacios de convivencia con tu equipo puede mejorar el ambiente de trabajo.',
      'Si hay tensión con algún compañero, una conversación directa suele ayudar a resolverlo.',
    ],
    Alto: [
      'El ambiente con tus compañeros está afectándote bastante. Hablar con tu equipo sobre cómo se sienten todos puede abrir el diálogo.',
      'Si el conflicto persiste, acercarte a un mediador o tutor de grupo puede ser de ayuda.',
    ],
  },
  6: {
    Bajo: [
      'Los exámenes no parecen generarte mucha ansiedad. Sigue con tu método de preparación.',
    ],
    Medio: [
      'Repasar con anticipación y hacer simulacros puede reducir el nerviosismo antes del examen.',
      'Técnicas de respiración antes de entrar al examen pueden ayudarte a calmarte.',
    ],
    Alto: [
      'Los exámenes te generan mucha ansiedad. Practicar técnicas de manejo de estrés antes de la prueba puede ser de gran ayuda.',
      'Considera hablar con un psicólogo sobre estrategias para la ansiedad ante exámenes; es algo muy común y tratable.',
    ],
  },
  7: {
    Bajo: [
      'Encuentras valor en tus materias actuales. Eso facilita mucho tu motivación para estudiar.',
    ],
    Medio: [
      'Buscar la aplicación práctica de lo que estudias puede ayudarte a conectar más con el contenido.',
      'Hablar con tu profesor sobre cómo se aplica el contenido en la vida real puede darte más motivación.',
    ],
    Alto: [
      'Sientes que el contenido no te aporta valor, lo cual puede afectar tu motivación. Explora cómo se conecta con tus metas profesionales.',
      'Si una materia se siente irrelevante, buscar mentoría académica puede ayudarte a encontrarle sentido o replantear tu trayectoria.',
    ],
  },
  8: {
    Bajo: [
      'Sientes que tienes buen control sobre cómo se desarrollan tus clases. Aprovecha ese margen de participación.',
    ],
    Medio: [
      'Si quieres más voz en la dinámica de tus clases, proponer ideas a tu profesor puede abrir ese espacio.',
      'Buscar espacios donde puedas opinar sobre la metodología puede ayudarte a sentir más control.',
    ],
    Alto: [
      'Sientes muy poco control sobre cómo se desarrollan tus clases. Hablar con el profesor o coordinación académica puede abrir espacio para tu participación.',
      'La falta de voz en tus clases te está afectando. Buscar representación estudiantil o espacios de retroalimentación puede ayudar.',
    ],
  },
};

export const MENSAJES_GENERALES: Record<Categoria, string[]> = {
  Bajo: [
    '¡Excelente! Tu nivel de estrés está bajo control. Sigue así.',
    '¡Vas muy bien! Mantén tus hábitos de estudio saludables.',
  ],
  Medio: [
    'Tu estrés es manejable. Recuerda tomar descansos regulares.',
    'Vas bien, pero considera organizar mejor tus tiempos de estudio.',
  ],
  Alto: [
    'Tu nivel de estrés es alto. Considera hablar con un orientador.',
    'Es importante que busques apoyo. No enfrentes esto solo.',
  ],
};