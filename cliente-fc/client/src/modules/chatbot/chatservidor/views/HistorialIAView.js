import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavbarAdmin from "../../../../components/NavbarAdmin";
import Drawer from "../../../../components/Drawer";
import { useMenu } from '../../../../components/base/MenuContext';
import iaService from '../../../../services/iaService';
import { useNavigate } from 'react-router-dom';

const HistorialIAView = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { setCurrentMenu } = useMenu();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    usuarioId: '',
    sessionId: '',
    desde: '',
    hasta: ''
  });

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Historial IA');
    fetchHistorial();
  }, [setCurrentMenu]);

  const fetchHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await iaService.getHistorial({
        search: filters.search || undefined,
        usuarioId: filters.usuarioId || undefined,
        sessionId: filters.sessionId || undefined,
        desde: filters.desde || undefined,
        hasta: filters.hasta || undefined,
        limit: 50,
        offset: 0
      });
      setRows(res.data.data || []);
    } catch (err) {
      setRows([]);
      setError('No se pudo cargar el historial de IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await iaService.getHistorialReporte({
        format: 'csv',
        search: filters.search || undefined,
        usuarioId: filters.usuarioId || undefined,
        sessionId: filters.sessionId || undefined,
        desde: filters.desde || undefined,
        hasta: filters.hasta || undefined,
        limit: 5000
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historial_ia_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('No se pudo descargar el reporte de IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFilters({ ...filters, [field]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHistorial();
  };

  return (
    <Box sx={{ display: "flex" }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate(-1)} aria-label="Regresar">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ ml: 1, color: 'text.secondary' }}>
              Regresar
            </Typography>
          </Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Historial de Consultas IA
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Filtra y revisa las preguntas realizadas por el personal interno junto con las respuestas generadas.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            <TextField label="Buscar texto" value={filters.search} onChange={handleChange('search')} />
            <TextField label="ID Usuario" value={filters.usuarioId} onChange={handleChange('usuarioId')} />
            <TextField label="Session ID" value={filters.sessionId} onChange={handleChange('sessionId')} />
            <TextField type="date" label="Desde" InputLabelProps={{ shrink: true }} value={filters.desde} onChange={handleChange('desde')} />
            <TextField type="date" label="Hasta" InputLabelProps={{ shrink: true }} value={filters.hasta} onChange={handleChange('hasta')} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                Aplicar filtros
              </Button>
              <Button variant="outlined" onClick={handleDownloadReport} disabled={loading}>
                Descargar CSV
              </Button>
              {loading && <CircularProgress size={22} />}
            </Box>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          {error && <Typography color="error">{error}</Typography>}
          {loading && rows.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Pregunta</TableCell>
                    <TableCell>Respuesta</TableCell>
                    <TableCell>Documentos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleString() : 'N/A'}</TableCell>
                      <TableCell>{row.usuario_id || 'N/A'}</TableCell>
                      <TableCell>{row.input_usuario}</TableCell>
                      <TableCell>{row.output_ia}</TableCell>
                      <TableCell>{row.contexto_fuente || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay registros con los filtros actuales.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default HistorialIAView;