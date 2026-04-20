import React, { useEffect, useState, useMemo } from "react";
import {
  Grid,
  Typography,
  Box,
  Button,
  CardContent,
  Card,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../../components/NavbarAdmin";
import Drawer from "../../../../components/Drawer";
import { getAuditorias } from "../../../../services/auditoriaServices";

const Auditoria = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [auditorias, setAuditorias] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    const fetchAuditorias = async () => {
      setLoading(true);
      try {
        const response = await getAuditorias();
        setAuditorias(response || []); // Asegura que no sea undefined
      } catch (error) {
        setError("Error al obtener auditorías");
        console.error("Error al obtener auditorías:", error);
        setAuditorias([]); // Si hay error, asigna un array vacío
      } finally {
        setLoading(false);
      }
    };
    fetchAuditorias();
  }, []);

  const metrics = useMemo(() => {
    const safeAuditorias = auditorias || [];
    // Sort auditorias by date in descending order to get the most recent first
    const sortedAuditorias = [...safeAuditorias].sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    return {
      total: safeAuditorias.length,
      recientes: sortedAuditorias.slice(0, 5),
    };
  }, [auditorias]);

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
          Auditorías Generales
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Sección de Resumen */}
            <Card
              sx={{
                mb: 4,
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: "background.paper",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    mb: 2,
                    color: "text.primary",
                  }}
                >
                  Resumen General
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: "grey.100",
                        borderRadius: 2,
                      }}
                    >
                      <Typography sx={{ fontSize: "1.125rem" }}>
                        Total de Auditorías: <strong>{metrics.total}</strong>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: "grey.100",
                        borderRadius: 2,
                      }}
                    >
                      <Typography sx={{ fontSize: "1.125rem" }}>
                        Última Actividad:{" "}
                        <strong>
                          {metrics.recientes.length > 0
                            ? (() => {
                                try {
                                  const date = new Date(metrics.recientes[0].fecha);
                                  if (isNaN(date.getTime())) {
                                    return "Fecha no válida";
                                  }
                                  return date.toLocaleString('es-EC', {
                                    timeZone: 'America/Guayaquil',
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                  });
                                } catch (error) {
                                  console.error('Error formatting date:', error);
                                  return "Error en formato de fecha";
                                }
                              })()
                            : "Sin registros recientes"}
                        </strong>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Sección de Opciones */}
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  mb: 3,
                  color: "text.primary",
                }}
              >
                Opciones
              </Typography>

              <Grid container spacing={3} justifyContent="center">
                {/* Tarjeta Ver Auditorías */}
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
                          Ver Auditorías
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            color: "text.secondary",
                            mb: 3,
                          }}
                        >
                          Consulta el historial completo de auditorías
                          realizadas en el sistema
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
                        onClick={() => navigate("/fcc-ver-auditoria")}
                      >
                        Ver Historial Completo
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Tarjeta Exportar Auditorías */}
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
                          Exportar Auditorías
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            color: "text.secondary",
                            mb: 3,
                          }}
                        >
                          Descarga un reporte detallado de las auditorías en
                          formato PDF
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
                        onClick={() => navigate("/fcc-exportar-auditoria")}
                      >
                        Generar Reporte
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Auditoria;
