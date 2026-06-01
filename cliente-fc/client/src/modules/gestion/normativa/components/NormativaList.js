import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableFooter, TablePagination,
  Paper, Button, CircularProgress, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GavelIcon from "@mui/icons-material/Gavel";
import { API_IMAGE_URL } from "../../../../services/apiConfig";
import * as docService from "../../../../services/documentacionService";

const emptyForm = () => ({
  id_tipo_normativa: "",
  nombre_normativa: "",
  descripcion_normativa: "",
  padre_normativa: "",
  nivel_normativa: "",
  jerarquia_normativa: "",
  archivo_normativa: "",
  fecha_normativa: "",
  fecha_modificacion_normativa: "",
  fecha_vigencia_normativa: "",
  tipo_registro_normativa: "",
  observaciones_normativa: "",
});

const normHeaders = [
  { key: "nombre", label: "Nombre", mobile: true },
  { key: "tipo", label: "Tipo", mobile: true },
  { key: "nivel", label: "Nivel", mobile: false },
  { key: "jerarquia", label: "Jerarquía", mobile: false },
  { key: "fecha", label: "Fecha", mobile: false },
  { key: "vigencia", label: "Vigencia", mobile: true },
  { key: "registro", label: "Tipo Registro", mobile: false },
  { key: "acciones", label: "Acciones", mobile: true, align: "right" },
];

