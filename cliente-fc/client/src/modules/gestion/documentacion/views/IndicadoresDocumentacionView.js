import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab } from '@mui/material';
import NavbarAdmin from '../../../../components/NavbarAdmin';
import Drawer from '../../../../components/Drawer';
import IndicadorList from '../components/IndicadorList';
import TipoIndicadorList from '../components/TipoIndicadorList';
import { useMenu } from '../../../../components/base/MenuContext';

/**
 * Vista documentación: indicadores, tipos y vínculos con registrar_procesos (API /api/fcc).
 */
const IndicadoresDocumentacionView = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const { setCurrentMenu } = useMenu();

  useEffect(() => {
    setCurrentMenu('Documentación — Indicadores');
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
          Documentación — Indicadores
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          Gestión de indicadores, tipos y registros que vinculan proceso, indicador y normativa (módulo documentación en
          servidor).
        </Typography>
        <Card>
          <CardContent>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tab label="Indicadores" />
              <Tab label="Tipos de indicador" />
            </Tabs>
            {tab === 0 && <IndicadorList />}
            {tab === 1 && <TipoIndicadorList />}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default IndicadoresDocumentacionView;
