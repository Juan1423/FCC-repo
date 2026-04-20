import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Switch, FormControlLabel } from '@mui/material';

const opcionesRelacion = [
    { value: 'Bien', label: 'Bien' },
    { value: 'Regular', label: 'Regular' },
    { value: 'Mal', label: 'Mal' },
];

const opcionesHorario = [
    { value: 'Mañana', label: 'Mañana' },
    { value: 'Tarde', label: 'Tarde' },
    { value: 'Noche', label: 'Noche' },
    { value: 'Flexible', label: 'Flexible' },
];

const opcionesEstadoCivil = [
    { value: 'Casado', label: 'Casado' },
    { value: 'Soltero', label: 'Soltero' },
    { value: 'Divorciado', label: 'Divorciado' },
    { value: 'Viudo', label: 'Viudo' },
];

const opcionesEscolaridad = [
    { value: 'Primaria', label: 'Primaria' },
    { value: 'Secundaria', label: 'Secundaria' },
    { value: 'Técnico', label: 'Técnico' },
    { value: 'Universitario', label: 'Universitario' },
    { value: 'Posgrado', label: 'Posgrado' },
];

const AntecedentesFamiliares = ({ historia, handleNestedChange }) => {
    const handleChange = (section, field, value) => {
        handleNestedChange(section, field, value);
    };

    const renderFamiliarFields = (section, relationLabel) => {
        const sectionData = historia[section] || {};
        return (
            <>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Apellidos"
                        value={sectionData.apellidos || ''}
                        onChange={(e) => handleChange(section, 'apellidos', e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Nombres"
                        value={sectionData.nombres || ''}
                        onChange={(e) => handleChange(section, 'nombres', e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Nacionalidad"
                        value={sectionData.nacionalidad || ''}
                        onChange={(e) => handleChange(section, 'nacionalidad', e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Número de Cédula"
                        value={sectionData.no_cedula || ''}
                        onChange={(e) => handleChange(section, 'no_cedula', e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Edad"
                        type="number"
                        value={sectionData.edad || ''}
                        onChange={(e) => handleChange(section, 'edad', e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Ocupación"
                        value={sectionData.ocupacion || ''}
                        onChange={(e) => handleChange(section, 'ocupacion', e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Lugar de Trabajo"
                        value={sectionData.lugar_trabajo || ''}
                        onChange={(e) => handleChange(section, 'lugar_trabajo', e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Dirección de Trabajo"
                        value={sectionData.direccion_trabajo || ''}
                        onChange={(e) => handleChange(section, 'direccion_trabajo', e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>{`Relación con ${relationLabel}`}</InputLabel>
                        <Select
                            value={sectionData[`relacion_${relationLabel.toLowerCase()}`] || ''}
                            onChange={(e) => handleChange(section, `relacion_${relationLabel.toLowerCase()}`, e.target.value)}
                        >
                            {opcionesRelacion.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Horario de Trabajo</InputLabel>
                        <Select
                            value={sectionData.horario_trabajo || ''}
                            onChange={(e) => handleChange(section, 'horario_trabajo', e.target.value)}
                        >
                            {opcionesHorario.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Estado Civil</InputLabel>
                        <Select
                            value={sectionData.estado_civil || ''}
                            onChange={(e) => handleChange(section, 'estado_civil', e.target.value)}
                        >
                            {opcionesEstadoCivil.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Escolaridad</InputLabel>
                        <Select
                            value={sectionData.escolaridad || ''}
                            onChange={(e) => handleChange(section, 'escolaridad', e.target.value)}
                        >
                            {opcionesEscolaridad.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Enfermedades"
                        value={sectionData.enfermedades || ''}
                        onChange={(e) => handleChange(section, 'enfermedades', e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Alergias"
                        value={sectionData.alergias || ''}
                        onChange={(e) => handleChange(section, 'alergias', e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Medicamentos"
                        value={sectionData.medicamentos || ''}
                        onChange={(e) => handleChange(section, 'medicamentos', e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />
                </Grid>
            </>
        );
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6">Antecedentes Familiares Maternos</Typography>
            </Grid>
            {renderFamiliarFields('ant_familiares_materno', 'padre')}

            <Grid item xs={12}>
                <Typography variant="h6">Antecedentes Familiares Paternos</Typography>
            </Grid>
            {renderFamiliarFields('ant_familiares_paterno', 'madre')}

            <Grid item xs={12}>
                <Typography variant="h6">Otros Antecedentes Familiares</Typography>
            </Grid>
            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={historia.otros_antecedentes?.hijo_unico || false}
                            onChange={(e) => handleChange('otros_antecedentes', 'hijo_unico', e.target.checked)}
                        />
                    }
                    label="Hijo Único"
                />
            </Grid>
            {!historia.otros_antecedentes?.hijo_unico && (
                <>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Número de Hijos"
                            value={historia.otros_antecedentes?.no_hijos || ''}
                            onChange={(e) => handleChange('otros_antecedentes', 'no_hijos', e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Posición en la Familia"
                            value={historia.otros_antecedentes?.posicion_familia || ''}
                            onChange={(e) => handleChange('otros_antecedentes', 'posicion_familia', e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Relación con los Hermanos</InputLabel>
                            <Select
                                value={historia.otros_antecedentes?.relacion_hermanos || ''}
                                onChange={(e) => handleChange('otros_antecedentes', 'relacion_hermanos', e.target.value)}
                            >
                                {opcionesRelacion.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </>
            )}
            <Grid item xs={12}>
                <TextField
                    label="Familiares con Enfermedades Diagnosticadas"
                    value={historia.otros_antecedentes?.familiares_enfermedades || ''}
                    onChange={(e) => handleChange('otros_antecedentes', 'familiares_enfermedades', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                />
            </Grid>
        </Grid>
    );
};

export default AntecedentesFamiliares;