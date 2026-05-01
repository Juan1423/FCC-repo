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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../../../components/NavbarAdmin";
import Drawer from "../../../../../components/Drawer";
import comunidadService from '../../../../../services/comunidadService';
import { useMenu } from '../../../../../components/base/MenuContext';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddInteraccion = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState("Activa");
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Agregar Interacción');
    comunidadService.getPersonas().then((response) => {
      setPersonas(response.data);
    });
  }, [setCurrentMenu]);

  const handlePersonaChange = (event) => {
    const { value } = event.target;
    setSelectedPersonas(typeof value === 'string' ? value.split(',') : value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('descripcion_interaccion', descripcion);
    formData.append('tipo_interaccion', tipo);
    formData.append('fecha_inicio_interaccion', fechaInicio);
    formData.append('fecha_fin_interaccion', fechaFin);
    formData.append('observciones_interaccion', observaciones);
    formData.append('estado_interaccion', estado);
    selectedPersonas.forEach(id => formData.append('personas[]', id));
    if (selectedFile) {
      formData.append('archivo_interaccion', selectedFile);
    }

    comunidadService.createInteraccion(formData).then(() => {
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
                Agregar Interacción
              </Typography>
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ color: "text.secondary", mb: 4, ml: 7 }}
            >
              Completa la información para registrar una nueva interacción comunitaria
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
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    label="Estado"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Activa">
                      <Chip label="Activa" color="success" size="small" sx={{ mr: 1 }} />
                      Activa
                    </MenuItem>
                    <MenuItem value="Inactiva">
                      <Chip label="Inactiva" color="error" size="small" sx={{ mr: 1 }} />
                      Inactiva
                    </MenuItem>
                  </Select>
                </FormControl>
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
                <Box sx={{ mb: 3, p: 3, border: '2px dashed #93c5fd', borderRadius: 2, textAlign: 'center' }}>
                  <input
                    type="file"
                    id="file-upload"
                    hidden
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFileIcon />}
                      sx={{
                        borderColor: '#2563eb',
                        color: '#2563eb',
                        borderRadius: 2,
                        '&:hover': { borderColor: '#1d4ed8', bgcolor: 'rgba(37, 99, 235, 0.04)' }
                      }}
                    >
                      {selectedFile ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
                    </Button>
                  </label>
                  {selectedFile && (
                    <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                      Archivo seleccionado: {selectedFile.name}
                    </Alert>
                  )}
                </Box>
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
                Guardar Interacción
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default AddInteraccion;
