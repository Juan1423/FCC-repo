import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { getChatConfig, updateChatConfig } from '../../../services/chatService';

const CONFIG_INFO = {
  rate_limit_autenticado_diario: {
    label: 'Límite diario de preguntas (autenticados)',
    descripcion: 'Cuántas preguntas puede hacer por día un usuario con sesión iniciada. Las autenticadas suelen tener un cupo mayor que los visitantes.',
    min: 1,
  },
  rate_limit_visitante_diario: {
    label: 'Límite diario de preguntas (visitantes)',
    descripcion: 'Cuántas preguntas puede hacer por día un visitante anónimo del chat público. Al alcanzarlo, el bot bloquea la pregunta restante del día.',
    min: 1,
  },
  rate_limit_ventana_horas: {
    label: 'Ventana del límite (horas)',
    descripcion: 'Período en horas dentro del cual se cuenta el consumo del límite diario (cada visitante/identificador).',
    min: 1,
  },
  rate_persist_interval_min: {
    label: 'Persistencia del contador (minutos)',
    descripcion: 'Cada cuántos minutos se guardan en la base de datos los contadores de rate limit en memoria.',
  },
  off_topic_threshold: {
    label: 'Umbral off-topic',
    descripcion: 'Similitud mínima (0-1) para considerar que la pregunta trata de la Fundación. Muy bajo = casi todo se responde; muy alto = el bot se declara incapaz con frecuencia.',
  },
  canonical_response_threshold: {
    label: 'Umbral de respuesta canónica',
    descripcion: 'Similitud mínima (0-1) usada solo en el fallback por embeddings de respuestas canónicas. El patrón regex (patron_trigger) siempre tiene prioridad sobre este umbral.',
  },
  rag_similarity_threshold: {
    label: 'Umbral RAG',
    descripcion: 'Similitud mínima (0-1) para inyectar contexto de la base de conocimiento en la respuesta.',
  },
  max_contexto_rag_items: {
    label: 'Máx. fragmentos de contexto RAG',
    descripcion: 'Cuántos fragmentos de conocimiento se inyectan como contexto en el prompt.',
    min: 1,
  },
  feedback_threshold: {
    label: 'Umbral de feedback negativo',
    descripcion: 'Calificación mínima (1-5) a partir de la cual el feedback se considera negativo y puede marcar la conversación para aprendizaje. Umbral bajo = menos revisiones; alto = más revisiones.',
    min: 1,
    max: 5,
  },
  min_respuesta_length: {
    label: 'Longitud mínima de respuesta (en palabras)',
    descripcion: 'Respuestas más cortas que este número de palabras se marcan para revisión de aprendizaje. Se cuentan palabras separadas por espacios, no tokens ni caracteres.',
    min: 1,
  },
  max_respuesta_length: {
    label: 'Longitud máxima de respuesta (en palabras)',
    descripcion: 'Respuestas más largas que este número de palabras se marcan para revisión. Se cuentan palabras, no tokens: la columna Tokens del historial es información aparte.',
    min: 1,
  },
  enable_learning_queue: {
    label: 'Habilitar cola de aprendizaje',
    descripcion: 'Si está activo, el chatbot marca conversaciones (off-topic, respuestas cortas/largas, temas sensibles) para revisarlas en la pestaña Aprendizaje. Apagado = no se generan revisiones nuevas.',
  },
  sensitive_check_first: {
    label: 'Verificar temas sensibles primero',
    descripcion: 'Si está activo, la detección de temas sensibles (violencia, suicidio, ansiedad) se evalúa antes que la clasificación off-topic.',
  },
};

const configInfo = (key) => CONFIG_INFO[key] || { label: key.replace(/_/g, ' '), descripcion: '' };

const GuardrailsConfig = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    const resp = await getChatConfig();
    if (resp?.success && resp.data) {
      setConfig(resp.data);
    }
    setLoading(false);
  };

  const handleChange = (clave, valor, isNumber = false) => {
    setConfig({ ...config, [clave]: isNumber && valor !== '' ? Number(valor) : valor });
  };

  const handleGuardar = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      for (const [clave, valor] of Object.entries(config)) {
        await updateChatConfig(clave, String(valor));
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      console.error('Error guardando config:', msg);
      setErrorMsg(`No se pudieron guardar todos los cambios: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const configKeys = Object.keys(CONFIG_INFO);
  const booleanKeys = configKeys.filter((k) => typeof config[k] === 'boolean');
  const numberKeys = configKeys.filter((k) => typeof config[k] === 'number');

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
          Controles (activar / desactivar)
        </Typography>
        <Box>
          <Grid container spacing={2}>
            {booleanKeys.length === 0 && (
              <Grid item xs={12}>
                <Typography color="text.secondary">No hay opciones booleanas disponibles.</Typography>
              </Grid>
            )}
            {booleanKeys.map((clave) => (
              <Grid item xs={12} md={6} key={clave}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={Boolean(config[clave])}
                      onChange={(e) => handleChange(clave, e.target.checked)}
                    />
                  }
                  label={configInfo(clave).label}
                />
                {configInfo(clave).descripcion && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {configInfo(clave).descripcion}
                  </Typography>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Umbrales y límites
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {numberKeys.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary">No hay valores numéricos disponibles.</Typography>
            </Grid>
          )}
          {numberKeys.map((clave) => (
            <Grid item xs={12} sm={6} md={4} key={clave}>
              <TextField
                label={configInfo(clave).label}
                type="number"
                size="small"
                margin="dense"
                fullWidth
                inputProps={{
                  min: configInfo(clave).min,
                  max: configInfo(clave).max,
                  step: configInfo(clave).step || (clave.includes('threshold') ? '0.01' : '1'),
                }}
                value={config[clave] ?? ''}
                onChange={(e) => handleChange(clave, e.target.value, true)}
              />
              {configInfo(clave).descripcion && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {configInfo(clave).descripcion}
                </Typography>
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Button variant="contained" disabled={saving} onClick={handleGuardar}>
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </Box>
  );
};

export default GuardrailsConfig;