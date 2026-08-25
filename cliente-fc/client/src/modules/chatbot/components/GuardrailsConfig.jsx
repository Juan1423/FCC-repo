import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
} from '@mui/material';
import { getChatConfig, updateChatConfig } from '../../../services/chatService';

const GuardrailsConfig = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    const resp = await getChatConfig();
    if (resp?.success && resp.data) {
      if (Array.isArray(resp.data)) {
        const obj = {};
        resp.data.forEach((r) => {
          obj[r.clave] = r.tipo === 'boolean' ? r.valor === 'true' : r.valor;
        });
        setConfig(obj);
      } else {
        setConfig(resp.data);
      }
    }
    setLoading(false);
  };

  const handleChange = (clave, valor) => {
    setConfig({ ...config, [clave]: valor });
  };

  const handleGuardar = async () => {
    for (const [clave, valor] of Object.entries(config)) {
      const v = typeof valor === 'boolean' ? String(valor) : valor;
      await updateChatConfig(clave, v);
    }
  };

  const booleanKeys = ['off_topic_enabled', 'sensitive_enabled', 'learning_enabled'];
  const numberKeys = ['canonical_response_threshold', 'embedding_threshold'];

  if (loading) {
    return <Typography>Cargando configuración...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configuración de Guardrails
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Los guardrails controlan el comportamiento del chatbot: detección de temas sensibles,
        clasificación off-topic y sistema de aprendizaje. Los umbrales determinan la sensibilidad de cada filtro.
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Booleanos
        </Typography>
        <FormGroup>
          {booleanKeys.map(
            (clave) =>
              config[clave] !== undefined && (
                <FormControlLabel
                  key={clave}
                  control={
                    <Switch
                      checked={Boolean(config[clave])}
                      onChange={(e) => handleChange(clave, e.target.checked)}
                    />
                  }
                  label={clave.replace(/_/g, ' ')}
                />
              )
          )}
        </FormGroup>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Umbrales
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {numberKeys.map(
          (clave) =>
            config[clave] !== undefined && (
              <TextField
                key={clave}
                label={clave.replace(/_/g, ' ')}
                type="number"
                value={config[clave] || ''}
                onChange={(e) => handleChange(clave, e.target.value)}
                fullWidth
                margin="normal"
              />
            )
        )}
      </Paper>

      <Button variant="contained" onClick={handleGuardar}>
        Guardar cambios
      </Button>
    </Box>
  );
};

export default GuardrailsConfig;
