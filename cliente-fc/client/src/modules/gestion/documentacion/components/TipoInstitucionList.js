import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, CircularProgress, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import * as documentacionService from '../../../../services/documentacionService';

const emptyForm = () => ({ nombre_tipo_institucion: '', descripcion_tipo_institucion: '' });

const TipoInstitucionList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const dialogTitleId = 'tipo-institucion-dialog-title';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentacionService.getTipoInstituciones();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setError('No se pudieron cargar los tipos de institución.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setOpenModal(true); };

  const openEdit = (row) => {
    setEditingId(row.id_tipo_institucion);
    setForm({
      nombre_tipo_institucion: row.nombre_tipo_institucion || '',
      descripcion_tipo_institucion: row.descripcion_tipo_institucion || '',
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await documentacionService.updateTipoInstitucion(editingId, form);
      } else {
        await documentacionService.createTipoInstitucion(form);
      }
      setOpenModal(false);
      await load();
      setError(null);
    } catch (e) {
      setError(`Error al guardar: ${e?.response?.data?.message || e.message}`);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el tipo de institución "${nombre || id}"?`)) return;
    try {
      await documentacionService.deleteTipoInstitucion(id);
      await load();
    } catch (e) {
      alert(`No se pudo eliminar: ${e?.response?.data?.message || e.message}`);
    }
  };

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ border: 'none', borderRadius: 0 }}>
        <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, borderBottom: '1px solid', borderColor: '#e7e5e4', bgcolor: '#fafaf9' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1c1917' }}>Tipos de institución</Typography>
          <Button variant="contained" size="small" onClick={openCreate} aria-label="Crear nuevo tipo de institución" sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 2 }}>Nuevo tipo</Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3} role="status" aria-live="polite" aria-label="Cargando tipos de institución">
            <CircularProgress size={28} aria-hidden="true" />
          </Box>
        ) : error ? (
          <Box p={2} role="alert">
            <Typography color="error" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{error}</Typography>
          </Box>
        ) : (
          <Table size="small" aria-label="Lista de tipos de institución">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Descripción</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#57534e' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#a8a29e', py: 4 }}>No hay tipos de institución registrados.</TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id_tipo_institucion} sx={{ '&:hover': { bgcolor: '#fafaf9' } }}>
                    <TableCell sx={{ fontWeight: 500, color: '#1c1917' }}>{row.nombre_tipo_institucion}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{row.descripcion_tipo_institucion}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5, textTransform: 'none', fontWeight: 500, color: '#0d9488', minWidth: 0 }} aria-label={`Editar ${row.nombre_tipo_institucion}`}>Editar</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(row.id_tipo_institucion, row.nombre_tipo_institucion)} sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }} aria-label={`Eliminar ${row.nombre_tipo_institucion}`}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth aria-labelledby={dialogTitleId}>
        <DialogTitle id={dialogTitleId} sx={{ fontWeight: 700, color: '#1c1917' }}>{editingId ? 'Editar tipo de institución' : 'Nuevo tipo de institución'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Nombre del tipo" value={form.nombre_tipo_institucion} onChange={(e) => setForm({ ...form, nombre_tipo_institucion: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Descripción" value={form.descripcion_tipo_institucion} onChange={(e) => setForm({ ...form, descripcion_tipo_institucion: e.target.value })} multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', fontWeight: 500, color: '#78716c' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3 }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TipoInstitucionList;