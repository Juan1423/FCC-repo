import React from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab } from '@mui/material';
import NavbarAdmin from '../../../components/NavbarAdmin';
import Drawer from '../../../components/Drawer';
import NormativaList from '../components/NormativaList';
import TipoNormativaList from '../components/TipoNormativaList';
import { useMenu } from '../../../components/base/MenuContext';

const NormativaDashboard = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);
  const { setCurrentMenu } = useMenu();
  
  React.useEffect(() => { setCurrentMenu('Normativa'); }, [setCurrentMenu]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <NavbarAdmin onDrawerToggle={() => setDrawerOpen(!drawerOpen)} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(!drawerOpen)} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { md: `calc(100% - 240px)` }, mt: { xs: 7, sm: 8 } }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            mb: 4,
            textAlign: "center",
            fontSize: { xs: "1.5rem", md: "2rem" },
            color: "primary.main",
          }}
        >
          Normativa
        </Typography>
        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tab label="Normativas" />
              <Tab label="Tipos de Normativa" />
            </Tabs>
            
            {tabValue === 0 && (
              <Box>
                <NormativaList />
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box>
                <TipoNormativaList />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default NormativaDashboard;
