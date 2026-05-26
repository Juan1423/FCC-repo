import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab } from '@mui/material';
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

const tabs = [
  { label: 'Documentos', component: <DocumentoList /> },
  { label: 'Tipos de Documento', component: <TipoDocumentoList /> },
  { label: 'Indicadores', component: <IndicadorList /> },
  { label: 'Tipos de Indicador', component: <TipoIndicadorList /> },
  { label: 'Instituciones', component: <InstitucionList /> },
  { label: 'Tipos de Institución', component: <TipoInstitucionList /> },
  { label: 'Módulos', component: <ModuloList /> },
];

const DocumentacionDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const { setCurrentMenu } = useMenu();

  useEffect(() => {
    setCurrentMenu('Documentación');
  }, [setCurrentMenu]);

  return (
    <Box sx={{ display: 'flex' }}>
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
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            textAlign: 'center',
            fontSize: { xs: '1.5rem', md: '2rem' },
            color: 'primary.main',
          }}
        >
          Documentación
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          Gestión de documentos, indicadores, instituciones y módulos del sistema.
        </Typography>
        <Card>
          <CardContent>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              {tabs.map((t, i) => <Tab key={i} label={t.label} />)}
            </Tabs>
            {tabs[tab]?.component}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DocumentacionDashboard;
