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
  Autocomplete,
  Typography,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
  Cargo,
  CargoFormData,
  TipoCargo,
  Propietario,
} from '../../types';
import { financeService, propertyService, handleApiError } from '../../services/api';

interface CargoFormProps {
  open: boolean;
  onClose: () => void;
  cargo?: Cargo | null;
  onSuccess: () => void;
}

const tiposCargo = [
  { value: 'cuota_mensual', label: 'Cuota Mensual' },
  { value: 'expensa_extraordinaria', label: 'Expensa Extraordinaria' },
  { value: 'multa', label: 'Multa' },
  { value: 'interes_mora', label: 'Interés por Mora' },
  { value: 'otros', label: 'Otros' },
];

const CargoForm: React.FC<CargoFormProps> = ({
  open,
  onClose,
  cargo,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CargoFormData>({
    propietario: 0,
    unidad: 0,
    concepto: '',
    tipo_cargo: 'cuota_mensual' as TipoCargo,
    monto: 0,
    moneda: 'BOB',
    fecha_vencimiento: new Date().toISOString().split('T')[0],
    es_recurrente: false,
    periodo: '',
    tasa_interes_mora: 1.5,
    observaciones: '',
  });

  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [selectedPropietario, setSelectedPropietario] = useState<Propietario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propietariosLoading, setPropietariosLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadPropietarios();
      if (cargo) {
        setFormData({
          propietario: cargo.propietario,
          unidad: cargo.unidad,
          concepto: cargo.concepto,
          tipo_cargo: cargo.tipo_cargo,
          monto: cargo.monto,
          moneda: cargo.moneda,
          fecha_vencimiento: cargo.fecha_vencimiento,
          es_recurrente: cargo.es_recurrente,
          periodo: cargo.periodo || '',
          tasa_interes_mora: cargo.tasa_interes_mora,
          observaciones: cargo.observaciones || '',
        });
      }
    }
  }, [open, cargo]);

  const loadPropietarios = async () => {
    setPropietariosLoading(true);
    try {
      const response = await propertyService.getPropietarios(1, '');
      setPropietarios(response.results);

      // Si estamos editando, buscar el propietario seleccionado
      if (cargo) {
        const propietario = response.results.find(p => p.id === cargo.propietario);
        if (propietario) {
          setSelectedPropietario(propietario);
        }
      }
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setPropietariosLoading(false);
    }
  };

  const handlePropietarioChange = (propietario: Propietario | null) => {
    setSelectedPropietario(propietario);
    if (propietario) {
      setFormData(prev => ({
        ...prev,
        propietario: propietario.id,
        unidad: propietario.unidad,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (cargo) {
        await financeService.updateCargo(cargo.id, formData);
      } else {
        await financeService.createCargo(formData);
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
        propietario: 0,
        unidad: 0,
        concepto: '',
        tipo_cargo: 'cuota_mensual' as TipoCargo,
        monto: 0,
        moneda: 'BOB',
        fecha_vencimiento: new Date().toISOString().split('T')[0],
        es_recurrente: false,
        periodo: '',
        tasa_interes_mora: 1.5,
        observaciones: '',
      });
      setSelectedPropietario(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {cargo ? 'Editar Cargo' : 'Nuevo Cargo'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={propietarios}
              getOptionLabel={(option) =>
                `${option.user_full_name} - ${option.unidad_numero} (${option.bloque_nombre})`
              }
              value={selectedPropietario}
              onChange={(_, value) => handlePropietarioChange(value)}
              loading={propietariosLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Propietario"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {propietariosLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <TextField
              label="Concepto"
              value={formData.concepto}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, concepto: e.target.value }))
              }
              required
              fullWidth
              placeholder="Ej: Cuota de administración - Octubre 2024"
            />

            <FormControl fullWidth required>
              <InputLabel>Tipo de Cargo</InputLabel>
              <Select
                value={formData.tipo_cargo}
                label="Tipo de Cargo"
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    tipo_cargo: e.target.value as TipoCargo,
                  }))
                }
              >
                {tiposCargo.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Monto"
                type="number"
                value={formData.monto}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, monto: parseFloat(e.target.value) }))
                }
                required
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">Bs.</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />

              <TextField
                label="Moneda"
                value={formData.moneda}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, moneda: e.target.value }))
                }
                fullWidth
                disabled
              />
            </Box>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de Vencimiento"
                value={new Date(formData.fecha_vencimiento)}
                onChange={(date) => {
                  if (date) {
                    setFormData(prev => ({
                      ...prev,
                      fecha_vencimiento: date.toISOString().split('T')[0],
                    }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.es_recurrente}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, es_recurrente: e.target.checked }))
                  }
                />
              }
              label="Cargo Recurrente"
            />

            {formData.es_recurrente && (
              <TextField
                label="Período"
                value={formData.periodo}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, periodo: e.target.value }))
                }
                fullWidth
                placeholder="Ej: Octubre 2024, Trimestre 1-2024"
                helperText="Especifica el período que cubre este cargo"
              />
            )}

            <TextField
              label="Tasa de Interés por Mora (%)"
              type="number"
              value={formData.tasa_interes_mora}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, tasa_interes_mora: parseFloat(e.target.value) }))
              }
              fullWidth
              InputProps={{
                inputProps: { min: 0, step: 0.1 }
              }}
              helperText="Porcentaje mensual que se aplicará por mora"
            />

            <TextField
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, observaciones: e.target.value }))
              }
              multiline
              rows={3}
              fullWidth
            />

            {selectedPropietario && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Información del Propietario
                </Typography>
                <Typography variant="body2">
                  <strong>Nombre:</strong> {selectedPropietario.user_full_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Unidad:</strong> {selectedPropietario.unidad_numero}
                </Typography>
                <Typography variant="body2">
                  <strong>Bloque:</strong> {selectedPropietario.bloque_nombre}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedPropietario.user_email}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !selectedPropietario}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {cargo ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CargoForm;