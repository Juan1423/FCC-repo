import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Fade,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../components/NavbarAdmin";
import Drawer from "../../components/Drawer";
import { useMenu } from '../../components/base/MenuContext';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import HandshakeIcon from '@mui/icons-material/Handshake';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const dataTarjeta = [
  {
    title: "Personas",
    icon: <EmojiPeopleIcon />,
    description: "Gestión de las personas de la comunidad",
    path: "/fcc-comunidad/personas",
    color: "#2563eb"
  },
  {
    title: "Interacciones",
    icon: <HandshakeIcon />,
    description: "Gestión de las interacciones de la comunidad",
    path: "/fcc-comunidad/interacciones",
    color: "#3b82f6"
  },
  {
    title: "Normativas",
    icon: <TextSnippetIcon />,
    description: "Gestión de las normativas de la comunidad",
    path: "/fcc-comunidad/normativa",
    color: "#1d4ed8"
  },
  {
    title: "Procesos",
    icon: <AccountTreeIcon />,
    description: "Gestión de los procesos de la comunidad",
    path: "/fcc-proceso",
    color: "#1e40af"
  },
  {
    title: "Indicadores",
    icon: <AnalyticsIcon />,
    description: "Gestión de indicadores y registros",
    path: "/fcc-indicadores",
    color: "#6366f1"
  },
];

const GestionDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Gestión');
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
          minHeight: '100vh',
          bgcolor: '#f8fafc',
        }}
      >
        <Fade in={true} timeout={800}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                mb: 1,
                textAlign: "center",
                fontSize: { xs: "1.5rem", md: "2.5rem" },
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Gestión Comunitaria
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#64748b",
                mb: 4,
                textAlign: "center",
                fontWeight: 500,
                letterSpacing: '0.5px'
              }}
            >
              Administración de la comunidad
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3} sx={{ maxWidth: 1400, mx: 'auto' }}>
          {dataTarjeta.map((item, index) => (
            <Grid item xs={12} sm={6} md={index < 2 ? 6 : 4} key={index}>
              <Fade in={true} timeout={300 + index * 100}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    '&:hover': {
                      elevation: 8,
                      borderColor: item.color,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${item.color}25`,
                    },
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: item.color,
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {item.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#1e293b' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default GestionDashboard;
