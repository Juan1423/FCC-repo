import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableFooter, TablePagination,
  Paper, Button, CircularProgress, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CategoryIcon from "@mui/icons-material/Category";
import * as docService from "../../../../services/documentacionService";

const emptyForm = () => ({ nombre_tipo_normativa: "", descripcion_tipo_normativa: "" });

const tipoHeaders = [
  { key: "id", label: "ID", mobile: false },
  { key: "nombre", label: "Nombre", mobile: true },
  { key: "descripcion", label: "Descripción", mobile: true },
  { key: "acciones", label: "Acciones", mobile: true, align: "right" },
];

const TipoNormativaList = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
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
  const liveId = "tipo-normativa-live-announce";
  const dialogTitleId = "tipo-normativa-dialog-title";

  const fetchTipoNormativas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await docService.getTipoNormativas();
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      setFiltered(list);
    } catch {
      setItems([]);
      setFiltered([]);
      setError("Error al cargar tipos de normativa");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipoNormativas();
    const timer = setTimeout(() => setAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [fetchTipoNormativas]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(items); return; }
    setFiltered(items.filter((t) =>
      (t.nombre_tipo_normativa && t.nombre_tipo_normativa.toLowerCase().includes(q)) ||
      (t.descripcion_tipo_normativa && t.descripcion_tipo_normativa.toLowerCase().includes(q))
    ));
  }, [search, items]);

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
    if (!window.confirm(`¿Eliminar el tipo de normativa "${nombre || id}"?`)) return;
    try {
      await docService.deleteTipoNormativa(id);
      announce(`Tipo de normativa "${nombre}" eliminado`);
      fetchTipoNormativas();
    } catch {
      setError("Error al eliminar tipo de normativa");
      announce("Error al eliminar tipo de normativa");
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setOpenModal(true);
  };

  const handleEditModal = (item) => {
    setEditingId(item.id_tipo_normativa);
    setFormData({
      nombre_tipo_normativa: item.nombre_tipo_normativa || "",
      descripcion_tipo_normativa: item.descripcion_tipo_normativa || "",
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.nombre_tipo_normativa) {
      alert("El nombre es requerido");
      return;
    }
    try {
      if (editingId) {
        await docService.updateTipoNormativa(editingId, formData);
        announce("Tipo de normativa actualizado correctamente");
      } else {
        await docService.createTipoNormativa(formData);
        announce("Tipo de normativa creado correctamente");
      }
      fetchTipoNormativas();
      setOpenModal(false);
    } catch {
      setError(editingId ? "Error al actualizar tipo de normativa" : "Error al crear tipo de normativa");
      announce("Error al guardar tipo de normativa");
    }
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
                <CategoryIcon sx={{ color: "#0d9488", fontSize: 22 }} />
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
                  Tipos de Normativa
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#a8a29e", fontSize: "0.8rem", mt: 0.25 }}
                >
                  {filtered.length} {filtered.length === 1 ? "tipo" : "tipos"}
                  {search && " encontrados"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <TextField
                size="small"
                placeholder="Buscar tipos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar tipos de normativa por nombre o descripción"
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
                aria-label="Crear nuevo tipo de normativa"
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
            <Box display="flex" justifyContent="center" p={4} role="status" aria-live="polite" aria-label="Cargando tipos de normativa">
              <CircularProgress size={28} aria-hidden="true" sx={{ color: "#0d9488" }} />
              <Typography variant="srOnly" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                Cargando tipos de normativa...
              </Typography>
            </Box>
          ) : error ? (
            <Box p={3} role="alert" aria-live="assertive">
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#fef2f2", color: "#991b1b", px: 2, py: 1.25, borderRadius: "8px", border: "1px solid", borderColor: "#fecaca" }}>
                <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>{error}</Typography>
              </Box>
            </Box>
          ) : (
            <Table size="small" aria-label="Lista de tipos de normativa" stickyHeader sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  {tipoHeaders.map((h) => (
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
                    <TableCell colSpan={tipoHeaders.length} sx={{ textAlign: "center", py: 5 }}>
                      <Box sx={{ color: "#d6d3d1", mb: 1, fontSize: "2rem", lineHeight: 1 }}>○</Box>
                      <Typography sx={{ color: "#a8a29e", fontWeight: 500 }}>
                        {search ? "No se encontraron tipos con ese criterio." : "No hay tipos de normativa registrados."}
                      </Typography>
                      {!search && (
                        <Button
                          size="small"
                          onClick={handleOpenModal}
                          startIcon={<AddIcon />}
                          sx={{ mt: 1.5, textTransform: "none", fontWeight: 600, color: "#0d9488", borderRadius: "8px" }}
                          aria-label="Crear el primer tipo de normativa"
                        >
                          Crear primer tipo
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((t) => (
                    <TableRow
                      key={t.id_tipo_normativa}
                      sx={{
                        "&:hover": { bgcolor: "#fafaf9" },
                        "&:focus-within": { bgcolor: "#f0fdfa" },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <TableCell sx={{ color: "#a8a29e", fontSize: "0.85rem", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {t.id_tipo_normativa}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#1c1917", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        {t.nombre_tipo_normativa}
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem" }}>
                        {t.descripcion_tipo_normativa || "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Editar tipo de normativa" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEditModal(t)}
                            aria-label={`Editar ${t.nombre_tipo_normativa}`}
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
                        <Tooltip title="Eliminar tipo de normativa" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(t.id_tipo_normativa, t.nombre_tipo_normativa)}
                            aria-label={`Eliminar ${t.nombre_tipo_normativa}`}
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
                    colSpan={tipoHeaders.length}
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
        maxWidth="sm"
        fullWidth
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
          {editingId ? "Editar tipo de normativa" : "Nuevo tipo de normativa"}
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
            value={formData.nombre_tipo_normativa}
            onChange={handleChange("nombre_tipo_normativa")}
            sx={{ mb: 2.5 }}
            inputRef={firstFieldRef}
          />
          <TextField
            fullWidth
            label="Descripción"
            value={formData.descripcion_tipo_normativa}
            onChange={handleChange("descripcion_tipo_normativa")}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
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

export default TipoNormativaList;
