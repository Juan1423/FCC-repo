// ChatBotIA.jsx
import React, { useState, useRef, useEffect } from 'react';
import { enviarPreguntaAI, enviarFeedback } from '../services/openaiService';
import { login, getUserInfo, getAuthToken } from '../services/authServices';
import { Modal, Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import './ChatBotIA.css';

/**
 * ChatBotIA Component
 * 
 * Props:
 * - onClose: Función al cerrar el modal
 * - selectedPrompt: Prompt seleccionado
 * - forceClearMemory: Forzar limpiar memoria
 * - maxQuestions: Límite de preguntas (null = sin límite) - NUEVO
 * - onQuestionAsked: Callback cuando se hace una pregunta - NUEVO
 * - isVisitor: Si es visitante (no mostrar login modal) - NUEVO
 * - showLoginModalInitially: Mostrar login modal al abrir - NUEVO
 * - onLoginModalClose: Callback cuando se cierra el login modal - NUEVO
 */
export const ChatBotIA = ({ 
  onClose, 
  selectedPrompt, 
  forceClearMemory,
  maxQuestions = null, // Por defecto sin límite (puede ser 5 para visitantes)
  onQuestionAsked, // Callback para rastrear preguntas
  isVisitor = false, // Si es visitante, no mostrar login
  showLoginModalInitially = false, // Mostrar login modal al abrir
  onLoginModalClose, // Callback cuando se cierra el login modal
  onLoginSuccess, // Callback cuando el login es exitoso
}) => {
  console.log('ChatBotIA props:', { showLoginModalInitially, isVisitor, onLoginSuccess: !!onLoginSuccess });
  
  const [messages, setMessages] = useState([
    { from: 'bot', text: '¡Hola! Soy el chatbot de la Fundación. ¿En qué puedo ayudarte?' }
  ]);
  const [input, setInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [consentimientoAccepted, setConsentimientoAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const chatbotRef = useRef(null);

  // Verificar sesión existente o mostrar login según props
  useEffect(() => {
    console.log('ChatBotIA montado - showLoginModalInitially:', showLoginModalInitially, 'isVisitor:', isVisitor);
    
    // Si es visitante, no mostrar login modal
    if (isVisitor) {
      setShowLogin(false);
      return;
    }
    
    // Si se pidió mostrar login modal inicialmente, mostrarlo
    if (showLoginModalInitially) {
      setShowLogin(true);
      return;
    }
    
    // Verificar si ya hay sesión activa
    const token = getAuthToken();
    if (token && !isLoggedIn) {
      try {
        const userInfo = getUserInfo();
        if (userInfo && userInfo.nombre) {
          setUser(userInfo);
          setUserName(userInfo.nombre);
          setIsLoggedIn(true);
          setShowLogin(false);
          console.log('Sesión verificada:', userInfo.nombre);
        }
      } catch (error) {
        setShowLogin(true);
      }
    }
  }, [showLoginModalInitially, isVisitor]);

  // Si se fuerza borrar memoria desde fuera - SOLO limpia la sesión actual, NO la BD
  useEffect(() => {
    if (forceClearMemory) {
      setMessages([{ from: 'bot', text: '¡Hola! Soy el chatbot de la Fundación. ¿En qué puedo ayudarte?' }]);
      setCurrentConversationId(null);
      setShowFeedback(false);
      setQuestionCount(0);
      console.log('Sesión del chat limpiada (memoria local). Los datos en BD se mantienen.');
    }
  }, [forceClearMemory]);

  // Mostrar notificación cuando se selecciona un nuevo prompt
  useEffect(() => {
    if (selectedPrompt && selectedPrompt.titulo) {
      setSnackbar({ 
        open: true, 
        message: `✓ Usando prompt: "${selectedPrompt.titulo}"`, 
        type: 'info' 
      });
    }
  }, [selectedPrompt]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };



  const sendMessage = async () => {
    if (input.trim() === '') return;

    if (!consentimientoAccepted) {
      setSnackbar({ open: true, message: 'Debes aceptar los términos y consentimiento para usar el chatbot', type: 'warning' });
      return;
    }

    // Verificar límite de preguntas (ahora flexible según rol)
    const userMessages = messages.filter(msg => msg.from === 'user').length;
    
    // Si maxQuestions está definido (no null), verificar límite
    if (maxQuestions !== null && userMessages >= maxQuestions) {
      setMessages(prev => [...prev, { from: 'bot', text: `Has alcanzado el límite de ${maxQuestions} preguntas. Inicia sesión para acceso ilimitado.` }]);
      return;
    }

    const userMessage = input;
    setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
    setInput('');
    setIsSending(true);

    console.log('Enviando mensaje:', userMessage, 'con promptId:', selectedPrompt ? selectedPrompt.id_prompt : null);

    try {
      const result = await enviarPreguntaAI(
        userMessage,
        selectedPrompt ? selectedPrompt.id_prompt : null,
        consentimientoAccepted,
        { clientTime: new Date().toISOString() },
        selectedPrompt ? selectedPrompt.promptText : null
      );
      console.log('Respuesta del bot:', result);
      setMessages(prev => [...prev, { from: 'bot', text: result.respuesta || result }]);
      if (result.id_conversacion) {
        setCurrentConversationId(result.id_conversacion);
        setShowFeedback(true);
      }
      
      // Notificar que se hizo una pregunta (para contador de visitantes)
      if (onQuestionAsked) {
        onQuestionAsked();
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      let errorMessage = 'Lo siento, hubo un error al responder.';
      
      if (error.message) {
        errorMessage += ` Detalles: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { from: 'bot', text: errorMessage }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setSnackbar({ open: true, message: 'Por favor ingresa email y contraseña', type: 'error' });
      return;
    }

    if (!loginData.email.includes('@')) {
      setSnackbar({ open: true, message: 'Por favor ingresa un email válido', type: 'error' });
      return;
    }

    setLoginLoading(true);
    try {
      const response = await login({ correo_usuario: loginData.email, password_usuario: loginData.password });
      
      console.log('Login response:', response);
      
      if (response && response.success && response.token) {
        // Guardar el nombre del usuario
        const nombreUsuario = response.data?.nombre_usuario || response.data?.nombre || 'Usuario';
        setUserName(nombreUsuario);
        setUser(response.data);
        setIsLoggedIn(true); // Marcar como logueado
        setShowLogin(false); // Cerrar modal de login
        setLoginData({ email: '', password: '' });
        setMessages([{ from: 'bot', text: '¡Hola! Soy el chatbot de la Fundación. ¿En qué puedo ayudarte?' }]);
        
        // Si se abrió desde el modal de acceso (showLoginModalInitially), solo permitir chat sin redirigir
        // Si se abrió normalmente, permitir que se cierre y use el sistema
        if (!showLoginModalInitially && onLoginModalClose) {
          onLoginModalClose();
        }
        
        setSnackbar({ open: true, message: `¡Bienvenido ${nombreUsuario}! Acceso ilimitado activado.`, type: 'success' });
        
        // Notificar al componente padre que el login fue exitoso
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setSnackbar({ open: true, message: 'Credenciales inválidas. Verifica email y contraseña', type: 'error' });
      }
    } catch (error) {
      console.error('Error en login:', error);
      let mensajeError = 'Error al iniciar sesión';
      if (error.response?.status === 401) {
        mensajeError = 'Email o contraseña incorrectos';
      } else if (error.response?.status === 404) {
        mensajeError = 'Usuario no encontrado';
      } else if (error.message === 'Network Error') {
        mensajeError = 'Error de conexión. Verifica tu internet';
      }
      setSnackbar({ open: true, message: mensajeError, type: 'error' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFeedback = async (calificacion, comentario = '') => {
    if (currentConversationId) {
      try {
        await enviarFeedback(currentConversationId, calificacion, comentario);
        setShowFeedback(false);
      } catch (error) {
        console.error('Error enviando feedback:', error);
      }
    }
  };

  const testPrompt = () => {
    sendMessage("Hola, ¿puedes describir tus servicios?");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Ícono flotante para restaurar cuando está minimizado */}
      {isMinimized && (
        <div
          onClick={() => setIsMinimized(false)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#1976d2',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 999,
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          💬
        </div>
      )}
      {/* Chatbot modal - solo mostrar si no está minimizado */}
      {!isMinimized && (
        <div className="chatbot-modal-overlay" onClick={(e) => {
          // Minimiza el chatbot si se hace clic fuera del contenedor
          // La conversación se mantiene guardada en la BD
          if (e.target === e.currentTarget) {
            setIsMinimized(true);
          }
        }}>
          <div className="chatbot-container" ref={chatbotRef} onClick={(e) => e.stopPropagation()}>
        <div className="chatbot-header" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#1976d2', color: 'white', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: '12px 16px' }}>
          <span style={{ fontSize: 32, marginRight: 8 }} role="img" aria-label="robot">🤖</span>
          <span style={{ fontWeight: 'bold', fontSize: 18 }}>Chat con Fundación {userName ? `- ${userName}` : ''}</span>
        </div>
        <div className="chatbot-messages">
          {messages && messages.length > 0 ? (
            messages.map((msg, i) => (
              <div key={i} className={`message ${msg.from}`}>
                {msg.text}
              </div>
            ))
          ) : (
            <div className="message bot">¡Hola! Soy el chatbot de la Fundación. ¿En qué puedo ayudarte?</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Sin feedback ni botones extra */}
        <div style={{ padding: '8px 12px', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <input
              type="checkbox"
              checked={consentimientoAccepted}
              onChange={(e) => {
                if (e.target.checked) {
                  setShowTermsModal(true);
                }
              }}
              id="consentimiento-checkbox"
            />
            <label htmlFor="consentimiento-checkbox" style={{ fontSize: 13, color: '#333', cursor: 'pointer' }}>
              Acepto los términos y condiciones
            </label>
          </div>
        </div>
        <div className="chatbot-input" style={{ display: 'flex', gap: 8, borderTop: '1px solid #ccc', padding: '8px' }}>
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button 
            onClick={sendMessage} 
            disabled={isSending}
            style={{ 
              padding: '8px 12px', 
              background: '#1976d2', 
              color: 'white', 
              border: 'none', 
              borderRadius: 6, 
              cursor: isSending ? 'not-allowed' : 'pointer',
              opacity: isSending ? 0.6 : 1
            }}
          >
            {isSending ? '...' : 'Enviar'}
          </button>
        </div>
        {/* Login modal al abrir si no hay token */}
        {showLogin && (
          <Modal 
            open={showLogin} 
            onClose={() => { /* No permitir cerrar sin login */ }}
            slots={{ backdrop: 'div' }}
            slotProps={{ backdrop: { sx: { zIndex: 9998 } } }}
          >
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 3, zIndex: 9999 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 40 }} role="img" aria-label="robot">🤖</span>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', margin: 0 }}>Iniciar Sesión</Typography>
              </div>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>Ingresa tus credenciales para acceder al chatbot</Typography>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                margin="normal"
                disabled={loginLoading}
                autoFocus
              />
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                margin="normal"
                disabled={loginLoading}
              />
              <Button 
                fullWidth 
                onClick={handleLogin} 
                variant="contained" 
                sx={{ mt: 3, background: '#1976d2', fontWeight: 'bold', padding: '10px' }}
                disabled={loginLoading}
              >
                {loginLoading ? 'Iniciando...' : 'Ingresar'}
              </Button>
            </Box>
          </Modal>
        )}
        {/* Modal de términos y condiciones */}
        {showTermsModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }} onClick={() => {
            // Cerrar al hacer clic en el overlay (fuera del modal)
            setShowTermsModal(false);
            setConsentimientoAccepted(false);
          }}>
            <Box 
              sx={{
                position: 'relative',
                width: 500,
                maxHeight: '80vh',
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: 3,
                p: 3,
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Términos y Condiciones
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                Al usar este chatbot, aceptas que:
              </Typography>
              <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#444', marginBottom: '16px' }}>
                <p>
                  <strong>1. Recolección de datos:</strong> Registramos tu nombre, email y el contenido de nuestras conversaciones para mejorar el servicio y proporcionar soporte.
                </p>
                <p>
                  <strong>2. Privacidad:</strong> Tus datos se protegen bajo medidas de seguridad estándar. No compartimos información personal con terceros sin consentimiento.
                </p>
                <p>
                  <strong>3. Uso del servicio:</strong> Usaremos tus preguntas y respuestas para entrenar y mejorar nuestros modelos de IA, manteniendo confidencialidad.
                </p>
                <p>
                  <strong>4. Responsabilidad:</strong> Las respuestas del chatbot son informativos. No reemplazamos asesoría médica, legal o profesional. 
                </p>
                <p>
                  <strong>5. Modificaciones:</strong> Nos reservamos el derecho de modificar estos términos en cualquier momento.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setShowTermsModal(false);
                    setConsentimientoAccepted(false);
                  }}
                >
                  Rechazar
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setConsentimientoAccepted(true);
                    setShowTermsModal(false);
                    setSnackbar({ open: true, message: 'Términos aceptados. Ahora puedes usar el chatbot.', type: 'success' });
                  }}
                >
                  Aceptar
                </Button>
              </div>
            </Box>
          </div>
        )}
        {/* Snackbar para notificaciones - centrado en pantalla */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            '& .MuiPaper-root': {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '350px'
            }
          }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.type}
            sx={{ width: '100%', fontSize: '16px', minWidth: '350px' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
      </div>
      )}
    </>
  );
};

