import React, { useState, useEffect } from 'react';
import { TabPanel } from '@mui/lab';
import { Grid, FormControl, InputLabel, Select, MenuItem, Paper, Typography } from '@mui/material';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

const tiposTerapia = [
  { id: 'all', name: 'Todas las Terapias' },
  { id: '1', name: 'Terapia de Lenguaje' },
  { id: '2', name: 'Terapia Física' },
  { id: '3', name: 'Terapia Ocupacional' },
];

const AsistenciaTerapias = ({ terapias, tipoTerapia, handleChangeTipoTerapia, tabValue }) => {
  const [fechasAsistencia, setFechasAsistencia] = useState([]);
  const [asistenciasMensuales, setAsistenciasMensuales] = useState([]);

  useEffect(() => {
    updateAsistenciasData(terapias, tipoTerapia);
  }, [terapias, tipoTerapia]);



  const updateAsistenciasData = (terapias, selectedTipoTerapia) => {
    const filteredTerapias = selectedTipoTerapia === 'all' 
      ? terapias 
      : terapias.filter(terapia => terapia.id_tipo_terapia === selectedTipoTerapia);

    const fechasTerapias = filteredTerapias.map(terapia => dayjs(terapia.fecha_hora));
    
    setFechasAsistencia(fechasTerapias);
    setAsistenciasMensuales(fechasTerapias.reduce((acc, date) => {
      const mes = date.format('MMMM');
      const index = acc.findIndex(item => item.mes === mes);
      if (index === -1) {
        acc.push({ mes, asistencias: 1 });
      } else {
        acc[index].asistencias++;
      }
      return acc;
    }, []));
  };

  return (
    <TabPanel value="2">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="tipo-terapia-label">Tipo de Terapia</InputLabel>
            <Select
              labelId="tipo-terapia-label"
              value={tipoTerapia}
              label="Tipo de Terapia"
              onChange={(e) => handleChangeTipoTerapia(e.target.value)}
            >
              {tiposTerapia.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id}>{tipo.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Calendario de Asistencia
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                openTo="day"
                value={dayjs()}
                onChange={() => {}}
                renderInput={() => {}}
                shouldDisableDate={(day) => !fechasAsistencia.some(date => date.isSame(day, 'day'))}
                sx={{
                  '.MuiPickersDay-root': {
                    '&:not(.Mui-disabled)': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 'bold',
                      border: '1px solid',
                      borderColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      },
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'secondary.main',
                      color: 'secondary.contrastText',
                      border: '2px solid',
                      borderColor: 'secondary.dark',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      },
                    },
                  },
                  '.MuiPickersDay-today': {
                    borderColor: 'primary.dark',
                    borderWidth: '2px',
                  },
                }}
              />
            </LocalizationProvider>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Asistencia Mensual
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={asistenciasMensuales}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="asistencias" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </TabPanel>
  );
};

export default AsistenciaTerapias;