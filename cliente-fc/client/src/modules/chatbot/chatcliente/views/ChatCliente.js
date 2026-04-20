// ChatCliente.js (movido a modules/chatcliente/views)
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import NavbarAdmin from '../../../../components/NavbarAdmin';
import Drawer from '../../../../components/Drawer';
import Prompts from './Prompts';
import HistorialChat from '../../../../components/HistorialChat';

const ChatCliente = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    localStorage.setItem('drawerState', 'false');
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Prompts />;
      case 1:
        return <HistorialChat />;
      default:
        return <Prompts />;
    }
  };

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
          Gestión del Chatbot
        </Typography>

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Prompts" />
            <Tab label="Historial de Conversaciones" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {renderTabContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatCliente;
