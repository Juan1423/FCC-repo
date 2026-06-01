import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavbarAdmin from '../../components/NavbarAdmin';
import Drawer from '../../components/Drawer';
import { useMenu } from '../../components/base/MenuContext';
import { DashboardGrid, DashboardHeader, DashboardCard } from '../../components/DashboardGrid';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import HandshakeIcon from '@mui/icons-material/Handshake';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DescriptionIcon from '@mui/icons-material/Description';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

const dataTarjeta = [
  {
    title: 'Personas',
    icon: <EmojiPeopleIcon />,
    description: 'Gestión de las personas de la comunidad',
    path: '/fcc-comunidad/personas',
    color: '#2563eb',
  },
  {
    title: 'Interacciones',
    icon: <HandshakeIcon />,
    description: 'Gestión de las interacciones de la comunidad',
    path: '/fcc-comunidad/interacciones',
    color: '#3b82f6',
  },
  {
    title: 'Normativas',
    icon: <TextSnippetIcon />,
    description: 'Gestión de las normativas de la comunidad',
    path: '/fcc-normativa',
    color: '#1d4ed8',
  },
  {
    title: 'Documentación',
    icon: <DescriptionIcon />,
    description: 'Gestión de documentos y archivos',
    path: '/fcc-documentacion',
    color: '#1e40af',
  },
  {
    title: 'Donaciones',
    icon: <VolunteerActivismIcon />,
    description: 'Gestión de donaciones y aportes',
    path: '/fcc-donaciones',
    color: '#0ea5e9',
  },
];

const GestionDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Gestión');
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
          title="Gestión Comunitaria"
          subtitle="Administración de la comunidad"
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

export default GestionDashboard;
