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
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { Propietario, PropietarioFormData, User, UnidadHabitacional } from '../../types';
import { propertyService, handleApiError } from '../../services/api';

interface PropietarioFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  propietario?: Propietario | null;
  onSubmit: (data: PropietarioFormData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const PropietarioForm: React.FC<PropietarioFormProps> = ({
  open,
  mode,
  propietario,
  onSubmit,
  onClose,
  loading = false
}) => {
  const [formData, setFormData] = useState<PropietarioFormData>({
    user: 0,
    unidad: 0,
    porcentaje_propiedad: 100,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    is_active: true,
  });

  const [usuariosSinUnidad, setUsuariosSinUnidad] = useState<User[]>([]);
  const [unidadesDisponibles, setUnidadesDisponibles] = useState<UnidadHabitacional[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Cargar datos necesarios al abrir el formulario
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Cargar datos del propietario en modo edición
  useEffect(() => {
    if (open && mode === 'edit' && propietario) {
      setFormData({
        user: propietario.user,
        unidad: propietario.unidad,
        porcentaje_propiedad: propietario.porcentaje_propiedad,
        fecha_inicio: propietario.fecha_inicio.split('T')[0], // Asegurar formato YYYY-MM-DD
        fecha_fin: propietario.fecha_fin ? propietario.fecha_fin.split('T')[0] : '',
        is_active: propietario.is_active,
      });
    } else if (open && mode === 'create') {
      // Resetear formulario para nuevo
      setFormData({
        user: 0,
        unidad: 0,
        porcentaje_propiedad: 100,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        is_active: true,
      });
    }
    setError(null);
  }, [open, mode, propietario]);

  const loadData = async () => {
    try {
      setLoadingData(true);

      // Cargar en paralelo
      const [usuariosData, unidadesData] = await Promise.all([
        propertyService.getUsuariosSinUnidad(),
        propertyService.getUnidadesDisponibles()
      ]);

      setUsuariosSinUnidad(Array.isArray(usuariosData) ? usuariosData : []);
      setUnidadesDisponibles(Array.isArray(unidadesData) ? unidadesData : []);

    } catch (error) {
      setError('Error al cargar los datos necesarios');
      setUsuariosSinUnidad([]);
      setUnidadesDisponibles([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof PropietarioFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.user) {
      setError('Por favor selecciona un usuario');
      return;
    }

    if (!formData.unidad) {
      setError('Por favor selecciona una unidad');
      return;
    }

    if (formData.porcentaje_propiedad <= 0 || formData.porcentaje_propiedad > 100) {
      setError('El porcentaje de propiedad debe estar entre 1 y 100');
      return;
    }

    if (formData.fecha_fin && formData.fecha_fin <= formData.fecha_inicio) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      // Formatear las fechas para asegurar el formato correcto (YYYY-MM-DD)
      const formattedData = {
        ...formData,
        fecha_inicio: formData.fecha_inicio, // Ya está en formato YYYY-MM-DD del input type="date"
        fecha_fin: formData.fecha_fin || undefined, // Si está vacío, enviamos undefined en lugar de string vacío
      };

      // Eliminar campos vacíos opcionales
      if (!formattedData.fecha_fin) {
        delete formattedData.fecha_fin;
      }

      console.log('Datos a enviar:', formattedData); // Para debug

      await onSubmit(formattedData);
      onClose();
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const getUsuarioDisplay = (usuario: User) => {
    return `${usuario.full_name} (${usuario.email})`;
  };

  const getUnidadDisplay = (unidad: UnidadHabitacional) => {
    return `${unidad.bloque_nombre} - ${unidad.numero} ${unidad.area_m2 ? `(${unidad.area_m2}m²)` : ''}`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Asignar Propietario a Unidad' : 'Editar Asignación de Propietario'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loadingData && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {!loadingData && (
            <Grid container spacing={3}>
              {/* Usuario */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Usuario Propietario</InputLabel>
                  <Select
                    value={formData.user}
                    label="Usuario Propietario"
                    onChange={(e) => handleInputChange('user', e.target.value as number)}
                    disabled={mode === 'edit'} // No permitir cambiar usuario en edición
                  >
                    <MenuItem value={0} disabled>
                      Seleccionar usuario...
                    </MenuItem>
                    {usuariosSinUnidad.map((usuario) => (
                      <MenuItem key={usuario.id} value={usuario.id}>
                        <Box>
                          <Typography variant="body2">
                            {getUsuarioDisplay(usuario)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {usuario.telefono && `Tel: ${usuario.telefono}`}
                            {usuario.cedula && ` | CI: ${usuario.cedula}`}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {mode === 'create' && usuariosSinUnidad.length === 0 && (
                    <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
                      No hay usuarios con rol propietario disponibles
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Unidad */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Unidad Habitacional</InputLabel>
                  <Select
                    value={formData.unidad}
                    label="Unidad Habitacional"
                    onChange={(e) => handleInputChange('unidad', e.target.value as number)}
                  >
                    <MenuItem value={0} disabled>
                      Seleccionar unidad...
                    </MenuItem>
                    {unidadesDisponibles.map((unidad) => (
                      <MenuItem key={unidad.id} value={unidad.id}>
                        <Box>
                          <Typography variant="body2">
                            {getUnidadDisplay(unidad)}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {unidad.num_habitaciones && (
                              <Chip label={`${unidad.num_habitaciones} hab`} size="small" />
                            )}
                            {unidad.num_banos && (
                              <Chip label={`${unidad.num_banos} baños`} size="small" />
                            )}
                            {unidad.tiene_parqueadero && (
                              <Chip label="Parqueadero" size="small" color="success" />
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Porcentaje de propiedad */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Porcentaje de Propiedad (%)"
                  value={formData.porcentaje_propiedad}
                  onChange={(e) => handleInputChange('porcentaje_propiedad', parseFloat(e.target.value))}
                  inputProps={{ min: 1, max: 100, step: 0.01 }}
                  helperText="Máximo 100% por unidad"
                />
              </Grid>

              {/* Fecha de inicio */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Fecha de Inicio"
                  value={formData.fecha_inicio}
                  onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Fecha de fin */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Fin (Opcional)"
                  value={formData.fecha_fin}
                  onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Dejar vacío si no tiene fecha límite"
                />
              </Grid>

              {/* Estado activo */}
              {mode === 'edit' && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      />
                    }
                    label="Activo"
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingData}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading
              ? (mode === 'create' ? 'Asignando...' : 'Guardando...')
              : (mode === 'create' ? 'Asignar Propietario' : 'Guardar Cambios')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PropietarioForm;