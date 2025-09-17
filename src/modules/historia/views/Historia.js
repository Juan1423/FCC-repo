import React, { useEffect, useState } from "react";
import { Grid, Box, Alert } from "@mui/material";
import NavbarAdmin from "../../../components/NavbarAdmin";
import Drawer from "../../../components/Drawer";
import CuadroPaciente from "../../atencion/components/CuadroPaciente";
import { getPaciente } from "../../../services/pacientesServices";
import { getHistoria } from "../../../services/historiaServices";
import { logAuditAction } from '../../../services/auditoriaServices';
import ButtonAdd from "../components/AddButton";
import CuadroHistorialClinico from "../components/CuadroHistorialClinico";
import { usePacienteContext } from "../../../components/base/PacienteContext";
import { getCurrentUserId } from "../../../utils/userUtils";
const Historia = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [historia, setHistoria] = useState(null);
    const [isNewHistory, setIsNewHistory] = useState(true);
    const [loading, setLoading] = useState(false);
    const { selectedPaciente } = usePacienteContext();

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const fetchHistoria = async (pacienteId) => {
        setLoading(true);
        try {
            const historiaData = await getHistoria(pacienteId);
            await logAuditAction('CONSULTAR_HISTORIA', { 
              pacienteId: pacienteId,
              historiaId: historiaData?.id_historia
            });
            
            setHistoria(historiaData);
            setIsNewHistory(!historiaData.motivo_consulta_historia);
        } catch (error) {
            console.error("Error al obtener la historia clínica:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (selectedPaciente !== null) {
                setLoading(true);
                try {
                    const pacienteData = await getPaciente(selectedPaciente);
                    await fetchHistoria(pacienteData.id_paciente);               
                } catch (error) {
                    console.error("Error al obtener datos del paciente o signos vitales:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setHistoria(null);
            }
        };

        fetchData();
    }, [selectedPaciente]);

    const handleHistoriaUpdated = async () => {
        if (selectedPaciente !== null) {
            setLoading(true);
            try {
                const pacienteData = await getPaciente(selectedPaciente);
                const historiaData = await getHistoria(pacienteData.id_paciente);
                setHistoria(historiaData);
                setIsNewHistory(!historiaData.motivo_consulta_historia);

                await logAuditAction('EDITAR_HISTORIA', { 
                  datosAnteriores: historia, 
                  datosNuevos: historiaData 
                });
            } catch (error) {
                console.error("Error updating historia:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Box sx={{ display: "flex" }}>
            <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
            <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
            <Box component="main" sx={{ flexGrow: 1, overflowX: "auto", flexDirection: "column" }}>
                <Box sx={{ flexGrow: 1, justifyContent: 'space-between', mt: { xs: 8, sm: 10 } }}>
                    <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'space-around' }} >
                        <Grid item xs={12} md={6} sx={{ paddingLeft: 2 }}>
                            <CuadroPaciente isDeleteDisable={true}  isNewHistory={isNewHistory}/>
                        </Grid>

                        <Grid item xs={12} md={4} sx={{ alignItems: "center", display: "flex", justifyContent: 'flex-end', paddingRight: 2 }}>
                            <ButtonAdd selectedPaciente={selectedPaciente} onHistoriaUpdated={handleHistoriaUpdated} isNewHistory={isNewHistory} />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                        {selectedPaciente ? (
                            <CuadroHistorialClinico historia={historia} loading={loading} />
                        ) : (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Seleccione Paciente para ver información
                            </Alert>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Historia;