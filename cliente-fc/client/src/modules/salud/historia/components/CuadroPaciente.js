import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  List,
  ListItem,
  Radio,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Grid,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  ButtonGroup,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Skeleton
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getPacientes } from "../../../services/pacientesServices";
import ModalAddPaciente from "../../pacientes/components/modalAddPaciente";
import { useNavigate } from "react-router-dom";

const CuadroPaciente = ({ selectedPaciente, setSelectedPaciente, isDeleteDisable }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Escoger Paciente");
  const anchorRef = useRef(null);

  useEffect(() => {
    fetchPacientes();
  }, []);

  useEffect(() => {
    setLoading(true);  // Comenzar loading
    if (selectedPaciente) {
      const fetchSelectedPatient = async () => {
        try {
          const data = await getPacientes();
          const selected = data.find(
            (patient) => patient.id_paciente === selectedPaciente
          );
          setSelectedPatient(selected);
        } catch (error) {
          console.error("Error fetching selected patient:", error);
        } finally {
          setLoading(false);  // Terminar loading
        }
      };
      fetchSelectedPatient();
    } else {
      setSelectedPatient(null);
      setLoading(false);  // Terminar loading si no hay paciente seleccionado
    }
  }, [selectedPaciente]);

  const fetchPacientes = async () => {
    try {
      const data = await getPacientes();
      const filteredData = data
        .filter((patient) => patient.estado_paciente !== false)
        .sort((a, b) => a.id_paciente - b.id_paciente);
      setPacientes(filteredData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleCloseCreateModal = () => setOpenCreateModal(false);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSelectedPaciente(patient.id_paciente);
    setTimeout(() => {
      handleCloseModal();
    }, 500);
  };

  const handleDetallePatient = () => {
    navigate(`/fcc-pacientes/${selectedPatient.id_paciente}`);
  };

  const handleRemovePatient = () => {
    setSelectedPatient(null);
    setSelectedPaciente(null);
  };

  const handleDropdownToggle = () => {
    setOpenDropdown((prevOpen) => !prevOpen);
  };

  const handleDropdownClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpenDropdown(false);
  };

  const handleMenuItemClick = (option) => {
    setSelectedOption(option);
    setOpenDropdown(false);
  };

  const handleActionButton = () => {
    if (selectedOption === "Escoger Paciente") {
      handleOpenModal();
    } else {
      handleOpenCreateModal();
    }
  };

  const filteredPatients = pacientes
    .filter(
      (patient) =>
        (patient.dni_paciente && patient.dni_paciente.includes(searchTerm)) ||
        (patient.nombre_paciente &&
          patient.nombre_paciente
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (patient.apellidos_paciente &&
          patient.apellidos_paciente
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    )
    .slice(0, 5);
    

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          border: selectedPatient ? (isDeleteDisable === true ? "none" : "none") : "none",
          padding: isXsScreen ? 1 : 2,
          borderRadius: 1,
          boxShadow: selectedPatient ? (isDeleteDisable === true ? 1 : 0) : 0,
        }}
      >
        {loading ? (
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Skeleton variant="circular" width={isXsScreen ? 40 : 56} height={isXsScreen ? 40 : 56} />
            </Grid>
            <Grid item xs>
              <Skeleton variant="text" width="80%" />
              {!isXsScreen && (
                <Skeleton variant="text" width="60%" />
              )}
            </Grid>
          </Grid>
        ) : 
        !selectedPatient ? (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <ButtonGroup size={isXsScreen ? "small" : "medium"}>
              <Button
              sx={{textTransform: 'none'}}
                variant="contained"
                color={
                  selectedOption === "Escoger Paciente" ? "primary" : "success"
                }
                onClick={handleActionButton}
              >
                {selectedOption}
              </Button>
              <Button
              sx={{textTransform: 'none'}}
                ref={anchorRef}
                variant="contained"
                onClick={handleDropdownToggle}
                color={
                  selectedOption === "Escoger Paciente" ? "primary" : "success"
                }
              >
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>
            <Popper
              open={openDropdown}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
              disablePortal
              style={{ zIndex: 9999 }}
              placement="bottom-start"
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom",
                  }}
                >
                  <Paper elevation={8}>
                    <ClickAwayListener onClickAway={handleDropdownClose}>
                      <MenuList
                        id="dropdown-menu"
                        sx={{ backgroundColor: "white", borderRadius: 1 }}
                      >
                        <MenuItem
                          onClick={() =>
                            handleMenuItemClick("Escoger Paciente")
                          }
                        >
                          Escoger Paciente
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleMenuItemClick("Crear Paciente")}
                        >
                          Crear Paciente
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Box>
        ) : (
          <Grid container spacing={1} alignItems="center" justifyContent="flex-start" wrap="nowrap">
            <Grid item>
              <Avatar
                src={selectedPatient.foto_paciente}
                alt={selectedPatient.nombre_paciente}
                sx={{ width: isXsScreen ? 40 : 56, height: isXsScreen ? 40 : 56 }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant={isXsScreen ? "body1" : "h6"} noWrap sx={{textAlign:'left'}}>
                {`${selectedPatient.nombre_paciente} ${selectedPatient.apellidos_paciente}`}
              </Typography>
              {!isXsScreen && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap' }}>
                  <Typography variant="body2" noWrap>
                    <b>DNI:</b> {selectedPatient.dni_paciente}
                  </Typography>
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="body2" noWrap>
                    <b>Edad:</b> {selectedPatient.edad_paciente}
                  </Typography>
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="body2" noWrap>
                    <b>Tipo de sangre:</b> {selectedPatient.tiposangre_paciente}
                  </Typography>
                </Box>
              )}
            </Grid>
            {(isDeleteDisable === true ) && (
              <>
                <Grid item>
                  {isXsScreen ? (
                    <IconButton
                      size="small"
                      onClick={handleDetallePatient}
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDetallePatient}
                      size="small"
                      sx={{textTransform: 'none'}}
                    >
                      Ver Más
                    </Button>
                  )}
                </Grid>
                <Grid item>
                  <IconButton
                    size="small"
                    onClick={handleRemovePatient}
                    sx={{ color: 'text.secondary' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </>
            )}
          </Grid>
        )}
        {openCreateModal && (
          <ModalAddPaciente
            open={openCreateModal}
            onClose={handleCloseCreateModal}
            onPacienteAdded={fetchPacientes}
          />
        )}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 400 },
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 10,
              p: 4,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <TextField
              fullWidth
              label="Buscar paciente por DNI o nombre"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ mb: 2 }}
            />
            <List>
              {filteredPatients.map((patient) => (
                <ListItem
                  key={patient.id_paciente}
                  button
                  onClick={() => handleSelectPatient(patient)}
                  selected={
                    selectedPatient &&
                    selectedPatient.dni_paciente === patient.dni_paciente
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      src={patient.foto_paciente}
                      alt={patient.nombre_paciente}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${patient.nombre_paciente} ${patient.apellidos_paciente}`}
                    secondary={`DNI: ${patient.dni_paciente}`}
                  />
                  <Radio
                    edge="end"
                    checked={
                      selectedPatient &&
                      selectedPatient.dni_paciente === patient.dni_paciente
                    }
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default CuadroPaciente;
