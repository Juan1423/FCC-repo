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
  memory_enabled: {
    label: 'Memoria de conversación',
    descripcion: 'Incluye las últimas preguntas/respuestas de la sesión como contexto. En el chat público anónimo solo aplica si el visitante aceptó los términos (consentimiento).',
  },
  memory_max_turnos: {
    label: 'Máx. turnos previos en memoria',
    descripcion: 'Cuántos turnos anteriores (pregunta+respuesta) se inyectan como historial en el prompt. Aplica a sesiones con memoria habilitada.',
    min: 1,
    max: 10,
  },
  chunk_size: {
    label: 'Tamaño de fragmento al indexar PDFs',
    descripcion: 'Caracteres por fragmento al subir NUEVOS PDFs. Cambiar el valor no re-indexa los ya cargados: borre y vuelva a subir el documento para aplicar. Mín. 100.',
    min: 100,
  },
  chunk_overlap: {
    label: 'Solapamiento entre fragmentos',
    descripcion: 'Caracteres de solape entre fragmentos consecutivos al indexar NUEVOS PDFs. Debe ser menor que chunk_size (se ajusta automáticamente).',
    min: 0,
  },
  ocr_enabled: {
    label: 'OCR automático en PDFs escaneados',
    descripcion: 'Si un PDF no tiene texto legible al subirse, el bot intenta extraerlo con OCR (Tesseract). Desactívalo si prefieres control manual y errores explícitos.',
  },
};

const configInfo = (key) => CONFIG_INFO[key] || { label: key.replace(/_/g, ' '), descripcion: '' };

const DEFAULT_CONFIG = {
  rate_limit_autenticado_diario: 50,
  rate_limit_visitante_diario: 5,
  rate_limit_ventana_horas: 24,
  off_topic_threshold: 0.3,
  canonical_response_threshold: 0.85,
  rag_similarity_threshold: 0.55,
  max_contexto_rag_items: 3,
  feedback_threshold: 2,
  min_respuesta_length: 10,
  max_respuesta_length: 100,
  enable_learning_queue: true,
  sensitive_check_first: true,
  memory_enabled: true,
  memory_max_turnos: 4,
  chunk_size: 1000,
  chunk_overlap: 200,
  ocr_enabled: true,
};

const NUMBER_KEYS = Object.keys(CONFIG_INFO).filter(
  (k) => CONFIG_INFO[k].min !== undefined || CONFIG_INFO[k].max !== undefined || k.includes('threshold')
);
const BOOLEAN_KEYS = Object.keys(CONFIG_INFO).filter(
  (k) => !NUMBER_KEYS.includes(k)
);

const GuardrailsConfig = () => {
  const [config, setConfig] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    cargarConfig();
  }, []);

  const seedValues = (valores) => {
    const nextConfig = { ...valores };
    const nextInputValues = {};
    for (const k of NUMBER_KEYS) {
      nextInputValues[k] = valores[k] !== undefined && valores[k] !== null ? String(valores[k]) : '';
    }
    setConfig(nextConfig);
    setInputValues(nextInputValues);
  };

  const cargarConfig = async () => {
    const resp = await getChatConfig();
    if (resp?.success && resp.data) {
      seedValues(resp.data);
    }
    setLoading(false);
  };

  const handleRestaurarDefault = () => {
    if (window.confirm('¿Restaurar todos los valores por defecto de los guardrails? Los cambios sin guardar se perderán.')) {
      seedValues(DEFAULT_CONFIG);
    }
  };

  const handleChange = (clave, valor) => {
    setInputValues((prev) => ({ ...prev, [clave]: valor }));
    if (valor === '') {
      setConfig((prev) => ({ ...prev, [clave]: '' }));
      return;
    }
    if (BOOLEAN_KEYS.includes(clave)) {
      setConfig((prev) => ({ ...prev, [clave]: valor }));
      return;
    }
    const num = Number(valor);
    if (!Number.isNaN(num)) {
      setConfig((prev) => ({ ...prev, [clave]: num }));
    }
  };

  const handleBlur = (clave) => {
    const raw = inputValues[clave];
    if (raw === '' || raw === undefined) return;
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    const info = CONFIG_INFO[clave];
    let clamped = num;
    if (info.min !== undefined && clamped < info.min) clamped = info.min;
    if (info.max !== undefined && clamped > info.max) clamped = info.max;
    setConfig((prev) => ({ ...prev, [clave]: clamped }));
    setInputValues((prev) => ({ ...prev, [clave]: String(clamped) }));
  };

  const handleGuardar = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const entries = Object.entries(config).filter(([, v]) => v !== '' && v !== undefined && v !== null);
      for (const [clave, valor] of entries) {
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
            {BOOLEAN_KEYS.length === 0 && (
              <Grid item xs={12}>
                <Typography color="text.secondary">No hay opciones booleanas disponibles.</Typography>
              </Grid>
            )}
            {BOOLEAN_KEYS.map((clave) => (
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
          {NUMBER_KEYS.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary">No hay valores numéricos disponibles.</Typography>
            </Grid>
          )}
          {NUMBER_KEYS.map((clave) => (
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
                value={inputValues[clave] ?? ''}
                onChange={(e) => handleChange(clave, e.target.value)}
                onBlur={() => handleBlur(clave)}
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

      <Button
        variant="contained"
        disabled={saving || loading}
        onClick={handleGuardar}
        sx={{ mr: 2 }}
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
      <Button
        variant="outlined"
        color="warning"
        disabled={saving || loading}
        onClick={handleRestaurarDefault}
      >
        Restaurar por defecto
      </Button>
    </Box>
  );
};

export default GuardrailsConfig;