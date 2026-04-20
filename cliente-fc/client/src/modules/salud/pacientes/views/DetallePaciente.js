import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPaciente } from "../../../services/pacientesServices";
import {
  Container,
  Typography,
  Grid,
  Paper,
  IconButton,
  Box,
  Avatar,
  Divider,
  Chip,
  Skeleton,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Cake as CakeIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { API_IMAGE_URL } from "../../../services/apiConfig";
import PDFGeneratorPaciente from "../../../components/PdfGeneratorPaciente";

const DetallePaciente = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const apiData = await getPaciente(id);
        setData(apiData);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const InfoItem = ({ icon, label, value }) => (
    <Box display="flex" alignItems="center" mb={2}>
      {icon}
      <Box ml={2}>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={150} />
        ) : (
          <Typography variant="body1">{value || "N/A"}</Typography>
        )}
      </Box>
    </Box>
  );

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOpenDialog = (imageSrc) => {
    setSelectedImage(imageSrc);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleImageError = useCallback((imageKey) => {
    setImageErrors(prev => {
      const newErrors = { ...prev };
      newErrors[imageKey] = (newErrors[imageKey] || 0) + 1;
      return newErrors;
    });
  }, []);

  const renderDocument = (documentUrl, label) => {
    if (!documentUrl) return <Typography>No hay documento disponible</Typography>;

    const fullUrl = `${API_IMAGE_URL}${documentUrl}`;
    const isPdf = documentUrl.toLowerCase().endsWith('.pdf');
    const errorCount = imageErrors[documentUrl] || 0;

    if (errorCount >= 3) {
      return <Typography color="error">Error al cargar el {label}</Typography>;
    }

    return (
      <Box mt={2}>
        {isPdf ? (
          <Button
            variant="outlined"
            startIcon={<DescriptionIcon />}
            onClick={() => window.open(fullUrl, '_blank')}
          >
            Ver PDF {label}
          </Button>
        ) : (
          <img
            src={fullUrl}
            alt={`${label} del paciente`}
            style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }}
            onClick={() => handleOpenDialog(fullUrl)}
            onError={() => handleImageError(documentUrl)}
          />
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4, borderRadius: 2 , textAlign:'start'}}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="bold">
            Detalles del Paciente
          </Typography>
          <Box>
            <IconButton
              onClick={handleGoBack}
              sx={{
                backgroundColor: (theme) => theme.palette.grey[200],
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.grey[300],
                },
                marginRight: 2,
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            {!loading && <PDFGeneratorPaciente paciente={data} />}
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              {loading ? (
                <Skeleton variant="circular" width={200} height={200} />
              ) : (
                <Avatar
                  src={data?.foto_paciente ? `${API_IMAGE_URL}${data.foto_paciente}` : undefined}
                  alt={`${data?.nombre_paciente} ${data?.apellidos_paciente}`}
                  sx={{ width: 200, height: 200, mb: 2, cursor: 'pointer' }}
                  onClick={() => data?.foto_paciente && handleOpenDialog(`${API_IMAGE_URL}${data.foto_paciente}`)}
                  onError={() => handleImageError('foto_paciente')}
                >
                  {(!data?.foto_paciente || imageErrors['foto_paciente'] >= 3) && <PersonIcon sx={{ fontSize: 100 }} />}
                </Avatar>
              )}
              {loading ? (
                <Skeleton width={200} height={32} />
              ) : (
                <Typography variant="h5" fontWeight="bold" align="center">
                  {`${data?.nombre_paciente} ${data?.apellidos_paciente}`}
                </Typography>
              )}
              {loading ? (
                <Skeleton width={100} height={32} sx={{ mt: 1 }} />
              ) : (
                <Chip
                  label={data?.nacionalidad_paciente}
                  color="primary"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<PersonIcon color="primary" />}
                  label="DNI"
                  value={loading ? "" : `${data?.tipo_dni_paciente}: ${data?.dni_paciente}`}
                />
                <InfoItem
                  icon={<HomeIcon color="primary" />}
                  label="Dirección"
                  value={data?.direccion_paciente}
                />
                <InfoItem
                  icon={<PhoneIcon color="primary" />}
                  label="Teléfono"
                  value={data?.telefono_paciente}
                />
                <InfoItem
                  icon={<EmailIcon color="primary" />}
                  label="Email"
                  value={data?.email_paciente}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<DescriptionIcon color="primary" />}
                  label="Biografía"
                  value={data?.biografia_paciente}
                />
                <InfoItem
                  icon={<CakeIcon color="primary" />}
                  label="Fecha de Registro"
                  value={data?.fecha_registro_paciente ? formatDate(data.fecha_registro_paciente) : "N/A"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<BloodtypeIcon color="primary" />}
                  label="Tipo de Sangre"
                  value={data?.tiposangre_paciente}
                />
                <InfoItem
                  icon={<CakeIcon color="primary" />}
                  label="Fecha de Nacimiento"
                  value={loading ? "" : `${formatDate(data?.fecha_paciente)} (${data?.edad_paciente} años)`}
                />
                <InfoItem
                  icon={<PsychologyIcon color="primary" />}
                  label="Género"
                  value={data?.genero_paciente}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" mb={2}>
              Información del Cuidador
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<PersonIcon color="secondary" />}
                  label="Familiar Cuidador"
                  value={data?.familiar_cuidador}
                />
                <InfoItem
                  icon={<PersonIcon color="secondary" />}
                  label="Parentesco"
                  value={data?.parentesco_familiar}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<PhoneIcon color="secondary" />}
                  label="Teléfono Cuidador"
                  value={data?.telefono_cuidador}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight="bold" mb={2}>
          Documentos del Paciente
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Cédula
        </Typography>
        {renderDocument(data?.archivo_documentos_cedulas, "Cédula")}

        <Typography variant="subtitle1" fontWeight="bold" mb={1} mt={2}>
          Certificado Médico
        </Typography>
        {renderDocument(data?.archivo_certificado_medico, "Certificado Médico")}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogContent>
          <img 
            src={selectedImage} 
            alt="Imagen ampliada" 
            style={{ width: '100%', height: 'auto' }} 
            onError={() => handleImageError('dialogImage')}
          />
          {imageErrors['dialogImage'] >= 3 && (
            <Typography color="error">Error al cargar la imagen ampliada</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default DetallePaciente;