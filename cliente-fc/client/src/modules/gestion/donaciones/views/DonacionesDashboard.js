import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab } from '@mui/material';
import NavbarAdmin from '../../../../components/NavbarAdmin';
import Drawer from '../../../../components/Drawer';
import { useMenu } from '../../../../components/base/MenuContext';
import DonacionNacionalReview from '../components/DonacionNacionalReview';
import DonacionInternacionalReview from '../components/DonacionInternacionalReview';

const DonacionesDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const { setCurrentMenu } = useMenu();

  useEffect(() => {
    setCurrentMenu('Donaciones');
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
          Donaciones
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          Revisión y asignación de donaciones nacionales e internacionales.
        </Typography>
        <Card>
          <CardContent>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="Nacionales" />
              <Tab label="Internacionales" />
            </Tabs>
            {tab === 0 && <DonacionNacionalReview />}
            {tab === 1 && <DonacionInternacionalReview />}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DonacionesDashboard;
