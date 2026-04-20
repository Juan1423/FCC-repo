import React from "react";
import { Box, Grid, Typography, Container } from "@mui/material";
import Card from "../../../../components/Card";
import DescriptionIcon from "@mui/icons-material/Description";
import HistoryIcon from "@mui/icons-material/History";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../../components/NavbarAdmin";
import Drawer from "../../../../components/Drawer";
import { useMenu } from "../../../../components/base/MenuContext";

const IADashboard = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  React.useEffect(() => {
    setCurrentMenu("Panel de Inteligencia Artificial");
  }, [setCurrentMenu]);

  const menuItems = [
    {
      title: "Base de Conocimiento",
      description:
        "Sube y administra los documentos PDF que la IA debe aprender.",
      // CORRECCIÓN AQUÍ: Convertimos el objeto en un Elemento JSX < />
      icon: <DescriptionIcon sx={{ fontSize: 40, color: "white" }} />,
      color: "#1976d2",
      path: "/fcc-asistente-ia/conocimiento",
    },
    {
      title: "Historial de Consultas",
      description:
        "Revisa qué han preguntado los empleados y qué respondió la IA.",
      // CORRECCIÓN AQUÍ: Convertimos el objeto en un Elemento JSX < />
      icon: <HistoryIcon sx={{ fontSize: 40, color: "white" }} />,
      color: "#4caf50",
      path: "/fcc-asistente-ia/historial",
    },
    {
      title: "Asesoramiento Virtual",
      description:
        "Canal de consultas para procesos, trámites y gestión interna.",
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: "white" }} />,
      color: "#6a1b9a",
      path: "/fcc-asistente-ia/asesoramiento",
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              mb: 4,
              textAlign: "center",
            }}
          >
            Áreas de Aprendizaje
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  title={item.title}
                  description={item.description}
                  icon={item.icon} // Ahora 'item.icon' es un elemento válido (<Icon />)
                  color={item.color}
                  onClick={() => navigate(item.path)}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default IADashboard;
