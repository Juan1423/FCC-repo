import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import AddModalHistoria from '../../historia/components/AddModalHistoria';

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

export default function AtencionButton({ selectedPaciente, isFirstAttention }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClick = () => {
    if (!selectedPaciente) {
      setAlertOpen(true);
      return;
    }

    if (isFirstAttention) {
      setAlertOpen(true);
    } else {
      navigate(`/fcc-atencion/nueva-atencion?id=${selectedPaciente}&type=control`);
    }
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    setModalOpen(true);
  };

  const handleHistoriaUpdated = () => {
    setModalOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    navigate(`/fcc-atencion/nueva-atencion?id=${selectedPaciente}&type=control`);
  };

  return (
    <Stack spacing={2} direction="row">
      <BootstrapButton 
        onClick={handleClick} 
        variant='contained' 
        color='primary' 
        disableRipple
        disabled={!selectedPaciente}
      >
        {isFirstAttention ? "Registrar Historia Clínica" : "Nuevo Control"}
      </BootstrapButton>
      <AddModalHistoria
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        historiaId={selectedPaciente}
        onHistoriaUpdated={handleHistoriaUpdated}
      />
      <Dialog
        open={alertOpen}
        onClose={handleAlertClose}
      >
        <DialogTitle>Aviso</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para realizar consultas de control o evoluciones es necesario registrar la historia clínica.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertClose} color="primary" autoFocus>
            Registrar Historia Clínica
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
      >
        <DialogTitle>Confirmación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Los datos han sido guardados exitosamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}