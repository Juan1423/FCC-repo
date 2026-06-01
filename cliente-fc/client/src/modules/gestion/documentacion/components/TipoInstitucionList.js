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
import BusinessIcon from "@mui/icons-material/Business";
import * as documentacionService from "../../../../services/documentacionService";

const emptyForm = () => ({ nombre_tipo_institucion: "", descripcion_tipo_institucion: "" });

const TipoInstitucionList = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState("");
  const [animating, setAnimating] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const firstFieldRef = useRef(null);
  const dialogTitleId = "tipo-institucion-dialog-title";
  const liveId = "tipo-institucion-live-announce";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentacionService.getTipoInstituciones();
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      setFiltered(list);
    } catch {
      setItems([]);
      setFiltered([]);
      setError("No se pudieron cargar los tipos de institución.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setTimeout(() => setAnimating(false), 600); return () => clearTimeout(t); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(items); return; }
    setFiltered(items.filter((t) =>
      (t.nombre_tipo_institucion && t.nombre_tipo_institucion.toLowerCase().includes(q)) ||
      (t.descripcion_tipo_institucion && t.descripcion_tipo_institucion.toLowerCase().includes(q))
    ));
  }, [search, items]);

  useEffect(() => {
    if (openModal) { const t = setTimeout(() => { firstFieldRef.current?.focus(); }, 80); return () => clearTimeout(t); }
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

  const announce = (msg) => { const el = document.getElementById(liveId); if (el) el.textContent = msg; };

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setOpenModal(true); };

  const openEdit = (row) => {
    setEditingId(row.id_tipo_institucion);
    setForm({ nombre_tipo_institucion: row.nombre_tipo_institucion || "", descripcion_tipo_institucion: row.descripcion_tipo_institucion || "" });
    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) await documentacionService.updateTipoInstitucion(editingId, form);
      else await documentacionService.createTipoInstitucion(form);
      setOpenModal(false);
      announce(editingId ? "Tipo de institución actualizado" : "Tipo de institución creado");
      await load();
      setError(null);
    } catch (e) {
      setError(`Error al guardar: ${e?.response?.data?.message || e.message}`);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el tipo de institución "${nombre || id}"?`)) return;
    try {
      await documentacionService.deleteTipoInstitucion(id);
      announce(`Tipo de institución "${nombre}" eliminado`);
      await load();
    } catch (e) {
      alert(`No se pudo eliminar: ${e?.response?.data?.message || e.message}`);
    }
  };

  return (
    <>
      <Box sx={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(8px)" : "translateY(0)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "#e7e5e4", borderRadius: 2, bgcolor: "#ffffff", overflow: "hidden" }}>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5, borderBottom: "1px solid", borderColor: "#e7e5e4", bgcolor: "#fafaf9" }}>
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#1c1917", letterSpacing: "-0.01em" }}>Tipos de Institución</Typography>
              <Typography variant="body2" sx={{ color: "#a8a29e", fontSize: "0.8rem", mt: 0.25 }}>{filtered.length} {filtered.length === 1 ? "tipo" : "tipos"}{search && " encontrados"}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <TextField size="small" placeholder="Buscar tipos..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar tipos de institución por nombre o descripción" slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: "#a8a29e", mr: 0.5, fontSize: 18 }} /> } }} sx={{ width: { xs: 1, sm: "auto" }, "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#ffffff", fontSize: "0.85rem", "& fieldset": { borderColor: "#e7e5e4" }, "&:hover fieldset": { borderColor: "#d6d3d1" }, "&.Mui-focused fieldset": { borderColor: "#0d9488" } } }} />
              <Button variant="contained" size="small" onClick={openCreate} startIcon={<AddIcon />} aria-label="Crear nuevo tipo de institución" sx={{ bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" }, textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 2, py: 0.75, fontSize: "0.85rem", boxShadow: "0 1px 3px rgba(13,148,136,0.2)", whiteSpace: "nowrap" }}>Nuevo tipo</Button>
            </Box>
          </Box>
          <TableContainer sx={{ overflow: "auto", maxHeight: { xs: "calc(100vh - 240px)", md: "none" }, position: "relative", borderTop: "3px solid #0d9488", borderRadius: 0, border: "none !important", boxShadow: "none !important" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4} role="status" aria-live="polite" aria-label="Cargando tipos de institución"><CircularProgress size={28} aria-hidden="true" sx={{ color: "#0d9488" }} /><Typography variant="srOnly" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>Cargando tipos de institución...</Typography></Box>
          ) : error ? (
            <Box p={3} role="alert" aria-live="assertive"><Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#fef2f2", color: "#991b1b", px: 2, py: 1.25, borderRadius: "8px", border: "1px solid", borderColor: "#fecaca" }}><Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>{error}</Typography></Box></Box>
          ) : (
            <Table size="small" aria-label="Lista de tipos de institución" stickyHeader sx={{ minWidth: 650, "& .MuiTableCell-root": { wordBreak: "break-word", overflowWrap: "break-word" } }}>
              <TableHead>
                <TableRow>
                  {["Nombre", "Descripción", "Acciones"].map((h) => (<TableCell key={h} sx={{ fontWeight: 600, color: "#57534e", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid", borderColor: "#e7e5e4", py: 1.5 }} align={h === "Acciones" ? "right" : "left"}>{h}</TableCell>))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={3} sx={{ textAlign: "center", py: 5 }}>
                    <Box sx={{ color: "#d6d3d1", mb: 1, fontSize: "2rem", lineHeight: 1 }}>○</Box>
                    <Typography sx={{ color: "#a8a29e", fontWeight: 500 }}>{search ? "No se encontraron tipos con ese criterio." : "No hay tipos de institución registrados."}</Typography>
                    {!search && <Button size="small" onClick={openCreate} startIcon={<AddIcon />} sx={{ mt: 1.5, textTransform: "none", fontWeight: 600, color: "#0d9488", borderRadius: "8px" }} aria-label="Crear el primer tipo de institución">Crear primer tipo</Button>}
                  </TableCell></TableRow>
                ) : (
                  paginatedItems.map((row) => (
                    <TableRow key={row.id_tipo_institucion} sx={{ "&:hover": { bgcolor: "#fafaf9" }, "&:focus-within": { bgcolor: "#f0fdfa" }, transition: "background-color 0.15s ease" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#1c1917", fontSize: "0.85rem" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><BusinessIcon sx={{ color: "#0d9488", fontSize: 18, opacity: 0.6 }} />{row.nombre_tipo_institucion}</Box>
                      </TableCell>
                      <TableCell sx={{ color: "#57534e", fontSize: "0.85rem", maxWidth: 360 }}>{row.descripcion_tipo_institucion || "—"}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Editar tipo de institución" arrow><IconButton size="small" onClick={() => openEdit(row)} aria-label={`Editar ${row.nombre_tipo_institucion}`} sx={{ color: "#0d9488", borderRadius: "8px", mr: 0.5, "&:hover": { bgcolor: "rgba(13,148,136,0.08)" } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Eliminar tipo de institución" arrow><IconButton size="small" onClick={() => handleDelete(row.id_tipo_institucion, row.nombre_tipo_institucion)} aria-label={`Eliminar ${row.nombre_tipo_institucion}`} sx={{ color: "#ef4444", borderRadius: "8px", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: "Todos", value: -1 }]}
                    colSpan={3}
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

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth aria-labelledby={dialogTitleId}
        slotProps={{ backdrop: { sx: { backdropFilter: "blur(2px)", bgcolor: "rgba(0,0,0,0.3)" } } }}
        PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" } }}>
        <DialogTitle id={dialogTitleId} sx={{ fontWeight: 700, color: "#1c1917", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "#e7e5e4", px: 3, py: 2 }}>
          {editingId ? "Editar tipo de institución" : "Nuevo tipo de institución"}
          <IconButton size="small" onClick={() => setOpenModal(false)} aria-label="Cerrar formulario" sx={{ color: "#a8a29e", borderRadius: "8px" }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, px: 3 }}>
          <TextField fullWidth label="Nombre del tipo" value={form.nombre_tipo_institucion} onChange={(e) => setForm({ ...form, nombre_tipo_institucion: e.target.value })} sx={{ mb: 2.5 }} inputRef={firstFieldRef} />
          <TextField fullWidth label="Descripción" value={form.descripcion_tipo_institucion} onChange={(e) => setForm({ ...form, descripcion_tipo_institucion: e.target.value })} multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "#e7e5e4" }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: "none", fontWeight: 500, color: "#78716c", borderRadius: "8px", px: 2.5 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#0d9488", "&:hover": { bgcolor: "#0f766e" }, textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 3, boxShadow: "0 1px 3px rgba(13,148,136,0.25)" }}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Box id={liveId} role="status" aria-live="polite" aria-atomic="true" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }} />
    </>
  );
};

export default TipoInstitucionList;
