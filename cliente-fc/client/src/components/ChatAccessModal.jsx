import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import { createUsuarioAnonimo } from '../services/chatbotAdminServices';

/**
 * Modal que aparece cuando el usuario hace clic en el botón FAB del chatbot
 * Permite elegir entre:
 * 1. Iniciar sesión con credenciales
 * 2. Acceder como visitante (30 preguntas)
 */
const ChatAccessModal = ({ open, onClose, onContinueAsVisitor, onLoginClick }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('choice'); // 'choice' | 'register' | 'continuing'
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si el visitante ya está registrado
  useEffect(() => {
    if (open) {
      const visitorName = localStorage.getItem('visitorName');
      const visitorCedula = localStorage.getItem('visitorCedula');
      
      // Si ya hay visitante registrado, mostrar paso de continuación
      if (visitorName && visitorCedula) {
        setStep('continuing');
        setNombre(visitorName);
        setCedula(visitorCedula);
      } else {
        setStep('choice');
      }
    }
  }, [open]);

  const handleLoginClick = () => {
    setStep('choice');
    onClose();
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleVisitorClick = () => {
    setStep('register');
  };

  const handleContinueAsExistingVisitor = () => {
    const visitorId = localStorage.getItem('visitorId');
    onClose();
    if (onContinueAsVisitor) {
      onContinueAsVisitor({ nombre, cedula, id: visitorId });
    }
  };

  const handleChangeVisitor = () => {
    setStep('register');
    setNombre('');
    setCedula('');
  };

  const handleRegisterVisitor = async () => {
    if (!nombre.trim() || !cedula.trim()) {
      setError('Por favor completa nombre y cédula');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await createUsuarioAnonimo({ nombre, cedula });
      if (response && response.success) {
        // Guardar datos en localStorage para identificar al visitante
        localStorage.setItem('visitorName', nombre);
        localStorage.setItem('visitorCedula', cedula);

        // Guardar el ID único del usuario anónimo para poder asociar sus conversaciones
        const visitorId = response.data?.id_usuario_anonimo || response.data?.id || null;
        if (visitorId) {
          localStorage.setItem('visitorId', visitorId);
        }

        setStep('choice');
        setNombre('');
        setCedula('');
        onClose();
        if (onContinueAsVisitor) {
          onContinueAsVisitor({ nombre, cedula, id: visitorId });
        }
      } else {
        setError(response.message || 'Error al registrar visitante');
      }
    } catch (err) {
      console.error('Error registrando visitante:', err);
      const message = err?.message || 'Error al registrar visitante. Intenta de nuevo.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToChoice = () => {
    setError(null);
    setStep('choice');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h6" component="span">
          🤖 Chat con Fundación
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {step === 'choice' ? (
          <> 
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'gray' }}>
              ¿Cómo deseas continuar?
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Opción 1: Iniciar Sesión */}
              <Button
                variant="contained"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={handleLoginClick}
                sx={{
                  p: 2,
                  justifyContent: 'flex-start',
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                }}
              >
                <Box sx={{ textAlign: 'left', ml: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Iniciar Sesión
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.7)' }}>
                    Con credenciales (acceso ilimitado)
                  </Typography>
                </Box>
              </Button>

              <Divider sx={{ my: 1 }}>O</Divider>

              {/* Opción 2: Acceder como Visitante */}
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PersonIcon />}
                onClick={handleVisitorClick}
                sx={{
                  p: 2,
                  justifyContent: 'flex-start',
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                }}
              >
                <Box sx={{ textAlign: 'left', ml: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Registrarme como Visitante
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'textSecondary' }}>
                    Crea tu usuario con nombre y cédula para usar el chatbot
                  </Typography>
                </Box>
              </Button>
            </Box>
          </>
        ) : step === 'continuing' ? (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <PersonIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                ¡Bienvenido de nuevo!
              </Typography>
              <Typography variant="body2" sx={{ color: 'gray' }}>
                Ya tienes datos registrados
              </Typography>
            </Box>

            <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 2, mb: 2, border: '1px solid #90caf9' }}>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'textSecondary', fontWeight: 600 }}>
                  NOMBRE REGISTRADO
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2', mt: 0.5 }}>
                  {nombre}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'textSecondary', fontWeight: 600 }}>
                  CÉDULA REGISTRADA
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2', mt: 0.5 }}>
                  {cedula}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleContinueAsExistingVisitor}
                sx={{
                  p: 1.5,
                  backgroundColor: '#4caf50',
                  '&:hover': {
                    backgroundColor: '#45a049',
                  },
                }}
              >
                ✓ Continuar con estos datos
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleChangeVisitor}
                sx={{ p: 1.5, borderColor: '#1976d2', color: '#1976d2' }}
              >
                Usar otro nombre/cédula
              </Button>

              <Button
                variant="text"
                fullWidth
                onClick={handleLoginClick}
                sx={{ p: 1, color: 'textSecondary' }}
              >
                O iniciar sesión
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'gray' }}>
              Regístrate para usar el chatbot como visitante
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                fullWidth
              />
              <TextField
                label="Cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                fullWidth
              />
              {error && (
                <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
                  {error}
                </Typography>
              )}
              <Button
                variant="contained"
                fullWidth
                onClick={handleRegisterVisitor}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Registrar y continuar'}
              </Button>
              <Button variant="text" fullWidth onClick={handleBackToChoice}>
                Volver
              </Button>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatAccessModal;
