import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, TextField } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import normativaServices from '../../../services/normativasService';

const NormativaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    normativaServices.getNormativa(id).then((res) => setItem(res.data)).catch(() => setItem(null));
  }, [id]);

  const handleChange = (field) => (e) => setItem({ ...item, [field]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await normativaServices.updateNormativa(id, item);
      navigate(-1);
    } catch (err) {
      // simple error handling
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!item) return <Box sx={{ p: 3 }}><Typography>Cargando...</Typography></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="contained" onClick={() => navigate(-1)} sx={{ mb: 2 }}>Volver</Button>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Editar Normativa</Typography>
        <TextField label="Tipo permiso" fullWidth sx={{ mb: 2 }} value={item.tipo_permiso || ''} onChange={handleChange('tipo_permiso')} />
        <TextField label="Número resolución/registro" fullWidth sx={{ mb: 2 }} value={item.nmro_resolucion_registro || ''} onChange={handleChange('nmro_resolucion_registro')} />
        <TextField label="Entidad reguladora" fullWidth sx={{ mb: 2 }} value={item.entidad_reguladora || ''} onChange={handleChange('entidad_reguladora')} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>Guardar Cambios</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NormativaEdit;
