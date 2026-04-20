/**
 * useRoles.js
 * Custom hook para acceder a información de roles en componentes
 * Simplifica el acceso a funciones del RoleService
 */

import { useState, useEffect, useCallback } from 'react';
import RoleService from './roleService';

const useRoles = () => {
  const [role, setRole] = useState(RoleService.getCurrentRole());
  const [user, setUser] = useState(RoleService.getCurrentUser());
  const [limits, setLimits] = useState(RoleService.getRoleLimits());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Actualizar cuando el storage cambie (logout, etc)
  useEffect(() => {
    const handleStorageChange = () => {
      setRole(RoleService.getCurrentRole());
      setUser(RoleService.getCurrentUser());
      setLimits(RoleService.getRoleLimits());
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Métodos de verificación de rol
  const isAdmin = useCallback(() => RoleService.isAdmin(), []);
  const isVisitor = useCallback(() => RoleService.isVisitor(), []);
  const isHealthcareProfessional = useCallback(() => RoleService.isHealthcareProfessional(), []);
  const isCommonUser = useCallback(() => RoleService.isCommonUser(), []);
  const isLoggedIn = useCallback(() => RoleService.isLoggedIn(), []);

  // Métodos de permisos
  const hasPermission = useCallback((permission) => RoleService.hasPermission(permission), []);
  const hasAllPermissions = useCallback((permissions) => RoleService.hasAllPermissions(permissions), []);
  const hasAnyPermission = useCallback((permissions) => RoleService.hasAnyPermission(permissions), []);

  // Método para validar acceso
  const validateAccess = useCallback((action) => RoleService.validateAccess(action), []);

  // Método para refrescar información (después de login/logout)
  const refresh = useCallback(() => {
    setRole(RoleService.getCurrentRole());
    setUser(RoleService.getCurrentUser());
    setLimits(RoleService.getRoleLimits());
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    // Info actual
    role,
    user,
    limits,
    refreshTrigger,

    // Verificaciones de rol
    isAdmin,
    isVisitor,
    isHealthcareProfessional,
    isCommonUser,
    isLoggedIn,

    // Verificaciones de permisos
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,

    // Validación
    validateAccess,

    // Controles
    refresh,
  };
};

export default useRoles;
