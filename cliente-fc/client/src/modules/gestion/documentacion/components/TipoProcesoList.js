import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, CircularProgress, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import * as docService from "../../../../services/documentacionService";

const emptyForm = () => ({ nombre_tipo_proceso: "", descripcion_tipo_proceso: "" });

const TipoProcesoList = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [search, setSearch] = useState("");
  const [animating, setAnimating] = useState(true);
  const firstFieldRef = useRef(null);
  const errorId = "tipoproceso-error-message";
  const loadingId = "tipoproceso-loading";
  const dialogTitleId = "tipoproceso-dialog-title";
  const liveId = "tipoproceso-live-announce";

  const fetchTipoProcesos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await docService.getTipoProcesos();
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      setFiltered(list);
    } catch {
      setItems([]);
      setFiltered([]);
      setError("Error al cargar tipos de proceso");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipoProcesos();
    const timer = setTimeout(() => setAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [fetchTipoProcesos]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(items); return; }
    setFiltered(items.filter((t) =>
      (t.nombre_tipo_proceso && t.nombre_tipo_proceso.toLowerCase().includes(q)) ||
      (t.descripcion_tipo_proceso && t.descripcion_tipo_proceso.toLowerCase().includes(q))
    ));
  }, [search, items]);

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

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar tipo de proceso "${nombre || id}"?`)) return;
    try {
      await docService.deleteTipoProceso(id);
      announce(`Tipo de proceso "${nombre}" eliminado`);
      fetchTipoProcesos();
    } catch {
      setError("Error al eliminar tipo de proceso");
      announce("Error al eliminar tipo de proceso");
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setOpenModal(true);
  };

  const handleEditModal = (item) => {
    setEditingId(item.id_tipo_proceso);
    setFormData({
      nombre_tipo_proceso: item.nombre_tipo_proceso || "",
      descripcion_tipo_proceso: item.descripcion_tipo_proceso || "",
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => { setOpenModal(false); };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.nombre_tipo_proceso) {
      alert("El nombre es requerido");
      return;
    }
    try {
      if (editingId) {
        await docService.updateTipoProceso(editingId, formData);
        announce("Tipo de proceso actualizado correctamente");
      } else {
        await docService.createTipoProceso(formData);
        announce("Tipo de proceso creado correctamente");
      }
      fetchTipoProcesos();
      setOpenModal(false);
    } catch {
      setError(editingId ? "Error al actualizar tipo de proceso" : "Error al crear tipo de proceso");
      announce("Error al guardar tipo de proceso");
    }
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
            overflow: "visible",
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
                Tipos de Proceso
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#a8a29e", fontSize: "0.8rem", mt: 0.25 }}
              >
                {filtered.length} {filtered.length === 1 ? "tipo" : "tipos"}
                {search && " encontrados"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Buscar tipos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar tipos de proceso por nombre o descripción"
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchIcon sx={{ color: "#a8a29e", mr: 0.5, fontSize: 18 }} />
                    ),
                  },
                }}
                sx={{
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
                aria-label="Crear nuevo tipo de proceso"
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
                Nuevo tipo
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4} id={loadingId} role="status" aria-live="polite" aria-label="Cargando tipos de proceso">
              <CircularProgress size={28} aria-hidden="true" sx={{ color: "#0d9488" }} />
              <Typography variant="srOnly" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                Cargando tipos de proceso...
              </Typography>
            </Box>
          ) : error ? (
            <Box p={3} role="alert" id={errorId} aria-live="assertive">
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#fef2f2", color: "#991b1b", px: 2, py: 1.25, borderRadius: "8px", border: "1px solid", borderColor: "#fecaca" }}>
                <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>{error}</Typography>
              </Box>
            </Box>
          ) : (
            <Table size="small" aria-label="Lista de tipos de proceso">
              <TableHead>
                <TableRow>
                  {["Nombre", "Descripción", "Acciones"].map((h) => (
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
                    <TableCell colSpan={3} sx={{ textAlign: "center", py: 5 }}>
                      <Box sx={{ color: "#d6d3d1", mb: 1, fontSize: "2rem", lineHeight: 1 }}>○</Box>
                      <Typography sx={{ color: "#a8a29e", fontWeight: 500 }}>
                        {search ? "No se encontraron tipos con ese criterio." : "No hay tipos de proceso registrados."}
                      </Typography>
                      {!search && (
                        <Button
                          size="small"
                          onClick={handleOpenModal}
                          startIcon={<AddIcon />}
                          sx={{ mt: 1.5, textTransform: "none", fontWeight: 600, color: "#0d9488", borderRadius: "8px" }}
                          aria-label="Crear el primer tipo de proceso"
                        >
                          Crear primer tipo
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t, idx) => (
                    <TableRow
                      key={t.id_tipo_proceso}
                      sx={{
                        "&:hover": { bgcolor: "#fafaf9" },
                        "&:focus-within": { bgcolor: "#f0fdfa" },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#1c1917", fontSize: "0.85rem" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <DescriptionIcon sx={{ color: "#0d9488", fontSize: 18, opacity: 0.6 }} />
                          {t.nombre_tipo_proceso}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem", maxWidth: 360 }}>
                        {t.descripcion_tipo_proceso || "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Editar tipo de proceso" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEditModal(t)}
                            aria-label={`Editar ${t.nombre_tipo_proceso}`}
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
                        <Tooltip title="Eliminar tipo de proceso" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(t.id_tipo_proceso, t.nombre_tipo_proceso)}
                            aria-label={`Eliminar ${t.nombre_tipo_proceso}`}
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
        maxWidth="sm"
        fullWidth
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
          {editingId ? "Editar tipo de proceso" : "Nuevo tipo de proceso"}
          <IconButton
            size="small"
            onClick={handleCloseModal}
            aria-label="Cerrar formulario"
            sx={{ color: "#a8a29e", borderRadius: "8px" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, px: 3 }}>
          <TextField
            fullWidth
            label="Nombre del tipo"
            value={formData.nombre_tipo_proceso}
            onChange={handleChange("nombre_tipo_proceso")}
            sx={{ mb: 2.5 }}
            inputRef={firstFieldRef}
          />
          <TextField
            fullWidth
            label="Descripción"
            value={formData.descripcion_tipo_proceso}
            onChange={handleChange("descripcion_tipo_proceso")}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
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

export default TipoProcesoList;
