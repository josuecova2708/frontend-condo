import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Paper,
  Avatar,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import vehicleService, { Vehicle } from '../../services/vehicleService';
import { userService } from '../../services/api';
import { User } from '../../types';

interface VehicleRegistrationFormProps {
  onVehicleRegistered?: (vehicle: Vehicle) => void;
}

const VehicleRegistrationForm: React.FC<VehicleRegistrationFormProps> = ({ onVehicleRegistered }) => {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    color: '',
    user: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await userService.getUsers(1);
      setUsers(response.results || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase() // Convertir a mayúsculas automáticamente
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase() // Convertir a mayúsculas automáticamente
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.placa.trim()) {
      setError('La placa es obligatoria');
      return;
    }

    if (!formData.user) {
      setError('Debe seleccionar un usuario propietario');
      return;
    }

    // Validar formato de placa boliviana
    const placaFormateada = formData.placa.trim().toUpperCase();
    const formatosValidos = [
      /^\d{4}-[A-Z]{3}$/,  // 1234-ABC
      /^\d{3}-[A-Z]{3}$/,  // 123-ABC
      /^[A-Z]{3}-\d{3}$/,  // ABC-123
    ];

    const esFormatoValido = formatosValidos.some(formato => formato.test(placaFormateada));
    if (!esFormatoValido) {
      setError('Formato de placa inválido. Use formatos: 1234-ABC, 123-ABC o ABC-123');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const vehicleData = {
        user: parseInt(formData.user),
        placa: placaFormateada,
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        color: formData.color.trim(),
        is_active: true,
      };

      console.log('Sending vehicle data:', vehicleData);

      const newVehicle = await vehicleService.createVehicle(vehicleData);

      setSuccess(`Vehículo registrado exitosamente: ${newVehicle.placa}`);
      setFormData({ placa: '', marca: '', modelo: '', color: '', user: '' });

      if (onVehicleRegistered) {
        onVehicleRegistered(newVehicle);
      }
    } catch (err: any) {
      console.error('Error creating vehicle:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);

      if (err.response?.data?.placa) {
        setError(err.response.data.placa[0]);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data) {
        // Mostrar cualquier error específico del backend
        const errorData = err.response.data;
        const firstKey = Object.keys(errorData)[0];
        const firstError = errorData[firstKey];
        if (Array.isArray(firstError)) {
          setError(firstError[0]);
        } else if (typeof firstError === 'string') {
          setError(firstError);
        } else {
          setError(JSON.stringify(errorData));
        }
      } else {
        setError('Error al registrar el vehículo. Intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonColors = [
    'BLANCO', 'NEGRO', 'GRIS', 'PLATA', 'ROJO', 'AZUL',
    'VERDE', 'AMARILLO', 'CAFÉ', 'NARANJA', 'MORADO'
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
              <CarIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
                Registrar Nuevo Vehículo
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Complete la información del vehículo
              </Typography>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Placa - Campo obligatorio */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Placa Vehicular"
                  name="placa"
                  value={formData.placa}
                  onChange={handleInputChange}
                  placeholder="Ej: 1234-ABC"
                  required
                  inputProps={{ maxLength: 20, style: { fontFamily: 'monospace', fontSize: '1.1rem' } }}
                  helperText="Formatos válidos: 1234-ABC, 123-ABC, ABC-123"
                  variant="outlined"
                />
              </Grid>

              {/* Usuario Propietario */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Usuario Propietario</InputLabel>
                  <Select
                    name="user"
                    value={formData.user}
                    onChange={handleSelectChange}
                    label="Usuario Propietario"
                    disabled={loadingUsers}
                  >
                    <MenuItem value="">Seleccionar usuario</MenuItem>
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.id.toString()}>
                        {user.first_name} {user.last_name} - {user.email}
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingUsers && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <CircularProgress size={20} />
                    </Box>
                  )}
                </FormControl>
              </Grid>

              {/* Marca */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Marca"
                  name="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  placeholder="Ej: TOYOTA, NISSAN, HYUNDAI"
                  inputProps={{ maxLength: 100 }}
                  variant="outlined"
                />
              </Grid>

              {/* Modelo */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Modelo"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  placeholder="Ej: COROLLA, SENTRA, ACCENT"
                  inputProps={{ maxLength: 100 }}
                  variant="outlined"
                />
              </Grid>

              {/* Color */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Color</InputLabel>
                  <Select
                    name="color"
                    value={formData.color}
                    onChange={handleSelectChange}
                    label="Color"
                  >
                    <MenuItem value="">Seleccionar color</MenuItem>
                    {commonColors.map(color => (
                      <MenuItem key={color} value={color}>{color}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Mensajes de error y éxito */}
              {error && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {success && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="success">{success}</Alert>
                </Grid>
              )}

              {/* Botones */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{ flex: 1 }}
                  >
                    {isSubmitting ? 'Registrando...' : 'Registrar Vehículo'}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    size="large"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setFormData({ placa: '', marca: '', modelo: '', color: '', user: '' });
                      setError(null);
                      setSuccess(null);
                    }}
                  >
                    Limpiar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Información adicional */}
          <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              ℹ️ Información Importante
            </Typography>
            <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
              <li>La placa debe seguir el formato boliviano estándar</li>
              <li>Todos los campos se guardarán en mayúsculas automáticamente</li>
              <li>Una vez registrado, el vehículo será reconocido por el sistema OCR</li>
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VehicleRegistrationForm;