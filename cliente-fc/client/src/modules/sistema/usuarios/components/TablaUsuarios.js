import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TableSortLabel, TableFooter, TablePagination, IconButton, Chip, 
  Avatar, Typography, Select, MenuItem, TextField, styled
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { API_IMAGE_URL } from '../../../../services/apiConfig';
import useImageCache from '../../../../components/global/UseImageCache';
import { getPersonalSaludSimpleId } from '../../../../services/personalsaludServices';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
  marginRight: theme.spacing(1),
}));

const StatusChip = styled(Chip)(({ theme, isactive }) => ({
  backgroundColor: isactive === 'true' ? theme.palette.success.main : theme.palette.error.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: isactive === 'true' ? theme.palette.success.dark : theme.palette.error.dark,
  },
}));

const isUserActive = (status) => {
  if (status === undefined) return false;
  return status === true || status === "true";
};

const TablaUsuario = ({
  users,
  searchTerm,
  sortColumn,
  sortDirection,
  currentPage,
  itemsPerPage,
  handleSort,
  handleEdit,
  handleDelete,
  handlePageChange,
  handleItemsPerPageChange,
  handleActivate
}) => {
  const [editingUser, setEditingUser] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [personalData, setPersonalData] = useState({});
  const getImage = useImageCache();

  useEffect(() => {
    const fetchPersonalData = async () => {
      const personalDataMap = {};
      for (const user of users) {
        if (user.id_personal_salud) {
          try {
            const personal = await getPersonalSaludSimpleId(user.id_personal_salud);
            personalDataMap[user.id_usuario] = personal;
          } catch (error) {
            console.error('Error fetching personal data:', error);
          }
        }
      }
      setPersonalData(personalDataMap);
    };

    fetchPersonalData();
  }, [users]);

  const filteredUsers = users.filter(
    (user) =>
      user.nombre_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.rol_usuario?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = filteredUsers.sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getInitials = (name, lastName) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleEditClick = (user) => {
    setEditingUser(user.id_usuario);
    setEditedValues({ ...user });
  };

  const handleSaveClick = () => {
    handleEdit(editedValues);
    setEditingUser(null);
  };

  const handleCancelClick = () => {
    setEditingUser(null);
    setEditedValues({});
  };

  const handleInputChange = (e, field) => {
    setEditedValues({ ...editedValues, [field]: e.target.value });
  };

  return (
    <StyledTableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="table personal salud">
        <TableHead>
          <TableRow>
            <StyledTableCell>Usuario</StyledTableCell>
            <StyledTableCell>
              <TableSortLabel
                active={sortColumn === 'correo_usuario'}
                direction={sortColumn === 'correo_usuario' ? sortDirection : 'asc'}
                onClick={() => handleSort('correo_usuario')}
              >
                Correo electrónico
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell>
              <TableSortLabel
                active={sortColumn === 'rol_usuario'}
                direction={sortColumn === 'rol_usuario' ? sortDirection : 'asc'}
                onClick={() => handleSort('rol_usuario')}
              >
                Rol
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="center">Estado</StyledTableCell>
            <StyledTableCell align="center">Acciones</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedUsers.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={5} align="center">
                <Typography variant="subtitle1">No hay usuarios disponibles</Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            sortedUsers
              .slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage)
              .map((user) => (
                <StyledTableRow key={user.id_usuario}>
                  <StyledTableCell>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserAvatar 
                        src={personalData[user.id_usuario]?.foto_personal ? getImage(`${API_IMAGE_URL}${personalData[user.id_usuario].foto_personal}`) : undefined}
                        alt={`${user.nombre_usuario} ${user.apellido_usuario}`}
                      >
                        {!personalData[user.id_usuario]?.foto_personal && getInitials(user.nombre_usuario, user.apellido_usuario)}
                      </UserAvatar>
                      <div>
                        {editingUser === user.id_usuario ? (
                          <TextField
                            value={editedValues.nombre_usuario}
                            onChange={(e) => handleInputChange(e, 'nombre_usuario')}
                          />
                        ) : (
                          <Typography variant="subtitle2">{`${user.nombre_usuario} ${user.apellido_usuario}`}</Typography>
                        )}
                      </div>
                    </div>
                  </StyledTableCell>
                  <StyledTableCell>
                    {editingUser === user.id_usuario ? (
                      <TextField
                        value={editedValues.correo_usuario}
                        onChange={(e) => handleInputChange(e, 'correo_usuario')}
                      />
                    ) : (
                      user.correo_usuario
                    )}
                  </StyledTableCell>
                  <StyledTableCell>
                    {editingUser === user.id_usuario ? (
                      <Select
                        value={editedValues.rol_usuario}
                        onChange={(e) => handleInputChange(e, 'rol_usuario')}
                      >
                        <MenuItem value="personal_salud">PersonalSalud</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    ) : (
                      user.rol_usuario === 'personal_salud' ? 'PersonalSalud' : 'Admin'
                    )}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                  <StatusChip
                      label={isUserActive(user.estado_usuario) ? 'Activo' : 'Inactivo'}
                      isactive={isUserActive(user.estado_usuario).toString()}
                      onClick={() => handleActivate(user)}
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {editingUser === user.id_usuario ? (
                      <>
                        <IconButton onClick={handleSaveClick} color="primary" size="small">
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleCancelClick} color="error" size="small">
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => handleEditClick(user)} color="primary" size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(user)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={itemsPerPage}
                page={currentPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleItemsPerPageChange}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </StyledTableContainer>
  );
};

export default TablaUsuario;