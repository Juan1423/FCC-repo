import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Paper,
  Divider,
  Card,
  CardContent,
  Fade,
  Stack,
  Chip,
  Alert,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import NavbarAdmin from "../../../../../components/NavbarAdmin";
import Drawer from "../../../../../components/Drawer";
import comunidadService from '../../../../../services/comunidadService';
import { useMenu } from '../../../../../components/base/MenuContext';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const EditInteraccion = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [archivo, setArchivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState("Activa");
  const navigate = useNavigate();
  const { id } = useParams();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Editar Interacción');
    comunidadService.getPersonas().then((response) => {
      setPersonas(response.data);
    });

    comunidadService.getInteraccionById(id).then((response) => {
      const interaccion = response.data;
      setDescripcion(interaccion.descripcion_interaccion || "");
      setTipo(interaccion.tipo_interaccion || "");
      setFechaInicio(interaccion.fecha_inicio_interaccion ? new Date(interaccion.fecha_inicio_interaccion).toISOString().split('T')[0] : "");
      setFechaFin(interaccion.fecha_fin_interaccion ? new Date(interaccion.fecha_fin_interaccion).toISOString().split('T')[0] : "");
      setArchivo(interaccion.archivo_interaccion || "");
      setObservaciones(interaccion.observciones_interaccion || "");
      setEstado(interaccion.estado_interaccion || "Activa");
      setSelectedPersonas(interaccion.personasAsociadas ? interaccion.personasAsociadas.map(p => p.id_persona) : []);
    });
  }, [id, setCurrentMenu]);

  const handlePersonaChange = (event) => {
    const { value } = event.target;
    setSelectedPersonas(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const interaccion = {
      descripcion_interaccion: descripcion,
      tipo_interaccion: tipo,
      fecha_inicio_interaccion: fechaInicio,
      fecha_fin_interaccion: fechaFin,
      archivo_interaccion: archivo,
      observciones_interaccion: observaciones,
      estado_interaccion: estado,
      personas: selectedPersonas,
    };
    comunidadService.updateInteraccion(id, interaccion).then(() => {
      navigate(-1);
    });
  };

  const tiposInteraccion = [
    'Reunión',
    'Llamada',
    'Visita',
    'Correo',
    'Otro'
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - 240px)` },
          mt: { xs: 7, sm: 8 },
          minHeight: '100vh',
          bgcolor: '#f8fafc',
        }}
      >
        <Fade in={true} timeout={800}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{ mr: 1, color: '#2563eb' }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.5rem", md: "2.5rem" },
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Editar Interacción
              </Typography>
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ color: "text.secondary", mb: 4, ml: 7 }}
            >
              Modifica la información de la interacción comunitaria
            </Typography>
          </Box>
        </Fade>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Información General */}
            <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#2563eb', p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'white', mr: 2 }}>
                  <InfoIcon sx={{ color: '#2563eb' }} />
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Información General
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <TextField
                  label="Descripción"
                  fullWidth
                  required
                  sx={{ mb: 3 }}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Tipo de Interacción</InputLabel>
                  <Select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    label="Tipo de Interacción"
                    required
                    sx={{ borderRadius: 2 }}
                  >
                    {tiposInteraccion.map((t) => (
                      <MenuItem key={t} value={t}>
                        <Chip
                          label={t}
                          size="small"
                          sx={{
                            bgcolor: '#2563eb',
                            color: 'white',
                            mr: 1
                          }}
                        />
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1" sx={{ minWidth: 80 }}>Estado:</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={estado === 'Activa'}
                        onChange={(e) => setEstado(e.target.checked ? 'Activa' : 'Inactiva')}
                        color="primary"
                      />
                    }
                    label={
                      <Chip
                        label={estado}
                        color={estado === 'Activa' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    }
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Fechas */}
            <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#3b82f6', p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'white', mr: 2 }}>
                  <EventIcon sx={{ color: '#3b82f6' }} />
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Fechas de la Interacción
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <TextField
                    label="Fecha de Inicio"
                    type="date"
                    fullWidth
                    required
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                  <TextField
                    label="Fecha de Fin"
                    type="date"
                    fullWidth
                    required
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Personas Asociadas */}
            <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#1d4ed8', p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'white', mr: 2 }}>
                  <PeopleIcon sx={{ color: '#1d4ed8' }} />
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Personas Asociadas
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Seleccionar Personas</InputLabel>
                  <Select
                    multiple
                    value={selectedPersonas}
                    onChange={handlePersonaChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => {
                          const persona = personas.find((p) => p.id_persona === id);
                          return persona ? (
                            <Chip
                              key={id}
                              label={`${persona.nombre_persona} ${persona.apellido_persona}`}
                              size="small"
                              sx={{ bgcolor: '#dbeafe', color: '#1e40af' }}
                            />
                          ) : null;
                        })}
                      </Box>
                    )}
                    label="Seleccionar Personas"
                    sx={{ borderRadius: 2 }}
                  >
                    {personas.map((persona) => (
                      <MenuItem key={persona.id_persona} value={persona.id_persona}>
                        <Checkbox checked={selectedPersonas.indexOf(persona.id_persona) > -1} />
                        <ListItemText primary={`${persona.nombre_persona} ${persona.apellido_persona}`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedPersonas.length > 0 && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    {selectedPersonas.length} persona(s) seleccionada(s)
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Archivo y Observaciones */}
            <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#1e40af', p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'white', mr: 2 }}>
                  <DescriptionIcon sx={{ color: '#1e40af' }} />
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Documentación y Observaciones
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                {archivo && (
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachFileIcon />
                      <Typography>Archivo actual: {archivo}</Typography>
                    </Box>
                  </Alert>
                )}
                <TextField
                  label="Observaciones"
                  fullWidth
                  multiline
                  rows={4}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: '#64748b',
                  color: '#64748b',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: '#2563eb',
                  '&:hover': { bgcolor: '#1d4ed8' },
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                Guardar Cambios
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default EditInteraccion;
