import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { getEnfermedadesByAPS } from '../../../services/diagnosticosServices';

const TablaAtenciones = ({ atenciones, personalSalud, personalSaludLoaded }) => {
    const [expanded, setExpanded] = useState(false);
    const [diagnosticos, setDiagnosticos] = useState({});

    const handleExpandClick = (panel, id_personalsalud, id_diagnostico) => async (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);

        if (isExpanded && !diagnosticos[id_diagnostico]) {
            try {
                const data = await getEnfermedadesByAPS(id_diagnostico);
                setDiagnosticos((prevState) => ({ ...prevState, [id_diagnostico]: data }));
            } catch (error) {
                console.error('Error fetching diagnóstico:', error);
            }
        }
    };

    const formatDate = (dateString) => {
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Date(dateString).toLocaleDateString("es-ES", options);
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Motivo</TableCell>
                        <TableCell>Enfermedad</TableCell>
                        <TableCell>Personal de Salud</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {atenciones.map((atencion, index) => (
                        <React.Fragment key={index}>
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Accordion expanded={expanded === index} onChange={handleExpandClick(index, atencion.id_personalsalud, atencion.id_diagnostico)}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <TableCell>
                                                <Typography sx={{ width: '20%', flexShrink: 0 }}>{formatDate(atencion.fecha_atencion)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ width: '20%', flexShrink: 0 }}>{atencion.motivo_consulta}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ width: '20%', flexShrink: 0 }}>{atencion.enfermedad}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ width: '20%', flexShrink: 0 }}>
                                                    {personalSaludLoaded ? (personalSalud[atencion.id_personalsalud] ? personalSalud[atencion.id_personalsalud].nombres_personal : 'Cargando...') : 'Cargando...'}
                                                </Typography>
                                            </TableCell>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box sx={{ width: '100%' }}>
                                                <Typography><b>Examen Físico:</b> {atencion.examen_fisico}</Typography>
                                                <Typography><b>Diagnóstico:</b> {diagnosticos[atencion.id_diagnostico] ? diagnosticos[atencion.id_diagnostico].nombre : 'Cargando...'}</Typography>
                                                <Typography><b>Plan de Tratamiento:</b> {atencion.plan_tratamiento}</Typography>
                                                <Typography><b>Evolución:</b> {atencion.evolucion}</Typography>
                                                <Typography><b>Prescripciones:</b> {atencion.prescripciones}</Typography>
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TablaAtenciones;
