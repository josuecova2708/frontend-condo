import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    cedula: user?.cedula || '',
    fecha_nacimiento: user?.fecha_nacimiento || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        telefono: user.telefono || '',
        cedula: user.cedula || '',
        fecha_nacimiento: user?.fecha_nacimiento || '',
      });
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileSave = async () => {
    try {
      setError(null);
      // Aquí implementaremos la lógica para actualizar el perfil
      console.log('Actualizando perfil:', profileData);
      setSuccess('Perfil actualizado exitosamente');
      setEditingProfile(false);
    } catch (err: any) {
      setError('Error al actualizar el perfil');
    }
  };

  const handlePasswordChange = async () => {
    try {
      setError(null);
      if (passwordData.new_password !== passwordData.confirm_password) {
        setError('Las contraseñas no coinciden');
        return;
      }
      // Aquí implementaremos la lógica para cambiar la contraseña
      console.log('Cambiando contraseña');
      setSuccess('Contraseña actualizada exitosamente');
      setOpenPasswordDialog(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setError('Error al cambiar la contraseña');
    }
  };

  const handleCancelEdit = () => {
    setEditingProfile(false);
    setProfileData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      cedula: user?.cedula || '',
      fecha_nacimiento: user?.fecha_nacimiento || '',
    });
  };

  return (
    <Box>
      {/* Encabezado */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Gestionar Perfil de Usuario
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administra tu información personal y configuraciones de cuenta.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Contenido principal */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Información Personal" />
            <Tab label="Seguridad" />
            <Tab label="Configuraciones" />
          </Tabs>
        </Box>

        {/* Tab 1: Información Personal */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Información básica */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  src={user?.avatar}
                >
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Avatar>
                <Typography variant="h6">
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role_name || 'Sin rol'}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <br />
                <IconButton color="primary" component="label">
                  <PhotoCameraIcon />
                  <input type="file" hidden accept="image/*" />
                </IconButton>
                <Typography variant="caption" display="block">
                  Cambiar foto
                </Typography>
              </Paper>
            </Grid>

            {/* Formulario de edición */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Información Personal</Typography>
                {!editingProfile ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setEditingProfile(true)}
                  >
                    Editar
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleProfileSave}
                    >
                      Guardar
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Nombres"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    fullWidth
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Apellidos"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    fullWidth
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    fullWidth
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Teléfono"
                    value={profileData.telefono}
                    onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                    fullWidth
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Cédula"
                    value={profileData.cedula}
                    onChange={(e) => setProfileData({ ...profileData, cedula: e.target.value })}
                    fullWidth
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Fecha de Nacimiento"
                    type="date"
                    value={profileData.fecha_nacimiento}
                    onChange={(e) => setProfileData({ ...profileData, fecha_nacimiento: e.target.value })}
                    fullWidth
                    disabled={!editingProfile}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Seguridad */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Cambiar Contraseña
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Mantén tu cuenta segura con una contraseña fuerte.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={() => setOpenPasswordDialog(true)}
                >
                  Cambiar Contraseña
                </Button>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Información de Cuenta
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Usuario:</strong> {user?.username}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Último acceso:</strong> {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cuenta creada:</strong> {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'No disponible'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Estado:</strong>
                    <Chip
                      label={user?.is_active ? 'Activo' : 'Inactivo'}
                      color={user?.is_active ? 'success' : 'error'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Configuraciones */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preferencias
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Las configuraciones de preferencias estarán disponibles en futuras versiones.
            </Typography>
          </Paper>
        </TabPanel>
      </Card>

      {/* Dialog para cambiar contraseña */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Contraseña Actual"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Nueva Contraseña"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirmar Nueva Contraseña"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;