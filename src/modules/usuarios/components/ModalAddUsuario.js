import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Typography,
  Alert,
  Select,
  MenuItem,
} from '@mui/material';
import { getPersonalSalud } from '../../../services/personalsaludServices';
import { logAuditAction } from "../../../services/auditoriaServices";
import { getCurrentUserId } from "../../../utils/userUtils";
export default function ModalAddUsuario({ open, onClose, onAddUser, existingUsers }) {
  const [personalSalud, setPersonalSalud] = useState([]);
  const [selectedPersonal, setSelectedPersonal] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('personal_salud');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personalData = await getPersonalSalud();
        const availablePersonal = personalData.filter(
          person => !existingUsers.some(user => user.id_personal_salud === person.id_personalsalud)
        );
        setPersonalSalud(availablePersonal);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
      }
    };

    fetchData();
  }, [existingUsers]);

  const handleSelectPersonal = (event, value) => {
    setSelectedPersonal(value);
    setError('');
    if (value) {
      setEmail(value.email_personal || '');
    } else {
      setEmail('');
    }
  };

  const handleSave = async () => {
    if (!selectedPersonal) {
      setError('Por favor, seleccione un personal de salud.');
      return;
    }

    if (!username || !email || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    try {
      const newUser = {
        id_personal_salud: selectedPersonal.id_personalsalud,
        nombre_usuario: username,
        apellido_usuario: `${selectedPersonal.nombres_personal} ${selectedPersonal.apellidos_personal}`,
        correo_usuario: email,
        password_usuario: password,
        rol_usuario: role,
        estado_usuario: true,
      };
      await onAddUser(newUser); // Just wait for the operation to complete
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error('No user logged in');
      }

      const detailedDescription = {
        accion: "CREAR",
        tabla: 'usuarios',
        id_registro: newUser.id_personal_salud, // Use the personal_salud ID as reference
        datos_modificados: {
          estado_anterior: null,
          estado_nuevo: newUser,
          detalles_usuario: {
            nombre: username,
            email: email,
            rol: role,
            personal_salud: selectedPersonal.id_personalsalud
          }
        },
        fecha_modificacion: new Date().toISOString()
      };

      await logAuditAction('CREAR_USUARIO', detailedDescription);
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error al crear el usuario. Por favor, intente nuevamente.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Cuenta de Usuario para Personal de Salud</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <Autocomplete
              options={personalSalud}
              getOptionLabel={(option) => `${option.nombres_personal} ${option.apellidos_personal}`}
              value={selectedPersonal}
              onChange={handleSelectPersonal}
              renderInput={(params) => <TextField {...params} label="Seleccionar Personal de Salud" fullWidth />}
            />
          </Grid>
          {selectedPersonal && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Información del Personal:
                </Typography>
                <Typography variant="body2">
                  Nombre: {selectedPersonal.nombres_personal} {selectedPersonal.apellidos_personal}
                </Typography>
                <Typography variant="body2">
                  DNI: {selectedPersonal.dni_personal}
                </Typography>
                <Typography variant="body2">
                  Especialidad: {selectedPersonal.especialidad?.nombre_especialidad || 'No especificada'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de Usuario"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  variant="outlined"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  label="Rol"
                  variant="outlined"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="personal_salud">Personal de Salud</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" disabled={!selectedPersonal || !!error}>
          Crear Usuario
        </Button>
      </DialogActions>
    </Dialog>
  );
}