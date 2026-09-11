import React, { useState, useEffect, useCallback } from 'react';
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
  TablePagination,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  Chip,
  Tooltip,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
  getKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  toggleBloqueoKnowledge,
  uploadDocumento,
  generarEmbeddings,
  regenerarMemoria,
  getDocuments,
  deleteDocument,
  toggleBloqueoDocumento,
} from '../../../services/chatService';
import { useRoles } from '../utils/useRoles';
import { AdminOnly } from '../components/ProtectedComponent';

const KnowledgeAdmin = () => {
  const [knowledge, setKnowledge] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [docPage, setDocPage] = useState(0);
  const [docRowsPerPage, setDocRowsPerPage] = useState(10);
  const [docTotal, setDocTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tema_principal: '',
    pregunta_frecuente: '',
    respuesta_oficial: '',
    contenido: '',
    fuente_verificacion: '',
    nivel_prioridad: 1,
    canal: 'ambos',
  });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadCanal, setUploadCanal] = useState('ambos');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const { roles, hasPermission } = useRoles();

  const canalLabel = { ambos: 'Ambos', publico: 'Público', interno: 'Interno' };
  const canalColor = { ambos: 'default', publico: 'info', interno: 'warning' };

  const loadKnowledge = useCallback(async () => {
    const resp = await getKnowledge({ page: page + 1, limit: rowsPerPage, tipo: 'pregunta' });
    if (resp?.success) {
      setKnowledge(resp.data || []);
      setTotal(resp?.pagination?.total ?? resp.data?.length ?? 0);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadKnowledge();
  }, [loadKnowledge]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const loadDocuments = useCallback(async () => {
    const resp = await getDocuments({ page: docPage + 1, limit: docRowsPerPage });
    if (resp?.success) {
      setDocuments(resp.data || []);
      setDocTotal(resp?.pagination?.total ?? resp.data?.length ?? 0);
    }
  }, [docPage, docRowsPerPage]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDocPageChange = (event, newPage) => {
    setDocPage(newPage);
  };

  const handleDocRowsPerPageChange = (event) => {
    setDocRowsPerPage(parseInt(event.target.value, 10));
    setDocPage(0);
  };

  // Referencia: el campo 'bloqueado' de BD/API equivale al concepto "ignorado" de la interfaz.
  const allBlocked = (doc) => doc.chunks_count > 0 && doc.segmentos_bloqueados >= doc.chunks_count;

  const handleDeleteDocumento = async (doc) => {
    if (!window.confirm(`¿Eliminar "${doc.titulo}" y sus ${doc.chunks_count} segmentos?`)) return;
    await deleteDocument(doc.id_documento);
    loadDocuments();
  };

  const handleToggleBloqueoDocumento = async (doc) => {
    const nextBlocked = !allBlocked(doc);
    await toggleBloqueoDocumento(doc.id_documento, nextBlocked);
    loadDocuments();
  };

  const handleOpen = (item = null) => {
    setFormError('');
    if (item) {
      setEditingId(item.id_conocimiento);
      setFormData({
        tema_principal: item.tema_principal || '',
        pregunta_frecuente: item.pregunta_frecuente || '',
        respuesta_oficial: item.respuesta_oficial || '',
        contenido: item.contenido || '',
        fuente_verificacion: item.fuente_verificacion || '',
        nivel_prioridad: item.nivel_prioridad || 1,
        canal: item.canal || 'ambos',
      });
    } else {
      setEditingId(null);
      setFormData({ tema_principal: '', pregunta_frecuente: '', respuesta_oficial: '', contenido: '', fuente_verificacion: '', nivel_prioridad: 1, canal: 'ambos' });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        tipo: 'pregunta',
        tema_principal: formData.tema_principal.trim(),
        pregunta_frecuente: formData.pregunta_frecuente.trim(),
        respuesta_oficial: formData.respuesta_oficial.trim(),
        contenido: formData.contenido.trim(),
        fuente_verificacion: formData.fuente_verificacion.trim(),
        nivel_prioridad: parseInt(formData.nivel_prioridad, 10) || 1,
        canal: formData.canal,
      };

      if (!payload.tema_principal) {
        setFormError('El tema principal es obligatorio');
        return;
      }

      if (editingId) {
        await updateKnowledge(editingId, payload);
      } else {
        await createKnowledge(payload);
      }
      setOpen(false);
      loadKnowledge();
    } catch (error) {
      setFormError(error.message || 'Error guardando knowledge');
      console.error('Error guardando knowledge:', error);
    }
  };

  const handleDelete = async (id) => {
    await deleteKnowledge(id);
    loadKnowledge();
  };

  const handleToggleBloqueo = async (id) => {
    await toggleBloqueoKnowledge(id);
    loadKnowledge();
  };

  const handleUploadPdf = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setLoading(true);
        try {
          await uploadDocumento(file, file.name, uploadCanal);
          setTabValue(1);
          loadDocuments();
        } catch (error) {
          console.error('Error subiendo PDF:', error);
        } finally {
          setLoading(false);
          setUploadOpen(false);
        }
      }
    };
    input.click();
  };

  const handleGenerarEmbeddings = async () => {
    setLoading(true);
    try {
      await generarEmbeddings();
      loadKnowledge();
    } catch (error) {
      console.error('Error generando embeddings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerarMemoria = async () => {
    setLoading(true);
    try {
      await regenerarMemoria();
    } catch (error) {
      console.error('Error regenerando memoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = hasPermission('editPrompt');

  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Typography variant="h4">Base de Conocimiento</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Generar embeddings">
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleGenerarEmbeddings} disabled={!canEdit || loading}>
              Generar Embeddings
            </Button>
          </Tooltip>
          <Tooltip title="Regenerar memoria de conocimiento">
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRegenerarMemoria} disabled={loading}>
              Regenerar Memoria
            </Button>
          </Tooltip>
          {tabValue === 0 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} disabled={!canEdit}>
              Nuevo
            </Button>
          )}
          {tabValue === 1 && (
            <Tooltip title="Subir PDF">
              <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setUploadOpen(true)} disabled={!canEdit || loading}>
                Subir Documento
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Conocimiento" />
        <Tab label="Documentos" />
      </Tabs>

      <Alert severity="info" sx={{ mb: 2 }}>
        La pestaña <b>Conocimiento</b> contiene las entradas manuales con las que el chatbot responde.
        La pestaña <b>Documentos</b> lista los PDFs subidos: cada documento se fragmenta internamente
        en segmentos con embeddings para la búsqueda semántica, pero se administra como un solo archivo.
      </Alert>

      {tabValue === 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tema</TableCell>
                  <TableCell>Fuente de verificación</TableCell>
                  <TableCell>Contenido</TableCell>
                  <TableCell>Canal</TableCell>
                  <TableCell>Ignorado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {knowledge.map((item) => (
                  <TableRow key={item.id_conocimiento}>
                    <TableCell>{item.tema_principal}</TableCell>
                    <TableCell>{item.fuente_verificacion}</TableCell>
                    <TableCell>{item.contenido?.substring(0, 100)}...</TableCell>
                    <TableCell>
                      <Chip size="small" label={canalLabel[item.canal] || 'Ambos'} color={canalColor[item.canal] || 'default'} />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ignorado: el chatbot no usa este ítem al responder.">
                        <Switch
                          checked={item.bloqueado}
                          onChange={() => handleToggleBloqueo(item.id_conocimiento)}
                          disabled={!canEdit}
                          color="warning"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(item)} disabled={!canEdit}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item.id_conocimiento)} disabled={!canEdit} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="Filas por página"
          />
        </>
      )}

      {tabValue === 1 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Archivo</TableCell>
                  <TableCell># Segmentos</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Ignorado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id_documento}>
                    <TableCell>{doc.titulo}</TableCell>
                    <TableCell>{doc.nombre_archivo}</TableCell>
                    <TableCell>{doc.chunks_count}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={doc.estado === 'LISTO' ? 'success' : doc.estado === 'ERROR' ? 'error' : 'warning'}
                        label={doc.estado}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ignorado: el chatbot no usa ninguno de los segmentos de este documento al responder.">
                        <Switch
                          checked={allBlocked(doc)}
                          onChange={() => handleToggleBloqueoDocumento(doc)}
                          disabled={!canEdit}
                          color="warning"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleDeleteDocumento(doc)} disabled={!canEdit} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No hay documentos subidos</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={docTotal}
            rowsPerPage={docRowsPerPage}
            page={docPage}
            onPageChange={handleDocPageChange}
            onRowsPerPageChange={handleDocRowsPerPageChange}
            labelRowsPerPage="Filas por página"
          />
        </>
      )}

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Documento PDF</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            El documento se fragmenta en segmentos con embeddings. Selecciona el canal: los PDFs internos no deben
            contener información que el público deba ver.
          </Alert>
          <FormControl fullWidth margin="dense">
            <InputLabel id="upload-canal-label">Canal</InputLabel>
            <Select
              labelId="upload-canal-label"
              label="Canal"
              value={uploadCanal}
              onChange={(e) => setUploadCanal(e.target.value)}
            >
              <MenuItem value="ambos">Ambos</MenuItem>
              <MenuItem value="publico">Público</MenuItem>
              <MenuItem value="interno">Interno</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Cancelar</Button>
          <Button variant="contained" startIcon={<UploadIcon />} onClick={handleUploadPdf} disabled={loading}>
            Seleccionar PDF
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Conocimiento' : 'Nuevo Conocimiento'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Alert severity="info" sx={{ mb: 2 }}>
            Esta entrada se guarda en la base de conocimiento. Tras guardar, pulsa "Generar Embeddings"
            para que el bot pueda encontrarla al responder preguntas similares.
          </Alert>
          <TextField
            label="Tema principal *"
            fullWidth
            margin="dense"
            required
            helperText="Asunto que identifica esta entrada y aparece en la búsqueda. Obligatorio."
            value={formData.tema_principal}
            onChange={(e) => setFormData({ ...formData, tema_principal: e.target.value })}
          />
          <TextField
            label="Pregunta frecuente"
            fullWidth
            margin="dense"
            helperText="La pregunta tal como la haría un usuario. El bot la usa para encontrar esta entrada."
            value={formData.pregunta_frecuente}
            onChange={(e) => setFormData({ ...formData, pregunta_frecuente: e.target.value })}
          />
          <TextField
            label="Respuesta oficial"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            helperText="La respuesta que el bot mostrará cuando encuentre esta entrada. Tiene prioridad sobre 'Contenido'."
            value={formData.respuesta_oficial}
            onChange={(e) => setFormData({ ...formData, respuesta_oficial: e.target.value })}
          />
          <TextField
            label="Contenido"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            helperText="Texto de respaldo: se usa como respuesta si 'Respuesta oficial' está vacía y también alimenta la búsqueda semántica."
            value={formData.contenido}
            onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
          />
          <TextField
            label="Fuente de verificación"
            fullWidth
            margin="dense"
            helperText="Origen de la información (nombre del documento, enlace o referencia)."
            value={formData.fuente_verificacion}
            onChange={(e) => setFormData({ ...formData, fuente_verificacion: e.target.value })}
          />
          <TextField
            label="Nivel de prioridad"
            type="number"
            inputProps={{ min: 1, max: 10 }}
            fullWidth
            margin="dense"
            helperText="De 1 a 10. Más alto = más relevante al ordenar las coincidencias."
            value={formData.nivel_prioridad}
            onChange={(e) => setFormData({ ...formData, nivel_prioridad: e.target.value })}
          />
        <FormControl fullWidth margin="dense">
            <InputLabel id="canal-label">Canal</InputLabel>
            <Select
              labelId="canal-label"
              label="Canal"
              value={formData.canal}
              onChange={(e) => setFormData({ ...formData, canal: e.target.value })}
            >
              <MenuItem value="ambos">Ambos</MenuItem>
              <MenuItem value="publico">Público</MenuItem>
              <MenuItem value="interno">Interno</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function KnowledgeAdminProtected() {
  return (
    <AdminOnly>
      <KnowledgeAdmin />
    </AdminOnly>
  );
}
