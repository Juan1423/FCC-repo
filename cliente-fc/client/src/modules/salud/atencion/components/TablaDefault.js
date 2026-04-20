import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& .MuiTableCell-head': {
    color: theme.palette.common.white,
    fontWeight: 'bold',
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

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&.Mui-checked': {
    color: theme.palette.primary.dark,
  },
}));

const TablaElegante = ({ data, handleCheckboxChange, isMobile }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const tableChunks = isSmallScreen ? [data] : [data.slice(0, Math.ceil(data.length / 2)), data.slice(Math.ceil(data.length / 2))];

  return (
    <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: 2 }}>
      {tableChunks.map((chunk, index) => (
        <StyledTableContainer key={index} component={Paper}>
          <StyledTable size="small">
            <StyledTableHead>
              <TableRow>
                <TableCell align="center">CP</TableCell>
                <TableCell align="center">SP</TableCell>
                <TableCell>{data[0].hasOwnProperty('region') ? 'Regiones' : 'Órganos'}</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {chunk.map((row) => (
                <StyledTableRow key={row.id}>
                  {['CP', 'SP'].map((type) => (
                    <TableCell key={type} align="center">
                      <StyledCheckbox
                        checked={type === 'CP' ? row.cpChecked : row.spChecked}
                        onChange={() => handleCheckboxChange(row.id, type)}
                        size="small"
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Typography variant="body2">
                      {row.region || row.organ}
                    </Typography>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </StyledTable>
        </StyledTableContainer>
      ))}
    </Box>
  );
};

export default TablaElegante;