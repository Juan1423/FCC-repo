import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, CircularProgress, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import * as documentacionService from '../../../../services/documentacionService';

const emptyForm = () => ({ nombre_modulo: '', descripcion_modulo: '', estado_modulo: 'ACTIVO' });

const ModuloList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentacionService.getModulos();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setError('No se pudieron cargar los módulos.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setOpenModal(true); };

  const openEdit = (row) => {
    setEditingId(row.id_modulo);
    setForm({
      nombre_modulo: row.nombre_modulo || '',
      descripcion_modulo: row.descripcion_modulo || '',
      estado_modulo: row.estado_modulo || 'ACTIVO',
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (editingId) {
        await documentacionService.updateModulo(editingId, payload);
      } else {
        await documentacionService.createModulo(payload);
      }
      setOpenModal(false);
      await load();
      setError(null);
    } catch (e) {
      setError(`Error al guardar: ${e?.response?.data?.message || e.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este módulo?')) return;
    try {
      await documentacionService.deleteModulo(id);
      await load();
    } catch (e) {
      alert(`No se pudo eliminar: ${e?.response?.data?.message || e.message}`);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Módulos</Typography>
          <Button variant="contained" size="small" onClick={openCreate}>Nuevo módulo</Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress size={28} /></Box>
        ) : error ? (
          <Box p={2}><Typography color="error">{error}</Typography></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id_modulo}>
                  <TableCell>{row.nombre_modulo}</TableCell>
                  <TableCell>{row.descripcion_modulo}</TableCell>
                  <TableCell>{row.estado_modulo}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5 }}>Editar</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(row.id_modulo)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar módulo' : 'Nuevo módulo'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Nombre" value={form.nombre_modulo} onChange={(e) => setForm({ ...form, nombre_modulo: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Descripción" value={form.descripcion_modulo} onChange={(e) => setForm({ ...form, descripcion_modulo: e.target.value })} multiline rows={2} sx={{ mb: 2 }} />
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select label="Estado" value={form.estado_modulo} onChange={(e) => setForm({ ...form, estado_modulo: e.target.value })}>
              <MenuItem value="ACTIVO">ACTIVO</MenuItem>
              <MenuItem value="INACTIVO">INACTIVO</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModuloList;
