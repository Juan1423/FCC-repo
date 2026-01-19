import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    CircularProgress,
    Chip,
    Alert
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Description as FileIcon,
    AttachFile as AttachFileIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

// Asegúrate de que la ruta al servicio sea correcta según tu estructura
import documentoService from '../../../services/documentoInteraccionService'; 

const DocumentosManager = ({ interaccionId }) => {
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [descripcion, setDescripcion] = useState('');

    useEffect(() => {
        if (interaccionId) {
            loadDocumentos();
        }
    }, [interaccionId]);

    const loadDocumentos = async () => {
        setLoading(true);
        try {
            const data = await documentoService.getByInteraccion(interaccionId);
            setDocumentos(data);
        } catch (error) {
            console.error("Error cargando documentos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return Swal.fire('Atención', 'Selecciona un archivo primero', 'warning');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('descripcion', descripcion);

        setUploading(true);
        try {
            await documentoService.create(interaccionId, formData);
            Swal.fire({
                icon: 'success',
                title: 'Subido',
                text: 'El documento se ha cargado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
            setFile(null);
            setDescripcion('');
            // Resetear el input file visualmente es tricky en React,
            // pero al ser null el estado, el botón volverá a mostrar "Seleccionar"
            loadDocumentos();
        } catch (error) {
            Swal.fire('Error', 'No se pudo subir el archivo', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: '¿Eliminar documento?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await documentoService.deleteDoc(id);
                    loadDocumentos();
                    Swal.fire('Eliminado', 'El archivo ha sido eliminado.', 'success');
                } catch (error) {
                    Swal.fire('Error', 'Error al eliminar', 'error');
                }
            }
        });
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FileIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                    Gestión de Documentos y Archivos
                </Typography>
            </Box>

            {/* Formulario de Carga */}
            <Box 
                component="form" 
                onSubmit={handleSubmit} 
                sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' }, 
                    gap: 2, 
                    alignItems: { xs: 'stretch', md: 'center' },
                    mb: 4,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px dashed #ccc'
                }}
            >
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    sx={{ flexShrink: 0 }}
                >
                    {file ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
                    <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    />
                </Button>
                
                {file && (
                    <Chip 
                        label={file.name} 
                        onDelete={() => setFile(null)} 
                        color="primary" 
                        variant="outlined" 
                        sx={{ maxWidth: 200 }} 
                    />
                )}

                <TextField
                    label="Descripción del documento (Opcional)"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    disabled={uploading || !file}
                    startIcon={uploading ? <CircularProgress size={20} color="inherit"/> : <UploadIcon />}
                    sx={{ minWidth: 120 }}
                >
                    {uploading ? 'Subiendo' : 'Subir'}
                </Button>
            </Box>

            {/* Tabla de Resultados */}
            <TableContainer component={Box} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>Nombre Original</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>Descripción</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>Fecha Carga</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }} align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : documentos.length > 0 ? (
                            documentos.map((doc) => (
                                <TableRow key={doc.id_documento} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <FileIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                            {doc.nombre_original}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{doc.descripcion || <Typography variant="caption" color="text.secondary">Sin descripción</Typography>}</TableCell>
                                    <TableCell>{new Date(doc.fecha_carga).toLocaleDateString()}</TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Descargar">
                                            <IconButton 
                                                color="primary" 
                                                href={documentoService.getDownloadUrl(doc.ruta_archivo)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="small"
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton 
                                                color="error" 
                                                onClick={() => handleDelete(doc.id_documento)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <Alert severity="info" sx={{ justifyContent: 'center' }}>
                                        No hay documentos adjuntos a esta interacción.
                                    </Alert>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default DocumentosManager;