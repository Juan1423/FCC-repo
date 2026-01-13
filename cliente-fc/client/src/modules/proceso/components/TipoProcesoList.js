import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import procesosService from '../../../services/procesosService';
import axios from 'axios';
import { API_URL } from '../../../services/apiConfig';

const TipoProcesoList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre_tipo_proceso: '', descripcion_tipo_proceso: '' });

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await procesosService.getTipoProcesos();
      setItems(res.data || []);
    } catch (err) {
      setItems([]);
      setError('Error al cargar tipos de proceso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar tipo de proceso?')) return;
    try {
      await axios.delete(`${API_URL}/tipoproceso/${id}`);
      fetch();
    } catch (err) {
      setError('Error al eliminar tipo de proceso');
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({ nombre_tipo_proceso: '', descripcion_tipo_proceso: '' });
    setOpenModal(true);
  };

  const handleEditModal = (item) => {
    setEditingId(item.id_tipo_proceso);
    setFormData({ nombre_tipo_proceso: item.nombre_tipo_proceso, descripcion_tipo_proceso: item.descripcion_tipo_proceso });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.nombre_tipo_proceso) {
      alert('El nombre es requerido');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API_URL}/tipoproceso/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/tipoproceso`, formData);
      }
      fetch();
      setOpenModal(false);
    } catch (err) {
      setError(editingId ? 'Error al actualizar tipo de proceso' : 'Error al crear tipo de proceso');
    }
  };

  return (
    <>
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Tipos de Proceso</Typography>
        <div>
          <Button variant="contained" size="small" onClick={handleOpenModal} sx={{ mr: 1 }}>Crear Tipo</Button>
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
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id_tipo_proceso}>
                <TableCell>{t.nombre_tipo_proceso}</TableCell>
                <TableCell>{t.descripcion_tipo_proceso}</TableCell>
                <TableCell>
                  <Button size="small" variant="contained" color="secondary" onClick={() => handleEditModal(t)} sx={{ mr: 0.5 }}>Editar</Button>
                  <Button size="small" variant="contained" color="error" onClick={() => handleDelete(t.id_tipo_proceso)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>

    <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
      <DialogTitle>{editingId ? 'Editar Tipo de Proceso' : 'Crear Tipo de Proceso'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField fullWidth label="Nombre" value={formData.nombre_tipo_proceso} onChange={handleChange('nombre_tipo_proceso')} sx={{ mb: 2 }} />
        <TextField fullWidth label="Descripción" value={formData.descripcion_tipo_proceso} onChange={handleChange('descripcion_tipo_proceso')} multiline rows={3} sx={{ mb: 2 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default TipoProcesoList;
