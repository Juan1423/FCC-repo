import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavbarAdmin from '../../components/NavbarAdmin';
import Drawer from '../../components/Drawer';
import { useMenu } from '../../components/base/MenuContext';
import { DashboardGrid, DashboardHeader, DashboardCard } from '../../components/DashboardGrid';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddCommentIcon from '@mui/icons-material/AddComment';

const dataTarjeta = [
  {
    title: 'Chatbot Cliente',
    icon: <AddCommentIcon />,
    description: 'Gestión del chatbot cliente',
    path: '/fcc-chatbot',
    color: '#2563eb',
  },
  {
    title: 'Asistente IA',
    icon: <SmartToyIcon />,
    description: 'Gestión del chatbot interno de la fundación',
    path: '/fcc-asistente-ia',
    color: '#3b82f6',
  },
];

const ChatbotDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Chatbot');
  }, [setCurrentMenu]);

  return (
    <Box sx={{ display: 'flex' }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: 'calc(100% - 240px)' },
          mt: { xs: 7, sm: 8 },
          minHeight: '100vh',
          bgcolor: '#f8fafc',
        }}
      >
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
      </Box>
    </Box>
  );
};

export default ChatbotDashboard;
