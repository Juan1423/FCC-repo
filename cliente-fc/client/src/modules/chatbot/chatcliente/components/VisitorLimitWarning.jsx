/**
 * VisitorLimitWarning.jsx
 * Componente que muestra advertencia cuando visitante está cerca del límite de preguntas
 */

import React from 'react';
import { Alert, Box, Typography, LinearProgress, Button } from '@mui/material';
import { Info as InfoIcon, Login as LoginIcon } from '@mui/icons-material';
import useRoles from './useRoles';

export const VisitorLimitWarning = ({
  currentQuestions,
  onLoginClick,
  variant = 'warning', // 'info', 'warning', 'error'
}) => {
  const { isVisitor, limits, isLoggedIn } = useRoles();

  // mostrar si hay un límite definido ya sea visitante o usuario
  if (!limits.maxQuestionsPerSession) {
    return null;
  }

  const maxQuestions = limits.maxQuestionsPerSession;
  const remainingQuestions = maxQuestions - currentQuestions;
  const percentage = (currentQuestions / maxQuestions) * 100;

  // Determinar variante según progreso
  let displayVariant = 'info';
  if (percentage >= 80) {
    displayVariant = 'error';
  } else if (percentage >= 60) {
    displayVariant = 'warning';
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity={displayVariant}
        icon={<InfoIcon />}
        sx={{
          mb: 1,
          backgroundColor: (theme) => {
            if (displayVariant === 'error')
              return theme.palette.error.light;
            if (displayVariant === 'warning')
              return theme.palette.warning.light;
            return theme.palette.info.light;
          },
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>
            {isLoggedIn() ?
              `Tienes un límite de ${maxQuestions} preguntas por sesión` :
              `Como visitante, tienes un límite de ${maxQuestions} preguntas`}
          </strong>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                backgroundColor: (theme) => theme.palette.divider,
                '& .MuiLinearProgress-bar': {
                  backgroundColor:
                    percentage >= 80 ? '#d32f2f' : '#ff9800',
                },
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ minWidth: '80px' }}>
            {currentQuestions}/{maxQuestions} preguntas
          </Typography>
        </Box>

        {remainingQuestions <= 2 && remainingQuestions > 0 && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'error.main',
              fontWeight: 'bold',
              mb: 1,
            }}
          >
            ⚠️ Solo {remainingQuestions} {remainingQuestions === 1 ? 'pregunta' : 'preguntas'} restante{remainingQuestions === 1 ? '' : 's'}
          </Typography>
        )}

        {remainingQuestions <= 0 && currentQuestions >= maxQuestions && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'error.main',
              fontWeight: 'bold',
              mb: 1,
            }}
          >
            ❌ Has alcanzado el límite de preguntas
          </Typography>
        )}

        {isVisitor() && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<LoginIcon />}
            onClick={onLoginClick}
            sx={{ mt: 1 }}
          >
            Inicia Sesión para Acceso Ilimitado
          </Button>
        )}
      </Alert>
    </Box>
  );
};

export default VisitorLimitWarning;
