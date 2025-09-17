import React, { useState, useEffect } from 'react';
import { 
  Modal, Stepper, Step, StepLabel, Button, 
  Grid, Box, Typography, Container, useMediaQuery, Snackbar, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { updatePersonalSalud, getEspecialidades, getTipoEspecialidad } from '../../../services/personalsaludServices';
import { TextInput, PhoneInput, AutocompleteInput, FileInput, DateInput } from '../../../components/Inputs';
import { tipoIdentificacion,  paises } from '../../../components/data/Data';
import dayjs from "dayjs";
import { logAuditAction } from "../../../services/auditoriaServices";
import { getCurrentUserId } from "../../../utils/userUtils";
const steps = ['Información Personal', 'Información de Contacto', 'Información Profesional'];

const ModalEditPersonalSalud = ({ open, onClose, personalData, onPersonalSaludUpdated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [especialidades, setEspecialidades] = useState([]);
  const [tiposEspecialidad, setTiposEspecialidad] = useState([]);
  const [personalSalud, setPersonalSalud] = useState(personalData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successAlert, setSuccessAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (personalData) {
      setPersonalSalud({
        ...personalData,
        fecha_nacimiento_personal: personalData.fecha_nacimiento_personal ? dayjs(personalData.fecha_nacimiento_personal) : null,
        foto_personal: personalData.foto_personal || null,
        hdv_personal: personalData.hdv_personal || null,
      });
    }

    const fetchData = async () => {
      try {
        const [especialidadesData, tiposEspecialidadData] = await Promise.all([
          getEspecialidades(),
          getTipoEspecialidad()
        ]);
        setEspecialidades(especialidadesData);
        setTiposEspecialidad(tiposEspecialidadData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorAlert(true);
      }
    };

    fetchData();
  }, [personalData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonalSalud({ ...personalSalud, [name]: value });
    if (value.trim() !== '') {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (value.trim() === '' && name !== 'hdv_personal' && name !== 'foto_personal') {
      setErrors((prev) => ({ ...prev, [name]: "Este campo es obligatorio" }));
    }
  };

  const handleAutocompleteChange = (name) => (event, newValue) => {
    setPersonalSalud((prev) => ({
      ...prev,
      [name]: newValue ? newValue.value : "",
    }));
    if (newValue) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (file, fieldName) => {
    setPersonalSalud(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleRemoveFile = (fieldName) => {
    setPersonalSalud(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const handleDateChange = (date) => {
    setPersonalSalud((prev) => ({
      ...prev,
      fecha_nacimiento_personal: date,
    }));
    setErrors((prev) => ({ ...prev, fecha_nacimiento_personal: "" }));
  };

  const validateFields = () => {
    let tempErrors = {};
    let isValid = true;
    for (const key in personalSalud) {
      if (
        (personalSalud[key] === "" || personalSalud[key] === null) &&
        key !== "hdv_personal" && key !== "foto_personal"
      ) {
        tempErrors[key] = "Este campo es obligatorio";
        isValid = false;
      }
    }
    setErrors(tempErrors);
    setTouched(Object.keys(personalSalud).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSave();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSave = async () => {
    if (!validateFields()) {
      setErrorAlert(true);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    Object.keys(personalSalud).forEach(key => {
      if (!['foto_personal', 'hdv_personal'].includes(key)) {
        formData.append(key, personalSalud[key]);
      }
    });

    if (personalSalud.foto_personal instanceof File) {
      formData.append('foto_personal', personalSalud.foto_personal);
    }
    if (personalSalud.foto_personal === null) {
      formData.append('foto_personal', null);
    }
    if (personalSalud.hdv_personal instanceof File) {
      formData.append('hdv_personal', personalSalud.hdv_personal);
    }
    if (personalSalud.hdv_personal === null) {
      formData.append('hdv_personal', null);
    }

    try {
      const response = await updatePersonalSalud(personalSalud.id_personalsalud, formData);
      if (response) {
        const loggedInUserId = getCurrentUserId();
        console.log('Current user ID:', loggedInUserId);
        
        if (!loggedInUserId) {
          throw new Error('No user logged in');
        }

        // Create detailed audit description
        const detailedDescription = {
          accion: "EDITAR",
          tabla: 'personal_salud',
          id_registro: personalSalud.id_personalsalud,
          datos_modificados: {
            estado_anterior: personalData,
            estado_nuevo: response,
            detalles_personal: {
              nombre: response.nombres_personal,
              apellidos: response.apellidos_personal,
              dni: response.dni_personal,
              especialidad: response.id_especialidad
            }
          },
          fecha_modificacion: new Date().toISOString()
        };

        await logAuditAction('ACTUALIZAR_PERSONAL', detailedDescription);
        setSuccessAlert(true);
        onPersonalSaludUpdated();
        onClose();
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorAlert(true);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextInput
                label="Nombres"
                name="nombres_personal"
                value={personalSalud.nombres_personal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.nombres_personal && touched.nombres_personal}
                helperText={touched.nombres_personal && errors.nombres_personal}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label="Apellidos"
                name="apellidos_personal"
                value={personalSalud.apellidos_personal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.apellidos_personal && errors.apellidos_personal}
                helperText={touched.apellidos_personal && errors.apellidos_personal}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AutocompleteInput
                label="Nacionalidad"
                options={paises}
                value={personalSalud.nacionalidad_personal}
                onChange={(newValue)=> handleAutocompleteChange("nacionalidad_personal")(null,{value: newValue})}
                onBlur={handleBlur}
                error={errors.nacionalidad_personal}
                helperText={errors.nacionalidad_personal}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AutocompleteInput
                label="Tipo de DNI"
                options={tipoIdentificacion}
                value={personalSalud.tipo_dni_personal}
                onChange={(newValue)=> handleAutocompleteChange("tipo_dni_personal")(null,{value: newValue})}
                onBlur={handleBlur}
                error={errors.tipo_dni_personal}
                helperText={errors.tipo_dni_personal}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label="DNI"
                name="dni_personal"
                value={personalSalud.dni_personal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.dni_personal && errors.dni_personal}
                helperText={touched.dni_personal && errors.dni_personal}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateInput
                label="Fecha de Nacimiento"
                value={personalSalud.fecha_nacimiento_personal}
                onChange={handleDateChange}
                error={errors.fecha_nacimiento_personal}
                helperText={errors.fecha_nacimiento_personal}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextInput
                label="Dirección"
                name="direccion_personal"
                value={personalSalud.direccion_personal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.direccion_personal && errors.direccion_personal}
                helperText={touched.direccion_personal && errors.direccion_personal}
              />
            </Grid>
            <Grid item xs={12}>
              <PhoneInput
                label="Teléfono"
                name="telefono_personal"
                value={personalSalud.telefono_personal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.telefono_personal && errors.telefono_personal}
                helperText={touched.telefono_personal && errors.telefono_personal}
              />
            </Grid>
            <Grid item xs={12}>
              <TextInput
                label="Email"
                name="email_personal"
                value={personalSalud.email_personal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email_personal && errors.email_personal}
                helperText={touched.email_personal && errors.email_personal}
              />
            </Grid>
          </Grid>
        );
        case 2:
          return (
            <Grid container spacing={2}>
              <Grid item xs={12}>
              <AutocompleteInput
                label="Especialidad"
                options={especialidades.map(esp => ({
                  value: esp.id_especialidad,
                  label: `${esp.nombre_especialidad} (${tiposEspecialidad.find(t => t.id_tipo_especialidad === esp.id_tipo_especialidad)?.descripcion_tipo_especialidad || 'Desconocido'})`
                }))}
                value={personalSalud.id_especialidad}
                onChange={(newValue)=> handleAutocompleteChange("id_especialidad")(null,{value: newValue})}
                onBlur={handleBlur}
                error={errors.id_especialidad}
                helperText={errors.id_especialidad}
              />
            </Grid>
            <Grid item xs={12}>
              <TextInput
                label="Títulos"
                name="titulos_personal"
                value={personalSalud.titulos_personal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.titulos_personal && errors.titulos_personal}
                helperText={touched.titulos_personal && errors.titulos_personal}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextInput
                label="Licencia"
                name="licencia_personal"
                value={personalSalud.licencia_personal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.licencia_personal && errors.licencia_personal}
                helperText={touched.licencia_personal && errors.licencia_personal}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FileInput
                onChange={(file) => handleFileChange(file, 'foto_personal')}
                value={personalSalud.foto_personal}
                onRemove={() => handleRemoveFile('foto_personal')}
                disabled={false}
                inputName="Actualizar foto"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FileInput
                onChange={(file) => handleFileChange(file, 'hdv_personal')}
                value={personalSalud.hdv_personal}
                onRemove={() => handleRemoveFile('hdv_personal')}
                disabled={false}
                inputName="Actualizar hoja de vida"
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Container maxWidth="md" sx={{ 
        bgcolor: "white", 
        padding: 4, 
        borderRadius: 2,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '90%' : '70%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <Typography variant="h4" gutterBottom>
          Editar Personal de Salud
        </Typography>
        <Stepper activeStep={activeStep} sx={{ marginBottom: 2 }} orientation={isMobile ? "vertical" : "horizontal"}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>
          {renderStepContent(activeStep)}
          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ marginRight: 1 }}
            >
              Atrás
            </Button>
            <Button variant="contained" color="primary" onClick={handleNext} disabled={isSubmitting}>
              {activeStep === steps.length - 1 ? (isSubmitting ? "Guardando..." : "Guardar") : "Siguiente"}
            </Button>
          </Box>
        </Box>
        <Snackbar
          open={successAlert}
          autoHideDuration={6000}
          onClose={() => setSuccessAlert(false)}
        >
          <Alert
            onClose={() => setSuccessAlert(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            Personal de Salud actualizado correctamente.
          </Alert>
        </Snackbar>
        <Snackbar
          open={errorAlert}
          autoHideDuration={6000}
          onClose={() => setErrorAlert(false)}
        >
          <Alert
            onClose={() => setErrorAlert(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            Error al actualizar el personal de salud.
          </Alert>
        </Snackbar>
      </Container>
    </Modal>
  );
};

export default ModalEditPersonalSalud;