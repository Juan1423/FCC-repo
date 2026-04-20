/**
 * restricciones.js
 * Copiado y movido a modules/chatcliente/componentes
 */

// ========== RESTRICCIONES DE PROMPTS ==========
export const TIPOS_PROMPT = {
  INSTRUCCIONES: 'instrucciones',
  CONTEXTO_PDF: 'contexto_pdf',
  GLOBAL: 'global',
  OTRO: 'otro',
};

export const RESTRICCIONES_PROMPT = {
  titulo: {
    minLength: 3,
    maxLength: 255,
    requerido: true,
    patron: /^[a-zA-Z0-9áéíóúñ\s\-_.]+$/,
    mensaje: 'El título solo puede contener letras, números, espacios, guiones y puntos',
  },
  descripcion: {
    minLength: 10,
    maxLength: 1000,
    requerido: true,
    mensaje: 'La descripción debe tener entre 10 y 1000 caracteres',
  },
  instrucciones: {
    minLength: 20,
    maxLength: 5000,
    requerido: true,
    mensaje: 'Las instrucciones deben tener entre 20 y 5000 caracteres',
  },
  tipo_prompt: {
    opciones: Object.values(TIPOS_PROMPT),
    requerido: true,
    mensaje: 'Debe seleccionar un tipo de prompt válido',
  },
  archivo_pdf: {
    maxSize: 10 * 1024 * 1024, // 10MB
    tiposPermitidos: ['application/pdf'],
    requerido: false,
  },
};

export const RESTRICCIONES_CONVERSACION = {
  mensaje_min_length: 1,
  mensaje_max_length: parseInt(process.env.REACT_APP_CHAT_MAX_MESSAGE_LENGTH || '5000'),
  timeout_ms: parseInt(process.env.REACT_APP_CHAT_REQUEST_TIMEOUT || '30000'),
  max_historial_mensajes: parseInt(process.env.REACT_APP_CHAT_MAX_HISTORY_MESSAGES || '20'),
  guardar_en_bd: process.env.REACT_APP_CONVERSATIONS_SAVE_TO_DATABASE === 'true',
  guardar_mensajes_usuario: process.env.REACT_APP_CONVERSATIONS_STORE_USER_MESSAGES === 'true',
  guardar_respuestas_bot: process.env.REACT_APP_CONVERSATIONS_STORE_BOT_RESPONSES === 'true',
  max_por_conversacion: parseInt(process.env.REACT_APP_CONVERSATIONS_MAX_PER_CONVERSATION || '100'),
  auto_archivar_dias: parseInt(process.env.REACT_APP_CONVERSATIONS_AUTO_ARCHIVE_DAYS || '30'),
};

export const RESTRICCIONES_FEEDBACK = {
  habilitado: process.env.REACT_APP_FEEDBACK_ENABLED === 'true',
  max_length: parseInt(process.env.REACT_APP_FEEDBACK_MAX_LENGTH || '500'),
  requerido: true,
  tipos_feedback: ['positivo', 'negativo', 'neutral'],
};

export const RESTRICCIONES_ARCHIVO = {
  pdf: {
    extension: '.pdf',
    tipoMime: 'application/pdf',
    tamanoMaxMB: 10,
    tamanoMaxBytes: 10 * 1024 * 1024,
  },
  imagen: {
    extensiones: ['.jpg', '.jpeg', '.png', '.gif'],
    tiposMime: ['image/jpeg', 'image/png', 'image/gif'],
    tamanoMaxMB: 5,
    tamanoMaxBytes: 5 * 1024 * 1024,
  },
};

export const RESTRICCIONES_SEGURIDAD = {
  minimo_sesion_activa: 900000,
  tokens_jwt_requerido: true,
  validar_consentimiento: true,
  log_conversaciones: process.env.REACT_APP_LOGGING_LOG_PROMPTS === 'true',
  log_respuestas: process.env.REACT_APP_LOGGING_LOG_RESPONSES === 'true',
};

export const MENSAJES_VALIDACION = {
  campoRequerido: (campo) => `${campo} es requerido`,
  longitudMinima: (campo, min) => `${campo} debe tener al menos ${min} caracteres`,
  longitudMaxima: (campo, max) => `${campo} no puede exceder ${max} caracteres`,
  formatoInvalido: (campo) => `${campo} tiene un formato inválido`,
  archivoTamanoExcedido: (tipoArchivo, tamano) => `El archivo ${tipoArchivo} no puede exceder ${tamano}MB`,
  tipoArchivoInvalido: (tiposPermitidos) => `Solo se permiten archivos de tipo: ${tiposPermitidos.join(', ')}`,
  seleccionarOpciones: `Debe seleccionar una opción válida`,
  consentimientoRequerido: `Debe aceptar los términos y condiciones`,
  sesionExpirada: `Su sesión ha expirado. Por favor, inicie sesión nuevamente`,
};

