import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Avatar, 
  Box, 
  Chip, 
  IconButton,
  Button
} from '@mui/material';
import { 
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  Flag as FlagIcon,
  Cake as CakeIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
  Description as DescriptionIcon,
  LocalHospital as LocalHospitalIcon
} from '@mui/icons-material';
import { getPersonalSaludId } from '../../../services/personalsaludServices';
import { BASE_API_URL } from '../../../services/apiConfig';

const DetallePersonalSalud = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState({});

    useEffect(() => {
        async function fetchData() {
            try {
                const apiData = await getPersonalSaludId(id);
                setData(apiData);
            } catch (error) {
                console.error("Error fetching personal salud data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleImageError = useCallback((imageKey) => {
        setImageErrors(prev => {
            const newErrors = { ...prev };
            newErrors[imageKey] = (newErrors[imageKey] || 0) + 1;
            return newErrors;
        });
    }, []);

    const InfoItem = ({ icon, label, value }) => (
        <Box display="flex" alignItems="center" mb={2}>
            {icon}
            <Box ml={2}>
                <Typography variant="subtitle2" color="text.secondary">
                    {label}
                </Typography>
                {loading ? (
                    <Typography variant="body1">Cargando...</Typography>
                ) : (
                    <Typography variant="body1">{value || 'N/A'}</Typography>
                )}
            </Box>
        </Box>
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderImage = (imageUrl, altText, defaultIcon) => {
        if (!imageUrl) return defaultIcon;
        const fullUrl = `${BASE_API_URL}${imageUrl}`;
        const errorCount = imageErrors[imageUrl] || 0;

        if (errorCount >= 3) {
            return defaultIcon;
        }

        return (
            <Avatar
                src={fullUrl}
                alt={altText}
                sx={{ width: 200, height: 200, mb: 2 }}
                onError={() => handleImageError(imageUrl)}
            />
        );
    };

    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 4, borderRadius: 2, textAlign:'start'}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" fontWeight="bold">
                        Detalles del Personal de Salud
                    </Typography>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            backgroundColor: (theme) => theme.palette.grey[200],
                            '&:hover': {
                                backgroundColor: (theme) => theme.palette.grey[300],
                            },
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            {loading ? (
                                <Avatar sx={{ width: 200, height: 200, mb: 2 }}>
                                    <PersonIcon sx={{ fontSize: 100 }} />
                                </Avatar>
                            ) : (
                                renderImage(
                                    data.foto_personal,
                                    `${data.nombres_personal} ${data.apellidos_personal}`,
                                    <Avatar sx={{ width: 200, height: 200, mb: 2 }}>
                                        <PersonIcon sx={{ fontSize: 100 }} />
                                    </Avatar>
                                )
                            )}
                            <Typography variant="h5" fontWeight="bold" align="center">
                                {loading ? 'Cargando...' : `${data.nombres_personal} ${data.apellidos_personal}`}
                            </Typography>
                            {!loading && (
                                <>
                                    <Chip
                                        icon={<SchoolIcon />}
                                        label={data.titulos_personal}
                                        color="primary"
                                        sx={{ mt: 1 }}
                                    />
                                    {data.estado_personal && (
                                        <Chip
                                            label="Activo"
                                            color="success"
                                            sx={{ mt: 1 }}
                                        />
                                    )}
                                    {data.hdv_personal && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<DescriptionIcon />}
                                            href={`${BASE_API_URL}${data.hdv_personal}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ mt: 2 }}
                                            onClick={(e) => {
                                                if (imageErrors[data.hdv_personal] >= 3) {
                                                    e.preventDefault();
                                                    alert('Error al cargar la Hoja de Vida. Por favor, intente más tarde.');
                                                }
                                            }}
                                        >
                                            Ver Hoja de Vida
                                        </Button>
                                    )}
                                </>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <InfoItem
                                    icon={<PersonIcon color="primary" />}
                                    label="DNI"
                                    value={`${data.tipo_dni_personal}: ${data.dni_personal}`}
                                />
                                <InfoItem
                                    icon={<HomeIcon color="primary" />}
                                    label="Dirección"
                                    value={data.direccion_personal}
                                />
                                <InfoItem
                                    icon={<PhoneIcon color="primary" />}
                                    label="Teléfono"
                                    value={data.telefono_personal}
                                />
                                <InfoItem
                                    icon={<CakeIcon color="primary" />}
                                    label="Fecha de Nacimiento"
                                    value={formatDate(data.fecha_nacimiento_personal)}
                                />
                                <InfoItem
                                    icon={<FlagIcon color="primary" />}
                                    label="Nacionalidad"
                                    value={data.nacionalidad_personal}
                                />
                                <InfoItem
                                    icon={<LocalHospitalIcon color="primary" />}
                                    label="Tipo de Especialidad"
                                    value={data.descripcion_tipo_especialidad}
                                />
                                <InfoItem
                                    icon={<LocalHospitalIcon color="primary" />}
                                    label="Especialidad"
                                    value={data.nombre_especialidad}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem
                                    icon={<EmailIcon color="primary" />}
                                    label="Email"
                                    value={data.email_personal}
                                />
                                <InfoItem
                                    icon={<CalendarIcon color="primary" />}
                                    label="Fecha de Registro"
                                    value={formatDate(data.fecha_registro_personal)}
                                />
                                <InfoItem
                                    icon={<BadgeIcon color="primary" />}
                                    label="Licencia"
                                    value={data.licencia_personal}
                                />
                                <InfoItem
                                    icon={<SchoolIcon color="primary" />}
                                    label="Títulos"
                                    value={data.titulos_personal}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default DetallePersonalSalud;