import React from 'react';
import { Grid, TextField, Typography, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const tiposParto = [
    { value: 'corto', label: 'Corto' },
    { value: 'prolongado', label: 'Prolongado' },
    { value: 'inducido', label: 'Inducido' },
    { value: 'cesarea', label: 'Cesárea' },
    { value: 'vaginal', label: 'Vaginal' },
];

const AntecedentesPersonales = ({ historia, handleNestedChange }) => {
    const handleChange = (section, field, value) => {
        handleNestedChange(section, field, value);
    };

    const handleSwitchChange = (section, field) => (event) => {
        handleNestedChange(section, field, event.target.checked ? 'si' : 'no');
    };

    const ensureArray = (value) => Array.isArray(value) ? value : [];

    // Asegurar que las secciones existan
    const ant_prenatales = historia.ant_prenatales || {};
    const ant_perinatales = historia.ant_perinatales || {};
    const ant_postnatales = historia.ant_postnatales || {};

    const LabeledSwitch = ({ label, checked, onChange }) => (
        <FormControlLabel
            control={
                <Switch
                    checked={checked}
                    onChange={onChange}
                    color="primary"
                />
            }
            label={`${label}: ${checked ? 'Sí' : 'No'}`}
        />
    );

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6">Antecedentes Prenatales</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Edad Gestación"
                    value={ant_prenatales.edad_gestacion || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'edad_gestacion', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <LabeledSwitch
                    label="Deseado"
                    checked={ant_prenatales.deseado === 'si'}
                    onChange={handleSwitchChange('ant_prenatales', 'deseado')}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <LabeledSwitch
                    label="Planificación Familiar"
                    checked={ant_prenatales.planificacion_familiar === 'si'}
                    onChange={handleSwitchChange('ant_prenatales', 'planificacion_familiar')}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Hábitos"
                    value={ant_prenatales.habitos || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'habitos', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Ecografías"
                    type="number"
                    value={ant_prenatales.ecografias || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'ecografias', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Controles"
                    type="number"
                    value={ant_prenatales.controles || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'controles', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <LabeledSwitch
                    label="Alimentación Adecuada"
                    checked={ant_prenatales.alimentacion_adecuada === true}
                    onChange={(e) => handleChange('ant_prenatales', 'alimentacion_adecuada', e.target.checked)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Estado Emocional"
                    value={ant_prenatales.estado_emocional || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'estado_emocional', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Causas Estado Emocional"
                    value={ant_prenatales.causas_estado_emocional || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'causas_estado_emocional', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <LabeledSwitch
                    label="Abortos"
                    checked={ant_prenatales.abortos === 'si'}
                    onChange={handleSwitchChange('ant_prenatales', 'abortos')}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Causas Abortos"
                    value={ant_prenatales.causas_abortos || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'causas_abortos', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Enfermedades Padecidas"
                    value={ensureArray(ant_prenatales.enfermedades_padecidas).join(', ')}
                    onChange={(e) => handleChange('ant_prenatales', 'enfermedades_padecidas', e.target.value.split(', '))}
                    fullWidth
                    helperText="Separe las enfermedades con comas"
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Medicamentos"
                    value={ant_prenatales.medicamentos || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'medicamentos', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Ácido Fólico"
                    value={ant_prenatales.acido_folico || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'acido_folico', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <LabeledSwitch
                    label="Amenaza Aborto"
                    checked={ant_prenatales.amenaza_aborto === 'si'}
                    onChange={handleSwitchChange('ant_prenatales', 'amenaza_aborto')}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Caídas"
                    value={ant_prenatales.caidas || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'caidas', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <LabeledSwitch
                    label="Disfunción Placentaria"
                    checked={ant_prenatales.disfuncion_placentaria === 'si'}
                    onChange={handleSwitchChange('ant_prenatales', 'disfuncion_placentaria')}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <LabeledSwitch
                    label="Preclampsia"
                    checked={ant_prenatales.preclampsia === 'si'}
                    onChange={handleSwitchChange('ant_prenatales', 'preclampsia')}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <LabeledSwitch
                    label="Diabetes Gestacional"
                    checked={ant_prenatales.diabetes_gestacional === 'si'}
                    onChange={handleSwitchChange('ant_prenatales', 'diabetes_gestacional')}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Otros"
                    value={ant_prenatales.otros || ''}
                    onChange={(e) => handleChange('ant_prenatales', 'otros', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6">Antecedentes Perinatales</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Semanas Nacimiento"
                    value={ant_perinatales.semanas_nacimiento || ''}
                    onChange={(e) => handleChange('ant_perinatales', 'semanas_nacimiento', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Tipo Parto</InputLabel>
                    <Select
                        value={ant_perinatales.tipo_parto || ''}
                        onChange={(e) => handleChange('ant_perinatales', 'tipo_parto', e.target.value)}
                    >
                        {tiposParto.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Peso (gramos)"
                    type="number"
                    value={ant_perinatales.peso || ''}
                    onChange={(e) => handleChange('ant_perinatales', 'peso', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Talla (cm)"
                    type="number"
                    value={ant_perinatales.talla || ''}
                    onChange={(e) => handleChange('ant_perinatales', 'talla', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Perímetro Cefálico (cm)"
                    type="number"
                    value={ant_perinatales.perimetro_cefalico || ''}
                    onChange={(e) => handleChange('ant_perinatales', 'perimetro_cefalico', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="APGAR"
                    value={ant_perinatales.apgar || ''}
                    onChange={(e) => handleChange('ant_perinatales', 'apgar', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <LabeledSwitch
                    label="Llanto Inmediato"
                    checked={ant_perinatales.llanto_inmediato === 'si'}
                    onChange={handleSwitchChange('ant_perinatales', 'llanto_inmediato')}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Succión"
                    value={ant_perinatales.succion || ''}
                    onChange={(e) => handleChange('ant_perinatales', 'succion', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Complicaciones"
                    value={ensureArray(ant_perinatales.complicaciones).join(', ')}
                    onChange={(e) => handleChange('ant_perinatales', 'complicaciones', e.target.value.split(', '))}
                    fullWidth
                    helperText="Separe las complicaciones con comas"
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <LabeledSwitch
                    label="Incubadora"
                    checked={ant_perinatales.incubadora === 'si'}
                    onChange={handleSwitchChange('ant_perinatales', 'incubadora')}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Motivos Incubadora"
                    value={ant_perinatales.motivos_incubadora || ''}
                    onChange={(e) => handleChange('ant_perinatales', 'motivos_incubadora', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6">Antecedentes Postnatales</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Convulsiones"
                    value={ant_postnatales.convulsiones || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'convulsiones', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Vacunas"
                    value={ant_postnatales.vacunas || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'vacunas', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Lactancia"
                    value={ant_postnatales.lactancia || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'lactancia', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Enfermedades Padecidas"
                    value={ant_postnatales.enfermedades_padecidas || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'enfermedades_padecidas', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Control de Esfínteres"
                    value={ant_postnatales.control_esfinteres || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'control_esfinteres', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Sedestación"
                    value={ant_postnatales.sedestacion || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'sedestacion', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Bipedestación"
                    value={ant_postnatales.bipedestacion || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'bipedestacion', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Control Cefálico"
                    value={ant_postnatales.control_cefalico || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'control_cefalico', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Gateo"
                    value={ant_postnatales.gateo || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'gateo', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Volteo"
                    value={ant_postnatales.volteo || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'volteo', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Marcha"
                    value={ant_postnatales.marcha || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'marcha', e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Observaciones"
                    value={ant_postnatales.observaciones || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'observaciones', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Problemas"
                    value={ant_postnatales.problemas || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'problemas', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    label="Caídas"
                    value={ant_postnatales.caidas || ''}
                    onChange={(e) => handleChange('ant_postnatales', 'caidas', e.target.value)}
                    fullWidth
                />
            </Grid>
        </Grid>
    );
};

export default AntecedentesPersonales;