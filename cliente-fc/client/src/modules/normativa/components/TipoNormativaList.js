import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../../../services/apiConfig';

const TipoNormativaList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre_tipo_normativa: '', descripcion_tipo_normativa: '' });

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/tipo_normativa`);
      setItems(res.data || []);
    } catch (err) {
      setItems([]);
      setError('Error al cargar tipos de normativa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar tipo de normativa?')) return;
    try {
      await axios.delete(`${API_URL}/tipo_normativa/${id}`);
      fetch();
    } catch (err) {
      setError('Error al eliminar tipo de normativa');
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({ nombre_tipo_normativa: '', descripcion_tipo_normativa: '' });
    setOpenModal(true);
  };

  const handleEditModal = (item) => {
    setEditingId(item.id_tipo_normativa);
    setFormData({ nombre_tipo_normativa: item.nombre_tipo_normativa, descripcion_tipo_normativa: item.descripcion_tipo_normativa });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.nombre_tipo_normativa) {
      alert('El nombre es requerido');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API_URL}/tipo_normativa/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/tipo_normativa`, formData);
      }
      fetch();
      setOpenModal(false);
    } catch (err) {
      setError(editingId ? 'Error al actualizar tipo de normativa' : 'Error al crear tipo de normativa');
    }
  };

  return (
    <>
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Tipos de Normativa</Typography>
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
              <TableRow key={t.id_tipo_normativa}>
                <TableCell>{t.nombre_tipo_normativa}</TableCell>
                <TableCell>{t.descripcion_tipo_normativa}</TableCell>
                <TableCell>
                  <Button size="small" variant="contained" color="secondary" onClick={() => handleEditModal(t)} sx={{ mr: 0.5 }}>Editar</Button>
                  <Button size="small" variant="contained" color="error" onClick={() => handleDelete(t.id_tipo_normativa)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>

    <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
      <DialogTitle>{editingId ? 'Editar Tipo de Normativa' : 'Crear Tipo de Normativa'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField fullWidth label="Nombre" value={formData.nombre_tipo_normativa} onChange={handleChange('nombre_tipo_normativa')} sx={{ mb: 2 }} />
        <TextField fullWidth label="Descripción" value={formData.descripcion_tipo_normativa} onChange={handleChange('descripcion_tipo_normativa')} multiline rows={3} sx={{ mb: 2 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default TipoNormativaList;
