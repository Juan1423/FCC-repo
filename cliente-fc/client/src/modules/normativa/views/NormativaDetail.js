import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import normativaServices from '../../../services/normativasService';

const NormativaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (!id) return;
    normativaServices.getNormativa(id).then((res) => setItem(res.data)).catch(() => setItem(null));
  }, [id]);

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="contained" onClick={() => navigate(-1)} sx={{ mb: 2 }}>Volver</Button>
      <Paper sx={{ p: 2 }}>
        {!item ? (
          <Typography>No se encontró la normativa.</Typography>
        ) : (
          <div>
            <Typography variant="h6">Tipo permiso: {item.tipo_permiso}</Typography>
            <Typography>Número: {item.nmro_resolucion_registro}</Typography>
            <Typography>Entidad: {item.entidad_reguladora}</Typography>
            <Typography>Estado cumplimiento: {String(item.estado_cumplimiento)}</Typography>
            <Typography>Categoria riesgo: {item.categoria_riesgo}</Typography>
          </div>
        )}
      </Paper>
    </Box>
  );
};

export default NormativaDetail;
