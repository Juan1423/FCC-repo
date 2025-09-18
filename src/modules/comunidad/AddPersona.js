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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../components/NavbarAdmin";
import Drawer from "../../components/Drawer";
import comunidadService from '../../services/comunidadService';
import { useMenu } from '../../components/base/MenuContext';

const AddPersona = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedParroquia, setSelectedParroquia] = useState("");
  const [nombre, setNombre] = useState("");
  const [tiposPersona, setTiposPersona] = useState([]);
  const [selectedTipoPersona, setSelectedTipoPersona] = useState("");
  const navigate = useNavigate();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Agregar Persona');
    comunidadService.getProvincias().then((response) => {
      setProvincias(response.data);
    });
    comunidadService.getTiposPersona().then((response) => {
      setTiposPersona(response.data);
    });
  }, [setCurrentMenu]);

  const handleProvinciaChange = (event) => {
    const provinciaId = event.target.value;
    setSelectedProvincia(provinciaId);
    setSelectedCanton(""); // Reset canton selection
    setSelectedParroquia(""); // Reset parroquia selection
    comunidadService.getCantones().then((response) => {
      setCantones(response.data.filter((canton) => canton.id_provincia === provinciaId));
    });
  };

  const handleCantonChange = (event) => {
    const cantonId = event.target.value;
    setSelectedCanton(cantonId);
    setSelectedParroquia(""); // Reset parroquia selection
    comunidadService.getParroquias().then((response) => {
      setParroquias(response.data.filter((parroquia) => parroquia.id_canton === cantonId));
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const persona = {
      nombre_persona: nombre,
      apellido_persona: "", // Placeholder
      direccion_persona: "", // Placeholder
      correo_persona: "", // Placeholder
      telefono_persona: null, // Placeholder
      foto_persona: "", // Placeholder
      estado_persona: "Activo", // Placeholder
      id_parroquia: selectedParroquia,
      id_tipo_persona: selectedTipoPersona,
    };
    comunidadService.createPersona(persona).then(() => {
      navigate("/fcc-comunidad/personas");
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
          Agregar Persona
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
            <InputLabel>Provincia</InputLabel>
            <Select
              value={selectedProvincia}
              onChange={handleProvinciaChange}
            >
              {provincias.map((provincia) => (
                <MenuItem key={provincia.id_provincia} value={provincia.id_provincia}>
                  {provincia.nombre_provincia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Cantón</InputLabel>
            <Select
              value={selectedCanton}
              onChange={handleCantonChange}
              disabled={!selectedProvincia}
            >
              {cantones.map((canton) => (
                <MenuItem key={canton.id_canton} value={canton.id_canton}>
                  {canton.nombre_canton}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Parroquia</InputLabel>
            <Select
              value={selectedParroquia}
              onChange={(e) => setSelectedParroquia(e.target.value)}
              disabled={!selectedCanton}
            >
              {parroquias.map((parroquia) => (
                <MenuItem key={parroquia.id_parroquia} value={parroquia.id_parroquia}>
                  {parroquia.nombre_parroquia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Persona</InputLabel>
            <Select
              value={selectedTipoPersona}
              onChange={(e) => setSelectedTipoPersona(e.target.value)}
            >
              {tiposPersona.map((tipo) => (
                <MenuItem key={tipo.id_tipo_persona} value={tipo.id_tipo_persona}>
                  {tipo.descripcion_tipo_persona}
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

export default AddPersona;
