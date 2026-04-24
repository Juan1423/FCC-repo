import React, { useEffect, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import * as docService from '../../../../services/documentacionService';

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

const NormativaList = ({ onView }) => {
  const [items, setItems] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tiposMap, setTiposMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm());

  const fetchTipoNormativas = useCallback(async () => {
    try {
      const data = await docService.getTipoNormativas();
      const list = Array.isArray(data) ? data : [];
      setTipos(list);
      const map = {};
      list.forEach((t) => { map[t.id_tipo_normativa] = t.nombre_tipo_normativa; });
      setTiposMap(map);
    } catch (err) {
      setTipos([]);
      setTiposMap({});
    }
  }, []);

  const fetchNormativas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await docService.getNormativas();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setItems([]);
      setError('Error al cargar normativas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTipoNormativas(); fetchNormativas(); }, [fetchTipoNormativas, fetchNormativas]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar normativa?')) return;
    try {
      await docService.deleteNormativa(id);
      fetchNormativas();
    } catch (err) {
      setError('Error al eliminar normativa');
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setOpenModal(true);
  };

  const handleEditModal = (item) => {
    setEditingId(item.id_normativa);
    setFormData({
      id_tipo_normativa: item.id_tipo_normativa ?? '',
      nombre_normativa: item.nombre_normativa || '',
      descripcion_normativa: item.descripcion_normativa || '',
      padre_normativa: item.padre_normativa ?? '',
      nivel_normativa: item.nivel_normativa != null ? String(item.nivel_normativa) : '',
      jerarquia_normativa: item.jerarquia_normativa || '',
      archivo_normativa: item.archivo_normativa || '',
      fecha_normativa: item.fecha_normativa || '',
      fecha_modificacion_normativa: item.fecha_modificacion_normativa || '',
      fecha_vigencia_normativa: item.fecha_vigencia_normativa || '',
      tipo_registro_normativa: item.tipo_registro_normativa || '',
      observaciones_normativa: item.observaciones_normativa || '',
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const buildPayload = () => {
    const payload = { ...formData };
    if (payload.id_tipo_normativa === "" || payload.id_tipo_normativa == null) {
      payload.id_tipo_normativa = null;
    } else {
      payload.id_tipo_normativa = Number(payload.id_tipo_normativa);
    }
    if (payload.padre_normativa === "" || payload.padre_normativa == null) {
      payload.padre_normativa = null;
    } else {
      payload.padre_normativa = Number(payload.padre_normativa);
    }
    if (payload.nivel_normativa === "" || payload.nivel_normativa == null) {
      payload.nivel_normativa = null;
    } else {
      payload.nivel_normativa = Number(payload.nivel_normativa);
    }
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") payload[k] = null;
    });
    return payload;
  };

  const handleSubmit = async () => {
    if (!formData.nombre_normativa) {
      alert("El nombre de la normativa es requerido");
      return;
    }
    const payload = buildPayload();
    try {
      if (editingId) {
        await docService.updateNormativa(editingId, payload);
      } else {
        await docService.createNormativa(payload);
      }
      setOpenModal(false);
      fetchNormativas();
    } catch (err) {
      setError("Error al guardar normativa");
    }
  };

  const field = (key, label, props = {}) => (
    <TextField
      key={key}
      fullWidth
      label={label}
      value={formData[key] ?? ""}
      onChange={handleChange(key)}
      sx={{ mb: 2 }}
      {...props}
    />
  );

  return (
    <>
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Normativas</Typography>
          <Button variant="contained" size="small" onClick={handleOpenModal}>
            Nueva Normativa
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box p={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Nivel</TableCell>
                <TableCell>Jerarquía</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Fecha Vigencia</TableCell>
                <TableCell>Tipo Registro</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography color="text.secondary">No hay normativas registradas.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((n) => (
                  <TableRow key={n.id_normativa}>
                    <TableCell>{n.nombre_normativa}</TableCell>
                    <TableCell>{tiposMap[n.id_tipo_normativa] || "—"}</TableCell>
                    <TableCell>{n.nivel_normativa}</TableCell>
                    <TableCell>{n.jerarquia_normativa}</TableCell>
                    <TableCell>{n.fecha_normativa}</TableCell>
                    <TableCell>{n.fecha_vigencia_normativa}</TableCell>
                    <TableCell>{n.tipo_registro_normativa}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleEditModal(n)} sx={{ mr: 0.5 }}>
                        Editar
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(n.id_normativa)}>
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

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>{editingId ? "Editar Normativa" : "Nueva Normativa"}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Normativa</InputLabel>
            <Select
              label="Tipo de Normativa"
              value={formData.id_tipo_normativa === "" ? "" : formData.id_tipo_normativa}
              onChange={handleChange("id_tipo_normativa")}
            >
              <MenuItem value=""><em>Sin tipo</em></MenuItem>
              {tipos.map((t) => (
                <MenuItem key={t.id_tipo_normativa} value={t.id_tipo_normativa}>
                  {t.nombre_tipo_normativa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {field("nombre_normativa", "Nombre")}
          {field("descripcion_normativa", "Descripción", { multiline: true, rows: 2 })}
          {field("nivel_normativa", "Nivel", { type: "number" })}
          {field("jerarquia_normativa", "Jerarquía")}
          {field("archivo_normativa", "Archivo (URL o ruta)")}
          {field("fecha_normativa", "Fecha", { type: "date", InputLabelProps: { shrink: true } })}
          {field("fecha_modificacion_normativa", "Fecha Modificación", { type: "date", InputLabelProps: { shrink: true } })}
          {field("fecha_vigencia_normativa", "Fecha Vigencia", { type: "date", InputLabelProps: { shrink: true } })}
          {field("tipo_registro_normativa", "Tipo de Registro")}
          {field("observaciones_normativa", "Observaciones", { multiline: true, rows: 2 })}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NormativaList;