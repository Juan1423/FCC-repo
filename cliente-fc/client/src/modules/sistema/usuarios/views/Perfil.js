import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  CircularProgress
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  MedicalServices as MedicalServicesIcon,
  LocalHospital as LocalHospitalIcon
} from "@mui/icons-material";
import { getUsuario, updateUsuario } from "../../../services/usuarioServices";
import { getPersonalSaludId, updatePersonalSalud, getEstadisticas } from "../../../services/personalsaludServices";
import { getUserInfo } from "../../../services/authServices";
import Drawer from "../../../components/Drawer";
import NavbarAdmin from "../../../components/NavbarAdmin";
import useImageCache from "../../../components/global/UseImageCache";
import { API_IMAGE_URL } from "../../../services/apiConfig";
import { getCurrentUserId } from "../../../utils/userUtils";
import { logAuditAction } from "../../../services/auditoriaServices";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const getImage = useImageCache();
  const [personalSalud, setPersonalSalud] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [editedPersonalSalud, setEditedPersonalSalud] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = getUserInfo();
      if (userInfo && userInfo.user) {
        try {
          const userData = await getUsuario(userInfo.user);
          setUser(userData);
          if (userData.id_personal_salud) {
            const personalSaludData = await getPersonalSaludId(userData.id_personal_salud);
            setPersonalSalud(personalSaludData);
            
            // Obtener estadísticas
            const estadisticasData = await getEstadisticas(userData.id_personal_salud);
            setEstadisticas(estadisticasData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setEditedUser({ ...user });
    setEditedPersonalSalud({ ...personalSalud });
    setIsEditing(true);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSave = async () => {
    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error('No user logged in');
      }

      await updateUsuario(user.id_usuario, editedUser);
      await updatePersonalSalud(personalSalud.id_personalsalud, editedPersonalSalud);

      // Audit for user update
      const userAuditDescription = {
        accion: "EDITAR",
        tabla: 'usuarios',
        id_registro: user.id_usuario,
        datos_modificados: {
          estado_anterior: user,
          estado_nuevo: editedUser,
          detalles_cambios: {
            tipo_operacion: "Actualización de Perfil Usuario",
            campos_modificados: Object.keys(editedUser).filter(key => editedUser[key] !== user[key]),
            fecha_modificacion: new Date().toISOString()
          }
        },
        fecha_modificacion: new Date().toISOString()
      };

      // Audit for personal salud update
      const personalSaludAuditDescription = {
        accion: "EDITAR",
        tabla: 'personal_salud',
        id_registro: personalSalud.id_personalsalud,
        datos_modificados: {
          estado_anterior: personalSalud,
          estado_nuevo: editedPersonalSalud,
          detalles_cambios: {
            tipo_operacion: "Actualización de Perfil Personal Salud",
            campos_modificados: Object.keys(editedPersonalSalud).filter(key => editedPersonalSalud[key] !== personalSalud[key]),
            fecha_modificacion: new Date().toISOString()
          }
        },
        fecha_modificacion: new Date().toISOString()
      };

      await logAuditAction('EDITAR_USUARIO_PERFIL', userAuditDescription);
      await logAuditAction('EDITAR_PERSONALSALUD_PERFIL', personalSaludAuditDescription);
      
      setUser(editedUser);
      setPersonalSalud(editedPersonalSalud);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setOpenDialog(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e, isPersonalSalud = false) => {
    if (isPersonalSalud) {
      setEditedPersonalSalud({ ...editedPersonalSalud, [e.target.name]: e.target.value });
    } else {
      setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    }
  };

  const ProfileSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="circular" width={200} height={200} sx={{ mb: 2, mx: 'auto' }} />
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 1, mx: 'auto', width: '60%' }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 2, mx: 'auto', width: '40%' }} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rectangular" height={400} />
        </Grid>
      </Grid>
    </Box>
  );

  if (!user || !personalSalud) {
    return (
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
        <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
        <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, overflow: "auto" }}>
          {loading ? <ProfileSkeleton /> : <CircularProgress />}
        </Box>
      </Box>
    );
  }

  const profileDetails = [
    { label: 'Nombre completo', value: `${personalSalud.nombres_personal} ${personalSalud.apellidos_personal}`, field: 'nombres_personal', isPersonalSalud: true },
    { label: 'Correo electrónico', value: user.correo_usuario, field: 'correo_usuario', icon: <EmailIcon /> },
    { label: 'Teléfono', value: personalSalud.telefono_personal || 'No especificado', field: 'telefono_personal', icon: <PhoneIcon />, isPersonalSalud: true },
    { label: 'Especialidad', value: personalSalud.especialidad?.nombre_especialidad || 'No especificada', field: 'id_especialidad', isPersonalSalud: true },
    { label: 'Número de licencia', value: personalSalud.dni_personal || 'No especificado', field: 'dni_personal', isPersonalSalud: true },
    { label: 'Nacionalidad', value: personalSalud.nacionalidad_personal || 'No especificada', field: 'nacionalidad_personal', isPersonalSalud: true },
    { label: 'Dirección', value: personalSalud.direccion_personal || 'No especificada', field: 'direccion_personal', isPersonalSalud: true },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, overflow: "auto" }}>
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "flex-start" : "center"} mb={3}>
              <Typography variant="h4" component="h1" fontWeight="bold" mb={isMobile ? 2 : 0}>
                Perfil de Usuario
              </Typography>
              {!isEditing ? (
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />} 
                  onClick={handleEdit}
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
                >
                  Editar Perfil
                </Button>
              ) : (
                <Box>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />} 
                    onClick={handleSave} 
                    sx={{ mr: 1, bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}
                  >
                    Guardar
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<CancelIcon />} 
                    onClick={handleCancel}
                    sx={{ color: '#f44336', borderColor: '#f44336', '&:hover': { bgcolor: '#ffebee' } }}
                  >
                    Cancelar
                  </Button>
                </Box>
              )}
            </Box>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar
                    sx={{ width: 200, height: 200, mb: 2 }}
                    alt={`${personalSalud.nombres_personal} ${personalSalud.apellidos_personal}`}
                    src={personalSalud?.foto_personal ? getImage(`${API_IMAGE_URL}${personalSalud.foto_personal}`) : undefined} 
                  />
                  <Typography variant="h5" fontWeight="bold">
                    {personalSalud.nombres_personal} {personalSalud.apellidos_personal}
                  </Typography>
                  <Chip 
                    label={user.rol_usuario} 
                    color="primary" 
                    sx={{ mt: 1, fontWeight: 'bold' }} 
                  />
                </Box>
                <Card sx={{ mt: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Estadísticas profesionales</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4}>
                        <Box textAlign="center">
                          <MedicalServicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          <Typography variant="h4">{estadisticas ? estadisticas.pacientes_atendidos : '0'}</Typography>
                          <Typography variant="body2">Pacientes atendidos</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Box textAlign="center">
                          <CakeIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                          <Typography variant="h4">{estadisticas ? estadisticas.anos_experiencia : '0'}</Typography>
                          <Typography variant="body2">Años de experiencia</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box textAlign="center">
                          <LocalHospitalIcon sx={{ fontSize: 40, color: 'success.main' }} />
                          <Typography variant="h4">{estadisticas ? estadisticas.terapias_realizadas : '0'}</Typography>
                          <Typography variant="body2">Terapias realizadas</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Detalles del perfil</Typography>
                    <List>
                      {profileDetails.map((detail, index) => (
                        <ListItem key={index} divider={index !== profileDetails.length - 1}>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              label={detail.label}
                              name={detail.field}
                              value={(detail.isPersonalSalud ? editedPersonalSalud : editedUser)[detail.field] || ''}
                              onChange={(e) => handleChange(e, detail.isPersonalSalud)}
                              variant="outlined"
                              sx={{ my: 1 }}
                            />
                          ) : (
                            <>
                              {detail.icon && <ListItemIcon>{detail.icon}</ListItemIcon>}
                              <ListItemText 
                                primary={detail.label} 
                                secondary={detail.value}
                                primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                                secondaryTypographyProps={{ variant: 'body1' }}
                              />
                            </>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>
            Hubo un error al actualizar el perfil. Por favor, inténtalo de nuevo más tarde.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Perfil;