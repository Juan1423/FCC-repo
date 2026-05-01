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
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fade,
    Avatar,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Description as FileIcon,
    AttachFile as AttachFileIcon,
} from '@mui/icons-material';

import documentoService from '../../../../../services/documentoInteraccionService';

const DocumentosManager = ({ interaccionId }) => {
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [documentoToDelete, setDocumentoToDelete] = useState(null);
    const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

    const loadDocumentos = async () => {
        setLoading(true);
        try {
            const data = await documentoService.getByInteraccion(interaccionId);
            setDocumentos(data);
        } catch (error) {
            console.error("Error cargando documentos", error);
            showAlert('error', 'Error al cargar los documentos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (interaccionId) {
            loadDocumentos();
        }
    }, [interaccionId]);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            showAlert('warning', 'Seleccione un archivo primero');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('descripcion', descripcion);

        setUploading(true);
        try {
            await documentoService.create(interaccionId, formData);
            showAlert('success', 'El documento se ha cargado correctamente');
            setFile(null);
            setDescripcion('');
            loadDocumentos();
        } catch (error) {
            showAlert('error', 'No se pudo subir el archivo');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDocumentoToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (documentoToDelete) {
            try {
                await documentoService.deleteDoc(documentoToDelete);
                showAlert('success', 'El archivo ha sido eliminado');
                loadDocumentos();
            } catch (error) {
                showAlert('error', 'Error al eliminar');
            } finally {
                setDeleteDialogOpen(false);
                setDocumentoToDelete(null);
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setDocumentoToDelete(null);
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#2563eb', mr: 2 }}>
                    <FileIcon sx={{ color: 'white' }} />
                </Avatar>
                <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
                    Gestión de Documentos y Archivos
                </Typography>
            </Box>

            {alert.show && (
                <Fade in={alert.show}>
                    <Alert severity={alert.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setAlert({ show: false })}>
                        {alert.message}
                    </Alert>
                </Fade>
            )}

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
                    p: 3,
                    bgcolor: '#f0f9ff',
                    borderRadius: 2,
                    border: '2px dashed #93c5fd'
                }}
            >
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    sx={{
                        flexShrink: 0,
                        borderColor: '#2563eb',
                        color: '#2563eb',
                        borderRadius: 2,
                        '&:hover': { borderColor: '#1d4ed8', bgcolor: 'rgba(37, 99, 235, 0.04)' }
                    }}
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
                        sx={{
                            maxWidth: 200,
                            borderColor: '#2563eb',
                            color: '#2563eb',
                            '& .MuiChip-deleteIcon': { color: '#2563eb' }
                        }}
                    />
                )}

                <TextField
                    label="Descripción del documento (Opcional)"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    InputProps={{
                        sx: { borderRadius: 2 }
                    }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    disabled={uploading || !file}
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                    sx={{
                        minWidth: 120,
                        bgcolor: '#2563eb',
                        '&:hover': { bgcolor: '#1d4ed8' },
                        borderRadius: 2,
                    }}
                >
                    {uploading ? 'Subiendo' : 'Subir'}
                </Button>
            </Box>

            {/* Tabla de Resultados */}
            <TableContainer component={Box} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#2563eb', color: 'white' }}>Nombre Original</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#2563eb', color: 'white' }}>Descripción</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#2563eb', color: 'white' }}>Fecha Carga</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#2563eb', color: 'white' }} align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <CircularProgress sx={{ color: '#2563eb' }} />
                                </TableCell>
                            </TableRow>
                        ) : documentos.length > 0 ? (
                            documentos.map((doc, index) => (
                                <Fade in={true} timeout={300 + index * 50} key={doc.id_documento}>
                                    <TableRow hover sx={{ '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.04)' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <FileIcon fontSize="small" sx={{ mr: 1, color: '#3b82f6' }} />
                                                {doc.nombre_original}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {doc.descripcion || <Typography variant="caption" sx={{ color: '#94a3b8' }}>Sin descripción</Typography>}
                                        </TableCell>
                                        <TableCell>{new Date(doc.fecha_carga).toLocaleDateString()}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Descargar">
                                                <IconButton
                                                    sx={{ color: '#2563eb' }}
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
                                                    sx={{ color: '#ef4444' }}
                                                    onClick={() => handleDeleteClick(doc.id_documento)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                </Fade>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <Alert severity="info" sx={{ borderRadius: 2, justifyContent: 'center' }}>
                                        No hay documentos adjuntos a esta interacción.
                                    </Alert>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Diálogo de confirmación para eliminar */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ color: '#dc2626', fontWeight: 'bold' }}>
                    ¿Eliminar documento?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el archivo.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleDeleteCancel}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        sx={{
                            bgcolor: '#dc2626',
                            '&:hover': { bgcolor: '#b91c1c' },
                            borderRadius: 2,
                        }}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default DocumentosManager;
