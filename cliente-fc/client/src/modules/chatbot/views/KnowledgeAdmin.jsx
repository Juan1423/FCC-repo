import React, { useState, useEffect } from 'react';
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
} from '../../../services/chatService';
import { useRoles } from '../utils/useRoles';
import { AdminOnly } from '../components/ProtectedComponent';

const KnowledgeAdmin = () => {
  const [knowledge, setKnowledge] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tema_principal: '',
    pregunta_frecuente: '',
    respuesta_oficial: '',
    contenido: '',
    fuente_verificacion: '',
    nivel_prioridad: 1,
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const { roles, hasPermission } = useRoles();

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    const resp = await getKnowledge();
    if (resp?.success) setKnowledge(resp.data || []);
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
      });
    } else {
      setEditingId(null);
      setFormData({ tema_principal: '', pregunta_frecuente: '', respuesta_oficial: '', contenido: '', fuente_verificacion: '', nivel_prioridad: 1 });
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
          await uploadDocumento(file, file.name);
          loadKnowledge();
        } catch (error) {
          console.error('Error subiendo PDF:', error);
        } finally {
          setLoading(false);
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Base de Conocimiento</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Subir PDF">
            <Button variant="outlined" startIcon={<UploadIcon />} onClick={handleUploadPdf} disabled={!canEdit || loading}>
              Subir Documento
            </Button>
          </Tooltip>
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} disabled={!canEdit}>
            Nuevo
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        La base de conocimiento almacena documentos que el chatbot usa para responder preguntas.
        Sube PDFs o escribe contenido directamente. Los embeddings se generan automáticamente para búsqueda semántica.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tema</TableCell>
              <TableCell>Fuente de verificación</TableCell>
              <TableCell>Contenido</TableCell>
              <TableCell>Bloqueado</TableCell>
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
                  <Switch
                    checked={item.bloqueado}
                    onChange={() => handleToggleBloqueo(item.id_conocimiento)}
                    disabled={!canEdit}
                    color="warning"
                  />
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
