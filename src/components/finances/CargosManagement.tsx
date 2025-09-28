import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Pagination,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import {
  Cargo,
  FiltrosCargos,
  PaginatedResponse,
  EstadoCargo,
} from '../../types';
import { financeService, handleApiError } from '../../services/api';
import CargoForm from './CargoForm';
import EstadoCargoModal from './EstadoCargoModal';

const CargosManagement: React.FC = () => {
  // Estado para cargos
  const [cargos, setCargos] = useState<PaginatedResponse<Cargo>>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [cargosLoading, setCargosLoading] = useState(false);
  const [cargosPage, setCargosPage] = useState(1);
  const [filtrosCargos, setFiltrosCargos] = useState<FiltrosCargos>({});

  // Estado para modales
  const [openCargoDialog, setOpenCargoDialog] = useState(false);
  const [openEstadoCargoModal, setOpenEstadoCargoModal] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);

  // Estado general
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado para confirmación de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  useEffect(() => {
    loadCargos();
  }, []);

  const loadCargos = async (page: number = 1, filtros?: FiltrosCargos) => {
    setCargosLoading(true);
    try {
      const data = await financeService.getCargos(page, filtros);
      setCargos(data || { count: 0, next: null, previous: null, results: [] });
      setCargosPage(page);
    } catch (error) {
      setError(handleApiError(error));
      setCargos({ count: 0, next: null, previous: null, results: [] });
    } finally {
      setCargosLoading(false);
    }
  };

  const getEstadoChip = (estado: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' } = {
      pendiente: 'warning',
      parcialmente_pagado: 'info',
      pagado: 'success',
      vencido: 'error',
      cancelado: 'default',
    };

    return (
      <Chip
        label={estado}
        color={colors[estado] || 'default'}
        size="small"
      />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  };

  const handleDeleteCargo = (id: number) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      await financeService.deleteCargo(deleteTargetId);
      setSuccess('Cargo eliminado exitosamente');
      loadCargos(cargosPage, filtrosCargos);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const handleOpenEstadoCargoModal = (cargo: Cargo) => {
    setSelectedCargo(cargo);
    setOpenEstadoCargoModal(true);
  };

  const handleCambiarEstadoCargo = async (id: number, estado: EstadoCargo, observaciones?: string, montoPagado?: number) => {
    try {
      const response = await financeService.cambiarEstadoCargo(id, estado, observaciones, montoPagado);
      setSuccess(response.message);
      loadCargos(cargosPage, filtrosCargos);
    } catch (error) {
      throw error;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Gestión de Cargos
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedCargo(null);
                  setOpenCargoDialog(true);
                }}
              >
                Nuevo Cargo
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => loadCargos(1, filtrosCargos)}
              >
                Actualizar
              </Button>
            </Stack>
          </Box>

          {cargosLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Propietario</TableCell>
                      <TableCell>Unidad</TableCell>
                      <TableCell>Concepto</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Monto</TableCell>
                      <TableCell>Vencimiento</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cargos.results?.map((cargo) => (
                      <TableRow key={cargo.id}>
                        <TableCell>{cargo.propietario_nombre || '-'}</TableCell>
                        <TableCell>{cargo.unidad_numero || '-'}</TableCell>
                        <TableCell>{cargo.concepto || '-'}</TableCell>
                        <TableCell>{cargo.tipo_cargo_display || '-'}</TableCell>
                        <TableCell>{cargo.monto ? formatCurrency(cargo.monto) : '-'}</TableCell>
                        <TableCell>
                          {cargo.fecha_vencimiento ? new Date(cargo.fecha_vencimiento).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {getEstadoChip(cargo.estado || 'pendiente')}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedCargo(cargo);
                                  setOpenCargoDialog(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cambiar Estado">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleOpenEstadoCargoModal(cargo)}
                              >
                                <SwapIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteCargo(cargo.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )) || []}
                  </TableBody>
                </Table>
              </TableContainer>

              {cargos.count > 0 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={Math.ceil(cargos.count / 10)}
                    page={cargosPage}
                    onChange={(e, page) => loadCargos(page, filtrosCargos)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de cargo */}
      {openCargoDialog && (
        <CargoForm
          open={openCargoDialog}
          onClose={() => setOpenCargoDialog(false)}
          cargo={selectedCargo}
          onSuccess={() => {
            loadCargos(cargosPage, filtrosCargos);
            setOpenCargoDialog(false);
            setSuccess(selectedCargo ? 'Cargo actualizado' : 'Cargo creado');
          }}
        />
      )}

      {/* Modal para cambiar estado */}
      <EstadoCargoModal
        open={openEstadoCargoModal}
        onClose={() => {
          setOpenEstadoCargoModal(false);
          setSelectedCargo(null);
        }}
        cargo={selectedCargo}
        onSuccess={setSuccess}
        onError={setError}
        onCambiarEstado={handleCambiarEstadoCargo}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar este cargo?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CargosManagement;