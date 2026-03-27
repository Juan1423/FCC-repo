/**
 * roleConfig.js
 * Archivo de configuración centralizado para roles y límites del chatbot
 * Facilita ajustar permisos sin modificar el código de componentes
 */

import { USER_ROLES } from './roleConstants';

/**
 * Configuración maestra de límites por rol
 * Edita estos valores para ajustar el comportamiento del sistema
 */
export const ROLE_CONFIG = {
  // ========== VISITANTE ==========
  [USER_ROLES.VISITANTE]: {
    label: '👁️ Visitante',
    description: 'Usuario sin sesión activa',
    limits: {
      maxQuestionsPerSession: 5, // EDITABLE: cambiar límite de preguntas
      maxQuestionsPerDay: 10,
      messageTimeout: 30000,
      sessionDuration: 60 * 60 * 1000, // 1 hora
    },
    features: {
      canAccessChatbot: true,
      canSaveHistory: false,
      canAccessAdmin: false,
      canManagePrompts: false,
      canViewAnalytics: false,
    },
    ui: {
      showLoginPrompt: true,
      showLimitWarning: true,
      showFeedback: false,
      showHistoryButton: false,
    },
  },

  // ========== USUARIO COMÚN ==========
  [USER_ROLES.USUARIO_COMUN]: {
    label: '👤 Usuario Común',
    description: 'Usuario paciente autenticado',
    limits: {
      maxQuestionsPerSession: null, // Sin límite
      maxQuestionsPerDay: null,
      messageTimeout: 30000,
      sessionDuration: 24 * 60 * 60 * 1000, // 24 horas
    },
    features: {
      canAccessChatbot: true,
      canSaveHistory: true,
      canAccessAdmin: false,
      canManagePrompts: false,
      canViewAnalytics: false,
    },
    ui: {
      showLoginPrompt: false,
      showLimitWarning: false,
      showFeedback: true,
      showHistoryButton: true,
    },
  },

  // ========== PERSONAL DE SALUD ==========
  [USER_ROLES.PERSONAL_SALUD]: {
    label: '👨‍⚕️ Personal de Salud',
    description: 'Personal médico/administrativo',
    limits: {
      maxQuestionsPerSession: null,
      maxQuestionsPerDay: null,
      messageTimeout: 30000,
      sessionDuration: 24 * 60 * 60 * 1000,
    },
    features: {
      canAccessChatbot: true,
      canSaveHistory: true,
      canAccessAdmin: false,
      canManagePrompts: false, // Solo lectura
      canViewAnalytics: true,
      canViewAllConversations: true,
    },
    ui: {
      showLoginPrompt: false,
      showLimitWarning: false,
      showFeedback: true,
      showHistoryButton: true,
      showAnalyticsButton: true,
    },
  },

  // ========== ADMINISTRADOR ==========
  [USER_ROLES.ADMINISTRADOR]: {
    label: '👑 Administrador',
    description: 'Acceso total del sistema',
    limits: {
      maxQuestionsPerSession: null,
      maxQuestionsPerDay: null,
      messageTimeout: 30000,
      sessionDuration: 24 * 60 * 60 * 1000,
    },
    features: {
      canAccessChatbot: true,
      canSaveHistory: true,
      canAccessAdmin: true,
      canManagePrompts: true, // CRUD completo
      canViewAnalytics: true,
      canViewAllConversations: true,
      canExportData: true,
      canManageUsers: true,
    },
    ui: {
      showLoginPrompt: false,
      showLimitWarning: false,
      showFeedback: true,
      showHistoryButton: true,
      showAnalyticsButton: true,
      showAdminPanel: true,
    },
  },
};

/**
 * Obtiene configuración de un rol específico
 */
export const getRoleConfig = (role) => {
  return ROLE_CONFIG[role] || ROLE_CONFIG[USER_ROLES.VISITANTE];
};

/**
 * Obtiene límites específicos de un rol
 */
export const getRoleLimits = (role) => {
  const config = getRoleConfig(role);
  return config?.limits || {};
};

/**
 * Obtiene características de un rol
 */
export const getRoleFeatures = (role) => {
  const config = getRoleConfig(role);
  return config?.features || {};
};

/**
 * Obtiene configuración UI de un rol
 */
export const getRoleUIConfig = (role) => {
  const config = getRoleConfig(role);
  return config?.ui || {};
};

/**
 * Verifica si un rol tiene una característica específica
 */
export const hasFeature = (role, feature) => {
  const features = getRoleFeatures(role);
  return features[feature] === true;
};

/**
 * Obtiene el límite de preguntas para un rol
 */
export const getMaxQuestions = (role) => {
  const limits = getRoleLimits(role);
  return limits.maxQuestionsPerSession;
};

export default ROLE_CONFIG;
