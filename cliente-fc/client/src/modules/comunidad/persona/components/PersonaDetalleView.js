
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../../components/NavbarAdmin";
import Drawer from "../../../../components/Drawer";
import comunidadService from '../../../../services/comunidadService';
import { useMenu } from '../../../../components/base/MenuContext';

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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex" }}>
        <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
        <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
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
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Alert severity="info">Persona no encontrada.</Alert>
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
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            mb: 4,
            textAlign: "center",
            fontSize: { xs: "1.5rem", md: "2rem" },
            color: "primary.main",
          }}
        >
          Detalle de Persona: {persona.nombre_persona} {persona.apellido_persona}
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Información General</Typography>
          <Typography><strong>ID:</strong> {persona.id_persona}</Typography>
          <Typography><strong>Nombre:</strong> {persona.nombre_persona}</Typography>
          <Typography><strong>Apellido:</strong> {persona.apellido_persona}</Typography>
          <Typography><strong>Dirección:</strong> {persona.direccion_persona}</Typography>
          <Typography><strong>Correo:</strong> {persona.correo_persona}</Typography>
          <Typography><strong>Teléfono:</strong> {persona.telefono_persona}</Typography>
          <Typography><strong>Estado:</strong> {persona.estado_persona}</Typography>
        </Paper>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => navigate(-1)}
        >
          Volver a Personas
        </Button>
      </Box>
    </Box>
  );
};

export default PersonaDetalleView;
