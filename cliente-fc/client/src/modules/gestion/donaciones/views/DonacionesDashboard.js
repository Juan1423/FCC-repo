import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NavbarAdmin from '../../../../components/NavbarAdmin';
import Drawer from '../../../../components/Drawer';
import { useMenu } from '../../../../components/base/MenuContext';
import DonacionNacionalReview from '../components/DonacionNacionalReview';
import DonacionInternacionalReview from '../components/DonacionInternacionalReview';
import * as donacionService from '../../../../services/donacionService';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter","Roboto","Helvetica","Arial",sans-serif',
  },
  palette: {
    primary: { main: '#2563eb' },
    secondary: { main: '#3b82f6' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
  },
  shape: { borderRadius: 12 },
});

const DonacionesDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, month: 0, verified: 0 });
  const { setCurrentMenu } = useMenu();

  useEffect(() => {
    setCurrentMenu('Donaciones');
  }, [setCurrentMenu]);

  useEffect(() => {
    Promise.all([
      donacionService.getDonacionesNacionales(),
      donacionService.getDonacionesInternacionales(),
    ]).then(([n, i]) => {
      const all = [...(Array.isArray(n) ? n : []), ...(Array.isArray(i) ? i : [])];
      const now = new Date();
      setStats({
        total: all.length,
        pending: all.filter(d => d.estado === 'registrada').length,
        verified: all.filter(d => d.estado === 'verificada').length,
        month: all.filter(d => {
          const date = new Date(d.fecha_donacion || d.fecha_registro);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
      });
    }).catch(() => {});
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <NavbarAdmin onDrawerToggle={() => setDrawerOpen(!drawerOpen)} />
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            width: { md: 'calc(100% - 240px)' },
            mt: { xs: 7, sm: 8 },
          }}
        >
          <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '2.5rem' },
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Donaciones
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#64748b',
                  fontWeight: 500,
                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                }}
              >
                Revisión y asignación de donaciones nacionales e internacionales.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
                mb: 3,
              }}
            >
              {[
                { label: 'Total', value: stats.total, color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
                { label: 'Pendientes', value: stats.pending, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                { label: 'Verificadas', value: stats.verified, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                { label: 'Este mes', value: stats.month, color: '#1e293b', bg: 'rgba(15,23,42,0.06)' },
              ].map(stat => (
                <Box
                  key={stat.label}
                  sx={{
                    bgcolor: stat.bg,
                    borderRadius: 2,
                    p: { xs: 2, md: 2.5 },
                    border: '1px solid',
                    borderColor: 'grey.200',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: stat.color, fontSize: { xs: '1.5rem', md: '2rem' }, mt: 0.5, fontWeight: 700 }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 3,
                boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
                border: '1px solid',
                borderColor: 'grey.200',
                overflow: 'hidden',
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  px: 2,
                  pt: 1,
                  borderBottom: '1px solid',
                  borderColor: 'grey.200',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    minHeight: 48,
                    '&.Mui-selected': { color: '#2563eb' },
                  },
                  '& .MuiTabs-indicator': { bgcolor: '#2563eb', height: 3, borderRadius: '3px 3px 0 0' },
                }}
              >
                <Tab label="Nacionales" />
                <Tab label="Internacionales" />
              </Tabs>
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                {tab === 0 && <DonacionNacionalReview />}
                {tab === 1 && <DonacionInternacionalReview />}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DonacionesDashboard;
