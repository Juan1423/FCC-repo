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
    titulo: '',
    contenido: '',
    categoria: '',
    embeddable: true,
  });
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
    if (item) {
      setEditingId(item.id_conocimiento);
      setFormData({
        titulo: item.titulo,
        contenido: item.contenido,
        categoria: item.categoria,
        embeddable: item.embeddable,
      });
    } else {
      setEditingId(null);
      setFormData({ titulo: '', contenido: '', categoria: '', embeddable: true });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateKnowledge(editingId, formData);
      } else {
        await createKnowledge(formData);
      }
      setOpen(false);
      loadKnowledge();
    } catch (error) {
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Contenido</TableCell>
              <TableCell>Bloqueado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {knowledge.map((item) => (
              <TableRow key={item.id_conocimiento}>
                <TableCell>{item.titulo}</TableCell>
                <TableCell>{item.categoria}</TableCell>
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
          <TextField
            label="Título"
            fullWidth
            margin="dense"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />
          <TextField
            label="Categoría"
            fullWidth
            margin="dense"
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
          />
          <TextField
            label="Contenido"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            value={formData.contenido}
            onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
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
