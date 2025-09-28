import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { EstadoInfraccion, Infraccion } from '../../types';

interface EstadoInfraccionModalProps {
  open: boolean;
  onClose: () => void;
  infraccion: Infraccion | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onCambiarEstado: (id: number, estado: EstadoInfraccion, observaciones?: string) => Promise<void>;
}

const ESTADOS_INFRACCION = [
  { value: 'registrada', label: 'Registrada' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'rechazada', label: 'Rechazada' },
  { value: 'multa_aplicada', label: 'Multa Aplicada' },
  { value: 'pagada', label: 'Pagada' },
];

const EstadoInfraccionModal: React.FC<EstadoInfraccionModalProps> = ({
  open,
  onClose,
  infraccion,
  onSuccess,
  onError,
  onCambiarEstado,
}) => {
  const [nuevoEstado, setNuevoEstado] = useState<EstadoInfraccion>('registrada');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (infraccion) {
      setNuevoEstado(infraccion.estado as EstadoInfraccion || 'registrada');
      setObservaciones('');
    }
  }, [infraccion]);

  const handleSubmit = async () => {
    if (!infraccion) return;

    try {
      setLoading(true);
      await onCambiarEstado(infraccion.id, nuevoEstado, observaciones);
      onSuccess(`Estado cambiado a ${ESTADOS_INFRACCION.find(e => e.value === nuevoEstado)?.label}`);
      onClose();
    } catch (error: any) {
      onError(error.message || 'Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setObservaciones('');
      onClose();
    }
  };

  const estadoActualLabel = ESTADOS_INFRACCION.find(e => e.value === infraccion?.estado)?.label || 'Desconocido';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Cambiar Estado de Infracción
      </DialogTitle>
      <DialogContent>
        {infraccion && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Infracción:</strong> {infraccion.tipo_infraccion_nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Propietario:</strong> {infraccion.propietario_nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Estado actual:</strong> {estadoActualLabel}
            </Typography>

            <FormControl fullWidth sx={{ mt: 3, mb: 2 }}>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={nuevoEstado}
                label="Nuevo Estado"
                onChange={(e) => setNuevoEstado(e.target.value as EstadoInfraccion)}
                disabled={loading}
              >
                {ESTADOS_INFRACCION.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={loading}
              placeholder="Agregue observaciones sobre el cambio de estado..."
              sx={{ mb: 2 }}
            />

            {(nuevoEstado === 'rechazada') && !observaciones.trim() && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Se recomienda agregar observaciones al rechazar una infracción.
              </Alert>
            )}

            {(nuevoEstado === 'pagada') && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Al marcar como pagada, se actualizará automáticamente el cargo relacionado.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !infraccion || nuevoEstado === infraccion?.estado}
        >
          {loading ? 'Cambiando...' : 'Cambiar Estado'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EstadoInfraccionModal;