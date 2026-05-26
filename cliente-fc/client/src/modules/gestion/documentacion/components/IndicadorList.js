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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { API_IMAGE_URL } from '../../../../services/apiConfig';
import * as documentacionService from '../../../../services/documentacionService';
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
  const [archivoFile, setArchivoFile] = useState(null);
  const [regOpen, setRegOpen] = useState(false);
  const [regIndicador, setRegIndicador] = useState({ id: null, nombre: '' });
  const dialogTitleId = 'indicador-dialog-title';

  const loadTipos = useCallback(async () => {
    try {
      const data = await documentacionService.getTipoIndicadores();
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
      const data = await documentacionService.getIndicadores();
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
      if (archivoFile) {
        const fd = new FormData();
        Object.keys(payload).forEach(k => { if (payload[k] != null) fd.append(k, payload[k]); });
        fd.append('archivo_indicador', archivoFile);
        if (editingId) {
          await documentacionService.updateIndicador(editingId, fd);
        } else {
          await documentacionService.createIndicador(fd);
        }
      } else {
        if (editingId) {
          await documentacionService.updateIndicador(editingId, payload);
        } else {
          await documentacionService.createIndicador(payload);
        }
      }
      setArchivoFile(null);
      setOpenModal(false);
      await loadIndicadores();
      setError(null);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      setError(`Error al guardar indicador: ${msg}`);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el indicador "${nombre || id}"? Se pueden perder vínculos en registrar_procesos.`)) return;
    try {
      await documentacionService.deleteIndicador(id);
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
      <TableContainer component={Paper} elevation={0} sx={{ border: 'none', borderRadius: 0 }}>
        <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, borderBottom: '1px solid', borderColor: '#e7e5e4', bgcolor: '#fafaf9' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1c1917' }}>Indicadores</Typography>
          <Button variant="contained" size="small" onClick={openCreate} aria-label="Crear nuevo indicador" sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 2 }}>
            Nuevo indicador
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3} role="status" aria-live="polite" aria-label="Cargando indicadores">
            <CircularProgress size={28} aria-hidden="true" />
          </Box>
        ) : error ? (
          <Box p={2} role="alert">
            <Typography color="error" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{error}</Typography>
          </Box>
        ) : (
          <Table size="small" aria-label="Lista de indicadores">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Valor</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#57534e' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#a8a29e', py: 4 }}>No hay indicadores registrados.</TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id_indicador} sx={{ '&:hover': { bgcolor: '#fafaf9' } }}>
                    <TableCell sx={{ fontWeight: 500, color: '#1c1917' }}>{row.nombre_indicador}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{tiposMap[row.id_tipo_indicador] || '—'}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{row.estado_indicador}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{row.valor_indicador}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {row.archivo_indicador && (
                        <Button size="small" onClick={() => window.open(API_IMAGE_URL + row.archivo_indicador, '_blank')} sx={{ mr: 0.5, textTransform: 'none', fontWeight: 500, color: '#0d9488', minWidth: 0 }} aria-label={`Ver archivo de ${row.nombre_indicador}`}>
                          Ver archivo
                        </Button>
                      )}
                      <Button size="small" startIcon={<LinkIcon />} onClick={() => openRegistros(row)} sx={{ mr: 0.5, textTransform: 'none', fontWeight: 500, color: '#0d9488', minWidth: 0 }} aria-label={`Ver vínculos de ${row.nombre_indicador}`}>
                        Vínculos
                      </Button>
                      <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5, textTransform: 'none', fontWeight: 500, color: '#0d9488', minWidth: 0 }} aria-label={`Editar ${row.nombre_indicador}`}>
                        Editar
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(row.id_indicador, row.nombre_indicador)} sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }} aria-label={`Eliminar ${row.nombre_indicador}`}>
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

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth scroll="paper" aria-labelledby={dialogTitleId}>
        <DialogTitle id={dialogTitleId} sx={{ fontWeight: 700, color: '#1c1917' }}>{editingId ? 'Editar indicador' : 'Nuevo indicador'}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="tipo-indicador-label">Tipo de indicador</InputLabel>
            <Select
              labelId="tipo-indicador-label"
              label="Tipo de indicador"
              value={form.id_tipo_indicador === '' ? '' : form.id_tipo_indicador}
              onChange={(e) => setForm({ ...form, id_tipo_indicador: e.target.value })}
            >
              <MenuItem value=""><em>Sin tipo</em></MenuItem>
              {tipos.map((t) => (
                <MenuItem key={t.id_tipo_indicador} value={t.id_tipo_indicador}>{t.nombre_tipo_indicador}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {field('nombre_indicador', 'Nombre del indicador')}
          {field('descripcion_indicador', 'Descripción', { multiline: true, rows: 2 })}
          {field('fecha_elaboracion_indicador', 'Fecha elaboración', { type: 'date', InputLabelProps: { shrink: true } })}
          {field('fecha_ultima_actualizacion_indicador', 'Última actualización', { type: 'date', InputLabelProps: { shrink: true } })}
          {field('formula_indicador', 'Fórmula')}
          {field('variables_indicador', 'Variables')}
          {field('periodicidad_indicador', 'Periodicidad')}
          {field('medidas_indicador', 'Medidas')}
          {field('valor_indicador', 'Valor', { type: 'number' })}
          {field('objetivo_indicador', 'Objetivo')}
          <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small" sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 1.5 }} aria-label={archivoFile ? `Archivo seleccionado: ${archivoFile.name}` : 'Subir archivo'}>
              {archivoFile ? archivoFile.name : 'Subir archivo'}
              <input type="file" hidden onChange={(e) => setArchivoFile(e.target.files[0] || null)} aria-hidden="true" />
            </Button>
            {archivoFile && (
              <Button size="small" color="error" onClick={() => setArchivoFile(null)} sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }}>Quitar</Button>
            )}
            {form.archivo_indicador && !archivoFile && (
              <Button size="small" onClick={() => window.open(API_IMAGE_URL + form.archivo_indicador, '_blank')} sx={{ textTransform: 'none', fontWeight: 500, color: '#0d9488' }}>
                Ver archivo actual
              </Button>
            )}
          </Box>
          {field('evalua_indicador', 'Evalúa')}
          {field('estado_indicador', 'Estado')}
          {field('observaciones_indicador', 'Observaciones', { multiline: true, rows: 2 })}
          {field('fuente_indicador', 'Fuente')}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', fontWeight: 500, color: '#78716c' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3 }}>Guardar</Button>
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