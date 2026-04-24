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
  id_tipo_normativa: '',
  nombre_normativa: '',
  descripcion_normativa: '',
  padre_normativa: '',
  nivel_normativa: '',
  jerarquia_normativa: '',
  archivo_normativa: '',
  fecha_normativa: '',
  fecha_modificacion_normativa: '',
  fecha_vigencia_normativa: '',
  tipo_registro_normativa: '',
  observaciones_normativa: '',
});

const NormativaList = () => {
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
      const data = await api.getDocTipoNormativas();
      const list = Array.isArray(data) ? data : [];
      setTipos(list);
      const map = {};
      list.forEach((t) => {
        map[t.id_tipo_normativa] = t.nombre_tipo_normativa;
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
      const data = await api.getDocNormativas();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setError('No se pudieron cargar las normativas.');
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
    setEditingId(row.id_normativa);
    setForm({
      id_tipo_normativa: row.id_tipo_normativa ?? '',
      nombre_normativa: row.nombre_normativa || '',
      descripcion_normativa: row.descripcion_normativa || '',
      padre_normativa: row.padre_normativa ?? '',
      nivel_normativa: row.nivel_normativa != null ? String(row.nivel_normativa) : '',
      jerarquia_normativa: row.jerarquia_normativa || '',
      archivo_normativa: row.archivo_normativa || '',
      fecha_normativa: row.fecha_normativa || '',
      fecha_modificacion_normativa: row.fecha_modificacion_normativa || '',
      fecha_vigencia_normativa: row.fecha_vigencia_normativa || '',
      tipo_registro_normativa: row.tipo_registro_normativa || '',
      observaciones_normativa: row.observaciones_normativa || '',
    });
    setOpenModal(true);
  };

  const buildPayload = () => {
    const payload = { ...form };
    if (payload.id_tipo_normativa === '' || payload.id_tipo_normativa == null) {
      payload.id_tipo_normativa = null;
    } else {
      payload.id_tipo_normativa = Number(payload.id_tipo_normativa);
    }
    if (payload.padre_normativa === '' || payload.padre_normativa == null) {
      payload.padre_normativa = null;
    } else {
      payload.padre_normativa = Number(payload.padre_normativa);
    }
    if (payload.nivel_normativa === '' || payload.nivel_normativa == null) {
      payload.nivel_normativa = null;
    } else {
      payload.nivel_normativa = Number(payload.nivel_normativa);
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
        await api.updateDocNormativa(editingId, payload);
      } else {
        await api.createDocNormativa(payload);
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
    if (!window.confirm('¿Eliminar esta normativa?')) return;
    try {
      await api.deleteDocNormativa(id);
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
          <Typography variant="h6">Normativas</Typography>
          <Button variant="contained" size="small" onClick={openCreate}>
            Nueva normativa
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
                <TableCell>Tipo</TableCell>
                <TableCell>Nivel</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">No hay normativas registradas.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id_normativa}>
                    <TableCell>{row.nombre_normativa}</TableCell>
                    <TableCell>{tiposMap[row.id_tipo_normativa] || '—'}</TableCell>
                    <TableCell>{row.nivel_normativa}</TableCell>
                    <TableCell>{row.fecha_normativa}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5 }}>
                        Editar
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(row.id_normativa)}>
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
        <DialogTitle>{editingId ? 'Editar Normativa' : 'Nueva Normativa'}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Normativa</InputLabel>
            <Select
              label="Tipo de Normativa"
              value={form.id_tipo_normativa === '' ? '' : form.id_tipo_normativa}
              onChange={(e) => setForm({ ...form, id_tipo_normativa: e.target.value })}
            >
              <MenuItem value="">
                <em>Sin tipo</em>
              </MenuItem>
              {tipos.map((t) => (
                <MenuItem key={t.id_tipo_normativa} value={t.id_tipo_normativa}>
                  {t.nombre_tipo_normativa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {field('nombre_normativa', 'Nombre')}
          {field('descripcion_normativa', 'Descripción', { multiline: true, rows: 2 })}
          {field('nivel_normativa', 'Nivel', { type: 'number' })}
          {field('jerarquia_normativa', 'Jerarquía')}
          {field('archivo_normativa', 'Archivo (URL o ruta)')}
          {field('fecha_normativa', 'Fecha', { type: 'date', InputLabelProps: { shrink: true } })}
          {field('fecha_modificacion_normativa', 'Fecha Modificación', { type: 'date', InputLabelProps: { shrink: true } })}
          {field('fecha_vigencia_normativa', 'Fecha Vigencia', { type: 'date', InputLabelProps: { shrink: true } })}
          {field('tipo_registro_normativa', 'Tipo de Registro')}
          {field('observaciones_normativa', 'Observaciones', { multiline: true, rows: 2 })}
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

export default NormativaList;