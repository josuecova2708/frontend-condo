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
    text: 'Propiedades',
    icon: <HomeIcon />,
    path: '/dashboard/properties',
  },
  {
    text: 'Comunicados',
    icon: <Notifications />,
    path: '/dashboard/communications',
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

  // Filtrar elementos del menú según el rol del usuario usando useMemo
  const filteredMenuItems = useMemo(() => {
    console.log('Recalculando filteredMenuItems para usuario:', user);

    return menuItems.filter(item => {
      if (!item.roles) return true;
      if (!user) return false;

      // Verificar múltiples fuentes del rol del usuario
      const userRole = user.role_name || user.role?.nombre || '';

      console.log(`Evaluando item "${item.text}" - Roles requeridos:`, item.roles, 'Usuario rol:', userRole);

      // También verificar si es staff para dar acceso de administrador
      const isAdmin = item.roles.includes('Administrador') && (
        userRole === 'Administrador' ||
        userRole === 'Super Admin' ||
        user.is_staff === true
      );

      const hasAccess = item.roles.includes(userRole) || isAdmin;
      console.log(`Item "${item.text}" acceso:`, hasAccess);

      return hasAccess;
    });
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
            {location.pathname === '/dashboard/properties' && 'Propiedades'}
            {location.pathname === '/dashboard/communications' && 'Comunicados'}
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