export const validarPrompt = (prompt) => {
  const errores = [];
  if (!prompt.tipo_prompt || prompt.tipo_prompt.trim() === '') {
    errores.push(MENSAJES_VALIDACION.campoRequerido('Tipo de Prompt'));
  } else if (!RESTRICCIONES_PROMPT.tipo_prompt.opciones.includes(prompt.tipo_prompt)) {
    errores.push(MENSAJES_VALIDACION.seleccionarOpciones);
  }

  if (!prompt.titulo) {
    errores.push(MENSAJES_VALIDACION.campoRequerido('Título'));
  } else if (prompt.titulo.length < RESTRICCIONES_PROMPT.titulo.minLength) {
    errores.push(MENSAJES_VALIDACION.longitudMinima('Título', RESTRICCIONES_PROMPT.titulo.minLength));
  } else if (prompt.titulo.length > RESTRICCIONES_PROMPT.titulo.maxLength) {
    errores.push(MENSAJES_VALIDACION.longitudMaxima('Título', RESTRICCIONES_PROMPT.titulo.maxLength));
  } else if (!RESTRICCIONES_PROMPT.titulo.patron.test(prompt.titulo)) {
    errores.push(RESTRICCIONES_PROMPT.titulo.mensaje);
  }

  if (!prompt.descripcion) {
    errores.push(MENSAJES_VALIDACION.campoRequerido('Descripción'));
  } else if (prompt.descripcion.length < RESTRICCIONES_PROMPT.descripcion.minLength) {
    errores.push(MENSAJES_VALIDACION.longitudMinima('Descripción', RESTRICCIONES_PROMPT.descripcion.minLength));
  } else if (prompt.descripcion.length > RESTRICCIONES_PROMPT.descripcion.maxLength) {
    errores.push(MENSAJES_VALIDACION.longitudMaxima('Descripción', RESTRICCIONES_PROMPT.descripcion.maxLength));
  }

  if (!prompt.instrucciones) {
    errores.push(MENSAJES_VALIDACION.campoRequerido('Instrucciones'));
  } else if (prompt.instrucciones.length < RESTRICCIONES_PROMPT.instrucciones.minLength) {
    errores.push(MENSAJES_VALIDACION.longitudMinima('Instrucciones', RESTRICCIONES_PROMPT.instrucciones.minLength));
  } else if (prompt.instrucciones.length > RESTRICCIONES_PROMPT.instrucciones.maxLength) {
    errores.push(MENSAJES_VALIDACION.longitudMaxima('Instrucciones', RESTRICCIONES_PROMPT.instrucciones.maxLength));
  }

  return { valido: errores.length === 0, errores };
};

export const validarMensajeChat = (mensaje) => {
  if (!mensaje || mensaje.trim().length === 0) {
    return { valido: false, error: MENSAJES_VALIDACION.campoRequerido('Mensaje') };
  }
  if (mensaje.length > RESTRICCIONES_CONVERSACION.mensaje_max_length) {
    return { valido: false, error: MENSAJES_VALIDACION.longitudMaxima('Mensaje', RESTRICCIONES_CONVERSACION.mensaje_max_length) };
  }
  return { valido: true, error: null };
};

export const validarArchivoPDF = (archivo) => {
  if (!archivo) return { valido: true, error: null };
  if (!RESTRICCIONES_ARCHIVO.pdf.tiposMime.includes(archivo.type)) {
    return { valido: false, error: MENSAJES_VALIDACION.tipoArchivoInvalido(['PDF']) };
  }
  if (archivo.size > RESTRICCIONES_ARCHIVO.pdf.tamanoMaxBytes) {
    return { valido: false, error: MENSAJES_VALIDACION.archivoTamanoExcedido('PDF', RESTRICCIONES_ARCHIVO.pdf.tamanoMaxMB) };
  }
  return { valido: true, error: null };
};

export const validarFeedback = (feedback) => {
  const errores = [];
  if (!RESTRICCIONES_FEEDBACK.habilitado) {
    errores.push('El feedback está deshabilitado en este momento');
    return { valido: false, errores };
  }
  if (!feedback.tipo || !RESTRICCIONES_FEEDBACK.tipos_feedback.includes(feedback.tipo)) {
    errores.push('Debe seleccionar un tipo de feedback válido');
  }
  if (!feedback.mensaje || feedback.mensaje.trim().length === 0) {
    errores.push(MENSAJES_VALIDACION.campoRequerido('Mensaje de feedback'));
  } else if (feedback.mensaje.length > RESTRICCIONES_FEEDBACK.max_length) {
    errores.push(MENSAJES_VALIDACION.longitudMaxima('Feedback', RESTRICCIONES_FEEDBACK.max_length));
  }
  return { valido: errores.length === 0, errores };
};

export default {
  TIPOS_PROMPT,
  RESTRICCIONES_PROMPT,
  RESTRICCIONES_CONVERSACION,
  RESTRICCIONES_FEEDBACK,
  RESTRICCIONES_ARCHIVO,
  RESTRICCIONES_SEGURIDAD,
  MENSAJES_VALIDACION,
  validarPrompt,
  validarMensajeChat,
  validarArchivoPDF,
  validarFeedback,
};
