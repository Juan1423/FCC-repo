import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
} from "@mui/material";
import Card from "../../components/Card"
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import HandshakeIcon from '@mui/icons-material/Handshake';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../components/NavbarAdmin";
import Drawer from "../../components/Drawer";
import { useMenu } from '../../components/base/MenuContext';

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
   {
    title: "Indicadores",
    icon: <AnalyticsIcon/>,
    description: "Gestion de indicadores y registros",
    path: "/fcc-indicadores",
    color: "#29cfcf"
  },
]


const Gestion = () => {
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
          mt: { xs: 7, sm: 8 },
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

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {dataTarjeta.map((item, index) => (
              <Card
                key={index}
                title={item.title}
                description={item.description}
                icon={item.icon}
                color={item.color}
                onClick={() => navigate(item.path)}
              />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Gestion;