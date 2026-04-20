import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import AddModalHistoria from './AddModalHistoria';

const BootstrapButton = styled(Button)({
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
});

export default function AddButton({ selectedPaciente, onHistoriaUpdated,isNewHistory}) {
  const [openModal, setOpenModal] = useState(false);

  const handleClick = () => {
    if (selectedPaciente) {
      setOpenModal(true);
    } else {
      alert('Seleccione primero al paciente');
    }
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <Stack spacing={2} direction="row">
      <BootstrapButton onClick={handleClick} variant='contained' disableRipple>
        {isNewHistory ? 'Registrar Historia Clínica General' : 'Editar Historia Clínica General'}
      </BootstrapButton>
      <AddModalHistoria open={openModal} onClose={handleClose} historiaId={selectedPaciente} onHistoriaUpdated={onHistoriaUpdated} />
    </Stack>
  );
}
