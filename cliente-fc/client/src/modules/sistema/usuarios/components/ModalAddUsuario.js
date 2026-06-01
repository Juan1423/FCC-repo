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
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
} from '@mui/material';
import { getPersonalSalud } from '../../../../services/personalsaludServices';
import { logAuditAction } from "../../../../services/auditoriaServices";
import { getCurrentUserId } from "../../../../utils/userUtils";
export default function ModalAddUsuario({ open, onClose, onAddUser, existingUsers }) {
  const [personalSalud, setPersonalSalud] = useState([]);
  const [selectedPersonal, setSelectedPersonal] = useState(null);
  const [tipoPersonal, setTipoPersonal] = useState('salud');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
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

    if (open) {
      fetchData();
    }
  }, [existingUsers, open]);

  useEffect(() => {
    if (!open) {
      setSelectedPersonal(null);
      setTipoPersonal('salud');
      setNombres('');
      setApellidos('');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('personal_salud');
      setError('');
    }
  }, [open]);

  const handleTipoPersonalChange = (event, newTipo) => {
    if (newTipo !== null) {
      setTipoPersonal(newTipo);
      setError('');
      if (newTipo === 'salud') {
        setNombres('');
        setApellidos('');
      } else {
        setSelectedPersonal(null);
        setEmail('');
        if (role === 'personal_salud') {
          setRole('personal_administrativo');
        }
      }
    }
  };

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
    if (tipoPersonal === 'salud' && !selectedPersonal) {
      setError('Por favor, seleccione un personal de salud.');
      return;
    }

    if (tipoPersonal === 'administrativo' && (!nombres.trim() || !apellidos.trim())) {
      setError('Por favor, complete los nombres y apellidos del personal administrativo.');
      return;
    }

    if (!username || !email || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    if (tipoPersonal === 'administrativo' && role === 'personal_salud') {
      setError('Para un personal administrativo, el rol debe ser "Personal Administrativo".');
      return;
    }

    if (tipoPersonal === 'salud' && role === 'personal_administrativo') {
      setError('Para un personal de salud, el rol debe ser "Personal de Salud" o "Administrador".');
      return;
    }

    try {
      const newUser = {
        id_personal_salud: tipoPersonal === 'salud' ? selectedPersonal.id_personalsalud : null,
        nombre_usuario: username,
        apellido_usuario: tipoPersonal === 'salud'
          ? `${selectedPersonal.nombres_personal} ${selectedPersonal.apellidos_personal}`
          : `${nombres.trim()} ${apellidos.trim()}`,
        correo_usuario: email,
        password_usuario: password,
        rol_usuario: role,
        estado_usuario: true,
      };
      await onAddUser(newUser);
      const loggedInUserId = getCurrentUserId();
      if (!loggedInUserId) {
        throw new Error('No user logged in');
      }

      const detailedDescription = {
        accion: "CREAR",
        tabla: 'usuarios',
        id_registro: newUser.id_personal_salud || username,
        datos_modificados: {
          estado_anterior: null,
          estado_nuevo: newUser,
          detalles_usuario: {
            nombre: username,
            email: email,
            rol: role,
            tipo_personal: tipoPersonal,
            personal_salud: tipoPersonal === 'salud' ? selectedPersonal.id_personalsalud : null
          }
        },
        fecha_modificacion: new Date().toISOString()
      };

      await logAuditAction('CREAR_USUARIO', detailedDescription);
      if (document.activeElement && 'blur' in document.activeElement) {
        document.activeElement.blur();
      }
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error al crear el usuario. Por favor, intente nuevamente.');
    }
  };

  const isSaveDisabled = () => {
    if (error) return true;
    if (!username || !email || !password) return true;
    if (tipoPersonal === 'salud') {
      return !selectedPersonal;
    }
    return !nombres.trim() || !apellidos.trim();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Cuenta de Usuario</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tipo de personal
            </Typography>
            <ToggleButtonGroup
              value={tipoPersonal}
              exclusive
              onChange={handleTipoPersonalChange}
              fullWidth
              color="primary"
            >
              <ToggleButton value="salud">Personal de Salud</ToggleButton>
              <ToggleButton value="administrativo">Personal Administrativo</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {tipoPersonal === 'salud' ? (
            <>
              <Grid item xs={12}>
                <Autocomplete
                  options={personalSalud}
                  getOptionLabel={(option) => `${option.nombres_personal} ${option.apellidos_personal}`}
                  isOptionEqualToValue={(option, value) => option.id_personalsalud === value?.id_personalsalud}
                  value={selectedPersonal}
                  onChange={handleSelectPersonal}
                  renderInput={(params) => <TextField {...params} label="Seleccionar Personal de Salud" fullWidth />}
                />
              </Grid>
              {selectedPersonal && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Información del Personal:
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
              )}
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombres"
                  variant="outlined"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  variant="outlined"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                />
              </Grid>
            </>
          )}

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
              label="Correo Electrónico"
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
              label="Contraseña"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="rol-select-label">Rol</InputLabel>
              <Select
                labelId="rol-select-label"
                label="Rol"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="personal_salud">Personal de Salud</MenuItem>
                <MenuItem value="admin">Administrador del Sistema</MenuItem>
                <MenuItem value="personal_administrativo">Personal Administrativo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" disabled={isSaveDisabled()}>
          Crear Usuario
        </Button>
      </DialogActions>
    </Dialog>
  );
}
