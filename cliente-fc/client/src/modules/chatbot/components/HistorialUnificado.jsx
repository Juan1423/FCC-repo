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
  TableFooter,
  TablePagination,
  Paper,
  TextField,
  Button,
  Chip,
  InputAdornment,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import { getConversaciones, getHistorialReporte } from '../../../services/chatService';

const HistorialUnificado = () => {
  const [historial, setHistorial] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipo, setTipo] = useState('');
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [exportError, setExportError] = useState('');

  const cargarHistorial = useCallback(async () => {
    const resp = await getConversaciones({ page: page + 1, limit: itemsPerPage, tipo });
    if (resp?.success) {
      setHistorial(resp.data || []);
      setTotal(resp?.pagination?.total ?? resp.data?.length ?? 0);
    }
  }, [page, itemsPerPage, tipo]);

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

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTipoChange = (event, newTipo) => {
    setTipo(newTipo || '');
    setPage(0);
    setExportError('');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleExportar = async () => {
    try {
      const blob = await getHistorialReporte({ tipo });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historial_chat_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportError('');
    } catch (e) {
      console.error('Error exportando CSV:', e);
      setExportError('No se pudo exportar el historial. Intenta de nuevo.');
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h5">Historial de Conversaciones</Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportar}>
          Exportar CSV
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Historial completo de conversaciones del chatbot (público e interno).
        Filtra por tipo (público/interno), busca por mensaje, respuesta o session ID, y exporta las filas del filtro a CSV.
      </Alert>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <TextField
          sx={{ flex: 1, minWidth: 220 }}
          placeholder="Buscar en conversaciones..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <ToggleButtonGroup value={tipo} exclusive onChange={handleTipoChange} size="small" aria-label="Filtro por tipo">
          <ToggleButton value="">Todos</ToggleButton>
          <ToggleButton value="publico">Público</ToggleButton>
          <ToggleButton value="interno">Interno</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {exportError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {exportError}
        </Alert>
      )}

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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="subtitle1">No hay conversaciones</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
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
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7}>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={searchTerm ? filtered.length : total}
                  rowsPerPage={itemsPerPage}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleItemsPerPageChange}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HistorialUnificado;
