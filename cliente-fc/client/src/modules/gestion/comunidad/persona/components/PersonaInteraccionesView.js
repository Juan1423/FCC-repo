import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fade,
  CircularProgress,
  Alert,
  alpha,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../../../components/NavbarAdmin";
import Drawer from "../../../../../components/Drawer";
import comunidadService from '../../../../../services/comunidadService';
import { useMenu } from '../../../../../components/base/MenuContext';
import ForumIcon from '@mui/icons-material/Forum';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PersonaInteracciones = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interacciones, setInteracciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Interacciones de Persona');
    setLoading(true);
    comunidadService.getInteraccionesByPersona(id)
      .then((response) => {
        setInteracciones(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar las interacciones");
        setLoading(false);
        console.error("Error fetching interactions:", err);
      });
  }, [id, setCurrentMenu]);

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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress sx={{ color: '#2563eb' }} />
        </Box>
      </Box>
    );
  }

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
                    <ForumIcon sx={{ color: 'white', fontSize: 28 }} />
                    <Box>
                      <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
                        Interacciones
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                        Historial de interacciones de la persona
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: { xs: 3, md: 5 } }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }} onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Chip
                    label={`${interacciones.length} registros`}
                    size="small"
                    sx={{
                      bgcolor: alpha('#2563eb', 0.1),
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>

                <TableContainer
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha('#2563eb', 0.04) }}>
                        <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>Descripción</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>Tipo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {interacciones.map((interaccion, index) => (
                        <TableRow
                          key={interaccion.id_interaccion}
                          sx={{
                            transition: 'all 0.2s ease',
                            bgcolor: index % 2 === 0 ? 'white' : alpha('#f8fafc', 0.5),
                            '&:hover': {
                              bgcolor: alpha('#2563eb', 0.04),
                            },
                          }}
                        >
                          <TableCell sx={{ color: '#0f172a', fontWeight: 500 }}>{interaccion.id_interaccion}</TableCell>
                          <TableCell sx={{ color: '#0f172a' }}>{interaccion.descripcion_interaccion}</TableCell>
                          <TableCell>
                            <Chip
                              label={interaccion.tipo_interaccion || 'N/A'}
                              size="small"
                              sx={{
                                bgcolor: alpha('#2563eb', 0.08),
                                color: '#2563eb',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
                  <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      border: '1px solid #e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        bgcolor: '#f8fafc',
                      },
                    }}
                  >
                    <ArrowBackIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Volver</Typography>
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default PersonaInteracciones;
