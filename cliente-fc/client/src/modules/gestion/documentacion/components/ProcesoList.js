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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import * as api from '../../../../services/documentacionService';

const emptyForm = () => ({
  id_tipo_proceso: '',
  codigo_proceso: '',
  nombre_proceso: '',
  descripcion_proceso: '',
  responsable_proceso: '',
  nivel_proceso: '',
  padre_proceso: '',
  estado_proceso: '',
  jerarquia_proceso: '',
  archivo_proceso: '',
});

const ProcesoList = () => {
  const [items, setItems] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tiposMap, setTiposMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const loadTipos = useCallback(async () => {
    try {
      const data = await api.getDocTipoProcesos();
      const list = Array.isArray(data) ? data : [];
      setTipos(list);
      const map = {};
      list.forEach((t) => {
        map[t.id_tipo_proceso] = t.nombre_tipo_proceso;
      });
      setTiposMap(map);
    } catch {
      setTipos([]);
      setTiposMap({});
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProcesosDoc();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setError('No se pudieron cargar los procesos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTipos();
    load();
  }, [loadTipos, load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpenModal(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id_proceso);
    setForm({
      id_tipo_proceso: row.id_tipo_proceso ?? '',
      codigo_proceso: row.codigo_proceso || '',
      nombre_proceso: row.nombre_proceso || '',
      descripcion_proceso: row.descripcion_proceso || '',
      responsable_proceso: row.responsable_proceso || '',
      nivel_proceso: row.nivel_proceso != null ? String(row.nivel_proceso) : '',
      padre_proceso: row.padre_proceso ?? '',
      estado_proceso: row.estado_proceso || '',
      jerarquia_proceso: row.jerarquia_proceso || '',
      archivo_proceso: row.archivo_proceso || '',
    });
    setOpenModal(true);
  };

  const buildPayload = () => {
    const payload = { ...form };
    if (payload.id_tipo_proceso === '' || payload.id_tipo_proceso == null) {
      payload.id_tipo_proceso = null;
    } else {
      payload.id_tipo_proceso = Number(payload.id_tipo_proceso);
    }
    if (payload.nivel_proceso === '' || payload.nivel_proceso == null) {
      payload.nivel_proceso = null;
    } else {
      payload.nivel_proceso = Number(payload.nivel_proceso);
    }
    if (payload.padre_proceso === '' || payload.padre_proceso == null) {
      payload.padre_proceso = null;
    } else {
      payload.padre_proceso = Number(payload.padre_proceso);
    }
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '') payload[k] = null;
    });
    return payload;
  };

  const handleSave = async () => {
    try {
      const payload = buildPayload();
      if (editingId) {
        await api.updateProcesoDoc(editingId, payload);
      } else {
        await api.createProcesoDoc(payload);
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
    if (!window.confirm('¿Eliminar este proceso?')) return;
    try {
      await api.deleteProcesoDoc(id);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      alert(`No se pudo eliminar: ${msg}`);
    }
  };

  const field = (key, label, props = {}) => (
    <TextField
      key={key}
      fullWidth
      label={label}
      value={form[key] ?? ''}
      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      sx={{ mb: 1.5 }}
      {...props}
    />
  );

  return (
    <>
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6">Procesos</Typography>
          <Button variant="contained" size="small" onClick={openCreate}>
            Nuevo proceso
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
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Responsable</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">No hay procesos registrados.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id_proceso}>
                    <TableCell>{row.codigo_proceso}</TableCell>
                    <TableCell>{row.nombre_proceso}</TableCell>
                    <TableCell>{tiposMap[row.id_tipo_proceso] || '—'}</TableCell>
                    <TableCell>{row.responsable_proceso}</TableCell>
                    <TableCell>{row.estado_proceso}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5 }}>
                        Editar
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(row.id_proceso)}>
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

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>{editingId ? 'Editar Proceso' : 'Nuevo Proceso'}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Proceso</InputLabel>
            <Select
              label="Tipo de Proceso"
              value={form.id_tipo_proceso === '' ? '' : form.id_tipo_proceso}
              onChange={(e) => setForm({ ...form, id_tipo_proceso: e.target.value })}
            >
              <MenuItem value="">
                <em>Sin tipo</em>
              </MenuItem>
              {tipos.map((t) => (
                <MenuItem key={t.id_tipo_proceso} value={t.id_tipo_proceso}>
                  {t.nombre_tipo_proceso}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {field('codigo_proceso', 'Código')}
          {field('nombre_proceso', 'Nombre')}
          {field('descripcion_proceso', 'Descripción', { multiline: true, rows: 2 })}
          {field('responsable_proceso', 'Responsable')}
          {field('nivel_proceso', 'Nivel', { type: 'number' })}
          {field('estado_proceso', 'Estado')}
          {field('jerarquia_proceso', 'Jerarquía')}
          {field('archivo_proceso', 'Archivo (URL o ruta)')}
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

export default ProcesoList;