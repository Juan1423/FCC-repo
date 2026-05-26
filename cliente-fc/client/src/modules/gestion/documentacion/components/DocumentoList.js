import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, CircularProgress, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { API_IMAGE_URL } from '../../../../services/apiConfig';
import * as documentacionService from '../../../../services/documentacionService';

const emptyForm = () => ({
  id_tipo_documento: '',
  id_modulo: '',
  id_proceso: '',
  nombre_documento: '',
  url_documento: '',
  descripcion_documento: '',
  responsable_documento: '',
  palabras_documento: '',
  fecha_envio_documento: '',
  fecha_recepcion_documento: '',
  fecha_revision_documento: '',
  remitente_documento: '',
  recibe_documento: '',
  estado_documento: '',
  version_documento: '',
  observaciones_documento: '',
  objetivo_documento: '',
});

const DocumentoList = () => {
  const [items, setItems] = useState([]);
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
  const errorId = 'documento-error-message';
  const loadingId = 'documento-loading';
  const dialogTitleId = 'documento-dialog-title';
  const firstFieldRef = useRef(null);

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
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setError('No se pudieron cargar los documentos.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCatalogs(); load(); }, [loadCatalogs, load]);

  useEffect(() => {
    if (openModal) {
      const timer = setTimeout(() => { firstFieldRef.current?.focus(); }, 50);
      return () => clearTimeout(timer);
    }
  }, [openModal]);

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
        if (editingId) {
          await documentacionService.updateDocumento(editingId, fd);
        } else {
          await documentacionService.createDocumento(fd);
        }
      } else {
        if (editingId) {
          await documentacionService.updateDocumento(editingId, payload);
        } else {
          await documentacionService.createDocumento(payload);
        }
      }
      setArchivoFile(null);
      setOpenModal(false);
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
      await load();
    } catch (e) {
      alert(`No se pudo eliminar: ${e?.response?.data?.message || e.message}`);
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
      inputRef={key === 'nombre_documento' ? firstFieldRef : undefined}
      {...props}
    />
  );

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ border: 'none', borderRadius: 0 }}>
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            borderBottom: '1px solid',
            borderColor: '#e7e5e4',
            bgcolor: '#fafaf9',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1c1917' }}>
            Documentos
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={openCreate}
            aria-label="Crear nuevo documento"
            sx={{
              bgcolor: '#0d9488',
              '&:hover': { bgcolor: '#0f766e' },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
              px: 2,
            }}
          >
            Nuevo documento
          </Button>
        </Box>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            p={3}
            id={loadingId}
            role="status"
            aria-live="polite"
            aria-label="Cargando documentos"
          >
            <CircularProgress size={28} aria-hidden="true" />
            <Typography variant="srOnly" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
              Cargando documentos...
            </Typography>
          </Box>
        ) : error ? (
          <Box p={2} role="alert" id={errorId}>
            <Typography color="error" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{error}</Typography>
          </Box>
        ) : (
          <Table size="small" aria-label="Lista de documentos">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Versión</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#57534e' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#a8a29e', py: 4 }}>
                    No hay documentos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id_documento} sx={{ '&:hover': { bgcolor: '#fafaf9' } }}>
                    <TableCell sx={{ fontWeight: 500, color: '#1c1917' }}>{row.nombre_documento}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{tiposDocMap[row.id_tipo_documento] || '—'}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{row.estado_documento}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{row.version_documento}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {row.url_documento && (
                        <Button
                          size="small"
                          onClick={() => window.open(row.url_documento.startsWith('/') ? API_IMAGE_URL + row.url_documento : row.url_documento, '_blank')}
                          sx={{ mr: 0.5, textTransform: 'none', fontWeight: 500, color: '#0d9488', minWidth: 0 }}
                          aria-label={`Ver archivo de ${row.nombre_documento}`}
                        >
                          Ver archivo
                        </Button>
                      )}
                      <Button
                        size="small"
                        onClick={() => openEdit(row)}
                        sx={{ mr: 0.5, textTransform: 'none', fontWeight: 500, color: '#0d9488', minWidth: 0 }}
                        aria-label={`Editar ${row.nombre_documento}`}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(row.id_documento, row.nombre_documento)}
                        sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }}
                        aria-label={`Eliminar ${row.nombre_documento}`}
                      >
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

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        aria-labelledby={dialogTitleId}
        aria-describedby={error ? errorId : undefined}
      >
        <DialogTitle id={dialogTitleId} sx={{ fontWeight: 700, color: '#1c1917' }}>
          {editingId ? 'Editar documento' : 'Nuevo documento'}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="tipo-documento-label">Tipo de documento</InputLabel>
            <Select
              labelId="tipo-documento-label"
              label="Tipo de documento"
              value={form.id_tipo_documento === '' ? '' : form.id_tipo_documento}
              onChange={(e) => setForm({ ...form, id_tipo_documento: e.target.value })}
            >
              <MenuItem value=""><em>Sin tipo</em></MenuItem>
              {tiposDoc.map((t) => (<MenuItem key={t.id_tipo_documento} value={t.id_tipo_documento}>{t.nombre_tipo_documento}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="modulo-label">Módulo</InputLabel>
            <Select
              labelId="modulo-label"
              label="Módulo"
              value={form.id_modulo === '' ? '' : form.id_modulo}
              onChange={(e) => setForm({ ...form, id_modulo: e.target.value })}
            >
              <MenuItem value=""><em>Sin módulo</em></MenuItem>
              {modulos.map((m) => (<MenuItem key={m.id_modulo} value={m.id_modulo}>{m.nombre_modulo}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="proceso-label">Proceso</InputLabel>
            <Select
              labelId="proceso-label"
              label="Proceso"
              value={form.id_proceso === '' ? '' : form.id_proceso}
              onChange={(e) => setForm({ ...form, id_proceso: e.target.value })}
            >
              <MenuItem value=""><em>Sin proceso</em></MenuItem>
              {procesos.map((p) => (<MenuItem key={p.id_proceso} value={p.id_proceso}>{p.nombre_proceso}</MenuItem>))}
            </Select>
          </FormControl>
          {field('nombre_documento', 'Nombre del documento')}
          <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              size="small"
              sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 1.5 }}
              aria-label={archivoFile ? `Archivo seleccionado: ${archivoFile.name}` : 'Subir archivo'}
            >
              {archivoFile ? archivoFile.name : 'Subir archivo'}
              <input type="file" hidden onChange={(e) => setArchivoFile(e.target.files[0] || null)} aria-hidden="true" />
            </Button>
            {archivoFile && (
              <Button size="small" color="error" onClick={() => setArchivoFile(null)} sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }}>
                Quitar
              </Button>
            )}
            {form.url_documento && !archivoFile && (
              <Button size="small" onClick={() => window.open(form.url_documento.startsWith('/') ? API_IMAGE_URL + form.url_documento : form.url_documento, '_blank')} sx={{ textTransform: 'none', fontWeight: 500, color: '#0d9488' }}>
                Ver archivo actual
              </Button>
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', fontWeight: 500, color: '#78716c' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              bgcolor: '#0d9488',
              '&:hover': { bgcolor: '#0f766e' },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
              px: 3,
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentoList;