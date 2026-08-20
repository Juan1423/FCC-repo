/**
 * Configuración parametrizada del ChatBot (Cliente)
 * Copia independiente de la configuración del servidor.
 * No realiza imports cross-project. Usa valores estáticos definidos localmente.
 */

const chatConfig = {
  fundacion: {
    nombre: 'Fundación con Cristo',
    mision: 'Proporcionar servicios de salud integral, educación y apoyo comunitario con un enfoque compasivo y basado en valores cristianos.',
    vision: 'Ser una institución líder en atención a la salud y desarrollo comunitario, reconocida por su compromiso con la excelencia y la inclusión.',
    ubicaciones: {
      principal: {
        ciudad: 'Quito',
        provincia: 'Pichincha',
        pais: 'Ecuador',
        direccion: 'Av. Amazonas y Naciones Unidas',
      },
      sucursales: [
        { ciudad: 'Quito', tipo: 'Clínica principal' },
        { ciudad: 'Guayaquil', tipo: 'Centro de atención' },
      ],
    },
    contacto: {
      telefonoPrincipal: '(+593) 2 2500000',
      telefonoAlterno: '1800-SALUD',
      email: 'info@fundacionconcristo.org.ec',
      emailEmergencias: 'emergencias@fundacionconcristo.org.ec',
      sitioWeb: 'www.fundacionconcristo.org.ec',
      redesSociales: {
        facebook: 'FundacionConCristo',
        instagram: '@fundacionconcristo',
        twitter: '@FundacionCC',
        whatsapp: '+593987654321',
      },
    },
    horarios: {
      atencionGeneral: {
        lunasViernes: '08:00 - 18:00',
        sabados: '08:00 - 13:00',
        domingos: 'Cerrado',
      },
      emergencias: {
        estado: 'disponible',
        horario: '24/7',
      },
    },
    servicios: {
      medicina: { nombre: 'Medicina General', descripcion: 'Consultas de medicina general y atención básica', disponibilidad: 'Lunes a viernes' },
      especialidades: { nombre: 'Especialidades Médicas', descripcion: 'Cardiología, Neurología, Pediatría, Ginecología, etc.', disponibilidad: 'Con cita previa' },
      laboratorio: { nombre: 'Laboratorio Clínico', descripcion: 'Análisis y pruebas de laboratorio', disponibilidad: 'Lunes a sábado' },
      terapias: { nombre: 'Terapias y Rehabilitación', descripcion: 'Fisioterapia, terapia ocupacional, psicología', disponibilidad: 'Con cita previa' },
      telemedicina: { nombre: 'Telemedicina', descripcion: 'Consultas por videollamada y seguimiento remoto', disponibilidad: 'Disponible' },
    },
    programas: {
      preventivo: { nombre: 'Programa Preventivo', descripcion: 'Campañas de prevención de enfermedades y promoción de salud', publico: 'Comunidad en general' },
      nutricion: { nombre: 'Programa de Nutrición', descripcion: 'Asesoramiento nutricional y educación alimentaria', publico: 'Pacientes con condiciones crónicas' },
      bienestar: { nombre: 'Programa de Bienestar Mental', descripcion: 'Apoyo psicológico, consejería y terapia', publico: 'Pacientes que requieran apoyo emocional' },
      educacion: { nombre: 'Programa Educativo', descripcion: 'Talleres y capacitaciones en temas de salud', publico: 'Comunidad educativa' },
    },
    valores: {
      compasion: 'Atención centrada en el ser humano con empatía y respeto',
      excelencia: 'Estándares de calidad en todos nuestros servicios',
      integridad: 'Transparencia y ética en nuestras acciones',
      inclusión: 'Accesibilidad para todos, sin discriminación',
      responsabilidad: 'Compromiso con la comunidad y el medio ambiente',
    },
    fondacion: {
      anioFundacion: '2003',
      misioneros: 'Más de 500 profesionales de salud',
      especialidades: '20+',
      pacientesAtendidos: 'Más de 100,000 anuales',
      certificaciones: ['ISO 9001:2015', 'Acreditación en Salud', 'Certificado de Responsabilidad Social'],
    },
  },

  openai: {
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },

  welcomeMessages: {
    publico: `¡Hola! Soy el asistente virtual de la Fundación con Cristo. 👋\n\nPuedo ayudarte con información sobre nuestros servicios médicos, programas comunitarios, horarios, ubicación y más.\n\n¿En qué puedo ayudarte hoy?`,
    interno: (nombre) => `¡Hola ${nombre}! 👋\n\nSoy tu Asistente de Gestión. Estoy conectado a los documentos internos de la fundación.\n\n¿Qué necesitas consultar hoy?`,
    internoFallback: '¡Hola! Soy tu Asistente de Gestión. Estoy conectado a los documentos internos. ¿Qué necesitas consultar hoy?',
  },

  systemPrompt: {
    base: "Eres un chatbot de la Fundación con Cristo. Tu objetivo es proporcionar información precisa, útil y compasiva sobre nuestros servicios, programas y recursos. Responde de manera profesional, empática y basada en la información disponible.",
    instructionFormat: {
      instructions: "Instrucciones adicionales:\n",
      pdfContext: "Información adicional del PDF:\n",
      globalContext: "Contexto global del último PDF:"
    },
    userMessageFormat: "Pregunta del usuario:",
    maxInstructionLength: 2000,
    maxContextLength: 5000,
  },

  chat: {
    retainHistory: true,
    maxHistoryMessages: 20,
    responseFormats: {
      default: 'text',
      supportedFormats: ['text', 'list', 'qa'],
    },
    minMessageLength: 1,
    maxMessageLength: 5000,
    requestTimeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  prompts: {
    types: {
      INSTRUCTIONS: 'instrucciones',
      CONTEXT_PDF: 'contexto_pdf',
      GLOBAL: 'global',
    },
    defaultFilters: {
      active: true,
      orderBy: 'updatedAt',
      sortOrder: 'DESC',
    },
    maxPromptsPerRequest: 5,
    prioritizationOrder: ['global', 'instrucciones', 'contexto_pdf'],
  },

  conversations: {
    saveToDatabase: true,
    storeUserMessages: true,
    storeBotResponses: true,
    maxMessagesPerConversation: 100,
    autoArchiveAfterDays: 30,
    trackMetadata: {
      timestamp: true,
      userId: true,
      promptId: true,
      responseTime: true,
      tokenUsage: true,
      userSatisfaction: true,
    },
  },

  feedback: {
    enableFeedback: true,
    feedbackTypes: ['helpful', 'not_helpful', 'incorrect', 'unclear'],
    requireReasonForNegativeFeedback: false,
    maxFeedbackLength: 500,
  },

  security: {
    validateInput: true,
    sanitizeInput: true,
    maxInputLength: 5000,
    blockSuspiciousPatterns: true,
    logSuspiciousActivity: true,
  },

  logging: {
    enableDetailedLogging: process.env.NODE_ENV === 'development',
    logPrompts: false,
    logResponses: false,
    logErrors: true,
    logPerformance: true,
  },

  categories: {
    autoDetectCategory: true,
    supportedCategories: ['servicios', 'programas', 'ubicacion', 'horarios', 'contacto', 'general'],
    requireCategorySelection: false,
  },
};

export default chatConfig;
