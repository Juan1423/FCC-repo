import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createExamen, updateExamen } from '../../../../services/examenServices';
// Add import
import { logAuditAction } from "../../../../services/auditoriaServices";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  borderRadius: theme.shape.borderRadius,
  maxWidth: '500px',
  width: '100%',
}));

const ExamenModal = ({ open, onClose, examen, onSave, selectedPaciente }) => {
  const [formData, setFormData] = useState({
    nombre_examen: '',
    comentario_examen: '',
    estado_examen: 'pendiente',
    fecha_solicitud_examen: new Date().toISOString().split('T')[0],
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (examen) {
      setFormData({
        nombre_examen: examen.nombre_examen,
        comentario_examen: examen.comentario_examen,
        estado_examen: examen.estado_examen,
        fecha_solicitud_examen: examen.fecha_solicitud_examen,
      });
    } else {
      setFormData({
        nombre_examen: '',
        comentario_examen: '',
        estado_examen: 'pendiente',
        fecha_solicitud_examen: new Date().toISOString().split('T')[0],
      });
    }
    setFile(null);
  }, [examen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      formDataObj.append('id_historia', selectedPaciente);
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });
      if (file) {
        formDataObj.append('archivo_examen', file);
      }

      if (examen) {
        await updateExamen(examen.id_examen, formDataObj);
        await logAuditAction('ACTUALIZAR_EXAMEN', { 
          datosAnteriores: examen, 
          datosNuevos: formData 
        });
      } else {
        const newExamen = await createExamen(formDataObj);
        await logAuditAction('CREAR_EXAMEN', { datosNuevos: newExamen });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <StyledModal open={open} onClose={onClose}>
      <ModalContent>
        <Typography variant="h6" component="h2">
          {examen ? 'Editar Examen' : 'Añadir Examen'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre del Examen"
            name="nombre_examen"
            value={formData.nombre_examen}
            onChange={handleInputChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Comentario"
            name="comentario_examen"
            value={formData.comentario_examen}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Fecha de Solicitud"
            name="fecha_solicitud_examen"
            type="date"
            value={formData.fecha_solicitud_examen}
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="estado-examen-label">Estado del Examen</InputLabel>
            <Select
              labelId="estado-examen-label"
              name="estado_examen"
              value={formData.estado_examen}
              onChange={handleInputChange}
            >
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="en proceso">En Proceso</MenuItem>
              <MenuItem value="completado">Completado</MenuItem>
            </Select>
          </FormControl>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ marginTop: '16px' }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {examen ? 'Actualizar' : 'Añadir'}
          </Button>
        </form>
      </ModalContent>
    </StyledModal>
  );
};

export default ExamenModal;