import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import NavbarAdmin from "../../../components/NavbarAdmin";
import Drawer from "../../../components/Drawer";
import { useMenu } from '../../../components/base/MenuContext';
import capacitacionesService from '../../../services/capacitacionesService';

const emptyForm = {
  titulo: '',
  descripcion: '',
  tipo: 'INTERNA',
  modalidad: '',
  fecha_inicio: '',
  fecha_fin: '',
  lugar: '',
  estado: 'PROGRAMADA',
  publico_objetivo: '',
  costo_estimado: ''
};

const CapacitacionesDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { setCurrentMenu } = useMenu();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Capacitaciones');
    fetchItems();
  }, [setCurrentMenu]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await capacitacionesService.getCapacitaciones();
      setItems(res.data || []);
    } catch (err) {
      setItems([]);
      setError('No se pudo cargar el listado de capacitaciones.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setOpenModal(true);
  };

  const handleEditModal = (item) => {
    setEditingId(item.id_capacitacion);
    setFormData({
      titulo: item.titulo || '',
      descripcion: item.descripcion || '',
      tipo: item.tipo || 'INTERNA',
      modalidad: item.modalidad || '',
      fecha_inicio: item.fecha_inicio ? item.fecha_inicio.slice(0, 10) : '',
      fecha_fin: item.fecha_fin ? item.fecha_fin.slice(0, 10) : '',
      lugar: item.lugar || '',
      estado: item.estado || 'PROGRAMADA',
      publico_objetivo: item.publico_objetivo || '',
      costo_estimado: item.costo_estimado || ''
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.fecha_inicio) {
      alert('El título y la fecha de inicio son obligatorios.');
      return;
    }
    try {
      if (editingId) {
        await capacitacionesService.updateCapacitacion(editingId, formData);
      } else {
        await capacitacionesService.createCapacitacion(formData);
      }
      fetchItems();
      setOpenModal(false);
    } catch (err) {
      setError('No se pudo guardar la capacitación.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta capacitación?')) return;
    try {
      await capacitacionesService.deleteCapacitacion(id);
      fetchItems();
    } catch (err) {
      setError('No se pudo eliminar la capacitación.');
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Capacitaciones Internas y Externas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Gestiona los procesos de capacitación para el personal interno o actores externos.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpenModal}>
            Nueva Capacitación
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          {error && <Typography color="error">{error}</Typography>}
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Inicio</TableCell>
                    <TableCell>Fin</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id_capacitacion}>
                      <TableCell>{item.titulo}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>{item.fecha_inicio ? item.fecha_inicio.slice(0, 10) : 'N/A'}</TableCell>
                      <TableCell>{item.fecha_fin ? item.fecha_fin.slice(0, 10) : 'N/A'}</TableCell>
                      <TableCell>{item.estado}</TableCell>
                      <TableCell>
                        <Button size="small" variant="contained" color="secondary" onClick={() => handleEditModal(item)} sx={{ mr: 1 }}>
                          Editar
                        </Button>
                        <Button size="small" variant="contained" color="error" onClick={() => handleDelete(item.id_capacitacion)}>
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay capacitaciones registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Capacitación' : 'Nueva Capacitación'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField label="Título" value={formData.titulo} onChange={handleChange('titulo')} fullWidth />
          <TextField label="Descripción" value={formData.descripcion} onChange={handleChange('descripcion')} multiline rows={3} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select value={formData.tipo} label="Tipo" onChange={handleChange('tipo')}>
              <MenuItem value="INTERNA">Interna</MenuItem>
              <MenuItem value="EXTERNA">Externa</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Modalidad" value={formData.modalidad} onChange={handleChange('modalidad')} fullWidth />
          <TextField type="date" label="Fecha Inicio" InputLabelProps={{ shrink: true }} value={formData.fecha_inicio} onChange={handleChange('fecha_inicio')} fullWidth />
          <TextField type="date" label="Fecha Fin" InputLabelProps={{ shrink: true }} value={formData.fecha_fin} onChange={handleChange('fecha_fin')} fullWidth />
          <TextField label="Lugar" value={formData.lugar} onChange={handleChange('lugar')} fullWidth />
          <TextField label="Estado" value={formData.estado} onChange={handleChange('estado')} fullWidth />
          <TextField label="Público objetivo" value={formData.publico_objetivo} onChange={handleChange('publico_objetivo')} fullWidth />
          <TextField label="Costo estimado" value={formData.costo_estimado} onChange={handleChange('costo_estimado')} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CapacitacionesDashboard;