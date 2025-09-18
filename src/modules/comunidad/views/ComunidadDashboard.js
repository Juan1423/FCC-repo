import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../components/NavbarAdmin";
import Drawer from "../../../components/Drawer";
import { useMenu } from '../../../components/base/MenuContext';

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
          {/* Tarjeta Personas */}
          <Grid item xs={12} md={6} lg={5} sx={{ display: "flex" }}>
            <Card
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      mb: 2,
                      color: "primary.main",
                    }}
                  >
                    Personas
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      color: "text.secondary",
                      mb: 3,
                    }}
                  >
                    Gestiona las personas de la comunidad.
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{
                    py: 1.5,
                    fontSize: "1rem",
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                  onClick={() => navigate("/fcc-comunidad/personas")}
                >
                  Ver Personas
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Tarjeta Interacciones */}
          <Grid item xs={12} md={6} lg={5} sx={{ display: "flex" }}>
            <Card
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      mb: 2,
                      color: "primary.main",
                    }}
                  >
                    Interacciones
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      color: "text.secondary",
                      mb: 3,
                    }}
                  >
                    Gestiona las interacciones de la comunidad.
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{
                    py: 1.5,
                    fontSize: "1rem",
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                  onClick={() => navigate("/fcc-comunidad/interacciones")}
                >
                  Ver Interacciones
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Comunidad;
