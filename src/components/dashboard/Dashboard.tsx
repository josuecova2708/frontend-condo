import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountCircle,
  Logout,
  Settings,
  Home as HomeIcon,
  Notifications,
  Security as SecurityIcon,
  ExpandLess,
  ExpandMore,
  VpnKey as VpnKeyIcon,
  Map as MapIcon,
  AdminPanelSettings as AdminIcon,
  Tune as TuneIcon,
  Person as PersonIcon,
  AttachMoney as FinanceIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Pool as PoolIcon,
  EventAvailable as EventIcon,
  Build as MaintenanceIcon,
  QrCode as QrCodeIcon,
  Assessment as ReportIcon,
  SmartToy as AIIcon,
  DirectionsCar as CarIcon,
  FaceRetouchingNatural as FaceRecognitionIcon,
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface MenuItemType {
  text: string;
  icon: React.ReactElement;
  path?: string;
  roles?: string[];
  children?: MenuItemType[];
}

const menuItems: MenuItemType[] = [
  {
    text: 'Inicio',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    text: 'Gestión Acceso',
    icon: <SecurityIcon />,
    roles: ['Administrador'],
    children: [
      {
        text: 'Gestionar Usuarios',
        icon: <PeopleIcon />,
        path: '/dashboard/users',
      },
      {
        text: 'Gestionar Roles y Permisos',
        icon: <VpnKeyIcon />,
        path: '/dashboard/roles-permissions',
      },
      {
        text: 'Gestionar Unidades Habitacionales',
        icon: <MapIcon />,
        path: '/dashboard/units-map',
      },
    ],
  },
  {
    text: 'Gestión Administración Básica',
    icon: <AdminIcon />,
    children: [
      {
        text: 'Gestionar Configuración del Sistema',
        icon: <TuneIcon />,
        path: '/dashboard/system-config',
        roles: ['Administrador'],
      },
      {
        text: 'Comunicados',
        icon: <Notifications />,
        path: '/dashboard/communications',
      },
      {
        text: 'Gestionar Perfil de Usuario',
        icon: <PersonIcon />,
        path: '/dashboard/user-profile',
      },
    ],
  },
  {
    text: 'Gestión Financiera',
    icon: <FinanceIcon />,
    roles: ['Administrador'],
    children: [
      {
        text: 'Infracciones',
        icon: <WarningIcon />,
        path: '/dashboard/infracciones',
      },
      {
        text: 'Cargos',
        icon: <ReceiptIcon />,
        path: '/dashboard/cargos',
      },
      {
        text: 'Configuración',
        icon: <SettingsIcon />,
        path: '/dashboard/finances',
      },
    ],
  },
  {
    text: 'Gestión Áreas Comunes y Mantenimiento',
    icon: <PoolIcon />,
    roles: ['Administrador'],
    children: [
      {
        text: 'Configurar Disponibilidad de Instalaciones',
        icon: <EventIcon />,
        path: '/dashboard/areas-comunes',
      },
      {
        text: 'Gestionar Reservas',
        icon: <EventIcon />,
        path: '/dashboard/areas-comunes?tab=reservas',
      },
      {
        text: 'Generar Reportes de uso de Instalaciones',
        icon: <ReportIcon />,
        path: '/dashboard/reportes-instalaciones',
      },
      {
        text: 'Solicitudes de Mantenimiento',
        icon: <MaintenanceIcon />,
        path: '/dashboard/mantenimiento',
      },
    ],
  },
  {
    text: 'Gestión de Seguridad con IA',
    icon: <AIIcon />,
    roles: ['Administrador'],
    children: [
      {
        text: 'OCR de Placas Vehiculares',
        icon: <CarIcon />,
        path: '/dashboard/vehicle-ocr',
      },
      {
        text: 'Reconocimiento Facial',
        icon: <FaceRecognitionIcon />,
        path: '/dashboard/facial-recognition',
      },
    ],
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

  // Efecto para depurar el rol del usuario y forzar re-renderizado
  useEffect(() => {
    if (user) {
      console.log('Dashboard - Usuario actualizado:', {
        username: user.username,
        role_name: user.role_name,
        role: user.role,
        is_staff: user.is_staff
      });
    } else {
      console.log('Dashboard - No hay usuario');
    }
  }, [user]);

  // Efecto para asegurar que se ejecute cuando el componente se monte
  useEffect(() => {
    console.log('Dashboard montado');
  }, []);

  // Manejar apertura/cierre del drawer móvil
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Manejar menú de usuario
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Manejar logout
  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login');
  };

  // Manejar apertura/cierre de submenús
  const handleSubmenuToggle = (itemText: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [itemText]: !prev[itemText]
    }));
  };

  // Función para verificar si el usuario tiene acceso a un item
  const hasItemAccess = (item: MenuItemType): boolean => {
    if (!item.roles) return true;
    if (!user) return false;

    const userRole = user.role_name || user.role?.nombre || '';
    const isAdmin = item.roles.includes('Administrador') && (
      userRole === 'Administrador' ||
      userRole === 'Super Admin' ||
      user.is_staff === true
    );

    return item.roles.includes(userRole) || isAdmin;
  };

  // Filtrar elementos del menú según el rol del usuario usando useMemo
  const filteredMenuItems = useMemo(() => {
    console.log('Recalculando filteredMenuItems para usuario:', user);

    return menuItems.map(item => {
      // Si el item tiene roles específicos y el usuario no tiene acceso, no mostrarlo
      if (item.roles && !hasItemAccess(item)) {
        return null;
      }

      // Si el item tiene hijos, filtrar los hijos también
      if (item.children) {
        const filteredChildren = item.children.filter(child => hasItemAccess(child));

        // Si no hay hijos visibles, no mostrar el item padre
        if (filteredChildren.length === 0) {
          return null;
        }

        return {
          ...item,
          children: filteredChildren
        };
      }

      return item;
    }).filter(Boolean) as MenuItemType[];
  }, [user]); // Dependencia en user para que se recalcule cuando cambie

  // Contenido del drawer
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Smart Condo
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                selected={item.path ? location.pathname === item.path : false}
                onClick={() => {
                  if (item.children) {
                    handleSubmenuToggle(item.text);
                  } else if (item.path) {
                    navigate(item.path);
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                  '&:focus': {
                    backgroundColor: 'transparent',
                  },
                  '&:focus-visible': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.path && location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ color: item.path && location.pathname === item.path ? 'primary.main' : 'inherit' }}
                />
                {item.children && (
                  openSubmenus[item.text] ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>

            {/* Submenú colapsable */}
            {item.children && (
              <Collapse in={openSubmenus[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.text} disablePadding>
                      <ListItemButton
                        selected={child.path ? location.pathname === child.path : false}
                        onClick={() => {
                          if (child.path) {
                            navigate(child.path);
                            setMobileOpen(false);
                          }
                        }}
                        sx={{
                          pl: 4,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                            },
                          },
                          '&:focus': {
                            backgroundColor: 'transparent',
                          },
                          '&:focus-visible': {
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: child.path && location.pathname === child.path ? 'primary.main' : 'inherit' }}>
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={child.text}
                          sx={{ color: child.path && location.pathname === child.path ? 'primary.main' : 'inherit' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/dashboard' && 'Dashboard'}
            {location.pathname === '/dashboard/users' && 'Gestión de Usuarios'}
            {location.pathname === '/dashboard/roles-permissions' && 'Gestión de Roles y Permisos'}
            {location.pathname === '/dashboard/units-map' && 'Gestionar Unidades Habitacionales'}
            {location.pathname === '/dashboard/communications' && 'Comunicados'}
            {location.pathname === '/dashboard/system-config' && 'Gestionar Configuración del Sistema'}
            {location.pathname === '/dashboard/user-profile' && 'Gestionar Perfil de Usuario'}
            {location.pathname === '/dashboard/finances' && 'Configuración Financiera'}
            {location.pathname === '/dashboard/infracciones' && 'Gestión de Infracciones'}
            {location.pathname === '/dashboard/cargos' && 'Gestión de Cargos'}
            {location.pathname === '/dashboard/areas-comunes' && 'Gestión de Áreas Comunes y Reservas'}
            {location.pathname === '/dashboard/reportes-financieros' && 'Generar Reportes Financieros'}
            {location.pathname === '/dashboard/control-acceso-qr' && 'Control de Acceso con QR'}
            {location.pathname === '/dashboard/mantenimiento' && 'Solicitudes de Mantenimiento'}
            {location.pathname === '/dashboard/vehicle-ocr' && 'OCR de Placas Vehiculares'}
          </Typography>

          {/* Información del usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user?.role_name && (
              <Chip
                label={user.role_name}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.full_name || user?.username}
              </Typography>
              
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar
                  sx={{ width: 32, height: 32 }}
                  src={user?.avatar}
                >
                  {user?.first_name?.[0] || user?.username?.[0]}
                </Avatar>
              </IconButton>
            </Box>
          </Box>

          {/* Menú de usuario */}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Perfil
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Configuración
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Drawer móvil */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Drawer permanente */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;