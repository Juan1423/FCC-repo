import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Box, Container, Button, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Snackbar, Alert, Tooltip, 
  IconButton, Popover, Typography, Fab
} from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NavbarAdmin from '../../../../components/NavbarAdmin';
import Drawer from '../../../../components/Drawer';
import TablaPaciente from '../components/TablaPaciente';
import ModalAddPaciente from '../components/modalAddPaciente';
import ModalEditPaciente from '../components/modalEditPaciente';
import BuscarPaciente from '../components/buscarPaciente';
import { deleteLogicalPaciente, getPaciente, getPacientes } from '../../../../services/pacientesServices';
import { logAuditAction } from "../../../../services/auditoriaServices";
import "dayjs/locale/en-gb";
import dayjs from 'dayjs';
dayjs.locale("en-gb"); // Set dayjs locale to British English

const Paciente = () => {
  // State declarations
  const [pacientes, setPacientes] = useState([]); // Stores the list of patients
  const [drawerOpen, setDrawerOpen] = React.useState(false); // Controls the drawer open/close state
  const [loading, setLoading] = useState(true); // Indicates if data is being loaded
  const [modalOpen, setModalOpen] = React.useState(false); // Controls the "Add Patient" modal
  const [alertOpen, setAlertOpen] = React.useState(false); // Controls the alert dialog
  const [editModalOpen, setEditModalOpen] = useState(false); // Controls the "Edit Patient" modal
  const [selectedPaciente, setSelectedPaciente] = useState(null); // Stores the selected patient for editing
  const [pacienteToDelete, setPacienteToDelete] = useState(null); // Stores the patient object for the delete operation
  const [selectedStatePaciente, setSelectedStatePaciente] = useState(null); // Stores the state of the selected patient for the dialog message
  const [filterCriteria, setFilterCriteria] = useState({ name: '', activeOnly: true }); // Stores search and filter criteria
  const [successAlert, setSuccessAlert] = useState(false); // Controls the success alert
  const [errorAlert, setErrorAlert] = useState(false); // Controls the error alert
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleInfoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // Fetch patients data on component mount
  useEffect(() => {
    fetchPacientes();
  }, []);

  // Function to fetch patients data
  const fetchPacientes = async () => {
    setLoading(true);
    try {
      var data = await getPacientes();
      data.sort((a, b) => a.id_paciente - b.id_paciente); // Sort patients by ID
      setPacientes(data);
    } catch (error) {
      console.error("Error fetching pacientes:", error);
      setErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle drawer open/close
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Close edit modal
  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  // Handle patient addition result
  const handlePacienteAdded = (success) => {
    if (success) {
      fetchPacientes();
      setSuccessAlert(true);
    } else {
      setErrorAlert(true);
    }
  };

  // Handle edit patient action
  const handleEdit = async (id) => {
    const paciente = await getPaciente(id);
    paciente.fecha_paciente = dayjs(paciente.fecha_paciente).format('YYYY-MM-DD');
    setSelectedPaciente(paciente);
    setEditModalOpen(true);
  };

  // Step 1 of delete: Get patient data and open confirmation dialog
  const handleDelete = async (id) => {
    try {
      const paciente = await getPaciente(id);
      setPacienteToDelete(paciente);
      setSelectedStatePaciente(paciente.estado_paciente);
      handleAlertOpen();
    } catch (error) {
      console.error("Error preparing patient for deletion:", error);
      setErrorAlert(true);
    }
  };

  // Open "Add Patient" modal
  const handleModalOpen = () => {
    setModalOpen(true);
  };

  // Close "Add Patient" modal
  const handleModalClose = () => {
    setModalOpen(false);
  };

  // Open alert dialog
  const handleAlertOpen = () => {
    setAlertOpen(true);
  };

  // Close alert dialog
  const handleAlertClose = () => {
    setAlertOpen(false);
    setPacienteToDelete(null);
  };

  // Step 2 of delete: Complete the action after confirmation
  const handleCompleteDelete = async () => {
    if (!pacienteToDelete) return;

    try {
      // Perform the logical delete
      await deleteLogicalPaciente(pacienteToDelete.id_paciente);

      // Log the audit action AFTER the operation is successful
      const action = pacienteToDelete.estado_paciente ? "DESACTIVAR_PACIENTE" : "ACTIVAR_PACIENTE";
      const detailedDescription = {
        accion: action,
        tabla: 'paciente',
        id_registro: pacienteToDelete.id_paciente,
        datos_modificados: {
          estado_anterior: pacienteToDelete.estado_paciente,
          estado_nuevo: !pacienteToDelete.estado_paciente,
          detalles_paciente: {
            nombre: pacienteToDelete.nombre_paciente,
            apellidos: pacienteToDelete.apellidos_paciente,
            dni: pacienteToDelete.dni_paciente,
            email: pacienteToDelete.email_paciente
          }
        },
        fecha_modificacion: new Date().toISOString()
      };

      await logAuditAction(action, detailedDescription);

      // Refresh data and close dialog
      fetchPacientes();
      handleAlertClose();
    } catch (error) {
      console.error("Error completing deletion or audit:", error);
      setErrorAlert(true);
    }
  };

  // Handle search action
  const handleSearch = (name, activeOnly) => {
    setFilterCriteria({ name, activeOnly });
  };

  // Handle filter change
  const handleFilterChange = (activeOnly) => {
    setFilterCriteria(prevCriteria => ({ ...prevCriteria, activeOnly }));
  };

  // Filter patients based on search criteria
  const filteredPacientes = pacientes.filter(paciente => {
    if (!paciente) return false;

    const nameMatch = (paciente.nombre_paciente?.toLowerCase().includes(filterCriteria.name.toLowerCase()) ||
                       paciente.apellids_paciente?.toLowerCase().includes(filterCriteria.name.toLowerCase()) ||
                       paciente.dni_paciente?.includes(filterCriteria.name)) ?? false;
    
    const activeMatch = !filterCriteria.activeOnly || paciente.estado_paciente;
    
    return nameMatch && activeMatch;
  });

  return (
    <Box sx={{ display: 'flex' }}>
      <Tooltip title="Menú de navegación principal">
        <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      </Tooltip>
      <Tooltip title="Menú lateral con opciones adicionales">
        <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      </Tooltip>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, marginTop: 7, overflowX: 'auto'}}>
        <Container>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1" sx={{ alignItems:'center'}}>
              Lista de Pacientes de la Fundación con Cristo
              <Tooltip title="Más información sobre este módulo">
              <IconButton onClick={handleInfoClick} size="small">
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
            </Typography>

          </Box>
        </Container>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleInfoClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" gutterBottom>Módulo de Pacientes</Typography>
            <Typography variant="body2">
              Este módulo te permite gestionar la información de los pacientes de la Fundación con Cristo. 
              Puedes añadir nuevos pacientes, editar su información, cambiar su estado y buscar pacientes específicos.
            </Typography>
          </Box>
        </Popover>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, alignItems:'center'}}>
          <BuscarPaciente onSearch={handleSearch} onFilterChange={handleFilterChange} initialActiveOnly={true} />
          <Tooltip title="Añadir un nuevo paciente a la lista">
            <Button onClick={handleModalOpen} variant="contained" color="primary" startIcon={<PersonAddAltIcon />}>
               Añadir Paciente
            </Button>
          </Tooltip>
        </Box>
        <TablaPaciente 
          handleEdit={handleEdit} 
          handleDeletePaciente={handleDelete} 
          filterCriteria={filterCriteria} 
          pacientes={filteredPacientes} 
          loading={loading}   
        />
      </Box>
      
      <Dialog
        open={alertOpen}
        onClose={handleAlertClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {selectedStatePaciente ? 'Desactivar' : 'Activar'} Paciente?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas {selectedStatePaciente ? 'desactivar' : 'activar'} este paciente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Tooltip title="Cancelar la acción">
            <Button onClick={handleAlertClose} variant="outlined" color="primary">Cancelar</Button>
          </Tooltip>
          <Tooltip title={`Confirmar ${selectedStatePaciente ? 'desactivación' : 'activación'} del paciente`}>
            <Button onClick={handleCompleteDelete} autoFocus variant="contained" color={selectedStatePaciente ? 'error' : 'success'}>
              {selectedStatePaciente ? 'Desactivar' : 'Activar'}
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
      
      {modalOpen && <ModalAddPaciente open={modalOpen} onClose={handleModalClose} onPacienteAdded={handlePacienteAdded} />}
      {editModalOpen && <ModalEditPaciente open={editModalOpen} onClose={handleEditModalClose} pacienteData={selectedPaciente} onPacienteUpdated={fetchPacientes} />}
      
      <Snackbar
        open={successAlert}
        autoHideDuration={6000}
        onClose={() => setSuccessAlert(false)}
      >
        <Alert onClose={() => setSuccessAlert(false)} severity="success">
          Paciente añadido exitosamente!
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorAlert}
        autoHideDuration={6000}
        onClose={() => setErrorAlert(false)}
      >
        <Alert onClose={() => setErrorAlert(false)} severity="error">
          Hubo un error al añadir el paciente.
        </Alert>
      </Snackbar>
      <Tooltip title="Ayuda">
        <Fab 
          color="primary" 
          size="small" 
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => {/* Aquí puedes abrir un modal o drawer con ayuda general */}}
        >
          <HelpOutlineIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default Paciente;
