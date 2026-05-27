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
    fontFamily: '"Plus Jakarta Sans","Roboto","Helvetica","Arial",sans-serif',
    h3: { fontFamily: '"Playfair Display",serif', fontWeight: 700 },
    h4: { fontFamily: '"Playfair Display",serif', fontWeight: 600 },
  },
  palette: {
    primary: { main: '#C8553D' },
    secondary: { main: '#E8A838' },
    success: { main: '#2D936C' },
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
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', bgcolor: '#FFF8F0', minHeight: '100vh' }}>
          <NavbarAdmin onDrawerToggle={() => setDrawerOpen(!drawerOpen)} />
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, md: 4 },
              width: { md: `calc(100% - 240px)` },
              mt: { xs: 7, sm: 8 },
            }}
          >
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
              <Typography
                variant="h3"
                sx={{
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  color: '#4A2C2A',
                }}
              >
                Donaciones
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                Revisión y asignación de donaciones nacionales e internacionales.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 2,
                  mb: 3,
                }}
              >
                {[
                  { label: 'Total', value: stats.total, color: '#C8553D', bg: 'rgba(200,85,61,0.08)' },
                  { label: 'Pendientes', value: stats.pending, color: '#E8A838', bg: 'rgba(232,168,56,0.1)' },
                  { label: 'Verificadas', value: stats.verified, color: '#2D936C', bg: 'rgba(45,147,108,0.1)' },
                  { label: 'Este mes', value: stats.month, color: '#4A2C2A', bg: 'rgba(74,44,42,0.06)' },
                ].map(stat => (
                  <Box
                    key={stat.label}
                    sx={{
                      bgcolor: stat.bg,
                      borderRadius: 2,
                      p: { xs: 2, md: 2.5 },
                      border: `1px solid ${stat.color}15`,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
                  boxShadow: '0 2px 12px rgba(74,44,42,0.06)',
                  border: '1px solid rgba(200,85,61,0.08)',
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
                    borderColor: 'rgba(200,85,61,0.1)',
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      minHeight: 48,
                      '&.Mui-selected': { color: '#C8553D' },
                    },
                    '& .MuiTabs-indicator': { bgcolor: '#C8553D', height: 3, borderRadius: '3px 3px 0 0' },
                  }}
                >
                  <Tab label={`Nacionales (${stats.total - stats.pending - stats.verified >= 0 ? '...' : ''})`} />
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
    </>
  );
};

export default DonacionesDashboard;
