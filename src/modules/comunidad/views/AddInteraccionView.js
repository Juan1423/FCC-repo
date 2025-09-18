import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../components/NavbarAdmin";
import Drawer from "../../../components/Drawer";
import comunidadService from '../../../services/comunidadService';
import { useMenu } from '../../../components/base/MenuContext';

const AddInteraccion = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [archivo, setArchivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState("Activa");
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Agregar Interacción');
    comunidadService.getPersonas().then((response) => {
      setPersonas(response.data);
    });
  }, [setCurrentMenu]);

  const handlePersonaChange = (event) => {
    const { value } = event.target;
    setSelectedPersonas(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const interaccion = {
      descripcion_interaccion: descripcion,
      tipo_interaccion: tipo,
      fecha_inicio_interaccion: fechaInicio,
      fecha_fin_interaccion: fechaFin,
      archivo_interaccion: archivo,
      observciones_interaccion: observaciones,
      estado_interaccion: estado,
      personas: selectedPersonas,
    };
    comunidadService.createInteraccion(interaccion).then(() => {
      navigate("/fcc-comunidad/interacciones", { replace: true });
    });
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
          Agregar Interacción
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Descripción"
            fullWidth
            sx={{ mb: 2 }}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <TextField
            label="Tipo"
            fullWidth
            sx={{ mb: 2 }}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />
          <TextField
            label="Fecha de Inicio"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Fecha de Fin"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Archivo"
            fullWidth
            sx={{ mb: 2 }}
            value={archivo}
            onChange={(e) => setArchivo(e.target.value)}
          />
          <TextField
            label="Observaciones"
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 2 }}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <MenuItem value="Activa">Activa</MenuItem>
              <MenuItem value="Inactiva">Inactiva</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Personas</InputLabel>
            <Select
              multiple
              value={selectedPersonas}
              onChange={handlePersonaChange}
              renderValue={(selected) =>
                selected
                  .map((id) => {
                    const persona = personas.find((p) => p.id_persona === id);
                    return persona ? `${persona.nombre_persona} ${persona.apellido_persona}` : '';
                  })
                  .join(', ')
              }
            >
              {personas.map((persona) => (
                <MenuItem key={persona.id_persona} value={persona.id_persona}>
                  <Checkbox checked={selectedPersonas.indexOf(persona.id_persona) > -1} />
                  <ListItemText primary={persona.nombre_persona} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default AddInteraccion;
