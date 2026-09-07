import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  RemoveCircleOutline as RemoveIcon,
} from '@mui/icons-material';
import {
  getFundacionConfig,
  updateFundacionConfig,
} from '../../../services/chatService';

const SERVICIO_KEYS = ['medicina', 'especialidades', 'laboratorio', 'terapias', 'telemedicina'];
const SERVICIO_LABELS = {
  medicina: 'Medicina General',
  especialidades: 'Especialidades Médicas',
  laboratorio: 'Laboratorio Clínico',
  terapias: 'Terapias y Rehabilitación',
  telemedicina: 'Telemedicina',
};
const PROGRAMA_KEYS = ['preventivo', 'nutricion', 'bienestar', 'educacion'];
const PROGRAMA_LABELS = {
  preventivo: 'Programa Preventivo',
  nutricion: 'Programa de Nutrición',
  bienestar: 'Programa de Bienestar Mental',
  educacion: 'Programa Educativo',
};
const VALOR_KEYS = [
  ['compasion', 'Compasión'],
  ['excelencia', 'Excelencia'],
  ['integridad', 'Integridad'],
  ['inclusión', 'Inclusión'],
  ['responsabilidad', 'Responsabilidad'],
];
const REDES_KEYS = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['twitter', 'Twitter'],
  ['whatsapp', 'WhatsApp'],
];

const clone = (obj) => JSON.parse(JSON.stringify(obj));

