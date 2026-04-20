import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  Tooltip,
  IconButton,
  InputAdornment,
  Container,Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import NavbarAdmin from "../../../components/NavbarAdmin";
import Drawer from "../../../components/Drawer";
import { useNavigate } from "react-router-dom";
import { getAuditorias } from "../../../services/auditoriaServices";
import AuditoriasTable from "./auditoriaTable";

const VerAuditorias = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [filteredAuditorias, setFilteredAuditorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuditorias = async () => {
      setLoading(true);
      try {
        const data = await getAuditorias();
        setAuditorias(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener auditorías:", error);
        setAuditorias([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditorias();
  }, []);

  const handleClearFilters = () => {
    setFilterDate("");
    setFilterUser("");
    setFilteredAuditorias([]);
  };

  const handleApplyFilters = () => {
    const filtered = auditorias.filter((auditoria) => {
      let dateMatch = true;
      let userMatch = true;

      if (filterDate && auditoria.fecha) {
        try {
          const auditoriaDate = new Date(auditoria.fecha);
          const filterDateObj = new Date(filterDate + "T00:00:00");

          dateMatch =
            auditoriaDate.toISOString().split("T")[0] ===
            filterDateObj.toISOString().split("T")[0];
        } catch (error) {
          console.error("Error procesando la fecha:", error);
          dateMatch = false;
        }
      }

      // Improved user filter
      if (filterUser.trim()) {
        const searchTerm = filterUser.trim().toLowerCase();
        userMatch = auditoria.usuario && (
          auditoria.usuario.nombre_usuario.toLowerCase().includes(searchTerm) ||
          auditoria.usuario.apellido_usuario.toLowerCase().includes(searchTerm)
        );
      }

      return dateMatch && userMatch;
    });

    setFilteredAuditorias(filtered);

    // Show message for no results
    if (filtered.length === 0) {
      let message = "No se encontraron auditorías";
      if (filterUser && filterDate) {
        message += ` para el usuario "${filterUser}" en la fecha seleccionada`;
      } else if (filterUser) {
        message += ` para el usuario "${filterUser}"`;
      } else if (filterDate) {
        const formattedDate = new Date(filterDate).toLocaleDateString('es-EC', {
          year: 'numeric',
          month: 'long',
          day: '2-digit'
        });
        message += ` para la fecha: ${formattedDate}`;
      }
      setAlertMessage(message);
      setOpenAlert(true);
    }
  };

  // Add state for alert
  const [alertMessage, setAlertMessage] = useState("");
  const [openAlert, setOpenAlert] = useState(false);

  // Add Snackbar component at the end of the return statement, just before the closing Container tag
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleGoBack = () => navigate("/fcc-auditoria");

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
              Gestión de Auditorías
            </Typography>
          </Box>

          <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
            <CardHeader
              title="Filtros de Búsqueda"
              avatar={<FilterListIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Fecha"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Usuario"
                    size="small"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleApplyFilters}
                    sx={{ height: 45, fontWeight: "bold" }}
                  >
                    Aplicar Filtros
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={handleClearFilters}
                    sx={{ height: 45 }}
                  >
                    Limpiar Filtros
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardHeader
              title="Registros de Auditoría"
              subheader={`${filteredAuditorias.length > 0 ? filteredAuditorias.length : auditorias.length} resultados encontrados`}
            />
            <CardContent>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={50} color="primary" />
                </Box>
              ) : filteredAuditorias.length > 0 || auditorias.length > 0 ? (
                <AuditoriasTable
                  auditorias={
                    filteredAuditorias.length > 0 ? filteredAuditorias : auditorias
                  }
                  onEditAuditoria={(id) => navigate(`/editar-auditoria/${id}`)}
                />
              ) : (
                <Typography
                  sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
                >
                  No se encontraron auditorías con los filtros aplicados.
                </Typography>
              )}
            </CardContent>
          </Card>
          <Snackbar
            open={openAlert}
            autoHideDuration={4000}
            onClose={() => setOpenAlert(false)}
            message={alertMessage}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          />
        </Container>
      </Box>
    </Box>
  );
};

export default VerAuditorias;
