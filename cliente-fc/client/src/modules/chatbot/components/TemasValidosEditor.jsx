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
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { getTemasValidos, regenerarTemas } from '../../../services/chatService';

const TemasValidosEditor = () => {
  const [temas, setTemas] = useState([]);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState(null);

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Temas Válidos (Off-topic)</Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRegenerar}
          disabled={regenerating}
        >
          {regenerating ? 'Regenerando...' : 'Regenerar Embeddings'}
        </Button>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        Los temas definen qué preguntas están dentro del alcance del chatbot.
        Si un mensaje no coincide con ningún tema (similitud coseno &lt; threshold), se responde con off-topic.
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
            </TableRow>
          </TableHead>
          <TableBody>
            {temas.map((t) => (
              <TableRow key={t.id_tema}>
                <TableCell>{t.id_tema}</TableCell>
                <TableCell>{t.tema}</TableCell>
                <TableCell>{t.descripcion?.substring(0, 80)}...</TableCell>
                <TableCell>
                  <Chip
                    label={t.embedding ? 'Generado' : 'Pendiente'}
                    size="small"
                    color={t.embedding ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={<Switch checked={t.activo} disabled size="small" />}
                    label=""
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TemasValidosEditor;
