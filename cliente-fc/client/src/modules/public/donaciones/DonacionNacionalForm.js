import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Grid, MenuItem, Select,
  FormControl, InputLabel, Alert, Snackbar, CircularProgress,
  Container, Paper,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import * as donacionService from '../../../services/donacionService';

const theme = createTheme({
  typography: {
    fontFamily: '"Plus Jakarta Sans","Roboto","Helvetica","Arial",sans-serif',
    h1: { fontFamily: '"Playfair Display",serif', fontWeight: 700 },
    h2: { fontFamily: '"Playfair Display",serif', fontWeight: 600 },
    h3: { fontFamily: '"Playfair Display",serif', fontWeight: 600 },
  },
  palette: {
    primary: { main: '#C8553D' },
    secondary: { main: '#E8A838' },
    success: { main: '#2D936C' },
  },
  shape: { borderRadius: 12 },
});

const initialForm = {
  nombres: '', apellidos: '', identificacion: '', telefono: '', email: '',
  direccion: '', id_region: '', id_provincia: '', id_canton: '', id_parroquia: '',
  id_tipo_donante: '', ocupacion: '',
  id_tipo_donacion: '', monto: '', descripcion: '', motivo: '', procedencia: '',
};

const steps = [
  { label: 'Datos del donante' },
  { label: 'Detalle de la donación' },
  { label: 'Confirmar' },
];

