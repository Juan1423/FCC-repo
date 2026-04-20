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
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import NavbarAdmin from "../../../../components/NavbarAdmin";
import Drawer from "../../../../components/Drawer";
import comunidadService from '../../../../services/comunidadService';
import { useMenu } from '../../../../components/base/MenuContext';

const EditPersona = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedParroquia, setSelectedParroquia] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [direccion, setDireccion] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [foto, setFoto] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [tiposPersona, setTiposPersona] = useState([]);
  const [selectedTipoPersona, setSelectedTipoPersona] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const { setCurrentMenu } = useMenu();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Editar Persona');
    const fetchData = async () => {
      try {
        const [provinciasRes, cantonesRes, parroquiasRes, tiposPersonaRes, personaRes] = await Promise.all([
          comunidadService.getProvincias(),
          comunidadService.getCantones(),
          comunidadService.getParroquias(),
          comunidadService.getTiposPersona(),
          comunidadService.getPersonaById(id)
        ]);

        const allProvincias = provinciasRes.data;
        const allCantones = cantonesRes.data;
        const allParroquias = parroquiasRes.data;

        setProvincias(allProvincias);
        setTiposPersona(tiposPersonaRes.data);

        const persona = personaRes.data;
        setNombre(persona.nombre_persona);
        setApellido(persona.apellido_persona);
        setDireccion(persona.direccion_persona);
        setCorreo(persona.correo_persona);
        setTelefono(persona.telefono_persona);
        setFoto(persona.foto_persona || "");
        setEstado(persona.estado_persona);
        setSelectedTipoPersona(persona.id_tipo_persona);
        
        if (persona.id_parroquia) {
          const personaParroquia = allParroquias.find(p => p.id_parroquia === persona.id_parroquia);
          if (personaParroquia) {
            const personaCanton = allCantones.find(c => c.id_canton === personaParroquia.id_canton);
            if (personaCanton) {
              const personaProvincia = allProvincias.find(p => p.id_provincia === personaCanton.id_provincia);
              if (personaProvincia) {
                setSelectedProvincia(personaProvincia.id_provincia);
                setCantones(allCantones.filter(c => c.id_provincia === personaProvincia.id_provincia));
                setSelectedCanton(personaCanton.id_canton);
                setParroquias(allParroquias.filter(p => p.id_canton === personaCanton.id_canton));
                setSelectedParroquia(personaParroquia.id_parroquia);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setCurrentMenu]);

  const handleProvinciaChange = async (event) => {
    const provinciaId = event.target.value;
    setSelectedProvincia(provinciaId);
    setSelectedCanton("");
    setSelectedParroquia("");
    const cantonesRes = await comunidadService.getCantones();
    setCantones(cantonesRes.data.filter((canton) => canton.id_provincia === provinciaId));
    setParroquias([]);
  };

  const handleCantonChange = async (event) => {
    const cantonId = event.target.value;
    setSelectedCanton(cantonId);
    setSelectedParroquia("");
    const parroquiasRes = await comunidadService.getParroquias();
    setParroquias(parroquiasRes.data.filter((parroquia) => parroquia.id_canton === cantonId));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const persona = {
      nombre_persona: nombre,
      apellido_persona: apellido,
      direccion_persona: direccion,
      correo_persona: correo,
      telefono_persona: telefono,
      foto_persona: foto,
      estado_persona: estado,
      id_parroquia: selectedParroquia,
      id_tipo_persona: selectedTipoPersona,
    };
    comunidadService.updatePersona(id, persona).then(() => {
      navigate(-1);
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
          Editar Persona
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField label="Nombre" fullWidth sx={{ mb: 2 }} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <TextField label="Apellido" fullWidth sx={{ mb: 2 }} value={apellido} onChange={(e) => setApellido(e.target.value)} />
          <TextField label="Dirección" fullWidth sx={{ mb: 2 }} value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          <TextField label="Correo" fullWidth sx={{ mb: 2 }} value={correo} onChange={(e) => setCorreo(e.target.value)} />
          <TextField label="Teléfono" fullWidth sx={{ mb: 2 }} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          <TextField label="Foto (URL)" fullWidth sx={{ mb: 2 }} value={foto} onChange={(e) => setFoto(e.target.value)} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <MenuItem value="Activo">Activo</MenuItem>
              <MenuItem value="Inactivo">Inactivo</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Provincia</InputLabel>
            <Select value={selectedProvincia} onChange={handleProvinciaChange}>
              {provincias.map((provincia) => (
                <MenuItem key={provincia.id_provincia} value={provincia.id_provincia}>{provincia.nombre_provincia}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Cantón</InputLabel>
            <Select value={selectedCanton} onChange={handleCantonChange} disabled={!selectedProvincia}>
              {cantones.map((canton) => (
                <MenuItem key={canton.id_canton} value={canton.id_canton}>{canton.nombre_canton}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Parroquia</InputLabel>
            <Select value={selectedParroquia} onChange={(e) => setSelectedParroquia(e.target.value)} disabled={!selectedCanton}>
              {parroquias.map((parroquia) => (
                <MenuItem key={parroquia.id_parroquia} value={parroquia.id_parroquia}>{parroquia.nombre_parroquia}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Persona</InputLabel>
            <Select value={selectedTipoPersona} onChange={(e) => setSelectedTipoPersona(e.target.value)}>
              {tiposPersona.map((tipo) => (
                <MenuItem key={tipo.id_tipo_persona} value={tipo.id_tipo_persona}>{tipo.descripcion_tipo_persona}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              Guardar Cambios
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default EditPersona;
