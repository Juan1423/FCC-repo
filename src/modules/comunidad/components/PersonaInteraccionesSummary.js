import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from "@mui/material";
import comunidadService from '../../../services/comunidadService';

const PersonaInteraccionesSummary = ({ personaId }) => {
  const [interacciones, setInteracciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInteracciones = async () => {
      try {
        setLoading(true);
        const response = await comunidadService.getInteraccionesByPersona(personaId);
        // Limit to last 3 interactions if more are returned
        setInteracciones(response.data.slice(0, 3)); 
      } catch (err) {
        setError("Error al cargar interacciones.");
        console.error("Error fetching interactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInteracciones();
  }, [personaId]);

  if (loading) {
    return <CircularProgress size={20} />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (interacciones.length === 0) {
    return <Typography variant="body2">No hay interacciones recientes.</Typography>;
  }

  return (
    <Box sx={{ mt: 1, ml: 2 }}>
      <Typography variant="subtitle2">Últimas Interacciones:</Typography>
      <List dense>
        {interacciones.map((interaccion) => (
          <ListItem key={interaccion.id_interaccion}>
            <ListItemText
              primary={interaccion.descripcion_interaccion}
              secondary={`Tipo: ${interaccion.tipo_interaccion || 'N/A'}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PersonaInteraccionesSummary;
