import React, { useEffect, useState, useCallback } from "react";
import {
  Grid,
  Box,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
  Alert,
} from "@mui/material";
import NavbarAdmin from "../../../../components/NavbarAdmin";
import Drawer from "../../../../components/Drawer";
import CuadroPaciente from "../components/CuadroPaciente";
import CuadroSignosVitales from "../components/CuadroSignosVitales";
import { getPaciente } from "../../../../services/pacientesServices";
import {
  getLastSignosVitales,
  getAtenciones,
} from "../../../../services/atencion";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import AtencionButton from "../components/AtencionButton";
import CuadroAtenciones from "../components/CuadroAtenciones";
import { usePacienteContext } from "../../../../components/base/PacienteContext";
import ExamenesTabView from "../components/ExamenesTabView";
import { logAuditAction } from "../../../../services/auditoriaServices";
import { getCurrentUserId } from "../../../../utils/userUtils";
import { getHistorias } from "../../../../services/historiaServices";
const Atencion = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { selectedPaciente } = usePacienteContext();
  const [ultimosSignosVitales, setUltimosSignosVitales] = useState(null);
  const [value, setValue] = useState("1");
  const [atenciones, setAtenciones] = useState([]);
  const [isFirstAttention, setIsFirstAttention] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const resetData = useCallback(() => {
    setUltimosSignosVitales(null);
    setAtenciones([]);
  }, []);

  const fetchData = useCallback(async () => {
    if (selectedPaciente) {
      try {
        console.log("[DIAG] selectedPaciente:", selectedPaciente);
        const pacienteData = await getPaciente(selectedPaciente);
        console.log("[DIAG] pacienteData:", pacienteData);
        if (pacienteData && pacienteData.id_paciente) {
          const historias = await getHistorias();
          const historia = historias.find(h => String(h.id_paciente) === String(selectedPaciente));
          const historiaId = historia?.id_historia;
          console.log("[DIAG] historia encontrada:", historia, "→ id_historia:", historiaId);

          const hasClinicalData = historia && (
            historia.motivo_consulta_historia ||
            historia.diagnostico_presuntivo ||
            historia.observaciones ||
            (Array.isArray(historia.alergias) && historia.alergias.length > 0) ||
            (Array.isArray(historia.medicamentos) && historia.medicamentos.length > 0)
          );
          setIsFirstAttention(!historiaId || !hasClinicalData);

          const loggedInUserId = getCurrentUserId();
          if (!loggedInUserId) {
            throw new Error('No user logged in');
          }

          const detailedDescription = {
            accion: "CONSULTAR",
            tabla: 'atenciones',
            id_registro: pacienteData.id_paciente,
            datos_modificados: {
              estado_anterior: null,
              estado_nuevo: null,
              detalles_consulta: {
                paciente: {
                  id: pacienteData.id_paciente,
                  nombre: `${pacienteData.nombres_paciente} ${pacienteData.apellidos_paciente}`,
                  dni: pacienteData.dni_paciente
                },
                tipo_consulta: "Historial de Atenciones",
                fecha_consulta: new Date().toISOString()
              }
            },
            fecha_modificacion: new Date().toISOString()
          };

          await logAuditAction('CONSULTAR_ATENCION', detailedDescription);

          if (historiaId) {
            const atencionesData = await getAtenciones(historiaId);
            console.log("[DIAG] atencionesData:", atencionesData);
            setAtenciones(atencionesData);
            const signosVitalesData = await getLastSignosVitales(historiaId);
            setUltimosSignosVitales(signosVitalesData);
          } else {
            setAtenciones([]);
            setUltimosSignosVitales(null);
          }
        } else {
          console.error("[DIAG] Datos de paciente no válidos");
          resetData();
        }
      } catch (error) {
        console.error(
          "[DIAG] Error al obtener datos:",
          error
        );
        resetData();
      }
    } else {
      setIsFirstAttention(false);
      resetData();
    }
  }, [selectedPaciente, resetData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{ flexGrow: 1, overflowX: "auto", flexDirection: "column" }}
      >
        <Box
          sx={{
            flexGrow: 1,
            justifyContent: "space-between",
            mt: { xs: 8, sm: 10 },
          }}
        >
          <Grid
            container
            spacing={2}
            sx={{ display: "flex", justifyContent: "space-around" }}
          >
            <Grid item xs={12} md={6} sx={{ paddingLeft: 2 }}>
              <CuadroPaciente isDeleteDisable={true} />
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "flex-end",
                paddingRight: 2,
              }}
            >
              <AtencionButton
                selectedPaciente={selectedPaciente}
                isFirstAttention={isFirstAttention}
              />
            </Grid>
          </Grid>
          <TabContext value={value}>
            <Box
              sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }}
              justifyContent="center"
              width="100%"
            >
              <Tabs
                centered={!isMobile}
                value={value}
                onChange={handleChange}
                aria-label="consulta tabs"
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab
                  label="Consultas Realizadas"
                  value="1"
                  sx={{
                    color: "#00000099",
                    backgroundColor: "#FFFFFF",
                    "&.Mui-selected": {
                      backgroundColor: "#F3F4F6",
                      color: "#000000",
                    },
                    textTransform: "none",
                  }}
                />
                <Tab
                  label="Información General"
                  value="2"
                  sx={{
                    color: "#00000099",
                    backgroundColor: "#FFFFFF",
                    "&.Mui-selected": {
                      backgroundColor: "#F3F4F6",
                      color: "#000000",
                    },
                    textTransform: "none",
                  }}
                />
                <Tab
                  label="Exámenes"
                  value="3"
                  sx={{
                    color: "#00000099",
                    backgroundColor: "#FFFFFF",
                    "&.Mui-selected": {
                      backgroundColor: "#F3F4F6",
                      color: "#000000",
                    },
                    textTransform: "none",
                  }}
                />
              </Tabs>
            </Box>

            <TabPanel value="1">
              <CuadroAtenciones
                selectedPaciente={selectedPaciente}
                atenciones={atenciones}
              />
            </TabPanel>

            <TabPanel value="2">
              {selectedPaciente ? (
                <CuadroSignosVitales
                  ultimosSignosVitales={ultimosSignosVitales}
                />
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Seleccione Paciente para ver información
                </Alert>
              )}
            </TabPanel>
            <TabPanel value="3">
              <ExamenesTabView />
            </TabPanel>
          </TabContext>
        </Box>
      </Box>
    </Box>
  );
};

export default Atencion;
