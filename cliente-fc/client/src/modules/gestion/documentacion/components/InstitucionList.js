import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableFooter, TablePagination,
  Paper, Button, CircularProgress, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BusinessIcon from '@mui/icons-material/Business';
import { API_IMAGE_URL } from '../../../../services/apiConfig';
import * as documentacionService from '../../../../services/documentacionService';

const emptyForm = () => ({
  id_tipo_institucion: '', nombre_institucion: '', descripcion_institucion: '',
  representante_institucion: '', ruc_institucion: '', direccion_institucion: '',
  telefonos_institucion: '', email_institucion: '', redes_institucion: '',
  archivo_institucion: '', observaciones_institucion: '',
});

const InstitucionList = () => {
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const firstFieldRef = useRef(null);
  const dialogTitleId = 'institucion-dialog-title';
  const liveId = 'institucion-live-announce';

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
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      setFiltered(list);
    } catch {
      setItems([]);
      setFiltered([]);
      setError('No se pudieron cargar las instituciones.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTipos(); load(); const t = setTimeout(() => setAnimating(false), 600); return () => clearTimeout(t); }, [loadTipos, load]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(items); return; }
    setFiltered(items.filter((r) =>
      (r.nombre_institucion && r.nombre_institucion.toLowerCase().includes(q)) ||
      (r.representante_institucion && r.representante_institucion.toLowerCase().includes(q)) ||
      (r.ruc_institucion && r.ruc_institucion.toLowerCase().includes(q)) ||
      (tiposMap[r.id_tipo_institucion] && tiposMap[r.id_tipo_institucion].toLowerCase().includes(q))
    ));
  }, [search, items, tiposMap]);

  useEffect(() => {
    if (openModal) { const t = setTimeout(() => { firstFieldRef.current?.focus(); }, 80); return () => clearTimeout(t); }
  }, [openModal]);

  useEffect(() => { setPage(0); }, [search]);

  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const announce = (msg) => { const el = document.getElementById(liveId); if (el) el.textContent = msg; };

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setArchivoFile(null); setOpenModal(true); };

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
    if (payload.id_tipo_institucion === '' || payload.id_tipo_institucion == null) payload.id_tipo_institucion = null;
    else payload.id_tipo_institucion = Number(payload.id_tipo_institucion);
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
        if (editingId) await documentacionService.updateInstitucion(editingId, fd);
        else await documentacionService.createInstitucion(fd);
      } else {
        if (editingId) await documentacionService.updateInstitucion(editingId, payload);
        else await documentacionService.createInstitucion(payload);
      }
      setArchivoFile(null);
      setOpenModal(false);
      announce(editingId ? 'Institución actualizada' : 'Institución creada');
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
      announce(`Institución "${nombre}" eliminada`);
      await load();
    } catch (e) {
      alert(`No se pudo eliminar: ${e?.response?.data?.message || e.message}`);
    }
  };

  const field = (key, label, props = {}) => (
    <TextField key={key} fullWidth label={label} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} sx={{ mb: 1.5 }} inputRef={key === 'nombre_institucion' ? firstFieldRef : undefined} {...props} />
  );

  const paginatedItems = rowsPerPage === -1
    ? filtered
    : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Box sx={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#e7e5e4', borderRadius: 2, bgcolor: '#ffffff', overflow: 'hidden' }}>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, borderBottom: '1px solid', borderColor: '#e7e5e4', bgcolor: '#fafaf9' }}>
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1c1917', letterSpacing: '-0.01em' }}>Instituciones</Typography>
              <Typography variant="body2" sx={{ color: '#a8a29e', fontSize: '0.8rem', mt: 0.25 }}>{filtered.length} {filtered.length === 1 ? 'institución' : 'instituciones'}{search && ' encontradas'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField size="small" placeholder="Buscar instituciones..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar instituciones por nombre, representante, RUC o tipo" slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#a8a29e', mr: 0.5, fontSize: 18 }} /> } }} sx={{ width: { xs: 1, sm: 'auto' }, '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#ffffff', fontSize: '0.85rem', '& fieldset': { borderColor: '#e7e5e4' }, '&:hover fieldset': { borderColor: '#d6d3d1' }, '&.Mui-focused fieldset': { borderColor: '#0d9488' } } }} />
              <Button variant="contained" size="small" onClick={openCreate} startIcon={<AddIcon />} aria-label="Crear nueva institución" sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2, py: 0.75, fontSize: '0.85rem', boxShadow: '0 1px 3px rgba(13,148,136,0.2)', whiteSpace: 'nowrap' }}>Nueva institución</Button>
            </Box>
          </Box>
          <TableContainer sx={{ overflow: 'auto', maxHeight: { xs: 'calc(100vh - 240px)', md: 'none' }, position: 'relative', borderTop: '3px solid #0d9488', borderRadius: 0, border: 'none !important', boxShadow: 'none !important' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4} role="status" aria-live="polite" aria-label="Cargando instituciones"><CircularProgress size={28} aria-hidden="true" sx={{ color: '#0d9488' }} /><Typography variant="srOnly" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Cargando instituciones...</Typography></Box>
          ) : error ? (
            <Box p={3} role="alert" aria-live="assertive"><Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#fef2f2', color: '#991b1b', px: 2, py: 1.25, borderRadius: '8px', border: '1px solid', borderColor: '#fecaca' }}><Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{error}</Typography></Box></Box>
          ) : (
            <Table size="small" aria-label="Lista de instituciones" stickyHeader sx={{ minWidth: 650, '& .MuiTableCell-root': { wordBreak: 'break-word', overflowWrap: 'break-word' } }}>
              <TableHead>
                <TableRow>
                  {['Nombre', 'Tipo', 'Representante', 'RUC', 'Acciones'].map((h) => (<TableCell key={h} sx={{ display: h === 'RUC' ? { xs: 'none', md: 'table-cell' } : undefined, fontWeight: 600, color: '#57534e', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid', borderColor: '#e7e5e4', py: 1.5 }} align={h === 'Acciones' ? 'right' : 'left'}>{h}</TableCell>))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 5 }}>
                    <Box sx={{ color: '#d6d3d1', mb: 1, fontSize: '2rem', lineHeight: 1 }}>○</Box>
                    <Typography sx={{ color: '#a8a29e', fontWeight: 500 }}>{search ? 'No se encontraron instituciones con ese criterio.' : 'No hay instituciones registradas.'}</Typography>
                    {!search && <Button size="small" onClick={openCreate} startIcon={<AddIcon />} sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600, color: '#0d9488', borderRadius: '8px' }} aria-label="Crear la primera institución">Crear primera institución</Button>}
                  </TableCell></TableRow>
                ) : (
                  paginatedItems.map((row) => (
                    <TableRow key={row.id_institucion} sx={{ '&:hover': { bgcolor: '#fafaf9' }, '&:focus-within': { bgcolor: '#f0fdfa' }, transition: 'background-color 0.15s ease' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1c1917', fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><BusinessIcon sx={{ color: '#0d9488', fontSize: 18, opacity: 0.6 }} />{row.nombre_institucion}</Box>
                      </TableCell>
                      <TableCell sx={{ color: '#57534e', fontSize: '0.85rem' }}>{tiposMap[row.id_tipo_institucion] || '—'}</TableCell>
                      <TableCell sx={{ color: '#57534e', fontSize: '0.85rem' }}>{row.representante_institucion || '—'}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, color: '#57534e', fontSize: '0.85rem' }}>{row.ruc_institucion || '—'}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        {row.archivo_institucion && (
                          <Tooltip title="Ver archivo" arrow>
                            <IconButton size="small" onClick={() => window.open(API_IMAGE_URL + row.archivo_institucion, '_blank')} aria-label={`Ver archivo de ${row.nombre_institucion}`} sx={{ color: '#0d9488', borderRadius: '8px', mr: 0.25, '&:hover': { bgcolor: 'rgba(13,148,136,0.08)' } }}><OpenInNewIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Editar institución" arrow>
                          <IconButton size="small" onClick={() => openEdit(row)} aria-label={`Editar ${row.nombre_institucion}`} sx={{ color: '#0d9488', borderRadius: '8px', mr: 0.25, '&:hover': { bgcolor: 'rgba(13,148,136,0.08)' } }}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar institución" arrow>
                          <IconButton size="small" onClick={() => handleDelete(row.id_institucion, row.nombre_institucion)} aria-label={`Eliminar ${row.nombre_institucion}`} sx={{ color: '#ef4444', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}><DeleteIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: 'Todos', value: -1 }]}
                    colSpan={5}
                    count={filtered.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{ inputProps: { 'aria-label': 'Filas por página' }, native: true }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    sx={{ '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' } } }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          )}
          </TableContainer>
        </Paper>
      </Box>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth scroll="paper" aria-labelledby={dialogTitleId}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(2px)', bgcolor: 'rgba(0,0,0,0.3)' } } }}
        PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } }}>
        <DialogTitle id={dialogTitleId} sx={{ fontWeight: 700, color: '#1c1917', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: '#e7e5e4', px: 3, py: 2 }}>
          {editingId ? 'Editar institución' : 'Nueva institución'}
          <IconButton size="small" onClick={() => setOpenModal(false)} aria-label="Cerrar formulario" sx={{ color: '#a8a29e', borderRadius: '8px' }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5, px: 3 }}>
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
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small" sx={{ textTransform: 'none', fontWeight: 500, borderRadius: '8px' }} aria-label={archivoFile ? `Archivo seleccionado: ${archivoFile.name}` : 'Subir archivo'}>
              {archivoFile ? archivoFile.name : 'Subir archivo'}
              <input type="file" hidden onChange={(e) => setArchivoFile(e.target.files[0] || null)} aria-hidden="true" />
            </Button>
            {archivoFile && <Button size="small" color="error" onClick={() => setArchivoFile(null)} sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }}>Quitar</Button>}
            {form.archivo_institucion && !archivoFile && (
              <Button size="small" onClick={() => window.open(API_IMAGE_URL + form.archivo_institucion, '_blank')} sx={{ textTransform: 'none', fontWeight: 500, color: '#0d9488' }}>Ver archivo actual</Button>
            )}
          </Box>
          {field('observaciones_institucion', 'Observaciones', { multiline: true, rows: 2 })}
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

export default InstitucionList;
