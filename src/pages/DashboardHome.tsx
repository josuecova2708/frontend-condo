import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administra usuarios, roles y permisos del sistema',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      status: 'Implementado',
      path: '/dashboard/users',
    },
    {
      title: 'Unidades Habitacionales',
      description: 'Gestiona unidades habitacionales y propietarios',
      icon: <HomeIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      status: 'Implementado',
      path: '/dashboard/units-map',
    },
    {
      title: 'Comunicados',
      description: 'Publica y gestiona avisos y comunicados',
      icon: <NotificationsIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      status: 'Implementado',
      path: '/dashboard/communications',
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema y preferencias',
      icon: <SettingsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      status: 'Implementado',
      path: '/dashboard/system-config',
    },
  ];

  return (
    <Box>
      {/* Bienvenida */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{ width: 60, height: 60, mr: 2 }}
                  src={user?.avatar}
                >
                  {user?.first_name?.[0] || user?.username?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    ¡Bienvenido, {user?.first_name || user?.username}!
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {user?.role_name && (
                      <>
                        <Typography variant="body1" color="text.secondary" component="span">
                          Rol:
                        </Typography>
                        <Chip label={user.role_name} size="small" color="primary" />
                      </>
                    )}
                    {user?.condominio_name && (
                      <>
                        <Typography variant="body1" color="text.secondary" component="span">
                          {user?.role_name ? ' • ' : ''}Condominio: {user.condominio_name}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                Desde aquí puedes acceder a todas las funcionalidades disponibles para gestionar tu condominio.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Funcionalidades disponibles */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
            Funcionalidades Disponibles
          </Typography>
        </Grid>

        {features.map((feature, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: feature.status === 'Implementado' ? 'pointer' : 'default',
                '&:hover': feature.status === 'Implementado' ? {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                } : {},
                opacity: feature.status === 'Implementado' ? 1 : 0.7,
              }}
              onClick={() => {
                if (feature.status === 'Implementado') {
                  window.location.href = feature.path;
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {feature.description}
                </Typography>
                
                <Chip
                  label={feature.status}
                  size="small"
                  color={
                    feature.status === 'Implementado' ? 'success' :
                    feature.status === 'En desarrollo' ? 'warning' : 'default'
                  }
                  variant={feature.status === 'Implementado' ? 'filled' : 'outlined'}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardHome;