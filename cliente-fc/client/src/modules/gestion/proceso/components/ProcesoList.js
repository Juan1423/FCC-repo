import React, { useEffect, useState, useCallback } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { API_URL } from "../../../../services/apiConfig";
import axios from "axios";

const emptyForm = () => ({
  id_tipo_proceso: "",
  codigo_proceso: "",
  nombre_proceso: "",
  descripcion_proceso: "",
  responsable_proceso: "",
  nivel_proceso: "",
  padre_proceso: "",
  estado_proceso: "",
  jerarquia_proceso: "",
  archivo_proceso: "",
});

const ProcesoList = () => {
  const [items, setItems] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tiposMap, setTiposMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm());

  const fetchTipos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/doc-tipo-proceso`);
      setTipos(res.data || []);
      const map = {};
      (res.data || []).forEach((t) => {
        map[t.id_tipo_proceso] = t.nombre_tipo_proceso;
      });
      setTiposMap(map);
    } catch (err) {
      setTipos([]);
      setTiposMap({});
    }
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/proceso`);
      setItems(res.data || []);
    } catch (err) {
      setItems([]);
      setError("Error al cargar procesos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipos();
    fetch();
  }, [fetchTipos, fetch]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar proceso?")) return;
    try {
      await axios.delete(`${API_URL}/proceso/${id}`);
      fetch();
    } catch (err) {
      setError("Error al eliminar proceso");
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setOpenModal(true);
  };

  const handleEditModal = (item) => {
    setEditingId(item.id_proceso);
    setFormData({
      id_tipo_proceso: item.id_tipo_proceso ?? "",
      codigo_proceso: item.codigo_proceso || "",
      nombre_proceso: item.nombre_proceso || "",
      descripcion_proceso: item.descripcion_proceso || "",
      responsable_proceso: item.responsable_proceso || "",
      nivel_proceso: item.nivel_proceso != null ? String(item.nivel_proceso) : "",
      padre_proceso: item.padre_proceso ?? "",
      estado_proceso: item.estado_proceso || "",
      jerarquia_proceso: item.jerarquia_proceso || "",
      archivo_proceso: item.archivo_proceso || "",
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
    if (payload.id_tipo_proceso === "" || payload.id_tipo_proceso == null) {
      payload.id_tipo_proceso = null;
    } else {
      payload.id_tipo_proceso = Number(payload.id_tipo_proceso);
    }
    if (payload.nivel_proceso === "" || payload.nivel_proceso == null) {
      payload.nivel_proceso = null;
    } else {
      payload.nivel_proceso = Number(payload.nivel_proceso);
    }
    if (payload.padre_proceso === "" || payload.padre_proceso == null) {
      payload.padre_proceso = null;
    } else {
      payload.padre_proceso = Number(payload.padre_proceso);
    }
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") payload[k] = null;
    });
    return payload;
  };

  const handleSubmit = async () => {
    if (!formData.nombre_proceso) {
      alert("El nombre del proceso es requerido");
      return;
    }
    const payload = buildPayload();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/proceso/${editingId}`, payload);
      } else {
        await axios.post(`${API_URL}/proceso`, payload);
      }
      setOpenModal(false);
      fetch();
    } catch (err) {
      setError("Error al guardar proceso");
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

  const opcionesEstado = ["Activo", "Inactivo", "En proceso", "Completado", "Pendiente", "Cancelado"];

  return (
    <>
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Procesos</Typography>
          <Button variant="contained" size="small" onClick={handleOpenModal}>
            Nuevo Proceso
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
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Responsable</TableCell>
                <TableCell>Nivel</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography color="text.secondary">No hay procesos registrados.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((p) => (
                  <TableRow key={p.id_proceso}>
                    <TableCell>{p.codigo_proceso}</TableCell>
                    <TableCell>{p.nombre_proceso}</TableCell>
                    <TableCell>{tiposMap[p.id_tipo_proceso] || "—"}</TableCell>
                    <TableCell>{p.responsable_proceso}</TableCell>
                    <TableCell>{p.nivel_proceso}</TableCell>
                    <TableCell>{p.estado_proceso}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleEditModal(p)} sx={{ mr: 0.5 }}>
                        Editar
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(p.id_proceso)}>
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
        <DialogTitle>{editingId ? "Editar Proceso" : "Nuevo Proceso"}</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Proceso</InputLabel>
            <Select
              label="Tipo de Proceso"
              value={formData.id_tipo_proceso === "" ? "" : formData.id_tipo_proceso}
              onChange={handleChange("id_tipo_proceso")}
            >
              <MenuItem value=""><em>Sin tipo</em></MenuItem>
              {tipos.map((t) => (
                <MenuItem key={t.id_tipo_proceso} value={t.id_tipo_proceso}>
                  {t.nombre_tipo_proceso}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {field("codigo_proceso", "Código")}
          {field("nombre_proceso", "Nombre")}
          {field("descripcion_proceso", "Descripción", { multiline: true, rows: 2 })}
          {field("responsable_proceso", "Responsable")}
          {field("nivel_proceso", "Nivel", { type: "number" })}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              label="Estado"
              value={formData.estado_proceso || ""}
              onChange={handleChange("estado_proceso")}
            >
              <MenuItem value=""><em>Sin estado</em></MenuItem>
              {opcionesEstado.map((e) => (
                <MenuItem key={e} value={e}>{e}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {field("jerarquia_proceso", "Jerarquía")}
          {field("archivo_proceso", "Archivo (URL o ruta)")}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProcesoList;