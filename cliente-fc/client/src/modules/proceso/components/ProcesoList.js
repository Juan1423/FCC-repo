import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import procesosService from '../../../services/procesosService';
import axios from 'axios';
import { API_URL } from '../../../services/apiConfig';

const ProcesoList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tiposMap, setTiposMap] = useState({});
  const [normativasMap, setNormativasMap] = useState({});
  const [formData, setFormData] = useState({ nombre_proceso: '', descripcion_proceso: '', entregable: '', id_tipo_proceso: '', id_normativa: '' });

  const fetchTipos = async () => {
    try {
      const res = await axios.get(`${API_URL}/tipoproceso`);
      const map = {};
      (res.data || []).forEach(t => { map[t.id_tipo_proceso] = t.nombre_tipo_proceso; });
      setTiposMap(map);
    } catch (err) {
      setTiposMap({});
    }
  };

  const fetchNormativas = async () => {
    try {
      const res = await axios.get(`${API_URL}/normativa`);
      const map = {};
      (res.data || []).forEach(n => { map[n.id_normativa] = n.tipo_permiso || `Normativa ${n.id_normativa}`; });
      setNormativasMap(map);
    } catch (err) {
      setNormativasMap({});
    }
  };

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await procesosService.getProcesos();
      setItems(res.data || []);
    } catch (err) {
      setItems([]);
      setError('Error al cargar procesos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTipos(); fetchNormativas(); fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar proceso?')) return;
    try {
      await procesosService.deleteProceso(id);
      fetch();
    } catch (err) {
      setError('Error al eliminar proceso');
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({ nombre_proceso: '', descripcion_proceso: '', entregable: '', id_tipo_proceso: '', id_normativa: '' });
    setOpenModal(true);
  };

  const handleEditModal = (item) => {
    setEditingId(item.id_proceso);
    setFormData({ nombre_proceso: item.nombre_proceso, descripcion_proceso: item.descripcion_proceso, entregable: item.entregable, id_tipo_proceso: item.id_tipo_proceso, id_normativa: item.id_normativa });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleCreateSubmit = async () => {
    if (!formData.nombre_proceso) {
      alert('El nombre del proceso es requerido');
      return;
    }
    // Normalizar payload
    const payload = {
      ...formData,
      id_tipo_proceso: formData.id_tipo_proceso ? Number(formData.id_tipo_proceso) : null,
      id_normativa: formData.id_normativa ? Number(formData.id_normativa) : null,
    };
    try {
      if (editingId) {
        await procesosService.updateProceso(editingId, payload);
      } else {
        await procesosService.createProceso(payload);
      }
      fetch();
      setOpenModal(false);
      setError(null);
    } catch (err) {
      console.error('Create/Update proceso error:', err);
      const serverMessage = err?.response?.data?.message || err.message || 'Error desconocido';
      setError(editingId ? `Error al actualizar proceso: ${serverMessage}` : `Error al crear proceso: ${serverMessage}`);
    }
  };

  return (
    <>
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Procesos</Typography>
        <div>
          <Button variant="contained" size="small" onClick={handleOpenModal} sx={{ mr: 1 }}>Crear Proceso</Button>
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
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Entregable</TableCell>
              <TableCell>Tipo Proceso</TableCell>
              <TableCell>Normativa</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id_proceso}>
                <TableCell>{p.nombre_proceso}</TableCell>
                <TableCell>{p.descripcion_proceso}</TableCell>
                <TableCell>{p.entregable}</TableCell>
                <TableCell>{tiposMap[p.id_tipo_proceso] || 'N/A'}</TableCell>
                <TableCell>{normativasMap[p.id_normativa] || 'N/A'}</TableCell>
                <TableCell>
                  <Button size="small" variant="contained" color="secondary" onClick={() => handleEditModal(p)} sx={{ mr: 0.5 }}>Editar</Button>
                  <Button size="small" variant="contained" color="error" onClick={() => handleDelete(p.id_proceso)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>

    <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
      <DialogTitle>{editingId ? 'Editar Proceso' : 'Crear Nuevo Proceso'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField fullWidth label="Nombre Proceso" value={formData.nombre_proceso} onChange={handleChange('nombre_proceso')} sx={{ mb: 2 }} />
        <TextField fullWidth label="Descripción Proceso" value={formData.descripcion_proceso} onChange={handleChange('descripcion_proceso')} multiline rows={3} sx={{ mb: 2 }} />
        <TextField fullWidth label="Entregable" value={formData.entregable} onChange={handleChange('entregable')} sx={{ mb: 2 }} />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo Proceso</InputLabel>
          <Select value={formData.id_tipo_proceso} label="Tipo Proceso" onChange={handleChange('id_tipo_proceso')}>
            {Object.entries(tiposMap).map(([id, nombre]) => (
              <MenuItem key={id} value={id}>{nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Normativa</InputLabel>
          <Select value={formData.id_normativa} label="Normativa" onChange={handleChange('id_normativa')}>
            {Object.entries(normativasMap).map(([id, nombre]) => (
              <MenuItem key={id} value={id}>{nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal}>Cancelar</Button>
        <Button onClick={handleCreateSubmit} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default ProcesoList;
