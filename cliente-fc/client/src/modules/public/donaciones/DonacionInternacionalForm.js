import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Grid, MenuItem, Select,
  FormControl, InputLabel, Alert, Snackbar, CircularProgress,
  Container, Paper, Tooltip, IconButton,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { motion, AnimatePresence } from 'framer-motion';
import * as donacionService from '../../../services/donacionService';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter","Roboto","Helvetica","Arial",sans-serif',
  },
  palette: {
    primary: { main: '#2563eb' },
    secondary: { main: '#3b82f6' },
    success: { main: '#10b981' },
  },
  shape: { borderRadius: 12 },
});

const initialForm = {
  nombres: '', apellidos: '', identificacion: '', telefono: '', email: '',
  direccion: '', id_continente: '', id_pais: '', id_ciudad: '',
  id_tipo_donante: '', institucion_origen: '',
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

const DonacionInternacionalForm = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
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
  const [errors, setErrors] = useState({});
  const topRef = useRef(null);

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
                bgcolor: i <= step ? '#2563eb' : '#e0e0e0',
                color: i <= step ? '#fff' : '#999',
                transition: 'all 0.3s ease',
                boxShadow: i === step ? '0 4px 14px rgba(37,99,235,0.35)' : 'none',
              }}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? '\u2713' : i + 1}
            </Box>
            <Typography
              variant="caption"
              sx={{
                display: { xs: i === step ? 'block' : 'none', sm: 'block' },
                fontWeight: i === step ? 600 : 400,
                color: i <= step ? '#1e293b' : '#999',
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
                bgcolor: i < step ? '#2563eb' : '#e0e0e0',
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
    const id = `internacional-${field}`;
    const { helpText, ...rest } = props;
    return (
      <TextField
        id={id}
        fullWidth
        label={label}
        value={form[field]}
        onChange={handleChange(field)}
        error={!!errors[field]}
        helperText={errors[field]}
        aria-required={rest.required || false}
        slotProps={
          helpText
            ? {
                input: {
                  endAdornment: (
                    <Tooltip title={helpText} arrow placement="top-end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label={`Ayuda sobre ${label}`}
                        sx={{ color: '#64748b', mr: 0.5 }}
                      >
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ),
                },
              }
            : undefined
        }
        {...rest}
      />
    );
  };

  const renderSelect = (field, label, items, valueKey, labelKey, disabled = false) => {
    const id = `internacional-${field}`;
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
    <ThemeProvider theme={theme}>
      <Box
        component="a"
        href="#donacion-internacional-content"
        sx={{
          position: 'absolute',
          left: -9999,
          top: 0,
          zIndex: 9999,
          bgcolor: '#fff',
          p: 1.5,
          borderRadius: 1,
          textDecoration: 'none',
          color: '#2563eb',
          fontWeight: 600,
          '&:focus': { position: 'fixed', left: 8, top: 8 },
        }}
      >
        Saltar al contenido principal
      </Box>
      <Box id="donacion-internacional-content" sx={{ position: 'relative', overflow: 'hidden', bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
            pt: { xs: 4, md: 6 },
            pb: { xs: 10, md: 8 },
            textAlign: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Container maxWidth="md">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Typography variant="h1" sx={{ color: '#fff', fontSize: { xs: '2rem', md: '3rem' }, mb: 1, textShadow: '0 2px 8px rgba(0,0,0,0.15)', fontWeight: 700 }}>
                Donaci&oacute;n Internacional
              </Typography>
              <Typography variant="h2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: 400 }}>
                Su generosidad no tiene fronteras. Complete el formulario para registrar su donaci&oacute;n.
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
              background: '#f8fafc',
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
              bgcolor: '#ffffff',
              boxShadow: '0 8px 32px rgba(15,23,42,0.08)',
              border: '1px solid',
              borderColor: 'grey.200',
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
                    <Typography variant="h2" sx={{ color: '#1e293b', mb: 3, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600 }}>
                      Informaci&oacute;n personal
                    </Typography>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        {renderField('nombres', 'Nombres', { required: true })}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {renderField('apellidos', 'Apellidos', { required: true })}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {renderField('identificacion', 'Pasaporte/ID', { required: true })}
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

                    <Typography variant="h2" sx={{ color: '#1e293b', mb: 3, mt: 4, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600 }}>
                      Ubicaci&oacute;n
                    </Typography>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={4}>
                        {renderSelect('id_continente', 'Continente', continentes, 'id_continente', 'nombre')}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {renderSelect('id_pais', 'País', paisesFiltrados, 'id_pais', 'nombre', !form.id_continente)}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {renderSelect('id_ciudad', 'Ciudad', ciudadesFiltradas, 'id_ciudad', 'nombre', !form.id_pais)}
                      </Grid>
                    </Grid>

                    <Typography variant="h2" sx={{ color: '#1e293b', mb: 3, mt: 4, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600 }}>
                      Informaci&oacute;n adicional
                    </Typography>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        {renderSelect('id_tipo_donante', 'Tipo de donante', tipoDonantes, 'id_tipo_donante', 'nombre')}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {renderField('institucion_origen', 'Institución de origen')}
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {step === 1 && (
                  <Box role="region" aria-label="Detalle de la donaci&oacute;n">
                    <Typography variant="h2" sx={{ color: '#1e293b', mb: 3, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600 }}>
                      Informaci&oacute;n de la donaci&oacute;n
                    </Typography>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        {renderSelect('id_tipo_donacion', 'Tipo de donación', tipoDonaciones, 'id_tipo_donacion', 'nombre')}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {renderField('monto', 'Monto (USD)', { type: 'number' })}
                      </Grid>
                      <Grid item xs={12}>
                        {renderField('descripcion', 'Descripción', {
                          multiline: true,
                          rows: 3,
                          helpText: 'Descripción detallada de lo que se está donando (tipo de bien, cantidad, estado). Ejemplo: "Equipos médicos por valor de USD 5.000, en buen estado, listos para envío".',
                        })}
                      </Grid>
                      <Grid item xs={12}>
                        {renderField('motivo', 'Motivo', {
                          multiline: true,
                          rows: 2,
                          helpText: 'Razón o causa que motiva la donación. Ejemplo: "Apoyo humanitario tras desastre natural" o "Cooperación internacional en salud".',
                        })}
                      </Grid>
                      <Grid item xs={12}>
                        {renderField('procedencia', 'Procedencia', {
                          multiline: true,
                          rows: 2,
                          helpText: 'País u organización de origen de la donación. Ejemplo: "Organización sin fines de lucro con sede en Canadá" o "Empresa matriz con sucursales en la región".',
                        })}
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {step === 2 && (
                  <Box role="region" aria-label="Confirmar donaci&oacute;n">
                    <Typography variant="h2" sx={{ color: '#1e293b', mb: 3, fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600 }}>
                      Resumen de su donaci&oacute;n
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: 'grey.200' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Donante</Typography>
                          <Typography variant="body1" fontWeight={600}>{form.nombres} {form.apellidos}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">ID/Pasaporte</Typography>
                          <Typography variant="body1">{form.identificacion}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{form.email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Tel&eacute;fono</Typography>
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
                            <Typography variant="caption" color="text.secondary">Descripci&oacute;n</Typography>
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
                  borderColor: 'grey.300',
                  color: '#2563eb',
                  minHeight: 44,
                  minWidth: 120,
                  '&:hover': { borderColor: '#2563eb', bgcolor: 'rgba(37,99,235,0.04)' },
                }}
              >
                Atr&aacute;s
              </Button>
              {step < 2 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={step === 0 && !isDonanteComplete()}
                  sx={{
                    bgcolor: '#2563eb',
                    minHeight: 44,
                    minWidth: 120,
                    '&:hover': { bgcolor: '#1d4ed8' },
                    '&:disabled': { bgcolor: 'rgba(37,99,235,0.3)' },
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
                    bgcolor: '#10b981',
                    minHeight: 44,
                    minWidth: 140,
                    '&:hover': { bgcolor: '#059669' },
                  }}
                >
                  {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Enviar donación'}
                </Button>
              )}
            </Box>
          </Paper>
        </Container>

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
      </Box>
    </ThemeProvider>
  );
};

export default DonacionInternacionalForm;
