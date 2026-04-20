import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';

const SignoVital = ({ titulo, valor, unidad }) => (
  <Box sx={{ textAlign: 'center', p: 1 }}>
    <Typography variant="body2" color="primary" gutterBottom>
      {titulo}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
      {valor ? `${valor} ${unidad}` : 'No registrado'}
    </Typography>
  </Box>
);

const formatFecha = (fecha) => {
  if (!fecha) return 'No registrado';
  const date = new Date(fecha);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatHora = (fecha) => {
  if (!fecha) return 'No registrado';
  const date = new Date(fecha);
  return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Guayaquil' });
};

const CuadroSignosVitales = ({ ultimosSignosVitales }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', boxShadow: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h5" component="div" align="center" gutterBottom color="primary">
          Signos Vitales del Paciente
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Fecha: {formatFecha(ultimosSignosVitales?.fecha_medicion)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hora: {formatHora(ultimosSignosVitales?.fecha_medicion)}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Grid container spacing={1} justifyContent="center">
          <Grid item xs={6} sm={4}>
            <SignoVital 
              titulo="Temperatura"
              valor={ultimosSignosVitales?.temperatura}
              unidad="°C"
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <SignoVital 
              titulo="Presión Arterial"
              valor={ultimosSignosVitales?.presion_arterial}
              unidad="mmHg"
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <SignoVital 
              titulo="Pulso"
              valor={ultimosSignosVitales?.pulso}
              unidad="lpm"
            />
          </Grid>
          {isXs && <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>}
          <Grid item xs={6} sm={4}>
            <SignoVital 
              titulo="Frec. Respiratoria"
              valor={ultimosSignosVitales?.frecuencia_respiratoria}
              unidad="rpm"
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <SignoVital 
              titulo="Peso"
              valor={ultimosSignosVitales?.peso}
              unidad="kg"
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <SignoVital 
              titulo="Talla"
              valor={ultimosSignosVitales?.talla}
              unidad="m"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CuadroSignosVitales;