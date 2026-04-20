import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EditIcon from '@mui/icons-material/Edit';
import { getExamenByHistoria, deleteExamen, updateExamen } from '../../../../services/examenServices';
import { usePacienteContext } from '../../../../components/base/PacienteContext';
import { API_IMAGE_URL } from "../../../../services/apiConfig";
import ExamenModal from './ExamenModal'; // Asumimos que crearás este componente
// Add import
import { logAuditAction } from "../../../../services/auditoriaServices";

const ExamenesTabView = () => {
  const { selectedPaciente } = usePacienteContext();
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openExamModal, setOpenExamModal] = useState(false);
  const [editingExamen, setEditingExamen] = useState(null);

  const fetchExamenes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getExamenByHistoria(selectedPaciente);
      setExamenes(response);
    } catch (error) {
      console.error('Error fetching examenes:', error);
      setError("Error al cargar exámenes. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [selectedPaciente]);

  useEffect(() => {
    if (selectedPaciente) {
      fetchExamenes();
    } else {
      setError("ID de paciente no disponible. No se pueden cargar exámenes.");
    }
  }, [selectedPaciente, fetchExamenes]);

  const handleOpenExamModal = (examen = null) => {
    setEditingExamen(examen);
    setOpenExamModal(true);
  };

  const handleCloseExamModal = () => {
    setOpenExamModal(false);
    setEditingExamen(null);
  };

  const handleDeleteExamen = async (id) => {
    try {
      const examenToDelete = examenes.find(e => e.id_examen === id);
      await deleteExamen(id);
      if (examenToDelete) {
        await logAuditAction('ELIMINAR_EXAMEN', { datosEliminados: examenToDelete });
      }
      fetchExamenes();
    } catch (error) {
      console.error('Error deleting examen:', error);
    }
  };
  const handleUpdateExamenStatus = async (id, newStatus) => {
    try {
      await updateExamen(id, { estado_examen: newStatus });
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
                    <IconButton onClick={() => handleOpenExamModal(examen)}>
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
        onClick={() => handleOpenExamModal()} 
        sx={{ mt: 2 }}
        disabled={!selectedPaciente}
      >
        Añadir Examen
      </Button>

      <ExamenModal
        open={openExamModal}
        onClose={handleCloseExamModal}
        examen={editingExamen}
        onSave={fetchExamenes}
        selectedPaciente={selectedPaciente}
      />

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExamenesTabView;