/**
 * roleConstants.js
 * Constantes de roles y permisos para el módulo de chatbot
 * Organiza los roles y sus permisos específicos
 */

// ========== DEFINICIÓN DE ROLES ==========
export const USER_ROLES = {
  ADMINISTRADOR: 'administrador',
  USUARIO_COMUN: 'paciente', // O personalidad según tu sistema
  PERSONAL_SALUD: 'personal_salud',
  VISITANTE: 'visitante', // Usuario sin sesión
};

// ========== PERMISOS POR ROL ==========
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMINISTRADOR]: {
    // Gestión de Prompts
    createPrompt: true,
    editPrompt: true,
    deletePrompt: true,
    listPrompts: true,
    activatePrompt: true,
    clearMemory: true,
    
    // Acceso al Chatbot
    accessChatbot: true,
    unlimitedQuestions: true,
    
    // Gestión de Historial
    viewAllConversations: true,
    exportConversations: true,
    deleteConversations: true,
    
    // Análisis
    viewFeedback: true,
    viewAnalytics: true,
  },
  
  [USER_ROLES.USUARIO_COMUN]: {
    // Gestión de Prompts
    createPrompt: false,
    editPrompt: false,
    deletePrompt: false,
    listPrompts: false,
    activatePrompt: false,
    clearMemory: false,
    
    // Acceso al Chatbot
    accessChatbot: true,
    // Límite de 30 preguntas por sesión para usuarios registrados
    unlimitedQuestions: false,
    maxQuestionsPerSession: 30, // Límite de 30 preguntas por sesión
    
    // Gestión de Historial
    viewAllConversations: false,
    viewOwnConversations: true,
    exportConversations: false,
    deleteConversations: false,
    
    // Análisis
    viewFeedback: false,
    viewAnalytics: false,
  },
  
  [USER_ROLES.PERSONAL_SALUD]: {
    // Gestión de Prompts
    createPrompt: false,
    editPrompt: false,
    deletePrompt: false,
    listPrompts: true,
    activatePrompt: false,
    clearMemory: false,
    
    // Acceso al Chatbot
    accessChatbot: true,
    unlimitedQuestions: true,
    
    // Gestión de Historial
    viewAllConversations: true,
    viewOwnConversations: true,
    exportConversations: true,
    deleteConversations: false,
    
    // Análisis
    viewFeedback: true,
    viewAnalytics: true,
  },
  
  [USER_ROLES.VISITANTE]: {
    // Gestión de Prompts
    createPrompt: false,
    editPrompt: false,
    deletePrompt: false,
    listPrompts: false,
    activatePrompt: false,
    clearMemory: false,
    
    // Acceso al Chatbot
    accessChatbot: true,
    unlimitedQuestions: false,
    maxQuestionsPerSession: 30, // Máximo 30 preguntas
    
    // Gestión de Historial
    viewAllConversations: false,
    viewOwnConversations: false,
    exportConversations: false,
    deleteConversations: false,
    
    // Análisis
    viewFeedback: false,
    viewAnalytics: false,
  },
};

// ========== LÍMITES POR ROL ==========
export const ROLE_LIMITS = {
  [USER_ROLES.ADMINISTRADOR]: {
    maxQuestionsPerSession: null, // Sin límite
    maxQuestionsPerDay: null,
    messageTimeout: 30000, // 30 segundos
  },
  
  [USER_ROLES.USUARIO_COMUN]: {
    maxQuestionsPerSession: 30, // 30 preguntas por sesión para usuarios registrados
    maxQuestionsPerDay: null,
    messageTimeout: 30000,
  },
  
  [USER_ROLES.PERSONAL_SALUD]: {
    maxQuestionsPerSession: null,
    maxQuestionsPerDay: null,
    messageTimeout: 30000,
  },
  
  [USER_ROLES.VISITANTE]: {
    maxQuestionsPerSession: 30, // 30 preguntas máximo
    maxQuestionsPerDay: null,
    messageTimeout: 30000,
  },
};

// ========== MENSAJES DE ERROR ==========
export const ACCESS_DENIED_MESSAGES = {
  PROMPTS: 'Solo los administradores pueden gestionar prompts. Por favor, inicia sesión como administrador.',
  CHATBOT: 'Debes iniciar sesión para acceder al chatbot de forma ilimitada.',
  HISTORIAL: 'No tienes permisos para ver el historial de conversaciones.',
  ANALYTICS: 'Solo el personal de salud y administradores pueden ver el análisis.',
  VISITOR_LIMIT: 'Como visitante, solo puedes hacer 30 preguntas. Inicia sesión para acceso ilimitado.',
};

// ========== ROLES PIN ACCESO RÁPIDO ==========
export const ROLE_LABELS = {
  [USER_ROLES.ADMINISTRADOR]: '👑 Administrador',
  [USER_ROLES.USUARIO_COMUN]: '👤 Usuario Común',
  [USER_ROLES.PERSONAL_SALUD]: '👨‍⚕️ Personal de Salud',
  [USER_ROLES.VISITANTE]: '👁️ Visitante',
};
