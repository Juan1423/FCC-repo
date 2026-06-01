import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  Alert,
  Stack,
  useMediaQuery,
  useTheme,
  Divider,
  IconButton,
} from "@mui/material";
import {
  LockOutlined as LockIcon,
  DeleteOutline as DeleteIcon,
  SettingsOutlined as SettingsIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Drawer from "../../../../components/Drawer";
import NavbarAdmin from "../../../../components/NavbarAdmin";
import { logAuditAction } from "../../../../services/auditoriaServices";
import { getCurrentUserId } from "../../../../utils/userUtils";
import { changePassword } from "../../../../services/authServices";

const Configuracion = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isFullScreenDialog = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error("No user logged in");
      }

      const detailedDescription = {
        accion: "ELIMINAR",
        tabla: "usuarios",
        id_registro: loggedInUserId,
        datos_modificados: {
          estado_anterior: { id_usuario: loggedInUserId, estado: "activo" },
          estado_nuevo: { id_usuario: loggedInUserId, estado: "eliminado" },
          detalles_eliminacion: {
            tipo_operacion: "Eliminación de Cuenta",
            fecha_eliminacion: new Date().toISOString(),
            motivo: "Solicitud del usuario",
          },
        },
        fecha_modificacion: new Date().toISOString(),
      };

      await logAuditAction("ELIMINAR_CUENTA_CONFIG", detailedDescription);
      closeDeleteDialog();
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!currentPassword || !newPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error("No user logged in");
      }

      const response = await changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });

      if (response.success) {
        setSuccess(response.message);
        const detailedDescription = {
          accion: "EDITAR",
          tabla: "usuarios",
          id_registro: loggedInUserId,
          datos_modificados: {
            estado_anterior: { id_usuario: loggedInUserId },
            estado_nuevo: { id_usuario: loggedInUserId },
            detalles_cambios: {
              tipo_operacion: "Cambio de Contraseña",
              fecha_modificacion: new Date().toISOString(),
              campo_modificado: "password_usuario",
            },
          },
          fecha_modificacion: new Date().toISOString(),
        };

        await logAuditAction("CAMBIAR_CONTRASENA_CONFIG", detailedDescription);
        setTimeout(() => {
          closePasswordDialog();
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setError("Error al cambiar la contraseña");
    }
  };

  const configOptions = [
    {
      title: "Cambiar contraseña",
      description: "Actualiza tu contraseña periódicamente para mantener tu cuenta segura.",
      icon: <LockIcon />,
      action: () => setOpenPasswordDialog(true),
      color: "primary",
    },
    {
      title: "Eliminar cuenta",
      description: "Elimina permanentemente tu cuenta y todos los datos asociados.",
      icon: <DeleteIcon />,
      action: () => setOpenDeleteDialog(true),
      color: "error",
    },
    {
      title: "Preferencias de notificación",
      description: "Configura cómo y cuándo recibes notificaciones del sistema.",
      icon: <SettingsIcon />,
      action: () => {},
      color: "primary",
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "#f8fafc" }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          mt: { xs: 7, sm: 8 },
          width: { sm: `calc(100% - 0px)` },
          overflow: "auto",
        }}
      >
        <Container maxWidth="md" disableGutters={isMobile}>
          <Stack spacing={{ xs: 2, sm: 3 }}>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" } }}
                color="#1e293b"
              >
                Configuración de la cuenta
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
              >
                Gestiona las opciones de tu cuenta y preferencias.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 1, sm: 2, md: 3 },
                borderRadius: { xs: 2, sm: 3 },
                border: "1px solid",
                borderColor: "grey.200",
                bgcolor: "#ffffff",
              }}
            >
              <List disablePadding>
                {configOptions.map((option, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      sx={{
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: { xs: 1.5, sm: 2 },
                        py: { xs: 2, sm: 1.5 },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ width: "100%" }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            minWidth: 40,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor:
                              option.color === "error" ? "#fee2e2" : "#dbeafe",
                            color: option.color === "error" ? "#b91c1c" : "#1d4ed8",
                          }}
                        >
                          {option.icon}
                        </Box>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              color="#1e293b"
                              sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                            >
                              {option.title}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                mt: 0.25,
                              }}
                            >
                              {option.description}
                            </Typography>
                          }
                        />
                      </Stack>
                      <Button
                        variant={option.color === "error" ? "outlined" : "contained"}
                        color={option.color}
                        onClick={option.action}
                        fullWidth={isMobile}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          minWidth: { sm: 140 },
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          ml: { sm: "auto" },
                          ...(option.color !== "error" && {
                            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                            },
                          }),
                        }}
                      >
                        {option.title}
                      </Button>
                    </ListItem>
                    {index < configOptions.length - 1 && (
                      <Divider sx={{ mx: { xs: 1, sm: 2 } }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* Diálogo para eliminar cuenta */}
      <Dialog
        open={openDeleteDialog}
        onClose={closeDeleteDialog}
        fullScreen={isFullScreenDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
          }}
        >
          Confirmar eliminación de cuenta
          {isFullScreenDialog && (
            <IconButton onClick={closeDeleteDialog} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            ¿Estás seguro de que quieres eliminar tu cuenta? Se eliminarán
            permanentemente todos los datos asociados a tu cuenta.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button onClick={closeDeleteDialog} fullWidth={isMobile}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            fullWidth={isMobile}
          >
            Eliminar Cuenta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para cambiar contraseña */}
      <Dialog
        open={openPasswordDialog}
        onClose={closePasswordDialog}
        fullScreen={isFullScreenDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
          }}
        >
          Cambiar contraseña
          {isFullScreenDialog && (
            <IconButton onClick={closePasswordDialog} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <TextField
              autoFocus
              id="current-password"
              label="Contraseña actual"
              type="password"
              fullWidth
              variant="outlined"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              id="new-password"
              label="Nueva contraseña"
              type="password"
              fullWidth
              variant="outlined"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              id="confirm-password"
              label="Confirmar nueva contraseña"
              type="password"
              fullWidth
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button onClick={closePasswordDialog} fullWidth={isMobile}>
            Cancelar
          </Button>
          <Button
            onClick={handleChangePassword}
            color="primary"
            variant="contained"
            fullWidth={isMobile}
            sx={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              },
            }}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Configuracion;
