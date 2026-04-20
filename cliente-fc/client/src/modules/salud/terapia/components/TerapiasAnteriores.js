import React, { useState, useEffect } from 'react';
import { TabPanel } from '@mui/lab';
import { 
  Alert, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, 
  Button, Grid, FormControl, InputLabel, Select, MenuItem, TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Pagination
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import PdfGeneratorTerapias from '../../../../components/PdfGeneratorTerapias';
import { API_IMAGE_URL } from "../../../../services/apiConfig";
import TerapiaDetailsDialog from './TerapiaDetailsDialog'; // Asegúrate de que la ruta sea correcta
import { logAuditAction } from '../../../../services/auditoriaServices';
import { getCurrentUserId } from "../../../../utils/userUtils";

const tiposTerapia = [
  { id: 'all', name: 'Todas las Terapias' },
  { id: '1', name: 'Terapia de Lenguaje' },
  { id: '2', name: 'Terapia Física' },
  { id: '3', name: 'Terapia Ocupacional' },
];

const dateRangeOptions = [
  { id: '7d', name: 'Últimos 7 días' },
  { id: '2w', name: 'Últimas 2 semanas' },
  { id: '1m', name: 'Último mes' },
  { id: 'custom', name: 'Rango personalizado' },
];

const TerapiasAnteriores = ({ terapias, tipoTerapia, handleChangeTipoTerapia, handleUpdateTerapia, handleDeleteTerapia, tabValue, pacienteData }) => {
  const [dateRange, setDateRange] = useState('7d');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [terapiaToDelete, setTerapiaToDelete] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTerapia, setSelectedTerapia] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTerapia, setEditedTerapia] = useState(null);
  const [page, setPage] = useState(1);
  const [filteredTerapias, setFilteredTerapias] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    const filterTerapiasByDate = (terapias) => {
      let filteredTerapias = terapias;
      const now = dayjs();

      switch (dateRange) {
        case '7d':
          filteredTerapias = terapias.filter(t => dayjs(t.fecha_hora).isAfter(now.subtract(7, 'day')));
          break;
        case '2w':
          filteredTerapias = terapias.filter(t => dayjs(t.fecha_hora).isAfter(now.subtract(14, 'day')));
          break;
        case '1m':
          filteredTerapias = terapias.filter(t => dayjs(t.fecha_hora).isAfter(now.subtract(1, 'month')));
          break;
        case 'custom':
          if (startDate && endDate) {
            filteredTerapias = terapias.filter(t => 
              dayjs(t.fecha_hora).isAfter(startDate) && dayjs(t.fecha_hora).isBefore(endDate)
            );
          }
          break;
        default:
          break;
      }

      return filteredTerapias;
    };

    const filtered = filterTerapiasByDate(
      tipoTerapia === 'all'
        ? terapias
        : terapias.filter(terapia => terapia.id_tipo_terapia === tipoTerapia)
    );
    setFilteredTerapias(filtered);
    setPage(1);
  }, [terapias, tipoTerapia, dateRange, startDate, endDate]);

  const handleChangeDateRange = (event) => {
    const value = event.target.value;
    setDateRange(value);
    if (value !== 'custom') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleInputChange = (name, value) => {
    setEditedTerapia(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTerapiaToDelete(null);
  };

  const handleOpenEdit = (terapia) => {
    setSelectedTerapia(terapia);
    setEditedTerapia({ ...terapia }); // Crear una copia del objeto terapia
    setEditMode(true);
    setOpenModal(true);
  };
  
  const handleSaveEdit = async () => {
    if (editedTerapia) {
      try {
        const loggedInUserId = getCurrentUserId();
        if (!loggedInUserId) {
          throw new Error('No user logged in');
        }

        const updatedTerapia = await handleUpdateTerapia(editedTerapia.id_terapia, editedTerapia);
        
        const detailedDescription = {
          accion: "EDITAR",
          tabla: 'terapias',
          id_registro: editedTerapia.id_terapia,
          datos_modificados: {
            estado_anterior: selectedTerapia,
            estado_nuevo: editedTerapia,
            detalles_cambios: {
              tipo_operacion: "Actualización de Terapia",
              campos_modificados: Object.keys(editedTerapia).filter(key => 
                editedTerapia[key] !== selectedTerapia[key]
              ),
              fecha_modificacion: new Date().toISOString()
            }
          },
          fecha_modificacion: new Date().toISOString()
        };

        await logAuditAction('EDITAR_TERAPIA', detailedDescription);

        setFilteredTerapias(prevTerapias => 
          prevTerapias.map(t => t.id_terapia === updatedTerapia.id_terapia ? updatedTerapia : t)
        );
        handleCloseModal();
      } catch (error) {
        console.error("Error updating terapia:", error);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (terapiaToDelete) {
      try {
        const loggedInUserId = getCurrentUserId();
        if (!loggedInUserId) {
          throw new Error('No user logged in');
        }

        await handleDeleteTerapia(terapiaToDelete.id_terapia);

        const detailedDescription = {
          accion: "ELIMINAR",
          tabla: 'terapias',
          id_registro: terapiaToDelete.id_terapia,
          datos_modificados: {
            estado_anterior: terapiaToDelete,
            estado_nuevo: null,
            detalles_eliminacion: {
              tipo_operacion: "Eliminación de Terapia",
              fecha_eliminacion: new Date().toISOString(),
              tipo_terapia: tiposTerapia.find(t => t.id === terapiaToDelete.id_tipo_terapia)?.name
            }
          },
          fecha_modificacion: new Date().toISOString()
        };

        await logAuditAction('ELIMINAR_TERAPIA', detailedDescription);

        handleCloseDeleteDialog();
        setFilteredTerapias(prevTerapias => 
          prevTerapias.filter(t => t.id_terapia !== terapiaToDelete.id_terapia)
        );
      } catch (error) {
        console.error("Error deleting terapia:", error);
      }
    }
  };

  const handleOpenModal = (terapia) => {
    setSelectedTerapia(terapia);
    setEditedTerapia(null);
    setEditMode(false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditMode(false);
    setEditedTerapia(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedTerapias = filteredTerapias.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <TabPanel value="1">
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel id="tipo-terapia-label">Tipo de Terapia</InputLabel>
            <Select
              labelId="tipo-terapia-label"
              value={tipoTerapia}
              label="Tipo de Terapia"
              onChange={(e) => handleChangeTipoTerapia(e.target.value)}
            >
              {tiposTerapia.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id}>{tipo.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel id="date-range-label">Rango de fechas</InputLabel>
            <Select
              labelId="date-range-label"
              value={dateRange}
              label="Rango de fechas"
              onChange={handleChangeDateRange}
            >
              {dateRangeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {dateRange === 'custom' && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label="Fecha inicial"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label="Fecha final"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </LocalizationProvider>
        )}
        <Grid item xs={12} sm={3}>
          <PdfGeneratorTerapias terapias={filteredTerapias} paciente={pacienteData} />
        </Grid>
      </Grid>

      {filteredTerapias.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay terapias {tipoTerapia !== 'all' ? `de tipo ${tiposTerapia.find(t => t.id === tipoTerapia)?.name}` : ''} registradas para este paciente en el rango de fechas seleccionado.
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="tabla de terapias anteriores">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo de Terapia</TableCell>
                  <TableCell>Nota</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
        {paginatedTerapias.map((terapia, index) => (
          <TableRow key={terapia.id_terapia}>
            <TableCell>{tiposTerapia.find(t => t.id === terapia.id_tipo_terapia)?.name || 'Desconocido'}</TableCell>
            <TableCell>{terapia.notas_evolucion}</TableCell>
            <TableCell>{dayjs(terapia.fecha_hora).format('DD/MM/YYYY HH:mm')}</TableCell>
            <TableCell>
              <Button variant="outlined" size="small" onClick={() => handleOpenModal(terapia)} sx={{ mr: 1 }}>Ver más</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={Math.ceil(filteredTerapias.length / itemsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
            sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
          />
        </>
      )}

        <TerapiaDetailsDialog
        open={openModal}
        onClose={handleCloseModal}
        terapia={editMode ? editedTerapia : selectedTerapia}
        editMode={editMode}
        onEdit={handleOpenEdit}
        onSave={handleSaveEdit}
        onInputChange={handleInputChange}
        tiposTerapia={tiposTerapia}
        API_IMAGE_URL={API_IMAGE_URL}
      />
        <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Estás seguro de que quieres eliminar esta terapia?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción no se puede deshacer. ¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </TabPanel>
  );
};

export default TerapiasAnteriores;