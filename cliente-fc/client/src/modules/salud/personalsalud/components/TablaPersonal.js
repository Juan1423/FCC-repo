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
import { TableFooter, TablePagination, CircularProgress, Chip, Avatar } from "@mui/material";
import { API_IMAGE_URL } from "../../../../services/apiConfig";
import useImageCache from "../../../../components/global/UseImageCache";
import { StyledTableCell, StyledTableRow, ClickableCell, CenteredAvatar } from '../../../../components/styles/styles';

export default function TablaPersonalSalud({ handleEdit, handleDeletePersonalSalud, filterCriteria, personalsaluds, isLoading }) {
  const getImage = useImageCache();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPersonalSalud = personalsaluds.filter((personalsalud) => {
    const nameMatches = filterCriteria.name
      ? personalsalud.nombres_personal.toLowerCase().includes(filterCriteria.name.toLowerCase()) ||
        personalsalud.apellidos_personal.toLowerCase().includes(filterCriteria.name.toLowerCase()) ||
        personalsalud.dni_personal.toLowerCase().includes(filterCriteria.name.toLowerCase())
      : true;

    return nameMatches;
  });

  const handleDetail = (id) => {
    navigate(`/fcc-personal-salud/${id}`);
  };

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPersonalSalud = filteredPersonalSalud.slice(startIndex, endIndex);

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="table personal salud">
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">Imagen</StyledTableCell>
            <StyledTableCell align="left">Nombres y Apellidos</StyledTableCell>
            <StyledTableCell align="left">DNI</StyledTableCell>
            <StyledTableCell align="center">Título</StyledTableCell>
            <StyledTableCell align="left">Teléfono</StyledTableCell>
            <StyledTableCell align="center">Estado</StyledTableCell>
            <StyledTableCell align="center">Acciones</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} align="center">
              <CircularProgress />
            </TableCell>
          </TableRow>
        ) : (
          paginatedPersonalSalud.map((row) => (
            <StyledTableRow key={row.id_personalsalud}>
              <StyledTableCell>
                <CenteredAvatar>
                  <Avatar 
                    src={row?.foto_personal ? getImage(`${API_IMAGE_URL}${row.foto_personal}`) : undefined} 
                    alt={`${row.nombres_personal} ${row.apellidos_personal}`}
                    sx={{ width: 40, height: 40 }}
                  />
                </CenteredAvatar>
              </StyledTableCell>
              <ClickableCell align="left" onClick={() => handleDetail(row.id_personalsalud)}>
                {row.nombres_personal} {row.apellidos_personal}
              </ClickableCell>
              <StyledTableCell align="left">{row.dni_personal}</StyledTableCell>
              <StyledTableCell align="center">{row.titulos_personal}</StyledTableCell>
              <StyledTableCell align="left">{row.telefono_personal}</StyledTableCell>
              <StyledTableCell align="center">
                <Chip 
                  label={row.estado_personal ? "Activo" : "Inactivo"}
                  color={row.estado_personal ? "success" : "error"}
                  onClick={() => handleDeletePersonalSalud(row.id_personalsalud)}
                  clickable
                  size="small"
                />
              </StyledTableCell>
              <StyledTableCell align="center">
                <IconButton onClick={() => handleEdit(row.id_personalsalud)} color="primary" size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </StyledTableCell>
            </StyledTableRow>
          ))
        )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: 100 }]}
              colSpan={7}
              count={filteredPersonalSalud.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}