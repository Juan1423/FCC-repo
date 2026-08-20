import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  Button,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import { getConversaciones } from '../../../services/chatService';

const HistorialUnificado = () => {
  const [historial, setHistorial] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page] = useState(1);
  const limit = 50;

  const cargarHistorial = useCallback(async () => {
    const resp = await getConversaciones({ page, limit });
    if (resp?.success) setHistorial(resp.data || []);
  }, [page, limit]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const filtered = historial.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.mensaje_usuario || '').toLowerCase().includes(term) ||
      (item.respuesta_bot || '').toLowerCase().includes(term) ||
      (item.session_id || '').toLowerCase().includes(term)
    );
  });

  const handleExportar = () => {
    const csvContent = [
      ['ID', 'Tipo', 'Usuario', 'Session', 'Mensaje', 'Respuesta', 'Fecha'],
      ...filtered.map((h) => [
        h.id_conversacion,
        h.tipo,
        h.id_usuario || h.id_usuario_anonimo || 'anon',
        h.session_id || '',
        h.mensaje_usuario || '',
        h.respuesta_bot || '',
        h.fecha_conversacion,
      ]),
    ].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));

    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_chat_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDecisionChip = (item) => {
    const metadata = item.metadata || {};
    if (item.flag_revision && item.motivo_revision) {
      return <Chip label={`Flag: ${item.motivo_revision}`} size="small" color="warning" />;
    }
    if (metadata.canonical_match) {
      return <Chip label="Canónica" size="small" color="success" />;
    }
    if (metadata.off_topic) {
      return <Chip label="Off-topic" size="small" color="info" />;
    }
    if (metadata.protocolo_categoria) {
      return <Chip label={`Protocolo: ${metadata.protocolo_categoria}`} size="small" color="error" />;
    }
    return <Chip label="IA" size="small" color="primary" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Historial de Conversaciones</Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportar}>
          Exportar CSV
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Buscar en conversaciones..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Decision</TableCell>
              <TableCell>Mensaje</TableCell>
              <TableCell>Respuesta</TableCell>
              <TableCell>Response Time (ms)</TableCell>
              <TableCell>Tokens</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id_conversacion}>
                <TableCell>
                  <Chip label={item.tipo} size="small" />
                </TableCell>
                <TableCell>{getDecisionChip(item)}</TableCell>
                <TableCell>{item.mensaje_usuario?.substring(0, 80)}...</TableCell>
                <TableCell>{item.respuesta_bot?.substring(0, 80)}...</TableCell>
                <TableCell>{item.tiempo_respuesta}</TableCell>
                <TableCell>{item.tokens_usados}</TableCell>
                <TableCell>{new Date(item.fecha_conversacion).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HistorialUnificado;
