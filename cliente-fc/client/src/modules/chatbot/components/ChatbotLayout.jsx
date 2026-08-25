import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import NavbarAdmin from '../../../components/NavbarAdmin';
import Drawer from '../../../components/Drawer';
import { useMenu } from '../../../components/base/MenuContext';

const ChatbotLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
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
        {children}
      </Box>
    </Box>
  );
};

export default ChatbotLayout;
