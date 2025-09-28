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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
  Infraccion,
  InfraccionFormData,
  TipoInfraccion,
  Propietario,
  UnidadHabitacional,
  ConfiguracionMultas,
} from '../../types';
import { financeService, propertyService, handleApiError } from '../../services/api';

interface InfraccionFormProps {
  open: boolean;
  onClose: () => void;
  infraccion?: Infraccion | null;
  onSuccess: () => void;
}


const InfraccionForm: React.FC<InfraccionFormProps> = ({
  open,
  onClose,
  infraccion,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<InfraccionFormData>({
    propietario: 0,
    unidad: 0,
    tipo_infraccion: 0,
    descripcion: '',
    fecha_infraccion: new Date().toISOString().split('T')[0],
    evidencia_url: '',
    observaciones_admin: '',
  });

  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [unidades, setUnidades] = useState<UnidadHabitacional[]>([]);
  const [selectedPropietario, setSelectedPropietario] = useState<Propietario | null>(null);
  const [configuracionesMultas, setConfiguracionesMultas] = useState<ConfiguracionMultas[]>([]);
  const [montoCalculado, setMontoCalculado] = useState<number | null>(null);
  const [tiposInfraccion, setTiposInfraccion] = useState<TipoInfraccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propietariosLoading, setPropietariosLoading] = useState(false);
  const [tiposLoading, setTiposLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadPropietarios();
      loadConfiguracionesMultas();
      loadTiposInfraccion();
      if (infraccion) {
        setFormData({
          propietario: infraccion.propietario,
          unidad: infraccion.unidad,
          tipo_infraccion: infraccion.tipo_infraccion,
          descripcion: infraccion.descripcion,
          fecha_infraccion: infraccion.fecha_infraccion.split('T')[0],
          evidencia_url: infraccion.evidencia_url || '',
          observaciones_admin: infraccion.observaciones_admin || '',
        });
      }
    }
  }, [open, infraccion]);

  // Calcular monto cuando cambie el tipo de infracción
  useEffect(() => {
    if (formData.tipo_infraccion && configuracionesMultas.length > 0) {
      calcularMontoMulta(formData.tipo_infraccion);
    }
  }, [formData.tipo_infraccion, configuracionesMultas]);

  const loadPropietarios = async () => {
    setPropietariosLoading(true);
    try {
      const response = await propertyService.getPropietarios(1, '');
      setPropietarios(response.results);

      // Si estamos editando, buscar el propietario seleccionado
      if (infraccion) {
        const propietario = response.results.find(p => p.id === infraccion.propietario);
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

  const loadConfiguracionesMultas = async () => {
    try {
      // Note: This function is deprecated - using TipoInfraccion instead
      // const configuraciones = await financeService.getConfiguracionMultas();
      // setConfiguracionesMultas(configuraciones);
      console.warn('loadConfiguracionesMultas is deprecated, use loadTiposInfraccion instead');
    } catch (error) {
      console.warn('Error cargando configuraciones de multas:', error);
      // No mostramos error al usuario, solo no tendremos cálculo automático
    }
  };

  const loadTiposInfraccion = async () => {
    setTiposLoading(true);
    try {
      const tipos = await financeService.getTiposInfraccion();
      setTiposInfraccion(tipos);
    } catch (error) {
      console.warn('Error cargando tipos de infracción:', error);
      // Fallback a lista por defecto
      setTiposInfraccion([]);
    } finally {
      setTiposLoading(false);
    }
  };

  const calcularMontoMulta = (tipoInfraccionId: number, esReincidente: boolean = false) => {
    const tipoInfraccion = tiposInfraccion.find(tipo => tipo.id === tipoInfraccionId);
    if (!tipoInfraccion) {
      setMontoCalculado(null);
      return;
    }

    // Usar directamente los datos del TipoInfraccion
    const monto = esReincidente ?
      Number(tipoInfraccion.monto_reincidencia) :
      Number(tipoInfraccion.monto_base);

    setMontoCalculado(monto);
    console.log(`💰 Monto calculado para ${tipoInfraccion.nombre}: ${monto} (${esReincidente ? 'reincidente' : 'primera vez'})`);
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
      if (infraccion) {
        await financeService.updateInfraccion(infraccion.id, formData);
      } else {
        await financeService.createInfraccion(formData);
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
        tipo_infraccion: 0,
        descripcion: '',
        fecha_infraccion: new Date().toISOString().split('T')[0],
        evidencia_url: '',
        observaciones_admin: '',
      });
      setSelectedPropietario(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {infraccion ? 'Editar Infracción' : 'Nueva Infracción'}
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

            <FormControl fullWidth required>
              <InputLabel>Tipo de Infracción</InputLabel>
              <Select
                value={formData.tipo_infraccion}
                label="Tipo de Infracción"
                onChange={(e) => {
                  const tipoId = e.target.value as number;
                  setFormData(prev => ({
                    ...prev,
                    tipo_infraccion: tipoId,
                  }));
                  // Calcular monto automáticamente
                  calcularMontoMulta(tipoId);
                }}
                disabled={tiposLoading}
              >
                {tiposLoading ? (
                  <MenuItem disabled>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={16} />
                      <span>Cargando tipos...</span>
                    </Box>
                  </MenuItem>
                ) : (
                  tiposInfraccion.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {montoCalculado !== null && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Monto de multa calculado:</strong> {new Intl.NumberFormat('es-BO', {
                  style: 'currency',
                  currency: 'BOB',
                }).format(montoCalculado)}
                <br />
                <Typography variant="caption" color="text.secondary">
                  Este monto se aplicará automáticamente cuando se confirme la infracción y se genere la multa.
                </Typography>
              </Alert>
            )}

            <TextField
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, descripcion: e.target.value }))
              }
              multiline
              rows={4}
              required
              fullWidth
            />

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de Infracción"
                value={new Date(formData.fecha_infraccion)}
                onChange={(date) => {
                  if (date) {
                    setFormData(prev => ({
                      ...prev,
                      fecha_infraccion: date.toISOString().split('T')[0],
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

            <TextField
              label="URL de Evidencia (Opcional)"
              value={formData.evidencia_url || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, evidencia_url: e.target.value || '' }))
              }
              placeholder="https://ejemplo.com/imagen.jpg (opcional)"
              fullWidth
            />

            {/* Mostrar monto calculado automáticamente */}
            {montoCalculado !== null && (
              <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
                <Typography variant="subtitle2" gutterBottom color="info.main">
                  💰 Monto de Multa Calculado
                </Typography>
                <Typography variant="h6" color="info.dark">
                  Bs. {montoCalculado.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Este monto se aplicará automáticamente según la configuración del tipo de infracción.
                </Typography>
              </Box>
            )}

            <TextField
              label="Observaciones Administrativas"
              value={formData.observaciones_admin}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, observaciones_admin: e.target.value }))
              }
              multiline
              rows={3}
              fullWidth
              helperText="Comentarios internos del administrador"
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
            {infraccion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InfraccionForm;