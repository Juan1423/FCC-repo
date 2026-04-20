import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  TableFooter,
  TablePagination,
  Typography,
  Box,
  CardHeader,
  CardContent,
  CircularProgress,
} from "@mui/material";


//import { getAuditorias } from "../../../services/auditoriaServices";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: "bold",
  },
  "&.MuiTableCell-body": {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const AuditoriasTable = ({ auditorias, loading }) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [itemsPerPage, setItemsPerPage] = React.useState(5);
  const [orderBy, setOrderBy] = React.useState('fecha'); // Default sort by date
  const [order, setOrder] = React.useState('desc'); // Default order direction
  // Add this function at the top of the component
    const formatDate = (dateString) => {
      if (!dateString) return 'Fecha no disponible';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha no disponible';
      
        const ecuadorDate = new Intl.DateTimeFormat('es-EC', {
          timeZone: 'America/Guayaquil',
          year: 'numeric',
          month: 'long',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          weekday: 'long'
        }).format(date);
      
        return ecuadorDate
          .replace(/,/g, '')
          .replace(/\b(\d)\b/g, '0$1');
    } catch (error) {
      console.error('Error al formatear fecha:', error, 'dateString:', dateString);
      return 'Fecha no disponible';
    }
  };
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const sortedAuditorias = React.useMemo(() => {
    const sorted = [...auditorias];
    sorted.sort((a, b) => {
      if (orderBy === 'fecha') {
        return order === 'asc' 
          ? new Date(a.fecha) - new Date(b.fecha)
          : new Date(b.fecha) - new Date(a.fecha);
      }
      if (orderBy === 'id_auditoria') {
        return order === 'asc'
          ? a.id_auditoria - b.id_auditoria
          : b.id_auditoria - a.id_auditoria;
      }
      return 0;
    });
    return sorted;
  }, [auditorias, order, orderBy]);
  
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };
  
  const totalRegistros = auditorias.length;
  const registrosMostrados = Math.min(
    (currentPage + 1) * itemsPerPage,
    totalRegistros
  );
  
  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 3 }}>
      <CardHeader
        title={<Typography variant="h5">Auditorías</Typography>}
        subheader={`Mostrando ${registrosMostrados} de ${totalRegistros} registros`}
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <StyledTableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell 
                    onClick={() => handleRequestSort('fecha')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Fecha {orderBy === 'fecha' && (order === 'asc' ? '↑' : '↓')}
                  </StyledTableCell>
                  <StyledTableCell 
                    onClick={() => handleRequestSort('id_auditoria')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Código {orderBy === 'id_auditoria' && (order === 'asc' ? '↑' : '↓')}
                  </StyledTableCell>
                  <StyledTableCell>Usuario</StyledTableCell>
                  <StyledTableCell>Operación</StyledTableCell>
                  <StyledTableCell>Módulo</StyledTableCell>
                  <StyledTableCell>Detalle</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAuditorias.length === 0 ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={6} align="center">
                      <Typography variant="subtitle1">
                        No hay auditorías disponibles
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ) : (
                  sortedAuditorias
                    .slice(
                      currentPage * itemsPerPage,
                      currentPage * itemsPerPage + itemsPerPage
                    )
                    .map((auditoria) => (
                      // Update the date display in the table row
                      <StyledTableRow key={auditoria.id_auditoria}>
                        <StyledTableCell>
                          {formatDate(auditoria.fecha)}
                        </StyledTableCell>
                        <StyledTableCell>{auditoria.id_auditoria}</StyledTableCell>
                        <StyledTableCell>{auditoria.usuario_auditoria ? `${auditoria.usuario_auditoria.nombre_usuario} ${auditoria.usuario_auditoria.apellido_usuario}` : `Usuario ID: ${auditoria.id_usuario}`}</StyledTableCell>
                        <StyledTableCell>{auditoria.operacion}</StyledTableCell>
                        <StyledTableCell>{auditoria.modulo}</StyledTableCell>
                        <StyledTableCell>
                          {auditoria.detalle}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25, 50, { label: 'All', value: -1 }]}
                      component="div"
                      count={auditorias.length}
                      rowsPerPage={itemsPerPage}
                      page={currentPage}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      labelRowsPerPage="Registros por página:"
                      labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count}`
                      }
                    />
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </StyledTableContainer>
        )}
      </CardContent>
    </Box>
  );
};

export default AuditoriasTable;
