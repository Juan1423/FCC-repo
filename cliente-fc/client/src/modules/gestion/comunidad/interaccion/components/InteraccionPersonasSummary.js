import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Fade,
  Paper,
} from "@mui/material";
import comunidadService from '../../../../../services/comunidadService';
import { API_IMAGE_URL } from '../../../../../services/apiConfig';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';

const InteraccionPersonasSummary = ({ interaccionId }) => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBaseUrl = (API_IMAGE_URL || 'http://localhost:5000/api/fcc').replace('/api/fcc', '');

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setLoading(true);
        const response = await comunidadService.getPersonasByInteraccion(interaccionId);
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} sx={{ color: '#2563eb' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
  }

  if (personas.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2, mt: 1 }}>
        No hay personas asociadas a esta interacción.
      </Alert>
    );
  }

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <Fade in={true} timeout={500}>
      <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #e0f2fe' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <PeopleIcon sx={{ color: '#2563eb' }} />
          <Typography variant="subtitle2" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
            Personas Asociadas ({personas.length})
          </Typography>
        </Box>
        <List dense sx={{ py: 0 }}>
          {personas.map((persona, index) => (
            <Fade in={true} timeout={300 + index * 100} key={persona.id_persona}>
              <ListItem
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  mb: 0.5,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(37, 99, 235, 0.04)',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: persona.foto_persona ? 'transparent' : '#2563eb',
                      fontSize: '0.875rem',
                      border: persona.foto_persona ? 'none' : '2px solid #93c5fd',
                    }}
                  >
                    {persona.foto_persona ? (
                      <img
                        src={`${apiBaseUrl}/uploads/personas/${persona.foto_persona}`}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      getInitials(persona.nombre_persona, persona.apellido_persona)
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="medium" sx={{ color: '#1e40af' }}>
                      {persona.nombre_persona} {persona.apellido_persona}
                    </Typography>
                  }
                  secondary={
                    persona.cedula_persona && (
                      <Typography variant="caption" color="text.secondary">
                        CI: {persona.cedula_persona}
                      </Typography>
                    )
                  }
                />
              </ListItem>
            </Fade>
          ))}
        </List>
      </Paper>
    </Fade>
  );
};

export default InteraccionPersonasSummary;
