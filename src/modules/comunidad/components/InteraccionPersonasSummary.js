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

const InteraccionPersonasSummary = ({ interaccionId }) => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setLoading(true);
        const response = await comunidadService.getPersonasByInteraccion(interaccionId);
        // Limit to last 3 personas if more are returned
        setPersonas(response.data.slice(0, 3)); 
      } catch (err) {
        setError("Error al cargar personas asociadas.");
        console.error("Error fetching associated personas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, [interaccionId]);

  if (loading) {
    return <CircularProgress size={20} />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (personas.length === 0) {
    return <Typography variant="body2">No hay personas asociadas recientemente.</Typography>;
  }

  return (
    <Box sx={{ mt: 1, ml: 2 }}>
      <Typography variant="subtitle2">Últimas Personas Asociadas:</Typography>
      <List dense>
        {personas.map((persona) => (
          <ListItem key={persona.id_persona}>
            <ListItemText
              primary={`${persona.nombre_persona} ${persona.apellido_persona}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default InteraccionPersonasSummary;
