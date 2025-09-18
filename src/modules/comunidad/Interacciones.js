import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../components/NavbarAdmin";
import Drawer from "../../components/Drawer";
import comunidadService from '../../services/comunidadService';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useMenu } from '../../components/base/MenuContext';
import InteraccionPersonasSummary from './InteraccionPersonasSummary';

const Interacciones = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interacciones, setInteracciones] = useState([]);
  const [expandedInteraccionId, setExpandedInteraccionId] = useState(null);
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Interacciones');
    comunidadService.getInteracciones().then((response) => {
      setInteracciones(response.data);
    });
  }, [setCurrentMenu]);

  const handleExpandClick = (interaccionId) => {
    setExpandedInteraccionId(expandedInteraccionId === interaccionId ? null : interaccionId);
  };

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
          Interacciones de la Comunidad
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 4 }}
          onClick={() => navigate("/fcc-comunidad/interacciones/nueva")}
        >
          Agregar Interacción
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interacciones.map((interaccion) => (
                <React.Fragment key={interaccion.id_interaccion}>
                  <TableRow>
                    <TableCell>{interaccion.id_interaccion}</TableCell>
                    <TableCell>{interaccion.descripcion_interaccion}</TableCell>
                    <TableCell>{interaccion.tipo_interaccion}</TableCell>
                    <TableCell>{new Date(interaccion.fecha_inicio_interaccion).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(interaccion.fecha_fin_interaccion).toLocaleDateString()}</TableCell>
                    <TableCell>{interaccion.estado_interaccion}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => navigate(`/fcc-comunidad/interacciones/${interaccion.id_interaccion}/detalles`)}
                      >
                        Detalles
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => navigate(`/fcc-comunidad/interacciones/${interaccion.id_interaccion}/editar`)}
                      >
                        Editar
                      </Button>
                      <IconButton
                        onClick={() => handleExpandClick(interaccion.id_interaccion)}
                      >
                        {expandedInteraccionId === interaccion.id_interaccion ? (
                          <ArrowDropUpIcon />
                        ) : (
                          <ArrowDropDownIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={expandedInteraccionId === interaccion.id_interaccion} timeout="auto" unmountOnExit>
                        <InteraccionPersonasSummary interaccionId={interaccion.id_interaccion} />
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Interacciones;
