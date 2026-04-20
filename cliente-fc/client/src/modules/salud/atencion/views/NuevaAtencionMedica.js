import React, { useEffect, useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Drawer,
  Grid,
  useMediaQuery,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavbarAdmin from "../../../components/NavbarAdmin";
import CuadroPaciente from "../components/CuadroPaciente";
import TablaOrganos from "../components/TablaOrganos";
import TablaExamenFisico from "../components/TablaExamenFisico";
import Diagnostico from "../components/Diagnostico";
import Tratamiento from "../components/Tratamiento";
import {createAtencion,createSignosVitales,} from "../../../services/atencion";
import {getHistoria,updateHistoria,} from "../../../services/historiaServices";
import {organs,regions,NewAtencionSteps,} from "../../../components/data/Data";
import { usePacienteContext } from "../../../components/base/PacienteContext";
import Antecedentes from "../../historia/components/Antecedentes";
import { logAuditAction } from "../../../services/auditoriaServices";
import { getCurrentUserId } from "../../../utils/userUtils";
const steps = NewAtencionSteps;

function StepContent({
  step,
  formData,
  setFormData,
  consultType,
  motivoConsultaHistoria,
}) {
  switch (step) {
    case 0:
      return null;
    case 1:
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {consultType === "control"
              ? "Motivo de Consulta Original"
              : "Motivo de Consulta"}
          </Typography>
          {consultType === "control" ? (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {motivoConsultaHistoria}
            </Typography>
          ) : (
            <TextField
              multiline
              rows={3}
              placeholder="Motivo de Consulta"
              fullWidth
              variant="outlined"
              value={formData.motivoConsulta}
              onChange={(e) =>
                setFormData({ ...formData, motivoConsulta: e.target.value })
              }
              sx={{ mb: 2 }}
            />
          )}

          <Typography variant="h6" sx={{ mb: 2 }}>
            Signos Vitales
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Temp. (°C)"
                type="number"
                fullWidth
                size="small"
                value={formData.temperatura}
                onChange={(e) =>
                  setFormData({ ...formData, temperatura: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="P. Arterial"
                fullWidth
                size="small"
                value={formData.presionArterial}
                onChange={(e) =>
                  setFormData({ ...formData, presionArterial: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Pulso"
                type="number"
                fullWidth
                size="small"
                value={formData.pulso}
                onChange={(e) =>
                  setFormData({ ...formData, pulso: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Frec. Resp."
                type="number"
                fullWidth
                size="small"
                value={formData.frecuenciaRespiratoria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frecuenciaRespiratoria: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Peso (kg)"
                type="number"
                fullWidth
                size="small"
                value={formData.peso}
                onChange={(e) =>
                  setFormData({ ...formData, peso: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Talla (cm)"
                type="number"
                fullWidth
                size="small"
                value={formData.talla}
                onChange={(e) =>
                  setFormData({ ...formData, talla: e.target.value })
                }
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mb: 2 }}>
            {consultType === "control"
              ? "¿Presenta algún problema?"
              : "Problema Actual"}
          </Typography>
          <TextField
            multiline
            rows={3}
            placeholder={
              consultType === "control"
                ? "¿Presenta algún problema?"
                : "Problema Actual"
            }
            fullWidth
            variant="outlined"
            value={formData.problemaActual}
            onChange={(e) =>
              setFormData({ ...formData, problemaActual: e.target.value })
            }
          />
        </Box>
      );
    case 2:
      return (
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" sx={{ textAlign: "start", p: 1 }}>
            CP = CON EVIDENCIA DE PATOLOGÍA: MARCAR "X" Y DESCRIBIR ABAJO
            ANOTANDO EL NÚMERO Y LETRA SP = SIN EVIDENCIA DE PATOLOGÍA: MARCAR
            "X" Y NO DESCRIBIR
          </Typography>
          <TablaOrganos formData={formData} setFormData={setFormData} />
        </Box>
      );
    case 3:
      return (
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" sx={{ textAlign: "start", p: 1 }}>
            CP = CON EVIDENCIA DE PATOLOGÍA: MARCAR "X" Y DESCRIBIR ABAJO
            ANOTANDO EL NÚMERO Y LETRA SP = SIN EVIDENCIA DE PATOLOGÍA: MARCAR
            "X" Y NO DESCRIBIR
          </Typography>
          <TablaExamenFisico formData={formData} setFormData={setFormData} />
        </Box>
      );
    case 4:
      return (
        <Box>
          <Diagnostico formData={formData} setFormData={setFormData} />
        </Box>
      );
    case 5:
      return (
        <Box>
          <Tratamiento formData={formData} setFormData={setFormData} />
        </Box>
      );
    default:
      return "Unknown step";
  }
}

export default function NuevaAtencionMedica() {
  const [activeStep, setActiveStep] = useState(0);
  const { selectedPaciente } = usePacienteContext();

  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [patientLoaded, setPatientLoaded] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [consultType, setConsultType] = useState("externa");
  const [motivoConsultaHistoria, setMotivoConsultaHistoria] = useState("");
  const [historia, setHistoria] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pacienteId = searchParams.get("id");
  const typeParam = searchParams.get("type");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState({
    motivoConsulta: "",
    temperatura: "",
    presionArterial: "",
    pulso: "",
    frecuenciaRespiratoria: "",
    peso: "",
    talla: "",
    problemaActual: "",
    tratamiento: "",
    medicamentos: [],
    organs: organs.map((organ, index) => ({
      id: `organ-${index}`,
      organ,
      cpChecked: false,
      spChecked: true,
      description: "",
    })),
    regions: regions.map((region, index) => ({
      id: `region-${index}`,
      region,
      cpChecked: false,
      spChecked: true,
      description: "",
    })),
    diagnostico: [],
  });

  useEffect(() => {
    const loadPaciente = async () => {
      setLoading(true);
      setPatientLoaded(false);
      if (pacienteId) {
        try {
          const historiaData = await getHistoria(pacienteId);

          console.log("Historia data:", historiaData);
          setHistoria(historiaData);
          setMotivoConsultaHistoria(
            historiaData.motivo_consulta_historia || ""
          );
          setActiveStep(1);
          setPatientLoaded(true);
          setConsultType(typeParam || "externa");
        } catch (error) {
          console.error("Error loading patient:", error);
        }
      } else {
        setPatientLoaded(true);
      }
      setLoading(false);
    };

    loadPaciente();
  }, [pacienteId, typeParam]);

  const handleNext = () => {
    if (activeStep === 0 && !selectedPaciente) {
      setSnackbarOpen(true);
      return;
    }
    if (activeStep === steps.length - 1) {
      setConfirmDialogOpen(true);
    } else {
      let nextStep = activeStep + 1;
      if (consultType === "control") {
        // Skip "Revisión Actual de Órganos y Sistemas" and "Diagnóstico" for control consultations
        if (nextStep === 2 || nextStep === 4) {
          nextStep++;
        }
      }
      setActiveStep(nextStep);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleBack = () => {
    let prevStep = activeStep - 1;
    if (consultType === "control") {
      // Skip "Revisión Actual de Órganos y Sistemas" and "Diagnóstico" for control consultations
      if (prevStep === 4 || prevStep === 2) {
        prevStep--;
      }
    }
    setActiveStep(prevStep);
  };

  const handleSave = async () => {
    const currentDate = new Date();
    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error('No user logged in');
      }

      const data = {
        id_historia: selectedPaciente,
        id_personalsalud: loggedInUserId,
        problema_actual: formData.problemaActual || "",
        fecha_atencion: currentDate,
        motivo_consulta: consultType,
        revision_actual_sistema: JSON.stringify(formData.organs),
        examen_fisico: JSON.stringify(formData.regions),
        plan_tratamiento: formData.tratamiento || "",
        prescripciones: JSON.stringify(formData.medicamentos),
        diagnostico: JSON.stringify(formData.diagnostico),
        tipo_consulta: consultType,
      };

      const response = await createAtencion(data);

      // Audit for Atencion creation
      const atencionAuditDescription = {
        accion: "CREAR",
        tabla: 'atenciones',
        id_registro: response.data.id_aps,
        datos_modificados: {
          estado_anterior: null,
          estado_nuevo: {
            ...data,
            diagnosticos: formData.diagnostico,
            fecha_creacion: currentDate.toISOString()
          },
          detalles_creacion: {
            tipo_operacion: "Nueva Atención Médica",
            tipo_consulta: consultType,
            paciente_id: selectedPaciente,
            fecha_atencion: currentDate.toISOString()
          }
        },
        fecha_modificacion: currentDate.toISOString()
      };

      await logAuditAction('CREAR_ATENCION_MEDICA', atencionAuditDescription);

      const signosVitales = {
        id_historia: selectedPaciente,
        id_aps: response.data.id_aps,
        fecha_medicion: currentDate,
        temperatura: formData.temperatura || "0",
        presion_arterial: formData.presionArterial || "0",
        pulso: formData.pulso || "0",
        frecuencia_respiratoria: formData.frecuenciaRespiratoria || "0",
        peso: formData.peso || "0",
        talla: formData.talla || "0",
      };

      await createSignosVitales(signosVitales, selectedPaciente);

      // Audit for Signos Vitales creation
      const signosVitalesAuditDescription = {
        accion: "CREAR",
        tabla: 'signos_vitales',
        id_registro: selectedPaciente,
        datos_modificados: {
          estado_anterior: null,
          estado_nuevo: signosVitales,
          detalles_creacion: {
            tipo_operacion: "Registro de Signos Vitales",
            atencion_id: response.data.id_aps,
            paciente_id: selectedPaciente,
            fecha_medicion: currentDate.toISOString()
          }
        },
        fecha_modificacion: currentDate.toISOString()
      };

            await logAuditAction('CREAR_SIGNOS_VITALES', signosVitalesAuditDescription);

      // Update historia if not a control consultation
      if (consultType !== "control") {
        const historiaUpdate = {
          motivo_consulta_historia: formData.motivoConsulta
        };

        await updateHistoria(selectedPaciente, historiaUpdate);

        // Audit for Historia update
        const historiaAuditDescription = {
          accion: "EDITAR",
          tabla: 'historia',
          id_registro: selectedPaciente,
          datos_modificados: {
            estado_anterior: { motivo_consulta_historia: motivoConsultaHistoria },
            estado_nuevo: historiaUpdate,
            detalles_cambios: {
              tipo_operacion: "Actualización de Historia Clínica",
              campo_modificado: "motivo_consulta_historia",
              fecha_modificacion: currentDate.toISOString(),
              atencion_id: response.data.id_aps
            }
          },
          fecha_modificacion: currentDate.toISOString()
        };

        await logAuditAction('ACTUALIZAR_HISTORIA_ATENCION', historiaAuditDescription);
      }

      setSaveSuccess(true);
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error creating atencion:", error);
      alert("Error al registrar la atención médica");
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleCancel = () => {
    navigate("/fcc-atencion");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", mt: 8, p: 1 }}>
      <NavbarAdmin />
      <Box sx={{ flexGrow: 1, p: 3, width: "100%" }}>
        {patientLoaded && (
          <Grid
            container
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              boxShadow: 1,
              paddingRight: 1,
              paddingLeft: 1,
            }}
          >
            <Grid item sx={8}>
              <CuadroPaciente isDeleteDisable={false} />
            </Grid>
            <Grid item sx={4}>
              <Box
                sx={{
                  mt: isMobile ? 2 : 0,
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCancel}
                  sx={{ mr: isMobile ? 0 : 2, mb: isMobile ? 1 : 0 }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDrawerToggle}
                >
                  Revisar Antecedentes
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
        <Stepper
          activeStep={activeStep}
          sx={{ mb: 2 }}
          orientation={isMobile ? "vertical" : "horizontal"}
        >
          {steps
            .filter(
              (_, index) =>
                consultType !== "control" || (index !== 2 && index !== 4)
            )
            .map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
        </Stepper>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          PaperProps={{
            sx: {
              width: "40%",
            },
          }}
        >
          <Box sx={{ width: "90%", p: 2 }}>
            <Typography variant="h6">Revisar Antecedentes</Typography>
            <Antecedentes historia={historia} />
          </Box>
        </Drawer>

        {saveSuccess ? (
          <Box
            sx={{
              mt: 2,
              mb: 1,
              p: 2,
              backgroundColor: "#e8f5e9",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: "#2e7d32", mb: 1 }}>
              ¡Atención médica registrada exitosamente!
            </Typography>
            <Typography variant="body1">
              Todos los pasos se han completado y la información ha sido
              guardada.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/fcc-atencion")}
              sx={{ mt: 2 }}
            >
              Volver a la lista de atenciones
            </Button>
          </Box>
        ) : (
          <React.Fragment>
            <StepContent
              step={activeStep}
              selectedPaciente={selectedPaciente}
              formData={formData}
              setFormData={setFormData}
              consultType={consultType}
              motivoConsultaHistoria={motivoConsultaHistoria}
            />
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Button
                color="warning"
                variant="contained"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Atrás
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button
                onClick={handleNext}
                variant="contained"
                color={activeStep === steps.length - 1 ? "success" : "primary"}
              >
                {activeStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
              </Button>
            </Box>
          </React.Fragment>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="warning"
            sx={{ width: "100%" }}
          >
            Por favor, seleccione un paciente antes de continuar.
          </Alert>
        </Snackbar>

        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"¿Está seguro de guardar la atención médica?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Una vez guardada, no podrá modificar esta atención. Asegúrese de
              que todos los datos estén correctos.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleSave} color="primary" autoFocus>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
