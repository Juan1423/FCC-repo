import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Grid, MenuItem, Select,
  FormControl, InputLabel, Alert, Snackbar, Stepper, Step, StepLabel,
  CircularProgress,
} from '@mui/material';
import * as donacionService from '../../../services/donacionService';

const initialForm = {
  nombres: '', apellidos: '', identificacion: '', telefono: '', email: '',
  direccion: '', id_region: '', id_provincia: '', id_canton: '', id_parroquia: '',
  id_tipo_donante: '', ocupacion: '',
  id_tipo_donacion: '', monto: '', descripcion: '', motivo: '', procedencia: '',
};

const DonacionNacionalForm = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [regiones, setRegiones] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [provinciasFiltradas, setProvinciasFiltradas] = useState([]);
  const [cantonesFiltrados, setCantonesFiltrados] = useState([]);
  const [parroquiasFiltradas, setParroquiasFiltradas] = useState([]);
  const [tipoDonantes, setTipoDonantes] = useState([]);
  const [tipoDonaciones, setTipoDonaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    Promise.all([
      donacionService.getRegiones(),
      donacionService.getProvincias(),
      donacionService.getTipoDonantes(),
      donacionService.getTipoDonaciones(),
    ]).then(([r, p, td, tdc]) => {
      setRegiones(Array.isArray(r) ? r : []);
      setProvincias(Array.isArray(p) ? p : []);
      setTipoDonantes(Array.isArray(td) ? td : []);
      setTipoDonaciones(Array.isArray(tdc) ? tdc : []);
    }).catch(() => setSnack({ open: true, message: 'Error al cargar datos iniciales', severity: 'error' }));
  }, []);

  useEffect(() => {
    if (form.id_region) {
      setProvinciasFiltradas(provincias.filter(p => Number(p.id_region) === Number(form.id_region)));
      setForm(f => ({ ...f, id_provincia: '', id_canton: '', id_parroquia: '' }));
    }
  }, [form.id_region]);

  useEffect(() => {
    if (form.id_provincia) {
      donacionService.getCantones().then(all => {
        const list = Array.isArray(all) ? all : [];
        setCantones(list);
        setCantonesFiltrados(list.filter(c => Number(c.id_provincia) === Number(form.id_provincia)));
        setForm(f => ({ ...f, id_canton: '', id_parroquia: '' }));
      });
    }
  }, [form.id_provincia]);

  useEffect(() => {
    if (form.id_canton) {
      donacionService.getParroquias().then(all => {
        const list = Array.isArray(all) ? all : [];
        setParroquias(list);
        setParroquiasFiltradas(list.filter(p => Number(p.id_canton) === Number(form.id_canton)));
        setForm(f => ({ ...f, id_parroquia: '' }));
      });
    }
  }, [form.id_canton]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const donanteData = {
        nombres: form.nombres, apellidos: form.apellidos, identificacion: form.identificacion,
        telefono: form.telefono, email: form.email, direccion: form.direccion,
        id_region: form.id_region || null, id_provincia: form.id_provincia || null,
        id_canton: form.id_canton || null, id_parroquia: form.id_parroquia || null,
        id_tipo_donante: form.id_tipo_donante || null,
        ocupacion: form.ocupacion || null, fecha_registro: new Date().toISOString(), estado: 'activo',
      };
      const donanteRes = await donacionService.createDonanteNacional(donanteData);
      const idDonante = donanteRes?.data?.id_donante_nacional || donanteRes?.id_donante_nacional;

      await donacionService.createDonacionNacional({
        id_donante_nacional: idDonante,
        id_tipo_donacion: form.id_tipo_donacion || null,
        fecha_donacion: new Date().toISOString().slice(0, 10),
        fecha_registro: new Date().toISOString(),
        monto: form.monto || null, descripcion: form.descripcion || null,
        motivo: form.motivo || null, procedencia: form.procedencia || null,
        estado: 'registrada',
      });

      setSnack({ open: true, message: 'Donación registrada exitosamente. Gracias por su contribución.', severity: 'success' });
      setForm(initialForm);
      setStep(0);
    } catch (e) {
      setSnack({ open: true, message: 'Error al enviar: ' + (e?.response?.data?.message || e.message), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isDonanteComplete = () => {
    const required = [form.nombres, form.apellidos, form.identificacion, form.telefono, form.email];
    return required.every(f => f.trim());
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>Donación Nacional</Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Formulario para registrar donaciones dentro del país
        </Typography>

        <Stepper activeStep={step} sx={{ mb: 4 }}>
          <Step><StepLabel>Datos del donante</StepLabel></Step>
          <Step><StepLabel>Detalle de la donación</StepLabel></Step>
          <Step><StepLabel>Confirmar</StepLabel></Step>
        </Stepper>

        {step === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField fullWidth label="Nombres" value={form.nombres} onChange={handleChange('nombres')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Apellidos" value={form.apellidos} onChange={handleChange('apellidos')} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Cédula" value={form.identificacion} onChange={handleChange('identificacion')} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Teléfono" value={form.telefono} onChange={handleChange('telefono')} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Email" type="email" value={form.email} onChange={handleChange('email')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Dirección" multiline rows={2} value={form.direccion} onChange={handleChange('direccion')} /></Grid>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel>Región</InputLabel>
                <Select label="Región" value={form.id_region} onChange={handleChange('id_region')}>
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {regiones.map(r => <MenuItem key={r.id_region} value={r.id_region}>{r.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth disabled={!form.id_region}>
                <InputLabel>Provincia</InputLabel>
                <Select label="Provincia" value={form.id_provincia} onChange={handleChange('id_provincia')}>
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {provinciasFiltradas.map(p => <MenuItem key={p.id_provincia} value={p.id_provincia}>{p.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth disabled={!form.id_provincia}>
                <InputLabel>Cantón</InputLabel>
                <Select label="Cantón" value={form.id_canton} onChange={handleChange('id_canton')}>
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {cantonesFiltrados.map(c => <MenuItem key={c.id_canton} value={c.id_canton}>{c.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth disabled={!form.id_canton}>
                <InputLabel>Parroquia</InputLabel>
                <Select label="Parroquia" value={form.id_parroquia} onChange={handleChange('id_parroquia')}>
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {parroquiasFiltradas.map(p => <MenuItem key={p.id_parroquia} value={p.id_parroquia}>{p.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de donante</InputLabel>
                <Select label="Tipo de donante" value={form.id_tipo_donante} onChange={handleChange('id_tipo_donante')}>
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {tipoDonantes.map(t => <MenuItem key={t.id_tipo_donante} value={t.id_tipo_donante}>{t.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Ocupación" value={form.ocupacion} onChange={handleChange('ocupacion')} /></Grid>
          </Grid>
        )}

        {step === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de donación</InputLabel>
                <Select label="Tipo de donación" value={form.id_tipo_donacion} onChange={handleChange('id_tipo_donacion')}>
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {tipoDonaciones.map(t => <MenuItem key={t.id_tipo_donacion} value={t.id_tipo_donacion}>{t.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Monto (USD)" type="number" value={form.monto} onChange={handleChange('monto')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Descripción" multiline rows={3} value={form.descripcion} onChange={handleChange('descripcion')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Motivo" multiline rows={2} value={form.motivo} onChange={handleChange('motivo')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Procedencia" multiline rows={2} value={form.procedencia} onChange={handleChange('procedencia')} /></Grid>
          </Grid>
        )}

        {step === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Resumen</Typography>
            <Typography><strong>Donante:</strong> {form.nombres} {form.apellidos}</Typography>
            <Typography><strong>Cédula:</strong> {form.identificacion}</Typography>
            <Typography><strong>Email:</strong> {form.email}</Typography>
            <Typography><strong>Teléfono:</strong> {form.telefono}</Typography>
            {form.monto && <Typography><strong>Monto:</strong> ${form.monto}</Typography>}
            {form.descripcion && <Typography><strong>Descripción:</strong> {form.descripcion}</Typography>}
            {form.motivo && <Typography><strong>Motivo:</strong> {form.motivo}</Typography>}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button disabled={step === 0} onClick={() => setStep(s => s - 1)}>Atrás</Button>
          {step < 2 ? (
            <Button variant="contained" onClick={() => setStep(s => s + 1)} disabled={step === 0 && !isDonanteComplete()}>
              Siguiente
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Enviar donación'}
            </Button>
          )}
        </Box>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default DonacionNacionalForm;
