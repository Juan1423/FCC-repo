/**
 * index.js
 * Exporta todos los componentes y servicios de roles de forma organizada
 * 
 * Uso:
 * import { useRoles, RoleService, ChatClienteRouter } from './components';
 */

// ========== CONSTANTES ==========
export { USER_ROLES, ROLE_PERMISSIONS, ROLE_LIMITS, ACCESS_DENIED_MESSAGES, ROLE_LABELS } from './roleConstants';

// ========== SERVICIOS ==========
export { default as RoleService } from './roleService';

// ========== CONFIGURACIÓN ==========
export { 
  ROLE_CONFIG, 
  getRoleConfig, 
  getRoleLimits, 
  getRoleFeatures, 
  getRoleUIConfig, 
  hasFeature, 
  getMaxQuestions 
} from './roleConfig';

// ========== HOOKS ==========
export { default as useRoles } from './useRoles';

// ========== COMPONENTES DE PROTECCIÓN ==========
export { 
  default as ProtectedComponent,
  AdminOnly, 
  AuthRequired 
} from './ProtectedComponent';

export { default as VisitorLimitWarning } from './VisitorLimitWarning';

// ========== COMPONENTES CON ROLES ==========
export { ChatBotIAWithRoles } from './ChatBotIAWithRoles';
export { PromptsPanel } from './PromptsPanel';
export { default as ChatClienteRouter } from './ChatClienteRouter';

/**
 * EXPORTACIÓN SIMPLIFICADA
 * 
 * Importar todo:
 * import * as RoleSystem from './components';
 * RoleSystem.useRoles()
 * RoleSystem.ChatClienteRouter
 * 
 * O importar específicos:
 * import { useRoles, ChatClienteRouter, ProtectedComponent } from './components';
 */
