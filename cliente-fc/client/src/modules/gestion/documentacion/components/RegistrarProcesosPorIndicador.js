import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import * as documentacionService from '../../../../services/documentacionService';

/**
 * CRUD de filas `registrar_procesos` filtradas por id_indicador.
 * Requiere proceso (documentación) y normativa (DocNormativa) existentes.
 */
const RegistrarProcesosPorIndicador = ({ idIndicador, nombreIndicador, open, onClose, onChanged }) => {
  const [rows, setRows] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [normativas, setNormativas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    id_proceso: '',
    id_normativa: '',
    descripcion_registrar_procesos: '',
    fecha_registrar_proceso: '',
  });

  const loadCatalogos = useCallback(async () => {
    try {
      const [p, n] = await Promise.all([documentacionService.getProcesos(), documentacionService.getNormativas()]);
      setProcesos(Array.isArray(p) ? p : []);
      setNormativas(Array.isArray(n) ? n : []);
    } catch {
      setProcesos([]);
      setNormativas([]);
    }
  }, []);

  const loadRegistros = useCallback(async () => {
    if (idIndicador == null) return;
    setLoading(true);
    try {
      const all = await documentacionService.getRegistrarProcesos();
      const list = Array.isArray(all) ? all : [];
      setRows(list.filter((r) => String(r.id_indicador) === String(idIndicador)));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [idIndicador]);

  useEffect(() => {
    if (open) {
      loadCatalogos();
      loadRegistros();
    }
  }, [open, loadCatalogos, loadRegistros]);

  const procesoLabel = (id) => {
    const x = procesos.find((p) => String(p.id_proceso) === String(id));
    return x ? `${x.codigo_proceso || ''} ${x.nombre_proceso || ''}`.trim() || `#${id}` : `#${id}`;
  };

  const normativaLabel = (id) => {
    const x = normativas.find((n) => String(n.id_normativa) === String(id));
    return x ? x.nombre_normativa || `#${id}` : `#${id}`;
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      id_proceso: '',
      id_normativa: '',
      descripcion_registrar_procesos: '',
      fecha_registrar_proceso: '',
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id_registrar_procesos);
    setForm({
      id_proceso: row.id_proceso,
      id_normativa: row.id_normativa,
      descripcion_registrar_procesos: row.descripcion_registrar_procesos || '',
      fecha_registrar_proceso: row.fecha_registrar_proceso || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.id_proceso || !form.id_normativa) {
      alert('Seleccione proceso y normativa.');
      return;
    }
    const payload = {
      id_proceso: Number(form.id_proceso),
      id_indicador: Number(idIndicador),
      id_normativa: Number(form.id_normativa),
      descripcion_registrar_procesos: form.descripcion_registrar_procesos || null,
      fecha_registrar_proceso: form.fecha_registrar_proceso || null,
    };
    try {
      if (editingId) {
        await documentacionService.updateRegistrarProceso(editingId, payload);
      } else {
        await documentacionService.createRegistrarProceso(payload);
      }
      setModalOpen(false);
      await loadRegistros();
      onChanged?.();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      alert(`Error al guardar: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await documentacionService.deleteRegistrarProceso(id);
      await loadRegistros();
      onChanged?.();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      alert(`Error al eliminar: ${msg}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        Registros vinculados — Indicador: {nombreIndicador || `#${idIndicador}`}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" size="small" onClick={openCreate} disabled={!procesos.length || !normativas.length}>
            Nuevo vínculo
          </Button>
          {(!procesos.length || !normativas.length) && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Debe existir al menos un proceso y una normativa (documentación) para crear vínculos.
            </Typography>
          )}
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Proceso</TableCell>
                  <TableCell>Normativa</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">Sin registros para este indicador.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id_registrar_procesos}>
                      <TableCell>{procesoLabel(r.id_proceso)}</TableCell>
                      <TableCell>{normativaLabel(r.id_normativa)}</TableCell>
                      <TableCell>{r.descripcion_registrar_procesos}</TableCell>
                      <TableCell>{r.fecha_registrar_proceso}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openEdit(r)} sx={{ mr: 0.5 }}>
                          Editar
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(r.id_registrar_procesos)}>
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar vínculo' : 'Nuevo vínculo'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Proceso</InputLabel>
            <Select
              label="Proceso"
              value={form.id_proceso}
              onChange={(e) => setForm({ ...form, id_proceso: e.target.value })}
            >
              {procesos.map((p) => (
                <MenuItem key={p.id_proceso} value={p.id_proceso}>
                  {procesoLabel(p.id_proceso)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Normativa (documentación)</InputLabel>
            <Select
              label="Normativa (documentación)"
              value={form.id_normativa}
              onChange={(e) => setForm({ ...form, id_normativa: e.target.value })}
            >
              {normativas.map((n) => (
                <MenuItem key={n.id_normativa} value={n.id_normativa}>
                  {normativaLabel(n.id_normativa)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Descripción"
            value={form.descripcion_registrar_procesos}
            onChange={(e) => setForm({ ...form, descripcion_registrar_procesos: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="date"
            label="Fecha"
            InputLabelProps={{ shrink: true }}
            value={form.fecha_registrar_proceso || ''}
            onChange={(e) => setForm({ ...form, fecha_registrar_proceso: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default RegistrarProcesosPorIndicador;
