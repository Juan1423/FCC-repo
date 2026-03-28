/**
 * ChatClienteRouter.jsx
 * Router principal que gestiona el acceso al módulo chatcliente basado en roles
 * Distribuye usuarios a diferentes vistas según su rol
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  Button,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import NavbarAdmin from '../../../components/NavbarAdmin';
import Drawer from '../../../components/Drawer';
import useRoles from './useRoles';
import HistorialChat from '../../../components/HistorialChat';
import PromptsPanel from './PromptsPanel';
import ChatBotIAWithRoles from './ChatBotIAWithRoles';
import { ProtectedComponent } from './ProtectedComponent';

const ChatClienteRouter = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { isAdmin, isVisitor, isLoggedIn, role, user, refresh } = useRoles();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    localStorage.setItem('drawerState', 'false');
  }, []);

  // ========== VISTA PARA VISITANTES ==========
  if (isVisitor()) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            width: '100%',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 3,
              textAlign: 'center',
              color: 'primary.main',
            }}
          >
            Chatbot de la Fundación
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              👋 Bienvenido como visitante.
              <br />
              Tienes acceso al chatbot con un límite de 30 preguntas.
              <br />
              <strong>Inicia sesión para acceso ilimitado.</strong>
            </Typography>
          </Alert>

          {/* Solo mostrar el chatbot sin gestión de prompts */}
          <Box
            sx={{
              maxWidth: '900px',
              margin: '0 auto',
              backgroundColor: 'white',
              borderRadius: 2,
              p: 3,
              boxShadow: 1,
            }}
          >
            <ChatBotIAWithRoles
              onLoginRequired={() => setShowLoginPrompt(true)}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  // ========== VISTA PARA USUARIO COMÚN ==========
  if (!isAdmin()) {
    return (
      <Box sx={{ display: 'flex' }}>
        <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
        <Drawer open={drawerOpen} onClose={handleDrawerToggle} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            width: { md: `calc(100% - 240px)` },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 4,
              textAlign: 'center',
              fontSize: { xs: '1.5rem', md: '2rem' },
              color: 'primary.main',
            }}
          >
            Chatbot - Panel de Usuario
          </Typography>

          <Alert severity="success" sx={{ mb: 4 }}>
            <Typography variant="body2">
              ✅ Hola <strong>{user.nombre}</strong>. Tienes acceso completo
              al chatbot sin límite de preguntas.
            </Typography>
          </Alert>

          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label="💬 Chatbot" icon={<ChatIcon />} iconPosition="start" />
              <Tab
                label="📊 Historial"
                icon={<HistorialChat />}
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && <ChatBotIAWithRoles />}
            {activeTab === 1 && <HistorialChat />}
          </Box>
        </Box>
      </Box>
    );
  }

  // ========== VISTA PARA ADMINISTRADOR ==========
  return (
    <Box sx={{ display: 'flex' }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - 240px)` },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
          <ShieldIcon sx={{ color: 'error.main', fontSize: 32 }} />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', md: '2rem' },
              color: 'primary.main',
            }}
          >
            Panel Administrativo - Gestión del Chatbot
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 4 }}>
          <Typography variant="body2">
            🛡️ Eres administrador.
            <br />
            Tienes acceso completo a la gestión de prompts, historial y
            análisis.
          </Typography>
        </Alert>

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab
              label="⚙️ Gestionar Prompts"
              icon={<SettingsIcon />}
              iconPosition="start"
            />
            <Tab
              label="📊 Historial de Conversaciones"
              icon={<HistorialChat />}
              iconPosition="start"
            />
            <Tab
              label="💬 Probar Chatbot"
              icon={<ChatIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && <PromptsPanel onLoginClick={() => setShowLoginPrompt(true)} />}
          {activeTab === 1 && <HistorialChat />}
          {activeTab === 2 && <ChatBotIAWithRoles />}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatClienteRouter;
