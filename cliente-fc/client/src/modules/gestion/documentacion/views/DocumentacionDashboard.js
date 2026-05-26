import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Fade,
} from '@mui/material';
import NavbarAdmin from '../../../../components/NavbarAdmin';
import Drawer from '../../../../components/Drawer';
import { useMenu } from '../../../../components/base/MenuContext';
import DocumentoList from '../components/DocumentoList';
import TipoDocumentoList from '../components/TipoDocumentoList';
import IndicadorList from '../components/IndicadorList';
import TipoIndicadorList from '../components/TipoIndicadorList';
import InstitucionList from '../components/InstitucionList';
import TipoInstitucionList from '../components/TipoInstitucionList';
import ModuloList from '../components/ModuloList';
import ProcesoList from '../components/ProcesoList';
import TipoProcesoList from '../components/TipoProcesoList';

const tabs = [
  { label: 'Documentos', component: <DocumentoList />, ariaLabel: 'Gestión de documentos' },
  { label: 'Tipos de Documento', component: <TipoDocumentoList />, ariaLabel: 'Gestión de tipos de documento' },
  { label: 'Indicadores', component: <IndicadorList />, ariaLabel: 'Gestión de indicadores' },
  { label: 'Tipos de Indicador', component: <TipoIndicadorList />, ariaLabel: 'Gestión de tipos de indicador' },
  { label: 'Instituciones', component: <InstitucionList />, ariaLabel: 'Gestión de instituciones' },
  { label: 'Tipos de Institución', component: <TipoInstitucionList />, ariaLabel: 'Gestión de tipos de institución' },
  { label: 'Módulos', component: <ModuloList />, ariaLabel: 'Gestión de módulos' },
  { label: 'Procesos', component: <ProcesoList />, ariaLabel: 'Gestión de procesos' },
  { label: 'Tipos de Proceso', component: <TipoProcesoList />, ariaLabel: 'Gestión de tipos de proceso' },
];

const TabPanel = ({ children, index, value, id }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (index === value && panelRef.current) {
      const timer = setTimeout(() => {
        const firstFocusable = panelRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable && !firstFocusable.hasAttribute('disabled')) firstFocusable.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [index, value]);

  return (
    <Box
      ref={panelRef}
      role="tabpanel"
      id={`documentacion-tabpanel-${index}`}
      aria-labelledby={`documentacion-tab-${index}`}
      hidden={value !== index}
      sx={{ outline: 'none' }}
    >
      {value === index && (
        <Fade in={true} timeout={350}>
          <Box sx={{ '&:focus-visible': { outline: '2px solid #0d9488', outlineOffset: 2, borderRadius: 1 } }}>
            {children}
          </Box>
        </Fade>
      )}
    </Box>
  );
};

const DocumentacionDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const { setCurrentMenu } = useMenu();

  useEffect(() => {
    setCurrentMenu('Documentación');
  }, [setCurrentMenu]);

  const a11yProps = useCallback((index) => ({
    id: `documentacion-tab-${index}`,
    'aria-controls': `documentacion-tabpanel-${index}`,
    'aria-label': tabs[index]?.ariaLabel,
  }), []);

  return (
    <Box sx={{ display: 'flex' }}>
      <NavbarAdmin onDrawerToggle={() => setDrawerOpen(!drawerOpen)} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Box
        component="main"
        role="main"
        aria-label="Panel de documentación"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - 240px)` },
          mt: { xs: 7, sm: 8 },
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#fafaf9',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            opacity: 0.3,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #0d9488 0.5px, transparent 0.5px),
              radial-gradient(circle at 75% 75%, #0d9488 0.5px, transparent 0.5px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          },
        }}
      >
        <Fade in={true} timeout={800}>
          <Box sx={{ position: 'relative', mb: { xs: 3, md: 5 } }}>
            <Typography
              aria-hidden="true"
              variant="h1"
              sx={{
                position: 'absolute',
                top: { xs: -20, md: -40 },
                left: { xs: -10, md: -20 },
                fontSize: { xs: '6rem', md: '12rem' },
                fontWeight: 900,
                color: '#0d9488',
                opacity: 0.06,
                lineHeight: 1,
                letterSpacing: '-0.05em',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              DOC
            </Typography>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 0.5,
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', md: '2.75rem' },
                  letterSpacing: '-0.02em',
                  color: '#1c1917',
                }}
              >
                Documentación
              </Typography>
              <Box
                sx={{
                  width: 60,
                  height: 4,
                  bgcolor: '#0d9488',
                  borderRadius: 2,
                  mx: 'auto',
                  mb: 1.5,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: '#78716c',
                  textAlign: 'center',
                  fontWeight: 400,
                  fontSize: { xs: '0.9rem', md: '1.05rem' },
                  maxWidth: 560,
                  mx: 'auto',
                }}
              >
                Gestión de documentos, indicadores, instituciones y módulos del sistema.
              </Typography>
            </Box>
          </Box>
        </Fade>

        <Fade in={true} timeout={600}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: '#e7e5e4',
              bgcolor: '#ffffff',
              overflow: 'visible',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                borderBottom: '1px solid',
                borderColor: '#e7e5e4',
                bgcolor: '#fafaf9',
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="Secciones de documentación"
                sx={{
                  px: { xs: 0.5, md: 2 },
                  minHeight: 48,
                  '& .MuiTabs-flexContainer': {
                    gap: { xs: 0, md: 0.5 },
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    minHeight: 48,
                    py: 1.25,
                    px: { xs: 1.5, sm: 2, md: 2.5 },
                    color: '#78716c',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#0d9488',
                      bgcolor: 'rgba(13, 148, 136, 0.04)',
                    },
                    '&:focus-visible': {
                      outline: '2px solid #0d9488',
                      outlineOffset: -2,
                      borderRadius: '6px 6px 0 0',
                    },
                  },
                  '& .Mui-selected': {
                    color: '#0d9488',
                    fontWeight: 600,
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: '#0d9488',
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                {tabs.map((t, i) => (
                  <Tab
                    key={i}
                    label={t.label}
                    {...a11yProps(i)}
                  />
                ))}
              </Tabs>
            </Box>
            <CardContent sx={{ p: { xs: 0, sm: 0 } }}>
              {tabs.map((t, i) => (
                <TabPanel key={i} index={i} value={tab}>
                  {t.component}
                </TabPanel>
              ))}
            </CardContent>
          </Card>
        </Fade>

        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: { xs: 120, md: 240 },
            height: { xs: 120, md: 240 },
            background: 'radial-gradient(circle, rgba(13,148,136,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      </Box>
    </Box>
  );
};

export default DocumentacionDashboard;