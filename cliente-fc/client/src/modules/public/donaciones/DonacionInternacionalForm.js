import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Grid, MenuItem, Select,
  FormControl, InputLabel, Alert, Snackbar, Stepper, Step, StepLabel,
  CircularProgress,
} from '@mui/material';
import * as donacionService from '../../../services/donacionService';

const initialForm = {
  nombres: '', apellidos: '', identificacion: '', telefono: '', email: '',
  direccion: '', id_continente: '', id_pais: '', id_ciudad: '',
  id_tipo_donante: '', institucion_origen: '',
  id_tipo_donacion: '', monto: '', descripcion: '', motivo: '', procedencia: '',
};

const DonacionInternacionalForm = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [continentes, setContinentes] = useState([]);
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paisesFiltrados, setPaisesFiltrados] = useState([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);
  const [tipoDonantes, setTipoDonantes] = useState([]);
  const [tipoDonaciones, setTipoDonaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    Promise.all([
      donacionService.getContinentes(),
      donacionService.getTipoDonantes(),
      donacionService.getTipoDonaciones(),
    ]).then(([c, td, tdc]) => {
      setContinentes(Array.isArray(c) ? c : []);
      setTipoDonantes(Array.isArray(td) ? td : []);
      setTipoDonaciones(Array.isArray(tdc) ? tdc : []);
    }).catch(() => setSnack({ open: true, message: 'Error al cargar datos iniciales', severity: 'error' }));
  }, []);

  useEffect(() => {
    if (form.id_continente) {
      donacionService.getPaises().then(all => {
        const list = Array.isArray(all) ? all : [];
        setPaises(list);
        setPaisesFiltrados(list.filter(p => Number(p.id_continente) === Number(form.id_continente)));
        setForm(f => ({ ...f, id_pais: '', id_ciudad: '' }));
      });
    }
  }, [form.id_continente]);

  useEffect(() => {
    if (form.id_pais) {
      donacionService.getCiudades().then(all => {
        const list = Array.isArray(all) ? all : [];
        setCiudades(list);
        setCiudadesFiltradas(list.filter(c => Number(c.id_pais) === Number(form.id_pais)));
        setForm(f => ({ ...f, id_ciudad: '' }));
      });
    }
  }, [form.id_pais]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const donanteData = {
        nombres: form.nombres, apellidos: form.apellidos, identificacion: form.identificacion,
        telefono: form.telefono, email: form.email, direccion: form.direccion,
        id_continente: form.id_continente || null, id_pais: form.id_pais || null,
        id_ciudad: form.id_ciudad || null, id_tipo_donante: form.id_tipo_donante || null,
        institucion_origen: form.institucion_origen || null,
        fecha_registro: new Date().toISOString(), estado: 'activo',
      };
      const donanteRes = await donacionService.createDonanteInternacional(donanteData);
      const idDonante = donanteRes?.data?.id_donante_internacional || donanteRes?.id_donante_internacional;

      await donacionService.createDonacionInternacional({
        id_donante_internacional: idDonante,
        id_tipo_donacion: form.id_tipo_donacion || null,
        fecha_donacion: new Date().toISOString().slice(0, 10),
        fecha_registro: new Date().toISOString(),
        monto: form.monto || null, descripcion: form.descripcion || null,
        motivo: form.motivo || null, procedencia: form.procedencia || null,
        estado: 'registrada',
      });

      setSnack({ open: true, message: 'Donación internacional registrada. Gracias por su contribución.', severity: 'success' });
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
        <Typography variant="h4" align="center" gutterBottom>Donación Internacional</Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Formulario para registrar donaciones desde el exterior
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
            <Grid item xs={4}><TextField fullWidth label="Pasaporte/ID" value={form.identificacion} onChange={handleChange('identificacion')} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Teléfono" value={form.telefono} onChange={handleChange('telefono')} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Email" type="email" value={form.email} onChange={handleChange('email')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Dirección" multiline rows={2} value={form.direccion} onChange={handleChange('direccion')} /></Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Continente</InputLabel>
                <Select label="Continente" value={form.id_continente} onChange={handleChange('id_continente')}>
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {continentes.map(c => <MenuItem key={c.id_continente} value={c.id_continente}>{c.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth disabled={!form.id_continente}>
                <InputLabel>País</InputLabel>
                <Select label="País" value={form.id_pais} onChange={handleChange('id_pais')}>
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {paisesFiltrados.map(p => <MenuItem key={p.id_pais} value={p.id_pais}>{p.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth disabled={!form.id_pais}>
                <InputLabel>Ciudad</InputLabel>
                <Select label="Ciudad" value={form.id_ciudad} onChange={handleChange('id_ciudad')}>
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {ciudadesFiltradas.map(c => <MenuItem key={c.id_ciudad} value={c.id_ciudad}>{c.nombre}</MenuItem>)}
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
            <Grid item xs={6}><TextField fullWidth label="Institución de origen" value={form.institucion_origen} onChange={handleChange('institucion_origen')} /></Grid>
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
            <Typography><strong>ID/Pasaporte:</strong> {form.identificacion}</Typography>
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

export default DonacionInternacionalForm;
