/**
 * ChatBotIAWithRoles.jsx
 * Versión del ChatBot con control de roles integrado
 * Implementa límites para visitantes y validaciones de acceso
 */

import React, { useState, useEffect } from 'react';
import { Box, Dialog, Typography, Button } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import useRoles from './useRoles';
import VisitorLimitWarning from './VisitorLimitWarning';
import { ChatBotIA } from '../../../components/ChatBotIA';

/**
 * Wrapper que añade control de roles al ChatBotIA original
 */
export const ChatBotIAWithRoles = ({ 
  onClose, 
  selectedPrompt, 
  forceClearMemory,
  onLoginRequired,
}) => {
  const { isVisitor, isLoggedIn, user, limits, refresh } = useRoles();
  const [questionCount, setQuestionCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  const maxQuestions = limits.maxQuestionsPerSession || 5;
  // clave de almacenamiento; incluye id de usuario si está autenticado
  const storageKey = isVisitor() ? 'visitorQuestionCount' : `userQuestionCount_${user?.id}`;

  // Monitorear preguntas según role y límites
  useEffect(() => {
    if (maxQuestions) {
      // Cargar contador de storage
      const savedCount = parseInt(localStorage.getItem(storageKey) || '0');
      setQuestionCount(savedCount);

      if (savedCount >= maxQuestions) {
        setHasReachedLimit(true);
      }
    }
  }, [storageKey, maxQuestions]);

  const handleQuestionAsked = () => {
    if (!maxQuestions) return;

    const newCount = questionCount + 1;
    setQuestionCount(newCount);
    localStorage.setItem(storageKey, String(newCount));

    if (newCount >= maxQuestions) {
      setHasReachedLimit(true);
      if (isVisitor()) {
        // Mostrar modal pidiendo login después de un corto delay
        setTimeout(() => setShowLoginPrompt(true), 1500);
      }
    }
  };

  const handleLoginClick = () => {
    setShowLoginPrompt(false);
    if (onLoginRequired) {
      onLoginRequired();
    }
    refresh();
  };

  if (hasReachedLimit) {
    // mostrar mensaje genérico; si es visitante invitar a login, si es usuario común simplemente avisar
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
          textAlign: 'center',
          minHeight: '400px',
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          🎯 Límite de Preguntas Alcanzado
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          {isVisitor()
            ? `Como visitante, tenías un límite de ${maxQuestions} preguntas.`
            : `Has alcanzado tu límite de ${maxQuestions} preguntas por sesión.`}
          <br />
          {isVisitor() && <strong>Inicia sesión para acceso ilimitado al chatbot.</strong>}
        </Typography>
        {isVisitor() && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<LoginIcon />}
            onClick={handleLoginClick}
            size="large"
          >
            Iniciar Sesión
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Mostrar advertencia si es visitante */}
      {isVisitor() && (
        <VisitorLimitWarning
          currentQuestions={questionCount}
          onLoginClick={() => setShowLoginPrompt(true)}
        />
      )}

      {/* Modal pidiendo login al alcanzar límite */}
      <Dialog open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)}>
        <Box sx={{ p: 3, minWidth: '400px' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            ✨ Acceso Ilimitado Disponible
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Has alcanzado el límite de preguntas como visitante.
            <br />
            <br />
            Inicia sesión para:
            <ul style={{ marginTop: '10px' }}>
              <li>Acceso ilimitado al chatbot</li>
              <li>Guardar historial de conversaciones</li>
              <li>Recibir recomendaciones personalizadas</li>
            </ul>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setShowLoginPrompt(false)}>Cancelar</Button>
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={handleLoginClick}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* ChatBot original */}
      <ChatBotIA
        onClose={onClose}
        selectedPrompt={selectedPrompt}
        forceClearMemory={forceClearMemory}
        onQuestionAsked={handleQuestionAsked}
        maxQuestions={maxQuestions}          // enviar siempre el límite (puede ser null)
        isVisitor={isVisitor()}
      />
    </Box>
  );
};

export default ChatBotIAWithRoles;
