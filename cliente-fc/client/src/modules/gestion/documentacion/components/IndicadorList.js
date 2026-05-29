import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, CircularProgress, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LinkIcon from '@mui/icons-material/Link';
import BarChartIcon from '@mui/icons-material/BarChart';
import { API_IMAGE_URL } from '../../../../services/apiConfig';
import * as documentacionService from '../../../../services/documentacionService';
import RegistrarProcesosPorIndicador from './RegistrarProcesosPorIndicador';

const emptyForm = () => ({
  id_tipo_indicador: '', nombre_indicador: '', descripcion_indicador: '',
  fecha_elaboracion_indicador: '', fecha_ultima_actualizacion_indicador: '',
  formula_indicador: '', variables_indicador: '', periodicidad_indicador: '',
  medidas_indicador: '', valor_indicador: '', objetivo_indicador: '',
  archivo_indicador: '', evalua_indicador: '', estado_indicador: '',
  observaciones_indicador: '', fuente_indicador: '',
});

const IndicadorList = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tiposMap, setTiposMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [archivoFile, setArchivoFile] = useState(null);
  const [search, setSearch] = useState('');
  const [animating, setAnimating] = useState(true);
  const [regOpen, setRegOpen] = useState(false);
  const [regIndicador, setRegIndicador] = useState({ id: null, nombre: '' });
  const firstFieldRef = useRef(null);
  const dialogTitleId = 'indicador-dialog-title';
  const liveId = 'indicador-live-announce';

  const loadTipos = useCallback(async () => {
    try {
      const data = await documentacionService.getTipoIndicadores();
      const list = Array.isArray(data) ? data : [];
      setTipos(list);
      const map = {};
      list.forEach((t) => { map[t.id_tipo_indicador] = t.nombre_tipo_indicador; });
      setTiposMap(map);
    } catch { setTipos([]); setTiposMap({}); }
  }, []);

  const loadIndicadores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentacionService.getIndicadores();
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      setFiltered(list);
    } catch {
      setItems([]);
      setFiltered([]);
      setError('No se pudieron cargar los indicadores.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTipos(); loadIndicadores(); const t = setTimeout(() => setAnimating(false), 600); return () => clearTimeout(t); }, [loadTipos, loadIndicadores]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(items); return; }
    setFiltered(items.filter((r) =>
      (r.nombre_indicador && r.nombre_indicador.toLowerCase().includes(q)) ||
      (tiposMap[r.id_tipo_indicador] && tiposMap[r.id_tipo_indicador].toLowerCase().includes(q)) ||
      (r.estado_indicador && r.estado_indicador.toLowerCase().includes(q))
    ));
  }, [search, items, tiposMap]);

  useEffect(() => {
    if (openModal) { const t = setTimeout(() => { firstFieldRef.current?.focus(); }, 80); return () => clearTimeout(t); }
  }, [openModal]);

  const announce = (msg) => { const el = document.getElementById(liveId); if (el) el.textContent = msg; };

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setArchivoFile(null); setOpenModal(true); };

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
    if (payload.id_tipo_indicador === '' || payload.id_tipo_indicador == null) payload.id_tipo_indicador = null;
    else payload.id_tipo_indicador = Number(payload.id_tipo_indicador);
    if (payload.valor_indicador === '' || payload.valor_indicador == null) payload.valor_indicador = null;
    else payload.valor_indicador = Number(payload.valor_indicador);
    Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = null; });
    return payload;
  };

  const handleSave = async () => {
    try {
      const payload = buildPayload();
      if (archivoFile) {
        const fd = new FormData();
        Object.keys(payload).forEach(k => { if (payload[k] != null) fd.append(k, payload[k]); });
        fd.append('archivo_indicador', archivoFile);
        if (editingId) await documentacionService.updateIndicador(editingId, fd);
        else await documentacionService.createIndicador(fd);
      } else {
        if (editingId) await documentacionService.updateIndicador(editingId, payload);
        else await documentacionService.createIndicador(payload);
      }
      setArchivoFile(null);
      setOpenModal(false);
      announce(editingId ? 'Indicador actualizado' : 'Indicador creado');
      await loadIndicadores();
      setError(null);
    } catch (e) {
      setError(`Error al guardar indicador: ${e?.response?.data?.message || e.message}`);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el indicador "${nombre || id}"? Se pueden perder vínculos en registrar_procesos.`)) return;
    try {
      await documentacionService.deleteIndicador(id);
      announce(`Indicador "${nombre}" eliminado`);
      await loadIndicadores();
    } catch (e) {
      alert(`No se pudo eliminar: ${e?.response?.data?.message || e.message}`);
    }
  };

  const openRegistros = (row) => {
    setRegIndicador({ id: row.id_indicador, nombre: row.nombre_indicador || '' });
    setRegOpen(true);
  };

  const field = (key, label, props = {}) => (
    <TextField key={key} fullWidth label={label} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} sx={{ mb: 1.5 }} inputRef={key === 'nombre_indicador' ? firstFieldRef : undefined} {...props} />
  );

  return (
    <>
      <Box sx={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: '#e7e5e4', borderRadius: 2, overflow: { xs: 'auto', sm: 'visible' }, bgcolor: '#ffffff', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: '#0d9488', borderTopLeftRadius: 2, borderTopRightRadius: 2, zIndex: 1 } }}>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, borderBottom: '1px solid', borderColor: '#e7e5e4', bgcolor: '#fafaf9' }}>
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1c1917', letterSpacing: '-0.01em' }}>Indicadores</Typography>
              <Typography variant="body2" sx={{ color: '#a8a29e', fontSize: '0.8rem', mt: 0.25 }}>{filtered.length} {filtered.length === 1 ? 'indicador' : 'indicadores'}{search && ' encontrados'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField size="small" placeholder="Buscar indicadores..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar indicadores por nombre, tipo o estado" slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#a8a29e', mr: 0.5, fontSize: 18 }} /> } }} sx={{ width: { xs: 1, sm: 'auto' }, '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#ffffff', fontSize: '0.85rem', '& fieldset': { borderColor: '#e7e5e4' }, '&:hover fieldset': { borderColor: '#d6d3d1' }, '&.Mui-focused fieldset': { borderColor: '#0d9488' } } }} />
              <Button variant="contained" size="small" onClick={openCreate} startIcon={<AddIcon />} aria-label="Crear nuevo indicador" sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2, py: 0.75, fontSize: '0.85rem', boxShadow: '0 1px 3px rgba(13,148,136,0.2)', whiteSpace: 'nowrap' }}>Nuevo indicador</Button>
            </Box>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4} role="status" aria-live="polite" aria-label="Cargando indicadores"><CircularProgress size={28} aria-hidden="true" sx={{ color: '#0d9488' }} /><Typography variant="srOnly" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Cargando indicadores...</Typography></Box>
          ) : error ? (
            <Box p={3} role="alert" aria-live="assertive"><Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#fef2f2', color: '#991b1b', px: 2, py: 1.25, borderRadius: '8px', border: '1px solid', borderColor: '#fecaca' }}><Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{error}</Typography></Box></Box>
          ) : (
            <Table size="small" aria-label="Lista de indicadores" sx={{ '& .MuiTableCell-root': { wordBreak: 'break-word', overflowWrap: 'break-word' } }}>
              <TableHead>
                <TableRow>
                  {['Nombre', 'Tipo', 'Estado', 'Valor', 'Acciones'].map((h) => (<TableCell key={h} sx={{ display: h === 'Valor' ? { xs: 'none', md: 'table-cell' } : undefined, fontWeight: 600, color: '#57534e', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid', borderColor: '#e7e5e4', py: 1.5 }} align={h === 'Acciones' ? 'right' : 'left'}>{h}</TableCell>))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 5 }}>
                    <Box sx={{ color: '#d6d3d1', mb: 1, fontSize: '2rem', lineHeight: 1 }}>○</Box>
                    <Typography sx={{ color: '#a8a29e', fontWeight: 500 }}>{search ? 'No se encontraron indicadores con ese criterio.' : 'No hay indicadores registrados.'}</Typography>
                    {!search && <Button size="small" onClick={openCreate} startIcon={<AddIcon />} sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600, color: '#0d9488', borderRadius: '8px' }} aria-label="Crear el primer indicador">Crear primer indicador</Button>}
                  </TableCell></TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id_indicador} sx={{ '&:hover': { bgcolor: '#fafaf9' }, '&:focus-within': { bgcolor: '#f0fdfa' }, transition: 'background-color 0.15s ease' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1c1917', fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><BarChartIcon sx={{ color: '#0d9488', fontSize: 18, opacity: 0.6 }} />{row.nombre_indicador}</Box>
                      </TableCell>
                      <TableCell sx={{ color: '#57534e', fontSize: '0.85rem' }}>{tiposMap[row.id_tipo_indicador] || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}><Chip label={row.estado_indicador || '—'} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px', height: 26, bgcolor: '#f5f5f4', color: '#57534e' }} /></TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, color: '#57534e', fontSize: '0.85rem' }}>{row.valor_indicador != null ? row.valor_indicador : '—'}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Ver vínculos" arrow>
                          <IconButton size="small" onClick={() => openRegistros(row)} aria-label={`Ver vínculos de ${row.nombre_indicador}`} sx={{ color: '#0d9488', borderRadius: '8px', mr: 0.25, '&:hover': { bgcolor: 'rgba(13,148,136,0.08)' } }}><LinkIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        {row.archivo_indicador && (
                          <Tooltip title="Ver archivo" arrow>
                            <IconButton size="small" onClick={() => window.open(API_IMAGE_URL + row.archivo_indicador, '_blank')} aria-label={`Ver archivo de ${row.nombre_indicador}`} sx={{ color: '#0d9488', borderRadius: '8px', mr: 0.25, '&:hover': { bgcolor: 'rgba(13,148,136,0.08)' } }}><OpenInNewIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Editar indicador" arrow>
                          <IconButton size="small" onClick={() => openEdit(row)} aria-label={`Editar ${row.nombre_indicador}`} sx={{ color: '#0d9488', borderRadius: '8px', mr: 0.25, '&:hover': { bgcolor: 'rgba(13,148,136,0.08)' } }}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar indicador" arrow>
                          <IconButton size="small" onClick={() => handleDelete(row.id_indicador, row.nombre_indicador)} aria-label={`Eliminar ${row.nombre_indicador}`} sx={{ color: '#ef4444', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}><DeleteIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Box>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth scroll="paper" aria-labelledby={dialogTitleId}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(2px)', bgcolor: 'rgba(0,0,0,0.3)' } } }}
        PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } }}>
        <DialogTitle id={dialogTitleId} sx={{ fontWeight: 700, color: '#1c1917', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: '#e7e5e4', px: 3, py: 2 }}>
          {editingId ? 'Editar indicador' : 'Nuevo indicador'}
          <IconButton size="small" onClick={() => setOpenModal(false)} aria-label="Cerrar formulario" sx={{ color: '#a8a29e', borderRadius: '8px' }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5, px: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="tipo-indicador-label">Tipo de indicador</InputLabel>
            <Select labelId="tipo-indicador-label" label="Tipo de indicador" value={form.id_tipo_indicador === '' ? '' : form.id_tipo_indicador} onChange={(e) => setForm({ ...form, id_tipo_indicador: e.target.value })}>
              <MenuItem value=""><em>Sin tipo</em></MenuItem>
              {tipos.map((t) => (<MenuItem key={t.id_tipo_indicador} value={t.id_tipo_indicador}>{t.nombre_tipo_indicador}</MenuItem>))}
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
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small" sx={{ textTransform: 'none', fontWeight: 500, borderRadius: '8px' }} aria-label={archivoFile ? `Archivo seleccionado: ${archivoFile.name}` : 'Subir archivo'}>
              {archivoFile ? archivoFile.name : 'Subir archivo'}
              <input type="file" hidden onChange={(e) => setArchivoFile(e.target.files[0] || null)} aria-hidden="true" />
            </Button>
            {archivoFile && <Button size="small" color="error" onClick={() => setArchivoFile(null)} sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }}>Quitar</Button>}
            {form.archivo_indicador && !archivoFile && (
              <Button size="small" onClick={() => window.open(API_IMAGE_URL + form.archivo_indicador, '_blank')} sx={{ textTransform: 'none', fontWeight: 500, color: '#0d9488' }}>Ver archivo actual</Button>
            )}
          </Box>
          {field('evalua_indicador', 'Evalúa')}
          {field('estado_indicador', 'Estado')}
          {field('observaciones_indicador', 'Observaciones', { multiline: true, rows: 2 })}
          {field('fuente_indicador', 'Fuente')}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: '#e7e5e4' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', fontWeight: 500, color: '#78716c', borderRadius: '8px', px: 2.5 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 3, boxShadow: '0 1px 3px rgba(13,148,136,0.25)' }}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <RegistrarProcesosPorIndicador open={regOpen} onClose={() => setRegOpen(false)} idIndicador={regIndicador.id} nombreIndicador={regIndicador.nombre} onChanged={loadIndicadores} />

      <Box id={liveId} role="status" aria-live="polite" aria-atomic="true" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }} />
    </>
  );
};

export default IndicadorList;
