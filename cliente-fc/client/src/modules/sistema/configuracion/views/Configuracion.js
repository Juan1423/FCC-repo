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
} from "@mui/material";
import {
  LockOutlined as LockIcon,
  DeleteOutline as DeleteIcon,
  SettingsOutlined as SettingsIcon,
} from "@mui/icons-material";
import Drawer from "../../../../components/Drawer";
import NavbarAdmin from "../../../../components/NavbarAdmin";
import { logAuditAction } from "../../../../services/auditoriaServices";
import { getCurrentUserId } from "../../../../utils/userUtils";
import { changePassword } from "../../../../services/authServices";

const Configuracion = () => {
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

  const handleDeleteAccount = async () => {
    try {
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error("No user logged in");
      }

      // Implementar lógica para eliminar cuenta
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
      setOpenDeleteDialog(false);
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
          setOpenPasswordDialog(false);
          setSuccess("");
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
      icon: <LockIcon />,
      action: () => setOpenPasswordDialog(true),
    },
    {
      title: "Eliminar cuenta",
      icon: <DeleteIcon />,
      action: () => setOpenDeleteDialog(true),
      color: "error",
    },
    {
      title: "Preferencias de notificación",
      icon: <SettingsIcon />,
      action: () => {/* Implementar lógica para preferencias de notificación */},
    },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, overflow: "auto" }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h4" component="h1" fontWeight="bold" mb={3}>
              Configuración de la cuenta
            </Typography>
            <List>
              {configOptions.map((option, index) => (
                <ListItem key={index} divider={index !== configOptions.length - 1}>
                  <ListItemIcon>{option.icon}</ListItemIcon>
                  <ListItemText primary={option.title} />
                  {option.switch ? (
                    <Switch
                      edge="end"
                      onChange={option.action}
                    />
                  ) : (
                    <Button
                      variant="outlined"
                      color={option.color || "primary"}
                      onClick={option.action}
                    >
                      {option.title}
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>
      </Box>

      {/* Diálogo para eliminar cuenta */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar eliminación de cuenta</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteAccount} color="error">
            Eliminar Cuenta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para cambiar contraseña */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Cambiar contraseña</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            id="current-password"
            label="Contraseña actual"
            type="password"
            fullWidth
            variant="outlined"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            id="new-password"
            label="Nueva contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            id="confirm-password"
            label="Confirmar nueva contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancelar</Button>
          <Button onClick={handleChangePassword} color="primary">
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Configuracion;
