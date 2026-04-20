import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Container,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavbarAdmin from "../../../components/NavbarAdmin";
import Drawer from "../../../components/Drawer";
import { useNavigate } from "react-router-dom";
import { getAuditorias } from "../../../services/auditoriaServices";
import { generarPDF } from "../../../components/pdfGeneradorAuditoria";

const ExportarAuditorias = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuditorias = async () => {
      setLoading(true);
      try {
        const data = await getAuditorias();
        setAuditorias(data);
      } catch (error) {
        console.error("Error al obtener auditorías:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditorias();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha no disponible';
    
      const options = {
        timeZone: 'America/Guayaquil',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
    
      return date.toLocaleString('es-EC', options);
    } catch (error) {
      console.error('Error al formatear fecha:', error, 'dateString:', dateString);
      return 'Fecha no disponible';
    }
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleExport = () => {
    const filteredAuditorias = auditorias.filter((auditoria) => {
      if (!auditoria.fecha) return false;
      
      try {
        // Create a date object in Ecuador timezone
        const auditoriaDate = new Date(auditoria.fecha);
        const auditoriaDateStr = auditoriaDate.toISOString().split('T')[0];

        // Compare only the date part (YYYY-MM-DD)
        if (startDate && endDate) {
          return auditoriaDateStr >= startDate && auditoriaDateStr <= endDate;
        } else if (startDate) {
          return auditoriaDateStr >= startDate;
        } else if (endDate) {
          return auditoriaDateStr <= endDate;
        }
        return true;
      } catch (error) {
        console.error('Error processing date:', error);
        return false;
      }
    });

    if (filteredAuditorias.length === 0) {
      alert('No hay auditorías disponibles para las fechas seleccionadas');
      return;
    }

    const dataForPDF = filteredAuditorias.map((auditoria) => ({
      id: auditoria.id_auditoria,
      fecha: formatDate(auditoria.fecha),
      modulo: auditoria.modulo || 'No especificado',
      usuario: auditoria.id_usuario || 'No especificado',
      operacion: auditoria.operacion || 'No especificada',
      detalle: auditoria.detalle || 'Sin detalles'
    }));

    const title = `Reporte de Auditorías ${startDate ? `desde ${startDate}` : ''} ${endDate ? `hasta ${endDate}` : ''}`;
    generarPDF(dataForPDF, title);
  };
  const handleGoBack = () => navigate("/fcc-auditoria");
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  return (
    <Box sx={{ display: "flex" }}>
      <Tooltip title="Menú de navegación principal">
        <span>
          <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
        </span>
      </Tooltip>

      <Tooltip title="Menú lateral con opciones adicionales">
        <span>
          <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
        </span>
      </Tooltip>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          marginTop: 7,
          overflowX: "auto",
        }}
      >
        <Container>
          <Box display="flex" alignItems="center" mb={2}>
            <IconButton onClick={handleGoBack} color="primary" sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Exportar Auditorías
            </Typography>
          </Box>

          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Fecha Inicio"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Fecha Fin"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleExport}
                    disabled={loading}
                    sx={{
                      height: "40px",
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "Exportar"
                    )}
                  </Button>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={handleClearFilters}
                    sx={{
                      height: "40px",
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                  >
                    Limpiar
                  </Button>
                </Grid>
              </Grid>

              <Typography
                variant="body2"
                sx={{
                  mt: 3,
                  color: "text.secondary",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Selecciona un rango de fechas para exportar las auditorías. Si
                no seleccionas fechas, se exportarán todas las auditorías
                disponibles.
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default ExportarAuditorias;