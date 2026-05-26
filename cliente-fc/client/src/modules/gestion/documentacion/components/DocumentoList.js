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
import DescriptionIcon from '@mui/icons-material/Description';
import { API_IMAGE_URL } from '../../../../services/apiConfig';
import * as documentacionService from '../../../../services/documentacionService';

const emptyForm = () => ({
  id_tipo_documento: '', id_modulo: '', id_proceso: '',
  nombre_documento: '', url_documento: '', descripcion_documento: '',
  responsable_documento: '', palabras_documento: '', fecha_envio_documento: '',
  fecha_recepcion_documento: '', fecha_revision_documento: '', remitente_documento: '',
  recibe_documento: '', estado_documento: '', version_documento: '',
  observaciones_documento: '', objetivo_documento: '',
});

const DocumentoList = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [tiposDocMap, setTiposDocMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [archivoFile, setArchivoFile] = useState(null);
  const [search, setSearch] = useState('');
  const [animating, setAnimating] = useState(true);
  const firstFieldRef = useRef(null);
  const errorId = 'documento-error-message';
  const dialogTitleId = 'documento-dialog-title';
  const liveId = 'documento-live-announce';

  const loadCatalogs = useCallback(async () => {
    try {
      const [td, m, p] = await Promise.all([
        documentacionService.getTipoDocumentos(),
        documentacionService.getModulos(),
        documentacionService.getProcesos(),
      ]);
      const tdList = Array.isArray(td) ? td : [];
      const mList = Array.isArray(m) ? m : [];
      const pList = Array.isArray(p) ? p : [];
      setTiposDoc(tdList);
      setModulos(mList);
      setProcesos(pList);
      const tdm = {};
      tdList.forEach((t) => { tdm[t.id_tipo_documento] = t.nombre_tipo_documento; });
      setTiposDocMap(tdm);
    } catch { setTiposDoc([]); setModulos([]); setProcesos([]); setTiposDocMap({}); }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentacionService.getDocumentos();
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      setFiltered(list);
    } catch {
      setItems([]);
      setFiltered([]);
      setError('No se pudieron cargar los documentos.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCatalogs(); load(); const t = setTimeout(() => setAnimating(false), 600); return () => clearTimeout(t); }, [loadCatalogs, load]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(items); return; }
    setFiltered(items.filter((d) =>
      (d.nombre_documento && d.nombre_documento.toLowerCase().includes(q)) ||
      (d.responsable_documento && d.responsable_documento.toLowerCase().includes(q)) ||
      (tiposDocMap[d.id_tipo_documento] && tiposDocMap[d.id_tipo_documento].toLowerCase().includes(q)) ||
      (d.estado_documento && d.estado_documento.toLowerCase().includes(q)) ||
      (d.remitente_documento && d.remitente_documento.toLowerCase().includes(q))
    ));
  }, [search, items, tiposDocMap]);

  useEffect(() => {
    if (openModal) { const t = setTimeout(() => { firstFieldRef.current?.focus(); }, 80); return () => clearTimeout(t); }
  }, [openModal]);

  const announce = (msg) => { const el = document.getElementById(liveId); if (el) el.textContent = msg; };

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setArchivoFile(null); setOpenModal(true); };

  const openEdit = (row) => {
    setEditingId(row.id_documento);
    setForm({
      id_tipo_documento: row.id_tipo_documento ?? '',
      id_modulo: row.id_modulo ?? '',
      id_proceso: row.id_proceso ?? '',
      nombre_documento: row.nombre_documento || '',
      url_documento: row.url_documento || '',
      descripcion_documento: row.descripcion_documento || '',
      responsable_documento: row.responsable_documento || '',
      palabras_documento: row.palabras_documento || '',
      fecha_envio_documento: row.fecha_envio_documento || '',
      fecha_recepcion_documento: row.fecha_recepcion_documento || '',
      fecha_revision_documento: row.fecha_revision_documento || '',
      remitente_documento: row.remitente_documento || '',
      recibe_documento: row.recibe_documento || '',
      estado_documento: row.estado_documento || '',
      version_documento: row.version_documento || '',
      observaciones_documento: row.observaciones_documento || '',
      objetivo_documento: row.objetivo_documento || '',
    });
    setOpenModal(true);
  };

  const buildPayload = () => {
    const payload = { ...form };
    ['id_tipo_documento', 'id_modulo', 'id_proceso'].forEach((k) => {
      if (payload[k] === '' || payload[k] == null) payload[k] = null;
      else payload[k] = Number(payload[k]);
    });
    Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = null; });
    return payload;
  };

  const handleSave = async () => {
    try {
      const payload = buildPayload();
      if (archivoFile) {
        const fd = new FormData();
        Object.keys(payload).forEach(k => { if (payload[k] != null) fd.append(k, payload[k]); });
        fd.append('url_documento', archivoFile);
        if (editingId) await documentacionService.updateDocumento(editingId, fd);
        else await documentacionService.createDocumento(fd);
      } else {
        if (editingId) await documentacionService.updateDocumento(editingId, payload);
        else await documentacionService.createDocumento(payload);
      }
      setArchivoFile(null);
      setOpenModal(false);
      announce(editingId ? 'Documento actualizado' : 'Documento creado');
      await load();
      setError(null);
    } catch (e) {
      setError(`Error al guardar: ${e?.response?.data?.message || e.message}`);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el documento "${nombre || id}"?`)) return;
    try {
      await documentacionService.deleteDocumento(id);
      announce(`Documento "${nombre}" eliminado`);
      await load();
    } catch (e) {
      alert(`No se pudo eliminar: ${e?.response?.data?.message || e.message}`);
    }
  };

  const field = (key, label, props = {}) => (
    <TextField key={key} fullWidth label={label} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} sx={{ mb: 1.5 }} inputRef={key === 'nombre_documento' ? firstFieldRef : undefined} {...props} />
  );

  return (
    <>
      <Box sx={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: '#e7e5e4', borderRadius: 2, overflow: 'visible', bgcolor: '#ffffff', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: '#0d9488', borderTopLeftRadius: 2, borderTopRightRadius: 2, zIndex: 1 } }}>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, borderBottom: '1px solid', borderColor: '#e7e5e4', bgcolor: '#fafaf9' }}>
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1c1917', letterSpacing: '-0.01em' }}>Documentos</Typography>
              <Typography variant="body2" sx={{ color: '#a8a29e', fontSize: '0.8rem', mt: 0.25 }}>{filtered.length} {filtered.length === 1 ? 'documento' : 'documentos'}{search && ' encontrados'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField size="small" placeholder="Buscar documentos..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar documentos por nombre, responsable, tipo o estado" slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#a8a29e', mr: 0.5, fontSize: 18 }} /> } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#ffffff', fontSize: '0.85rem', '& fieldset': { borderColor: '#e7e5e4' }, '&:hover fieldset': { borderColor: '#d6d3d1' }, '&.Mui-focused fieldset': { borderColor: '#0d9488' } } }} />
              <Button variant="contained" size="small" onClick={openCreate} startIcon={<AddIcon />} aria-label="Crear nuevo documento" sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2, py: 0.75, fontSize: '0.85rem', boxShadow: '0 1px 3px rgba(13,148,136,0.2)', whiteSpace: 'nowrap' }}>Nuevo documento</Button>
            </Box>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4} role="status" aria-live="polite" aria-label="Cargando documentos"><CircularProgress size={28} aria-hidden="true" sx={{ color: '#0d9488' }} /><Typography variant="srOnly" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Cargando documentos...</Typography></Box>
          ) : error ? (
            <Box p={3} role="alert" id={errorId} aria-live="assertive"><Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#fef2f2', color: '#991b1b', px: 2, py: 1.25, borderRadius: '8px', border: '1px solid', borderColor: '#fecaca' }}><Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{error}</Typography></Box></Box>
          ) : (
            <Table size="small" aria-label="Lista de documentos">
              <TableHead>
                <TableRow>
                  {['Nombre', 'Tipo', 'Estado', 'Versión', 'Acciones'].map((h) => (<TableCell key={h} sx={{ fontWeight: 600, color: '#57534e', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid', borderColor: '#e7e5e4', py: 1.5 }} align={h === 'Acciones' ? 'right' : 'left'}>{h}</TableCell>))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 5 }}>
                    <Box sx={{ color: '#d6d3d1', mb: 1, fontSize: '2rem', lineHeight: 1 }}>○</Box>
                    <Typography sx={{ color: '#a8a29e', fontWeight: 500 }}>{search ? 'No se encontraron documentos con ese criterio.' : 'No hay documentos registrados.'}</Typography>
                    {!search && <Button size="small" onClick={openCreate} startIcon={<AddIcon />} sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600, color: '#0d9488', borderRadius: '8px' }} aria-label="Crear el primer documento">Crear primer documento</Button>}
                  </TableCell></TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id_documento} sx={{ '&:hover': { bgcolor: '#fafaf9' }, '&:focus-within': { bgcolor: '#f0fdfa' }, transition: 'background-color 0.15s ease' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1c1917', fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><DescriptionIcon sx={{ color: '#0d9488', fontSize: 18, opacity: 0.6 }} />{row.nombre_documento}</Box>
                      </TableCell>
                      <TableCell sx={{ color: '#57534e', fontSize: '0.85rem' }}>{tiposDocMap[row.id_tipo_documento] || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}><Chip label={row.estado_documento || '—'} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px', height: 26, bgcolor: '#f5f5f4', color: '#57534e' }} /></TableCell>
                      <TableCell sx={{ color: '#57534e', fontSize: '0.85rem' }}>{row.version_documento || '—'}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        {row.url_documento && (
                          <Tooltip title="Ver archivo" arrow>
                            <IconButton size="small" onClick={() => window.open(row.url_documento.startsWith('/') ? API_IMAGE_URL + row.url_documento : row.url_documento, '_blank')} aria-label={`Ver archivo de ${row.nombre_documento}`} sx={{ color: '#0d9488', borderRadius: '8px', mr: 0.25, '&:hover': { bgcolor: 'rgba(13,148,136,0.08)' } }}><OpenInNewIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Editar documento" arrow>
                          <IconButton size="small" onClick={() => openEdit(row)} aria-label={`Editar ${row.nombre_documento}`} sx={{ color: '#0d9488', borderRadius: '8px', mr: 0.25, '&:hover': { bgcolor: 'rgba(13,148,136,0.08)' } }}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar documento" arrow>
                          <IconButton size="small" onClick={() => handleDelete(row.id_documento, row.nombre_documento)} aria-label={`Eliminar ${row.nombre_documento}`} sx={{ color: '#ef4444', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}><DeleteIcon fontSize="small" /></IconButton>
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
          {editingId ? 'Editar documento' : 'Nuevo documento'}
          <IconButton size="small" onClick={() => setOpenModal(false)} aria-label="Cerrar formulario" sx={{ color: '#a8a29e', borderRadius: '8px' }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5, px: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="tipo-documento-label">Tipo de documento</InputLabel>
            <Select labelId="tipo-documento-label" label="Tipo de documento" value={form.id_tipo_documento === '' ? '' : form.id_tipo_documento} onChange={(e) => setForm({ ...form, id_tipo_documento: e.target.value })}>
              <MenuItem value=""><em>Sin tipo</em></MenuItem>
              {tiposDoc.map((t) => (<MenuItem key={t.id_tipo_documento} value={t.id_tipo_documento}>{t.nombre_tipo_documento}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="modulo-label">Módulo</InputLabel>
            <Select labelId="modulo-label" label="Módulo" value={form.id_modulo === '' ? '' : form.id_modulo} onChange={(e) => setForm({ ...form, id_modulo: e.target.value })}>
              <MenuItem value=""><em>Sin módulo</em></MenuItem>
              {modulos.map((m) => (<MenuItem key={m.id_modulo} value={m.id_modulo}>{m.nombre_modulo}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="proceso-label">Proceso</InputLabel>
            <Select labelId="proceso-label" label="Proceso" value={form.id_proceso === '' ? '' : form.id_proceso} onChange={(e) => setForm({ ...form, id_proceso: e.target.value })}>
              <MenuItem value=""><em>Sin proceso</em></MenuItem>
              {procesos.map((p) => (<MenuItem key={p.id_proceso} value={p.id_proceso}>{p.nombre_proceso}</MenuItem>))}
            </Select>
          </FormControl>
          {field('nombre_documento', 'Nombre del documento')}
          <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small" sx={{ textTransform: 'none', fontWeight: 500, borderRadius: '8px' }} aria-label={archivoFile ? `Archivo seleccionado: ${archivoFile.name}` : 'Subir archivo'}>
              {archivoFile ? archivoFile.name : 'Subir archivo'}
              <input type="file" hidden onChange={(e) => setArchivoFile(e.target.files[0] || null)} aria-hidden="true" />
            </Button>
            {archivoFile && <Button size="small" color="error" onClick={() => setArchivoFile(null)} sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }}>Quitar</Button>}
            {form.url_documento && !archivoFile && (
              <Button size="small" onClick={() => window.open(form.url_documento.startsWith('/') ? API_IMAGE_URL + form.url_documento : form.url_documento, '_blank')} sx={{ textTransform: 'none', fontWeight: 500, color: '#0d9488' }}>Ver archivo actual</Button>
            )}
          </Box>
          {field('descripcion_documento', 'Descripción', { multiline: true, rows: 2 })}
          {field('responsable_documento', 'Responsable')}
          {field('palabras_documento', 'Palabras clave')}
          {field('fecha_envio_documento', 'Fecha de envío', { type: 'date', InputLabelProps: { shrink: true } })}
          {field('fecha_recepcion_documento', 'Fecha de recepción', { type: 'date', InputLabelProps: { shrink: true } })}
          {field('fecha_revision_documento', 'Fecha de revisión', { type: 'date', InputLabelProps: { shrink: true } })}
          {field('remitente_documento', 'Remitente')}
          {field('recibe_documento', 'Recibe')}
          {field('estado_documento', 'Estado')}
          {field('version_documento', 'Versión')}
          {field('objetivo_documento', 'Objetivo')}
          {field('observaciones_documento', 'Observaciones', { multiline: true, rows: 2 })}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: '#e7e5e4' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', fontWeight: 500, color: '#78716c', borderRadius: '8px', px: 2.5 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 3, boxShadow: '0 1px 3px rgba(13,148,136,0.25)' }}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Box id={liveId} role="status" aria-live="polite" aria-atomic="true" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }} />
    </>
  );
};

export default DocumentoList;
