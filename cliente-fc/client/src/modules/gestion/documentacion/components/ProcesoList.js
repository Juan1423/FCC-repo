import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, CircularProgress, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { API_IMAGE_URL } from "../../../../services/apiConfig";
import * as docService from "../../../../services/documentacionService";

const statusColors = {
  Activo: { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  Inactivo: { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
  "En proceso": { bg: "#eff6ff", text: "#1e40af", dot: "#3b82f6" },
  Completado: { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" },
  Pendiente: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b" },
  Cancelado: { bg: "#f5f5f4", text: "#44403c", dot: "#a8a29e" },
};

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
  const [filtered, setFiltered] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tiposMap, setTiposMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [search, setSearch] = useState("");
  const [archivoFile, setArchivoFile] = useState(null);
  const [animating, setAnimating] = useState(true);
  const firstFieldRef = useRef(null);
  const errorId = "proceso-error-message";
  const loadingId = "proceso-loading";
  const dialogTitleId = "proceso-dialog-title";
  const tableId = "proceso-table";
  const liveId = "proceso-live-announce";

  const fetchTipoProcesos = useCallback(async () => {
    try {
      const data = await docService.getTipoProcesos();
      const list = Array.isArray(data) ? data : [];
      setTipos(list);
      const map = {};
      list.forEach((t) => { map[t.id_tipo_proceso] = t.nombre_tipo_proceso; });
      setTiposMap(map);
    } catch {
      setTipos([]);
      setTiposMap({});
    }
  }, []);

  const fetchProcesos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await docService.getProcesos();
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      setFiltered(list);
    } catch {
      setItems([]);
      setFiltered([]);
      setError("Error al cargar procesos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipoProcesos();
    fetchProcesos();
    const timer = setTimeout(() => setAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [fetchTipoProcesos, fetchProcesos]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(items); return; }
    setFiltered(items.filter((p) =>
      (p.nombre_proceso && p.nombre_proceso.toLowerCase().includes(q)) ||
      (p.codigo_proceso && p.codigo_proceso.toLowerCase().includes(q)) ||
      (p.responsable_proceso && p.responsable_proceso.toLowerCase().includes(q)) ||
      (tiposMap[p.id_tipo_proceso] && tiposMap[p.id_tipo_proceso].toLowerCase().includes(q))
    ));
  }, [search, items, tiposMap]);

  useEffect(() => {
    if (openModal) {
      const timer = setTimeout(() => { firstFieldRef.current?.focus(); }, 80);
      return () => clearTimeout(timer);
    }
  }, [openModal]);

  const announce = (msg) => {
    const el = document.getElementById(liveId);
    if (el) { el.textContent = msg; }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar proceso?")) return;
    try {
      await docService.deleteProceso(id);
      announce("Proceso eliminado correctamente");
      fetchProcesos();
    } catch {
      setError("Error al eliminar proceso");
      announce("Error al eliminar proceso");
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setArchivoFile(null);
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
    setArchivoFile(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => { setOpenModal(false); setArchivoFile(null); };

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
      if (archivoFile) {
        const fd = new FormData();
        Object.keys(payload).forEach(k => { if (payload[k] != null) fd.append(k, payload[k]); });
        fd.append("archivo_proceso", archivoFile);
        if (editingId) await docService.updateProceso(editingId, fd);
        else await docService.createProceso(fd);
      } else {
        if (editingId) await docService.updateProceso(editingId, payload);
        else await docService.createProceso(payload);
      }
      setArchivoFile(null);
      setOpenModal(false);
      announce(editingId ? "Proceso actualizado correctamente" : "Proceso creado correctamente");
      fetchProcesos();
    } catch {
      setError("Error al guardar proceso");
      announce("Error al guardar proceso");
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
      inputRef={key === "codigo_proceso" ? firstFieldRef : undefined}
      {...props}
    />
  );

  const opcionesEstado = ["Activo", "Inactivo", "En proceso", "Completado", "Pendiente", "Cancelado"];

  const StatusBadge = ({ estado }) => {
    const c = statusColors[estado] || { bg: "#f5f5f4", text: "#57534e", dot: "#a8a29e" };
    return (
      <Chip
        icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c.dot, ml: 1, flexShrink: 0 }} />}
        label={estado || "—"}
        size="small"
        sx={{
          bgcolor: c.bg,
          color: c.text,
          fontWeight: 600,
          fontSize: "0.75rem",
          borderRadius: "6px",
          height: 26,
          "& .MuiChip-icon": { ml: 0.5 },
        }}
      />
    );
  };

  return (
    <>
      <Box
        sx={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "#e7e5e4",
            borderRadius: 2,
            overflow: { xs: "auto", sm: "visible" },
            bgcolor: "#ffffff",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              bgcolor: "#0d9488",
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              zIndex: 1,
            },
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
              borderBottom: "1px solid",
              borderColor: "#e7e5e4",
              bgcolor: "#fafaf9",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "#1c1917",
                  letterSpacing: "-0.01em",
                }}
              >
                Procesos
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#a8a29e", fontSize: "0.8rem", mt: 0.25 }}
              >
                {filtered.length} {filtered.length === 1 ? "proceso" : "procesos"}
                {search && " encontrados"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <TextField
                size="small"
                placeholder="Buscar procesos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar procesos por nombre, código, responsable o tipo"
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchIcon sx={{ color: "#a8a29e", mr: 0.5, fontSize: 18 }} />
                    ),
                  },
                }}
                sx={{
                  width: { xs: 1, sm: "auto" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#ffffff",
                    fontSize: "0.85rem",
                    "& fieldset": { borderColor: "#e7e5e4" },
                    "&:hover fieldset": { borderColor: "#d6d3d1" },
                    "&.Mui-focused fieldset": { borderColor: "#0d9488" },
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleOpenModal}
                startIcon={<AddIcon />}
                aria-label="Crear nuevo proceso"
                sx={{
                  bgcolor: "#0d9488",
                  "&:hover": { bgcolor: "#0f766e" },
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 2,
                  py: 0.75,
                  fontSize: "0.85rem",
                  boxShadow: "0 1px 3px rgba(13,148,136,0.2)",
                  whiteSpace: "nowrap",
                }}
              >
                Nuevo proceso
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4} id={loadingId} role="status" aria-live="polite" aria-label="Cargando procesos">
              <CircularProgress size={28} aria-hidden="true" sx={{ color: "#0d9488" }} />
              <Typography variant="srOnly" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                Cargando procesos...
              </Typography>
            </Box>
          ) : error ? (
            <Box p={3} role="alert" id={errorId} aria-live="assertive">
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#fef2f2", color: "#991b1b", px: 2, py: 1.25, borderRadius: "8px", border: "1px solid", borderColor: "#fecaca" }}>
                <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>{error}</Typography>
              </Box>
            </Box>
          ) : (
            <Table size="small" aria-label="Lista de procesos" id={tableId} sx={{ "& .MuiTableCell-root": { wordBreak: "break-word", overflowWrap: "break-word" } }}>
              <TableHead>
                <TableRow>
                  {["Código", "Nombre", "Tipo", "Responsable", "Nivel", "Estado", "Acciones"].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 600,
                        color: "#57534e",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "2px solid",
                        borderColor: "#e7e5e4",
                        py: 1.5,
                      }}
                      align={h === "Acciones" ? "right" : "left"}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 5 }}>
                      <Box sx={{ color: "#d6d3d1", mb: 1, fontSize: "2rem", lineHeight: 1 }}>○</Box>
                      <Typography sx={{ color: "#a8a29e", fontWeight: 500 }}>
                        {search ? "No se encontraron procesos con ese criterio." : "No hay procesos registrados."}
                      </Typography>
                      {!search && (
                        <Button
                          size="small"
                          onClick={handleOpenModal}
                          startIcon={<AddIcon />}
                          sx={{ mt: 1.5, textTransform: "none", fontWeight: 600, color: "#0d9488", borderRadius: "8px" }}
                          aria-label="Crear el primer proceso"
                        >
                          Crear primer proceso
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p, idx) => (
                    <TableRow
                      key={p.id_proceso}
                      sx={{
                        "&:hover": { bgcolor: "#fafaf9" },
                        "&:focus-within": { bgcolor: "#f0fdfa" },
                        transition: "background-color 0.15s ease",
                        opacity: animating ? 0 : 1,
                        transform: animating ? "translateY(4px)" : "translateY(0)",
                        animation: !animating ? "none" : undefined,
                        "@keyframes rowFade": {
                          from: { opacity: 0, transform: "translateY(4px)" },
                          to: { opacity: 1, transform: "translateY(0)" },
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500, color: "#1c1917", fontSize: "0.85rem" }}>
                        {p.codigo_proceso || "—"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#1c1917", fontSize: "0.85rem" }}>
                        {p.nombre_proceso}
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem" }}>
                        {tiposMap[p.id_tipo_proceso] || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem" }}>
                        {p.responsable_proceso || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem" }}>
                        {p.nivel_proceso != null ? p.nivel_proceso : "—"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>
                        <StatusBadge estado={p.estado_proceso} />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Editar proceso" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEditModal(p)}
                            aria-label={`Editar ${p.nombre_proceso}`}
                            sx={{
                              color: "#0d9488",
                              borderRadius: "8px",
                              mr: 0.5,
                              "&:hover": { bgcolor: "rgba(13,148,136,0.08)" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar proceso" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(p.id_proceso)}
                            aria-label={`Eliminar ${p.nombre_proceso}`}
                            sx={{
                              color: "#ef4444",
                              borderRadius: "8px",
                              "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        scroll="paper"
        aria-labelledby={dialogTitleId}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(2px)",
              bgcolor: "rgba(0,0,0,0.3)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          id={dialogTitleId}
          sx={{
            fontWeight: 700,
            color: "#1c1917",
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "#e7e5e4",
            px: 3,
            py: 2,
          }}
        >
          {editingId ? "Editar proceso" : "Nuevo proceso"}
          <IconButton
            size="small"
            onClick={handleCloseModal}
            aria-label="Cerrar formulario"
            sx={{ color: "#a8a29e", borderRadius: "8px" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5, px: 3 }}>
          <FormControl fullWidth sx={{ mb: 2.5 }}>
            <InputLabel id="tipo-proceso-label">Tipo de proceso</InputLabel>
            <Select
              labelId="tipo-proceso-label"
              label="Tipo de proceso"
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
          {field("codigo_proceso", "Código del proceso")}
          {field("nombre_proceso", "Nombre del proceso")}
          {field("descripcion_proceso", "Descripción", { multiline: true, rows: 2 })}
          {field("responsable_proceso", "Responsable")}
          {field("nivel_proceso", "Nivel", { type: "number" })}
          <FormControl fullWidth sx={{ mb: 2.5 }}>
            <InputLabel id="estado-proceso-label">Estado</InputLabel>
            <Select
              labelId="estado-proceso-label"
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
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              size="small"
              sx={{ textTransform: "none", fontWeight: 500, borderRadius: "8px" }}
              aria-label={archivoFile ? `Archivo seleccionado: ${archivoFile.name}` : "Subir archivo"}
            >
              {archivoFile ? archivoFile.name : "Subir archivo"}
              <input type="file" hidden onChange={(e) => setArchivoFile(e.target.files[0] || null)} aria-hidden="true" />
            </Button>
            {archivoFile && (
              <Button size="small" color="error" onClick={() => setArchivoFile(null)} sx={{ textTransform: "none", fontWeight: 500, minWidth: 0 }}>
                Quitar
              </Button>
            )}
            {formData.archivo_proceso && !archivoFile && (
              <Button
                size="small"
                onClick={() => window.open(formData.archivo_proceso.startsWith("/") ? API_IMAGE_URL + formData.archivo_proceso : formData.archivo_proceso, "_blank")}
                sx={{ textTransform: "none", fontWeight: 500, color: "#0d9488" }}
              >
                Ver archivo actual
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "#e7e5e4" }}>
          <Button
            onClick={handleCloseModal}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              color: "#78716c",
              borderRadius: "8px",
              px: 2.5,
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: "#0d9488",
              "&:hover": { bgcolor: "#0f766e" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              boxShadow: "0 1px 3px rgba(13,148,136,0.25)",
            }}
          >
            {editingId ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        id={liveId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
      />
    </>
  );
};

export default ProcesoList;
