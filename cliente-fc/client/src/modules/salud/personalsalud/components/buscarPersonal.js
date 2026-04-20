import { Container, TextField, Grid, Box } from '@mui/material';
import React, { useState } from 'react';

const BuscarPersonal = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <TextField
              label="Buscar por nombre, apellido o cédula"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default BuscarPersonal;