const NormativaList = () => {
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
  const [animating, setAnimating] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const firstFieldRef = useRef(null);
  const liveId = "normativa-live-announce";
  const dialogTitleId = "normativa-dialog-title";

  const fetchTipoNormativas = useCallback(async () => {
    try {
      const data = await docService.getTipoNormativas();
      const list = Array.isArray(data) ? data : [];
      setTipos(list);
      const map = {};
      list.forEach((t) => { map[t.id_tipo_normativa] = t.nombre_tipo_normativa; });
      setTiposMap(map);
    } catch {
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
    } catch {
      setItems([]);
      setError("Error al cargar normativas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipoNormativas();
    fetchNormativas();
    const timer = setTimeout(() => setAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [fetchTipoNormativas, fetchNormativas]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(items); return; }
    setFiltered(items.filter((n) =>
      (n.nombre_normativa && n.nombre_normativa.toLowerCase().includes(q)) ||
      (n.descripcion_normativa && n.descripcion_normativa.toLowerCase().includes(q)) ||
      (tiposMap[n.id_tipo_normativa] && tiposMap[n.id_tipo_normativa].toLowerCase().includes(q)) ||
      (n.tipo_registro_normativa && n.tipo_registro_normativa.toLowerCase().includes(q))
    ));
  }, [search, items, tiposMap]);

  useEffect(() => {
    if (openModal) {
      const t = setTimeout(() => firstFieldRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [openModal]);

  useEffect(() => { setPage(0); }, [search]);

  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedItems = rowsPerPage === -1
    ? filtered
    : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const announce = (msg) => {
    const el = document.getElementById(liveId);
    if (el) el.textContent = msg;
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la normativa "${nombre || id}"?`)) return;
    try {
      await docService.deleteNormativa(id);
      announce("Normativa eliminada correctamente");
      fetchNormativas();
    } catch {
      setError("Error al eliminar normativa");
      announce("Error al eliminar normativa");
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
      id_tipo_normativa: item.id_tipo_normativa ?? "",
      nombre_normativa: item.nombre_normativa || "",
      descripcion_normativa: item.descripcion_normativa || "",
      padre_normativa: item.padre_normativa ?? "",
      nivel_normativa: item.nivel_normativa != null ? String(item.nivel_normativa) : "",
      jerarquia_normativa: item.jerarquia_normativa || "",
      archivo_normativa: item.archivo_normativa || "",
      fecha_normativa: item.fecha_normativa || "",
      fecha_modificacion_normativa: item.fecha_modificacion_normativa || "",
      fecha_vigencia_normativa: item.fecha_vigencia_normativa || "",
      tipo_registro_normativa: item.tipo_registro_normativa || "",
      observaciones_normativa: item.observaciones_normativa || "",
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

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
        announce("Normativa actualizada correctamente");
      } else {
        await docService.createNormativa(payload);
        announce("Normativa creada correctamente");
      }
      setOpenModal(false);
      fetchNormativas();
    } catch {
      setError("Error al guardar normativa");
      announce("Error al guardar normativa");
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
      inputRef={key === "nombre_normativa" ? firstFieldRef : undefined}
      {...props}
    />
  );

  const openArchivo = (path) => {
    if (!path) return;
    window.open(path.startsWith("/") ? API_IMAGE_URL + path : path, "_blank");
  };

  return (
    <>
      <Box
        sx={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          minWidth: 0,
          width: '100%',
          display: 'block',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "#e7e5e4",
            borderRadius: 2,
            bgcolor: "#ffffff",
            overflow: "hidden",
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  bgcolor: "rgba(13,148,136,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-hidden="true"
              >
                <GavelIcon sx={{ color: "#0d9488", fontSize: 22 }} />
              </Box>
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
                  Normativas
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#a8a29e", fontSize: "0.8rem", mt: 0.25 }}
                >
                  {filtered.length} {filtered.length === 1 ? "normativa" : "normativas"}
                  {search && " encontradas"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <TextField
                size="small"
                placeholder="Buscar normativas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar normativas por nombre, descripción, tipo o registro"
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
                aria-label="Crear nueva normativa"
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
                Nueva normativa
              </Button>
            </Box>
          </Box>

          <TableContainer
            sx={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: { xs: "calc(100vh - 240px)", md: "none" },
              position: "relative",
              borderTop: "3px solid #0d9488",
              borderRadius: 0,
              WebkitOverflowScrolling: "touch",
              display: "block",
              width: "100%",
            }}
          >
          {loading ? (
            <Box display="flex" justifyContent="center" p={4} role="status" aria-live="polite" aria-label="Cargando normativas">
              <CircularProgress size={28} aria-hidden="true" sx={{ color: "#0d9488" }} />
              <Typography variant="srOnly" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                Cargando normativas...
              </Typography>
            </Box>
          ) : error ? (
            <Box p={3} role="alert" aria-live="assertive">
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#fef2f2", color: "#991b1b", px: 2, py: 1.25, borderRadius: "8px", border: "1px solid", borderColor: "#fecaca" }}>
                <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>{error}</Typography>
              </Box>
            </Box>
          ) : (
            <Table size="small" aria-label="Lista de normativas" stickyHeader sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow>
                  {normHeaders.map((h) => (
                    <TableCell
                      key={h.key}
                      align={h.align || "left"}
                      sx={{
                        fontWeight: 600,
                        color: "#57534e",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "2px solid",
                        borderColor: "#e7e5e4",
                        py: 1.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={normHeaders.length} sx={{ textAlign: "center", py: 5 }}>
                      <Box sx={{ color: "#d6d3d1", mb: 1, fontSize: "2rem", lineHeight: 1 }}>○</Box>
                      <Typography sx={{ color: "#a8a29e", fontWeight: 500 }}>
                        {search ? "No se encontraron normativas con ese criterio." : "No hay normativas registradas."}
                      </Typography>
                      {!search && (
                        <Button
                          size="small"
                          onClick={handleOpenModal}
                          startIcon={<AddIcon />}
                          sx={{ mt: 1.5, textTransform: "none", fontWeight: 600, color: "#0d9488", borderRadius: "8px" }}
                          aria-label="Crear la primera normativa"
                        >
                          Crear primera normativa
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((n) => (
                    <TableRow
                      key={n.id_normativa}
                      sx={{
                        "&:hover": { bgcolor: "#fafaf9" },
                        "&:focus-within": { bgcolor: "#f0fdfa" },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#1c1917", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {n.nombre_normativa}
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {tiposMap[n.id_tipo_normativa] || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {n.nivel_normativa != null ? n.nivel_normativa : "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {n.jerarquia_normativa || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {n.fecha_normativa || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {n.fecha_vigencia_normativa || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {n.tipo_registro_normativa || "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        {n.archivo_normativa && (
                          <Tooltip title="Ver archivo" arrow>
                            <IconButton
                              size="small"
                              onClick={() => openArchivo(n.archivo_normativa)}
                              aria-label={`Ver archivo de ${n.nombre_normativa}`}
                              sx={{
                                color: "#0d9488",
                                borderRadius: "8px",
                                mr: 0.25,
                                "&:hover": { bgcolor: "rgba(13,148,136,0.08)" },
                              }}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Editar normativa" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEditModal(n)}
                            aria-label={`Editar ${n.nombre_normativa}`}
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
                        <Tooltip title="Eliminar normativa" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(n.id_normativa, n.nombre_normativa)}
                            aria-label={`Eliminar ${n.nombre_normativa}`}
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
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: "Todos", value: -1 }]}
                    colSpan={normHeaders.length}
                    count={filtered.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{ inputProps: { "aria-label": "Filas por página" }, native: true }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    sx={{ "& .MuiTablePagination-toolbar": { flexWrap: "wrap", justifyContent: { xs: "center", sm: "flex-end" } } }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          )}
          </TableContainer>
        </Paper>
      </Box>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        scroll="paper"
        aria-labelledby={dialogTitleId}
        slotProps={{
          backdrop: { sx: { backdropFilter: "blur(2px)", bgcolor: "rgba(0,0,0,0.3)" } },
        }}
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" } }}
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
          {editingId ? "Editar normativa" : "Nueva normativa"}
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
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="tipo-normativa-label">Tipo de Normativa</InputLabel>
            <Select
              labelId="tipo-normativa-label"
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
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <TextField
              fullWidth
              label="Archivo (URL o ruta)"
              value={formData.archivo_normativa}
              onChange={handleChange("archivo_normativa")}
              sx={{ flex: 1, minWidth: 200 }}
            />
            {formData.archivo_normativa && (
              <Button
                size="small"
                onClick={() => openArchivo(formData.archivo_normativa)}
                startIcon={<OpenInNewIcon fontSize="small" />}
                sx={{ textTransform: "none", fontWeight: 500, color: "#0d9488" }}
              >
                Ver archivo
              </Button>
            )}
          </Box>
          {field("fecha_normativa", "Fecha", { type: "date", InputLabelProps: { shrink: true } })}
          {field("fecha_modificacion_normativa", "Fecha Modificación", { type: "date", InputLabelProps: { shrink: true } })}
          {field("fecha_vigencia_normativa", "Fecha Vigencia", { type: "date", InputLabelProps: { shrink: true } })}
          {field("tipo_registro_normativa", "Tipo de Registro")}
          {field("observaciones_normativa", "Observaciones", { multiline: true, rows: 2 })}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "#e7e5e4" }}>
          <Button
            onClick={handleCloseModal}
            sx={{ textTransform: "none", fontWeight: 500, color: "#78716c", borderRadius: "8px", px: 2.5 }}
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

export default NormativaList;
