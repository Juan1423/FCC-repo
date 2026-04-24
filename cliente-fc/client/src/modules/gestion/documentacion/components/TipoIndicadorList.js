import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import * as documentacionService from '../../../../services/documentacionService';

const emptyForm = () => ({
  nombre_tipo_indicador: '',
  descripcion_tipo_indicador: '',
});

const TipoIndicadorList = () => {
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
      const data = await documentacionService.getTipoIndicadores();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setError('No se pudieron cargar los tipos de indicador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpenModal(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id_tipo_indicador);
    setForm({
      nombre_tipo_indicador: row.nombre_tipo_indicador || '',
      descripcion_tipo_indicador: row.descripcion_tipo_indicador || '',
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await documentacionService.updateTipoIndicador(editingId, form);
      } else {
        await documentacionService.createTipoIndicador(form);
      }
      setOpenModal(false);
      await load();
      setError(null);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setError(`Error al guardar: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este tipo de indicador?')) return;
    try {
      await documentacionService.deleteTipoIndicador(id);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      alert(`No se pudo eliminar: ${msg}`);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Tipos de indicador</Typography>
          <Button variant="contained" size="small" onClick={openCreate}>
            Nuevo tipo
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Box p={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id_tipo_indicador}>
                  <TableCell>{row.nombre_tipo_indicador}</TableCell>
                  <TableCell>{row.descripcion_tipo_indicador}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5 }}>
                      Editar
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(row.id_tipo_indicador)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar tipo de indicador' : 'Nuevo tipo de indicador'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Nombre"
            value={form.nombre_tipo_indicador}
            onChange={(e) => setForm({ ...form, nombre_tipo_indicador: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descripción"
            value={form.descripcion_tipo_indicador}
            onChange={(e) => setForm({ ...form, descripcion_tipo_indicador: e.target.value })}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TipoIndicadorList;
