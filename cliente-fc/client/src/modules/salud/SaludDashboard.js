import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavbarAdmin from '../../components/NavbarAdmin';
import Drawer from '../../components/Drawer';
import { useMenu } from '../../components/base/MenuContext';
import { DashboardGrid, DashboardHeader, DashboardCard } from '../../components/DashboardGrid';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

const dataTarjeta = [
  {
    title: 'Pacientes',
    icon: <PersonIcon />,
    description: 'Gestión de los pacientes',
    path: '/fcc-pacientes',
    color: '#2563eb',
  },
  {
    title: 'Historias Clínicas',
    icon: <AssignmentIcon />,
    description: 'Gestión de las historias clínicas',
    path: '/fcc-historias-clinicas',
    color: '#3b82f6',
  },
  {
    title: 'Atención',
    icon: <MedicalServicesIcon />,
    description: 'Gestión de las consultas médicas',
    path: '/fcc-atencion',
    color: '#1d4ed8',
  },
  {
    title: 'Terapias',
    icon: <MonitorHeartIcon />,
    description: 'Gestión de las terapias',
    path: '/fcc-terapias',
    color: '#1e40af',
  },
];

const SaludDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Salud');
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
          title="Gestión de Salud"
          subtitle="Administración del módulo de salud"
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

export default SaludDashboard;
