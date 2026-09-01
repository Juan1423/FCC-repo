import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Avatar, Fade } from '@mui/material';
import { DashboardGrid, DashboardHeader } from '../../components/DashboardGrid';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import TopicIcon from '@mui/icons-material/Topic';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import HistoryIcon from '@mui/icons-material/History';

const dataTarjeta = [
  {
    title: 'Gestión de Prompts',
    icon: <PsychologyIcon />,
    description: 'Instrucciones y comportamiento del asistente',
    path: 'prompts',
    color: '#2563eb',
  },
  {
    title: 'Base de Conocimiento',
    icon: <MenuBookIcon />,
    description: 'Documentos e índices vectoriales (RAG)',
    path: 'conocimiento',
    color: '#3b82f6',
  },
  {
    title: 'Aprendizaje',
    icon: <SchoolIcon />,
    description: 'Revisiones y conocimientos canónicos',
    path: 'aprendizaje',
    color: '#10b981',
  },
  {
    title: 'Guardrails',
    icon: <SecurityIcon />,
    description: 'Límites y protección del asistente',
    path: 'guardrails',
    color: '#1d4ed8',
  },
  {
    title: 'Protocolos',
    icon: <GavelIcon />,
    description: 'Respuestas para temas sensibles',
    path: 'protocolos',
    color: '#7c3aed',
  },
  {
    title: 'Temas Válidos',
    icon: <TopicIcon />,
    description: 'Alcance on-topic del asistente',
    path: 'temas',
    color: '#f59e0b',
  },
  {
    title: 'Rate Limit',
    icon: <TimerOutlinedIcon />,
    description: 'Límites de uso y rendimiento',
    path: 'rate-limit',
    color: '#0891b2',
  },
  {
    title: 'Historial',
    icon: <HistoryIcon />,
    description: 'Conversaciones de todos los canales',
    path: 'historial',
    color: '#1e40af',
  },
];

const ChatbotDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const moduleBase = location.pathname
    .replace(/\/+$/, '')
    .split('/')
    .slice(0, 2)
    .join('/');

  const openModule = (path) => navigate(`${moduleBase}/${path}`);

  return (
    <Box>
      <DashboardHeader
        title="Gestión del Chatbot"
        subtitle="Administrar prompts, conocimiento y seguridad del asistente virtual"
      />
      <DashboardGrid>
        {dataTarjeta.map((item, index) => {
          const Icon = item.icon;
          return (
            <Fade key={item.title} in timeout={300 + index * 80}>
              <Card
                elevation={0}
                onClick={() => openModule(item.path)}
                sx={{
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow:
                    '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: item.color,
                    boxShadow: `0 12px 28px -8px ${item.color}33, 0 6px 12px -6px ${item.color}22`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3 }, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: item.color,
                      width: { xs: 56, md: 64 },
                      height: { xs: 56, md: 64 },
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {Icon}
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, color: '#1e293b', fontWeight: 'bold' }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          );
        })}
      </DashboardGrid>
    </Box>
  );
};

export default ChatbotDashboard;