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
import { useNavigate, useParams } from "react-router-dom";
import NavbarAdmin from "../../components/NavbarAdmin";
import Drawer from "../../components/Drawer";
import comunidadService from '../../services/comunidadService';
import { useMenu } from '../../components/base/MenuContext';

const EditInteraccion = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Editar Interacción');
    // Fetch all personas
    comunidadService.getPersonas().then((response) => {
      setPersonas(response.data);
    });

    // Fetch interaction data
    // TODO: Implement getInteraccionById in comunidadService
    // comunidadService.getInteraccionById(id).then((response) => {
    //   const interaccion = response.data;
    //   setNombre(interaccion.descripcion_interaccion);
    //   setSelectedPersonas(interaccion.personas.map(p => p.id_persona));
    // });
  }, [id, setCurrentMenu]);

  const handlePersonaChange = (event) => {
    const { value } = event.target;
    setSelectedPersonas(typeof value === 'string' ? value.split(',') : value);
  };

  // Fetch interaction data
    comunidadService.getInteraccionById(id).then((response) => {
      const interaccion = response.data;
      setNombre(interaccion.descripcion_interaccion);
      // Assuming interaccion object has a 'personas' array with 'id_persona'
      // TODO: Backend needs to return associated personas with the interaction
      // For now, we'll just set selectedPersonas to an empty array or based on existing data structure
      setSelectedPersonas(interaccion.personas ? interaccion.personas.map(p => p.id_persona) : []);
    });

  const handleSubmit = (event) => {
    event.preventDefault();
    const interaccion = {
      descripcion_interaccion: nombre,
      tipo_interaccion: "", // Placeholder
      fecha_inicio_interaccion: new Date(),
      fecha_fin_interaccion: new Date(),
      archivo_interaccion: "", // Placeholder
      observciones_interaccion: "", // Placeholder
      estado_interaccion: "Activa", // Placeholder
      personas: selectedPersonas,
    };
    comunidadService.updateInteraccion(id, interaccion).then(() => {
      navigate("/fcc-comunidad/interacciones");
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
          Editar Interacción
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre"
            fullWidth
            sx={{ mb: 2 }}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Personas</InputLabel>
            <Select
              multiple
              value={selectedPersonas}
              onChange={handlePersonaChange}
              renderValue={(selected) => selected.join(', ')}
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
            Guardar Cambios
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default EditInteraccion;
