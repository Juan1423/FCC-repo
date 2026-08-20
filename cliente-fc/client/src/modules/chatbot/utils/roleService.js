/**
 * roleService.js
 * Servicio para manejar roles, permisos y control de acceso en el chatbot
 */

import { getUserInfo, isAuthenticated } from '../../../services/authServices';
import { USER_ROLES, ROLE_PERMISSIONS, ROLE_LIMITS, ACCESS_DENIED_MESSAGES } from './roleConstants';

class RoleService {
  /**
   * Obtiene el rol actual del usuario
   * Si no está autenticado, retorna VISITANTE
   */
  static getCurrentRole() {
    if (!isAuthenticated()) {
      return USER_ROLES.VISITANTE;
    }

    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.rol) {
        return USER_ROLES.VISITANTE;
      }

      // Validar que el rol sea uno de los permitidos
      const validRole = Object.values(USER_ROLES).includes(userInfo.rol);
      return validRole ? userInfo.rol : USER_ROLES.VISITANTE;
    } catch (error) {
      console.error('Error obteniendo rol actual:', error);
      return USER_ROLES.VISITANTE;
    }
  }

  /**
   * Obtiene la información del usuario actual
   */
  static getCurrentUser() {
    if (!isAuthenticated()) {
      return {
        id: null,
        nombre: 'Visitante',
        rol: USER_ROLES.VISITANTE,
        isAuthenticated: false,
      };
    }

    try {
      const userInfo = getUserInfo();
      return {
        id: userInfo.user,
        nombre: userInfo.nombre || 'Usuario',
        rol: userInfo.rol || USER_ROLES.VISITANTE,
        isAuthenticated: true,
      };
    } catch (error) {
      console.error('Error obteniendo info del usuario:', error);
      return {
        id: null,
        nombre: 'Visitante',
        rol: USER_ROLES.VISITANTE,
        isAuthenticated: false,
      };
    }
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permission - Nombre del permiso a verificar
   * @returns {boolean}
   */
  static hasPermission(permission) {
    const role = this.getCurrentRole();
    const permissions = ROLE_PERMISSIONS[role] || {};
    return permissions[permission] === true;
  }

  /**
   * Verifica si el usuario tiene TODOS los permisos especificados
   * @param {array} permissions - Permisos a verificar
   * @returns {boolean}
   */
  static hasAllPermissions(permissions) {
    return permissions.every(perm => this.hasPermission(perm));
  }

  /**
   * Verifica si el usuario tiene ALGUNO de los permisos especificados
   * @param {array} permissions - Permisos a verificar
   * @returns {boolean}
   */
  static hasAnyPermission(permissions) {
    return permissions.some(perm => this.hasPermission(perm));
  }

  /**
   * Obtiene los límites del rol actual
   */
  static getRoleLimits() {
    const role = this.getCurrentRole();
    return ROLE_LIMITS[role] || {};
  }

  /**
   * Obtiene el límite de preguntas por sesión
   */
  static getMaxQuestionsPerSession() {
    const limits = this.getRoleLimits();
    return limits.maxQuestionsPerSession;
  }

  /**
   * Verifica si el usuario es administrador
   */
  static isAdmin() {
    return this.getCurrentRole() === USER_ROLES.ADMINISTRADOR;
  }

  /**
   * Verifica si el usuario es visitante
   */
  static isVisitor() {
    return this.getCurrentRole() === USER_ROLES.VISITANTE;
  }

  /**
   * Verifica si el usuario es personal de salud
   */
  static isHealthcareProfessional() {
    return this.getCurrentRole() === USER_ROLES.PERSONAL_SALUD;
  }

  /**
   * Verifica si el usuario es usuario común
   */
  static isCommonUser() {
    return this.getCurrentRole() === USER_ROLES.USUARIO_COMUN;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static isLoggedIn() {
    return isAuthenticated();
  }

  /**
   * Obtiene el mensaje de acceso denegado para una acción
   */
  static getDeniedMessage(action) {
    return ACCESS_DENIED_MESSAGES[action] || 'No tienes permisos para esta acción.';
  }

  /**
   * Registra intentos de acceso no autorizado (para auditoría)
   */
  static logUnauthorizedAccess(action, details = {}) {
    const user = this.getCurrentUser();
    const timestamp = new Date().toISOString();
    
    const logEntry = {
      timestamp,
      action,
      userRole: user.rol,
      userId: user.id,
      details,
    };

    // En desarrollo, mostrar en consola
    if (process.env.NODE_ENV === 'development') {
      console.warn('[UNAUTHORIZED ACCESS ATTEMPT]', logEntry);
    }

    // Aquí se podría enviar a un servidor de auditoría
    // this.sendAuditLog(logEntry);
  }

  /**
   * Obtiene información detallada del rol
   */
  static getRoleInfo() {
    const role = this.getCurrentRole();
    const permissions = ROLE_PERMISSIONS[role] || {};
    const limits = ROLE_LIMITS[role] || {};

    return {
      role,
      permissions,
      limits,
    };
  }

  /**
   * Valida si un usuario puede ejecutar una acción
   * Retorna { allowed: boolean, message?: string }
   */
  static validateAccess(action) {
    if (!this.hasPermission(action)) {
      return {
        allowed: false,
        message: this.getDeniedMessage(action),
        action,
        role: this.getCurrentRole(),
      };
    }

    return {
      allowed: true,
      action,
      role: this.getCurrentRole(),
    };
  }

  /**
   * Obtiene un resumen del usuario y sus capacidades
   */
  static getUserSummary() {
    const user = this.getCurrentUser();
    const limits = this.getRoleLimits();
    const role = this.getCurrentRole();

    return {
      user,
      role,
      limits,
      capabilities: {
        canManagePrompts: this.hasPermission('editPrompt'),
        canAccessChatbot: this.hasPermission('accessChatbot'),
        canViewHistory: this.hasPermission('viewOwnConversations'),
        canViewAnalytics: this.hasPermission('viewAnalytics'),
      },
    };
  }
}

export default RoleService;
