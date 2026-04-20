import React, { useState, useEffect } from 'react';
import {
  Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Modal, Typography, Box, CircularProgress, TextField
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import cie11Service from '../../../services/cie11Service.js';
import { logAuditAction } from "../../../services/auditoriaServices";

const Diagnostico = ({ formData, setFormData }) => {
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseList, setDiseaseList] = useState([]);
  const [addedDiseases, setAddedDiseases] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [diseaseToRemove, setDiseaseToRemove] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Inicializar addedDiseases con los datos existentes en formData.diagnostico
    if (formData.diagnostico && formData.diagnostico.length > 0) {
      const initialDiseases = formData.diagnostico.map(d => ({
        title: d.enfermedad,
        type: d.tipoEnfermedad,
        code: d.codigoEnfermedad
      }));
      setAddedDiseases(initialDiseases);
    }
  }, [formData.diagnostico]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchDiseases(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchDiseases = async (query) => {
    setIsLoading(true);
    try {
      const response = await cie11Service.searchDiseases(query);
      console.log(response)
      if (response.length > 0) {
        const diseases = response.map(entity => ({
          code: entity.theCode,
          title: entity.title.replace(/<[^>]*>/g, ''),
          id: entity.id
        }));
        setDiseaseList(diseases);
      } else {
        console.log('No diseases found')
        setDiseaseList([]);
      }
    } catch (error) {
      console.error('Error searching diseases:', error);
      setDiseaseList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDisease = () => {
    if (!selectedDisease) return;
    const newDisease = { ...selectedDisease, type: 'Presuntivo' };
    const updatedDiseases = [...addedDiseases, newDisease];
    setAddedDiseases(updatedDiseases);
    setSelectedDisease(null);
    updateFormData(updatedDiseases);
  };

  const handleRemoveDisease = () => {
    const updatedDiseases = addedDiseases.filter(d => d.code !== diseaseToRemove.code);
    setAddedDiseases(updatedDiseases);
    setOpenModal(false);
    setDiseaseToRemove(null);
    updateFormData(updatedDiseases);
  };

  const handleToggleType = (code) => {
    const updatedDiseases = addedDiseases.map(d => (
      d.code === code ? { ...d, type: d.type === 'Presuntivo' ? 'Definitivo' : 'Presuntivo' } : d
    ));
    setAddedDiseases(updatedDiseases);
    updateFormData(updatedDiseases);
  };

  const updateFormData = async (updatedDiseases) => {
    const diagnosticoData = updatedDiseases.map(disease => ({
      enfermedad: disease.title,
      tipoEnfermedad: disease.type,
      codigoEnfermedad: disease.code
    }));
    
    setFormData(prev => ({ ...prev, diagnostico: diagnosticoData }));

    await logAuditAction('ACTUALIZAR_DIAGNOSTICO', {
        diagnosticosAnteriores: addedDiseases,
        diagnosticosNuevos: updatedDiseases
    });
  };

  return (
    <div>
      {/* <Typography variant="h6">Diagnóstico</Typography> */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={diseaseList}
            getOptionLabel={(option) => `${option.code} - ${option.title}`}
            value={selectedDisease}
            onChange={(event, newValue) => setSelectedDisease(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar enfermedad"
                variant="outlined"
                fullWidth
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            loading={isLoading}
            noOptionsText="No se encontraron enfermedades"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddDisease}
            disabled={!selectedDisease || isLoading}
            style={{ marginTop: '16px' }}
          >
            Agregar Enfermedad
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Enfermedad</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addedDiseases.map((disease) => (
                  <TableRow key={disease.code}>
                    <TableCell>{disease.title}</TableCell>
                    <TableCell>{disease.code}</TableCell>
                    <TableCell>
                      <Switch
                        checked={disease.type === 'Definitivo'}
                        onChange={() => handleToggleType(disease.code)}
                      />
                      {disease.type}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                          setDiseaseToRemove(disease);
                          setOpenModal(true);
                        }}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box style={{ padding: '16px', backgroundColor: 'white', margin: 'auto', top: '50%', transform: 'translateY(-50%)', width: '300px' }}>
          <Typography variant="h6">¿Está seguro de querer quitar esta enfermedad?</Typography>
          <Button variant="contained" color="primary" onClick={handleRemoveDisease}>
            Sí
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setOpenModal(false)} style={{ marginLeft: '16px' }}>
            No
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Diagnostico;