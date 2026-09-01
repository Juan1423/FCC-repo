import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import {
  getTemasValidos,
  regenerarTemas,
  createTema,
  updateTema,
  deleteTema,
} from '../../../services/chatService';

const TemasValidosEditor = () => {
  const [temas, setTemas] = useState([]);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id_tema: null, tema: '', descripcion: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    cargarTemas();
  }, []);

  const cargarTemas = async () => {
    try {
      const resp = await getTemasValidos();
      if (resp?.success) setTemas(resp.data || []);
    } catch (e) {
      console.error('Error cargando temas:', e);
    }
  };

  const handleRegenerar = async () => {
    setRegenerating(true);
    setMessage(null);
    try {
      const resp = await regenerarTemas();
      setMessage({ type: 'success', text: resp?.message || 'Embeddings regenerados' });
      cargarTemas();
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Error regenerando embeddings' });
    }
    setRegenerating(false);
  };

  const handleOpen = (item = null) => {
    setFormError('');
    if (item) {
      setForm({ id_tema: item.id_tema, tema: item.tema, descripcion: item.descripcion || '' });
    } else {
      setForm({ id_tema: null, tema: '', descripcion: '' });
    }
    setOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.tema.trim()) {
      setFormError('El nombre del tema es obligatorio.');
      return;
    }
    try {
      if (form.id_tema) {
        await updateTema(form.id_tema, { tema: form.tema, descripcion: form.descripcion });
      } else {
        await createTema({ tema: form.tema, descripcion: form.descripcion });
      }
      setOpen(false);
      setMessage({ type: 'success', text: 'Tema guardado. Regenera los embeddings para que el nuevo contenido se use.' });
      cargarTemas();
    } catch (e) {
      setFormError(e?.message || 'Error guardando el tema.');
    }
  };

  const handleToggleActivo = async (item) => {
    await updateTema(item.id_tema, { activo: !item.activo });
    cargarTemas();
  };

  const handleDesactivar = async (id) => {
    await deleteTema(id);
    cargarTemas();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h5">Temas Válidos (Off-topic)</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRegenerar}
            disabled={regenerating}
          >
            {regenerating ? 'Regenerando...' : 'Regenerar Embeddings'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Nuevo tema
          </Button>
        </Box>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        Los temas definen el alcance del chatbot: qué preguntas sobre la Fundación debe responder. Si un
        mensaje no coincide con ningún tema activo (similitud coseno &lt; umbral off-topic), se responde
        como fuera de alcance. Puedes editar la descripción de cada tema para ajustarla a la información
        precisa de la Fundación; tras editarla, el embedding quedaría pendiente y debes pulsar
        "Regenerar Embeddings" (o se generará automáticamente en la primera consulta).
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tema</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Embedding</TableCell>
              <TableCell>Activo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {temas.map((t) => (
              <TableRow key={t.id_tema}>
                <TableCell>{t.id_tema}</TableCell>
                <TableCell>{t.tema}</TableCell>
                <TableCell sx={{ maxWidth: 320 }}>{t.descripcion?.substring(0, 100)}</TableCell>
                <TableCell>
                  <Chip
                    label={t.embedding ? 'Generado' : 'Pendiente'}
                    size="small"
                    color={t.embedding ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={<Switch checked={t.activo} onChange={() => handleToggleActivo(t)} size="small" />}
                    label=""
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(t)}>
                    Editar
                  </Button>
                  {t.activo ? (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDesactivar(t.id_tema)}
                    >
                      Desactivar
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<RestoreIcon />}
                      onClick={() => handleToggleActivo(t)}
                    >
                      Activar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{form.id_tema ? 'Editar Tema' : 'Nuevo Tema'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            label="Nombre del tema *"
            fullWidth
            margin="dense"
            helperText="Identificador interno (ej. informacion_fundacion, servicios_medicos)."
            value={form.tema}
            onChange={(e) => setForm({ ...form, tema: e.target.value })}
          />
          <TextField
            label="Descripción del alcance"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            helperText="Aquí escribes la información precisa de la Fundación sobre este tema. Se usa para decidir si una pregunta pertenece al alcance del chatbot."
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemasValidosEditor;