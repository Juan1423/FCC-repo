import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Skeleton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import logo from "../assets/img/logo-fcc.png";
import { logout, getAuthToken, decodeToken, getUserInfo } from '../services/authServices';
import { getUsuario } from '../services/usuarioServices';
import { useMenu } from './base/MenuContext';
import { getPersonalSaludId } from '../services/personalsaludServices';
import { API_IMAGE_URL } from '../services/apiConfig';
import useImageCache from './global/UseImageCache';
import { logAuditAction } from '../services/auditoriaServices';




const userMenuItems = [
  { label: 'Perfil', action: 'profile', icon: <AccountCircleIcon /> },
  { label: 'Configuración', action: 'settings', icon: <SettingsIcon /> },
  { label: 'Cerrar Sesión', action: 'logout', icon: <ExitToAppIcon /> },
];

function NavbarAdmin({ onDrawerToggle }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [personalData, setPersonalData] = useState(null);
  const [userData, setUserData] = useState(null);
  const { currentMenu } = useMenu();
  const [isLoading, setIsLoading] = useState(true);
  const getImage = useImageCache();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const token = getAuthToken();
      const decodedToken = token ? decodeToken(token) : null;
      const userId = decodedToken?.user || getUserInfo()?.user;
      if (userId) {
        try {
          const user = await getUsuario(userId);
          setUserData(user);
          const personal = await getPersonalSaludId(user.id_personal_salud);
          setPersonalData(personal);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleMenuItemClick = async (action) => {
    handleCloseUserMenu();
    switch (action) {
      case 'logout':
        try {
          await logAuditAction('CERRAR_SESION', { 
            motivo: 'El usuario hizo clic en el botón de cerrar sesión.' 
          });

          logout();
          navigate('/');
        } catch (error) {
          console.error('Error logging out:', error);
        }
        break;
      case 'profile':
        navigate('/perfil');
        break;
      case 'settings':
        navigate('/configuracion');
        break;
      default:
        break;
    }
  };

  // Add window close handler
  useEffect(() => {
    const handleWindowClose = async (event) => {
      if (userData) {
        try {
          await logAuditAction('CERRAR_SESION', { 
            motivo: 'El usuario cerró la pestaña o el navegador.' 
          });
        } catch (error) {
          console.error('Error creating logout audit:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleWindowClose);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
    };
  }, [userData]);

  return (
    <AppBar position="fixed" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <img src={logo} className='logo-navbar' style={{ marginRight: '10px', height: isMobile ? '3rem' : '4rem' }} alt='logo' />
            {!isMobile && (
              isLoading ? (
                <Skeleton variant="text" width={200} height={32} />
              ) : (
                <Typography variant="h6" color="inherit" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {currentMenu}
                </Typography>
              )
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={handleOpenNotifications}>
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Tooltip title="Opciones de usuario">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                <Avatar alt={userData?.nombre_usuario || 'Usuario'} src={personalData?.foto_personal ? getImage(`${API_IMAGE_URL}${personalData.foto_personal}`) : undefined} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>

      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar alt={userData?.nombre_usuario || 'Usuario'} src={personalData?.foto_personal ? getImage(`${API_IMAGE_URL}${personalData.foto_personal}`) : undefined} />
            <Box sx={{pl:1}}>
              <Typography variant="subtitle1">{ `${userData?.nombre_usuario} ${userData?.apellido_usuario}`  || 'Cargando...'}</Typography>
              <Typography variant="body2" color="text.secondary">{userData?.correo_usuario || 'Cargando...'}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          {userMenuItems.map((item) => (
            <MenuItem key={item.action} onClick={() => handleMenuItemClick(item.action)} sx={{ py: 1 }}>
              {item.icon}
              <Typography sx={{ ml: 2 }}>{item.label}</Typography>
            </MenuItem>
          ))}
        </Box>
      </Menu>

      <Popover
        open={Boolean(anchorElNotifications)}
        anchorEl={anchorElNotifications}
        onClose={handleCloseNotifications}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List sx={{ width: 300 }}>
          <ListItem>
            <Typography variant="h6">Notificaciones</Typography>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Nueva cita programada" secondary="Hace 5 minutos" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Actualización de historia clínica" secondary="Hace 1 hora" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Mensaje del Dr. García" secondary="Hace 2 horas" />
          </ListItem>
          <ListItem>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              Ver todas las notificaciones
            </Typography>
          </ListItem>
        </List>
      </Popover>
    </AppBar>
  );
}

export default NavbarAdmin;