import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import normativaServices from '../../../services/normativasService';
import axios from 'axios';
import { API_URL } from '../../../services/apiConfig';

const NormativaList = ({ onView }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tiposMap, setTiposMap] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ id_tipo_normativa: '', tipo_permiso: '', nmro_resolucion_registro: '', entidad_reguladora: '', estado_cumplimiento: false, categoria_riesgo: '' });

  const fetchTipos = async () => {
    try {
      const res = await axios.get(`${API_URL}/tipo_normativa`);
      const map = {};
      (res.data || []).forEach(t => { map[t.id_tipo_normativa] = t.nombre_tipo_normativa; });
      setTiposMap(map);
    } catch (err) {
      setTiposMap({});
    }
  };

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await normativaServices.getNormativas();
      setItems(res.data || []);
    } catch (err) {
      setItems([]);
      setError('Error al cargar normativas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTipos(); fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar normativa?')) return;
    try {
      await normativaServices.deleteNormativa(id);
      fetch();
    } catch (err) {
      setError('Error al eliminar normativa');
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({ id_tipo_normativa: '', tipo_permiso: '', nmro_resolucion_registro: '', entidad_reguladora: '', estado_cumplimiento: false, categoria_riesgo: '' });
    setOpenModal(true);
  };

  const handleEditModal = (item) => {
    setEditingId(item.id_normativa);
    setFormData({ id_tipo_normativa: item.id_tipo_normativa, tipo_permiso: item.tipo_permiso, nmro_resolucion_registro: item.nmro_resolucion_registro, entidad_reguladora: item.entidad_reguladora, estado_cumplimiento: item.estado_cumplimiento, categoria_riesgo: item.categoria_riesgo });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleCreateSubmit = async () => {
    if (!formData.id_tipo_normativa) {
      alert('Selecciona un tipo de normativa');
      return;
    }
    // Normalizar payload: asegurar tipos correctos
    const payload = {
      ...formData,
      id_tipo_normativa: Number(formData.id_tipo_normativa) || null,
      estado_cumplimiento: Boolean(formData.estado_cumplimiento),
    };
    try {
      if (editingId) {
        await normativaServices.updateNormativa(editingId, payload);
      } else {
        await normativaServices.createNormativa(payload);
      }
      fetch();
      setOpenModal(false);
      setError(null);
    } catch (err) {
      console.error('Create/Update normativa error:', err);
      const serverMessage = err?.response?.data?.message || err.message || 'Error desconocido';
      setError(editingId ? `Error al actualizar normativa: ${serverMessage}` : `Error al crear normativa: ${serverMessage}`);
    }
  };

  return (
    <>
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Normativas</Typography>
        <div>
          <Button variant="contained" size="small" onClick={handleOpenModal} sx={{ mr: 1 }}>Crear</Button>
        </div>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>
      ) : error ? (
        <Box p={2}><Typography color="error">{error}</Typography></Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Resolución / Registro</TableCell>
              <TableCell>Entidad</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((n) => (
              <TableRow key={n.id_normativa}>
                <TableCell>{tiposMap[n.id_tipo_normativa] || n.tipo_permiso}</TableCell>
                <TableCell>{n.nmro_resolucion_registro}</TableCell>
                <TableCell>{n.entidad_reguladora}</TableCell>
                <TableCell>
                  <Button size="small" variant="contained" color="secondary" onClick={() => handleEditModal(n)} sx={{ mr: 0.5 }}>Editar</Button>
                  <Button size="small" variant="contained" color="error" onClick={() => handleDelete(n.id_normativa)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>

    <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
      <DialogTitle>{editingId ? 'Editar Normativa' : 'Crear Nueva Normativa'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo Normativa</InputLabel>
          <Select value={formData.id_tipo_normativa} label="Tipo Normativa" onChange={handleChange('id_tipo_normativa')}>
            {Object.entries(tiposMap).map(([id, nombre]) => (
              <MenuItem key={id} value={id}>{nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField fullWidth label="Tipo Permiso" value={formData.tipo_permiso} onChange={handleChange('tipo_permiso')} sx={{ mb: 2 }} />
        <TextField fullWidth label="Número Resolución/Registro" value={formData.nmro_resolucion_registro} onChange={handleChange('nmro_resolucion_registro')} sx={{ mb: 2 }} />
        <TextField fullWidth label="Entidad Reguladora" value={formData.entidad_reguladora} onChange={handleChange('entidad_reguladora')} sx={{ mb: 2 }} />
        <TextField fullWidth label="Categoría Riesgo" value={formData.categoria_riesgo} onChange={handleChange('categoria_riesgo')} sx={{ mb: 2 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal}>Cancelar</Button>
        <Button onClick={handleCreateSubmit} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default NormativaList;
