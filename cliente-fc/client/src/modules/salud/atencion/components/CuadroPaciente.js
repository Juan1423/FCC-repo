import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  List,
  ListItem,
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
  Skeleton,
  CircularProgress
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getPacientes } from "../../../../services/pacientesServices.js";
import ModalAddPaciente from "../../pacientes/components/modalAddPaciente";
import { useNavigate } from "react-router-dom";
import { usePacienteContext } from "../../../../components/base/PacienteContext.js";
import { API_IMAGE_URL } from '../../../../services/apiConfig.js';
import useImageCache from '../../../../components/global/UseImageCache.js';

const CuadroPaciente = ({ isDeleteDisable }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { selectedPaciente, setSelectedPaciente } = usePacienteContext();
  const getImage = useImageCache();
  
  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Escoger Paciente");
  const anchorRef = useRef(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const debounceTimer = useRef(null);

  const lastPatientElementRef = useCallback(node => {
    if (loadingPatients) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingPatients, hasMore]);
  
  useEffect(() => {
    setLoading(true);
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
          setLoading(false);
        }
      };
      fetchSelectedPatient();
    } else {
      setSelectedPatient(null);
      setLoading(false);
    }
  }, [selectedPaciente]);

  const fetchPacientes = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const data = await getPacientes(page, 5); // Fetch 5 patients at a time
      const filteredData = data
        .filter((patient) => patient.estado_paciente !== false)
        .sort((a, b) => a.id_paciente - b.id_paciente);
      setPacientes(prevPacientes => [...prevPacientes, ...filteredData]);
      setHasMore(filteredData.length === 5);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoadingPatients(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes, page]);

  const handleOpenModal = () => {
    setOpenModal(true);
    setPage(0);
    setPacientes([]);
    fetchPacientes();
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleCloseCreateModal = () => setOpenCreateModal(false);

  const debouncedFetchPacientes = useCallback((value) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setSearchTerm(value);
      setPage(0);
      setPacientes([]);
      fetchPacientes();
    }, 300);
  }, [fetchPacientes]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value); // Update the search term immediately for UI responsiveness
    debouncedFetchPacientes(value);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSelectedPaciente(patient.id_paciente);
    handleCloseModal();
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

  const filteredPatients = pacientes.filter((patient) => {
    const fullName = `${patient.nombre_paciente} ${patient.apellidos_paciente}`.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (patient.dni_paciente && patient.dni_paciente.includes(searchTermLower)) ||
      fullName.includes(searchTermLower) ||
      (patient.nombre_paciente && patient.nombre_paciente.toLowerCase().includes(searchTermLower)) ||
      (patient.apellidos_paciente && patient.apellidos_paciente.toLowerCase().includes(searchTermLower))
    );
  });

  const PatientListItem = React.memo(({ patient, index, isLast }) => {
    const itemRef = isLast ? lastPatientElementRef : null;
    
    return (
      <ListItem
        ref={itemRef}
        key={patient.id_paciente}
        disablePadding
        sx={{
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          transition: 'background-color 0.3s',
        }}
        onClick={() => handleSelectPatient(patient)}
      >
        <ListItemAvatar>
          <Avatar
            src={patient?.foto_paciente ? getImage(`${API_IMAGE_URL}${patient.foto_paciente}`) : undefined}
            alt={patient.nombre_paciente}
          />
        </ListItemAvatar>
        <ListItemText
          primary={`${patient.nombre_paciente} ${patient.apellidos_paciente}`}
          secondary={`DNI: ${patient.dni_paciente}`}
        />
        <IconButton
          color="primary"
          sx={{
            opacity: 0,
            transition: 'opacity 0.3s',
            '.MuiListItem-root:hover &': {
              opacity: 1,
            },
          }}
        >
          <CheckCircleIcon />
        </IconButton>
      </ListItem>
    );
  });

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
                variant="contained"
                sx={{textTransform: 'none'}}
                color={
                  selectedOption === "Escoger Paciente" ? "primary" : "success"
                }
                onClick={handleActionButton}
              >
                {selectedOption}
              </Button>
              <Button
                ref={anchorRef}
                variant="contained"
                sx={{textTransform: 'none'}}
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
                src={selectedPatient?.foto_paciente ? getImage(`${API_IMAGE_URL}${selectedPatient.foto_paciente}`) : undefined}
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
              boxShadow: 24,
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
              {filteredPatients.map((patient, index) => (
                <PatientListItem
                  key={patient.id_paciente}
                  patient={patient}
                  index={index}
                  isLast={filteredPatients.length === index + 1}
                />
              ))}
            </List>
            {loadingPatients && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default CuadroPaciente;