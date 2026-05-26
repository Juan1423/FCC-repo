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
  const dialogTitleId = 'modulo-dialog-title';

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

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el módulo "${nombre || id}"?`)) return;
    try {
      await documentacionService.deleteModulo(id);
      await load();
    } catch (e) {
      alert(`No se pudo eliminar: ${e?.response?.data?.message || e.message}`);
    }
  };

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ border: 'none', borderRadius: 0 }}>
        <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, borderBottom: '1px solid', borderColor: '#e7e5e4', bgcolor: '#fafaf9' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1c1917' }}>Módulos</Typography>
          <Button variant="contained" size="small" onClick={openCreate} aria-label="Crear nuevo módulo" sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 2 }}>Nuevo módulo</Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3} role="status" aria-live="polite" aria-label="Cargando módulos">
            <CircularProgress size={28} aria-hidden="true" />
          </Box>
        ) : error ? (
          <Box p={2} role="alert">
            <Typography color="error" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{error}</Typography>
          </Box>
        ) : (
          <Table size="small" aria-label="Lista de módulos">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#57534e' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#a8a29e', py: 4 }}>No hay módulos registrados.</TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id_modulo} sx={{ '&:hover': { bgcolor: '#fafaf9' } }}>
                    <TableCell sx={{ fontWeight: 500, color: '#1c1917' }}>{row.nombre_modulo}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{row.descripcion_modulo}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{row.estado_modulo}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5, textTransform: 'none', fontWeight: 500, color: '#0d9488', minWidth: 0 }} aria-label={`Editar ${row.nombre_modulo}`}>Editar</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(row.id_modulo, row.nombre_modulo)} sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }} aria-label={`Eliminar ${row.nombre_modulo}`}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth aria-labelledby={dialogTitleId}>
        <DialogTitle id={dialogTitleId} sx={{ fontWeight: 700, color: '#1c1917' }}>{editingId ? 'Editar módulo' : 'Nuevo módulo'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Nombre del módulo" value={form.nombre_modulo} onChange={(e) => setForm({ ...form, nombre_modulo: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Descripción" value={form.descripcion_modulo} onChange={(e) => setForm({ ...form, descripcion_modulo: e.target.value })} multiline rows={2} sx={{ mb: 2 }} />
          <FormControl fullWidth>
            <InputLabel id="estado-modulo-label">Estado</InputLabel>
            <Select labelId="estado-modulo-label" label="Estado" value={form.estado_modulo} onChange={(e) => setForm({ ...form, estado_modulo: e.target.value })}>
              <MenuItem value="ACTIVO">ACTIVO</MenuItem>
              <MenuItem value="INACTIVO">INACTIVO</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', fontWeight: 500, color: '#78716c' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3 }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModuloList;