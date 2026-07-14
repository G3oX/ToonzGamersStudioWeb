export interface PrivacyPolicySubsection {
  id: string;
  title: string;
  list: string[];
}

export interface PrivacyPolicySection {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
  subsections?: PrivacyPolicySubsection[];
}

export interface PrivacyPolicyContact {
  name: string;
  email: string;
}

export interface PrivacyPolicyConfig {
  title: string;
  lastUpdated: string;
  sections: PrivacyPolicySection[];
  contact: PrivacyPolicyContact;
}

export const privacyPolicyConfig: PrivacyPolicyConfig = {
  title: "Política de Privacidad de ToonzGamers",
  lastUpdated: "29 de julio de 2026",
  sections: [
    {
      id: "1",
      title: "Introducción",
      paragraphs: [
        'Esta Política de Privacidad describe cómo ToonzGamers ("nosotros", "nuestro" o "el Estudio") recopila, utiliza, almacena y protege la información relacionada con los usuarios de nuestros videojuegos, aplicaciones, sitios web y servicios digitales (en conjunto, los "Servicios").',
        "Al utilizar cualquiera de nuestros Servicios, aceptas las prácticas descritas en esta Política de Privacidad.",
      ],
    },
    {
      id: "2",
      title: "Alcance",
      paragraphs: [
        "Esta Política de Privacidad se aplica a todos los productos y servicios publicados, desarrollados o gestionados por ToonzGamers, incluyendo, entre otros:",
      ],
      list: [
        "Videojuegos para PC.",
        "Videojuegos para dispositivos móviles.",
        "Aplicaciones para Android.",
        "Sitios web oficiales.",
        "Betas, demos y versiones de prueba.",
        "Servicios online asociados a nuestros productos.",
      ],
    },
    {
      id: "3",
      title: "Información que podemos recopilar",
      paragraphs: [
        "Dependiendo del producto utilizado, podemos recopilar una o varias de las siguientes categorías de información:",
      ],
      subsections: [
        {
          id: "3.1",
          title: "Información técnica",
          list: [
            "Tipo y modelo de dispositivo.",
            "Sistema operativo y versión.",
            "Idioma configurado.",
            "Resolución de pantalla.",
            "Información de rendimiento.",
            "Dirección IP aproximada.",
            "País o región aproximada.",
            "Identificadores técnicos o seudonimizados del dispositivo.",
          ],
        },
        {
          id: "3.2",
          title: "Información de uso",
          list: [
            "Duración de las sesiones.",
            "Eventos de juego.",
            "Progreso dentro del juego.",
            "Estadísticas de uso.",
            "Funciones utilizadas.",
            "Frecuencia de uso.",
          ],
        },
        {
          id: "3.3",
          title: "Información relacionada con compras",
          list: [
            "Cuando un producto incluya compras integradas, la plataforma correspondiente podrá proporcionarnos información limitada sobre las transacciones realizadas.",
            "No almacenamos números de tarjetas de crédito ni información financiera completa.",
          ],
        },
        {
          id: "3.4",
          title: "Información de cuentas",
          list: [
            "Algunos Servicios pueden permitir el uso de sistemas de autenticación o cuentas de terceros.",
            "En dichos casos podremos recibir información básica necesaria para identificar al usuario dentro del Servicio.",
          ],
        },
        {
          id: "3.5",
          title: "Comunicaciones y soporte",
          list: [
            "Si contactas con nosotros, podremos conservar la información que nos proporciones para responder a consultas, incidencias o solicitudes de soporte.",
          ],
        },
      ],
    },
    {
      id: "4",
      title: "Finalidades del tratamiento",
      paragraphs: ["La información recopilada podrá utilizarse para:"],
      list: [
        "Operar y mantener nuestros Servicios.",
        "Mejorar la experiencia de usuario.",
        "Analizar el rendimiento y uso de nuestros productos.",
        "Detectar y corregir errores.",
        "Prevenir actividades fraudulentas o abusivas.",
        "Gestionar compras y contenido digital.",
        "Proporcionar asistencia técnica.",
        "Cumplir obligaciones legales.",
      ],
    },
    {
      id: "5",
      title: "Servicios de terceros",
      paragraphs: [
        "Dependiendo del producto utilizado, podemos integrar servicios proporcionados por terceros.",
        "Estos servicios pueden recopilar información de acuerdo con sus propias políticas de privacidad.",
        "Entre los servicios que pueden utilizarse en algunos de nuestros productos se incluyen:",
      ],
      list: [
        "GameAnalytics",
        "Unity Gaming Services",
        "Unity Analytics",
        "Google Play Services",
        "Google Play Games Services",
        "Google Play Billing",
        "Google AdMob",
        "Firebase",
        "Steamworks",
        "Servicios de alojamiento y almacenamiento en la nube",
      ],
    },
    {
      id: "6",
      title: "Publicidad",
      paragraphs: [
        "Algunos de nuestros productos pueden mostrar anuncios proporcionados por plataformas publicitarias de terceros.",
        "En dichos casos, dichas plataformas podrán recopilar información conforme a sus propias políticas de privacidad y a la configuración del dispositivo del usuario.",
      ],
    },
    {
      id: "7",
      title: "Compras integradas",
      paragraphs: [
        "Algunos productos pueden ofrecer compras integradas o contenido digital adicional.",
        "Las transacciones son procesadas por la plataforma correspondiente (Google Play, Steam u otras plataformas autorizadas).",
        "ToonzGamers no almacena información completa de tarjetas de crédito ni datos bancarios.",
      ],
    },
    {
      id: "8",
      title: "Conservación de los datos",
      paragraphs: ["La información se conservará únicamente durante el tiempo necesario para:"],
      list: [
        "Prestar los Servicios.",
        "Resolver incidencias.",
        "Cumplir obligaciones legales.",
        "Mantener estadísticas agregadas y anónimas.",
      ],
    },
    {
      id: "9",
      title: "Compartición de información",
      paragraphs: [
        "No vendemos información personal de nuestros usuarios.",
        "La información podrá compartirse únicamente:",
      ],
      list: [
        "Con proveedores de servicios necesarios para el funcionamiento de nuestros productos.",
        "Cuando sea exigido por ley.",
        "Para proteger nuestros derechos legales o la seguridad de nuestros usuarios.",
      ],
    },
    {
      id: "10",
      title: "Menores de edad",
      paragraphs: [
        "Nuestros Servicios no están dirigidos específicamente a menores de 13 años salvo que se indique expresamente lo contrario.",
        "No recopilamos conscientemente información personal de menores de edad sin el consentimiento requerido por la legislación aplicable.",
      ],
    },
    {
      id: "11",
      title: "Seguridad",
      paragraphs: [
        "Aplicamos medidas razonables para proteger la información frente a accesos no autorizados, pérdida, alteración o divulgación.",
        "No obstante, ningún sistema de transmisión o almacenamiento de datos puede garantizar una seguridad absoluta.",
      ],
    },
    {
      id: "12",
      title: "Derechos de los usuarios",
      paragraphs: ["Dependiendo de la legislación aplicable, los usuarios podrán solicitar:"],
      list: [
        "Acceso a sus datos.",
        "Rectificación de datos inexactos.",
        "Eliminación de datos cuando proceda.",
        "Limitación del tratamiento.",
        "Oposición al tratamiento.",
        "Portabilidad de los datos.",
      ],
    },
    {
      id: "13",
      title: "Cambios en esta Política de Privacidad",
      paragraphs: [
        "ToonzGamers podrá modificar esta Política de Privacidad en cualquier momento para adaptarla a cambios legales, técnicos o funcionales.",
        "La fecha de la última actualización se indicará siempre al inicio del documento.",
      ],
    },
    {
      id: "14",
      title: "Contacto",
      paragraphs: [
        "Para cualquier consulta relacionada con esta Política de Privacidad o con el tratamiento de datos, puedes contactar con:",
      ],
    },
  ],
  contact: {
    name: "ToonzGamers",
    email: "privacy@toonzgamers.com",
  },
};