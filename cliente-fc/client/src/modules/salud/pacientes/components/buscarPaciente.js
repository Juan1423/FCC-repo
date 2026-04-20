import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, TextField, Grid, Box, FormControlLabel, Switch, Tooltip } from '@mui/material';

const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debouncedFunction = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return debouncedFunction;
};

const BuscarPaciente = ({ onSearch, onFilterChange, initialActiveOnly = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(initialActiveOnly);

  const debouncedSearch = useDebounce((term, active) => {
    onSearch(term, active);
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm, activeOnly);
  }, [searchTerm, activeOnly, debouncedSearch]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleActiveToggle = (event) => {
    const newActiveOnly = event.target.checked;
    setActiveOnly(newActiveOnly);
    onFilterChange(newActiveOnly);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Tooltip title="Ingresa el nombre, apellido o cédula del paciente para buscarlo">
              <TextField
                label="Buscar por nombre, apellido o cédula"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Tooltip title="Activa para mostrar solo pacientes activos, desactiva para mostrar todos">
              <FormControlLabel
                control={
                  <Switch
                    checked={activeOnly}
                    onChange={handleActiveToggle}
                    color="primary"
                  />
                }
                label="Solo activos"
              />
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default BuscarPaciente;