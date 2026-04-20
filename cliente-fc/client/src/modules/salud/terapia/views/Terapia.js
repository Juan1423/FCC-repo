import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, useMediaQuery, useTheme } from '@mui/material';
import NavbarAdmin from '../../../../components/NavbarAdmin';
import Drawer from '../../../../components/Drawer';
import { getTerapiaByPaciente, updateTerapia, deleteTerapia } from '../../../../services/terapia';
import { useNavigate } from 'react-router-dom';
import TabContext from '@mui/lab/TabContext';
import { usePacienteContext } from '../../../../components/base/PacienteContext';
import TerapiasHeader from '../components/TerapiasHeader';
import TerapiasTabs from '../components/TerapiasTabs';
import TerapiasAnteriores from '../components/TerapiasAnteriores';
import AsistenciaTerapias from '../components/AsistenciaTerapias';
import { getPaciente } from '../../../../services/pacientesServices';
import { logAuditAction } from '../../../../services/auditoriaServices';
  import { getCurrentUserId } from "../../../../utils/userUtils";


export default function Terapias() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { selectedPaciente } = usePacienteContext();
  const [pacienteData, setPacienteData] = useState(null);
  const [tabValue, setTabValue] = useState("1");
  const [terapias, setTerapias] = useState([]);
  const [tipoTerapia, setTipoTerapia] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingPacienteData, setLoadingPacienteData] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch initial data if needed
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchPacienteData = async () => {
      if (selectedPaciente) {
        try {
          setLoadingPacienteData(true);
          const pacient = await getPaciente(selectedPaciente);
          setPacienteData(pacient);
          const response = await getTerapiaByPaciente(selectedPaciente); 
          setTerapias(response);
        } catch (error) {
          console.error("Error fetching patient data:", error);
        } finally {
          setLoadingPacienteData(false);
        }
      }
    };
    fetchPacienteData();
  }, [selectedPaciente]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangeTipoTerapia = (newTipoTerapia) => {
    setTipoTerapia(newTipoTerapia);
  };

  const handleUpdateTerapia = async (terapiaId, updatedTerapiaData) => {
    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error('No user logged in');
      }

      const previousTerapia = terapias.find(t => t.id_terapia === terapiaId);
      const updatedTerapia = await updateTerapia(terapiaId, updatedTerapiaData);

      const detailedDescription = {
        accion: "EDITAR",
        tabla: 'terapias',
        id_registro: terapiaId,
        datos_modificados: {
          estado_anterior: previousTerapia,
          estado_nuevo: updatedTerapia,
          detalles_cambios: {
            tipo_operacion: "Actualización de Terapia",
            campos_modificados: Object.keys(updatedTerapiaData).filter(key => 
              updatedTerapiaData[key] !== previousTerapia[key]
            ),
            fecha_modificacion: new Date().toISOString()
          }
        },
        fecha_modificacion: new Date().toISOString()
      };

      await logAuditAction('EDITAR_TERAPIA', detailedDescription);

      setTerapias(prevTerapias => 
        prevTerapias.map(terapia => 
          terapia.id_terapia === terapiaId ? updatedTerapia : terapia
        )
      );
      return updatedTerapia;
    } catch (error) {
      console.error("Error updating terapia:", error);
      throw error;
    }
  };

  const handleDeleteTerapia = async (terapiaId) => {
    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error('No user logged in');
      }

      const terapiaToDelete = terapias.find(t => t.id_terapia === terapiaId);
      await deleteTerapia(terapiaId);

      const detailedDescription = {
        accion: "ELIMINAR",
        tabla: 'terapias',
        id_registro: terapiaId,
        datos_modificados: {
          estado_anterior: terapiaToDelete,
          estado_nuevo: null,
          detalles_eliminacion: {
            tipo_operacion: "Eliminación de Terapia",
            fecha_eliminacion: new Date().toISOString(),
            paciente_id: selectedPaciente
          }
        },
        fecha_modificacion: new Date().toISOString()
      };

      await logAuditAction('ELIMINAR_TERAPIA', detailedDescription);

      setTerapias(prevTerapias => prevTerapias.filter(terapia => terapia.id_terapia !== terapiaId));
    } catch (error) {
      console.error("Error deleting terapia:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Box sx={{display:'flex'}}>
        <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
        <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{display:'flex'}}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, overflowX: "auto", flexDirection: "column" }}>
        <Box sx={{ flexGrow: 1, justifyContent: "space-between", mt: { xs: 8, sm: 10 } }}>
          <TerapiasHeader 
            selectedPaciente={selectedPaciente}
            navigate={navigate}
          />
          
          <TabContext value={tabValue}>
            <TerapiasTabs 
              tabValue={tabValue}
              handleTabChange={handleTabChange}
              isMobile={isMobile}
            />

            {!selectedPaciente ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Seleccione Paciente para ver información
                </Alert>
              </Box>
            ) : loadingPacienteData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                  <TerapiasAnteriores 
                    terapias={terapias}
                    tipoTerapia={tipoTerapia}
                    handleChangeTipoTerapia={handleChangeTipoTerapia}
                    handleUpdateTerapia={handleUpdateTerapia}
                    handleDeleteTerapia={handleDeleteTerapia}
                    tabValue={tabValue}
                    pacienteData={pacienteData}
                  />
                
                <AsistenciaTerapias 
                  terapias={terapias}
                  tipoTerapia={tipoTerapia}
                  handleChangeTipoTerapia={handleChangeTipoTerapia}
                  tabValue={tabValue}
                />
              </>
            )}
          </TabContext>
        </Box>
      </Box>
    </Box>
  );
}