import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useParams } from "react-router-dom";
import NavbarAdmin from "../../../components/NavbarAdmin";
import Drawer from "../../../components/Drawer";
import comunidadService from '../../../services/comunidadService';
import { useMenu } from '../../../components/base/MenuContext';

const PersonaInteracciones = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interacciones, setInteracciones] = useState([]);
  const { id } = useParams();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Interacciones de Persona');
    comunidadService.getInteraccionesByPersona(id).then((response) => {
      setInteracciones(response.data);
    });
  }, [id, setCurrentMenu]);

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
          Interacciones de la Persona
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interacciones.map((interaccion) => (
                <TableRow key={interaccion.id_interaccion}>
                  <TableCell>{interaccion.id_interaccion}</TableCell>
                  <TableCell>{interaccion.descripcion_interaccion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default PersonaInteracciones;
