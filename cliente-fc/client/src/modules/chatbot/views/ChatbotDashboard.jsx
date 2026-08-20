import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
} from '@mui/material';
import {
  Chat as ChatIcon,
  AdminPanelSettings as AdminIcon,
  Psychology as BrainIcon,
  BarChart as StatsIcon,
  QuestionAnswer as QaIcon,
} from '@mui/icons-material';

const dashboardItems = [
  {
    id: 'chat-publico',
    title: 'Chat Público',
    description: 'Asistente virtual para pacientes y visitantes',
    icon: <ChatIcon fontSize="large" />,
    path: 'chat-publico',
  },
  {
    id: 'chat-interno',
    title: 'Chat Interno',
    description: 'Asistente para personal interno',
    icon: <AdminIcon fontSize="large" />,
    path: 'chat-interno',
  },
  {
    id: 'prompts',
    title: 'Gestión de Prompts',
    description: 'Administrar prompts e instrucciones del chatbot',
    icon: <BrainIcon fontSize="large" />,
    path: 'prompts',
  },
  {
    id: 'conocimiento',
    title: 'Base de Conocimiento',
    description: 'Gestión de documentos e índices vectoriales',
    icon: <StatsIcon fontSize="large" />,
    path: 'conocimiento',
  },
  {
    id: 'aprendizaje',
    title: 'Aprendizaje',
    description: 'Revisiones y conocimientos canónicos',
    icon: <QaIcon fontSize="large" />,
    path: 'aprendizaje',
  },
];

const ChatbotDashboard = ({ onSelectModule }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Chatbot
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gestione todos los aspectos del asistente virtual de la Fundación con Cristo
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
        {dashboardItems.map((item) => (
          <Card key={item.id}>
            <CardActionArea onClick={() => onSelectModule(item.path)}>
              <CardContent sx={{ textAlign: 'center' }}>
                {item.icon}
                <Typography variant="h6" gutterTop>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ChatbotDashboard;
