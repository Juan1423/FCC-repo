import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, CircularProgress, Box, Typography, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Chip,
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

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Donante</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Empleado</TableCell>
              <TableCell align="right">Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(row => {
              const dn = donantes[row.id_donante_nacional];
              return (
                <TableRow key={row.id_donacion_nacional}>
                  <TableCell>{row.id_donacion_nacional}</TableCell>
                  <TableCell>{dn ? `${dn.nombres} ${dn.apellidos}` : '—'}</TableCell>
                  <TableCell>{row.monto ? `$${row.monto}` : '—'}</TableCell>
                  <TableCell>{row.fecha_donacion || '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.estado} color={row.estado === 'verificada' ? 'success' : row.estado === 'rechazada' ? 'error' : 'warning'} />
                  </TableCell>
                  <TableCell>{row.id_empleado ? empleados.find(e => e.id_empleado === row.id_empleado)?.nombres || '—' : 'Sin asignar'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openReview(row)}>Revisar</Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={7}><Typography color="text.secondary">No hay donaciones registradas.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Revisar Donación Nacional</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <>
              <Typography variant="subtitle2" gutterBottom>Información del donante</Typography>
              {donantes[selected.id_donante_nacional] && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2"><strong>Nombre:</strong> {donantes[selected.id_donante_nacional].nombres} {donantes[selected.id_donante_nacional].apellidos}</Typography>
                  <Typography variant="body2"><strong>ID:</strong> {donantes[selected.id_donante_nacional].identificacion}</Typography>
                  <Typography variant="body2"><strong>Teléfono:</strong> {donantes[selected.id_donante_nacional].telefono}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {donantes[selected.id_donante_nacional].email}</Typography>
                </Box>
              )}

              <Typography variant="subtitle2" gutterBottom>Detalle de la donación</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2"><strong>Monto:</strong> {selected.monto ? `$${selected.monto}` : '—'}</Typography>
                <Typography variant="body2"><strong>Descripción:</strong> {selected.descripcion || '—'}</Typography>
                <Typography variant="body2"><strong>Motivo:</strong> {selected.motivo || '—'}</Typography>
                <Typography variant="body2"><strong>Procedencia:</strong> {selected.procedencia || '—'}</Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>Asignación</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Empleado responsable</InputLabel>
                <Select label="Empleado responsable" value={idEmpleado} onChange={e => setIdEmpleado(e.target.value)}>
                  <MenuItem value=""><em>Sin asignar</em></MenuItem>
                  {empleados.map(e => (
                    <MenuItem key={e.id_empleado} value={e.id_empleado}>{e.nombres} {e.apellidos}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Estado</InputLabel>
                <Select label="Estado" value={estado} onChange={e => setEstado(e.target.value)}>
                  <MenuItem value="registrada">Registrada</MenuItem>
                  <MenuItem value="verificada">Verificada</MenuItem>
                  <MenuItem value="rechazada">Rechazada</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Observaciones" multiline rows={3} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DonacionNacionalReview;
