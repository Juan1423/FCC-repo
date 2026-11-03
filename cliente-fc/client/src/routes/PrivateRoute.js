import React, { useEffect, useState } from 'react';
import { Navigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from '@mui/material';
import * as authService from '../services/authServices';

const PrivateRoute = ({ element: Element, allowedRoles, ...rest }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await authService.verifyToken();
        if (response.isValid === true) {
          setIsAuthenticated(true);
          setUserRole(response.data.rol);
          // Si el token es válido pero falta el usuario local (p. ej. tras una caída del server), rehidratar.
          await authService.rehydrateUser(response.data);
        } else {
          authService.logout();
        }
      } catch (error) {
        // Error transitorio de red/servidor: conservar la sesión local y dejar reintentar.
        console.error('Error verifying token (transitorio):', error);
        const info = authService.getUserInfo();
        if (info) {
          setIsAuthenticated(true);
          setUserRole(info.rol);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" style={{ marginTop: 20 }}>
          Cargando...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Sin sesión válida se vuelve al login, no a "acceso denegado".
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.includes(userRole)) {
    return <Element {...rest} />;
  } else {
    return <Navigate to="/accessdenied" replace />;
  }
};

export default PrivateRoute;