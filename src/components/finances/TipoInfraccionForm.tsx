import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Switch,
  FormControlLabel,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { TipoInfraccion, TipoInfraccionFormData } from '../../types';
import { financeService, handleApiError } from '../../services/api';

interface TipoInfraccionFormProps {
  open: boolean;
  onClose: () => void;
  tipoInfraccion?: TipoInfraccion | null;
  onSuccess: () => void;
}

const TipoInfraccionForm: React.FC<TipoInfraccionFormProps> = ({
  open,
  onClose,
  tipoInfraccion,
  onSuccess
}) => {
  const [formData, setFormData] = useState<TipoInfraccionFormData>({
    codigo: '',
    nombre: '',
    descripcion: '',
    monto_base: 0,
    monto_reincidencia: 0,
    dias_para_pago: 15,
    es_activo: true,
    orden: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tipoInfraccion) {
      setFormData({
        codigo: tipoInfraccion.codigo,
        nombre: tipoInfraccion.nombre,
        descripcion: tipoInfraccion.descripcion || '',
        monto_base: tipoInfraccion.monto_base,
        monto_reincidencia: tipoInfraccion.monto_reincidencia,
        dias_para_pago: tipoInfraccion.dias_para_pago,
        es_activo: tipoInfraccion.es_activo,
        orden: tipoInfraccion.orden,
      });
    } else {
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        monto_base: 0,
        monto_reincidencia: 0,
        dias_para_pago: 15,
        es_activo: true,
        orden: 0,
      });
    }
    setError(null);
  }, [tipoInfraccion, open]);

  const handleChange = (field: keyof TipoInfraccionFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked :
                  event.target.type === 'number' ? Number(event.target.value) :
                  event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.codigo.trim()) {
      setError('El código es obligatorio');
      return false;
    }
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (formData.monto_base <= 0) {
      setError('El monto base debe ser mayor a 0');
      return false;
    }
    if (formData.monto_reincidencia <= 0) {
      setError('El monto de reincidencia debe ser mayor a 0');
      return false;
    }
    if (formData.monto_reincidencia < formData.monto_base) {
      setError('El monto de reincidencia debe ser mayor o igual al monto base');
      return false;
    }
    if (formData.dias_para_pago <= 0) {
      setError('Los días para pago deben ser mayor a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (tipoInfraccion) {
        await financeService.updateTipoInfraccion(tipoInfraccion.id, formData);
      } else {
        await financeService.createTipoInfraccion(formData);
      }
      onSuccess();
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(value);
  };

  const diferenciaPorcentaje = formData.monto_base > 0 ?
    ((formData.monto_reincidencia - formData.monto_base) / formData.monto_base * 100).toFixed(1) :
    '0';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        {tipoInfraccion ? 'Editar Tipo de Infracción' : 'Nuevo Tipo de Infracción'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Código"
                value={formData.codigo}
                onChange={handleChange('codigo')}
                placeholder="ej: ruido_excesivo"
                helperText="Código único para identificar el tipo de infracción"
                disabled={loading}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre}
                onChange={handleChange('nombre')}
                placeholder="ej: Ruido Excesivo"
                helperText="Nombre descriptivo del tipo de infracción"
                disabled={loading}
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.descripcion}
                onChange={handleChange('descripcion')}
                multiline
                rows={2}
                placeholder="Descripción detallada del tipo de infracción..."
                helperText="Descripción opcional del tipo de infracción"
                disabled={loading}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Monto Base"
                type="number"
                value={formData.monto_base}
                onChange={handleChange('monto_base')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                }}
                helperText="Monto para la primera infracción"
                disabled={loading}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Monto Reincidencia"
                type="number"
                value={formData.monto_reincidencia}
                onChange={handleChange('monto_reincidencia')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                }}
                helperText={`Monto para reincidentes (+${diferenciaPorcentaje}%)`}
                disabled={loading}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Días para Pago"
                type="number"
                value={formData.dias_para_pago}
                onChange={handleChange('dias_para_pago')}
                helperText="Días disponibles para pagar la multa"
                disabled={loading}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Orden"
                type="number"
                value={formData.orden}
                onChange={handleChange('orden')}
                helperText="Orden de visualización (menor = primero)"
                disabled={loading}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.es_activo}
                    onChange={handleChange('es_activo')}
                    disabled={loading}
                  />
                }
                label="Activo"
              />
              <Box sx={{ mt: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                Solo los tipos activos estarán disponibles para nuevas infracciones
              </Box>
            </Grid>

            {/* Previsualización de montos */}
            <Grid size={12}>
              <Box sx={{
                p: 2,
                backgroundColor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}>
                <Box sx={{ fontWeight: 'bold', mb: 1 }}>Previsualización de Montos:</Box>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box>
                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>Primera vez:</Box>
                    <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatCurrency(formData.monto_base)}
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>Reincidencia:</Box>
                    <Box sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      {formatCurrency(formData.monto_reincidencia)}
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>Diferencia:</Box>
                    <Box sx={{ fontWeight: 'bold' }}>
                      +{formatCurrency(formData.monto_reincidencia - formData.monto_base)} ({diferenciaPorcentaje}%)
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<SaveIcon />}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TipoInfraccionForm;