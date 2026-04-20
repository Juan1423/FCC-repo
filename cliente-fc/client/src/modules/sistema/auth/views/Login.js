import logo from "../../../assets/img/logo-fcc.png";
import React, { useState, useEffect } from 'react';
import { TextField, Button, Snackbar, Alert, CircularProgress, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from "react-router-dom";
import { login } from '../../../../services/authServices';
import * as authService from '../../../../services/authServices';
import './login.css';
import { logAuditAction } from '../../../../services/auditoriaServices';

const SuccessCheck = () => (
  <Box 
    display="flex" 
    flexDirection="column" 
    alignItems="center" 
    justifyContent="center" 
    height="200px"
  >
    <CheckCircleIcon style={{ fontSize: 100, color: 'green' }} />
    <h3>Inicio de sesión exitoso</h3>
  </Box>
);

const Login = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await authService.verifyToken();
        if (response.isValid === true) {
          navigate("/fcc-menu-principal");
        } else {
          authService.logout();
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const user = {
      correo_usuario: correo,
      password_usuario: password
    };
    try {
      const response = await login(user);
      console.log('Login response:', response);
      if (response.success) {
        const loginTime = new Date();
        const ecuadorTime = new Intl.DateTimeFormat('es-EC', {
          timeZone: 'America/Guayaquil',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(loginTime);

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem("loginTime", loginTime);
        setAlertMessage("Inicio de sesión exitoso");
        setAlertSeverity("success");
        setOpenAlert(true);
        setLoginSuccess(true);
  try {
          await logAuditAction('INICIAR_SESION', { usuario: response.data });
          console.log('Auditoría de inicio de sesión creada con éxito');
        } catch (error) {
          console.error('Error al crear auditoría de inicio de sesión:', error);
        }
  
        setTimeout(() => navigate("/fcc-menu-principal"), 2000);
      } else {
        console.log('Login failed: Incorrect credentials');
        setAlertMessage("Credenciales incorrectas");
        setAlertSeverity("error");
        setOpenAlert(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setAlertMessage("Error al iniciar sesión");
      setAlertSeverity("error");
      setOpenAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Function to handle logout and save logout time
  const handleLogout = async () => {
    const logoutTime = new Date();
    const ecuadorTime = new Intl.DateTimeFormat('es-EC', {
      timeZone: 'America/Guayaquil',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(logoutTime);

    console.log('Logout time (Ecuador):', ecuadorTime);
    
    try {
      await logAuditAction('CERRAR_SESION', { motivo: 'Llamada a handleLogout local en Login.js.' });
      console.log('Auditoría de cierre de sesión creada con éxito');
    } catch (error) {
      console.log('Error al crear auditoría de cierre de sesión:', error);
    }
  // Clear local storage and navigate to login
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("loginTime");
  navigate("/login");
};

// Example of using window event to capture logout time
useEffect(() => {
  const handleWindowClose = async () => {
    const logoutTime = new Date();
    const ecuadorTime = new Intl.DateTimeFormat('es-EC', {
      timeZone: 'America/Guayaquil',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(logoutTime);

    console.log('Window closed at (Ecuador):', ecuadorTime);
    
    try {
      await logAuditAction('CERRAR_SESION', { motivo: 'El usuario cerró la pestaña o el navegador en la página de login.' });
      console.log('Auditoría de cierre de ventana creada con éxito');
    } catch (error) {
      console.log('Error al crear auditoría de cierre de ventana:', error);
    }
  };
  window.addEventListener('beforeunload', handleWindowClose);
  return () => {
    window.removeEventListener('beforeunload', handleWindowClose);
  };
}, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setCorreo(value);
    } else {
      setPassword(value);
    }
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenAlert(false);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="logo" />
      <h2>Ingresa tus credenciales</h2>
      <h4>Bienvenido al Sistema de Fundación con Cristo</h4>

      {loginSuccess ? (
        <SuccessCheck />
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Sign In"}
          </Button>
        </form>
      )}

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }} >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;