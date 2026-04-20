import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
  TextField,
  Box
} from '@mui/material';
import dayjs from 'dayjs';
import { Edit as EditIcon, AccessTime as AccessTimeIcon, Note as NoteIcon, Medication as MedicationIcon, AttachFile as AttachFileIcon, LocalHospital as LocalHospitalIcon } from '@mui/icons-material';

const TerapiaDetailsDialog = ({ open, onClose, terapia, editMode, onEdit, onSave, onInputChange, tiposTerapia, API_IMAGE_URL }) => {
  if (!terapia) {
    return null;
  }

  const handleInputChange = (name, value) => {
    onInputChange(name, value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {editMode ? 'Editar Terapia' : 'Detalles de la Terapia'}
        </Typography>
        {!editMode && (
          <Button startIcon={<EditIcon />} onClick={() => onEdit(terapia)} variant="contained" color="secondary">
            Editar
          </Button>
        )}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, height: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ mr: 1 }} /> Fecha y Hora
                </Typography>
                <Typography variant="h5" sx={{ mt: 2 }}>
                  {dayjs(terapia.fecha_hora || new Date()).format('DD/MM/YYYY HH:mm')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, height: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <LocalHospitalIcon sx={{ mr: 1 }} /> Tipo de Terapia
                </Typography>
                <Typography variant="h5" sx={{ mt: 2 }}>
                  {tiposTerapia.find(t => t.id === terapia.id_tipo_terapia)?.name || 'Desconocido'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <NoteIcon sx={{ mr: 1 }} /> Notas de Evolución
            </Typography>
            {editMode ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={terapia.notas_evolucion || ''}
                onChange={(e) => handleInputChange('notas_evolucion', e.target.value)}
              />
            ) : (
              <Typography variant="body1">{terapia.notas_evolucion || 'Sin notas'}</Typography>
            )}
          </Paper>
          
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <MedicationIcon sx={{ mr: 1 }} /> Farmacoterapia e Indicaciones
            </Typography>
            {editMode ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={terapia.farmacoterapia_indicaciones || ''}
                onChange={(e) => handleInputChange('farmacoterapia_indicaciones', e.target.value)}
              />
            ) : (
              <Typography variant="body1">{terapia.farmacoterapia_indicaciones || 'No especificado'}</Typography>
            )}
          </Paper>
          
          {terapia.url_adjunto && (
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <AttachFileIcon sx={{ mr: 1 }} /> Adjunto
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AttachFileIcon />}
                href={`${API_IMAGE_URL}${terapia.url_adjunto}`} 
                target="_blank"
              >
                Ver Adjunto
              </Button>
            </Paper>
          )}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
        {editMode ? (
          <>
            <Button onClick={onClose} variant="outlined">Cancelar</Button>
            <Button onClick={() => onSave(terapia)} variant="contained" color="primary">Guardar</Button>
          </>
        ) : (
          <Button onClick={onClose} variant="contained">Cerrar</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TerapiaDetailsDialog;