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
  Avatar,
  Fade,
  alpha,
  Stack,
  Card,
  CardContent,
  Skeleton,
} from "@mui/material";
import { PhotoCamera, Save, ArrowBack, Edit as EditIcon, Person as PersonIcon } from "@mui/icons-material";
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
            bgcolor: '#f8fafc',
          }}
        >
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3, mb: 3 }} />
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3, mb: 3 }} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Box>
        </Box>
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
          bgcolor: '#f8fafc',
        }}
      >
        <Fade in timeout={600}>
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
                  p: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                  <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EditIcon sx={{ color: 'white', fontSize: 28 }} />
                    <Box>
                      <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
                        Editar Persona
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                        Actualiza la información de {nombre} {apellido}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: { xs: 3, md: 5 } }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }} onClose={() => setError("")}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Box sx={{ mb: 5 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Fotografía
                    </Typography>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: '2px dashed',
                        borderColor: fotoPreview || currentFoto ? '#2563eb' : '#e2e8f0',
                        bgcolor: alpha('#eff6ff', 0.5),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#2563eb',
                          bgcolor: alpha('#eff6ff', 0.8),
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                          <Box
                            sx={{
                              width: 140,
                              height: 140,
                              borderRadius: 3,
                              border: '3px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'white',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              position: 'relative',
                              '&:hover': {
                                borderColor: '#2563eb',
                                transform: 'scale(1.02)',
                              },
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
                                }}
                              />
                            ) : (
                              <Avatar sx={{ width: 80, height: 80, bgcolor: '#2563eb' }}>
                                <PersonIcon sx={{ fontSize: 40 }} />
                              </Avatar>
                            )}
                            {(fotoPreview || currentFoto) && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  bgcolor: 'rgba(0,0,0,0.6)',
                                  py: 1,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  transition: 'all 0.3s',
                                }}
                              >
                                <PhotoCamera sx={{ color: 'white', fontSize: 20 }} />
                              </Box>
                            )}
                          </Box>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                            onChange={handleFileChange}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, color: '#0f172a', mb: 1 }}>
                              Foto de perfil
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Haz clic en la imagen para cambiar la foto
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1 }}>
                              Formatos: JPEG, PNG, WEBP. Máximo 5MB
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ mb: 5 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Información Personal
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Nombre"
                          fullWidth
                          required
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'white',
                            },
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'white',
                            },
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'white',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Teléfono"
                          fullWidth
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'white',
                            },
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'white',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ mb: 5 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Ubicación
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth variant="outlined" required>
                          <InputLabel>Provincia</InputLabel>
                          <Select
                            value={selectedProvincia}
                            onChange={handleProvinciaChange}
                            label="Provincia *"
                            sx={{ borderRadius: 2, bgcolor: 'white' }}
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
                            sx={{ borderRadius: 2, bgcolor: 'white' }}
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
                            sx={{ borderRadius: 2, bgcolor: 'white' }}
                          >
                            {parroquias.map((parroquia) => (
                              <MenuItem key={parroquia.id_parroquia} value={parroquia.id_parroquia}>
                                {parroquia.nombre_parroquia}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ mb: 5 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Configuración
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined" required>
                          <InputLabel>Tipo de Persona</InputLabel>
                          <Select
                            value={selectedTipoPersona}
                            onChange={(e) => setSelectedTipoPersona(e.target.value)}
                            label="Tipo de Persona *"
                            sx={{ borderRadius: 2, bgcolor: 'white' }}
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
                            sx={{ borderRadius: 2, bgcolor: 'white' }}
                          >
                            <MenuItem value="Activo">Activo</MenuItem>
                            <MenuItem value="Inactivo">Inactivo</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ mb: 4 }} />

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(-1)}
                      disabled={saving}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        '&:hover': {
                          borderColor: '#cbd5e1',
                          bgcolor: '#f8fafc',
                        },
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 32px rgba(37, 99, 235, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </Box>
                </form>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default EditPersona;