import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Tooltip,
  IconButton,
  Popover,
  Typography,
  Fab,
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import NavbarAdmin from '../../../../components/NavbarAdmin';
import Drawer from '../../../../components/Drawer';
import TipoProcesoList from '../components/TipoProcesoList';
import ProcesoList from '../components/ProcesoList';
import TipoNormativaList from '../components/TipoNormativaList';
import NormativaList from '../components/NormativaList';
import { useMenu } from '../../../../components/base/MenuContext';

const DocumentacionView = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [successAlert, setSuccessAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const { setCurrentMenu } = useMenu();

  const handleInfoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  useEffect(() => {
    setCurrentMenu('Documentación');
  }, [setCurrentMenu]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Tooltip title="Menú de navegación principal">
        <NavbarAdmin onDrawerToggle={() => setDrawerOpen(!drawerOpen)} />
      </Tooltip>
      <Tooltip title="Menú lateral con opciones adicionales">
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </Tooltip>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, marginTop: 7, overflowX: 'auto' }}>
        <Container>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1" sx={{ alignItems: 'center' }}>
              Gestión de Documentación
              <Tooltip title="Más información sobre este módulo">
                <IconButton onClick={handleInfoClick} size="small">
                  <InfoOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Typography>
          </Box>
        </Container>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleInfoClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" gutterBottom>Módulo de Documentación</Typography>
            <Typography variant="body2">
              Este módulo te permite gestionar la documentación institucional, incluyendo procesos, normativas, indicadores, módulos y documentos.
            </Typography>
          </Box>
        </Popover>
        <Card>
          <CardContent>
            <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tab label="Tipos de Proceso" />
              <Tab label="Procesos" />
              <Tab label="Tipos de Normativa" />
              <Tab label="Normativas" />
            </Tabs>
            {tab === 0 && <TipoProcesoList />}
            {tab === 1 && <ProcesoList />}
            {tab === 2 && <TipoNormativaList />}
            {tab === 3 && <NormativaList />}
          </CardContent>
        </Card>
      </Box>
      <Snackbar open={successAlert} autoHideDuration={6000} onClose={() => setSuccessAlert(false)}>
        <Alert onClose={() => setSuccessAlert(false)} severity="success">
          Operación exitosa!
        </Alert>
      </Snackbar>
      <Snackbar open={errorAlert} autoHideDuration={6000} onClose={() => setErrorAlert(false)}>
        <Alert onClose={() => setErrorAlert(false)} severity="error">
          Hubo un error al realizar la operación.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentacionView;