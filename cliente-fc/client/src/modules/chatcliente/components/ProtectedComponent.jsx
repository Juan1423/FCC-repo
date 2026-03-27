/**
 * ProtectedComponent.jsx
 * Wrapper para proteger componentes con control de acceso basado en roles
 * Muestra mensaje de acceso denegado si no tiene permisos
 */

import React from 'react';
import { Alert, Box, Typography, Button } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import useRoles from './useRoles';

/**
 * @component ProtectedComponent
 * Envuelve un componente y requiere permisos específicos
 * 
 * @example
 * <ProtectedComponent
 *   requiredPermissions={['editPrompt', 'deletePrompt']}
 *   requireAll={true}
 * >
 *   <PromptsPanel />
 * </ProtectedComponent>
 * 
 * @param {React.ReactNode} children - Componente a proteger
 * @param {string|array} requiredPermissions - Permiso(s) requerido(s)
 * @param {boolean} requireAll - Si es true, necesita TODOS los permisos. Si es false, necesita ALGUNO
 * @param {string} fallbackMessage - Mensaje cuando acceso es denegado
 * @param {boolean} showLoginButton - Mostrar botón para ir a login
 */
export const ProtectedComponent = ({
  children,
  requiredPermissions,
  requireAll = true,
  fallbackMessage,
  showLoginButton = false,
  onLoginClick,
}) => {
  const { hasAllPermissions, hasAnyPermission, isLoggedIn } = useRoles();

  // Normalizar permisos a array
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  // Verificar si tiene permisos
  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          p: 3,
        }}
      >
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{ maxWidth: '600px', width: '100%' }}
        >
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            Acceso Denegado
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {fallbackMessage ||
              `No tienes permisos para acceder a esta sección. Se requieren los siguientes permisos: ${permissions.join(', ')}`}
          </Typography>
          {showLoginButton && !isLoggedIn() && (
            <Button
              variant="contained"
              color="warning"
              onClick={onLoginClick}
              sx={{ mt: 1 }}
            >
              Ir a Iniciar Sesión
            </Button>
          )}
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

/**
 * Wrapper para componentes que requieren ser Admin
 */
export const AdminOnly = ({ children, fallbackMessage }) => {
  return (
    <ProtectedComponent
      requiredPermissions={['editPrompt', 'deletePrompt']}
      requireAll={true}
      fallbackMessage={
        fallbackMessage || 'Solo los administradores pueden acceder a esta sección.'
      }
    >
      {children}
    </ProtectedComponent>
  );
};

/**
 * Wrapper para componentes que requieren estar autenticado
 */
export const AuthRequired = ({ children, fallbackMessage, onLoginClick }) => {
  return (
    <ProtectedComponent
      requiredPermissions={['accessChatbot']}
      requireAll={true}
      fallbackMessage={
        fallbackMessage || 'Debes iniciar sesión para acceder a esta sección.'
      }
      showLoginButton={true}
      onLoginClick={onLoginClick}
    >
      {children}
    </ProtectedComponent>
  );
};

export default ProtectedComponent;
