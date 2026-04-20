
import  Button  from '@mui/material/Button';
import { styled } from '@mui/material/styles';


const ButtonStyle = styled(Button)({
  boxShadow: 'none',
  color:'#000000',
  textTransform: 'none',
  fontSize: 14,
  padding: '6px 12px',
  border: '1px solid',
  lineHeight: 1.5,
  backgroundColor: '#FFFFFF',
  borderColor: '#6c757d',
  fontFamily: [
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  '&:hover': {
    backgroundColor: '#545b62',
    borderColor: '#6c757d',
    boxShadow: 'none',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
  },
  '&:focus': {
    boxShadow: '0 0 0 0.2rem #6c757d',
  },
});

export default ButtonStyle;