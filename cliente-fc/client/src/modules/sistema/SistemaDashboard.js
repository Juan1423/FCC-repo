import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavbarAdmin from '../../components/NavbarAdmin';
import Drawer from '../../components/Drawer';
import { useMenu } from '../../components/base/MenuContext';
import { DashboardGrid, DashboardHeader, DashboardCard } from '../../components/DashboardGrid';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SettingsIcon from '@mui/icons-material/Settings';

const dataTarjeta = [
  {
    title: 'Usuarios',
    icon: <PersonIcon />,
    description: 'Gestión de los usuarios del sistema',
    path: '/fcc-usuarios',
    color: '#2563eb',
  },
  {
    title: 'Auditoría',
    icon: <MenuBookIcon />,
    description: 'Gestión de las peticiones realizadas',
    path: '/fcc-auditoria',
    color: '#3b82f6',
  },
  {
    title: 'Personal de Salud',
    icon: <LocalHospitalIcon />,
    description: 'Gestión del personal de la fundación',
    path: '/fcc-personal-salud',
    color: '#1d4ed8',
  },
  {
    title: 'Configuración',
    icon: <SettingsIcon />,
    description: 'Configuración general del sistema',
    path: '/fcc-configuracion',
    color: '#1e40af',
  },
];

const SistemaDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Sistema');
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
          title="Gestión del Sistema"
          subtitle="Administración y configuración del sistema"
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

export default SistemaDashboard;
