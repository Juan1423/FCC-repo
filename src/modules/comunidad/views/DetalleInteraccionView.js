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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../components/NavbarAdmin";
import Drawer from "../../../components/Drawer";
import comunidadService from '../../../services/comunidadService';
import { useMenu } from '../../../components/base/MenuContext';
import { API_IMAGE_URL } from '../../../services/apiConfig';

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

  if (!interaccion) {
    return (
      <Box sx={{ display: "flex" }}>
        <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
        <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Alert severity="info">Interacción no encontrada.</Alert>
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
          Detalle de Interacción: {interaccion.descripcion_interaccion}
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Información General</Typography>
          <Typography><strong>ID:</strong> {interaccion.id_interaccion}</Typography>
          <Typography><strong>Descripción:</strong> {interaccion.descripcion_interaccion}</Typography>
          <Typography><strong>Tipo:</strong> {interaccion.tipo_interaccion}</Typography>
          <Typography><strong>Fecha Inicio:</strong> {new Date(interaccion.fecha_inicio_interaccion).toLocaleString()}</Typography>
          <Typography><strong>Fecha Fin:</strong> {new Date(interaccion.fecha_fin_interaccion).toLocaleString()}</Typography>
          
          <Typography component="div" sx={{ mt: 2, mb: 2 }}>
            <strong>Archivo:</strong>
            {interaccion.archivo_interaccion ? (
              <Box sx={{ mt: 1 }}>
                {/\.(jpg|jpeg|png|gif)$/i.test(interaccion.archivo_interaccion) ? (
                  <img 
                    src={`${(API_IMAGE_URL || 'http://localhost:5000/api/fcc').replace('/api/fcc', '')}${interaccion.archivo_interaccion}`} 
                    alt="Archivo de interacción" 
                    style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px' }} 
                  />
                ) : (
                  <a 
                    href={`${(API_IMAGE_URL || 'http://localhost:5000/api/fcc').replace('/api/fcc', '')}${interaccion.archivo_interaccion}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Ver/Descargar Archivo
                  </a>
                )}
              </Box>
            ) : (
              ' N/A'
            )}
          </Typography>

          <Typography><strong>Observaciones:</strong> {interaccion.observciones_interaccion || 'N/A'}</Typography>
          <Typography><strong>Estado:</strong> {interaccion.estado_interaccion}</Typography>
        </Paper>

        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: "bold",
            mb: 3,
            color: "primary.main",
          }}
        >
          Personas Asociadas
        </Typography>

        {interaccion.personasAsociadas && interaccion.personasAsociadas.length > 0 ? (
          <Paper sx={{ p: 3 }}>
            <List>
              {interaccion.personasAsociadas.map((persona, i) => (
                <ListItem key={persona.id_persona}>
                  <ListItemText
                    primary={`${i + 1}. ${persona.nombre_persona} ${persona.apellido_persona}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          <Typography>No hay personas asociadas a esta interacción.</Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => navigate(-1)}
        >
          Volver a Interacciones
        </Button>
      </Box>
    </Box>
  );
};

export default DetalleInteraccion;
