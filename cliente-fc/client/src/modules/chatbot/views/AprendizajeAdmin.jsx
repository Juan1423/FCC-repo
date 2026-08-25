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
  const [canonicaForm, setCanonicaForm] = useState({ pregunta: '', respuesta: '' });
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

  const handleAprobar = async (id, respuesta) => {
    await aprobarRevision(id, { respuesta });
    loadRevisiones();
    loadCanonicas();
  };

  const handleRechazar = async (id) => {
    await rechazarRevision(id);
    loadRevisiones();
  };

  const handleCanonicaOpen = (item = null) => {
    if (item) {
      setEditingCanonica(item.id_canonica);
      setCanonicaForm({ pregunta: item.pregunta, respuesta: item.respuesta });
    } else {
      setEditingCanonica(null);
      setCanonicaForm({ pregunta: '', respuesta: '' });
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Aprendizaje del Chatbot
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Revisa conversaciones marcadas para aprendizaje. Aprueba para crear respuestas canónicas que el chatbot
        usará en lugar de OpenAI, o rechaza si la respuesta no es adecuada.
      </Alert>

      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
                <TableCell>{rev.pregunta}</TableCell>
                <TableCell>{rev.respuesta_sugerida}</TableCell>
                <TableCell>{new Date(rev.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckIcon />}
                    onClick={() => handleAprobar(rev.id_revision, rev.respuesta_sugerida)}
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
                <TableCell>{canon.pregunta}</TableCell>
                <TableCell>{canon.respuesta?.substring(0, 100)}...</TableCell>
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
            label="Pregunta"
            fullWidth
            margin="dense"
            value={canonicaForm.pregunta}
            onChange={(e) => setCanonicaForm({ ...canonicaForm, pregunta: e.target.value })}
          />
          <TextField
            label="Respuesta"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            value={canonicaForm.respuesta}
            onChange={(e) => setCanonicaForm({ ...canonicaForm, respuesta: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCanonica(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCanonicaSave}>Guardar</Button>
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
