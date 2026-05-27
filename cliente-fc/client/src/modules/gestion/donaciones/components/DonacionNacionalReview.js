import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, CircularProgress, Box, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Chip, TableSortLabel, useMediaQuery, useTheme, Divider,
} from '@mui/material';
import * as donacionService from '../../../../services/donacionService';

const DonacionNacionalReview = () => {
  const [items, setItems] = useState([]);
  const [donantes, setDonantes] = useState({});
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [idEmpleado, setIdEmpleado] = useState('');
  const [estado, setEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('id_donacion_nacional');
  const [orderDir, setOrderDir] = useState('desc');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, emp] = await Promise.all([
        donacionService.getDonacionesNacionales(),
        donacionService.getEmpleados(),
      ]);
      const list = Array.isArray(d) ? d : [];
      setItems(list);
      setEmpleados(Array.isArray(emp) ? emp : []);

      const ids = [...new Set(list.map(i => i.id_donante_nacional).filter(Boolean))];
      if (ids.length > 0) {
        const allDonantes = await donacionService.getDonantesNacionales();
        const donantesList = Array.isArray(allDonantes) ? allDonantes : [];
        const map = {};
        donantesList.forEach(dn => { map[dn.id_donante_nacional] = dn; });
        setDonantes(map);
      }
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openReview = (item) => {
    setSelected(item);
    setIdEmpleado(item.id_empleado ?? '');
    setEstado(item.estado || '');
    setObservaciones(item.observaciones || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await donacionService.updateDonacionNacional(selected.id_donacion_nacional, {
        id_empleado: idEmpleado || null,
        estado: estado || selected.estado,
        observaciones: observaciones || null,
      });
      setModalOpen(false);
      load();
    } catch (e) {
      alert('Error al guardar: ' + (e?.response?.data?.message || e.message));
    }
  };

  const handleSort = (column) => {
    if (orderBy === column) {
      setOrderDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrderDir('asc');
    }
  };

  const getEmpleadoName = (id) => {
    if (!id) return 'Sin asignar';
    const emp = empleados.find(e => e.id_empleado === id);
    return emp ? `${emp.nombres} ${emp.apellidos}` : '—';
  };

  const getEstadoColor = (est) => {
    switch (est) {
      case 'verificada': return 'success';
      case 'rechazada': return 'error';
      default: return 'warning';
    }
  };

  const filtered = items
    .filter(row => {
      if (!searchTerm) return true;
      const dn = donantes[row.id_donante_nacional];
      const q = searchTerm.toLowerCase();
      return (dn?.nombres?.toLowerCase().includes(q)) ||
        (dn?.apellidos?.toLowerCase().includes(q)) ||
        (dn?.identificacion?.toLowerCase().includes(q)) ||
        String(row.id_donacion_nacional).includes(q) ||
        (row.monto && String(row.monto).includes(q));
    })
    .sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (!aVal) return 1;
      if (!bVal) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return orderDir === 'asc' ? cmp : -cmp;
    });

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress aria-label="Cargando donaciones" /></Box>;
  if (error) return <Typography color="error" role="alert">{error}</Typography>;

  const renderDesktopTable = () => (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, border: '1px solid rgba(200,85,61,0.1)' }}>
      <Table size="small" aria-label="Tabla de donaciones nacionales">
        <TableHead>
          <TableRow>
            {[
              { id: 'id_donacion_nacional', label: 'ID' },
              { id: 'donante', label: 'Donante' },
              { id: 'monto', label: 'Monto' },
              { id: 'fecha_donacion', label: 'Fecha' },
              { id: 'estado', label: 'Estado' },
              { id: 'empleado', label: 'Empleado' },
            ].map(col => (
              <TableCell key={col.id}>
                <TableSortLabel
                  active={orderBy === col.id || (col.id === 'donante' && orderBy === 'id_donacion_nacional')}
                  direction={orderDir}
                  onClick={() => handleSort(col.id)}
                  aria-label={`Ordenar por ${col.label}`}
                >
                  {col.label}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell align="right" aria-label="Acciones">Acción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map(row => {
            const dn = donantes[row.id_donante_nacional];
            return (
              <TableRow
                key={row.id_donacion_nacional}
                sx={{ '&:hover': { bgcolor: 'rgba(200,85,61,0.03)' } }}
              >
                <TableCell>{row.id_donacion_nacional}</TableCell>
                <TableCell>{dn ? `${dn.nombres} ${dn.apellidos}` : '—'}</TableCell>
                <TableCell>{row.monto ? `$${row.monto}` : '—'}</TableCell>
                <TableCell>{row.fecha_donacion || '—'}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.estado} color={getEstadoColor(row.estado)} />
                </TableCell>
                <TableCell>{getEmpleadoName(row.id_empleado)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openReview(row)}
                    sx={{
                      borderColor: 'rgba(200,85,61,0.3)',
                      color: '#C8553D',
                      minHeight: 44,
                      '&:hover': { borderColor: '#C8553D', bgcolor: 'rgba(200,85,61,0.04)' },
                    }}
                  >
                    Revisar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography color="text.secondary" sx={{ py: 3 }}>No hay donaciones registradas.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileCards = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {filtered.map(row => {
        const dn = donantes[row.id_donante_nacional];
        return (
          <Paper
            key={row.id_donacion_nacional}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid rgba(200,85,61,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>#{row.id_donacion_nacional}</Typography>
                <Typography variant="body2">{dn ? `${dn.nombres} ${dn.apellidos}` : '—'}</Typography>
              </Box>
              <Chip size="small" label={row.estado} color={getEstadoColor(row.estado)} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
              {row.monto && <Typography variant="body2" fontWeight={600} color="success.main">${row.monto}</Typography>}
              <Typography variant="body2" color="text.secondary">{row.fecha_donacion || '—'}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Empleado: {getEmpleadoName(row.id_empleado)}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                onClick={() => openReview(row)}
                sx={{
                  borderColor: 'rgba(200,85,61,0.3)',
                  color: '#C8553D',
                  minHeight: 44,
                  '&:hover': { borderColor: '#C8553D', bgcolor: 'rgba(200,85,61,0.04)' },
                }}
              >
                Revisar
              </Button>
            </Box>
          </Paper>
        );
      })}
      {filtered.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No hay donaciones registradas.</Typography>
      )}
    </Box>
  );

  const renderDialog = () => (
    <Dialog
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      maxWidth="sm"
      fullWidth
      aria-labelledby="review-dialog-title"
    >
      <DialogTitle id="review-dialog-title" sx={{ color: '#4A2C2A', fontWeight: 600 }}>
        Revisar Donación Nacional
      </DialogTitle>
      <DialogContent dividers>
        {selected && (
          <>
            <Typography variant="subtitle2" sx={{ color: '#C8553D', fontWeight: 600, mb: 1 }}>
              Información del donante
            </Typography>
            {donantes[selected.id_donante_nacional] && (
              <Box sx={{ mb: 2, pl: 1 }}>
                <Typography variant="body2">
                  <strong>Nombre:</strong> {donantes[selected.id_donante_nacional].nombres} {donantes[selected.id_donante_nacional].apellidos}
                </Typography>
                <Typography variant="body2">
                  <strong>ID:</strong> {donantes[selected.id_donante_nacional].identificacion}
                </Typography>
                <Typography variant="body2">
                  <strong>Teléfono:</strong> {donantes[selected.id_donante_nacional].telefono}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {donantes[selected.id_donante_nacional].email}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" sx={{ color: '#C8553D', fontWeight: 600, mb: 1 }}>
              Detalle de la donación
            </Typography>
            <Box sx={{ mb: 2, pl: 1 }}>
              <Typography variant="body2"><strong>Monto:</strong> {selected.monto ? `$${selected.monto}` : '—'}</Typography>
              <Typography variant="body2"><strong>Descripción:</strong> {selected.descripcion || '—'}</Typography>
              <Typography variant="body2"><strong>Motivo:</strong> {selected.motivo || '—'}</Typography>
              <Typography variant="body2"><strong>Procedencia:</strong> {selected.procedencia || '—'}</Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" sx={{ color: '#C8553D', fontWeight: 600, mb: 1 }}>
              Asignación
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="empleado-label">Empleado responsable</InputLabel>
              <Select
                labelId="empleado-label"
                label="Empleado responsable"
                value={idEmpleado}
                onChange={e => setIdEmpleado(e.target.value)}
              >
                <MenuItem value=""><em>Sin asignar</em></MenuItem>
                {empleados.map(e => (
                  <MenuItem key={e.id_empleado} value={e.id_empleado}>{e.nombres} {e.apellidos}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select
                labelId="estado-label"
                label="Estado"
                value={estado}
                onChange={e => setEstado(e.target.value)}
              >
                <MenuItem value="registrada">Registrada</MenuItem>
                <MenuItem value="verificada">Verificada</MenuItem>
                <MenuItem value="rechazada">Rechazada</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Observaciones"
              multiline
              rows={3}
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={() => setModalOpen(false)}
          sx={{ color: '#666', minHeight: 44 }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            bgcolor: '#C8553D',
            minHeight: 44,
            '&:hover': { bgcolor: '#B04430' },
          }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por nombre, ID, monto..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '& fieldset': { borderColor: 'rgba(200,85,61,0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(200,85,61,0.4)' },
          },
        }}
        inputProps={{ 'aria-label': 'Buscar donaciones nacionales' }}
      />
      {isMobile ? renderMobileCards() : renderDesktopTable()}
      {renderDialog()}
    </Box>
  );
};

export default DonacionNacionalReview;
