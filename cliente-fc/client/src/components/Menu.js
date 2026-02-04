import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Modal,
  Fade,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NavbarAdmin from "./NavbarAdmin";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import { getUserInfo, isAuthenticated } from "../services/authServices";
import { getPacientes } from "../services/pacientesServices";
import { getPersonalSalud } from "../services/personalsaludServices";
import { getHistorias } from "../services/historiaServices";
import { getAllAtenciones } from "../services/atencion";
import Auditoria from "../modules/auditoria/view/Auditoria";

const menuData = [
  {
    nombre_menu: "Pacientes",
    url: "/fcc-pacientes",
    icon: <PersonIcon />,
    roles: ["admin", "doctor", "personal_salud"],
  },
  {
    nombre_menu: "Comunidad",
    url: "/fcc-comunidad",
    icon: <GroupIcon />,
    roles: ["admin"],
  },
  {
    nombre_menu: "Normativas",
    url: "/fcc-normativa",
    icon: <AssignmentIcon />,
    roles: ["admin"],
  },
  {
    nombre_menu: "Procesos",
    url: "/fcc-proceso",
    icon: <AssignmentIcon />,
    roles: ["admin"],
  },
  {
    nombre_menu: "Personal",
    url: "/fcc-personal-salud",
    icon: <LocalHospitalIcon />,
    roles: ["admin"],
  },
  {
    nombre_menu: "Atención",
    url: "/fcc-atencion",
    icon: <MedicalServicesIcon />,
    roles: ["admin", "doctor", "personal_salud"],
  },
  {
    nombre_menu: "Terapias",
    url: "/fcc-terapias",
    icon: <MonitorHeartIcon />,
    roles: ["admin", "doctor", "personal_salud"],
  },
  {
    nombre_menu: "Historias",
    url: "/fcc-historias-clinicas",
    icon: <AssignmentIcon />,
    roles: ["admin", "doctor", "personal_salud"],
  },
  {
    nombre_menu: "Usuarios",
    url: "/fcc-usuarios",
    icon: <GroupIcon />,
    roles: ["admin"],
  },
  {
    nombre_menu: "Ajustes",
    url: "/fcc-configuracion",
    icon: <SettingsIcon />,
    roles: ["admin", "personal_salud"],
  },
  {
    nombre_menu: "Auditoria",
    url: "/fcc-auditoria",
    icon: <GroupIcon />,
    roles: ["admin"],
  },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  cursor: "pointer",
  transition: "all 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[10],
  },
}));

const IconWrapper = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: "50%",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const HelpModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const HelpModalContent = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: "2px solid #000",
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  maxWidth: "500px",
  width: "90%",
}));

const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [openHelp, setOpenHelp] = useState(false);
  const [helpContent, setHelpContent] = useState("");
  const [dashboardData, setDashboardData] = useState({
    pacientesActivos: 0,
    atencionesRealizadas: 0,
    historiasRealizadas: 0,
    personalDisponible: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isAuthenticated()) {
        const userInfo = getUserInfo();
        if (userInfo && userInfo.rol) {
          setUserRole(userInfo.rol);
          try {
            const pacientes = await getPacientes();
            const personal = await getPersonalSalud();
            const historias = await getHistorias();
            const atenciones = await getAllAtenciones();

            setDashboardData({
              pacientesActivos: pacientes.filter(
                (p) => p.estado_paciente === true
              ).length,
              atencionesRealizadas: atenciones.length,
              historiasRealizadas: historias.length,
              personalDisponible: personal.filter(
                (p) => p.estado_personal === true
              ).length,
            });
            setIsLoading(false);
          } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setIsLoading(false);
          }
        } else {
          console.error("User info not available");
          navigate("/");
        }
      } else {
        console.error("User is not authenticated");
        navigate("/");
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (url) => {
    navigate(url);
  };

  const handleHelpClick = (content) => {
    setHelpContent(content);
    setOpenHelp(true);
  };

  const handleCloseHelp = () => {
    setOpenHelp(false);
  };

  const filteredMenuData = menuData.filter((item) =>
    item.roles.includes(userRole)
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!userRole) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h5">
          No se pudo cargar la información del usuario.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "70vh",
        bgcolor: "#f0f2f5",
      }}
    >
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="xl">
          <Typography
            variant="h4"
            sx={{ mb: 4, fontWeight: "bold", color: "#2c3e50" }}
          >
            Panel de Control
            <Tooltip title="Ayuda sobre el Panel de Control">
              <IconButton
                onClick={() =>
                  handleHelpClick(
                    "Este es el Panel de Control principal. Aquí encontrarás accesos rápidos a las principales funciones del sistema y un resumen de la actividad reciente."
                  )
                }
              >
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Typography>
          <Grid container spacing={3}>
            {filteredMenuData.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.url}>
                <Tooltip title={`Ir a ${item.nombre_menu}`} arrow>
                  <StyledPaper
                    elevation={3}
                    onClick={() => handleMenuClick(item.url)}
                  >
                    <IconWrapper>
                      <IconButton sx={{ color: "white" }}>
                        {React.cloneElement(item.icon, { fontSize: "large" })}
                      </IconButton>
                    </IconWrapper>
                    <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                      {item.nombre_menu}
                    </Typography>
                  </StyledPaper>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h5"
              sx={{ mb: 3, fontWeight: "bold", color: "#2c3e50" }}
            >
              Resumen de Actividad
              <Tooltip title="Ayuda sobre el Resumen de Actividad">
                <IconButton
                  onClick={() =>
                    handleHelpClick(
                      "Este resumen muestra estadísticas clave de tu sistema, actualizadas en tiempo real."
                    )
                  }
                >
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  title: "Pacientes Activos",
                  value: dashboardData.pacientesActivos,
                  color: "#3498db",
                  help: "Número total de pacientes actualmente en tratamiento.",
                },
                {
                  title: "Atenciones Realizadas",
                  value: dashboardData.atencionesRealizadas,
                  color: "#2ecc71",
                  help: "Número total de atenciones médicas realizadas.",
                },
                {
                  title: "Historias Realizadas",
                  value: dashboardData.historiasRealizadas,
                  color: "#e74c3c",
                  help: "Número total de historias clínicas creadas.",
                },
                {
                  title: "Personal Disponible",
                  value: dashboardData.personalDisponible,
                  color: "#f39c12",
                  help: "Personal médico y de enfermería actualmente disponible.",
                },
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={3}
                    sx={{ p: 3, borderTop: `4px solid ${stat.color}` }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      {stat.title}
                      <Tooltip title={stat.help}>
                        <IconButton size="small">
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", color: stat.color }}
                    >
                      {stat.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
      <HelpModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openHelp}
        onClose={handleCloseHelp}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openHelp}>
          <HelpModalContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                id="transition-modal-title"
                variant="h6"
                component="h2"
              >
                Ayuda
              </Typography>
              <IconButton onClick={handleCloseHelp} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography id="transition-modal-description">
              {helpContent}
            </Typography>
          </HelpModalContent>
        </Fade>
      </HelpModal>
    </Box>
  );
};

export default Dashboard;
