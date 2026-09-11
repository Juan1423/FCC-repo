import React, { useState, useEffect, useCallback } from 'react';
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
  TablePagination,
  TextField,
  Button,
  Chip,
  Tooltip,
  InputAdornment,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, Block as BlockIcon } from '@mui/icons-material';
import {
  getRateLimitLogs,
  clearRateLimit,
  blockRateLimitIdentifier,
  unblockRateLimitIdentifier,
} from '../../../services/chatService';

const RateLimitConfig = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const cargarLogs = useCallback(async () => {
    const resp = await getRateLimitLogs({ page: page + 1, limit: rowsPerPage });
    if (resp?.success) {
      setLogs(resp.data || []);
      setTotal(resp?.pagination?.total ?? resp.data?.length ?? 0);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    cargarLogs();
  }, [cargarLogs]);

  const filtered = logs.filter((l) => {
    const term = searchTerm.toLowerCase();
    return (
      (l.identifier || '').toLowerCase().includes(term) ||
      (l.scope || '').toLowerCase().includes(term)
    );
  });

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClear = async (identifier) => {
    await clearRateLimit(identifier);
    cargarLogs();
  };

  const handleToggleBlock = async (l) => {
    if (l.manuallyBlocked) {
      if (window.confirm(`¿Desbloquear "${l.identifier}"?`)) {
        await unblockRateLimitIdentifier(l.identifier);
        cargarLogs();
      }
    } else {
      if (window.confirm(`¿Bloquear "${l.identifier}"? El chatbot dejará de responder a este usuario/IP.`)) {
        await blockRateLimitIdentifier(l.identifier);
        cargarLogs();
      }
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Rate Limit Logs
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Monitorea el uso del chatbot por usuario o IP. Si un usuario excede el límite diario de mensajes,
        puedes liberar su límite manualmente desde aquí, o bloquearlo/desbloquearlo de forma manual para
        impedir que siga usando el chatbot.
      </Alert>

      <TextField
        fullWidth
        placeholder="Buscar por usuario o IP..."
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
              <TableCell>Scope</TableCell>
              <TableCell>Identifier</TableCell>
              <TableCell>Request Count</TableCell>
              <TableCell>First Hit</TableCell>
              <TableCell>Bloqueado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((l, i) => (
              <TableRow key={`${l.identifier}-${i}`}>
                <TableCell>{l.scope}</TableCell>
                <TableCell>
                  <Tooltip title={l.identifier}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                      {l.identifier}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{l.count || 0}</TableCell>
                <TableCell>{new Date(l.firstHit).toLocaleString()}</TableCell>
                <TableCell>
                  <Tooltip
                    title={
                      l.manuallyBlocked
                        ? 'Bloqueado manualmente por un administrador'
                        : l.blocked
                          ? 'Superó el límite automático'
                          : 'Sin bloqueo'
                    }
                  >
                    <Chip label={l.blocked ? 'Sí' : 'No'} size="small" color={l.blocked ? 'error' : 'success'} />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color={l.manuallyBlocked ? 'success' : 'error'}
                    startIcon={<BlockIcon />}
                    onClick={() => handleToggleBlock(l)}
                  >
                    {l.manuallyBlocked ? 'Desbloquear' : 'Bloquear'}
                  </Button>
                  <Button size="small" onClick={() => handleClear(l.identifier)}>
                    Limpiar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage="Filas por página"
      />
    </Box>
  );
};

export default RateLimitConfig;