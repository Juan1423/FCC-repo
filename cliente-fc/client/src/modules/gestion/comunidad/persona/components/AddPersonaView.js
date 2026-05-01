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
  Paper,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { PhotoCamera, Save, ArrowBack, CloudUpload } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../../../components/NavbarAdmin";
import Drawer from "../../../../../components/Drawer";
import comunidadService from '../../../../../services/comunidadService';
import { useMenu } from '../../../../../components/base/MenuContext';

const AddPersona = () => {
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
  const [estado, setEstado] = useState("Activo");
  const [tiposPersona, setTiposPersona] = useState([]);
  const [selectedTipoPersona, setSelectedTipoPersona] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setSelectedCanton("");
    setSelectedParroquia("");
    comunidadService.getCantones().then((response) => {
      setCantones(response.data.filter((canton) => canton.id_provincia === provinciaId));
    });
  };

  const handleCantonChange = (event) => {
    const cantonId = event.target.value;
    setSelectedCanton(cantonId);
    setSelectedParroquia("");
    comunidadService.getParroquias().then((response) => {
      setParroquias(response.data.filter((parroquia) => parroquia.id_canton === cantonId));
    });
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

    setLoading(true);
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
      
      await comunidadService.createPersona(persona);
      navigate(-1);
    } catch (err) {
      console.error("Error creating persona:", err);
      setError(err.message || 'Error al crear la persona');
    } finally {
      setLoading(false);
    }
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
              Agregar Nueva Persona
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
                          borderColor: fotoPreview ? 'success.main' : 'grey.400',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: fotoPreview ? 'transparent' : 'grey.100',
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
                          Click en la imagen para subir una foto
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
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  >
                    {loading ? 'Guardando...' : 'Guardar Persona'}
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

export default AddPersona;