const stepVariants = {
  enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const DonacionNacionalForm = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
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
  const [errors, setErrors] = useState({});
  const topRef = useRef(null);

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
  }, [form.id_region]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const handleNext = () => {
    if (step === 0) {
      const newErrors = {};
      const required = [
        { field: 'nombres', label: 'Nombres' },
        { field: 'apellidos', label: 'Apellidos' },
        { field: 'identificacion', label: 'Identificación' },
        { field: 'telefono', label: 'Teléfono' },
        { field: 'email', label: 'Email' },
      ];
      let hasError = false;
      required.forEach(({ field, label }) => {
        if (!form[field]?.trim()) {
          newErrors[field] = `${label} es requerido`;
          hasError = true;
        }
      });
      setErrors(newErrors);
      if (hasError) return;
    }
    setDirection(1);
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

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
      setErrors({});
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

  const renderStepIndicator = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, gap: 0 }}>
      {steps.map((s, i) => (
        <Box key={s.label} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: { xs: 36, sm: 48 },
                height: { xs: 36, sm: 48 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 0.5,
                fontWeight: 700,
                fontSize: { xs: '0.85rem', sm: '1rem' },
                bgcolor: i <= step ? '#C8553D' : '#e0e0e0',
                color: i <= step ? '#fff' : '#999',
                transition: 'all 0.3s ease',
                boxShadow: i === step ? '0 4px 14px rgba(200,85,61,0.35)' : 'none',
              }}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? '✓' : i + 1}
            </Box>
            <Typography
              variant="caption"
              sx={{
                display: { xs: i === step ? 'block' : 'none', sm: 'block' },
                fontWeight: i === step ? 600 : 400,
                color: i <= step ? '#4A2C2A' : '#999',
                maxWidth: 80,
                lineHeight: 1.2,
              }}
            >
              {s.label}
            </Typography>
          </Box>
          {i < steps.length - 1 && (
            <Box
              sx={{
                width: { xs: 24, sm: 48, md: 72 },
                height: 2,
                bgcolor: i < step ? '#C8553D' : '#e0e0e0',
                mx: 1,
                mt: -3,
                transition: 'background 0.3s ease',
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );

  const renderField = (field, label, props = {}) => {
    const id = `nacional-${field}`;
    return (
      <TextField
        id={id}
        fullWidth
        label={label}
        value={form[field]}
        onChange={handleChange(field)}
        error={!!errors[field]}
        helperText={errors[field]}
        aria-required={props.required || false}
        {...props}
      />
    );
  };

  const renderSelect = (field, label, items, valueKey, labelKey, disabled = false) => {
    const id = `nacional-${field}`;
    return (
      <FormControl fullWidth disabled={disabled} error={!!errors[field]}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select
          labelId={`${id}-label`}
          id={id}
          label={label}
          value={form[field]}
          onChange={handleChange(field)}
        >
          <MenuItem value=""><em>Seleccione</em></MenuItem>
          {items.map(item => (
            <MenuItem key={item[valueKey]} value={item[valueKey]}>{item[labelKey]}</MenuItem>
          ))}
        </Select>
        {errors[field] && <Typography variant="caption" color="error">{errors[field]}</Typography>}
      </FormControl>
    );
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>
      <Box
        component="a"
        href="#donacion-form-content"
        sx={{
          position: 'absolute',
          left: -9999,
          top: 0,
          zIndex: 9999,
          bgcolor: '#fff',
          p: 1.5,
          borderRadius: 1,
          textDecoration: 'none',
          color: '#C8553D',
          fontWeight: 600,
          '&:focus': { position: 'fixed', left: 8, top: 8 },
        }}
      >
        Saltar al contenido principal
      </Box>
      <ThemeProvider theme={theme}>
        <Box id="donacion-form-content" sx={{ position: 'relative', overflow: 'hidden', bgcolor: '#FFF8F0', minHeight: '100vh' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #C8553D 0%, #E8A838 50%, #2D936C 100%)',
              pt: { xs: 4, md: 6 },
              pb: { xs: 10, md: 8 },
              textAlign: 'center',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Container maxWidth="md">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Typography variant="h1" sx={{ color: '#fff', fontSize: { xs: '2rem', md: '3rem' }, mb: 1, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  Donación Nacional
                </Typography>
                <Typography variant="h2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: 400 }}>
                  Su generosidad transforma vidas. Complete el formulario para registrar su donación.
                </Typography>
              </motion.div>
            </Container>
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                left: 0,
                right: 0,
                height: 60,
                background: '#FFF8F0',
                borderTopLeftRadius: { xs: '30px', md: '60px' },
                borderTopRightRadius: { xs: '30px', md: '60px' },
              }}
            />
          </Box>

          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, mt: { xs: 0, md: -6 }, pb: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(74,44,42,0.08)',
                border: '1px solid rgba(200,85,61,0.1)',
              }}
            >
              {renderStepIndicator()}

              <Box ref={topRef} />

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'tween', duration: 0.3 }}
                >
                  {step === 0 && (
                    <Box role="region" aria-label="Datos del donante">
                      <Typography variant="h2" sx={{ color: '#4A2C2A', mb: 3, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        Información personal
                      </Typography>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          {renderField('nombres', 'Nombres', { required: true })}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {renderField('apellidos', 'Apellidos', { required: true })}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          {renderField('identificacion', 'Cédula', { required: true })}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          {renderField('telefono', 'Teléfono', { required: true })}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          {renderField('email', 'Email', { type: 'email', required: true })}
                        </Grid>
                        <Grid item xs={12}>
                          {renderField('direccion', 'Dirección', { multiline: true, rows: 2 })}
                        </Grid>
                      </Grid>

                      <Typography variant="h2" sx={{ color: '#4A2C2A', mb: 3, mt: 4, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        Ubicación
                      </Typography>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6} md={3}>
                          {renderSelect('id_region', 'Región', regiones, 'id_region', 'nombre')}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          {renderSelect('id_provincia', 'Provincia', provinciasFiltradas, 'id_provincia', 'nombre', !form.id_region)}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          {renderSelect('id_canton', 'Cantón', cantonesFiltrados, 'id_canton', 'nombre', !form.id_provincia)}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          {renderSelect('id_parroquia', 'Parroquia', parroquiasFiltradas, 'id_parroquia', 'nombre', !form.id_canton)}
                        </Grid>
                      </Grid>

                      <Typography variant="h2" sx={{ color: '#4A2C2A', mb: 3, mt: 4, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        Información adicional
                      </Typography>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          {renderSelect('id_tipo_donante', 'Tipo de donante', tipoDonantes, 'id_tipo_donante', 'nombre')}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {renderField('ocupacion', 'Ocupación')}
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {step === 1 && (
                    <Box role="region" aria-label="Detalle de la donación">
                      <Typography variant="h2" sx={{ color: '#4A2C2A', mb: 3, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        Información de la donación
                      </Typography>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          {renderSelect('id_tipo_donacion', 'Tipo de donación', tipoDonaciones, 'id_tipo_donacion', 'nombre')}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {renderField('monto', 'Monto (USD)', { type: 'number' })}
                        </Grid>
                        <Grid item xs={12}>
                          {renderField('descripcion', 'Descripción', { multiline: true, rows: 3 })}
                        </Grid>
                        <Grid item xs={12}>
                          {renderField('motivo', 'Motivo', { multiline: true, rows: 2 })}
                        </Grid>
                        <Grid item xs={12}>
                          {renderField('procedencia', 'Procedencia', { multiline: true, rows: 2 })}
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {step === 2 && (
                    <Box role="region" aria-label="Confirmar donación">
                      <Typography variant="h2" sx={{ color: '#4A2C2A', mb: 3, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                        Resumen de su donación
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: 'rgba(200,85,61,0.2)' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Donante</Typography>
                            <Typography variant="body1" fontWeight={600}>{form.nombres} {form.apellidos}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Identificación</Typography>
                            <Typography variant="body1">{form.identificacion}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Email</Typography>
                            <Typography variant="body1">{form.email}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                            <Typography variant="body1">{form.telefono}</Typography>
                          </Grid>
                          {form.monto && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary">Monto</Typography>
                              <Typography variant="body1" fontWeight={600} color="success.main">${form.monto}</Typography>
                            </Grid>
                          )}
                          {form.descripcion && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">Descripción</Typography>
                              <Typography variant="body1">{form.descripcion}</Typography>
                            </Grid>
                          )}
                          {form.motivo && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">Motivo</Typography>
                              <Typography variant="body1">{form.motivo}</Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    </Box>
                  )}
                </motion.div>
              </AnimatePresence>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
                <Button
                  disabled={step === 0}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(200,85,61,0.3)',
                    color: '#C8553D',
                    minHeight: 44,
                    minWidth: 120,
                    '&:hover': { borderColor: '#C8553D', bgcolor: 'rgba(200,85,61,0.04)' },
                  }}
                >
                  Atrás
                </Button>
                {step < 2 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={step === 0 && !isDonanteComplete()}
                    sx={{
                      bgcolor: '#C8553D',
                      minHeight: 44,
                      minWidth: 120,
                      '&:hover': { bgcolor: '#B04430' },
                      '&:disabled': { bgcolor: 'rgba(200,85,61,0.3)' },
                    }}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                      bgcolor: '#2D936C',
                      minHeight: 44,
                      minWidth: 140,
                      '&:hover': { bgcolor: '#247A58' },
                    }}
                  >
                    {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Enviar donación'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Container>
        </Box>

        <Snackbar
          open={snack.open}
          autoHideDuration={6000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          role="alert"
          aria-live="assertive"
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack({ ...snack, open: false })}
            sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </>
  );
};

export default DonacionNacionalForm;
