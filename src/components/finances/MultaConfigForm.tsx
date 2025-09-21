import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Typography,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import {
  ConfiguracionMultas,
  ConfiguracionMultasFormData,
  TipoInfraccion,
} from '../../types';
import { financeService, handleApiError } from '../../services/api';

interface MultaConfigFormProps {
  open: boolean;
  onClose: () => void;
  configuracion?: ConfiguracionMultas | null;
  onSuccess: () => void;
}

const tiposInfraccion = [
  { value: 'ruido_excesivo', label: 'Ruido Excesivo' },
  { value: 'uso_inadecuado_areas', label: 'Uso Inadecuado de Áreas' },
  { value: 'mascota_sin_correa', label: 'Mascota sin Correa' },
  { value: 'basura_horario', label: 'Basura fuera de Horario' },
  { value: 'parqueadero_incorrecto', label: 'Parqueadero Incorrecto' },
  { value: 'modificacion_sin_permiso', label: 'Modificación sin Permiso' },
  { value: 'otros', label: 'Otros' },
];

const MultaConfigForm: React.FC<MultaConfigFormProps> = ({
  open,
  onClose,
  configuracion,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ConfiguracionMultasFormData>({
    tipo_infraccion: 'ruido_excesivo' as TipoInfraccion,
    monto_base: 0,
    monto_reincidencia: 0,
    dias_para_pago: 15,
    es_activa: true,
    descripcion: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && configuracion) {
      setFormData({
        tipo_infraccion: configuracion.tipo_infraccion,
        monto_base: configuracion.monto_base,
        monto_reincidencia: configuracion.monto_reincidencia,
        dias_para_pago: configuracion.dias_para_pago,
        es_activa: configuracion.es_activa,
        descripcion: configuracion.descripcion || '',
      });
    }
  }, [open, configuracion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (configuracion) {
        await financeService.updateConfiguracionMulta(configuracion.id, formData);
      } else {
        await financeService.createConfiguracionMulta(formData);
      }
      onSuccess();
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        tipo_infraccion: 'ruido_excesivo' as TipoInfraccion,
        monto_base: 0,
        monto_reincidencia: 0,
        dias_para_pago: 15,
        es_activa: true,
        descripcion: '',
      });
      setError(null);
      onClose();
    }
  };

  const handleMontoReincidenciaChange = (value: number) => {
    setFormData(prev => ({ ...prev, monto_reincidencia: value }));
  };

  const calcularPorcentajeReincidencia = () => {
    if (formData.monto_base > 0) {
      const porcentaje = ((formData.monto_reincidencia - formData.monto_base) / formData.monto_base) * 100;
      return porcentaje.toFixed(1);
    }
    return '0';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {configuracion ? 'Editar Configuración de Multa' : 'Nueva Configuración de Multa'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Infracción</InputLabel>
              <Select
                value={formData.tipo_infraccion}
                label="Tipo de Infracción"
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    tipo_infraccion: e.target.value as TipoInfraccion,
                  }))
                }
                disabled={!!configuracion} // No permitir cambiar el tipo al editar
              >
                {tiposInfraccion.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Monto Base"
              type="number"
              value={formData.monto_base}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, monto_base: parseFloat(e.target.value) }))
              }
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }}
              helperText="Monto para primera infracción"
            />

            <TextField
              label="Monto por Reincidencia"
              type="number"
              value={formData.monto_reincidencia}
              onChange={(e) =>
                handleMontoReincidenciaChange(parseFloat(e.target.value))
              }
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }}
              helperText={
                formData.monto_base > 0
                  ? `Incremento del ${calcularPorcentajeReincidencia()}% respecto al monto base`
                  : "Monto para infracciones reincidentes"
              }
            />

            <TextField
              label="Días para Pago"
              type="number"
              value={formData.dias_para_pago}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, dias_para_pago: parseInt(e.target.value) }))
              }
              required
              fullWidth
              InputProps={{
                inputProps: { min: 1, max: 365 }
              }}
              helperText="Número de días para pagar la multa sin intereses"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.es_activa}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, es_activa: e.target.checked }))
                  }
                />
              }
              label="Configuración Activa"
            />

            <TextField
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, descripcion: e.target.value }))
              }
              multiline
              rows={3}
              fullWidth
              placeholder="Descripción adicional sobre esta configuración de multa"
            />

            {/* Resumen de la configuración */}
            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                Resumen de la Configuración
              </Typography>
              <Typography variant="body2">
                • <strong>Primera infracción:</strong> Bs. {formData.monto_base.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                • <strong>Reincidencia:</strong> Bs. {formData.monto_reincidencia.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                • <strong>Plazo de pago:</strong> {formData.dias_para_pago} días
              </Typography>
              <Typography variant="body2">
                • <strong>Estado:</strong> {formData.es_activa ? 'Activa' : 'Inactiva'}
              </Typography>
            </Box>

            {/* Recomendaciones */}
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Recomendaciones:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                • El monto de reincidencia debe ser mayor al monto base
                <br />
                • Un plazo de 15-30 días es recomendable para el pago
                <br />
                • Desactiva configuraciones obsoletas en lugar de eliminarlas
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || formData.monto_base <= 0 || formData.monto_reincidencia <= 0}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {configuracion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MultaConfigForm;