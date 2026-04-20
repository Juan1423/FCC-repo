import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
} from "@mui/material";
import Card from "../../components/Card"
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../components/NavbarAdmin";
import Drawer from "../../components/Drawer";
import { useMenu } from '../../components/base/MenuContext';

const dataTarjeta = [
  {
    title: "Chatbot Clientes",
    icon: <AddCommentIcon />,
    description: "Administracion del chatbot clientes",
    path: "/fcc-chatbot",
    color: "#29cf45"
  },
  {
    title: "Chatbot Servidor",
    icon: <SmartToyIcon />,
    description: "Administracion del chatbot interno de la fundacion",
    path: "/fcc-asistente-ia",
    color: "#9d39cc"
  }, 
]


const Chat = () => {
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

export default Chat;
