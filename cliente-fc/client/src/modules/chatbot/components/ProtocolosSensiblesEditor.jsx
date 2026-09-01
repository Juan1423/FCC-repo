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
  MenuItem,
  InputLabel,
  Select,
  FormControl,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Restore as RestoreIcon } from '@mui/icons-material';
import { getProtocolos, createProtocolo, updateProtocolo, deleteProtocolo } from '../../../services/chatService';

const ACCIONES = ['derivar_humano_inmediato', 'derivar_profesional', 'derivar_emergencia'];

const parsePalabrasClave = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch (e) {
    return raw.split(',').map((k) => k.trim()).filter(Boolean);
  }
};

const joinPalabrasClave = (keywords) => keywords.join(', ');

const ProtocolosSensiblesEditor = () => {
  const [protocolos, setProtocolos] = useState([]);
  const [open, setOpen] = useState(false);
  const [formacion, setFormacion] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarProtocolos();
  }, []);

  const cargarProtocolos = async () => {
    const resp = await getProtocolos();
    if (resp?.success) setProtocolos(resp.data || []);
  };

  const handleOpen = (p = null) => {
    setError('');
    if (p) {
      setFormacion({
        id_protocolo: p.id_protocolo,
        categoria: p.categoria,
        palabras_clave: joinPalabrasClave(parsePalabrasClave(p.palabras_clave)),
        respuesta_canonica: p.respuesta_canonica,
        accion_requerida: p.accion_requerida,
        prioridad: p.prioridad,
        activo: p.activo,
      });
    } else {
      setFormacion({
        id_protocolo: null,
        categoria: '',
        palabras_clave: '',
        respuesta_canonica: '',
        accion_requerida: 'derivar_humano_inmediato',
        prioridad: 1,
        activo: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setFormacion(null);
    setOpen(false);
  };

  const handleGuardar = async () => {
    try {
      if (!formacion.categoria.trim() || !formacion.respuesta_canonica.trim()) {
        setError('Categoría y respuesta canónica son obligatorias.');
        return;
      }
      const keywords = formacion.palabras_clave
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      if (keywords.length === 0) {
        setError('Debes escribir al menos una palabra clave.');
        return;
      }
      const payload = {
        categoria: formacion.categoria.trim(),
        palabras_clave: JSON.stringify(keywords),
        respuesta_canonica: formacion.respuesta_canonica.trim(),
        accion_requerida: formacion.accion_requerida,
        prioridad: parseInt(formacion.prioridad || 1, 10),
        activo: formacion.activo !== undefined ? formacion.activo : true,
      };
      if (formacion.id_protocolo) {
        await updateProtocolo(formacion.id_protocolo, payload);
      } else {
        await createProtocolo(payload);
      }
      handleClose();
      cargarProtocolos();
    } catch (e) {
      setError(e?.message || 'Error guardando el protocolo.');
    }
  };

  const handleDelete = async (id) => {
    await deleteProtocolo(id);
    cargarProtocolos();
  };

  const handleReactivar = async (id) => {
    await updateProtocolo(id, { activo: true });
    cargarProtocolos();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h5">Protocolos Sensibles</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Nuevo protocolo
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Los protocolos sensibles interceptan mensajes ANTES de llegar a OpenAI. Si un mensaje contiene
        una palabra clave del protocolo, el bot responde con la respuesta predefinida (que puedes editar
        aquí). Útil para temas de emergencia o contenido delicado.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Categoría</TableCell>
              <TableCell>Palabras clave</TableCell>
              <TableCell>Respuesta</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {protocolos.map((p) => (
              <TableRow key={p.id_protocolo}>
                <TableCell>{p.categoria}</TableCell>
                <TableCell sx={{ maxWidth: 220 }}>
                  {parsePalabrasClave(p.palabras_clave).map((k) => (
                    <Chip key={k} label={k} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell sx={{ maxWidth: 320 }}>{p.respuesta_canonica?.substring(0, 90)}...</TableCell>
                <TableCell>{p.accion_requerida}</TableCell>
                <TableCell><Chip label={p.prioridad} size="small" /></TableCell>
                <TableCell>
                  <Chip
                    label={p.activo ? 'Activo' : 'Inactivo'}
                    size="small"
                    color={p.activo ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpen(p)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {p.activo ? (
                    <IconButton size="small" color="error" onClick={() => handleDelete(p.id_protocolo)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton size="small" color="primary" onClick={() => handleReactivar(p.id_protocolo)}>
                      <RestoreIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{formacion?.id_protocolo ? 'Editar Protocolo' : 'Nuevo Protocolo'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Categoría *"
              value={formacion?.categoria || ''}
              onChange={(e) => setFormacion({ ...formacion, categoria: e.target.value })}
              fullWidth
              helperText="Identificador único del tema (ej. violencia_abuso, suicidio_autolesion)."
            />
            <TextField
              label="Palabras clave * (separadas por coma)"
              value={formacion?.palabras_clave || ''}
              onChange={(e) => setFormacion({ ...formacion, palabras_clave: e.target.value })}
              fullWidth
              multiline
              rows={3}
              helperText="Frases o términos que disparan este protocolo (ej. me golpean, no respiro)."
            />
            <TextField
              label="Respuesta canónica *"
              value={formacion?.respuesta_canonica || ''}
              onChange={(e) => setFormacion({ ...formacion, respuesta_canonica: e.target.value })}
              fullWidth
              multiline
              rows={4}
              helperText="La respuesta fija que el bot mostrará cuando el mensaje coincida con las palabras clave."
            />
            <FormControl fullWidth>
              <InputLabel>Acción requerida</InputLabel>
              <Select
                label="Acción requerida"
                value={formacion?.accion_requerida || 'derivar_humano_inmediato'}
                onChange={(e) => setFormacion({ ...formacion, accion_requerida: e.target.value })}
              >
                {ACCIONES.map((acc) => (
                  <MenuItem key={acc} value={acc}>{acc}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Prioridad"
              type="number"
              value={formacion?.prioridad ?? 1}
              onChange={(e) => setFormacion({ ...formacion, prioridad: e.target.value })}
              fullWidth
              helperText="Más alto gana cuando varios protocolos coinciden."
            />
            <FormControl>
              <Select
                value={formacion?.activo ? 'activo' : 'inactivo'}
                onChange={(e) => setFormacion({ ...formacion, activo: e.target.value === 'activo' })}
                size="small"
                sx={{ maxWidth: 160 }}
              >
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
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