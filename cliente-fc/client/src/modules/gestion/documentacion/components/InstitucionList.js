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

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta institución?')) return;
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
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6">Instituciones</Typography>
          <Button variant="contained" size="small" onClick={openCreate}>Nueva institución</Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress size={28} /></Box>
        ) : error ? (
          <Box p={2}><Typography color="error">{error}</Typography></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Representante</TableCell>
                <TableCell>RUC</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id_institucion}>
                  <TableCell>{row.nombre_institucion}</TableCell>
                  <TableCell>{tiposMap[row.id_tipo_institucion] || '—'}</TableCell>
                  <TableCell>{row.representante_institucion}</TableCell>
                  <TableCell>{row.ruc_institucion}</TableCell>
                  <TableCell align="right">
                    {row.archivo_institucion && (
                      <Button size="small" onClick={() => window.open(API_IMAGE_URL + row.archivo_institucion, '_blank')} sx={{ mr: 0.5 }}>Ver archivo</Button>
                    )}
                    <Button size="small" onClick={() => openEdit(row)} sx={{ mr: 0.5 }}>Editar</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(row.id_institucion)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>{editingId ? 'Editar institución' : 'Nueva institución'}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de institución</InputLabel>
            <Select label="Tipo de institución" value={form.id_tipo_institucion === '' ? '' : form.id_tipo_institucion} onChange={(e) => setForm({ ...form, id_tipo_institucion: e.target.value })}>
              <MenuItem value=""><em>Sin tipo</em></MenuItem>
              {tipos.map((t) => (<MenuItem key={t.id_tipo_institucion} value={t.id_tipo_institucion}>{t.nombre_tipo_institucion}</MenuItem>))}
            </Select>
          </FormControl>
          {field('nombre_institucion', 'Nombre')}
          {field('descripcion_institucion', 'Descripción', { multiline: true, rows: 2 })}
          {field('representante_institucion', 'Representante')}
          {field('ruc_institucion', 'RUC')}
          {field('direccion_institucion', 'Dirección')}
          {field('telefonos_institucion', 'Teléfonos')}
          {field('email_institucion', 'Email')}
          {field('redes_institucion', 'Redes sociales')}
          <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small">
              {archivoFile ? archivoFile.name : 'Subir archivo'}
              <input type="file" hidden onChange={(e) => setArchivoFile(e.target.files[0] || null)} />
            </Button>
            {archivoFile && (
              <Button size="small" color="error" onClick={() => setArchivoFile(null)}>Quitar</Button>
            )}
            {form.archivo_institucion && !archivoFile && (
              <Button size="small" onClick={() => window.open(API_IMAGE_URL + form.archivo_institucion, '_blank')}>
                Ver archivo actual
              </Button>
            )}
          </Box>
          {field('observaciones_institucion', 'Observaciones', { multiline: true, rows: 2 })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstitucionList;
