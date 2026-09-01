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
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import {
  getPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  activatePrompt,
  uploadPromptPdf,
  downloadPromptPdf,
} from '../../../services/chatService';
import { useRoles } from '../utils/useRoles';
import { AdminOnly } from '../components/ProtectedComponent';

const PromptsAdmin = () => {
  const [prompts, setPrompts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    instrucciones: '',
    tipo_prompt: 'INSTRUCCIONES',
    activo: true,
  });
  const [pdfFile, setPdfFile] = useState(null);
  const { roles, hasPermission } = useRoles();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const resp = await getPrompts();
    if (resp?.success) setPrompts(resp.data);
  };

  const handleOpen = (prompt = null) => {
    if (prompt) {
      setEditingId(prompt.id_prompt);
      setFormData({
        titulo: prompt.titulo,
        descripcion: prompt.descripcion,
        instrucciones: prompt.instrucciones,
        tipo_prompt: prompt.tipo_prompt,
        activo: prompt.activo,
      });
    } else {
      setEditingId(null);
      setFormData({
        titulo: '',
        descripcion: '',
        instrucciones: '',
        tipo_prompt: 'INSTRUCCIONES',
        activo: true,
      });
    }
    setPdfFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updatePrompt(editingId, formData, pdfFile);
      } else {
        await createPrompt(formData, pdfFile);
      }
      setOpen(false);
      loadPrompts();
    } catch (error) {
      console.error('Error guardando prompt:', error);
    }
  };

  const handleDelete = async (id) => {
    await deletePrompt(id);
    loadPrompts();
  };

  const handleActivate = async (id, activo) => {
    if (!activo) {
      await activatePrompt(id);
      loadPrompts();
    }
  };

  const canEdit = hasPermission('editPrompt');
  const canDelete = hasPermission('deletePrompt');

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
        <Typography variant="h4">Gestión de Prompts</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          disabled={!canEdit}
        >
          Nuevo Prompt
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Los prompts definen el comportamiento y personalidad del chatbot. Pueden estar activos varios a
        la vez: los de tipo "Instrucciones" y "Contexto PDF" se combinan en cada respuesta (hasta 5 por
        tipo), mientras que para tipo "Global" solo se aplica el más reciente. Sube un PDF para dar
        contexto adicional al asistente.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Instrucciones</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id_prompt}>
                <TableCell>{prompt.titulo}</TableCell>
                <TableCell>{prompt.tipo_prompt}</TableCell>
                <TableCell>{prompt.instrucciones?.substring(0, 100)}...</TableCell>
                <TableCell>
                  <Switch
                    checked={prompt.activo}
                    onChange={() => handleActivate(prompt.id_prompt, prompt.activo)}
                    disabled={!canEdit}
                  />
                </TableCell>
                <TableCell align="right">
                  {prompt.pdf_url && (
                    <IconButton
                      size="small"
                      onClick={() => downloadPromptPdf(prompt.pdf_url)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={() => handleOpen(prompt)} disabled={!canEdit}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(prompt.id_prompt)} disabled={!canDelete} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Prompt' : 'Nuevo Prompt'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Título"
            fullWidth
            margin="dense"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />
          <TextField
            label="Descripción"
            fullWidth
            margin="dense"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />
          <TextField
            label="Instrucciones"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            value={formData.instrucciones}
            onChange={(e) => setFormData({ ...formData, instrucciones: e.target.value })}
          />
          <TextField
            select
            label="Tipo"
            fullWidth
            margin="dense"
            value={formData.tipo_prompt}
            onChange={(e) => setFormData({ ...formData, tipo_prompt: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="INSTRUCCIONES">Instrucciones</option>
            <option value="CONTEXTO_PDF">Contexto PDF</option>
            <option value="GLOBAL">Global</option>
          </TextField>
          <TextField
            type="file"
            label="PDF"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: '.pdf' }}
            onChange={(e) => setPdfFile(e.target.files[0])}
          />
          <Switch
            checked={formData.activo}
            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
          />
          <label style={{ marginLeft: 8 }}>Activo</label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function PromptsAdminProtected() {
  return (
    <AdminOnly>
      <PromptsAdmin />
    </AdminOnly>
  );
}
