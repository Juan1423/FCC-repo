import React, { useEffect, useState, useCallback } from 'react';
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
  id_tipo_institucion: '',
  nombre_institucion: '',
  descripcion_institucion: '',
  representante_institucion: '',
  ruc_institucion: '',
  direccion_institucion: '',
  telefonos_institucion: '',
  email_institucion: '',
  redes_institucion: '',
  archivo_institucion: '',
  observaciones_institucion: '',
});

const InstitucionList = () => {
  const [items, setItems] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tiposMap, setTiposMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [archivoFile, setArchivoFile] = useState(null);
  const dialogTitleId = 'institucion-dialog-title';

  const loadTipos = useCallback(async () => {
    try {
      const data = await documentacionService.getTipoInstituciones();
      const list = Array.isArray(data) ? data : [];
      setTipos(list);
      const map = {};
      list.forEach((t) => { map[t.id_tipo_institucion] = t.nombre_tipo_institucion; });
      setTiposMap(map);
    } catch { setTipos([]); setTiposMap({}); }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentacionService.getInstituciones();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setError('No se pudieron cargar las instituciones.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTipos(); load(); }, [loadTipos, load]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setOpenModal(true); };

  const openEdit = (row) => {
    setEditingId(row.id_institucion);
    setForm({
      id_tipo_institucion: row.id_tipo_institucion ?? '',
      nombre_institucion: row.nombre_institucion || '',
      descripcion_institucion: row.descripcion_institucion || '',
      representante_institucion: row.representante_institucion || '',
      ruc_institucion: row.ruc_institucion || '',
      direccion_institucion: row.direccion_institucion || '',
      telefonos_institucion: row.telefonos_institucion || '',
      email_institucion: row.email_institucion || '',
      redes_institucion: row.redes_institucion || '',
      archivo_institucion: row.archivo_institucion || '',
      observaciones_institucion: row.observaciones_institucion || '',
    });
    setOpenModal(true);
  };

  const buildPayload = () => {
    const payload = { ...form };
    if (payload.id_tipo_institucion === '' || payload.id_tipo_institucion == null) {
      payload.id_tipo_institucion = null;
    } else {
      payload.id_tipo_institucion = Number(payload.id_tipo_institucion);
    }
    Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = null; });
    return payload;
  };

  const handleSave = async () => {
    try {
      const payload = buildPayload();
      if (archivoFile) {
        const fd = new FormData();
        Object.keys(payload).forEach(k => { if (payload[k] != null) fd.append(k, payload[k]); });
        fd.append('archivo_institucion', archivoFile);
        if (editingId) {
          await documentacionService.updateInstitucion(editingId, fd);
        } else {
          await documentacionService.createInstitucion(fd);
        }
      } else {
        if (editingId) {
          await documentacionService.updateInstitucion(editingId, payload);
        } else {
          await documentacionService.createInstitucion(payload);
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
    if (!window.confirm(`¿Eliminar la institución "${nombre || id}"?`)) return;
    try {
      await documentacionService.deleteInstitucion(id);
      await load();
    } catch (e) {
      alert(`No se pudo eliminar: ${e?.response?.data?.message || e.message}`);
    }
  };

  const field = (key, label, props = {}) => (
    <TextField key={key} fullWidth label={label} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} sx={{ mb: 1.5 }} {...props} />
  );

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ border: 'none', borderRadius: 0 }}>
        <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, borderBottom: '1px solid', borderColor: '#e7e5e4', bgcolor: '#fafaf9' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1c1917' }}>Instituciones</Typography>
          <Button variant="contained" size="small" onClick={openCreate} aria-label="Crear nueva institución" sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 2 }}>Nueva institución</Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3} role="status" aria-live="polite" aria-label="Cargando instituciones">
            <CircularProgress size={28} aria-hidden="true" />
          </Box>
        ) : error ? (
          <Box p={2} role="alert">
            <Typography color="error" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{error}</Typography>
          </Box>
        ) : (
          <Table size="small" aria-label="Lista de instituciones">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>Representante</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#57534e' }}>RUC</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#57534e' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#a8a29e', py: 4 }}>No hay instituciones registradas.</TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id_institucion} sx={{ '&:hover': { bgcolor: '#fafaf9' } }}>
                    <TableCell sx={{ fontWeight: 500, color: '#1c1917' }}>{row.nombre_institucion}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{tiposMap[row.id_tipo_institucion] || '—'}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{row.representante_institucion}</TableCell>
                    <TableCell sx={{ color: '#57534e' }}>{row.ruc_institucion}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {row.archivo_institucion && (
                        <Button size="small" onClick={() => window.open(API_IMAGE_URL + row.archivo_institucion, '_blank')} sx={{ mr: 0.5, textTransform: 'none', fontWeight: 500, color: '#0d9488', minWidth: 0 }} aria-label={`Ver archivo de ${row.nombre_institucion}`}>Ver archivo</Button>
                      )}
                      <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5, textTransform: 'none', fontWeight: 500, color: '#0d9488', minWidth: 0 }} aria-label={`Editar ${row.nombre_institucion}`}>Editar</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(row.id_institucion, row.nombre_institucion)} sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }} aria-label={`Eliminar ${row.nombre_institucion}`}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth scroll="paper" aria-labelledby={dialogTitleId}>
        <DialogTitle id={dialogTitleId} sx={{ fontWeight: 700, color: '#1c1917' }}>{editingId ? 'Editar institución' : 'Nueva institución'}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="tipo-institucion-label">Tipo de institución</InputLabel>
            <Select labelId="tipo-institucion-label" label="Tipo de institución" value={form.id_tipo_institucion === '' ? '' : form.id_tipo_institucion} onChange={(e) => setForm({ ...form, id_tipo_institucion: e.target.value })}>
              <MenuItem value=""><em>Sin tipo</em></MenuItem>
              {tipos.map((t) => (<MenuItem key={t.id_tipo_institucion} value={t.id_tipo_institucion}>{t.nombre_tipo_institucion}</MenuItem>))}
            </Select>
          </FormControl>
          {field('nombre_institucion', 'Nombre de la institución')}
          {field('descripcion_institucion', 'Descripción', { multiline: true, rows: 2 })}
          {field('representante_institucion', 'Representante')}
          {field('ruc_institucion', 'RUC')}
          {field('direccion_institucion', 'Dirección')}
          {field('telefonos_institucion', 'Teléfonos')}
          {field('email_institucion', 'Email')}
          {field('redes_institucion', 'Redes sociales')}
          <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small" sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 1.5 }} aria-label={archivoFile ? `Archivo seleccionado: ${archivoFile.name}` : 'Subir archivo'}>
              {archivoFile ? archivoFile.name : 'Subir archivo'}
              <input type="file" hidden onChange={(e) => setArchivoFile(e.target.files[0] || null)} aria-hidden="true" />
            </Button>
            {archivoFile && (
              <Button size="small" color="error" onClick={() => setArchivoFile(null)} sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }}>Quitar</Button>
            )}
            {form.archivo_institucion && !archivoFile && (
              <Button size="small" onClick={() => window.open(API_IMAGE_URL + form.archivo_institucion, '_blank')} sx={{ textTransform: 'none', fontWeight: 500, color: '#0d9488' }}>Ver archivo actual</Button>
            )}
          </Box>
          {field('observaciones_institucion', 'Observaciones', { multiline: true, rows: 2 })}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', fontWeight: 500, color: '#78716c' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3 }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstitucionList;