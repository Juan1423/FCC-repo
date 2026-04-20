import React, { useState, useEffect, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
  Button, Modal, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, IconButton, Typography, CircularProgress, Select, MenuItem, Snackbar, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EditIcon from '@mui/icons-material/Edit';
import { getExamenByHistoria, createExamen, deleteExamen, updateExamen } from '../../../services/examenServices';
import { usePacienteContext } from '../../../components/base/PacienteContext';
import { API_IMAGE_URL } from "../../../services/apiConfig";
import { logAuditAction } from '../../../services/auditoriaServices';
import { getCurrentUserId } from "../../../utils/userUtils";

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

const Tratamiento = ({ formData, setFormData }) => {
  const { selectedPaciente } = usePacienteContext();
  const [openMed, setOpenMed] = useState(false);
  const [openExam, setOpenExam] = useState(false);
  const [newMedicamento, setNewMedicamento] = useState({ medicamento: '', presentacion: '', dosis: '' });
  const [newExamen, setNewExamen] = useState({
    nombre_examen: '',
    comentario_examen: '',
    estado_examen: 'pendiente',
    fecha_solicitud_examen: new Date().toISOString().split('T')[0]
  });
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [editingExamen, setEditingExamen] = useState(null);
  const [examenesLoaded, setExamenesLoaded] = useState(false);

  const fetchExamenes = useCallback(async () => {
    if (!selectedPaciente) {
      setError("ID de paciente no disponible. No se pueden cargar exámenes.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getExamenByHistoria(selectedPaciente);
      setExamenes(response);
      setExamenesLoaded(true);
    } catch (error) {
      console.error('Error fetching examenes:', error);
      setError("Error al cargar exámenes. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [selectedPaciente]);

  useEffect(() => {
    if (!formData.medicamentos) {
      setFormData(prevData => ({ ...prevData, medicamentos: [] }));
    }
    if (selectedPaciente && !examenesLoaded) {
      fetchExamenes();
    }
  }, [formData, setFormData, selectedPaciente, fetchExamenes, examenesLoaded]);

  const handleOpenMed = () => setOpenMed(true);
  const handleCloseMed = () => setOpenMed(false);
  const handleOpenExam = () => setOpenExam(true);
  const handleCloseExam = () => {
    setOpenExam(false);
    setEditingExamen(null);
    setNewExamen({
      nombre_examen: '',
      comentario_examen: '',
      estado_examen: 'pendiente',
      fecha_solicitud_examen: new Date().toISOString().split('T')[0]
    });
    setFile(null);
  };

  const handleAddMedicamento = () => {
    setFormData(prevData => ({
      ...prevData,
      medicamentos: [...(prevData.medicamentos || []), newMedicamento]
    }));
    setNewMedicamento({ medicamento: '', presentacion: '', dosis: '' });
    handleCloseMed();
  };

  const handleAddExamen = async () => {
    if (!selectedPaciente) {
      setError("ID de paciente no disponible. No se puede añadir el examen.");
      return;
    }

    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error('No user logged in');
      }

      const formDataExamen = new FormData();
      formDataExamen.append('id_historia', selectedPaciente);
      formDataExamen.append('nombre_examen', newExamen.nombre_examen);
      formDataExamen.append('comentario_examen', newExamen.comentario_examen);
      formDataExamen.append('estado_examen', newExamen.estado_examen);
      formDataExamen.append('fecha_solicitud_examen', newExamen.fecha_solicitud_examen);
      if (file) {
        formDataExamen.append('archivo_examen', file);
      }

      let response;
      if (editingExamen) {
        response = await updateExamen(editingExamen.id_examen, formDataExamen);
        
        const auditDescription = {
          accion: "EDITAR",
          tabla: 'examenes',
          id_registro: editingExamen.id_examen,
          datos_modificados: {
            estado_anterior: editingExamen,
            estado_nuevo: { ...newExamen, archivo: file?.name },
            detalles_cambios: {
              tipo_operacion: "Actualización de Examen",
              campos_modificados: Object.keys(newExamen).filter(key => 
                newExamen[key] !== editingExamen[key]
              ),
              fecha_modificacion: new Date().toISOString()
            }
          },
          fecha_modificacion: new Date().toISOString()
        };

        await logAuditAction('ACTUALIZAR_EXAMEN', auditDescription);
      } else {
        response = await createExamen(formDataExamen);
        
        const auditDescription = {
          accion: "CREAR",
          tabla: 'examenes',
          id_registro: response.id_examen,
          datos_modificados: {
            estado_anterior: null,
            estado_nuevo: { ...newExamen, archivo: file?.name },
            detalles_creacion: {
              tipo_operacion: "Nuevo Examen",
              paciente_id: selectedPaciente,
              fecha_creacion: new Date().toISOString()
            }
          },
          fecha_modificacion: new Date().toISOString()
        };

        await logAuditAction('CREAR_EXAMEN', auditDescription);
      }
      
      fetchExamenes();
      handleCloseExam();
    } catch (error) {
      console.error('Error adding/updating examen:', error);
      setError("Error al añadir/actualizar el examen. Por favor, intente nuevamente.");
    }
  };
  
  const handleTratamiento = (e) => {
    setFormData(prevData => ({ ...prevData, tratamiento: e.target.value }));
  };

  const handleDeleteMedicamento = (index) => {
    setFormData(prevData => ({
      ...prevData,
      medicamentos: prevData.medicamentos.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteExamen = async (id) => {
    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error('No user logged in');
      }

      const examenToDelete = examenes.find(e => e.id_examen === id);
      await deleteExamen(id);

      const auditDescription = {
        accion: "ELIMINAR",
        tabla: 'examenes',
        id_registro: id,
        datos_modificados: {
          estado_anterior: examenToDelete,
          estado_nuevo: null,
          detalles_eliminacion: {
            tipo_operacion: "Eliminación de Examen",
            paciente_id: selectedPaciente,
            fecha_eliminacion: new Date().toISOString()
          }
        },
        fecha_modificacion: new Date().toISOString()
      };

      await logAuditAction('ELIMINAR_EXAMEN', auditDescription);

      fetchExamenes();
    } catch (error) {
      console.error('Error deleting examen:', error);
      setError("Error al eliminar el examen. Por favor, intente nuevamente.");
    }
  };

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleEditExamen = (examen) => {
    setEditingExamen(examen);
    setNewExamen({
      nombre_examen: examen.nombre_examen,
      comentario_examen: examen.comentario_examen,
      estado_examen: examen.estado_examen,
      fecha_solicitud_examen: examen.fecha_solicitud_examen
    });
    handleOpenExam();
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpdateExamenStatus = async (id, newStatus) => {
    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error('No user logged in');
      }
      const examenToUpdate = examenes.find(e => e.id_examen === id);
      await updateExamen(id, { estado_examen: newStatus });

      const auditDescription = {
        accion: "EDITAR",
        tabla: 'examenes',
        id_registro: id,
        datos_modificados: {
          estado_anterior: { estado_examen: examenToUpdate.estado_examen },
          estado_nuevo: { estado_examen: newStatus },
          detalles_cambios: {
            tipo_operacion: "Actualización de Estado de Examen",
            campo_modificado: "estado_examen",
            valor_anterior: examenToUpdate.estado_examen,
            valor_nuevo: newStatus,
            fecha_modificacion: new Date().toISOString()
          }
        },
        fecha_modificacion: new Date().toISOString()
      };

      await logAuditAction('ACTUALIZAR_ESTADO_EXAMEN', auditDescription);

      fetchExamenes();
    } catch (error) {
      console.error('Error updating examen status:', error);
      setError("Error al actualizar el estado del examen. Por favor, intente nuevamente.");
    }
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(null);
  };

  return (
    <Box>
      <TextField
        label="Descripción del Plan de Tratamiento"
        multiline
        rows={4}
        value={formData.tratamiento || ''}
        onChange={handleTratamiento}
        fullWidth
        margin="normal"
      />
      
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Medicamentos</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['Medicamento', 'Presentación', 'Dosis', 'Eliminar'].map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.medicamentos && formData.medicamentos.map((med, index) => (
              <TableRow key={index}>
                {Object.values(med).map((value, i) => (
                  <TableCell key={i}>{value}</TableCell>
                ))}
                <TableCell>
                  <IconButton onClick={() => handleDeleteMedicamento(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" onClick={handleOpenMed} sx={{ mt: 2 }}>
        Añadir Medicamento
      </Button>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Exámenes</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {['Nombre', 'Comentario', 'Fecha Solicitud', 'Estado', 'Adjunto', 'Acciones'].map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {examenes.map((examen) => (
                <TableRow key={examen.id_examen}>
                  <TableCell>{examen.nombre_examen}</TableCell>
                  <TableCell>{examen.comentario_examen}</TableCell>
                  <TableCell>{new Date(examen.fecha_solicitud_examen).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select
                      value={examen.estado_examen}
                      onChange={(e) => handleUpdateExamenStatus(examen.id_examen, e.target.value)}
                    >
                      <MenuItem value="pendiente">Pendiente</MenuItem>
                      <MenuItem value="en proceso">En Proceso</MenuItem>
                      <MenuItem value="completado">Completado</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {examen.url_examen ? (
                      <IconButton href={`${API_IMAGE_URL}${examen.url_examen}`} target="_blank">
                        <AttachFileIcon />
                      </IconButton>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditExamen(examen)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteExamen(examen.id_examen)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleOpenExam} 
        sx={{ mt: 2 }}
        disabled={!selectedPaciente}
      >
        Añadir Examen
      </Button>

      <StyledModal open={openMed} onClose={handleCloseMed}>
        <ModalContent>
          <h2>Añadir Medicamento</h2>
          {['medicamento', 'presentacion', 'dosis'].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              value={newMedicamento[field]}
              onChange={(e) => handleInputChange(e, setNewMedicamento)}
              fullWidth
              margin="normal"
            />
          ))}
          <Button variant="contained" color="primary" onClick={handleAddMedicamento} sx={{ mt: 2 }}>
            Añadir
          </Button>
        </ModalContent>
      </StyledModal>

      <StyledModal open={openExam} onClose={handleCloseExam}>
        <ModalContent>
          <h2>{editingExamen ? 'Editar Examen' : 'Añadir Examen'}</h2>
          <TextField
            label="Nombre del Examen"
            name="nombre_examen"
            value={newExamen.nombre_examen}
            onChange={(e) => handleInputChange(e, setNewExamen)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Comentario"
            name="comentario_examen"
            value={newExamen.comentario_examen}
            onChange={(e) => handleInputChange(e, setNewExamen)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Fecha de Solicitud"
            name="fecha_solicitud_examen"
            type="date"
            value={newExamen.fecha_solicitud_examen}
            onChange={(e) => handleInputChange(e, setNewExamen)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Select
            value={newExamen.estado_examen}
            onChange={(e) => handleInputChange(e, setNewExamen)}
            fullWidth
            name="estado_examen"
            margin="normal"
          >
            <MenuItem value="pendiente">Pendiente</MenuItem>
            <MenuItem value="en proceso">En Proceso</MenuItem>
            <MenuItem value="completado">Completado</MenuItem>
          </Select>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ marginTop: '16px' }}
          />
          <Button variant="contained" color="primary" onClick={handleAddExamen} sx={{ mt: 2 }}>
            {editingExamen ? 'Actualizar' : 'Añadir'}
          </Button>
        </ModalContent>
      </StyledModal>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Tratamiento;