import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Collapse,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Stack,
  Fade,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../../../components/NavbarAdmin";
import Drawer from "../../../../../components/Drawer";
import comunidadService from '../../../../../services/comunidadService';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMenu } from '../../../../../components/base/MenuContext';
import PersonaInteraccionesSummary from '../components/PersonaInteraccionesSummary';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

const Personas = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [expandedPersonId, setExpandedPersonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();
  const theme = useTheme();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const fetchPersonas = () => {
    setLoading(true);
    comunidadService.getPersonas().then((response) => {
      setPersonas(response.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    setCurrentMenu('Personas');
    fetchPersonas();
  }, [setCurrentMenu]);

  const handleExpandClick = (personId) => {
    setExpandedPersonId(expandedPersonId === personId ? null : personId);
  };

  const handleDeleteClick = (persona) => {
    setPersonToDelete(persona);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (personToDelete) {
      comunidadService.deletePersona(personToDelete.id_persona).then(() => {
        setDeleteDialogOpen(false);
        setPersonToDelete(null);
        fetchPersonas();
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPersonToDelete(null);
  };

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  const getEstadoColor = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'activo': return { bg: alpha('#10b981', 0.15), color: '#059669', border: alpha('#10b981', 0.3) };
      case 'inactivo': return { bg: alpha('#ef4444', 0.15), color: '#dc2626', border: alpha('#ef4444', 0.3) };
      default: return { bg: alpha('#6b7280', 0.15), color: '#4b5563', border: alpha('#6b7280', 0.3) };
    }
  };

  return (
    <Box sx={{ display: "flex", bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 5 },
          width: { md: `calc(100% - 240px)` },
          mt: { xs: 7, sm: 8 },
        }}
      >
        <Fade in timeout={800}>
          <Box>
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                }}
              >
                <PersonIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  Personas de la Comunidad
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    mt: 0.5,
                    fontSize: '0.9rem',
                  }}
                >
                  Gestiona la información de las personas registradas
                </Typography>
              </Box>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
                boxShadow: '0 20px 60px rgba(37, 99, 235, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', mb: 0.5 }}>
                    Total de personas registradas
                  </Typography>
                  <Typography sx={{ color: 'white', fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
                    {loading ? <Skeleton width={80} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} /> : personas.length}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/fcc-comunidad/personas/nueva")}
                sx={{
                  bgcolor: 'white',
                  color: '#2563eb',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: '#eff6ff',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
                >
                  Agregar Persona
                </Button>
              </Box>
            </Paper>

            <Stack spacing={2}>
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <Paper key={idx} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton variant="circular" width={48} height={48} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="40%" />
                        <Skeleton width="60%" />
                      </Box>
                    </Box>
                  </Paper>
                ))
              ) : (
                personas.map((persona, index) => {
                  const estadoStyle = getEstadoColor(persona.estado_persona);
                  return (
                    <Fade in timeout={300 + index * 100} key={persona.id_persona}>
                      <Paper
                        elevation={0}
                        sx={{
                          borderRadius: 3,
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#2563eb',
                            boxShadow: '0 8px 30px rgba(37, 99, 235, 0.12)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Box sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                bgcolor: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                              }}
                            >
                              {getInitials(persona.nombre_persona, persona.apellido_persona)}
                            </Avatar>

                            <Box sx={{ flex: 1, minWidth: 200 }}>
                              <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#0f172a' }}>
                                {persona.nombre_persona} {persona.apellido_persona}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 3, mt: 0.5, flexWrap: 'wrap' }}>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                  {persona.correo_persona}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                  {persona.telefono_persona}
                                </Typography>
                              </Box>
                            </Box>

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

                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/fcc-comunidad/personas/${persona.id_persona}/detalles`)}
                              sx={{
                                bgcolor: alpha('#2563eb', 0.1),
                                color: '#2563eb',
                                '&:hover': { bgcolor: alpha('#2563eb', 0.2) },
                              }}
                              title="Ver detalles"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/fcc-comunidad/personas/${persona.id_persona}/editar`)}
                              sx={{
                                bgcolor: alpha('#2563eb', 0.1),
                                color: '#2563eb',
                                '&:hover': { bgcolor: alpha('#2563eb', 0.2) },
                              }}
                              title="Editar"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(persona)}
                                sx={{
                                  bgcolor: alpha('#ef4444', 0.1),
                                  color: '#ef4444',
                                  '&:hover': { bgcolor: alpha('#ef4444', 0.2) },
                                }}
                                title="Eliminar"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleExpandClick(persona.id_persona)}
                              sx={{
                                bgcolor: expandedPersonId === persona.id_persona ? '#2563eb' : alpha('#2563eb', 0.1),
                                color: expandedPersonId === persona.id_persona ? 'white' : '#2563eb',
                                transition: 'all 0.3s ease',
                                transform: expandedPersonId === persona.id_persona ? 'rotate(180deg)' : 'none',
                                '&:hover': {
                                  bgcolor: expandedPersonId === persona.id_persona ? '#1d4ed8' : alpha('#2563eb', 0.2),
                                },
                              }}
                              >
                                <ExpandLessIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>

                        <Collapse in={expandedPersonId === persona.id_persona} timeout="auto" unmountOnExit>
                          <Box
                            sx={{
                              px: 3,
                              pb: 3,
                              pt: 0,
                              borderTop: '1px solid #e2e8f0',
                              bgcolor: alpha('#eff6ff', 0.5),
                            }}
                          >
                            <PersonaInteraccionesSummary personaId={persona.id_persona} />
                          </Box>
                        </Collapse>
                      </Paper>
                    </Fade>
                  );
                })
              )}
            </Stack>
          </Box>
        </Fade>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: 1,
              maxWidth: 420,
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: alpha('#ef4444', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DeleteIcon sx={{ color: '#ef4444', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Confirmar Eliminación
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <DialogContentText sx={{ color: '#64748b', fontSize: '0.95rem' }}>
              ¿Estás seguro de que deseas eliminar a{' '}
              <Box component="span" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {personToDelete?.nombre_persona} {personToDelete?.apellido_persona}
              </Box>
              ? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={handleDeleteCancel}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                borderColor: '#e2e8f0',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  bgcolor: '#f8fafc',
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              autoFocus
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                bgcolor: '#ef4444',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                '&:hover': {
                  bgcolor: '#dc2626',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(239, 68, 68, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Personas;
