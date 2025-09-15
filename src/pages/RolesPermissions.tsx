import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Snackbar,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  VpnKey as KeyIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { Role, Permission } from '../types';
import { roleService, permissionService } from '../services/api';

const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<{ [roleId: number]: number[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savingChanges, setSavingChanges] = useState<{ [roleId: number]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar roles y permisos en paralelo
        const [rolesData, permissionsData] = await Promise.all([
          roleService.getRoles(),
          permissionService.getPermissions()
        ]);

        setRoles(rolesData);
        setPermissions(permissionsData);

        // Cargar permisos de cada rol
        const rolePermissionsMap: { [roleId: number]: number[] } = {};

        for (const role of rolesData) {
          try {
            const rolePerms = await roleService.getRolePermissions(role.id);
            rolePermissionsMap[role.id] = rolePerms.map(p => p.id);
          } catch (err) {
            console.error(`Error cargando permisos del rol ${role.nombre}:`, err);
            rolePermissionsMap[role.id] = [];
          }
        }

        setRolePermissions(rolePermissionsMap);

      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para asignar colores a los roles
  const getRoleColor = (roleName: string) => {
    const colorMap: { [key: string]: any } = {
      'Super Admin': 'error',
      'Administrador': 'primary',
      'Residente (Propietario)': 'success',
      'Residente Propietario': 'success',
      'Inquilino': 'info',
      'Personal Seguridad': 'warning',
      'Personal Mantenimiento': 'secondary',
      'Contador': 'default',
    };
    return colorMap[roleName] || 'default';
  };

  // Función para verificar si un rol tiene un permiso específico
  const hasPermission = (roleId: number, permissionId: number): boolean => {
    return rolePermissions[roleId]?.includes(permissionId) || false;
  };

  // Función para manejar el cambio de permisos
  const handlePermissionChange = async (roleId: number, permissionId: number, hasIt: boolean) => {
    try {
      setSavingChanges(prev => ({ ...prev, [roleId]: true }));

      if (hasIt) {
        await roleService.assignPermissionToRole(roleId, permissionId);
      } else {
        await roleService.removePermissionFromRole(roleId, permissionId);
      }

      // Actualizar el estado local
      setRolePermissions(prev => ({
        ...prev,
        [roleId]: hasIt
          ? [...(prev[roleId] || []), permissionId]
          : (prev[roleId] || []).filter(id => id !== permissionId)
      }));

      setSuccessMessage('Permisos actualizados correctamente');

    } catch (err: any) {
      setError(err.message || 'Error al actualizar permisos');
      console.error('Error updating permissions:', err);
    } finally {
      setSavingChanges(prev => ({ ...prev, [roleId]: false }));
    }
  };

  // Agrupar permisos por módulo
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.modulo]) {
      acc[permission.modulo] = [];
    }
    acc[permission.modulo].push(permission);
    return acc;
  }, {} as { [module: string]: Permission[] });

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
          El sistema cuenta con {roles.length > 0 ? `${roles.length} roles` : 'múltiples roles'} y permisos granulares por módulo según las especificaciones del proyecto.
        </Typography>
      </Alert>

      {/* Alerta de error si hay problemas cargando */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Error al cargar los datos
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Roles del Sistema */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminIcon color="primary" />
                Roles del Sistema
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {roles.length > 0 ? (
                    roles.map((rol) => (
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
                                color={getRoleColor(rol.nombre)}
                                variant="outlined"
                              />
                              {rol.permissions_count > 0 && (
                                <Chip
                                  label={`${rol.permissions_count} permisos`}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={rol.descripcion || 'Sin descripción'}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary="No se encontraron roles"
                        secondary="No hay roles disponibles en la base de datos"
                      />
                    </ListItem>
                  )}
                </List>
              )}
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

        {/* Matriz de Permisos Interactiva */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon color="primary" />
                Matriz de Roles vs Permisos
              </Typography>

              <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Gestión Interactiva de Permisos
                </Typography>
                <Typography variant="body2">
                  Haz clic en los checkboxes para asignar o quitar permisos específicos a cada rol.
                  Los cambios se guardan automáticamente.
                </Typography>
              </Alert>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>
                          Permisos / Roles
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ textAlign: 'center' }}>
                                {role.nombre}
                              </Typography>
                              <Chip
                                label={`ID: ${role.id}`}
                                size="small"
                                color={getRoleColor(role.nombre)}
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                        <React.Fragment key={module}>
                          {/* Encabezado del módulo */}
                          <TableRow>
                            <TableCell
                              colSpan={roles.length + 1}
                              sx={{
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                              }}
                            >
                              📁 {module}
                            </TableCell>
                          </TableRow>

                          {/* Permisos del módulo */}
                          {modulePermissions.map((permission) => (
                            <TableRow key={permission.id} hover>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                    {permission.nombre}
                                  </Typography>
                                  {permission.descripcion && (
                                    <Typography variant="caption" color="text.secondary">
                                      {permission.descripcion}
                                    </Typography>
                                  )}
                                  <Chip
                                    label={permission.codigo}
                                    size="small"
                                    variant="outlined"
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              </TableCell>

                              {roles.map((role) => (
                                <TableCell key={role.id} align="center">
                                  <Checkbox
                                    checked={hasPermission(role.id, permission.id)}
                                    onChange={(e) => handlePermissionChange(role.id, permission.id, e.target.checked)}
                                    disabled={savingChanges[role.id]}
                                    color="primary"
                                  />
                                  {savingChanges[role.id] && (
                                    <CircularProgress size={12} sx={{ ml: 1 }} />
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notificaciones */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        message={error}
        sx={{ '& .MuiSnackbarContent-root': { backgroundColor: 'error.main' } }}
      />
    </Box>
  );
};

export default RolesPermissions;