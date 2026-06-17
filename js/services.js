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
  }
];
