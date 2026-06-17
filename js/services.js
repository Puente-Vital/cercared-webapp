window.CercaRedServices = [
  //Aqui comienza lo de pension 65
  {
    id: "pension-65",
    name: "Pensión 65",
    entity: "MIDIS - Ministerio de Desarrollo e Inclusión Social",
    shortEntity: "MIDIS",
    category: "Adulto mayor",
    description:
      "Programa de protección social a cargo del MIDIS que otorga una subvención económica bimestral de S/ 350 a adultos mayores de 65 años que se encuentren en situación de pobreza extrema.",
    shortDescription:
      "Subvención económica bimestral de S/ 350 para adultos mayores de 65 años en situación de pobreza extrema.",
    keywords: ["adulto mayor", "pensión", "dinero", "subvención", "economía"],
    district: "Nacional",
    modality: "Presencial",
    attention: "Presencial / Online",
    scope: "Nacional",
    cost: "Gratuito",
    officialUrl: "https://www.gob.pe/pension65",
    simple: {
      about:
        "El Estado te da S/ 350 cada dos meses si tienes 65 años o más y vives en situación de pobreza extrema. No necesitas pagar nada para recibirlo.",
      facts: [
        { label: "Entidad que lo da", value: "MIDIS" },
        { label: "Tipo", value: "Apoyo económico" },
        { label: "Costo", value: "Completamente gratuito", highlight: true },
        { label: "Cómo se atiende", value: "Presencial y online" },
      ],
      needs: [
        "Tener 65 años o más (con DNI vigente)",
        "Estar registrado como pobre extremo en el SISFOH",
        "No tener pensión del Estado (ONP, AFP u otro)",
      ],
      doSteps: [
        "Revisar en SISFOH si estás clasificado como pobre extremo.",
        "Ir a la oficina de Pensión 65 o a tu municipalidad con tu DNI.",
        "El funcionario registra tus datos y verifica que cumples.",
        "Te avisarán cuando empieces a recibir el pago.",
      ],
      places: [
        { title: "Oficina Pensión 65 — Lima Centro", description: "Jr. Carabaya 341 · Lunes a viernes, 8am a 5pm" },
        { title: "Teléfono gratuito: 0800-10828", description: "Lunes a viernes de 8am a 8pm · Sin costo" },
      ],
    },
    requirements: [
      {
        title: "Tener 65 años o más",
        description: "Acreditar edad con DNI vigente del titular.",
      },
      {
        title: "Estar en pobreza extrema",
        description:
          "El SISFOH debe calificarte como pobre extremo en el padrón general de hogares.",
      },
      {
        title: "No recibir pensión del Estado",
        description:
          "No pertenecer a ningún régimen de pensiones contributivo (ONP, AFP u otro).",
      },
    ],
    documents: [
      {
        title: "DNI físico o copia del DNI",
        description: "Documento del adulto mayor que solicita la afiliación.",
      },
      {
        title: "Formulario 1000 - Declaración Jurada",
        description:
          "Formato firmado o con huella dactilar para solicitar la afiliación al programa.",
      },
      {
        title: "Clasificación SISFOH",
        description:
          "El hogar debe contar con clasificación socioeconómica de pobreza extrema.",
      },
    ],
    steps: [
      {
        title: "Verifica si cumples los requisitos",
        description:
          "Revisa edad, clasificación SISFOH y si recibes o no otra pensión.",
      },
      {
        title: "Prepara tus documentos",
        description: "Ten listo tu DNI y el Formulario 1000.",
      },
      {
        title: "Presenta la solicitud",
        description:
          "Puedes acudir a una oficina de Pensión 65 o a la municipalidad de tu distrito.",
      },
      {
        title: "Espera la evaluación",
        description:
          "La entidad revisa la información y valida si corresponde la afiliación.",
      },
      {
        title: "Consulta el estado",
        description:
          "Puedes verificar si ya estás afiliado ingresando tu DNI en el servicio oficial.",
        highlight: true,
      },
    ],
    procedures: [
      {
        value: "municipalidad-san-martin",
        label: "Municipalidad provincial de San Martin",
      },
      {
        value: "municipalidad-lima",
        label: "Municipalidad Metropolitana de Lima",
      },
    ],
    channels: [
      {
        title: "Oficina Pensión 65 - Lima Centro",
        description: "Jr. Carabaya 341, Cercado de Lima · Lun-Vie 8am-5pm",
      },
      {
        title: "Plataforma de Atención al Ciudadano",
        description: "www.pension65.gob.pe · Consultas y trámites en línea",
      },
      {
        title: "Whatsapp",
        description: "942 962 116 · Lunes a viernes 8am a 5pm",
      },
    ],
  },
    //Aqui comienza lo de SIS
{
    id: "sis-gratuito",
    name: "SIS Gratuito",
    entity: "MINSA - Ministerio de Salud",
    shortEntity: "MINSA",
    category: "Salud",
    description: "Seguro público de salud dirigido a personas en situación de pobreza o pobreza extrema que no cuentan con otro seguro de salud activo. Financia atenciones médicas, medicamentos, cirugías y emergencias.",
    shortDescription: "Seguro público de salud dirigido a personas en situación de pobreza o pobreza extrema que no cuentan con otro seguro.",
    keywords: ["salud", "seguro", "médico", "hospital", "minsa", "gratis", "sis"],
    district: "Nacional",
    modality: "Mixta",
    attention: "Presencial / Virtual",
    scope: "Nacional",
    cost: "Gratuito",
    officialUrl: "https://www.gob.pe/sis",
    simple: {
      about:
        "Un seguro de salud gratuito del Estado para que puedas atenderte en hospitales y centros de salud públicos si no tienes otro seguro.",
      facts: [
        { label: "Entidad que lo da", value: "MINSA" },
        { label: "Tipo", value: "Salud" },
        { label: "Costo", value: "Completamente gratuito", highlight: true },
        { label: "Cómo se atiende", value: "Presencial y virtual" },
      ],
      needs: [
        "No tener otro seguro de salud",
        "Estar registrado como pobre o pobre extremo en el SISFOH",
        "Tener tu DNI vigente",
      ],
      doSteps: [
        "Verifica tu clasificación en el SISFOH.",
        "Lleva tu DNI al centro de salud más cercano.",
        "Pide la afiliación en la ventanilla de Admisión.",
        "Consulta en línea si ya quedaste afiliado.",
      ],
      places: [
        { title: "Centros de Salud y Hospitales MINSA", description: "Acércate al más cercano a tu domicilio" },
        { title: "Línea gratuita Infosalud: 0800-10828", description: "Atención para consultas del SIS" },
      ],
    },
    requirements: [
      {
        title: "No contar con otro seguro",
        description: "No debes estar afiliado a EsSalud, ni a seguros privados o de las Fuerzas Armadas."
      },
      {
        title: "Condición socioeconómica",
        description: "El hogar debe estar calificado como pobre o pobre extremo en el Padrón General de Hogares (SISFOH)."
      },
      {
        title: "Documento de Identidad",
        description: "Contar con DNI vigente o Carné de Extranjería con residencia en el país."
      }
    ],
    documents: [
      {
        title: "DNI del titular",
        description: "Documento nacional de identidad original y vigente de la persona que recibirá el seguro."
      },
      {
        title: "DNI del apoderado",
        description: "Requerido únicamente si el trámite lo realiza un familiar o intermediario a nombre del titular."
      },
      {
        title: "Formato de Afiliación (FUA)",
        description: "No requiere llenado previo; la entidad de salud lo emite de forma gratuita durante la atención."
      }
    ],
    steps: [
      {
        title: "Verifica tu clasificación SISFOH",
        description: "Asegúrate de aparecer en el sistema como pobre o pobre extremo antes de ir al centro médico."
      },
      {
        title: "Prepara tus documentos",
        description: "Lleva tu DNI en físico. Si vas a afiliar a tu hijo o familiar, lleva también el DNI de ellos."
      },
      {
        title: "Acude al centro de salud",
        description: "Dirígete al establecimiento de salud (posta u hospital) más cercano al domicilio registrado en tu DNI."
      },
      {
        title: "Solicita la afiliación en Admisión",
        description: "Pide el alta en la ventanilla. El personal verificará tus datos y te entregará el formato FUA firmado."
      },
      {
        title: "Consulta el estado en línea",
        description: "Puedes comprobar que tu seguro ya está 'Activo' ingresando tu número de DNI en el portal digital oficial.",
        highlight: true
      }
    ],
    procedures: [
      {
        value: "centro-salud-local",
        label: "Centros de salud cercanos a tu distrito"
      }
    ],
    channels: [
      {
        title: "Centros de Salud y Hospitales MINSA",
        description: "Atención a nivel nacional según tu cercanía."
      },
      {
        title: "Consulta de Afiliación Digital",
        description: "www.gob.pe/sis - Verificación inmediata las 24 horas."
      },
      {
        title: "Línea Gratuita e Infosalud",
        description: "Llama al 113 (Opción 4) o escribe al WhatsApp SIS: 941 986 682."
      }
    ]
  },
  //Aqui comienza lo de beca 18
  {
    id: "beca-18",
    name: "Beca 18",
    entity: "PRONABEC - Programa Nacional de Becas",
    shortEntity: "PRONABEC",
    category: "Educación",
    description: "Beca integral de educación superior para jóvenes de alto rendimiento académico y escasos recursos económicos o en situación de vulnerabilidad. Cubre matrícula, pensión, laptop, alimentación y movilidad.",
    shortDescription: "Beca integral de educación superior para jóvenes con alto rendimiento y bajos recursos.",
    keywords: ["beca", "universidad", "estudios", "pronabec", "instituto", "educación"],
    district: "Nacional",
    modality: "Virtual",
    attention: "Virtual",
    scope: "Nacional",
    cost: "Gratuito",
    officialUrl: "https://www.pronabec.gob.pe/beca-18/",
    simple: {
      about:
        "Una beca que paga tus estudios superiores completos si eres joven con buenas notas y pocos recursos. No pagas nada por estudiar.",
      facts: [
        { label: "Entidad que lo da", value: "PRONABEC" },
        { label: "Tipo", value: "Educación" },
        { label: "Costo", value: "Completamente gratuito", highlight: true },
        { label: "Cómo se atiende", value: "Virtual" },
      ],
      needs: [
        "Tener buen rendimiento académico",
        "Estar registrado como pobre o pobre extremo",
        "Lograr ingreso a una institución elegible",
      ],
      doSteps: [
        "Revisa si cumples los requisitos.",
        "Rinde el Examen Nacional de Preselección.",
        "Postula e ingresa a una institución elegible.",
        "Postula a la beca y revisa los resultados.",
      ],
      places: [
        { title: "Plataforma virtual PRONABEC", description: "www.pronabec.gob.pe · Postulación en línea" },
        { title: "Orientación al postulante", description: "Consultas sobre la beca y el proceso" },
      ],
    },
    requirements: [
      {
        title: "Alto rendimiento académico",
        description: "Pertenecer al tercio o medio superior en los últimos años de la educación secundaria."
      },
      {
        title: "Condición socioeconómica",
        description: "Clasificación de pobreza o pobreza extrema según el SISFOH, o pertenecer a poblaciones vulnerables."
      },
      {
        title: "Ingreso a una institución",
        description: "Haber ingresado a una universidad o instituto elegible por el PRONABEC."
      }
    ],
    documents: [
      {
        title: "DNI original",
        description: "Documento Nacional de Identidad escaneado del postulante."
      },
      {
        title: "Certificado de estudios",
        description: "Documento oficial que acredite las notas de la educación secundaria."
      },
      {
        title: "Constancia de ingreso",
        description: "Documento emitido por la institución de educación superior elegible."
      }
    ],
    steps: [
      {
        title: "Verifica los requisitos",
        description: "Revisa las bases de la convocatoria actual en la web de PRONABEC."
      },
      {
        title: "Rinde el Examen Nacional",
        description: "Inscríbete y participa en el Examen Nacional de Preselección (ENP)."
      },
      {
        title: "Postula a una institución",
        description: "Si eres preseleccionado, postula e ingresa a una universidad o instituto elegible."
      },
      {
        title: "Postula a la beca",
        description: "Sube tu constancia de ingreso y documentos al Módulo de Postulación Electrónica (SIBEC)."
      },
      {
        title: "Revisa los resultados",
        description: "Verifica la lista de seleccionados y acepta la beca en el sistema.",
        highlight: true
      }
    ],
    procedures: [
      {
        value: "plataforma-sibec",
        label: "Plataforma virtual SIBEC"
      }
    ],
    channels: [
      {
        title: "Plataforma SIBEC",
        description: "Postulación 100% virtual a través del portal de PRONABEC."
      },
      {
        title: "Línea gratuita",
        description: "0800-00018 para consultas a nivel nacional."
      },
      {
        title: "WhatsApp PRONABEC",
        description: "966 429 596 para orientación rápida."
      }
    ]
  },
  //Aqui comienza lo de techo propio
  {
    id: "techo-propio",
    name: "Techo Propio",
    entity: "Fondo MIVIVIENDA",
    shortEntity: "MIVIVIENDA",
    category: "Vivienda",
    description: "Programa dirigido a familias con ingresos menores a S/ 3,715 para que puedan comprar, construir o mejorar su vivienda mediante el Bono Familiar Habitacional (BFH).",
    shortDescription: "Bono económico para comprar, construir o mejorar una vivienda familiar.",
    keywords: ["casa", "vivienda", "bono", "terreno", "construcción", "mivivienda"],
    district: "Nacional",
    modality: "Presencial",
    attention: "Presencial",
    scope: "Nacional",
    cost: "Gratuito",
    officialUrl: "https://www.mivivienda.com.pe/PORTALWEB/usuario-busca-viviendas/pagina.aspx?idpage=14",
    simple: {
      about:
        "Un bono del Estado que te ayuda con dinero para comprar, construir o mejorar tu casa si tu familia tiene pocos ingresos.",
      facts: [
        { label: "Entidad que lo da", value: "MIVIVIENDA" },
        { label: "Tipo", value: "Vivienda" },
        { label: "Costo", value: "Completamente gratuito", highlight: true },
        { label: "Cómo se atiende", value: "Presencial" },
      ],
      needs: [
        "Formar un grupo familiar",
        "No pasar el límite de ingresos",
        "No tener otra propiedad",
      ],
      doSteps: [
        "Inscribe a tu familia en el programa.",
        "Espera la evaluación de tus datos.",
        "Elige tu vivienda y aporta tu ahorro.",
        "Recibe el Bono Familiar Habitacional.",
      ],
      places: [
        { title: "Entidades Técnicas autorizadas", description: "Te ayudan con la inscripción y la vivienda" },
        { title: "Fondo MIVIVIENDA", description: "www.mivivienda.com.pe · Información del bono" },
      ],
    },
    requirements: [
      {
        title: "Conformar un Grupo Familiar",
        description: "Debe estar conformado por un Jefe de Familia que declarará a uno o más dependientes (esposa, hijos, hermanos, etc.)."
      },
      {
        title: "Límite de ingresos",
        description: "El ingreso familiar mensual no debe exceder los S/ 3,715 para compra, o S/ 2,706 para construcción."
      },
      {
        title: "No tener propiedades",
        description: "No ser propietario ni copropietario de otra vivienda o terreno a nivel nacional."
      }
    ],
    documents: [
      {
        title: "DNI de los integrantes",
        description: "DNI original y copia del titular y de todos los miembros del grupo familiar."
      },
      {
        title: "Sustento de ingresos",
        description: "Boletas de pago o declaración jurada de ingresos."
      },
      {
        title: "Título de propiedad (Solo Construcción)",
        description: "Si postulas para construir, debes presentar el título del terreno a tu nombre."
      }
    ],
    steps: [
      {
        title: "Inscribe a tu familia",
        description: "Acude a una oficina del Fondo MIVIVIENDA, Municipio o Centro Autorizado para registrar a tu Grupo Familiar."
      },
      {
        title: "Evaluación de datos",
        description: "El Fondo MIVIVIENDA verificará en SUNARP y otras entidades que cumplas con los requisitos."
      },
      {
        title: "Elige tu vivienda",
        description: "Busca un proyecto inmobiliario registrado en Techo Propio si vas a comprar."
      },
      {
        title: "Aporta tu ahorro",
        description: "Abre una cuenta y deposita el ahorro mínimo exigido según el valor de la vivienda."
      },
      {
        title: "Recibe el Bono",
        description: "Una vez completado el trámite con la entidad financiera o constructor, se desembolsará el Bono Familiar Habitacional.",
        highlight: true
      }
    ],
    procedures: [
      {
        value: "centros-autorizados",
        label: "Centros Autorizados a nivel nacional"
      }
    ],
    channels: [
      {
        title: "Vitrina Inmobiliaria",
        description: "Jr. Camaná 199, Lima Cercado. Atención presencial."
      },
      {
        title: "Línea gratuita",
        description: "Llama al 0800-12-200 desde cualquier parte del país."
      },
      {
        title: "Buscador web",
        description: "Proyectos disponibles en www.mivivienda.com.pe"
      }
    ]
  },
  //Aqui comienza lo de Qali Warma
  {
    id: "qali-warma",
    name: "Qali Warma",
    entity: "MIDIS - Ministerio de Desarrollo e Inclusión Social",
    shortEntity: "MIDIS",
    category: "Social",
    description:
      "Programa Nacional de Alimentación Escolar a cargo del MIDIS que brinda raciones y desayunos a niñas, niños y adolescentes matriculados en instituciones educativas públicas de inicial, primaria y secundaria, para mejorar su atención y rendimiento en clase.",
    shortDescription:
      "Alimentación escolar gratuita para estudiantes de instituciones educativas públicas.",
    keywords: ["alimentación", "escolar", "comida", "desayuno", "colegio", "niños", "qali warma", "midis"],
    district: "Nacional",
    modality: "Presencial",
    attention: "Presencial",
    scope: "Nacional",
    cost: "Gratuito",
    officialUrl: "https://www.gob.pe/qaliwarma",
    simple: {
      about:
        "El Estado da desayunos y almuerzos gratis a los estudiantes de colegios públicos para que aprendan mejor alimentados.",
      facts: [
        { label: "Entidad que lo da", value: "MIDIS" },
        { label: "Tipo", value: "Alimentación" },
        { label: "Costo", value: "Completamente gratuito", highlight: true },
        { label: "Cómo se atiende", value: "Presencial" },
      ],
      needs: [
        "Estar matriculado en un colegio público",
        "Ser de inicial, primaria o secundaria",
        "Que el colegio esté afiliado",
      ],
      doSteps: [
        "Verifica si el colegio está afiliado.",
        "Matricula al estudiante en el colegio público.",
        "El colegio gestiona la afiliación.",
        "Consulta al comité de alimentación escolar.",
      ],
      places: [
        { title: "Tu institución educativa pública", description: "El colegio gestiona el servicio" },
        { title: "Plataforma Qali Warma", description: "www.gob.pe/qaliwarma · Información del programa" },
      ],
    },
    requirements: [
      {
        title: "Estar matriculado en colegio público",
        description:
          "El estudiante debe estar matriculado en una institución educativa pública afiliada al programa.",
      },
      {
        title: "Nivel inicial, primaria o secundaria",
        description:
          "El programa atiende a estudiantes de educación inicial, primaria y secundaria de la red pública.",
      },
    ],
    documents: [
      {
        title: "Constancia de matrícula",
        description:
          "Documento emitido por la institución educativa que acredita la matrícula vigente del estudiante.",
      },
      {
        title: "DNI del estudiante",
        description:
          "Documento de identidad del menor, de contar con él, para el registro en la institución.",
      },
    ],
    steps: [
      {
        title: "Verifica si el colegio está afiliado",
        description:
          "Confirma que la institución educativa pública forme parte del programa Qali Warma.",
      },
      {
        title: "Matricula al estudiante",
        description:
          "Realiza la matrícula en la institución educativa pública correspondiente.",
      },
      {
        title: "El colegio gestiona la afiliación",
        description:
          "La institución educativa coordina directamente con Qali Warma la entrega de las raciones.",
      },
      {
        title: "Consulta el comité de alimentación",
        description:
          "Puedes verificar la información del Comité de Alimentación Escolar (CAE) en el colegio.",
        highlight: true,
      },
    ],
    procedures: [
      {
        value: "institucion-educativa",
        label: "Institución educativa pública del estudiante",
      },
    ],
    channels: [
      {
        title: "Sede Qali Warma Lima",
        description: "Av. Paseo de la República 3101, San Isidro · Lun-Vie 8:30am-5pm",
      },
      {
        title: "Plataforma de Atención al Ciudadano",
        description: "www.gob.pe/qaliwarma · Consultas en línea",
      },
      {
        title: "Línea Qali Warma",
        description: "0800-00-700 · Lunes a viernes 8:30am a 5pm",
      },
    ],
  },
  //Aqui comienza lo de Programa Juntos
  {
    id: "juntos",
    name: "Programa Juntos",
    entity: "MIDIS - Ministerio de Desarrollo e Inclusión Social",
    shortEntity: "MIDIS",
    category: "Social",
    description:
      "Programa Nacional de Apoyo Directo a los Más Pobres a cargo del MIDIS que entrega un incentivo económico bimestral a hogares en situación de pobreza, condicionado al cumplimiento de controles de salud y a la asistencia escolar de los menores del hogar.",
    shortDescription:
      "Incentivo económico bimestral para hogares en pobreza con gestantes, niños o adolescentes.",
    keywords: ["dinero", "subvención", "pobreza", "hogar", "familia", "incentivo", "juntos", "midis"],
    district: "Nacional",
    modality: "Presencial",
    attention: "Presencial / Online",
    scope: "Nacional",
    cost: "Gratuito",
    officialUrl: "https://www.gob.pe/juntos",
    simple: {
      about:
        "El Estado entrega dinero cada dos meses a hogares pobres que tienen gestantes, niños o adolescentes, para apoyar su salud y educación.",
      facts: [
        { label: "Entidad que lo da", value: "MIDIS" },
        { label: "Tipo", value: "Apoyo económico" },
        { label: "Costo", value: "Completamente gratuito", highlight: true },
        { label: "Cómo se atiende", value: "Presencial y online" },
      ],
      needs: [
        "Ser un hogar en situación de pobreza",
        "Tener gestantes, niños o adolescentes",
        "Cumplir los compromisos de salud y educación",
      ],
      doSteps: [
        "Verifica si cumples los requisitos.",
        "Prepara tus documentos y preséntalos.",
        "Espera la evaluación del programa.",
        "Cumple los compromisos de salud y educación.",
      ],
      places: [
        { title: "Oficinas del Programa Juntos", description: "Atención en tu región" },
        { title: "Plataforma Juntos", description: "www.gob.pe/juntos · Información y consultas" },
      ],
    },
    requirements: [
      {
        title: "Hogar en situación de pobreza",
        description:
          "El SISFOH debe calificar al hogar dentro de los criterios de pobreza establecidos.",
      },
      {
        title: "Contar con miembros priorizados",
        description:
          "Tener gestantes, niñas, niños o adolescentes dentro del grupo familiar.",
      },
      {
        title: "Cumplir corresponsabilidades",
        description:
          "Asistir a los controles de salud y mantener la asistencia escolar de los menores.",
      },
    ],
    documents: [
      {
        title: "DNI físico o copia del DNI",
        description:
          "Documento de la jefa o jefe de hogar y de los miembros del grupo familiar.",
      },
      {
        title: "Clasificación SISFOH",
        description:
          "Constancia de clasificación socioeconómica de pobreza del hogar.",
      },
      {
        title: "Partidas de nacimiento",
        description:
          "De los menores integrantes del hogar, de ser requerido para el registro.",
      },
    ],
    steps: [
      {
        title: "Verifica si cumples los requisitos",
        description:
          "Revisa la clasificación socioeconómica de tu hogar y los miembros priorizados.",
      },
      {
        title: "Prepara tus documentos",
        description: "Ten listo tu DNI y la constancia de clasificación SISFOH.",
      },
      {
        title: "Presenta la solicitud",
        description:
          "Acércate a la Unidad Local de Empadronamiento o a la municipalidad de tu distrito.",
      },
      {
        title: "Espera la evaluación",
        description:
          "La entidad valida el cumplimiento de los criterios de afiliación del hogar.",
      },
      {
        title: "Cumple las corresponsabilidades",
        description:
          "Asiste a los controles de salud y mantén la asistencia escolar para recibir el incentivo.",
        highlight: true,
      },
    ],
    procedures: [
      {
        value: "unidad-local-empadronamiento",
        label: "Unidad Local de Empadronamiento de tu distrito",
      },
    ],
    channels: [
      {
        title: "Unidad Territorial Juntos",
        description: "Consulta la sede más cercana en tu municipalidad provincial.",
      },
      {
        title: "Plataforma de Atención al Ciudadano",
        description: "www.gob.pe/juntos · Consultas y trámites en línea",
      },
      {
        title: "Whatsapp",
        description: "947 384 124 · Lunes a viernes 8am a 5pm",
      },
    ],
  },
  //Aqui comienza lo de Cuna Más
  {
    id: "cuna-mas",
    name: "Cuna Más",
    entity: "MIDIS - Ministerio de Desarrollo e Inclusión Social",
    shortEntity: "MIDIS",
    category: "Social",
    description:
      "Programa Nacional Cuna Más a cargo del MIDIS que brinda atención integral a niñas y niños menores de 36 meses en situación de pobreza o pobreza extrema, mediante el cuidado diurno y el acompañamiento a familias para favorecer su desarrollo infantil temprano.",
    shortDescription:
      "Cuidado y desarrollo infantil para niñas y niños menores de 3 años en situación de pobreza.",
    keywords: ["niños", "bebé", "cuidado", "guardería", "desarrollo infantil", "cuna más", "midis"],
    district: "Nacional",
    modality: "Presencial",
    attention: "Presencial",
    scope: "Nacional",
    cost: "Gratuito",
    officialUrl: "https://www.gob.pe/cunamas",
    simple: {
      about:
        "El Estado cuida y apoya el desarrollo de tus hijos menores de 3 años si tu hogar está en situación de pobreza. Es un servicio gratuito.",
      facts: [
        { label: "Entidad que lo da", value: "MIDIS" },
        { label: "Tipo", value: "Cuidado infantil" },
        { label: "Costo", value: "Completamente gratuito", highlight: true },
        { label: "Cómo se atiende", value: "Presencial" },
      ],
      needs: [
        "Tener un niño menor de 36 meses",
        "Ser un hogar en situación de pobreza",
        "Vivir en zona donde hay el servicio",
      ],
      doSteps: [
        "Verifica si cumples los requisitos.",
        "Prepara tus documentos.",
        "Acércate al servicio Cuna Más más cercano.",
        "Espera la evaluación e inicia la atención.",
      ],
      places: [
        { title: "Servicios Cuna Más", description: "Atención en tu comunidad" },
        { title: "Plataforma Cuna Más", description: "www.gob.pe/cunamas · Información del servicio" },
      ],
    },
    requirements: [
      {
        title: "Tener un menor de 36 meses",
        description:
          "El servicio atiende a niñas y niños desde los 6 hasta los 36 meses de edad.",
      },
      {
        title: "Hogar en situación de pobreza",
        description:
          "El SISFOH debe calificar al hogar dentro de los criterios de focalización del programa.",
      },
      {
        title: "Residir en zona de cobertura",
        description:
          "El hogar debe ubicarse en un distrito donde el programa tenga servicio disponible.",
      },
    ],
    documents: [
      {
        title: "DNI físico o copia del DNI",
        description:
          "Documento de la madre, padre o apoderado responsable del menor.",
      },
      {
        title: "Partida de nacimiento del menor",
        description: "Documento que acredite la edad del niño o niña.",
      },
      {
        title: "Clasificación SISFOH",
        description:
          "Constancia de clasificación socioeconómica del hogar.",
      },
    ],
    steps: [
      {
        title: "Verifica si cumples los requisitos",
        description:
          "Revisa la edad del menor y la clasificación socioeconómica del hogar.",
      },
      {
        title: "Prepara tus documentos",
        description:
          "Ten listo tu DNI, la partida de nacimiento del menor y la constancia SISFOH.",
      },
      {
        title: "Acércate al servicio más cercano",
        description:
          "Consulta el Comité de Gestión o Centro Infantil de Atención Integral de tu zona.",
      },
      {
        title: "Espera la evaluación",
        description:
          "La entidad valida el cumplimiento de los requisitos de acceso al servicio.",
      },
      {
        title: "Inicia la atención",
        description:
          "Una vez aprobado, el menor inicia las sesiones de cuidado y desarrollo infantil.",
        highlight: true,
      },
    ],
    procedures: [
      {
        value: "centro-infantil-local",
        label: "Centro Infantil de Atención Integral de tu zona",
      },
    ],
    channels: [
      {
        title: "Sede Cuna Más Lima",
        description: "Av. Paseo de la República 3101, San Isidro · Lun-Vie 8:30am-5pm",
      },
      {
        title: "Plataforma de Atención al Ciudadano",
        description: "www.gob.pe/cunamas · Consultas en línea",
      },
      {
        title: "Whatsapp",
        description: "989 311 988 · Lunes a viernes 8:30am a 5pm",
      },
    ],
  },
  //Aqui comienza lo de Contigo
  {
    id: "contigo",
    name: "Contigo",
    entity: "MIDIS - Ministerio de Desarrollo e Inclusión Social",
    shortEntity: "MIDIS",
    category: "Social",
    description:
      "Programa de Pensión no Contributiva a cargo del MIDIS que otorga una subvención económica bimestral a personas con discapacidad severa en situación de pobreza, que no perciben ingreso ni pensión de otra entidad pública o privada.",
    shortDescription:
      "Pensión bimestral para personas con discapacidad severa en situación de pobreza.",
    keywords: ["discapacidad", "pensión", "subvención", "dinero", "contigo", "midis", "conadis"],
    district: "Nacional",
    modality: "Presencial",
    attention: "Presencial / Online",
    scope: "Nacional",
    cost: "Gratuito",
    officialUrl: "https://www.gob.pe/contigo",
    simple: {
      about:
        "Una pensión que el Estado entrega cada dos meses a personas con discapacidad severa que viven en situación de pobreza.",
      facts: [
        { label: "Entidad que lo da", value: "MIDIS" },
        { label: "Tipo", value: "Apoyo económico" },
        { label: "Costo", value: "Completamente gratuito", highlight: true },
        { label: "Cómo se atiende", value: "Presencial y online" },
      ],
      needs: [
        "Tener discapacidad severa certificada",
        "Estar en situación de pobreza",
        "No recibir otra pensión o ingreso",
      ],
      doSteps: [
        "Verifica si cumples los requisitos.",
        "Prepara tus documentos y preséntalos.",
        "Espera la evaluación del programa.",
        "Consulta el estado de tu solicitud.",
      ],
      places: [
        { title: "Oficinas del Programa Contigo", description: "Atención en tu región" },
        { title: "Plataforma Contigo", description: "www.gob.pe/contigo · Información y consultas" },
      ],
    },
    requirements: [
      {
        title: "Tener discapacidad severa",
        description:
          "Contar con certificado de discapacidad severa emitido por una entidad autorizada.",
      },
      {
        title: "Estar en situación de pobreza",
        description:
          "El SISFOH debe calificar al hogar como pobre o pobre extremo en el padrón general de hogares.",
      },
      {
        title: "No recibir otra pensión o ingreso",
        description:
          "No percibir remuneración, pensión u otro ingreso permanente de una entidad pública o privada.",
      },
    ],
    documents: [
      {
        title: "DNI físico o copia del DNI",
        description:
          "Documento de la persona con discapacidad que solicita la afiliación.",
      },
      {
        title: "Certificado de discapacidad",
        description:
          "Documento que acredite el grado de discapacidad severa de la persona.",
      },
      {
        title: "Clasificación SISFOH",
        description:
          "Constancia de clasificación socioeconómica del hogar.",
      },
    ],
    steps: [
      {
        title: "Verifica si cumples los requisitos",
        description:
          "Revisa el certificado de discapacidad y la clasificación socioeconómica del hogar.",
      },
      {
        title: "Prepara tus documentos",
        description: "Ten listo tu DNI y el certificado de discapacidad severa.",
      },
      {
        title: "Presenta la solicitud",
        description:
          "Acude a una oficina de Contigo o a la municipalidad de tu distrito.",
      },
      {
        title: "Espera la evaluación",
        description:
          "La entidad revisa la información y valida si corresponde la afiliación.",
      },
      {
        title: "Consulta el estado",
        description:
          "Puedes verificar tu afiliación ingresando tu DNI en el servicio oficial.",
        highlight: true,
      },
    ],
    procedures: [
      {
        value: "municipalidad-distrital",
        label: "Municipalidad de tu distrito",
      },
    ],
    channels: [
      {
        title: "Oficina Contigo - Lima Centro",
        description: "Jr. Carabaya 341, Cercado de Lima · Lun-Vie 8am-5pm",
      },
      {
        title: "Plataforma de Atención al Ciudadano",
        description: "www.gob.pe/contigo · Consultas y trámites en línea",
      },
      {
        title: "Whatsapp",
        description: "942 962 117 · Lunes a viernes 8am a 5pm",
      },
    ],
  },
  //Aqui comienza lo de FISE
  {
    id: "fise",
    name: "FISE",
    entity: "MINEM - Ministerio de Energía y Minas",
    shortEntity: "MINEM",
    category: "Social",
    description:
      "Fondo de Inclusión Social Energético a cargo del MINEM que entrega vales de descuento para la compra de balones de gas licuado de petróleo a hogares vulnerables, incluyendo beneficiarios de programas sociales como Juntos, Pensión 65 o Contigo.",
    shortDescription:
      "Vales de descuento para la compra de balones de gas dirigidos a hogares vulnerables.",
    keywords: ["gas", "balón", "vale", "descuento", "energía", "fise", "minem"],
    district: "Nacional",
    modality: "Mixta",
    attention: "Presencial / Virtual",
    scope: "Nacional",
    cost: "Gratuito",
    officialUrl: "https://www.gob.pe/fise",
    simple: {
      about:
        "El Estado te da un vale de descuento para comprar tu balón de gas más barato, si tu hogar es vulnerable.",
      facts: [
        { label: "Entidad que lo da", value: "MINEM" },
        { label: "Tipo", value: "Energía" },
        { label: "Costo", value: "Completamente gratuito", highlight: true },
        { label: "Cómo se atiende", value: "Presencial y virtual" },
      ],
      needs: [
        "Ser beneficiario de un programa social",
        "Ser un hogar en situación de pobreza",
        "Tener DNI vigente",
      ],
      doSteps: [
        "Verifica si cumples los requisitos.",
        "Consulta tu vale de descuento digital.",
        "Acude a un establecimiento afiliado.",
        "Compra tu balón de gas con el descuento.",
      ],
      places: [
        { title: "Establecimientos afiliados al FISE", description: "Venta de gas con descuento" },
        { title: "Plataforma FISE", description: "www.gob.pe/fise · Consulta tu vale" },
      ],
    },
    requirements: [
      {
        title: "Ser beneficiario de un programa social",
        description:
          "Pertenecer a Juntos, Pensión 65, Contigo u otro programa social vigente del Estado.",
      },
      {
        title: "Hogar en situación de pobreza",
        description:
          "El SISFOH debe calificar al hogar dentro de los criterios de focalización del programa.",
      },
      {
        title: "Contar con DNI vigente",
        description: "Documento de identidad del titular del hogar.",
      },
    ],
    documents: [
      {
        title: "DNI físico o copia del DNI",
        description: "Documento del titular del hogar beneficiario.",
      },
      {
        title: "Constancia de afiliación a programa social",
        description:
          "Documento que acredite la pertenencia a Juntos, Pensión 65, Contigo u otro programa.",
      },
    ],
    steps: [
      {
        title: "Verifica si cumples los requisitos",
        description:
          "Confirma que perteneces a un programa social habilitado para recibir el vale.",
      },
      {
        title: "Consulta tu vale digital",
        description:
          "Ingresa tu DNI en la plataforma del FISE para verificar el vale disponible.",
      },
      {
        title: "Acude a un establecimiento afiliado",
        description:
          "Presenta tu DNI en una bodega o distribuidor autorizado para canjear el vale.",
      },
      {
        title: "Recibe el balón con descuento",
        description:
          "El establecimiento aplica el descuento correspondiente al momento de la compra.",
        highlight: true,
      },
    ],
    procedures: [
      {
        value: "establecimiento-afiliado",
        label: "Establecimiento o distribuidor de gas afiliado",
      },
    ],
    channels: [
      {
        title: "Plataforma de Atención al Ciudadano",
        description: "www.gob.pe/fise · Consulta de vales en línea",
      },
      {
        title: "Línea FISE",
        description: "0800-17-273 · Lunes a viernes 8:30am a 5pm",
      },
      {
        title: "Whatsapp",
        description: "955 632 999 · Lunes a viernes 8:30am a 5pm",
      },
    ],
  },
];