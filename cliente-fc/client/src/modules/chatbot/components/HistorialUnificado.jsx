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
  Collapse,
  Divider,
  InputAdornment,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
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
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const cargarHistorial = useCallback(async () => {
    const resp = await getConversaciones({ page: page + 1, limit: itemsPerPage, tipo, q: searchTerm });
    if (resp?.success) {
      setHistorial(resp.data || []);
      setTotal(resp?.pagination?.total ?? resp.data?.length ?? 0);
    }
  }, [page, itemsPerPage, tipo, searchTerm]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

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
      const blob = await getHistorialReporte({ tipo, q: searchTerm });
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
    if (metadata.protocolo_categoria) {
      return (
        <Tooltip title="El mensaje activó un protocolo sensible. Requiere intervención de una persona">
          <Chip label={`Protocolo: ${metadata.protocolo_categoria}`} size="small" color="error" />
        </Tooltip>
      );
    }
    if (item.flag_revision && item.motivo_revision) {
      return (
        <Tooltip title={`Marcada para revisión de aprendizaje. Motivo: ${item.motivo_revision}`}>
          <Chip label={`Flag: ${item.motivo_revision}`} size="small" color="warning" />
        </Tooltip>
      );
    }
    if (metadata.canonical_match) {
      return (
        <Tooltip title="Respondió con una respuesta canónica exacta (patrón regex o similud de embeddings)">
          <Chip label="Canónica" size="small" color="success" />
        </Tooltip>
      );
    }
    if (metadata.off_topic) {
      return (
        <Tooltip title="El guardrail detectó un tema fuera de alcance (off-topic)">
          <Chip label="Off-topic" size="small" color="info" />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Respuesta generada por el modelo (no canónica, no marcada)">
        <Chip label="IA" size="small" color="primary" />
      </Tooltip>
    );
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
        Haz clic en una fila para ver el mensaje y la respuesta completos.
      </Alert>

      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <Typography variant="subtitle2">Leyenda de la columna Decisión:</Typography>
        <Chip label="Protocolo: X" size="small" color="error" />
        <Typography variant="caption" sx={{ mr: 1 }}>Protocolo sensible: requiere intervención humana</Typography>
        <Chip label="Flag: X" size="small" color="warning" />
        <Typography variant="caption" sx={{ mr: 1 }}>Marcada a revisión de aprendizaje</Typography>
        <Chip label="Canónica" size="small" color="success" />
        <Typography variant="caption" sx={{ mr: 1 }}>Respuesta exacta de una canónica</Typography>
        <Chip label="Off-topic" size="small" color="info" />
        <Typography variant="caption" sx={{ mr: 1 }}>Tema fuera de alcance</Typography>
        <Chip label="IA" size="small" color="primary" />
        <Typography variant="caption">Respuesta generada por el modelo</Typography>
      </Box>

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
            {historial.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="subtitle1">No hay conversaciones</Typography>
                </TableCell>
              </TableRow>
            ) : (
              historial.map((item) => (
                  <React.Fragment key={item.id_conversacion}>
                    <TableRow
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => toggleExpand(item.id_conversacion)}
                    >
                      <TableCell>
                        <Tooltip title={`Canal de la conversación: ${item.tipo}`}>
                          <Chip label={item.tipo} size="small" />
                        </Tooltip>
                      </TableCell>
                      <TableCell>{getDecisionChip(item)}</TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" noWrap>
                          {item.mensaje_usuario}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" noWrap>
                          {item.respuesta_bot}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.tiempo_respuesta}</TableCell>
                      <TableCell>{item.tokens_usados}</TableCell>
                      <TableCell>{new Date(item.fecha_conversacion).toLocaleString()}</TableCell>
                    </TableRow>
                    {expandedId === item.id_conversacion && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0 }}>
                          <Collapse in timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Mensaje del usuario
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {item.mensaje_usuario}
                              </Typography>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Respuesta del bot
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {item.respuesta_bot}
                              </Typography>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7}>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={total}
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
