import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getProtocolos, createProtocolo, updateProtocolo, deleteProtocolo } from '../../../services/chatService';

const ProtocolosSensiblesEditor = () => {
  const [protocolos, setProtocolos] = useState([]);
  const [open, setOpen] = useState(false);
  const [formacion, setFormacion] = useState(null);

  useEffect(() => {
    cargarProtocolos();
  }, []);

  const cargarProtocolos = async () => {
    const resp = await getProtocolos();
    if (resp?.success) setProtocolos(resp.data || []);
  };

  const handleOpen = (p = null) => {
    setFormacion(p);
    setOpen(true);
  };

  const handleClose = () => {
    setFormacion(null);
    setOpen(false);
  };

  const handleGuardar = async () => {
    const payload = {
      categoria: formacion.categoria || '',
      patrones_trigger: formacion.patrones_trigger || '',
      respuesta_canonica: formacion.respuesta_canonica || '',
      accion_requerida: formacion.accion_requerida || '',
      prioridad: parseInt(formacion.prioridad || 0, 10),
    };
    if (formacion.id_protocolo) {
      await updateProtocolo(formacion.id_protocolo, payload);
    } else {
      await createProtocolo(payload);
    }
    handleClose();
    cargarProtocolos();
  };

  const handleDelete = async (id) => {
    await deleteProtocolo(id);
    cargarProtocolos();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Protocolos Sensibles</Typography>
        <IconButton color="primary" onClick={() => handleOpen()}>
          <AddIcon />
        </IconButton>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Los protocolos sensibles interceptan mensajes antes de llegar a OpenAI.
        Si un mensaje coincide con las palabras clave de un protocolo, se responde con la respuesta predefinida.
        Útil para temas legales, emergencias o contenido sensible.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Categoría</TableCell>
              <TableCell>Patrones</TableCell>
              <TableCell>Respuesta</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {protocolos.map((p) => (
              <TableRow key={p.id_protocolo}>
                <TableCell>{p.categoria}</TableCell>
                <TableCell>{p.patrones_trigger?.substring(0, 60)}...</TableCell>
                <TableCell>{p.respuesta_canonica?.substring(0, 60)}...</TableCell>
                <TableCell>{p.accion_requerida}</TableCell>
                <TableCell><Chip label={p.prioridad} size="small" /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpen(p)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(p.id_protocolo)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{formacion?.id_protocolo ? 'Editar Protocolo' : 'Nuevo Protocolo'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Categoría"
              value={formacion?.categoria || ''}
              onChange={(e) => setFormacion({ ...formacion, categoria: e.target.value })}
              fullWidth
            />
            <TextField
              label="Patrones Trigger (separados por coma)"
              value={formacion?.patrones_trigger || ''}
              onChange={(e) => setFormacion({ ...formacion, patrones_trigger: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Respuesta Canónica"
              value={formacion?.respuesta_canonica || ''}
              onChange={(e) => setFormacion({ ...formacion, respuesta_canonica: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Acción Requerida"
              value={formacion?.accion_requerida || ''}
              onChange={(e) => setFormacion({ ...formacion, accion_requerida: e.target.value })}
              fullWidth
            />
            <TextField
              label="Prioridad"
              type="number"
              value={formacion?.prioridad || ''}
              onChange={(e) => setFormacion({ ...formacion, prioridad: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleGuardar} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProtocolosSensiblesEditor;
