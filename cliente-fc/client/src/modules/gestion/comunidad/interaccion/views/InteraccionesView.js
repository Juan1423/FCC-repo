import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  Avatar,
  Stack,
  Divider,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../../../components/NavbarAdmin";
import Drawer from "../../../../../components/Drawer";
import comunidadService from '../../../../../services/comunidadService';
import { useMenu } from '../../../../../components/base/MenuContext';
import InteraccionPersonasSummary from '../components/InteraccionPersonasSummary';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';

const Interacciones = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interacciones, setInteracciones] = useState([]);
  const [expandedInteraccionId, setExpandedInteraccionId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [interaccionToDelete, setInteraccionToDelete] = useState(null);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const fetchInteracciones = () => {
    comunidadService.getInteracciones().then((response) => {
      setInteracciones(response.data);
    });
  };

  useEffect(() => {
    setCurrentMenu('Interacciones');
    fetchInteracciones();
  }, [setCurrentMenu]);

  const handleExpandClick = (interaccionId) => {
    setExpandedInteraccionId(expandedInteraccionId === interaccionId ? null : interaccionId);
  };

  const handleDeleteClick = (id) => {
    setInteraccionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (interaccionToDelete) {
      comunidadService.deleteInteraccion(interaccionToDelete).then(() => {
        fetchInteracciones();
        setDeleteDialogOpen(false);
        setInteraccionToDelete(null);
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInteraccionToDelete(null);
  };

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
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                mb: 1,
                textAlign: "center",
                fontSize: { xs: "1.5rem", md: "2.5rem" },
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Interacciones de la Comunidad
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                textAlign: "center",
                color: "text.secondary",
                mb: 4,
              }}
            >
              Gestiona las interacciones y actividades comunitarias
            </Typography>
          </Box>
        </Fade>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Chip
            label={`Total: ${interacciones.length} interacciones`}
            color="primary"
            sx={{ fontWeight: 'bold', fontSize: '1rem', px: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<EventIcon />}
            sx={{
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
            onClick={() => navigate("/fcc-comunidad/interacciones/nueva")}
          >
            Agregar Interacción
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {interacciones.map((interaccion, index) => (
            <Fade in={true} timeout={300 + index * 100} key={interaccion.id_interaccion}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: expandedInteraccionId === interaccion.id_interaccion ? '#2563eb' : 'grey.200',
                  '&:hover': {
                    elevation: 8,
                    borderColor: '#3b82f6',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: '#2563eb',
                          width: 56,
                          height: 56,
                          fontSize: '1.5rem',
                        }}
                      >
                        <CategoryIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="#1e40af">
                          {interaccion.descripcion_interaccion}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {interaccion.id_interaccion}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={interaccion.estado_interaccion}
                      color={getEstadoColor(interaccion.estado_interaccion)}
                      size="small"
                      sx={{ fontWeight: 'bold', borderRadius: 1 }}
                    />
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <Chip
                      icon={<CategoryIcon />}
                      label={interaccion.tipo_interaccion}
                      sx={{
                        bgcolor: getTipoColor(interaccion.tipo_interaccion),
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: 1,
                      }}
                    />
                    <Chip
                      icon={<EventIcon />}
                      label={`Inicio: ${new Date(interaccion.fecha_inicio_interaccion).toLocaleDateString()}`}
                      variant="outlined"
                      sx={{ borderRadius: 1, borderColor: '#2563eb', color: '#2563eb' }}
                    />
                    <Chip
                      icon={<EventIcon />}
                      label={`Fin: ${new Date(interaccion.fecha_fin_interaccion).toLocaleDateString()}`}
                      variant="outlined"
                      sx={{ borderRadius: 1, borderColor: '#1d4ed8', color: '#1d4ed8' }}
                    />
                  </Stack>
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
                  <Box>
                    <IconButton
                      onClick={() => handleExpandClick(interaccion.id_interaccion)}
                      sx={{
                        color: '#2563eb',
                        transition: 'transform 0.3s',
                        transform: expandedInteraccionId === interaccion.id_interaccion ? 'rotate(180deg)' : 'none',
                      }}
                    >
                      {expandedInteraccionId === interaccion.id_interaccion ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Typography variant="caption" color="text.secondary">
                      {expandedInteraccionId === interaccion.id_interaccion ? 'Ocultar personas' : 'Ver personas asociadas'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      sx={{
                        borderColor: '#2563eb',
                        color: '#2563eb',
                        borderRadius: 2,
                        '&:hover': { borderColor: '#1d4ed8', bgcolor: 'rgba(37, 99, 235, 0.04)' },
                      }}
                      onClick={() => navigate(`/fcc-comunidad/interacciones/${interaccion.id_interaccion}/detalles`)}
                    >
                      Detalles
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      sx={{
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        borderRadius: 2,
                        '&:hover': { borderColor: '#2563eb', bgcolor: 'rgba(59, 130, 246, 0.04)' },
                      }}
                      onClick={() => navigate(`/fcc-comunidad/interacciones/${interaccion.id_interaccion}/editar`)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon />}
                      sx={{
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        borderRadius: 2,
                        '&:hover': { borderColor: '#dc2626', bgcolor: 'rgba(239, 68, 68, 0.04)' },
                      }}
                      onClick={() => handleDeleteClick(interaccion.id_interaccion)}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </CardActions>

                {expandedInteraccionId === interaccion.id_interaccion && (
                  <Box sx={{ px: 3, pb: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <InteraccionPersonasSummary interaccionId={interaccion.id_interaccion} />
                  </Box>
                )}
              </Card>
            </Fade>
          ))}
        </Box>

        {interacciones.length === 0 && (
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
            <InfoIcon sx={{ fontSize: 60, color: '#93c5fd', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No hay interacciones registradas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Comienza agregando una nueva interacción
            </Typography>
          </Paper>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          PaperProps={{
            sx: { borderRadius: 3, p: 1 }
          }}
        >
          <DialogTitle sx={{ color: '#dc2626', fontWeight: 'bold' }}>
            ¿Eliminar interacción?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Esta acción no se puede deshacer. Se eliminará permanentemente la interacción y sus registros asociados.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={handleDeleteCancel}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              sx={{
                bgcolor: '#dc2626',
                '&:hover': { bgcolor: '#b91c1c' },
                borderRadius: 2,
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

export default Interacciones;
