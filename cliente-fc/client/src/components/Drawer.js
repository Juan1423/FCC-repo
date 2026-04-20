import React, { useState, useEffect, useMemo, useRef} from 'react';
import {
  Box, Drawer, List, Divider, ListItem, ListItemButton, ListItemIcon,
  ListItemText, IconButton, CircularProgress, Chip, Fade, Skeleton,
  Collapse, useTheme, useMediaQuery
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  Face as FaceIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  MonitorHeart as MonitorHeartIcon,
  MedicalServices as MedicalServicesIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  MenuRounded as MenuRoundedIcon,
  ExpandLess,
  ExpandMore,
  AccountCircle as AccountCircleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Group as GroupIcon,
  MedicalInformation as MedicalInformationIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  School as SchoolIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserInfo } from '../services/authServices';
import { useMenu } from './base/MenuContext';

const DRAWER_WIDTH = 240;
const MINIMIZED_WIDTH = 60;

export default function ResponsiveDrawer({ open, onClose }) {
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showChip, setShowChip] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { setCurrentMenu } = useMenu();
  const [openStates, setOpenStates] = useState({
    medicalHistory: JSON.parse(localStorage.getItem('medicalHistoryOpen') || 'false'),
    adminPanel: JSON.parse(localStorage.getItem('adminPanelOpen') || 'false')
  });
  const [isMinimized, setIsMinimized] = useState(JSON.parse(localStorage.getItem('drawerState') || 'false'));
  const listRef = useRef(null);

  useEffect(() => {
    const checkScroll = () => {
      if (listRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = listRef.current;
        setShowScrollArrow(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = () => {
    if (listRef.current) {
      listRef.current.scrollTop += 100; // Ajusta este valor según sea necesario
    }
  };

  const handleDrawerToggle = () => {
    setIsTransitioning(true);
    setIsMinimized(prev => !prev);
  };

  const handleItemClick = (item) => {
    if (isMinimized) {
      navigate(item === 'medicalHistory' ? '/fcc-historias-clinicas' : '/fcc-usuarios');
    } else {
      setOpenStates(prev => ({ ...prev, [item]: !prev[item] }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [isMinimized]);

  useEffect(() => {
    try {
      const userInfo = getUserInfo();
      setIsAdmin(userInfo?.rol === 'admin');
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('drawerState', JSON.stringify(isMinimized));
    Object.entries(openStates).forEach(([key, value]) => {
      localStorage.setItem(`${key}Open`, JSON.stringify(value));
    });
  }, [isMinimized, openStates]);

  useEffect(() => {
    if (isSmallScreen) {
      setShowChip(true);
      const timer = setTimeout(() => setShowChip(false), 7000);
      return () => clearTimeout(timer);
    } else {
      setShowChip(false);
    }
  }, [location.pathname, isSmallScreen]);

  const menuItems = useMemo(() => [
    { text: 'Menu Principal', path: '/fcc-menu-principal', icon: <HomeIcon /> },
    { text: 'Paciente', path: '/fcc-pacientes', icon: <FaceIcon /> },
    
    { 
      text: 'Historia Clínica', 
      icon: <AssignmentTurnedInIcon />,
      subItems: [
        { text: 'Historia', path: '/fcc-historias-clinicas', icon: <AssignmentIcon /> },
        { text: 'Consulta Médica', path: '/fcc-atencion', icon: <MedicalServicesIcon /> },
        { text: 'Terapias', path: '/fcc-terapias', icon: <MonitorHeartIcon /> },
      ]
    },
    { 
      text: 'Administración', 
      icon: <AdminPanelSettingsIcon />,
      isAdmin: true,
      subItems: [
        { text: 'Usuarios', path: '/fcc-usuarios', icon: <GroupIcon /> },
        { text: 'Personal Salud', path: '/fcc-personal-salud', icon: <MedicalInformationIcon /> },
        { text: 'Auditoría', path: '/fcc-auditoria', icon: <AssignmentTurnedInIcon/>},
        { text: 'Comunidad', path: '/fcc-comunidad', icon: <GroupIcon /> },
        { text: 'Capacitaciones', path: '/fcc-capacitaciones', icon: <SchoolIcon />},
        { text: 'Asistente IA', path: '/fcc-asistente-ia', icon: <SmartToyIcon /> }
      ]
    },
    { text: 'Perfil', path: '/perfil', icon: <AccountCircleIcon /> },
    { text: 'Configuración', path: '/configuracion', icon: <SettingsIcon /> },
  ], []);

  useEffect(() => {
    const currentItem = menuItems.find(item => 
      item.path === location.pathname || 
      item.subItems?.some(subItem => subItem.path === location.pathname)
    );
    
    if (currentItem) {
      setCurrentMenu(currentItem.subItems?.find(subItem => subItem.path === location.pathname)?.text || currentItem.text);
    }
  }, [location, menuItems, setCurrentMenu]);

  const currentPage = menuItems.find(item => 
    item.path === location.pathname || 
    item.subItems?.some(subItem => subItem.path === location.pathname)
  )?.text || 'Página Actual';

  const drawerWidth = isMinimized ? MINIMIZED_WIDTH : DRAWER_WIDTH;

  const renderListItem = (item, index, items) => {
    if (item.isAdmin && !isAdmin) return null;

    const isSelected = location.pathname === item.path || item.subItems?.some(subItem => location.pathname === subItem.path);
    const isLastItem = index === items.length - 1;

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => item.subItems ? handleItemClick(item.text === 'Historia Clínica' ? 'medicalHistory' : 'adminPanel') : onClose()}
            component={item.subItems ? 'div' : Link}
            to={item.path}
            selected={isSelected}
            sx={{
              minHeight: 48,
              justifyContent: isMinimized ? 'center' : 'initial',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isMinimized ? 'auto' : 3,
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isSelected ? theme.palette.primary.main : 'transparent',
                color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
                transition: theme.transitions.create(['background-color', 'color'], {
                  duration: theme.transitions.duration.shortest,
                }),
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                },
              }}
            >
              {item.icon}
            </ListItemIcon>
            <Box
              sx={{
                width: isMinimized ? 0 : 'auto',
                overflow: 'hidden',
                transition: theme.transitions.create('width', {
                  duration: theme.transitions.duration.shortest,
                }),
              }}
            >
              {isTransitioning ? (
                <Skeleton 
                  variant="text"
                  width={150}
                  height={24}
                  sx={{ bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.11)' : 'rgba(255, 255, 255, 0.11)' }}
                />
              ) : (
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    opacity: isMinimized ? 0 : 1,
                    transition: theme.transitions.create('opacity', {
                      duration: theme.transitions.duration.shortest,
                    }),
                    color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                    '& .MuiTypography-root': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              )}
            </Box>
            {!isMinimized && item.subItems && (openStates[item.text === 'Historia Clínica' ? 'medicalHistory' : 'adminPanel'] ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {item.subItems && (
          <Collapse in={openStates[item.text === 'Historia Clínica' ? 'medicalHistory' : 'adminPanel'] && !isMinimized} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem) => renderListItem({...subItem, isSubItem: true}, index, items))}
            </List>
          </Collapse>
        )}
        {(item.text === 'Paciente' || item.text === 'Comunidad' || item.text === 'Historia Clínica' || (item.text === 'Administración' && isAdmin)) && !isLastItem && (
          <Divider sx={{ my: 1 }} />
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      {isSmallScreen && (
        <Fade in={showChip} timeout={1000}>
          <Chip
            label={currentPage}
            size="small"
            sx={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: theme.zIndex.drawer + 1,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
          />
        </Fade>
      )}
<Drawer
        variant={isSmallScreen ? 'temporary' : 'permanent'}
        open={isSmallScreen ? open : true}
        onClose={onClose}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: isSmallScreen ? 0 : 64,
            height: isSmallScreen ? '100%' : 'calc(100% - 64px)',
            transition: theme.transitions.create('width', {
              duration: theme.transitions.duration.shortest,
            }),
            overflowX: 'hidden',
            overflowY: 'hidden', // Ocultar la barra de desplazamiento vertical
          },
        }}
      >
        {!isSmallScreen && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              alignSelf: 'flex-end',
              margin: '8px',
            }}
          >
            {isMinimized ? <MenuRoundedIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }} role="presentation">
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <List 
              ref={listRef}
              sx={{ 
                p: 0, 
                height: '100%', 
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
              onScroll={() => setShowScrollArrow(listRef.current.scrollTop < listRef.current.scrollHeight - listRef.current.clientHeight)}
            >
              {menuItems.map((item, index) => renderListItem(item, index, menuItems))}
            </List>
          )}
          {!isMinimized && showScrollArrow && (
            <IconButton
              onClick={handleScroll}
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <KeyboardArrowDownIcon />
            </IconButton>
          )}
        </Box>
      </Drawer>
    </>
  );
}