import React, { useState, useEffect } from "react";
import { Step, StepLabel, Stepper, Typography  } from "@mui/material";
import Modal from "@mui/material/Modal";
import {
  Grid,
  Button,
  Container,
  Box,
  Alert,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { createPaciente } from "../../../../services/pacientesServices";
import dayjs from "dayjs";
import { DateInput, TextInput, PhoneInput, AutocompleteInput, FileInput, TextareaInput} from '../../../../components/Inputs';
import {matchIsValidTel}  from "mui-tel-input";
import {steps, tipoIdentificacion, tiposSangre, genderOptions, parentescos, paises} from '../../../../components/data/Data';
import { logAuditAction } from "../../../../services/auditoriaServices";
import {getCurrentUserId} from "../../../../utils/userUtils";
import "dayjs/locale/en-gb";


dayjs.locale("en-gb");



const ModalAddPaciente = ({ open, onClose, onPacienteAdded }) => {
  const [cleared, setCleared] = useState(false);
  const [touched, setTouched] = useState({});
  const isMobile = useMediaQuery('(max-width:600px)');
  
  const [paciente, setPaciente] = useState({
    nombre_paciente: "",
    apellidos_paciente: "",
    nacionalidad_paciente: "Ecuador",
    tipo_dni_paciente: null,
    dni_paciente: "",
    direccion_paciente: "",
    telefono_paciente: "",
    email_paciente: "",
    tiposangre_paciente: null,
    edad_paciente: "",
    fecha_paciente: null,
    genero_paciente: null,
    familiar_cuidador: "",
    parentesco_familiar: null,
    telefono_cuidador: "",
    imagen: null,
    archivo_documentos_cedulas: null,
    archivo_certificado_medico: null,
    biografia_paciente: null,
    fecha_registro_paciente: null,
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cleared) {
      const timeout = setTimeout(() => {
        setCleared(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [cleared]);

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
  
    // Algoritmo de validación de cédula ecuatoriana
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
    if (verifier !== digits[9]) {
      return false;
    }
  
    return true;
  };
  

  useEffect(() => {
    if (paciente.fecha_paciente) {
      const birthDate = dayjs(paciente.fecha_paciente);
      const today = dayjs();
      const age = today.diff(birthDate, 'year');
      setPaciente(prev => ({ ...prev, edad_paciente: age.toString() }));
    }
  }, [paciente.fecha_paciente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaciente((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Eliminar el error si el campo tiene un valor
    if (value.trim() !== '') {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Validación específica para teléfonos
    if (name === "telefono_paciente" || name === "telefono_cuidador") {
      if (!matchIsValidTel(value)) {
        setErrors((prev) => ({ ...prev, [name]: "Número de teléfono inválido" }));
      }
    }
    if (name === "email_paciente") {
      
    }
    if (name === "dni_paciente") {
      if (paciente.tipo_dni_paciente?.value === "Cédula"){
        if (validateDNI(value) === false) {
          setErrors((prev) => ({ ...prev, [name]: "DNI inválido" }));
        }
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));


    // Validar campo vacío al perder el foco
    if (value.trim() === '' && name !== 'imagen' && name !== 'edad_paciente') {
      setErrors((prev) => ({
        ...prev,
        [name]: "Este campo es obligatorio ",
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
        key !== "imagen" && key !== "edad_paciente" && key !== "archivo_documentos_cedulas" && key !== "archivo_certificado_medico"  && key !== "fecha_registro_paciente"

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
    
    // Agregar campos de texto al FormData
    Object.keys(paciente).forEach(key => {
      if (key !== 'imagen' && key !== 'archivo_documentos_cedulas' && key !== 'archivo_certificado_medico') {
        formData.append(key, paciente[key]);
      }
    });
  
    // Agregar imagen si existe
    if (paciente.imagen) {
      formData.append('imagen', paciente.imagen);
    }
  
    // Agregar documentos de cédula si existen
    if (paciente.archivo_documentos_cedulas) {
        formData.append(`archivo_documentos_cedulas`, paciente.archivo_documentos_cedulas);

    }
  
    // Agregar certificado médico si existe
    if (paciente.archivo_certificado_medico) {
      formData.append('archivo_certificado_medico', paciente.archivo_certificado_medico);
    }

    //Agregar fecha de registro
    formData.append('fecha_registro_paciente', dayjs().format('YYYY-MM-DD'));
    console.log('Guardando paciente:', paciente);
    try {
      const response = await createPaciente(formData);
      if (response && response.success === true) {
        console.log('Paciente guardado con éxito:', response.data);

        try {
          const loggedInUserId = getCurrentUserId();
          console.log('Current user ID:', loggedInUserId);
          
          if (!loggedInUserId) {
            throw new Error('No user logged in');
          }

          // Create detailed audit description
          const detailedDescription = {
            accion: "CREAR",
            tabla: 'paciente',
            id_registro: response.data.id_paciente,
            datos_modificados: {
              estado_anterior: null,
              estado_nuevo: response.data,
              detalles_paciente: {
                nombre: response.data.nombre_paciente,
                apellidos: response.data.apellidos_paciente,
                dni: response.data.dni_paciente,
                email: response.data.email_paciente
              }
            },
            fecha_modificacion: new Date().toISOString()
          };

          await logAuditAction('CREAR_PACIENTE', detailedDescription);
          console.log('Auditoría creada con éxito');
        } catch (error) {
          console.error('Error al crear auditoría:', error);
        }

        onPacienteAdded(true);
        handleClose();
      } else {
        throw new Error('La respuesta del servidor no indica éxito');
      }
    } catch (error) {
      console.error('Error al guardar el paciente:', error);
      onPacienteAdded(false);
      setAlertMessage("Error al guardar el paciente. Por favor, intente nuevamente.");
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
                error={ touched.apellidos_paciente && errors.apellidos_paciente }
                helperText={touched.apellidos_paciente && errors.apellidos_paciente }
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
                helperText={touched.direccion_paciente && errors.direccion_paciente }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AutocompleteInput
                label="Tipo de Identificación"
                options={tipoIdentificacion}
                value={paciente.tipo_dni_paciente}
                onBlur={handleBlur}
                onChange={(newValue)=> handleAutocompleteChange("tipo_dni_paciente")(null,{value: newValue})}
                error={ errors.tipo_dni_paciente }
                helperText={ errors.tipo_dni_paciente }
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
                error={touched.telefono_paciente && errors.telefono_paciente }
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
              <Grid item xs={12}>
              <FileInput
                onChange={(file) => handleFileChange(file, 'imagen')}
                value={paciente.imagen}
                onRemove={() => handleRemoveFile('imagen')}
                disabled={false}
                inputName="Subir imagen paciente"
              />

              <FileInput
                onChange={(file) => handleFileChange(file, 'archivo_documentos_cedulas')}
                value={paciente.archivo_documentos_cedulas}
                onRemove={() => handleRemoveFile('archivo_documentos_cedulas')}
                disabled={false}
                inputName="Subir cédulas"
              />

              <FileInput
                onChange={(file) => handleFileChange(file, 'archivo_certificado_medico')}
                value={paciente.archivo_certificado_medico}
                onRemove={() => handleRemoveFile('archivo_certificado_medico')}
                disabled={false}
                inputName="Subir certificado médico"
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
          Añadir Paciente
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

export default ModalAddPaciente;