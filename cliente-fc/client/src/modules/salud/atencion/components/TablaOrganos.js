import React from 'react';
import { Box, TextField, Typography, Paper, useMediaQuery, useTheme } from '@mui/material';
import TablaDefault from './TablaDefault';

const TablaOrganos = ({ formData, setFormData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCheckboxChange = (id, type) => {
    setFormData(prevState => ({
      ...prevState,
      organs: prevState.organs.map(row => 
        row.id === id
          ? {
              ...row,
              cpChecked: type === 'CP' ? !row.cpChecked : row.spChecked,
              spChecked: type === 'SP' ? !row.spChecked : row.cpChecked,
              description: type === 'CP' && !row.cpChecked ? '' : row.description
            }
          : row
      )
    }));
  };

  const handleDescriptionChange = (id, value) => {
    setFormData(prevState => ({
      ...prevState,
      organs: prevState.organs.map(row => 
        row.id === id ? { ...row, description: value } : row
      )
    }));
  };

  return (
    <Box>
      <TablaDefault
        data={formData.organs}
        handleCheckboxChange={handleCheckboxChange}
        isMobile={isMobile}
      />
      <Box sx={{ mt: 3 }}>
        {formData.organs.filter(row => row.cpChecked).map(row => (
          <Paper key={row.id} elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{row.organ}</Typography>
            <TextField
              label="Descripción"
              variant="outlined"
              fullWidth
              size="small"
              value={row.description}
              onChange={(e) => handleDescriptionChange(row.id, e.target.value)}
            />
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default TablaOrganos;