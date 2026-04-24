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
import LinkIcon from '@mui/icons-material/Link';
import * as api from '../../../../services/documentacionIndicadorService';
import RegistrarProcesosPorIndicador from './RegistrarProcesosPorIndicador';

const emptyForm = () => ({
  id_tipo_indicador: '',
  nombre_indicador: '',
  descripcion_indicador: '',
  fecha_elaboracion_indicador: '',
  fecha_ultima_actualizacion_indicador: '',
  formula_indicador: '',
  variables_indicador: '',
  periodicidad_indicador: '',
  medidas_indicador: '',
  valor_indicador: '',
  objetivo_indicador: '',
  archivo_indicador: '',
  evalua_indicador: '',
  estado_indicador: '',
  observaciones_indicador: '',
  fuente_indicador: '',
});

const IndicadorList = () => {
  const [items, setItems] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tiposMap, setTiposMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [regOpen, setRegOpen] = useState(false);
  const [regIndicador, setRegIndicador] = useState({ id: null, nombre: '' });

  const loadTipos = useCallback(async () => {
    try {
      const data = await api.getTipoIndicadores();
      const list = Array.isArray(data) ? data : [];
      setTipos(list);
      const map = {};
      list.forEach((t) => {
        map[t.id_tipo_indicador] = t.nombre_tipo_indicador;
      });
      setTiposMap(map);
    } catch {
      setTipos([]);
      setTiposMap({});
    }
  }, []);

  const loadIndicadores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getIndicadores();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setError('No se pudieron cargar los indicadores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTipos();
    loadIndicadores();
  }, [loadTipos, loadIndicadores]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpenModal(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id_indicador);
    setForm({
      id_tipo_indicador: row.id_tipo_indicador ?? '',
      nombre_indicador: row.nombre_indicador || '',
      descripcion_indicador: row.descripcion_indicador || '',
      fecha_elaboracion_indicador: row.fecha_elaboracion_indicador || '',
      fecha_ultima_actualizacion_indicador: row.fecha_ultima_actualizacion_indicador || '',
      formula_indicador: row.formula_indicador || '',
      variables_indicador: row.variables_indicador || '',
      periodicidad_indicador: row.periodicidad_indicador || '',
      medidas_indicador: row.medidas_indicador || '',
      valor_indicador: row.valor_indicador != null ? String(row.valor_indicador) : '',
      objetivo_indicador: row.objetivo_indicador || '',
      archivo_indicador: row.archivo_indicador || '',
      evalua_indicador: row.evalua_indicador || '',
      estado_indicador: row.estado_indicador || '',
      observaciones_indicador: row.observaciones_indicador || '',
      fuente_indicador: row.fuente_indicador || '',
    });
    setOpenModal(true);
  };

  const buildPayload = () => {
    const payload = { ...form };
    if (payload.id_tipo_indicador === '' || payload.id_tipo_indicador == null) {
      payload.id_tipo_indicador = null;
    } else {
      payload.id_tipo_indicador = Number(payload.id_tipo_indicador);
    }
    if (payload.valor_indicador === '' || payload.valor_indicador == null) {
      payload.valor_indicador = null;
    } else {
      payload.valor_indicador = Number(payload.valor_indicador);
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
        await api.updateIndicador(editingId, payload);
      } else {
        await api.createIndicador(payload);
      }
      setOpenModal(false);
      await loadIndicadores();
      setError(null);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setError(`Error al guardar indicador: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este indicador? Se pueden perder vínculos en registrar_procesos.')) return;
    try {
      await api.deleteIndicador(id);
      await loadIndicadores();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      alert(`No se pudo eliminar: ${msg}`);
    }
  };

  const openRegistros = (row) => {
    setRegIndicador({ id: row.id_indicador, nombre: row.nombre_indicador || '' });
    setRegOpen(true);
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
          <Typography variant="h6">Indicadores</Typography>
          <Button variant="contained" size="small" onClick={openCreate}>
            Nuevo indicador
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
                <TableCell>Estado</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id_indicador}>
                  <TableCell>{row.nombre_indicador}</TableCell>
                  <TableCell>{tiposMap[row.id_tipo_indicador] || '—'}</TableCell>
                  <TableCell>{row.estado_indicador}</TableCell>
                  <TableCell>{row.valor_indicador}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<LinkIcon />} onClick={() => openRegistros(row)} sx={{ mr: 0.5 }}>
                      Vínculos
                    </Button>
                    <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5 }}>
                      Editar
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(row.id_indicador)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>{editingId ? 'Editar indicador' : 'Nuevo indicador'}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de indicador</InputLabel>
            <Select
              label="Tipo de indicador"
              value={form.id_tipo_indicador === '' ? '' : form.id_tipo_indicador}
              onChange={(e) => setForm({ ...form, id_tipo_indicador: e.target.value })}
            >
              <MenuItem value="">
                <em>Sin tipo</em>
              </MenuItem>
              {tipos.map((t) => (
                <MenuItem key={t.id_tipo_indicador} value={t.id_tipo_indicador}>
                  {t.nombre_tipo_indicador}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {field('nombre_indicador', 'Nombre')}
          {field('descripcion_indicador', 'Descripción', { multiline: true, rows: 2 })}
          {field('fecha_elaboracion_indicador', 'Fecha elaboración', { type: 'date', InputLabelProps: { shrink: true } })}
          {field('fecha_ultima_actualizacion_indicador', 'Última actualización', {
            type: 'date',
            InputLabelProps: { shrink: true },
          })}
          {field('formula_indicador', 'Fórmula')}
          {field('variables_indicador', 'Variables')}
          {field('periodicidad_indicador', 'Periodicidad')}
          {field('medidas_indicador', 'Medidas')}
          {field('valor_indicador', 'Valor', { type: 'number' })}
          {field('objetivo_indicador', 'Objetivo')}
          {field('archivo_indicador', 'Archivo (URL o ruta)')}
          {field('evalua_indicador', 'Evalúa')}
          {field('estado_indicador', 'Estado')}
          {field('observaciones_indicador', 'Observaciones', { multiline: true, rows: 2 })}
          {field('fuente_indicador', 'Fuente')}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <RegistrarProcesosPorIndicador
        open={regOpen}
        onClose={() => setRegOpen(false)}
        idIndicador={regIndicador.id}
        nombreIndicador={regIndicador.nombre}
        onChanged={loadIndicadores}
      />
    </>
  );
};

export default IndicadorList;
