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
import { EstadoCargo, Cargo } from '../../types';

interface EstadoCargoModalProps {
  open: boolean;
  onClose: () => void;
  cargo: Cargo | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onCambiarEstado: (id: number, estado: EstadoCargo, observaciones?: string, montoPagado?: number) => Promise<void>;
}

const ESTADOS_CARGO = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'parcialmente_pagado', label: 'Parcialmente Pagado' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'en_revision', label: 'En Revisión' },
];

const EstadoCargoModal: React.FC<EstadoCargoModalProps> = ({
  open,
  onClose,
  cargo,
  onSuccess,
  onError,
  onCambiarEstado,
}) => {
  const [nuevoEstado, setNuevoEstado] = useState<EstadoCargo>('pendiente');
  const [observaciones, setObservaciones] = useState('');
  const [montoPagado, setMontoPagado] = useState<string>('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (cargo) {
      setNuevoEstado(cargo.estado as EstadoCargo || 'pendiente');
      setObservaciones('');
      setMontoPagado(cargo.monto_pagado?.toString() || '0');
    }
  }, [cargo]);

  const handleSubmit = async () => {
    if (!cargo) return;

    try {
      setLoading(true);
      const montoNumerico = montoPagado ? parseFloat(montoPagado) : undefined;
      await onCambiarEstado(cargo.id, nuevoEstado, observaciones, montoNumerico);
      onSuccess(`Estado cambiado a ${ESTADOS_CARGO.find(e => e.value === nuevoEstado)?.label}`);
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
      setMontoPagado('');
      onClose();
    }
  };

  const estadoActualLabel = ESTADOS_CARGO.find(e => e.value === cargo?.estado)?.label || 'Desconocido';
  const saldoPendiente = cargo ? cargo.monto - (cargo.monto_pagado || 0) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Cambiar Estado de Cargo
      </DialogTitle>
      <DialogContent>
        {cargo && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Concepto:</strong> {cargo.concepto}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Propietario:</strong> {cargo.propietario_nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Monto total:</strong> {formatCurrency(cargo.monto)}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Monto pagado:</strong> {formatCurrency(cargo.monto_pagado || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Saldo pendiente:</strong> {formatCurrency(saldoPendiente)}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Estado actual:</strong> {estadoActualLabel}
            </Typography>

            <FormControl fullWidth sx={{ mt: 3, mb: 2 }}>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={nuevoEstado}
                label="Nuevo Estado"
                onChange={(e) => setNuevoEstado(e.target.value as EstadoCargo)}
                disabled={loading}
              >
                {ESTADOS_CARGO.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(nuevoEstado === 'pagado' || nuevoEstado === 'parcialmente_pagado') && (
              <TextField
                fullWidth
                type="number"
                label="Monto Pagado"
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value)}
                disabled={loading}
                inputProps={{
                  min: 0,
                  max: cargo.monto,
                  step: 0.01,
                }}
                sx={{ mb: 2 }}
                helperText={`Monto máximo: ${formatCurrency(cargo.monto)}`}
              />
            )}

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

            {(nuevoEstado === 'cancelado') && !observaciones.trim() && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Se recomienda agregar observaciones al cancelar un cargo.
              </Alert>
            )}

            {(nuevoEstado === 'pagado') && cargo.infraccion && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Al marcar como pagado, se actualizará automáticamente la infracción relacionada.
              </Alert>
            )}

            {montoPagado && !isNaN(parseFloat(montoPagado)) && parseFloat(montoPagado) > cargo.monto && (
              <Alert severity="error" sx={{ mb: 2 }}>
                El monto pagado no puede ser mayor al monto del cargo.
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
          disabled={Boolean(
            loading ||
            !cargo ||
            (nuevoEstado === cargo?.estado && montoPagado === (cargo?.monto_pagado?.toString() || '0')) ||
            (montoPagado && !isNaN(parseFloat(montoPagado)) && parseFloat(montoPagado) > cargo.monto)
          )}
        >
          {loading ? 'Cambiando...' : 'Cambiar Estado'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EstadoCargoModal;