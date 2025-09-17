import React, { useState, useEffect } from 'react';
import { FormControl, FormLabel, RadioGroup, Radio, Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Stepper, Step, StepLabel, TextField, FormControlLabel, IconButton, Typography } from '@mui/material';
import { getHistoria, createHistoria, updateHistoria } from '../../../services/historiaServices';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AntecedentesFamiliares from './AntecedentesFamiliares';
import AntecedentesPersonales from './AntecedentesPersonales';
import { logAuditAction } from '../../../services/auditoriaServices';
import { getCurrentUserId } from "../../../utils/userUtils";
const AddModalHistoria = ({ open, onClose, historiaId, onHistoriaUpdated, setIsNewHistory, isNewHistory}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [newMedicamento, setNewMedicamento] = useState('');
  const [newAlergia, setNewAlergia] = useState('');

  const [historia, setHistoria] = useState({
    // Registro de Admisión
    medicamentos: [],
    alergias: [],
    diagnostico_presuntivo: '',
    seguro_social: false,


    // Antecedentes Familiares
    ant_familiares_materno: {
      apellidos: '',
      nombres: '',
      nacionalidad: '',
      no_cedula: '',
      edad: '',
      ocupacion: '',
      lugar_trabajo: '',
      direccion_trabajo: '',
      relacion_padre: '',
      horario_trabajo: '',
      estado_civil: '',
      escolaridad: '',
      enfermedades: '',
      alergias: '',
      medicamentos: ''
    },
    ant_familiares_paterno: {
      apellidos: '',
      nombres: '',
      nacionalidad: '',
      no_cedula: '',
      edad: '',
      ocupacion: '',
      lugar_trabajo: '',
      direccion_trabajo: '',
      relacion_madre: '',
      horario_trabajo: '',
      estado_civil: '',
      escolaridad: '',
      enfermedades: '',
      alergias: '',
      medicamentos: ''
    },
    otros_antecedentes: {
      hijo_unico: false,
      no_hijos: '',
      posicion_familia: '',
      relacion_hermanos: '',
      familiares_enfermedades: ''
    },

    // Motivo de Consulta
    motivo_consulta_historia: '',

    // Antecedentes Prenatales
    ant_prenatales: {
      edad_gestacion: '',
      deseado: '',
      planificacion_familiar: '',
      habitos: '',
      ecografias: '',
      controles: '',
      alimentacion_adecuada: false,
      estado_emocional: '',
      causas_estado_emocional: '',
      abortos: '',
      causas_abortos: '',
      enfermedades_padecidas: [],
      medicamentos: '',
      acido_folico: '',
      amenaza_aborto: '',
      caidas: '',
      disfuncion_placentaria: '',
      preclampsia: '',
      diabetes_gestacional: '',
      otros: ''
    },

    // Antecedentes Perinatales
    ant_perinatales: {
      semanas_nacimiento: '',
      tipo_parto: '',
      peso: '',
      talla: '',
      perimetro_cefalico: '',
      apgar: '',
      llanto_inmediato: '',
      succion: '',
      complicaciones: [],
      incubadora: '',
      motivos_incubadora: ''
    },

    // Antecedentes Postnatales
    ant_postnatales: {
      convulsiones: '',
      vacunas: '',
      lactancia: '',
      enfermedades_padecidas: '',
      medicamentos: '',
      control_esfinteres: '',
      sedestacion: '',
      bipedestacion: '',
      control_cefalico: '',
      gateo: '',
      volteo: '',
      marcha: '',
      observaciones: '',
      problemas: '',
      caidas: '',
    },

    // Tratamientos recibidos
    tratamientos_recibidos: [],

    // Observaciones
    observaciones: ''
  });


  const steps = ['Datos de Consulta', 'Antecedentes Familiares', 'Antecedentes Pre/Peri/Posnatales', 'Datos Adicionales'];

  useEffect(() => {
    if (open && historiaId) {
      const fetchHistoria = async () => {
        try {
          const data = await getHistoria(historiaId);
          setHistoria(prevHistoria => ({
            ...prevHistoria,
            ...data,
            medicamentos: data.medicamentos || [],
            alergias: data.alergias || [],
            tratamientos_recibidos: data.tratamientos_recibidos || [],
          }));
        } catch (error) {
          console.error('Error fetching historia:', error);
        }
      };
      fetchHistoria();
    }
  }, [open, historiaId]);

  const handleAddItem = (field) => {
    if (field === 'medicamentos' && newMedicamento) {
      setHistoria((prevHistoria) => ({
        ...prevHistoria,
        medicamentos: [...prevHistoria.medicamentos, newMedicamento],
      }));
      setNewMedicamento('');
    } else if (field === 'alergias' && newAlergia) {
      setHistoria((prevHistoria) => ({
        ...prevHistoria,
        alergias: [...prevHistoria.alergias, newAlergia],
      }));
      setNewAlergia('');
    }
  };

  const handleRemoveItem = (field, index) => {
    setHistoria((prevHistoria) => ({
      ...prevHistoria,
      [field]: prevHistoria[field].filter((_, i) => i !== index),
    }));
  };


  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (field, value) => {
    setHistoria((prevHistoria) => ({
      ...prevHistoria,
      [field]: value,
    }));
  };

  const handleNestedChange = (parentField, field, value) => {
    setHistoria((prevHistoria) => ({
      ...prevHistoria,
      [parentField]: {
        ...(prevHistoria[parentField] || {}),
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (field, value) => {
    setHistoria((prevHistoria) => ({
      ...prevHistoria,
      [field]: value.split(',').map(item => item.trim()),
    }));
  };

  const handleSubmit = async () => {
    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error('No user logged in');
      }
  
      let response;
      if (isNewHistory) {
        response = await createHistoria(historiaId, historia);
      } else {
        response = await updateHistoria(historiaId, historia);
      }
  
      const detailedDescription = {
        accion: isNewHistory ? "CREAR" : "EDITAR",
        tabla: 'historia',
        id_registro: historiaId,
        datos_modificados: {
          estado_anterior: isNewHistory ? null : await getHistoria(historiaId),
          estado_nuevo: historia,
          detalles_cambios: {
            tipo_operacion: isNewHistory ? "Creación de Historia" : "Actualización de Historia",
            motivo_consulta: historia.motivo_consulta_historia,
            seguro_social: historia.seguro_social,
            medicamentos: historia.medicamentos,
            alergias: historia.alergias,
            diagnostico: historia.diagnostico_presuntivo
          }
        },
        fecha_modificacion: new Date().toISOString()
      };
  
      const operacion = isNewHistory ? 'CREAR_HISTORIA' : 'EDITAR_HISTORIA';
      await logAuditAction(operacion, detailedDescription);
      
      if (onHistoriaUpdated) {
        onHistoriaUpdated(response);
      }
      onClose();
    } catch (error) {
      console.error('Error saving historia:', error);
      alert('Error al guardar la historia clínica');
    }
  };
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">El paciente tiene seguro social?</FormLabel>
              <RadioGroup
                row
                aria-label="seguro_social"
                name="seguro_social"
                value={historia.seguro_social ? 'sí' : 'no'}
                onChange={(e) => handleChange('seguro_social', e.target.value === 'sí')}
              >
                <FormControlLabel value="sí" control={<Radio />} label="Sí" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            <TextField label="Motivo de Consulta" value={historia.motivo_consulta_historia} onChange={(e) => handleChange('motivo_consulta_historia', e.target.value)} fullWidth multiline rows={4} />
          </Box>

        );
      case 1:
        return (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AntecedentesFamiliares
              historia={historia}
              handleNestedChange={handleNestedChange}
            />
          </Box>
        );
      case 2:
        return (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AntecedentesPersonales
              historia={historia}
              handleNestedChange={handleNestedChange}
            />
          </Box>
        );
        case 3:
          return (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <h3>Datos Adicionales</h3>
              <Box display="flex" alignItems="center">
                <TextField
                  label="Medicamentos actuales del paciente"
                  value={newMedicamento}
                  onChange={(e) => setNewMedicamento(e.target.value)}
                  fullWidth
                  sx={{ flexGrow: 1, marginRight: 1 }}
                />
                <IconButton onClick={() => handleAddItem('medicamentos')}>
                  <AddIcon />
                </IconButton>
              </Box>
              {(historia.medicamentos || []).map((med, index) => (
                <Box key={index} display="flex" alignItems="center">
                  <Typography sx={{ flexGrow: 1 }}>{med}</Typography>
                  <IconButton onClick={() => handleRemoveItem('medicamentos', index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
  
              <Box display="flex" alignItems="center">
                <TextField
                  label="Alergias del Paciente"
                  value={newAlergia}
                  onChange={(e) => setNewAlergia(e.target.value)}
                  fullWidth
                  sx={{ flexGrow: 1, marginRight: 1 }}
                />
                <IconButton onClick={() => handleAddItem('alergias')}>
                  <AddIcon />
                </IconButton>
              </Box>
              {(historia.alergias || []).map((alergia, index) => (
                <Box key={index} display="flex" alignItems="center">
                  <Typography sx={{ flexGrow: 1 }}>{alergia}</Typography>
                  <IconButton onClick={() => handleRemoveItem('alergias', index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
  
              <TextField
                label="Diagnóstico Diferencial o Presuntivo"
                value={historia.diagnostico_presuntivo || ''}
                onChange={(e) => handleChange('diagnostico_presuntivo', e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
  
              <TextField
                label="Tratamientos Recibidos"
                value={(historia.tratamientos_recibidos || []).join(', ')}
                onChange={(e) => handleArrayChange('tratamientos_recibidos', e.target.value)}
                fullWidth
                multiline
                helperText="Ingrese los tratamientos separados por comas"
              />
              <TextField
                label="Observaciones"
                value={historia.observaciones || ''}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
            </Box>
          );
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isNewHistory ? 'Registrar' : 'Editar'} Historia Clínica</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isNewHistory ? 'Registrar' : 'Guardar'}
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained" color="primary">
            Siguiente
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddModalHistoria;