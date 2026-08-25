import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DashboardGrid, DashboardHeader, DashboardCard } from '../../components/DashboardGrid';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const dataTarjeta = [
  {
    title: 'Administración',
    icon: <AdminPanelSettingsIcon />,
    description: 'Prompts, conocimiento, guardrails y más',
    path: 'admin',
    color: '#7c3aed',
  },
  {
    title: 'Historial',
    icon: <HistoryIcon />,
    description: 'Historial de conversaciones del chatbot',
    path: 'historial',
    color: '#0891b2',
  },
];

const ChatbotDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <DashboardHeader
        title="Gestión de Chatbot"
        subtitle="Asistentes virtuales y chatbot"
      />
      <DashboardGrid>
        {dataTarjeta.map((item, index) => (
          <DashboardCard
            key={index}
            item={item}
            index={index}
            onClick={() => navigate(item.path)}
          />
        ))}
      </DashboardGrid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Chats Disponibles
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Los chats están siempre disponibles como widgets flotantes en cualquier pantalla de la aplicación.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Paper variant="outlined" sx={{ p: 2, flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <ChatBubbleOutlineIcon color="primary" />
            <Box>
              <Typography variant="subtitle2">Chat Público</Typography>
              <Typography variant="body2" color="text.secondary">
                Widget flotante visible en login y formularios de donación
              </Typography>
            </Box>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <SmartToyIcon color="info" />
            <Box>
              <Typography variant="subtitle2">Asistente Interno</Typography>
              <Typography variant="body2" color="text.secondary">
                Widget flotante disponible para personal admin y salud
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ChatbotDashboard;
