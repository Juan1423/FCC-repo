import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from '@mui/material/IconButton';
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from 'react-router-dom';
import { TableFooter, TablePagination, CircularProgress, Chip } from "@mui/material";
import { Avatar } from "@mui/material";
import { API_IMAGE_URL } from "../../../../services/apiConfig";
import { StyledTableCell, StyledTableRow, ClickableCell, CenteredAvatar } from '../../../../components/styles/styles';
import useImageCache from "../../../../components/global/UseImageCache";
import Tooltip from '@mui/material/Tooltip';

export default function TablaPaciente({ handleEdit, handleDeletePaciente, filterCriteria, pacientes, loading}) {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const getImage = useImageCache();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPacientes = pacientes.filter((paciente) => {
    const nameMatches = filterCriteria.name
      ? paciente.nombre_paciente.toLowerCase().includes(filterCriteria.name.toLowerCase()) ||
        paciente.apellidos_paciente.toLowerCase().includes(filterCriteria.name.toLowerCase()) ||
        paciente.dni_paciente.toLowerCase().includes(filterCriteria.name.toLowerCase())
      : true;

    return nameMatches;
  });

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPacientes = filteredPacientes.slice(startIndex, endIndex);

  const handleDetail = (id) => {
    navigate(`/fcc-pacientes/${id}`);
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table sx={{ minWidth: 650}} size="small" aria-label="table pacientes">
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">Imagen</StyledTableCell>
            <StyledTableCell align="left">Nombres Completo</StyledTableCell>
            <StyledTableCell align="left">Identificación</StyledTableCell>
            <StyledTableCell align="center">Fecha de Nacimiento</StyledTableCell>
            <StyledTableCell align="left">Representante</StyledTableCell>
            <StyledTableCell align="center">Estado</StyledTableCell>
            <StyledTableCell align="center">Acciones</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {loading ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : (
            paginatedPacientes.map((row) => (
              <StyledTableRow key={row.id_paciente}>
                <StyledTableCell>
                  <CenteredAvatar>
                    <Tooltip title="Foto del paciente">
                      <Avatar 
                        src={row?.foto_paciente ? getImage(`${API_IMAGE_URL}${row.foto_paciente}`) : undefined} 
                        alt={`${row.nombre_paciente} ${row.apellidos_paciente}`}
                        sx={{ width: 40, height: 40 }}
                      />
                    </Tooltip>
                  </CenteredAvatar>
                </StyledTableCell>
                <Tooltip title="Haz clic para ver detalles del paciente">
                  <ClickableCell align="left" onClick={() => handleDetail(row.id_paciente)}>
                    {row.nombre_paciente} {row.apellidos_paciente}
                  </ClickableCell>
                </Tooltip>
                <StyledTableCell align="left">{row.dni_paciente}</StyledTableCell>
                <StyledTableCell align="center">{formatDate(row.fecha_paciente)}</StyledTableCell>
                <StyledTableCell align="left">{row.familiar_cuidador}</StyledTableCell>
                <StyledTableCell align="center">
                  <Tooltip title="Haz clic para cambiar el estado del paciente">
                    <Chip 
                      label={row.estado_paciente ? "Activo" : "Inactivo"}
                      color={row.estado_paciente ? "success" : "error"}
                      onClick={() => handleDeletePaciente(row.id_paciente)}
                      clickable
                      size="small"
                    />
                  </Tooltip>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Tooltip title="Editar información del paciente">
                    <IconButton onClick={() => handleEdit(row.id_paciente)} color="primary" size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <Tooltip title="Controla cuántos pacientes se muestran por página">
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: 100 }]}
                colSpan={7}
                count={filteredPacientes.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Tooltip>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}