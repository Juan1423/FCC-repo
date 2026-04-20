import React from 'react';
import { Typography, Paper, Grid, Box, Divider, Alert, Chip, CircularProgress, ThemeProvider, createTheme } from '@mui/material';
import { EventNote, LocalHospital, Assignment, Info, Medication, Warning, Healing, Comment } from '@mui/icons-material';
import Antecedentes from './Antecedentes';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.2rem',
    },
  },
});

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

const InfoItem = ({ label, value, icon }) => (
  <Box display="flex" alignItems="flex-start" mb={1}>
    {icon}
    <Box ml={1} flexGrow={1}>
      <Typography variant="body2" color="textSecondary" align="left">{label}:</Typography>
      <Typography variant="body1" align="left">{value || 'No disponible'}</Typography>
    </Box>
  </Box>
);

const renderChips = (items) => {
  if (!items || items.length === 0) {
    return <Typography variant="body2" align="left">No se encuentra registrado</Typography>;
  }
  return (
    <Box display="flex" flexWrap="wrap" justifyContent="flex-start">
      {items.map((item, index) => (
        <Chip key={index} label={item} size="small" sx={{ m: 0.5 }} color="primary" variant="outlined" />
      ))}
    </Box>
  );
};

const CuadroHistorialClinico = ({ historia, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!historia) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography align="left">No se ha encontrado la historia clínica.</Typography>
      </Alert>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Paper elevation={3} sx={{ padding: 2, mt: 2, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="primary" align="center">Historia Clínica</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <InfoItem 
              label="Número de historia clínica" 
              value={historia.codigo_historia}
              icon={<Assignment color="primary" fontSize="small" />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoItem 
              label="Fecha de Apertura" 
              value={formatDate(historia.fecha_historia)}
              icon={<EventNote color="primary" fontSize="small" />}
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h5" gutterBottom color="primary" align="left">Motivo de Consulta</Typography>
        <InfoItem 
          label="Motivo de Consulta" 
          value={historia.motivo_consulta_historia}
          icon={<Info color="primary" fontSize="small" />}
        />
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom color="primary" align="left">Información General</Typography>
            <InfoItem 
              label="Seguro social" 
              value={historia.seguro_social ? 'Sí' : 'No'}
              icon={<LocalHospital color="primary" fontSize="small" />}
            />
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary" align="left" sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="primary" fontSize="small" sx={{ mr: 1 }} /> Alergias:
              </Typography>
              {renderChips(historia.alergias)}
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary" align="left" sx={{ display: 'flex', alignItems: 'center' }}>
                <Medication color="primary" fontSize="small" sx={{ mr: 1 }} /> Medicamentos:
              </Typography>
              {renderChips(historia.medicamentos)}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom color="primary" align="left">Diagnóstico y Tratamiento</Typography>
            <InfoItem 
              label="Diagnóstico Presuntivo" 
              value={historia.diagnostico_presuntivo}
              icon={<Healing color="primary" fontSize="small" />}
            />
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary" align="left" sx={{ display: 'flex', alignItems: 'center' }}>
                <Healing color="primary" fontSize="small" sx={{ mr: 1 }} /> Tratamientos Recibidos:
              </Typography>
              {renderChips(historia.tratamientos_recibidos)}
            </Box>
            <InfoItem 
              label="Observaciones" 
              value={historia.observaciones}
              icon={<Comment color="primary" fontSize="small" />}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        
        <Antecedentes historia={historia} />
      </Paper>
    </ThemeProvider>
  );
};

export default CuadroHistorialClinico;