import React from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import NavbarAdmin from '../../../../components/NavbarAdmin';
import Drawer from '../../../../components/Drawer';
import NormativaList from '../components/NormativaList';
import TipoNormativaList from '../components/TipoNormativaList';
import { useMenu } from '../../../../components/base/MenuContext';

const NormativaDashboard = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);
  const { setCurrentMenu } = useMenu();

  React.useEffect(() => { setCurrentMenu('Normativa'); }, [setCurrentMenu]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDrawerToggle = () => setDrawerOpen((v) => !v);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: 'calc(100% - 240px)' },
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
            color: '#ffffff',
            pt: { xs: 9, sm: 10 },
            pb: { xs: 4, md: 5 },
            px: { xs: 2, sm: 3, md: 4 },
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(circle at 18% 30%, rgba(255,255,255,0.18) 0%, transparent 45%), radial-gradient(circle at 82% 70%, rgba(255,255,255,0.12) 0%, transparent 45%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: 1400,
              mx: 'auto',
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 3 },
            }}
          >
            <Box
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                borderRadius: '16px',
                bgcolor: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <GavelIcon sx={{ fontSize: { xs: 28, sm: 34 } }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' },
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  lineHeight: 1.15,
                }}
              >
                Normativa
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 0.75,
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  maxWidth: 640,
                }}
              >
                Registro, consulta y administración del marco normativo institucional.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto', width: '100%' }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
              overflow: 'hidden',
              bgcolor: '#ffffff',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: { xs: 1, sm: 2 },
                pt: 0.5,
                borderBottom: '1px solid',
                borderColor: 'grey.200',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  minHeight: 48,
                  '&.Mui-selected': { color: '#0d9488' },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#0d9488',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
                '& .MuiTabs-scrollButtons': { color: '#0d9488' },
              }}
            >
              <Tab label="Normativas" />
              <Tab label="Tipos de Normativa" />
            </Tabs>

            <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
              {tabValue === 0 && <NormativaList />}
              {tabValue === 1 && <TipoNormativaList />}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default NormativaDashboard;
