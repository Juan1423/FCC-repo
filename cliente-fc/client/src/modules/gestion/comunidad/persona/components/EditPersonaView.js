import React, { useState, useEffect, useRef } from 'react';
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
  Paper,
  Grid,
  Alert,
  IconButton,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { PhotoCamera, Save, ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import NavbarAdmin from "../../../../../components/NavbarAdmin";
import Drawer from "../../../../../components/Drawer";
import comunidadService from '../../../../../services/comunidadService';
import { useMenu } from '../../../../../components/base/MenuContext';

const EditPersona = () => {
  const fileInputRef = useRef(null);
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
  const [fotoPreview, setFotoPreview] = useState(null);
  const [currentFoto, setCurrentFoto] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [tiposPersona, setTiposPersona] = useState([]);
  const [selectedTipoPersona, setSelectedTipoPersona] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
        setCurrentFoto(persona.foto_persona || "");
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
        setError("Error al cargar los datos");
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedTipoPersona) {
      setError('Por favor selecciona un tipo de persona');
      return;
    }
    if (!selectedParroquia) {
      setError('Por favor selecciona una parroquia');
      return;
    }

    setSaving(true);
    setError("");

    try {
      let fotoPersona = foto;
      
      if (foto && typeof foto === 'object' && foto.name) {
        const uploadResult = await comunidadService.uploadPersonaPhoto(foto);
        fotoPersona = uploadResult.data?.foto_persona || '';
      }

      const persona = {
        nombre_persona: nombre,
        apellido_persona: apellido,
        direccion_persona: direccion,
        correo_persona: correo,
        telefono_persona: telefono,
        foto_persona: fotoPersona,
        estado_persona: estado,
        id_parroquia: selectedParroquia,
        id_tipo_persona: selectedTipoPersona,
      };
      
      await comunidadService.updatePersona(id, persona);
      navigate(-1);
    } catch (err) {
      console.error("Error updating persona:", err);
      setError(err.message || 'Error al actualizar la persona');
    } finally {
      setSaving(false);
    }
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
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Paper elevation={0} sx={{ p: 4, maxWidth: 800, mx: 'auto', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              Editar Persona
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="600" color="text.secondary" gutterBottom>
                      Fotografía
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          border: '2px dashed',
                          borderColor: fotoPreview || currentFoto ? 'success.main' : 'grey.400',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: fotoPreview ? 'transparent' : currentFoto ? 'grey.100' : 'grey.100',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {fotoPreview ? (
                          <img
                            src={fotoPreview}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : currentFoto ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/personas/${currentFoto}`}
                            alt="Current"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                            }}
                          />
                        ) : (
                          <PhotoCamera sx={{ fontSize: 40, color: 'grey.500' }} />
                        )}
                      </Box>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        onChange={handleFileChange}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Click en la imagen para cambiar la foto
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Formatos: JPEG, PNG, WEBP. Máximo 5MB
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Nombre"
                  fullWidth
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Apellido"
                  fullWidth
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Correo"
                  fullWidth
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Teléfono"
                  fullWidth
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección"
                  fullWidth
                  multiline
                  rows={2}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Provincia</InputLabel>
                  <Select
                    value={selectedProvincia}
                    onChange={handleProvinciaChange}
                    label="Provincia *"
                  >
                    {provincias.map((provincia) => (
                      <MenuItem key={provincia.id_provincia} value={provincia.id_provincia}>
                        {provincia.nombre_provincia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined" required disabled={!selectedProvincia}>
                  <InputLabel>Cantón</InputLabel>
                  <Select
                    value={selectedCanton}
                    onChange={handleCantonChange}
                    label="Cantón *"
                  >
                    {cantones.map((canton) => (
                      <MenuItem key={canton.id_canton} value={canton.id_canton}>
                        {canton.nombre_canton}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined" required disabled={!selectedCanton}>
                  <InputLabel>Parroquia</InputLabel>
                  <Select
                    value={selectedParroquia}
                    onChange={(e) => setSelectedParroquia(e.target.value)}
                    label="Parroquia *"
                  >
                    {parroquias.map((parroquia) => (
                      <MenuItem key={parroquia.id_parroquia} value={parroquia.id_parroquia}>
                        {parroquia.nombre_parroquia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Tipo de Persona</InputLabel>
                  <Select
                    value={selectedTipoPersona}
                    onChange={(e) => setSelectedTipoPersona(e.target.value)}
                    label="Tipo de Persona *"
                  >
                    {tiposPersona.map((tipo) => (
                      <MenuItem key={tipo.id_tipo_persona} value={tipo.id_tipo_persona}>
                        {tipo.descripcion_tipo_persona}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    label="Estado"
                  >
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="Inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default EditPersona;