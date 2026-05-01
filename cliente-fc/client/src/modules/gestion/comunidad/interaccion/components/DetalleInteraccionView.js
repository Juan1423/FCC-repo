import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Fade,
  Chip,
  Avatar,
  Divider,
  Stack,
  Grid,
  IconButton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../../../components/NavbarAdmin";
import Drawer from "../../../../../components/Drawer";
import comunidadService from '../../../../../services/comunidadService';
import DocumentosManager from './DocumentosManager';
import { useMenu } from '../../../../../components/base/MenuContext';
import { API_IMAGE_URL } from '../../../../../services/apiConfig';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';

const DetalleInteraccion = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interaccion, setInteraccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Detalle de Interacción');
    const fetchInteraccion = async () => {
      try {
        setLoading(true);
        const response = await comunidadService.getInteraccionById(id);
        setInteraccion(response.data);
      } catch (err) {
        setError("Error al cargar los detalles de la interacción.");
        console.error("Error fetching interaction details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInteraccion();
  }, [id, setCurrentMenu]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#2563eb' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex" }}>
        <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
        <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f8fafc' }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        </Box>
      </Box>
    );
  }

  if (!interaccion) {
    return (
      <Box sx={{ display: "flex" }}>
        <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
        <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f8fafc' }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>Interacción no encontrada.</Alert>
        </Box>
      </Box>
    );
  }

  const apiBaseUrl = (API_IMAGE_URL || 'http://localhost:5000/api/fcc').replace('/api/fcc', '');

  const getEstadoColor = (estado) => {
    return estado === 'Activa' ? 'success' : 'error';
  };

  const getTipoColor = (tipo) => {
    const colores = {
      'Reunión': '#2563eb',
      'Llamada': '#3b82f6',
      'Visita': '#1d4ed8',
      'Correo': '#1e40af',
      'Otro': '#6366f1'
    };
    return colores[tipo] || '#2563eb';
  };

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
                Detalle de Interacción
              </Typography>
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ color: "text.secondary", mb: 4, ml: 7 }}
            >
              Información detallada de la interacción comunitaria
            </Typography>
          </Box>
        </Fade>

        {/* Header Card with main info */}
        <Card elevation={3} sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#2563eb', p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'white', width: 64, height: 64 }}>
              <CategoryIcon sx={{ color: '#2563eb', fontSize: '2rem' }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                {interaccion.descripcion_interaccion}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                ID: {interaccion.id_interaccion}
              </Typography>
            </Box>
            <Chip
              label={interaccion.estado_interaccion}
              color={getEstadoColor(interaccion.estado_interaccion)}
              sx={{ fontWeight: 'bold', fontSize: '1rem', px: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/fcc-comunidad/interacciones/${id}/editar`)}
              sx={{
                bgcolor: 'white',
                color: '#2563eb',
                '&:hover': { bgcolor: '#f0f9ff' },
                borderRadius: 2,
              }}
            >
              Editar
            </Button>
          </Box>
        </Card>

        <Grid container spacing={3}>
          {/* Información General */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
              <Box sx={{ bgcolor: '#3b82f6', p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'white', mr: 2 }}>
                  <InfoIcon sx={{ color: '#3b82f6' }} />
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Información General
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon sx={{ color: '#2563eb' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Tipo</Typography>
                      <Chip
                        label={interaccion.tipo_interaccion}
                        sx={{
                          bgcolor: getTipoColor(interaccion.tipo_interaccion),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ color: '#3b82f6' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Fecha Inicio</Typography>
                      <Typography fontWeight="medium">
                        {new Date(interaccion.fecha_inicio_interaccion).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ color: '#1d4ed8' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Fecha Fin</Typography>
                      <Typography fontWeight="medium">
                        {new Date(interaccion.fecha_fin_interaccion).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon sx={{ fontSize: '1rem' }} />
                      Observaciones
                    </Typography>
                    <Typography fontWeight="medium">
                      {interaccion.observciones_interaccion || 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Archivo */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
              <Box sx={{ bgcolor: '#1d4ed8', p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'white', mr: 2 }}>
                  <AttachFileIcon sx={{ color: '#1d4ed8' }} />
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Archivo Adjunto
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                {interaccion.archivo_interaccion ? (
                  <Box>
                    {/\.(jpg|jpeg|png|gif)$/i.test(interaccion.archivo_interaccion) ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <img
                          src={`${apiBaseUrl}${interaccion.archivo_interaccion}`}
                          alt="Archivo de interacción"
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            maxHeight: '300px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        href={`${apiBaseUrl}${interaccion.archivo_interaccion}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<AttachFileIcon />}
                        sx={{
                          borderColor: '#2563eb',
                          color: '#2563eb',
                          borderRadius: 2,
                          '&:hover': { borderColor: '#1d4ed8', bgcolor: 'rgba(37, 99, 235, 0.04)' }
                        }}
                      >
                        Ver/Descargar Archivo
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No hay archivos adjuntos
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Personas Asociadas */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#1e40af', p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'white', mr: 2 }}>
                  <PeopleIcon sx={{ color: '#1e40af' }} />
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Personas Asociadas
                </Typography>
                {interaccion.personasAsociadas && (
                  <Chip
                    label={`${interaccion.personasAsociadas.length} persona(s)`}
                    sx={{ ml: 'auto', bgcolor: 'white', color: '#1e40af', fontWeight: 'bold' }}
                  />
                )}
              </Box>
              <CardContent sx={{ p: 3 }}>
                {interaccion.personasAsociadas && interaccion.personasAsociadas.length > 0 ? (
                  <Grid container spacing={2}>
                    {interaccion.personasAsociadas.map((persona, i) => (
                      <Grid item xs={12} sm={6} md={4} key={persona.id_persona}>
                        <Card elevation={1} sx={{ borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#dbeafe', color: '#1e40af' }}>
                            {persona.foto_persona ? (
                              <img
                                src={`${apiBaseUrl}/uploads/personas/${persona.foto_persona}`}
                                alt=""
                                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                              />
                            ) : (
                              <PersonIcon />
                            )}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="bold">
                              {persona.nombre_persona} {persona.apellido_persona}
                            </Typography>
                            {persona.cedula_persona && (
                              <Typography variant="caption" color="text.secondary">
                                CI: {persona.cedula_persona}
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No hay personas asociadas a esta interacción.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Documentos */}
          <Grid item xs={12}>
            <DocumentosManager interaccionId={id} />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              borderColor: '#64748b',
              color: '#64748b',
              borderRadius: 2,
              px: 3,
              py: 1,
              '&:hover': { borderColor: '#475569', bgcolor: 'rgba(100, 116, 139, 0.04)' }
            }}
          >
            Volver a Interacciones
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DetalleInteraccion;
