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
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddCommentIcon from '@mui/icons-material/AddComment';

const dataTarjeta = [
  {
    title: "Chatbot Cliente",
    icon: <AddCommentIcon />,
    description: "Gestión del chatbot cliente",
    path: "/fcc-chatbot",
    color: "#2563eb"
  },
  {
    title: "Asistente IA",
    icon: <SmartToyIcon />,
    description: "Gestión del chatbot interno de la fundación",
    path: "/fcc-asistente-ia",
    color: "#3b82f6"
  },
];

const ChatbotDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Chatbot');
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
              Gestión de Chatbot
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
              Asistentes virtuales y chatbot
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
          {dataTarjeta.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
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

export default ChatbotDashboard;
