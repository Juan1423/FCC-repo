import React from 'react';
import { Grid } from '@mui/material';
import CuadroPaciente from '../../atencion/components/CuadroPaciente';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

export const BootstrapButton = styled(Button)({
  boxShadow: 'none',
  textTransform: 'none',
  fontSize: 14,
  padding: '6px 12px',
  border: '1px solid',
  lineHeight: 1.5,
  backgroundColor: '#6c757d',
  borderColor: '#6c757d',
  fontFamily: [
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  '&:hover': {
    backgroundColor: '#545b62',
    borderColor: '#6c757d',
    boxShadow: 'none',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
  },
  '&:focus': {
    boxShadow: '0 0 0 0.2rem #6c757d',
  },
  '&.Mui-disabled': {
    backgroundColor: '#6c757d',
    color: '#fff',
    opacity: 0.5,
  },
});

const TerapiasHeader = ({ selectedPaciente, navigate }) => {
  return (
    <Grid container spacing={2} sx={{ display: "flex", justifyContent: "space-around" }}>
      <Grid item xs={12} md={6} sx={{ paddingLeft: 2 }}>
        <CuadroPaciente isDeleteDisable={true} />
      </Grid>
      <Grid item xs={12} md={4} sx={{ alignItems: "center", display: "flex", justifyContent: "flex-end", paddingRight: 2 }}>
        <BootstrapButton
          variant="contained" 
          color="primary"  
          onClick={() => navigate(`/nueva-terapia/${selectedPaciente}`)} 
          disabled={!selectedPaciente}
        >
          Nueva Terapia
        </BootstrapButton>
      </Grid>
    </Grid>
  );
};

export default TerapiasHeader;