const FundacionConfig = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const resp = await getFundacionConfig();
      if (resp?.success) {
        setProfile(resp.data);
      } else {
        setMessage({ severity: 'error', text: resp?.message || 'No se pudo cargar el perfil' });
      }
    } catch (e) {
      console.error('Error cargando perfil de fundación:', e);
      setMessage({ severity: 'error', text: e.message || 'Error al cargar el perfil' });
    }
    setLoading(false);
  };

  const updatePath = (path, value) => {
    setProfile((prev) => {
      const keys = path.split('.');
      const next = clone(prev);
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateSucursal = (index, field, value) => {
    setProfile((prev) => {
      const next = clone(prev);
      next.ubicaciones.sucursales[index][field] = value;
      return next;
    });
  };

  const addSucursal = () => {
    setProfile((prev) => {
      const next = clone(prev);
      next.ubicaciones.sucursales.push({ ciudad: '', tipo: '' });
      return next;
    });
  };

  const removeSucursal = (index) => {
    setProfile((prev) => {
      const next = clone(prev);
      next.ubicaciones.sucursales.splice(index, 1);
      return next;
    });
  };

  const updateCertificacion = (index, value) => {
    setProfile((prev) => {
      const next = clone(prev);
      next.fondacion.certificaciones[index] = value;
      return next;
    });
  };

  const addCertificacion = () => {
    setProfile((prev) => {
      const next = clone(prev);
      next.fondacion.certificaciones.push('');
      return next;
    });
  };

  const removeCertificacion = (index) => {
    setProfile((prev) => {
      const next = clone(prev);
      next.fondacion.certificaciones.splice(index, 1);
      return next;
    });
  };

  const handleGuardar = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const resp = await updateFundacionConfig(profile);
      if (resp?.success) {
        setMessage({ severity: 'success', text: 'Perfil de la fundación actualizado correctamente.' });
        setProfile(resp.data);
      } else {
        setMessage({ severity: 'error', text: resp?.message || 'No se pudo guardar el perfil' });
      }
    } catch (e) {
      console.error('Error guardando perfil de fundación:', e);
      setMessage({ severity: 'error', text: e.message || 'Error al guardar el perfil' });
    }
    setSaving(false);
  };

  if (loading) {
    return <Typography>Cargando perfil de la fundación...</Typography>;
  }

  if (!profile) {
    return <Alert severity="error">No se pudo cargar el perfil de la fundación.</Alert>;
  }

  const sectionTitle = (title, subtitle) => (
    <>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
    </>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Datos de la Fundación
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Esta información es la que el chatbot usa para responder preguntas sobre la institución
        (ubicación, horarios, servicios, contacto, etc.). Al guardar, los cambios se aplican a las futuras respuestas.
      </Alert>

      {message && (
        <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        {sectionTitle('Identidad', 'Nombre, misión y visión de la fundación')}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nombre"
              value={profile.nombre ?? ''}
              onChange={(e) => updatePath('nombre', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Misión"
              value={profile.mision ?? ''}
              onChange={(e) => updatePath('mision', e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Visión"
              value={profile.vision ?? ''}
              onChange={(e) => updatePath('vision', e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {sectionTitle('Ubicación', 'Sede principal y sucursales')}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Ciudad"
              value={profile.ubicaciones?.principal?.ciudad ?? ''}
              onChange={(e) => updatePath('ubicaciones.principal.ciudad', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Provincia"
              value={profile.ubicaciones?.principal?.provincia ?? ''}
              onChange={(e) => updatePath('ubicaciones.principal.provincia', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="País"
              value={profile.ubicaciones?.principal?.pais ?? ''}
              onChange={(e) => updatePath('ubicaciones.principal.pais', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Dirección"
              value={profile.ubicaciones?.principal?.direccion ?? ''}
              onChange={(e) => updatePath('ubicaciones.principal.direccion', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Sucursales
          </Typography>
          {profile.ubicaciones?.sucursales?.map((suc, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
              <TextField
                label="Ciudad"
                size="small"
                value={suc.ciudad ?? ''}
                onChange={(e) => updateSucursal(index, 'ciudad', e.target.value)}
              />
              <TextField
                label="Tipo"
                size="small"
                value={suc.tipo ?? ''}
                onChange={(e) => updateSucursal(index, 'tipo', e.target.value)}
              />
              <IconButton color="error" onClick={() => removeSucursal(index)}>
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={addSucursal}
          >
            Agregar sucursal
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {sectionTitle('Contacto', 'Teléfonos, correos, sitio web y redes sociales')}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Teléfono principal"
              value={profile.contacto?.telefonoPrincipal ?? ''}
              onChange={(e) => updatePath('contacto.telefonoPrincipal', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Teléfono alterno"
              value={profile.contacto?.telefonoAlterno ?? ''}
              onChange={(e) => updatePath('contacto.telefonoAlterno', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              value={profile.contacto?.email ?? ''}
              onChange={(e) => updatePath('contacto.email', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email de emergencias"
              value={profile.contacto?.emailEmergencias ?? ''}
              onChange={(e) => updatePath('contacto.emailEmergencias', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Sitio web"
              value={profile.contacto?.sitioWeb ?? ''}
              onChange={(e) => updatePath('contacto.sitioWeb', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Redes sociales
          </Typography>
          <Grid container spacing={2}>
            {REDES_KEYS.map(([key, label]) => (
              <Grid item xs={12} md={6} key={key}>
                <TextField
                  label={label}
                  value={profile.contacto?.redesSociales?.[key] ?? ''}
                  onChange={(e) => updatePath(`contacto.redesSociales.${key}`, e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {sectionTitle('Horarios', 'Horarios de atención general y emergencias')}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Lunes a Viernes"
              value={profile.horarios?.atencionGeneral?.lunasViernes ?? ''}
              onChange={(e) => updatePath('horarios.atencionGeneral.lunasViernes', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Sábados"
              value={profile.horarios?.atencionGeneral?.sabados ?? ''}
              onChange={(e) => updatePath('horarios.atencionGeneral.sabados', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Domingos"
              value={profile.horarios?.atencionGeneral?.domingos ?? ''}
              onChange={(e) => updatePath('horarios.atencionGeneral.domingos', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Emergencias (estado: disponible / no disponible)"
              value={profile.horarios?.emergencias?.estado ?? ''}
              onChange={(e) => updatePath('horarios.emergencias.estado', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Horario de emergencias"
              value={profile.horarios?.emergencias?.horario ?? ''}
              onChange={(e) => updatePath('horarios.emergencias.horario', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {sectionTitle('Servicios', 'Servicios médicos que ofrece la fundación')}
        {SERVICIO_KEYS.map((key) => (
          <Box key={key} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {SERVICIO_LABELS[key]}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Nombre"
                  size="small"
                  value={profile.servicios?.[key]?.nombre ?? ''}
                  onChange={(e) => updatePath(`servicios.${key}.nombre`, e.target.value)}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  label="Descripción"
                  size="small"
                  value={profile.servicios?.[key]?.descripcion ?? ''}
                  onChange={(e) => updatePath(`servicios.${key}.descripcion`, e.target.value)}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Disponibilidad"
                  size="small"
                  value={profile.servicios?.[key]?.disponibilidad ?? ''}
                  onChange={(e) => updatePath(`servicios.${key}.disponibilidad`, e.target.value)}
                  fullWidth
                  margin="dense"
                />
              </Grid>
            </Grid>
          </Box>
        ))}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {sectionTitle('Programas', 'Programas comunitarios')}
        {PROGRAMA_KEYS.map((key) => (
          <Box key={key} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {PROGRAMA_LABELS[key]}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Nombre"
                  size="small"
                  value={profile.programas?.[key]?.nombre ?? ''}
                  onChange={(e) => updatePath(`programas.${key}.nombre`, e.target.value)}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  label="Descripción"
                  size="small"
                  value={profile.programas?.[key]?.descripcion ?? ''}
                  onChange={(e) => updatePath(`programas.${key}.descripcion`, e.target.value)}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Público"
                  size="small"
                  value={profile.programas?.[key]?.publico ?? ''}
                  onChange={(e) => updatePath(`programas.${key}.publico`, e.target.value)}
                  fullWidth
                  margin="dense"
                />
              </Grid>
            </Grid>
          </Box>
        ))}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {sectionTitle('Valores', 'Valores institucionales')}
        <Grid container spacing={2}>
          {VALOR_KEYS.map(([key, label]) => (
            <Grid item xs={12} md={6} key={key}>
              <TextField
                label={label}
                value={profile.valores?.[key] ?? ''}
                onChange={(e) => updatePath(`valores.${key}`, e.target.value)}
                fullWidth
                margin="normal"
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {sectionTitle('Datos institucionales', 'Año de fundación y estadísticas')}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Año de fundación"
              value={profile.fondacion?.anioFundacion ?? ''}
              onChange={(e) => updatePath('fondacion.anioFundacion', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Profesionales de salud"
              value={profile.fondacion?.misioneros ?? ''}
              onChange={(e) => updatePath('fondacion.misioneros', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Especialidades"
              value={profile.fondacion?.especialidades ?? ''}
              onChange={(e) => updatePath('fondacion.especialidades', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Pacientes atendidos"
              value={profile.fondacion?.pacientesAtendidos ?? ''}
              onChange={(e) => updatePath('fondacion.pacientesAtendidos', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Certificaciones
          </Typography>
          {profile.fondacion?.certificaciones?.map((cert, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
              <TextField
                label={`Certificación ${index + 1}`}
                size="small"
                fullWidth
                value={cert ?? ''}
                onChange={(e) => updateCertificacion(index, e.target.value)}
              />
              <IconButton color="error" onClick={() => removeCertificacion(index)}>
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} size="small" onClick={addCertificacion}>
            Agregar certificación
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 2 }} />
      <Button variant="contained" disabled={saving} onClick={handleGuardar}>
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </Box>
  );
};

export default FundacionConfig;