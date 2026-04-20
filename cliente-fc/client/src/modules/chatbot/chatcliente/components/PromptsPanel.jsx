/**
 * PromptsPanel.jsx
 * Panel de gestión de prompts con protección por roles
 * Solo administradores pueden crear, editar y eliminar prompts
 */

import React from 'react';
import { Alert, Box, Typography, Button } from '@mui/material';
import { Lock as LockIcon, Login as LoginIcon } from '@mui/icons-material';
import useRoles from './useRoles';
import { AdminOnly } from './ProtectedComponent';
import Prompts from '../views/Prompts';

/**
 * Wrapper de protección para el panel de prompts
 */
export const PromptsPanel = ({ onLoginClick }) => {
  const { isAdmin, isLoggedIn, validateAccess } = useRoles();

  // Validar acceso
  const accessValidation = validateAccess('editPrompt');

  if (!accessValidation.allowed) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          p: 3,
        }}
      >
        <Alert
          severity="warning"
          icon={<LockIcon />}
          sx={{ maxWidth: '600px', width: '100%' }}
        >
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            🔒 Acceso Solo para Administradores
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Solo los administradores pueden gestionar los prompts del chatbot.
            <br />
            <br />
            Si eres administrador, inicia sesión para continuar.
          </Typography>
          {!isLoggedIn() && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<LoginIcon />}
              onClick={onLoginClick}
              sx={{ mt: 2 }}
            >
              Iniciar Sesión como Administrador
            </Button>
          )}
        </Alert>
      </Box>
    );
  }

  // Si tiene acceso, mostrar el componente de prompts
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2">
          ✅ Como administrador, tienes acceso completo a la gestión de prompts.
        </Typography>
      </Alert>
      <Prompts />
    </Box>
  );
};

export default PromptsPanel;
