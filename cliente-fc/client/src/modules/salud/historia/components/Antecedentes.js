import React from 'react';
import { Typography, Grid, Box, Accordion, AccordionSummary, AccordionDetails, useTheme, useMediaQuery, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const formatKey = (key) => {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const InfoItem = ({ label, value }) => {
  const renderValue = () => {
    if (value === null || value === undefined) {
      return <Typography variant="body2">No disponible</Typography>;
    }

    if (typeof value === 'string' && ['si', 'no', 'sí'].includes(value.toLowerCase())) {
      const isPositive = ['si', 'sí'].includes(value.toLowerCase());
      return (
        <Chip 
          label={isPositive ? 'Sí' : 'No'}
          color={isPositive ? 'success' : 'error'}
          size="small"
        />
      );
    }

    if (Array.isArray(value)) {
      return <Typography variant="body2">{value.join(', ')}</Typography>;
    }

    return <Typography variant="body2">{String(value)}</Typography>;
  };

  return (
    <Box mb={2} textAlign="left">
      <Typography variant="subtitle2" color="primary" gutterBottom>{formatKey(label)}:</Typography>
      {renderValue()}
    </Box>
  );
};

const AntecedentesSection = ({ title, data }) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.only('xs'));

  if (!data || typeof data !== 'object') {
    return null;
  }

  const renderContent = () => (
    <Grid container spacing={2}>
      {Object.entries(data).map(([key, value]) => (
        <Grid item xs={12} sm={6} key={key}>
          <InfoItem label={key} value={Array.isArray(value) ? value.join(', ') : value} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Accordion 
      sx={{
        boxShadow: 1,
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: 0,
          transition: theme.transitions.create(['margin', 'box-shadow']),
          boxShadow: 3,
        },
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ 
        backgroundColor: theme.palette.background.paper,
        transition: theme.transitions.create('padding'),
        '& .MuiAccordion-root.Mui-expanded &': {
          padding: theme.spacing(2, 3, 3),
        },
      }}>
        <Box p={isXsScreen ? 1 : 2}>
          {renderContent()}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

const Antecedentes = ({ historia }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      maxHeight: '100%', 
      overflowY: 'auto', 
      padding: theme.spacing(2), 
      width: '100%',
    }}>
      <Typography variant="h4" gutterBottom color="primary" align="center" sx={{ mb: 4 }}>Antecedentes</Typography>
      <Grid container spacing={3} direction={isSmallScreen ? 'column' : 'row'}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom color="primary" align="left" sx={{ mb: 2 }}>Antecedentes Personales</Typography>
          <Box sx={{ '& > * + *': { mt: 2 } }}>
            <AntecedentesSection title="Prenatales" data={historia.ant_prenatales} />
            <AntecedentesSection title="Perinatales" data={historia.ant_perinatales} />
            <AntecedentesSection title="Postnatales" data={historia.ant_postnatales} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom color="primary" align="left" sx={{ mb: 2 }}>Antecedentes Familiares</Typography>
          <Box sx={{ '& > * + *': { mt: 2 } }}>
            <AntecedentesSection title="Maternos" data={historia.ant_familiares_materno} />
            <AntecedentesSection title="Paternos" data={historia.ant_familiares_paterno} />
            <AntecedentesSection title="Otros Antecedentes" data={historia.otros_antecedentes} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Antecedentes;