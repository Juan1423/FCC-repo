// components/PacienteSeleccionado.js

import React from 'react';
import { Box, Typography } from '@mui/material';

function PacienteSeleccionado({ paciente }) {
  if (!paciente) return null;

  return (
    <Box sx={{ backgroundColor: '#e0f7fa', p: 2, borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6">Paciente Seleccionado</Typography>
      <Typography variant="body1">Nombre: {paciente.nombre_paciente}</Typography>
      <Typography variant="body1">Edad: {paciente.edad_paciente}</Typography>
      <Typography variant="body1">Sexo: {paciente.genero_paciente}</Typography>
      {/* Agregar más campos según sea necesario */}
    </Box>
  );
}

export default PacienteSeleccionado;
