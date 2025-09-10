import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { User, UserFormData, Role, Condominio } from '../../types';
import { roleService, condominioService, handleApiError } from '../../services/api';

interface UserFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  user: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  open,
  mode,
  user,
  onSubmit,
  onClose,
  loading,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    telefono: '',
    cedula: '',
    fecha_nacimiento: '',
    role: undefined,
    condominio: undefined,
    is_active: true,
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Cargar datos del formulario
  useEffect(() => {
    if (open) {
      loadFormData();
      if (user && mode === 'edit') {
        setFormData({
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          telefono: user.telefono || '',
          cedula: user.cedula || '',
          fecha_nacimiento: user.fecha_nacimiento || '',
          role: user.role?.id,
          condominio: user.condominio?.id,
          is_active: user.is_active,
        });
      } else {
        // Limpiar formulario para nuevo usuario
        setFormData({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          telefono: '',
          cedula: '',
          fecha_nacimiento: '',
          role: undefined,
          condominio: undefined,
          is_active: true,
        });
      }
      setFormErrors({});
      setError(null);
    }
  }, [open, user, mode]);

  // Cargar roles y condominios
  const loadFormData = async () => {
    try {
      setDataLoading(true);
      const [rolesData, condominiosData] = await Promise.all([
        roleService.getRoles(),
        condominioService.getCondominios(),
      ]);
      setRoles(rolesData);
      setCondominios(condominiosData);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setDataLoading(false);
    }
  };

  // Manejar cambios en los campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error del campo
    if (formErrors[name as keyof UserFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Manejar cambios en selects
  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value || undefined,
    }));
    
    // Limpiar error del campo
    if (formErrors[name as keyof UserFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};

    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!formData.first_name.trim()) {
      errors.first_name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'El apellido es requerido';
    }

    if (formData.fecha_nacimiento) {
      const today = new Date();
      const birthDate = new Date(formData.fecha_nacimiento);
      if (birthDate >= today) {
        errors.fecha_nacimiento = 'La fecha de nacimiento debe ser anterior a hoy';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setError(null);
      await onSubmit(formData);
      // El cierre se maneja en el componente padre
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        {mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {dataLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Información básica */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                name="username"
                label="Nombre de Usuario"
                value={formData.username}
                onChange={handleInputChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
                disabled={loading || mode === 'edit'} // No permitir cambiar username en edición
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={loading}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                name="first_name"
                label="Nombre"
                value={formData.first_name}
                onChange={handleInputChange}
                error={!!formErrors.first_name}
                helperText={formErrors.first_name}
                disabled={loading}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                name="last_name"
                label="Apellido"
                value={formData.last_name}
                onChange={handleInputChange}
                error={!!formErrors.last_name}
                helperText={formErrors.last_name}
                disabled={loading}
              />
            </Grid>

            {/* Información adicional */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="telefono"
                label="Teléfono"
                value={formData.telefono}
                onChange={handleInputChange}
                error={!!formErrors.telefono}
                helperText={formErrors.telefono}
                disabled={loading}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="cedula"
                label="Cédula de Identidad"
                value={formData.cedula}
                onChange={handleInputChange}
                error={!!formErrors.cedula}
                helperText={formErrors.cedula}
                disabled={loading}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="fecha_nacimiento"
                label="Fecha de Nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
                error={!!formErrors.fecha_nacimiento}
                helperText={formErrors.fecha_nacimiento}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Rol */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role || ''}
                  onChange={(e) => handleSelectChange('role', e.target.value)}
                  disabled={loading}
                  label="Rol"
                >
                  <MenuItem value="">
                    <em>Seleccionar rol</em>
                  </MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Condominio */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Condominio</InputLabel>
                <Select
                  value={formData.condominio || ''}
                  onChange={(e) => handleSelectChange('condominio', e.target.value)}
                  disabled={loading}
                  label="Condominio"
                >
                  <MenuItem value="">
                    <em>Seleccionar condominio</em>
                  </MenuItem>
                  {condominios.map((condominio) => (
                    <MenuItem key={condominio.id} value={condominio.id}>
                      {condominio.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || dataLoading}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              {mode === 'create' ? 'Creando...' : 'Guardando...'}
            </Box>
          ) : (
            mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;