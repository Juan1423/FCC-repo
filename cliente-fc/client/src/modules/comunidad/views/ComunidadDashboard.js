import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CardContent,
  Button,
} from "@mui/material";
import Card from "../../../components/Card"
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import HandshakeIcon from '@mui/icons-material/Handshake';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../components/NavbarAdmin";
import Drawer from "../../../components/Drawer";
import { useMenu } from '../../../components/base/MenuContext';

const dataTarjeta = [
  {
    title: "Personas",
    icon: <EmojiPeopleIcon/>,
    description: "Gestion de las personas de la comunidad",
    path: "/fcc-comunidad/personas",
    color: "#29cf45"
  },
  {
    title: "Interacciones",
    icon: <HandshakeIcon/>,
    description: "Gestion de las interaciones de la comunidad",
    path: "/fcc-comunidad/interacciones",
    color: "#2976cf"
  },
  {
    title: "Normativas",
    icon: <TextSnippetIcon/>,
    description: "Gestion de las normativas de la comunidad",
    path: "/fcc-comunidad/normativa",
    color: "#9d39cc"
  },
  {
    title: "Procesos",
    icon: <AccountTreeIcon/>,
    description: "Gestion de los procesos de la comunidad",
    path: "/fcc-proceso",
    color: "#cf9529"
  },
]


const Comunidad = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Comunidad');
  }, [setCurrentMenu]);

  return (
    <Box sx={{ display: "flex" }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - 240px)` },
          mt: { xs: 7, sm: 8 }, // Adjust margin-top to account for AppBar height
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            mb: 4,
            textAlign: "center",
            fontSize: { xs: "1.5rem", md: "2rem" },
            color: "primary.main",
          }}
        >
          Gestión de la Comunidad
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {dataTarjeta.map((item, index) => (
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
      </Box>
    </Box>
  );
};

export default Comunidad;
