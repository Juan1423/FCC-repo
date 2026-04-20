/**
 * Configuración parametrizada del ChatBot
 * Define todos los parámetros clave del comportamiento del chatbot
 */

module.exports = {
  // ========== INFORMACIÓN DE LA FUNDACIÓN ==========
  fundacion: {
    nombre: process.env.FUNDACION_NOMBRE || 'Fundación con Cristo',
    mision: process.env.FUNDACION_MISION || 'Proporcionar servicios de salud integral, educación y apoyo comunitario con un enfoque compasivo y basado en valores cristianos.',
    vision: process.env.FUNDACION_VISION || 'Ser una institución líder en atención a la salud y desarrollo comunitario, reconocida por su compromiso con la excelencia y la inclusión.',
    
    // Ubicaciones
    ubicaciones: {
      principal: {
        ciudad: process.env.FUNDACION_CIUDAD_PRINCIPAL || 'Quito',
        provincia: process.env.FUNDACION_PROVINCIA || 'Pichincha',
        pais: process.env.FUNDACION_PAIS || 'Ecuador',
        direccion: process.env.FUNDACION_DIRECCION || 'Av. Amazonas y Naciones Unidas'
      },
      sucursales: process.env.FUNDACION_SUCURSALES ? JSON.parse(process.env.FUNDACION_SUCURSALES) : [
        { ciudad: 'Quito', tipo: 'Clínica principal' },
        { ciudad: 'Guayaquil', tipo: 'Centro de atención' }
      ]
    },

    // Contacto
    contacto: {
      telefonoPrincipal: process.env.FUNDACION_TELEFONO || '(+593) 2 2500000',
      telefonoAlterno: process.env.FUNDACION_TELEFONO_ALTERNO || '1800-SALUD',
      email: process.env.FUNDACION_EMAIL || 'info@fundacionconcristo.org.ec',
      emailEmergencias: process.env.FUNDACION_EMAIL_EMERGENCIAS || 'emergencias@fundacionconcristo.org.ec',
      sitioWeb: process.env.FUNDACION_SITIO_WEB || 'www.fundacionconcristo.org.ec',
      redesSociales: {
        facebook: process.env.FUNDACION_FACEBOOK || 'FundacionConCristo',
        instagram: process.env.FUNDACION_INSTAGRAM || '@fundacionconcristo',
        twitter: process.env.FUNDACION_TWITTER || '@FundacionCC',
        whatsapp: process.env.FUNDACION_WHATSAPP || '+593987654321'
      }
    },

    // Horarios
    horarios: {
      atencionGeneral: {
        lunasViernes: process.env.FUNDACION_HORARIO_LV || '08:00 - 18:00',
        sabados: process.env.FUNDACION_HORARIO_SAB || '08:00 - 13:00',
        domingos: process.env.FUNDACION_HORARIO_DOM || 'Cerrado'
      },
      emergencias: {
        estado: process.env.FUNDACION_EMERGENCIAS_24H || 'disponible',
        horario: process.env.FUNDACION_EMERGENCIAS_HORARIO || '24/7'
      }
    },

    // Servicios principales
    servicios: {
      medicina: {
        nombre: 'Medicina General',
        descripcion: 'Consultas de medicina general y atención básica',
        disponibilidad: 'Lunes a viernes'
      },
      especialidades: {
        nombre: 'Especialidades Médicas',
        descripcion: 'Cardiología, Neurología, Pediatría, Ginecología, etc.',
        disponibilidad: 'Con cita previa'
      },
      laboratorio: {
        nombre: 'Laboratorio Clínico',
        descripcion: 'Análisis y pruebas de laboratorio',
        disponibilidad: 'Lunes a sábado'
      },
      terapias: {
        nombre: 'Terapias y Rehabilitación',
        descripcion: 'Fisioterapia, terapia ocupacional, psicología',
        disponibilidad: 'Con cita previa'
      },
      telemedicina: {
        nombre: 'Telemedicina',
        descripcion: 'Consultas por videollamada y seguimiento remoto',
        disponibilidad: 'Disponible'
      }
    },

    // Programas comunitarios
    programas: {
      preventivo: {
        nombre: 'Programa Preventivo',
        descripcion: 'Campañas de prevención de enfermedades y promoción de salud',
        publico: 'Comunidad en general'
      },
      nutricion: {
        nombre: 'Programa de Nutrición',
        descripcion: 'Asesoramiento nutricional y educación alimentaria',
        publico: 'Pacientes con condiciones crónicas'
      },
      bienestar: {
        nombre: 'Programa de Bienestar Mental',
        descripcion: 'Apoyo psicológico, consejería y terapia',
        publico: 'Pacientes que requieran apoyo emocional'
      },
      educacion: {
        nombre: 'Programa Educativo',
        descripcion: 'Talleres y capacitaciones en temas de salud',
        publico: 'Comunidad educativa'
      }
    },

    // Valores institucionales
    valores: {
      compasion: 'Atención centrada en el ser humano con empatía y respeto',
      excelencia: 'Estándares de calidad en todos nuestros servicios',
      integridad: 'Transparencia y ética en nuestras acciones',
      inclusión: 'Accesibilidad para todos, sin discriminación',
      responsabilidad: 'Compromiso con la comunidad y el medio ambiente'
    },

    // Información adicional
    fondacion: {
      anioFundacion: process.env.FUNDACION_ANIO || '2003',
      misioneros: process.env.FUNDACION_PERSONAL_TOTAL || 'Más de 500 profesionales de salud',
      especialidades: process.env.FUNDACION_ESPECIALIDADES || '20+',
      pacientesAtendidos: process.env.FUNDACION_PACIENTES_ANUALES || 'Más de 100,000 anuales',
      certificaciones: ['ISO 9001:2015', 'Acreditación en Salud', 'Certificado de Responsabilidad Social']
    }
  },

  // Configuración de OpenAI
  openai: {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    topP: parseFloat(process.env.OPENAI_TOP_P || '0.9'),
    frequencyPenalty: parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || '0'),
    presencePenalty: parseFloat(process.env.OPENAI_PRESENCE_PENALTY || '0'),
  },

  // Mensaje del sistema
  systemPrompt: {
    base: "Eres un chatbot de la Fundación con Cristo. Tu objetivo es proporcionar información precisa, útil y compasiva sobre nuestros servicios, programas y recursos. Responde de manera profesional, empática y basada en la información disponible.",
    
    // Instrucciones según tipo de prompt
    instructionFormat: {
      instructions: "Instrucciones adicionales:\n",
      pdfContext: "Información adicional del PDF:\n",
      globalContext: "Contexto global del último PDF:"
    },
    
    userMessageFormat: "Pregunta del usuario:",
    
    // Límites y restricciones
    maxInstructionLength: 2000,
    maxContextLength: 5000,
  },

  // Comportamiento del chat
  chat: {
    // Retener historial de conversaciones
    retainHistory: true,
    maxHistoryMessages: 20,
    
    // Tipo de respuestas
    responseFormats: {
      default: 'text',
      supportedFormats: ['text', 'list', 'qa']
    },
    
    // Validación de mensajes
    minMessageLength: 1,
    maxMessageLength: 5000,
    
    // Timeouts
    requestTimeout: 30000, // 30 segundos
    retryAttempts: 3,
    retryDelay: 1000, // 1 segundo
  },

  // Gestión de prompts
  prompts: {
    // Tipos permitidos
    types: {
      INSTRUCTIONS: 'instrucciones',
      CONTEXT_PDF: 'contexto_pdf',
      GLOBAL: 'global'
    },
    
    // Filtros por defecto
    defaultFilters: {
      active: true,
      orderBy: 'updatedAt',
      sortOrder: 'DESC'
    },
    
    // Límites
    maxPromptsPerRequest: 5,
    prioritizationOrder: ['global', 'instrucciones', 'contexto_pdf']
  },

  // Conversaciones
  conversations: {
    // Almacenamiento
    saveToDatabase: true,
    storeUserMessages: true,
    storeBotResponses: true,
    
    // Segmentación
    maxMessagesPerConversation: 100,
    autoArchiveAfterDays: 30,
    
    // Metadatos a guardar
    trackMetadata: {
      timestamp: true,
      userId: true,
      promptId: true,
      responseTime: true,
      tokenUsage: true,
      userSatisfaction: true
    }
  },

  // Feedback de usuarios
  feedback: {
    enableFeedback: true,
    feedbackTypes: ['helpful', 'not_helpful', 'incorrect', 'unclear'],
    requireReasonForNegativeFeedback: false,
    maxFeedbackLength: 500
  },

  // Seguridad
  security: {
    validateInput: true,
    sanitizeInput: true,
    maxInputLength: 5000,
    blockSuspiciousPatterns: true,
    logSuspiciousActivity: true
  },

  // Logging y debugging
  logging: {
    enableDetailedLogging: process.env.LOGGING_DETAILED === 'true' || process.env.NODE_ENV === 'development',
    logPrompts: process.env.LOGGING_LOG_PROMPTS === 'true',
    logResponses: process.env.LOGGING_LOG_RESPONSES === 'true',
    logErrors: process.env.LOGGING_LOG_ERRORS !== 'false',
    logPerformance: process.env.LOGGING_LOG_PERFORMANCE !== 'false'
  },

  // Categorización de preguntas
  categories: {
    autoDetectCategory: true,
    supportedCategories: ['servicios', 'programas', 'ubicacion', 'horarios', 'contacto', 'general'],
    requireCategorySelection: false
  }
};
