import React, { useEffect, useState, useCallback } from 'react';
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
import * as api from '../../../../services/documentacionService';

const emptyForm = () => ({
  nombre_tipo_proceso: '',
  descripcion_tipo_proceso: '',
});

const TipoProcesoList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDocTipoProcesos();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setError('No se pudieron cargar los tipos de proceso.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpenModal(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id_tipo_proceso);
    setForm({
      nombre_tipo_proceso: row.nombre_tipo_proceso || '',
      descripcion_tipo_proceso: row.descripcion_tipo_proceso || '',
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.updateDocTipoProceso(editingId, form);
      } else {
        await api.createDocTipoProceso(form);
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
    if (!window.confirm('¿Eliminar este tipo de proceso?')) return;
    try {
      await api.deleteDocTipoProceso(id);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      alert(`No se pudo eliminar: ${msg}`);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6">Tipos de Proceso</Typography>
          <Button variant="contained" size="small" onClick={openCreate}>
            Nuevo tipo de proceso
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
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No hay tipos de proceso registrados.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id_tipo_proceso}>
                    <TableCell>{row.id_tipo_proceso}</TableCell>
                    <TableCell>{row.nombre_tipo_proceso}</TableCell>
                    <TableCell>{row.descripcion_tipo_proceso}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5 }}>
                        Editar
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(row.id_tipo_proceso)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Tipo de Proceso' : 'Nuevo Tipo de Proceso'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Nombre"
            value={form.nombre_tipo_proceso}
            onChange={(e) => setForm({ ...form, nombre_tipo_proceso: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descripción"
            value={form.descripcion_tipo_proceso}
            onChange={(e) => setForm({ ...form, descripcion_tipo_proceso: e.target.value })}
            multiline
            rows={3}
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

export default TipoProcesoList;