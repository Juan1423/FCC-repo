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
  TextField,
  Button,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getRateLimitLogs, clearRateLimit } from '../../../services/chatService';

const RateLimitConfig = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarLogs();
  }, []);

  const cargarLogs = async () => {
    const resp = await getRateLimitLogs();
    if (resp?.success) setLogs(resp.data || []);
  };

  const filtered = logs.filter((l) => {
    const term = searchTerm.toLowerCase();
    return (
      (l.identifier || '').toLowerCase().includes(term) ||
      (l.scope || '').toLowerCase().includes(term)
    );
  });

  const handleClear = async (identifier) => {
    await clearRateLimit(identifier);
    cargarLogs();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Rate Limit Logs
      </Typography>

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
              <TableRow key={i}>
                <TableCell>{l.scope}</TableCell>
                <TableCell>{l.identifier}</TableCell>
                <TableCell>{l.count || 0}</TableCell>
                <TableCell>{new Date(l.firstHit).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label={l.blocked ? 'Sí' : 'No'} size="small" color={l.blocked ? 'error' : 'success'} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleClear(l.identifier)}>
                    Limpiar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RateLimitConfig;
