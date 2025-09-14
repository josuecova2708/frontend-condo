import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  VpnKey as KeyIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

const RolesPermissions: React.FC = () => {
  // Datos de ejemplo basados en las instrucciones
  const roles = [
    { id: 1, nombre: 'Super Admin', descripcion: 'Acceso completo al sistema', color: 'error' },
    { id: 2, nombre: 'Administrador', descripcion: 'Gestión del condominio', color: 'primary' },
    { id: 3, nombre: 'Residente (Propietario)', descripcion: 'Propietario de unidad', color: 'success' },
    { id: 4, nombre: 'Inquilino', descripcion: 'Residente inquilino', color: 'info' },
    { id: 5, nombre: 'Personal Seguridad', descripcion: 'Personal de seguridad', color: 'warning' },
    { id: 6, nombre: 'Personal Mantenimiento', descripcion: 'Personal de mantenimiento', color: 'secondary' },
    { id: 7, nombre: 'Contador', descripcion: 'Gestión contable', color: 'default' },
  ];

  const modulos = [
    { nombre: 'usuarios', icon: <PersonIcon />, permisos: ['crear', 'leer', 'actualizar', 'eliminar'] },
    { nombre: 'roles', icon: <AdminIcon />, permisos: ['crear', 'leer', 'actualizar', 'eliminar'] },
    { nombre: 'unidades', icon: <SecurityIcon />, permisos: ['crear', 'leer', 'actualizar', 'eliminar'] },
    { nombre: 'configuracion', icon: <SettingsIcon />, permisos: ['crear', 'leer', 'actualizar'] },
    { nombre: 'avisos', icon: <KeyIcon />, permisos: ['crear', 'leer', 'actualizar', 'eliminar'] },
    { nombre: 'perfil', icon: <PersonIcon />, permisos: ['leer', 'actualizar'] },
  ];

  return (
    <Box>
      {/* Encabezado */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <KeyIcon color="primary" />
                Gestión de Roles y Permisos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administra los roles del sistema y sus permisos asociados según la estructura del condominio.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerta informativa */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Sistema de Permisos Granular
        </Typography>
        <Typography variant="body2">
          El sistema cuenta con 7 roles predefinidos y permisos granulares por módulo según las especificaciones del proyecto.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Roles del Sistema */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminIcon color="primary" />
                Roles del Sistema
              </Typography>
              <List>
                {roles.map((rol) => (
                  <ListItem key={rol.id}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {rol.nombre}
                          <Chip
                            label={`ID: ${rol.id}`}
                            size="small"
                            color={rol.color as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={rol.descripcion}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Módulos y Permisos */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                Módulos y Permisos
              </Typography>
              <List>
                {modulos.map((modulo, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {modulo.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={modulo.nombre.toUpperCase()}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                          {modulo.permisos.map((permiso) => (
                            <Chip
                              key={permiso}
                              label={permiso}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Matriz de Permisos (Placeholder) */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon color="primary" />
                Matriz de Roles vs Permisos
              </Typography>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Funcionalidad en Desarrollo
                </Typography>
                <Typography variant="body2">
                  La matriz interactiva para asignar permisos específicos a cada rol estará disponible en la próxima versión.
                  Actualmente los permisos están configurados según la tabla <code>rol_permisos</code> de la base de datos.
                </Typography>
              </Alert>

              <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Configuración actual:</strong> Los permisos están definidos en el backend Django según
                  la relación many-to-many entre las tablas <code>roles</code> y <code>permisos</code> mediante
                  la tabla <code>rol_permisos</code>.
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RolesPermissions;