import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Typography,
    useTheme,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    IconButton,
    Collapse,
    useMediaQuery,
    Alert,
    TextField,
    Pagination,
    Select,
    MenuItem,
    CircularProgress,
    Grid,
    FormControl,
    InputLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getPersonalSaludId } from '../../../../services/personalsaludServices.js';
import { getPaciente } from '../../../../services/pacientesServices.js';
import { getSignosVitalesPorAps } from '../../../../services/atencion.js';
import PDFGenerator from '../../../../components/PdfGenerator.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const dateRangeOptions = [
    { id: '7d', name: 'Últimos 7 días' },
    { id: '2w', name: 'Últimas 2 semanas' },
    { id: '1m', name: 'Último mes' },
    { id: 'custom', name: 'Rango personalizado' },
];

const CuadroAtenciones = ({ selectedPaciente, atenciones }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [personalSalud, setPersonalSalud] = useState({});
    const [pacienteData, setPacienteData] = useState(null);
    const [signosVitales, setSignosVitales] = useState({});
    const [expandedRow, setExpandedRow] = useState(null);
    const [searchDate, setSearchDate] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7d');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [orderBy, setOrderBy] = useState('fecha_atencion');
    const [order, setOrder] = useState('desc');

    const getCachedData = useCallback((key) => {
        const cachedData = localStorage.getItem(key);
        return cachedData ? JSON.parse(cachedData) : null;
    }, []);

    const setCachedData = useCallback((key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    }, []);

    const fetchPersonalSalud = useCallback(async (id) => {
        const cacheKey = `personalSalud_${id}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
            return cachedData;
        }

        try {
            const data = await getPersonalSaludId(id);
            setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching personal salud:', error);
            return null;
        }
    }, [getCachedData, setCachedData]);

    const filteredAtenciones = useMemo(() => {
        let filtered = atenciones;
        const now = dayjs();

        switch (dateRange) {
            case '7d':
                filtered = atenciones.filter(a => dayjs(a.fecha_atencion).isAfter(now.subtract(7, 'day')));
                break;
            case '2w':
                filtered = atenciones.filter(a => dayjs(a.fecha_atencion).isAfter(now.subtract(14, 'day')));
                break;
            case '1m':
                filtered = atenciones.filter(a => dayjs(a.fecha_atencion).isAfter(now.subtract(1, 'month')));
                break;
            case 'custom':
                if (startDate && endDate) {
                    filtered = atenciones.filter(a => 
                        dayjs(a.fecha_atencion).isAfter(startDate) && dayjs(a.fecha_atencion).isBefore(endDate)
                    );
                }
                break;
            default:
                break;
        }

        if (searchDate) {
            filtered = filtered.filter(atencion => atencion.fecha_atencion.startsWith(searchDate));
        }

        return filtered.sort((a, b) => {
            if (order === 'asc') {
                return new Date(a[orderBy]) - new Date(b[orderBy]);
            } else {
                return new Date(b[orderBy]) - new Date(a[orderBy]);
            }
        });
    }, [atenciones, searchDate, dateRange, startDate, endDate, order, orderBy]);

    useEffect(() => {
        const fetchData = async () => {
            if (atenciones.length > 0 && selectedPaciente) {
                setIsLoading(true);

                try {
                    // Fetch paciente data
                    const pacienteCacheKey = `paciente_${selectedPaciente}`;
                    let pacienteInfo = getCachedData(pacienteCacheKey);
                    if (!pacienteInfo) {
                        pacienteInfo = await getPaciente(selectedPaciente);
                        setCachedData(pacienteCacheKey, pacienteInfo);
                    }
                    setPacienteData(pacienteInfo);

                    // Fetch personal salud data
                    const personalSaludData = {};
                    for (const atencion of atenciones) {
                        const data = await fetchPersonalSalud(atencion.id_personalsalud);
                        if (data) {
                            personalSaludData[atencion.id_personalsalud] = data;
                        }
                    }
                    setPersonalSalud(personalSaludData);

                    // Fetch signos vitales data
                    const signosVitalesData = {};
                    for (const atencion of atenciones) {
                        const signosVitalesCacheKey = `signosVitales_${atencion.id_aps}`;
                        let data = getCachedData(signosVitalesCacheKey);
                        if (!data) {
                            data = await getSignosVitalesPorAps(atencion.id_aps);
                            setCachedData(signosVitalesCacheKey, data);
                        }
                        signosVitalesData[atencion.id_aps] = data;
                    }
                    setSignosVitales(signosVitalesData);

                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [atenciones, selectedPaciente, fetchPersonalSalud, getCachedData, setCachedData]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    const handleChangeDateRange = (event) => {
        const value = event.target.value;
        setDateRange(value);
        if (value !== 'custom') {
            setStartDate(null);
            setEndDate(null);
        }
    };

    const formatDate = (dateString) => {
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Date(dateString).toLocaleDateString("es-ES", options);
    };

    const handleRowClick = (index) => {
        setExpandedRow(prev => (prev === index ? null : index));
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const renderTableRows = () => {
        return filteredAtenciones.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((atencion, index) => {
            const rowIndex = index;
            const currentSignosVitales = signosVitales[atencion.id_aps];
    
            const renderSignosVitales = () => {
                if (!currentSignosVitales || currentSignosVitales.length === 0) {
                    return <Typography>No hay datos de signos vitales disponibles</Typography>;
                }
                const signosVitalesObject = currentSignosVitales[0];
                const signosVitalesData = [
                    ['Presión Arterial', signosVitalesObject.presion_arterial || 'No registrado'],
                    ['Frecuencia Cardíaca', signosVitalesObject.pulso || 'No registrado'],
                    ['Temperatura', signosVitalesObject.temperatura || 'No registrado'],
                    ['Peso', signosVitalesObject.peso || 'No registrado'],
                    ['Talla', signosVitalesObject.talla || 'No registrado']
                ];
                return renderNestedTable(signosVitalesData, ['Signo', 'Valor']);
            };
    
            const renderRevisionSistema = () => {
                const revisionData = (typeof atencion.revision_actual_sistema === 'string' ? JSON.parse(atencion.revision_actual_sistema) : atencion.revision_actual_sistema)
                    .filter(item => item.cpChecked)
                    .map(item => [item.organ, item.description || 'Sin descripción']);
                return renderNestedTable(revisionData, ['Órgano', 'Descripción']);
            };
    
            const renderExamenFisico = () => {
                const examenData = (typeof atencion.examen_fisico === 'string' ? JSON.parse(atencion.examen_fisico) : atencion.examen_fisico)
                    .filter(item => item.cpChecked)
                    .map(item => [item.region, item.description || 'Sin descripción']);
                return renderNestedTable(examenData, ['Región', 'Descripción']);
            };
    
            const renderPrescripciones = () => {
                const prescripcionesData = (typeof atencion.prescripciones === 'string' ? JSON.parse(atencion.prescripciones) : atencion.prescripciones)
                    .map(item => [item.medicamento, item.presentacion, item.dosis]);
                return renderNestedTable(prescripcionesData, ['Medicamento', 'Presentación', 'Dosis']);
            };
    
            const renderDiagnostico = () => {
                const diagnosticoData = (typeof atencion.diagnostico === 'string' ? JSON.parse(atencion.diagnostico) : atencion.diagnostico)
                    .map(item => [item.enfermedad, item.tipoEnfermedad, item.codigoEnfermedad]);
                return renderNestedTable(diagnosticoData, ['Enfermedad', 'Tipo', 'Código']);
            };
    
            return (
                <React.Fragment key={index}>
                    <TableRow>
                        <TableCell>{formatDate(atencion.fecha_atencion)}</TableCell>
                        {!isMobile && (
                            <>
                                <TableCell>{personalSalud[atencion.id_personalsalud]?.nombres_personal}</TableCell>
                                <TableCell>{atencion.motivo_consulta}</TableCell>
                            </>
                        )}
                        <TableCell>
                            <IconButton
                                onClick={() => handleRowClick(rowIndex)}
                                aria-expanded={expandedRow === rowIndex}
                                aria-label="show more"
                            >
                                <ExpandMoreIcon />
                            </IconButton>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={isMobile ? 2 : 4}>
                            <Collapse in={expandedRow === rowIndex} timeout="auto" unmountOnExit>
                                <Box margin={1}>
                                    <Box sx={{justifyContent:'center', alignContent:'center', display:'flex', mt:1, mb:1 , p:1}}>
                                    {currentSignosVitales && (
                                        <PDFGenerator 
                                            atencion={atencion}
                                            historia={{ id: atencion.id_historia }}
                                            paciente={pacienteData}
                                            personalSalud={personalSalud[atencion.id_personalsalud]}
                                            signosVitales={currentSignosVitales[0]}
                                        />
                                    )}
                                    </Box>
                                    <Typography variant="h6" gutterBottom component="div">
                                        Detalles de la Atención
                                    </Typography>
                                    <Typography><strong>Problema Actual:</strong> {atencion.problema_actual}</Typography>
                                    <Typography><strong>Motivo Consulta:</strong> {atencion.motivo_consulta}</Typography>
                                    <Typography><strong>Plan Tratamiento:</strong> {atencion.plan_tratamiento}</Typography>
                                    
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>Signos Vitales</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {renderSignosVitales()}
                                        </AccordionDetails>
                                    </Accordion>
                                    
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>Revisión Actual del Sistema</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {renderRevisionSistema()}
                                        </AccordionDetails>
                                    </Accordion>
                                    
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>Examen Físico</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {renderExamenFisico()}
                                        </AccordionDetails>
                                    </Accordion>
                                        
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>Prescripciones</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {renderPrescripciones()}
                                        </AccordionDetails>
                                    </Accordion>
                                    
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>Diagnóstico</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {renderDiagnostico()}
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                            </Collapse>
                        </TableCell>
                    </TableRow>
                </React.Fragment>
            );
        });
    };
    
    const renderNestedTable = (data, headers) => {
        return (
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {headers.map((header, index) => (
                                <TableCell key={index}>{header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={index}>
                                {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex}>{cell}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };
    
    const renderFilters = () => (
        <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                    <InputLabel id="date-range-label">Rango de fechas</InputLabel>
                    <Select
                        labelId="date-range-label"
                        value={dateRange}
                        label="Rango de fechas"
                        onChange={handleChangeDateRange}
                    >
                        {dateRangeOptions.map((option) => (
                            <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            {dateRange === 'custom' && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid item xs={12} sm={3}>
                        <DatePicker
                            label="Fecha inicial"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <DatePicker
                            label="Fecha final"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>
                </LocalizationProvider>
            )}
            <Grid item xs={12} sm={3}>
                <TextField
                    label="Buscar por fecha"
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                    <InputLabel id="rows-per-page-label">Filas por página</InputLabel>
                    <Select
                        labelId="rows-per-page-label"
                        value={rowsPerPage}
                        label="Filas por página"
                        onChange={handleChangeRowsPerPage}
                    >
                        {[5, 10, 25, 50].map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );

    const renderContent = () => {
        if (!selectedPaciente) {
            return (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Seleccione Paciente para ver información
                </Alert>
            );
        }

        if (isLoading) {
            return (
                <Box sx={{ width: '100%', my: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                </Box>
            );
        }

        return (
            <>
                {renderFilters()}
                {atenciones.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No hay atenciones registradas para este paciente
                    </Alert>
                ) : filteredAtenciones.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No hay atenciones registradas para este paciente en el rango de fechas seleccionado
                    </Alert>
                ) : (
                    <>
                        <TableContainer component={Paper}>
                            <Table aria-label="Tabla de Atenciones">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === 'fecha_atencion'}
                                                direction={orderBy === 'fecha_atencion' ? order : 'asc'}
                                                onClick={() => handleRequestSort('fecha_atencion')}
                                            >
                                                Fecha
                                            </TableSortLabel>
                                        </TableCell>
                                        {!isMobile && (
                                            <>
                                                <TableCell>Personal de Salud</TableCell>
                                                <TableCell>Motivo Consulta</TableCell>
                                            </>
                                        )}
                                        <TableCell>Detalles</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {renderTableRows()}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Pagination
                                count={Math.ceil(filteredAtenciones.length / rowsPerPage)}
                                page={page}
                                onChange={handleChangePage}
                                color="primary"
                            />
                        </Box>
                    </>
                )}
            </>
        );
    };

    return (
        <Box sx={{ maxWidth: '100%', margin: '0 auto', padding: theme.spacing(2) }}>
            {renderContent()}
        </Box>
    );
};

export default CuadroAtenciones;