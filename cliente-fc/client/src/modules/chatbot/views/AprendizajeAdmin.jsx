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
  Chip,
  Alert,
} from '@mui/material';
import { CheckCircle as CheckIcon, Cancel as CancelIcon, Visibility as ViewIcon } from '@mui/icons-material';
import {
  getRevisiones,
  aprobarRevision,
  rechazarRevision,
  getCanonicas,
  createCanonica,
  updateCanonica,
  deleteCanonica,
  getLearningStats,
} from '../../../services/chatService';
import { useRoles } from '../utils/useRoles';
import { AdminOnly } from '../components/ProtectedComponent';

const AprendizajeAdmin = () => {
  const [revisiones, setRevisiones] = useState([]);
  const [canonicas, setCanonicas] = useState([]);
  const [stats, setStats] = useState(null);
  const [openCanonica, setOpenCanonica] = useState(false);
  const [editingCanonica, setEditingCanonica] = useState(null);
  const [canonicaForm, setCanonicaForm] = useState({ patron_trigger: '', respuesta_canonica: '' });
  const [openAprobar, setOpenAprobar] = useState(false);
  const [aprobandoId, setAprobandoId] = useState(null);
  const [aprobarForm, setAprobarForm] = useState({ patron_trigger: '', respuesta_canonica: '' });
  const [aprobarError, setAprobarError] = useState('');
  const { hasPermission } = useRoles();

  useEffect(() => {
    loadRevisiones();
    loadCanonicas();
    loadStats();
  }, []);

  const loadRevisiones = async () => {
    const resp = await getRevisiones();
    if (resp?.success) setRevisiones(resp.data || []);
  };

  const loadCanonicas = async () => {
    const resp = await getCanonicas();
    if (resp?.success) setCanonicas(resp.data || []);
  };

  const loadStats = async () => {
    const resp = await getLearningStats();
    if (resp?.success) setStats(resp.data);
  };

  const handleAprobar = (revision) => {
    const respuestaCanonica = revision.sugerencia_respuesta || revision.respuesta_ia || '';
    if (!respuestaCanonica.trim()) {
      setAprobarForm({ patron_trigger: revision.mensaje_usuario || '', respuesta_canonica: '' });
      setAprobarError('Esta revisión no tiene una respuesta que aprobar. Escribe una respuesta canónica para continuar.');
      setAprobandoId(revision.id_revision);
      setOpenAprobar(true);
      return;
    }
    setAprobarForm({ patron_trigger: revision.mensaje_usuario || '', respuesta_canonica: respuestaCanonica });
    setAprobarError('');
    setAprobandoId(revision.id_revision);
    setOpenAprobar(true);
  };

  const handleConfirmarAprobar = async () => {
    if (!aprobarForm.respuesta_canonica.trim()) {
      setAprobarError('La respuesta canónica es obligatoria.');
      return;
    }
    try {
      await aprobarRevision(aprobandoId, aprobarForm);
      setOpenAprobar(false);
      setAprobandoId(null);
      loadRevisiones();
      loadCanonicas();
      loadStats();
    } catch (error) {
      console.error('Error aprobando revision:', error);
      setAprobarError(error?.message || 'Error aprobando la revisión.');
    }
  };

  const handleRechazar = async (id) => {
    await rechazarRevision(id);
    loadRevisiones();
  };

  const handleCanonicaOpen = (item = null) => {
    if (item) {
      setEditingCanonica(item.id_canonica);
      setCanonicaForm({ patron_trigger: item.patron_trigger, respuesta_canonica: item.respuesta_canonica });
    } else {
      setEditingCanonica(null);
      setCanonicaForm({ patron_trigger: '', respuesta_canonica: '' });
    }
    setOpenCanonica(true);
  };

  const handleCanonicaSave = async () => {
    try {
      if (editingCanonica) {
        await updateCanonica(editingCanonica, canonicaForm);
      } else {
        await createCanonica(canonicaForm);
      }
      setOpenCanonica(false);
      loadCanonicas();
    } catch (error) {
      console.error('Error guardando canonica:', error);
    }
  };

  const handleCanonicaDelete = async (id) => {
    await deleteCanonica(id);
    loadCanonicas();
  };

  const canManage = hasPermission('editPrompt');

  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      <Typography variant="h4" gutterBottom>
        Aprendizaje del Chatbot
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Revisa conversaciones marcadas para aprendizaje. Aprueba para crear respuestas canónicas que el chatbot
        usará en lugar de OpenAI, o rechaza si la respuesta no es adecuada.
      </Alert>

      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip label={`Total revisiones: ${stats.total_revisiones || 0}`} />
          <Chip label={`Total canónicas: ${stats.total_canonicas || 0}`} />
          <Chip label={`Aprobadas: ${stats.aprobadas || 0}`} />
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        Revisiones Pendientes
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pregunta</TableCell>
              <TableCell>Respuesta actual</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {revisiones.map((rev) => (
              <TableRow key={rev.id_revision}>
                <TableCell>{rev.mensaje_usuario}</TableCell>
                <TableCell>{rev.sugerencia_respuesta || rev.respuesta_ia}</TableCell>
                <TableCell>{new Date(rev.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckIcon />}
                    onClick={() => handleAprobar(rev)}
                    disabled={!canManage}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={() => handleRechazar(rev.id_revision)}
                    disabled={!canManage}
                  >
                    Rechazar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom>
        Conocimientos Canónicos
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pregunta</TableCell>
              <TableCell>Respuesta</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {canonicas.map((canon) => (
              <TableRow key={canon.id_canonica}>
                <TableCell>{canon.patron_trigger}</TableCell>
                <TableCell>{canon.respuesta_canonica?.substring(0, 100)}...</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleCanonicaOpen(canon)} disabled={!canManage}>
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleCanonicaDelete(canon.id_canonica)}
                    disabled={!canManage}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openCanonica} onClose={() => setOpenCanonica(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingCanonica ? 'Editar' : 'Nueva'} Conocimiento Canónico</DialogTitle>
        <DialogContent>
          <TextField
            label="Patrón disparador *"
            fullWidth
            margin="dense"
            helperText="La pregunta/frase que activa esta respuesta canónica."
            value={canonicaForm.patron_trigger}
            onChange={(e) => setCanonicaForm({ ...canonicaForm, patron_trigger: e.target.value })}
          />
          <TextField
            label="Respuesta canónica *"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            helperText="La respuesta fija que el chatbot usará en lugar de OpenAI cuando coincida el patrón."
            value={canonicaForm.respuesta_canonica}
            onChange={(e) => setCanonicaForm({ ...canonicaForm, respuesta_canonica: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCanonica(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCanonicaSave}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAprobar} onClose={() => setOpenAprobar(false)} maxWidth="md" fullWidth>
        <DialogTitle>Aprobar Revisión</DialogTitle>
        <DialogContent>
          {aprobarError && <Alert severity="error" sx={{ mb: 2 }}>{aprobarError}</Alert>}
          <TextField
            label="Patrón disparador"
            fullWidth
            margin="dense"
            helperText="La pregunta/frase que activará esta respuesta canónica."
            value={aprobarForm.patron_trigger}
            onChange={(e) => setAprobarForm({ ...aprobarForm, patron_trigger: e.target.value })}
          />
          <TextField
            label="Respuesta canónica *"
            fullWidth
            margin="dense"
            multiline
            rows={5}
            required
            helperText="Puedes editar y mejorar la respuesta antes de aprobarla. Será la que el chatbot use en lugar de OpenAI."
            value={aprobarForm.respuesta_canonica}
            onChange={(e) => setAprobarForm({ ...aprobarForm, respuesta_canonica: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAprobar(false)}>Cancelar</Button>
          <Button variant="contained" color="success" startIcon={<CheckIcon />} onClick={handleConfirmarAprobar}>
            Confirmar aprobación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function AprendizajeAdminProtected() {
  return (
    <AdminOnly>
      <AprendizajeAdmin />
    </AdminOnly>
  );
}
