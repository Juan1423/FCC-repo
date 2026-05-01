import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  alpha,
  Fade,
  Divider,
  Chip,
} from "@mui/material";
import { Forum as ForumIcon } from "@mui/icons-material";
import comunidadService from '../../../../../services/comunidadService';

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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={20} sx={{ color: '#2563eb' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
  }

  if (interacciones.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          No hay interacciones recientes.
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in timeout={400}>
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1, pt: 1 }}>
          <ForumIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Últimas Interacciones
          </Typography>
          <Chip
            label={interacciones.length}
            size="small"
            sx={{
              bgcolor: alpha('#2563eb', 0.1),
              color: '#2563eb',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 20,
            }}
          />
        </Box>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          {interacciones.map((interaccion, index) => (
            <Box key={interaccion.id_interaccion}>
              <ListItem sx={{ py: 1.5, px: 2 }}>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 500, color: '#0f172a', fontSize: '0.9rem' }}>
                      {interaccion.descripcion_interaccion}
                    </Typography>
                  }
                  secondary={
                    <Chip
                      label={interaccion.tipo_interaccion || 'N/A'}
                      size="small"
                      sx={{
                        bgcolor: alpha('#2563eb', 0.08),
                        color: '#2563eb',
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        height: 20,
                        mt: 0.5,
                      }}
                    />
                  }
                />
              </ListItem>
              {index < interacciones.length - 1 && <Divider />}
            </Box>
          ))}
        </Paper>
      </Box>
    </Fade>
  );
};

export default PersonaInteraccionesSummary;
