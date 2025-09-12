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
  Switch,
  FormControlLabel,
  Typography,
  Paper,
} from '@mui/material';
import { AvisoFormData, Condominio } from '../../types';
import { condominioService, handleApiError } from '../../services/api';

interface AvisoFormProps {
  open: boolean;
  onSubmit: (data: AvisoFormData) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

const AvisoForm: React.FC<AvisoFormProps> = ({
  open,
  onSubmit,
  onClose,
  loading,
}) => {
  const [formData, setFormData] = useState<AvisoFormData>({
    titulo: '',
    contenido: '',
    tipo: 'aviso',
    prioridad: 'media',
    condominio: 0,
    fecha_publicacion: '',
    fecha_expiracion: '',
    is_active: true,
    is_published: false,
  });

  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [formErrors, setFormErrors] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Opciones para los selects
  const tipoOptions = [
    { value: 'aviso', label: 'Aviso' },
    { value: 'comunicado', label: 'Comunicado' },
    { value: 'noticia', label: 'Noticia' },
    { value: 'urgente', label: 'Urgente' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
  ];

  const prioridadOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' },
  ];

  // Cargar condominios al abrir el formulario
  useEffect(() => {
    if (open) {
      loadCondominios();
      resetForm();
    }
  }, [open]);

  // Cargar condominios
  const loadCondominios = async () => {
    try {
      setDataLoading(true);
      const condominiosData = await condominioService.getCondominios();
      setCondominios(condominiosData || []);
      
      // Si hay condominios, seleccionar el primero por defecto
      if (condominiosData && condominiosData.length > 0) {
        setFormData(prev => ({ ...prev, condominio: condominiosData[0].id }));
      }
    } catch (error: any) {
      setError('Error cargando condominios: ' + handleApiError(error));
    } finally {
      setDataLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    const now = new Date();
    const isoString = now.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:MM
    
    setFormData({
      titulo: '',
      contenido: '',
      tipo: 'aviso',
      prioridad: 'media',
      condominio: 0,
      fecha_publicacion: isoString,
      fecha_expiracion: '',
      is_active: true,
      is_published: false,
    });
    setFormErrors({});
    setError(null);
  };

  // Manejar cambios en los campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error del campo
    if (formErrors[name as keyof AvisoFormData]) {
      setFormErrors((prev: any) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Manejar cambios en selects
  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error del campo
    if (formErrors[name as keyof AvisoFormData]) {
      setFormErrors((prev: any) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Manejar cambios en switches
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: any = {};

    if (!formData.titulo.trim()) {
      errors.titulo = 'El título es requerido';
    }

    if (!formData.contenido.trim()) {
      errors.contenido = 'El contenido es requerido';
    }

    if (!formData.condominio) {
      errors.condominio = 'Debe seleccionar un condominio';
    }

    if (!formData.fecha_publicacion) {
      errors.fecha_publicacion = 'La fecha de publicación es requerida';
    }

    if (formData.fecha_expiracion && formData.fecha_publicacion) {
      const fechaPublicacion = new Date(formData.fecha_publicacion);
      const fechaExpiracion = new Date(formData.fecha_expiracion);
      if (fechaExpiracion <= fechaPublicacion) {
        errors.fecha_expiracion = 'La fecha de expiración debe ser posterior a la publicación';
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
    } catch (error: any) {
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
        Crear Nuevo Aviso/Comunicado
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
            {/* Título */}
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                name="titulo"
                label="Título"
                value={formData.titulo}
                onChange={handleInputChange}
                error={!!formErrors.titulo}
                helperText={formErrors.titulo}
                disabled={loading}
              />
            </Grid>

            {/* Contenido */}
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                name="contenido"
                label="Contenido"
                value={formData.contenido}
                onChange={handleInputChange}
                error={!!formErrors.contenido}
                helperText={formErrors.contenido}
                disabled={loading}
              />
            </Grid>

            {/* Tipo y Prioridad */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  onChange={(e) => handleSelectChange('tipo', e.target.value)}
                  disabled={loading}
                  label="Tipo"
                >
                  {tipoOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.prioridad}
                  onChange={(e) => handleSelectChange('prioridad', e.target.value)}
                  disabled={loading}
                  label="Prioridad"
                >
                  {prioridadOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
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
                  error={!!formErrors.condominio}
                >
                  {condominios.map((condominio) => (
                    <MenuItem key={condominio.id} value={condominio.id}>
                      {condominio.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fechas */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                name="fecha_publicacion"
                label="Fecha de Publicación"
                type="datetime-local"
                value={formData.fecha_publicacion}
                onChange={handleInputChange}
                error={!!formErrors.fecha_publicacion}
                helperText={formErrors.fecha_publicacion}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="fecha_expiracion"
                label="Fecha de Expiración (opcional)"
                type="datetime-local"
                value={formData.fecha_expiracion}
                onChange={handleInputChange}
                error={!!formErrors.fecha_expiracion}
                helperText={formErrors.fecha_expiracion}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Configuración */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Configuración
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active || false}
                        onChange={(e) => handleSwitchChange('is_active', e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label="Activo"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_published || false}
                        onChange={(e) => handleSwitchChange('is_published', e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label="Publicar inmediatamente"
                  />
                </Box>
              </Paper>
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
              Creando...
            </Box>
          ) : (
            'Crear Aviso'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvisoForm;