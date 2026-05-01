
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Grid,
  Fade,
  Card,
  CardContent,
  Divider,
  Stack,
  IconButton,
  alpha,
  Skeleton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../../../components/NavbarAdmin";
import Drawer from "../../../../../components/Drawer";
import comunidadService from '../../../../../services/comunidadService';
import { useMenu } from '../../../../../components/base/MenuContext';
import PersonaInteraccionesSummary from './PersonaInteraccionesSummary';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import ForumIcon from '@mui/icons-material/Forum';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PersonaDetalleView = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Detalle de Persona');
    const fetchPersona = async () => {
      try {
        setLoading(true);
        const response = await comunidadService.getPersonaById(id);
        setPersona(response.data);
      } catch (err) {
        setError("Error al cargar los detalles de la persona.");
        console.error("Error fetching person details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersona();
  }, [id, setCurrentMenu]);

  const getEstadoColor = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'activo': return { bg: alpha('#10b981', 0.15), color: '#059669', border: alpha('#10b981', 0.3) };
      case 'inactivo': return { bg: alpha('#ef4444', 0.15), color: '#dc2626', border: alpha('#ef4444', 0.3) };
      default: return { bg: alpha('#6b7280', 0.15), color: '#4b5563', border: alpha('#6b7280', 0.3) };
    }
  };

  if (loading) {
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
            bgcolor: '#f8fafc',
            minHeight: '100vh',
          }}
        >
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3, mb: 3 }} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex" }}>
        <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
        <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f8fafc' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  if (!persona) {
    return (
      <Box sx={{ display: "flex" }}>
        <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
        <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f8fafc' }}>
          <Alert severity="info">Persona no encontrada.</Alert>
        </Box>
      </Box>
    );
  }

  const estadoStyle = getEstadoColor(persona.estado_persona);
  const initials = `${persona.nombre_persona?.charAt(0) || ''}${persona.apellido_persona?.charAt(0) || ''}`.toUpperCase();

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
          bgcolor: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        <Fade in timeout={600}>
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
                  p: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                  <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PersonIcon sx={{ color: 'white', fontSize: 28 }} />
                    <Box>
                      <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
                        Detalles de Persona
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                        {persona.nombre_persona} {persona.apellido_persona}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: { xs: 3, md: 5 } }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        border: '3px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                        position: 'relative',
                      }}
                    >
                      {persona.foto_persona ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/personas/${persona.foto_persona}`}
                          alt="Foto"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          bgcolor: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '2.5rem',
                          display: persona.foto_persona ? 'none' : 'flex',
                        }}
                      >
                        {initials}
                      </Avatar>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Información General
                        </Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <BadgeIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                ID
                              </Typography>
                              <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                                {persona.id_persona}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PersonIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                Nombre Completo
                              </Typography>
                              <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                                {persona.nombre_persona} {persona.apellido_persona}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <EmailIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                Correo Electrónico
                              </Typography>
                              <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                                {persona.correo_persona}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PhoneIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                Teléfono
                              </Typography>
                              <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                                {persona.telefono_persona}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LocationOnIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                Dirección
                              </Typography>
                              <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                                {persona.direccion_persona}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                bgcolor: estadoStyle.bg,
                                border: `2px solid ${estadoStyle.border}`,
                              }}
                            />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                Estado
                              </Typography>
                              <Chip
                                label={persona.estado_persona}
                                size="small"
                                sx={{
                                  bgcolor: estadoStyle.bg,
                                  color: estadoStyle.color,
                                  border: `1px solid ${estadoStyle.border}`,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  borderRadius: 2,
                                }}
                              />
                            </Box>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<ForumIcon />}
                      onClick={() => navigate(`/fcc-comunidad/personas/${persona.id_persona}/interacciones`)}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 32px rgba(37, 99, 235, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Ver Todas las Interacciones
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        bgcolor: '#f8fafc',
                      },
                    }}
                  >
                    Volver a Personas
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default PersonaDetalleView;
