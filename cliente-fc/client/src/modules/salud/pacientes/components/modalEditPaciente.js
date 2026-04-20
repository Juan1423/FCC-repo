import React, { useState, useEffect } from "react";
import { Step, StepLabel, Stepper, Typography, Modal, Grid, Button, Container, Box, Alert } from "@mui/material";
import { updatePaciente } from "../../../../services/pacientesServices";
import { logAuditAction } from "../../../../services/auditoriaServices";
import { getCurrentUserId } from '../../../../utils/userUtils';
import dayjs from "dayjs";
import { DateInput, TextInput, PhoneInput, AutocompleteInput, FileInput, TextareaInput } from '../../../../components/Inputs';
import { useMediaQuery } from "@mui/material";
import { matchIsValidTel } from "mui-tel-input";
import { steps, tipoIdentificacion, tiposSangre, genderOptions, parentescos, paises } from '../../../../components/data/Data';
import "dayjs/locale/en-gb";

dayjs.locale("en-gb");

const ModalEditPaciente = ({ open, onClose, pacienteData, onPacienteUpdated }) => {
  const [paciente, setPaciente] = useState(pacienteData);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (pacienteData) {
      setPaciente({
        ...pacienteData,
        fecha_paciente: pacienteData.fecha_paciente ? dayjs(pacienteData.fecha_paciente) : null,
        imagen: pacienteData.foto_paciente,
        archivo_documentos_cedulas: pacienteData.archivo_documentos_cedulas || [],
        archivo_certificado_medico: pacienteData.archivo_certificado_medico || null,
      });
    }
  }, [pacienteData]);

  useEffect(() => {
    if (paciente.fecha_paciente) {
      const birthDate = dayjs(paciente.fecha_paciente);
      const today = dayjs();
      const age = today.diff(birthDate, 'year');
      setPaciente(prev => ({ ...prev, edad_paciente: age.toString() }));
    }
  }, [paciente.fecha_paciente]);
  
  const handleClose = () => {
    onClose();
  };

  const validateDNI = (value) => {
    if (value.length !== 10) {
      return false;
    }
    if (!/^\d+$/.test(value)) {
      return false;
    }
  
    const digits = value.split('').map(Number);
    const provinceCode = digits[0] * 10 + digits[1];
    if (provinceCode < 1 || provinceCode > 24) {
      return false;
    }
  
    const thirdDigit = digits[2];
    if (thirdDigit > 6) {
      return false;
    }
  
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    for (let i = 0; i < coefficients.length; i++) {
      let product = digits[i] * coefficients[i];
      if (product >= 10) {
        product -= 9;
      }
      sum += product;
    }
  
    const verifier = (10 - (sum % 10)) % 10;
    return verifier === digits[9];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaciente((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (value.trim() !== '') {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (name === "telefono_paciente" || name === "telefono_cuidador") {
      if (!matchIsValidTel(value)) {
        setErrors((prev) => ({ ...prev, [name]: "Número de teléfono inválido" }));
      }
    }
    if (name === "dni_paciente") {
      if (validateDNI(value) === false) {
        setErrors((prev) => ({ ...prev, [name]: "DNI inválido" }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (value.trim() === '' && name !== 'imagen' && name !== 'edad_paciente') {
      setErrors((prev) => ({
        ...prev,
        [name]: "Este campo es obligatorio",
      }));
    }
  };

  const handleDateChange = (date) => {
    const sixYearsAgo = dayjs().subtract(6, 'year');
    if (dayjs(date).isAfter(sixYearsAgo)) {
      setAlertMessage("La fecha de nacimiento debe ser al menos 6 años antes de la fecha actual.");
      setShowAlert(true);
      return;
    }
    setPaciente((prev) => ({
      ...prev,
      fecha_paciente: date,
    }));
    setShowAlert(false);
  };

  const handleAutocompleteChange = (name) => (event, newValue) => {
    setPaciente((prev) => ({
      ...prev,
      [name]: newValue ? newValue.value : "",
    }));
    if ((name === "tipo_dni_paciente" || name === "tiposangre_paciente" || name === "genero_paciente" || name === "parentesco_familiar" || name === "nacionalidad_paciente") && !newValue) {
      setErrors((prev) => ({
        ...prev,
        [name]: "El campo es obligatorio",
      }));
    }
    if ((name === "tipo_dni_paciente" || name === "tiposangre_paciente" || name === "genero_paciente" || name === "parentesco_familiar" || name === "nacionalidad_paciente") && newValue) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (file, fieldName) => {
    setPaciente(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };
  
  const handleRemoveFile = (fieldName) => {
    setPaciente(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };


  const validateFields = () => {
    let tempErrors = {};
    let isValid = true;

    for (const key in paciente) {
      if (
        (paciente[key] === "" || paciente[key] === null) &&
        key !== "imagen" && key !== "edad_paciente" && key !== "fecha_paciente" &&
        key !== "archivo_documentos_cedulas" && key !== "archivo_certificado_medico" && key !== "id_paciente" && key !== "foto_paciente"
      ) {
        tempErrors[key] = "Este campo es obligatorio";
        isValid = false;
      }
    }

    setErrors(tempErrors);
    setTouched(Object.keys(paciente).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    if (!isValid) {
      setAlertMessage("Por favor, complete todos los campos obligatorios.");
      setShowAlert(true);
    }
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
    if (!validateFields()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    
    // Añadir campos no relacionados con archivos
    Object.keys(paciente).forEach(key => {
      if (!['imagen', 'archivo_documentos_cedulas', 'archivo_certificado_medico'].includes(key)) {
        formData.append(key, paciente[key]);
      }
    });

    // Manejar archivos
    if (paciente.imagen instanceof File) {
      formData.append('imagen', paciente.imagen);
    }
    if(paciente.imagen===null){
      formData.append('imagen', null);
    }
    if (paciente.archivo_documentos_cedulas instanceof File) {
      formData.append('archivo_documentos_cedulas', paciente.archivo_documentos_cedulas);
    }
    if(paciente.archivo_documentos_cedulas===null){
      formData.append('archivo_documentos_cedulas', null);
    }
    if (paciente.archivo_certificado_medico instanceof File) {
      formData.append('archivo_certificado_medico', paciente.archivo_certificado_medico);
    }
    if(paciente.archivo_certificado_medico===null){
      formData.append('archivo_certificado_medico', null);
    }
    console.log('Paciente a guardar:', paciente);
    console.log(paciente.imagen);
  
    try {
      const response = await updatePaciente(paciente.id_paciente, formData);
      console.log('Server response:', response); // Add this debug log
  
      if (response?.status === 200 && response?.data) {  // Check specific status
        console.log('Paciente actualizado con éxito:', response.data);
        try {
          const loggedInUserId = getCurrentUserId();
          console.log('Current user ID:', loggedInUserId);
          
          const auditDetails = {
            datosAnteriores: pacienteData,
            datosNuevos: paciente
          };
          await logAuditAction('ACTUALIZAR_PACIENTE', auditDetails);
          console.log('Auditoría creada con éxito');
        } catch(error) {
          console.error('Error al crear auditoría:', error);
        }
        onPacienteUpdated(true);
        handleClose();
      } else {
        console.error('Respuesta del servidor:', response);
        throw new Error(`Error en la actualización: ${response?.data?.message || 'La respuesta del servidor no indica éxito'}`);
      }
    } catch (error) {
      console.error('Error completo:', error.response || error);
      onPacienteUpdated(false);
      setAlertMessage(error.response?.data?.message || "Error al actualizar el paciente. Por favor, intente nuevamente.");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
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
                name="nombre_paciente"
                value={paciente.nombre_paciente}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.nombre_paciente && touched.nombre_paciente}
                helperText={touched.nombre_paciente && errors.nombre_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label="Apellidos"
                name="apellidos_paciente"
                value={paciente.apellidos_paciente}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.apellidos_paciente && errors.apellidos_paciente}
                helperText={touched.apellidos_paciente && errors.apellidos_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AutocompleteInput
                label="Nacionalidad"
                options={paises}
                value={paciente.nacionalidad_paciente}
                onChange={(newValue)=> handleAutocompleteChange("nacionalidad_paciente")(null,{value: newValue})}
                onBlur={handleBlur}
                error={errors.nacionalidad_paciente}
                helperText={errors.nacionalidad_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label="Dirección"
                name="direccion_paciente"
                value={paciente.direccion_paciente}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.direccion_paciente && errors.direccion_paciente}
                helperText={touched.direccion_paciente && errors.direccion_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AutocompleteInput
                label="Tipo de Identificación"
                options={tipoIdentificacion}
                value={paciente.tipo_dni_paciente}
                onBlur={handleBlur}
                onChange={(newValue)=> handleAutocompleteChange("tipo_dni_paciente")(null,{value: newValue})}
                error={errors.tipo_dni_paciente}
                helperText={errors.tipo_dni_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label="Número de Identificación"
                name="dni_paciente"
                value={paciente.dni_paciente}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.dni_paciente && errors.dni_paciente}
                helperText={touched.dni_paciente && errors.dni_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PhoneInput
                label="Teléfono"
                name="telefono_paciente"
                value={paciente.telefono_paciente}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.telefono_paciente && errors.telefono_paciente}
                helperText={touched.telefono_paciente && errors.telefono_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label="Email"
                name="email_paciente"
                value={paciente.email_paciente}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email_paciente && errors.email_paciente}
                helperText={touched.email_paciente && errors.email_paciente}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <AutocompleteInput
                label="Tipo de Sangre"
                options={tiposSangre}
                value={paciente.tiposangre_paciente}
                onBlur={handleBlur}
                onChange={(newValue)=> handleAutocompleteChange("tiposangre_paciente")(null,{value: newValue})}
                error={errors.tiposangre_paciente}
                helperText={errors.tiposangre_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AutocompleteInput
                label="Género"
                options={genderOptions}
                value={paciente.genero_paciente}
                onBlur={handleBlur}
                onChange={(newValue)=> handleAutocompleteChange("genero_paciente")(null,{value: newValue})}
                error={errors.genero_paciente}
                helperText={errors.genero_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateInput
                label="Fecha de Nacimiento"
                value={paciente.fecha_paciente}
                onChange={handleDateChange}
                error={errors.fecha_paciente}
                helperText={errors.fecha_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextInput
                label="Edad"
                name="edad_paciente"
                value={paciente.edad_paciente}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.edad_paciente}
                disabled={true}
                helperText={errors.edad_paciente}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextInput
                label="Nombre del Familiar Cuidador"
                name="familiar_cuidador"
                value={paciente.familiar_cuidador}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.familiar_cuidador && errors.familiar_cuidador}
                helperText={touched.familiar_cuidador && errors.familiar_cuidador}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AutocompleteInput
                label="Parentesco con el Paciente"
                options={parentescos}
                value={paciente.parentesco_familiar}
                onChange={(newValue)=> handleAutocompleteChange("parentesco_familiar")(null,{value: newValue})}
                onBlur={handleBlur}
                error={errors.parentesco_familiar}
                helperText={errors.parentesco_familiar}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PhoneInput
                label="Teléfono del Cuidador"
                name="telefono_cuidador"
                value={paciente.telefono_cuidador}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.telefono_cuidador && errors.telefono_cuidador}
                helperText={touched.telefono_cuidador && errors.telefono_cuidador}
              />
            </Grid>
          </Grid>
        );
        case 2:
          return (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextareaInput 
                  label="Biografia"
                  name="biografia_paciente"
                  value={paciente.biografia_paciente}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.biografia_paciente && errors.biografia_paciente}
                  helperText={touched.biografia_paciente && errors.biografia_paciente}
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>                <FileInput
                  onChange={(file) => handleFileChange(file, 'imagen')}
                  value={paciente.imagen}
                  onRemove={() => handleRemoveFile('imagen')}
                  disabled={false}
                  inputName="Actualizar imagen paciente"
                />
              </Grid>
              <Grid item xs={12}>
                <FileInput
                  onChange={(file) => handleFileChange(file, 'archivo_documentos_cedulas')}
                  value={paciente.archivo_documentos_cedulas}
                  onRemove={() => handleRemoveFile('archivo_documentos_cedulas')}
                  disabled={false}
                  inputName="Actualizar cédulas"
                />
              </Grid>
              <Grid item xs={12}>
                <FileInput
                  onChange={(file) => handleFileChange(file, 'archivo_certificado_medico')}
                  value={paciente.archivo_certificado_medico}
                  onRemove={() => handleRemoveFile('archivo_certificado_medico')}
                  disabled={false}
                  inputName="Actualizar certificado médico"
                />
              </Grid>
            </Grid>
          );
        default:
          return "Unknown step";
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
          Editar Paciente
        </Typography>
        {showAlert && (
          <Alert severity="error" onClose={() => setShowAlert(false)} sx={{ mb: 2 }}>
            {alertMessage}
          </Alert>
        )}
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
      </Container>
    </Modal>
  );
};

export default ModalEditPaciente;
