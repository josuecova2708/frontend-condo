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
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  AttachMoney as MoneyIcon,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import {
  Infraccion,
  FiltrosInfracciones,
  PaginatedResponse,
  EstadoInfraccion,
} from '../../types';
import { financeService, handleApiError } from '../../services/api';
import InfraccionForm from './InfraccionForm';
import EstadoInfraccionModal from './EstadoInfraccionModal';

const InfraccionesManagement: React.FC = () => {
  // Estado para infracciones
  const [infracciones, setInfracciones] = useState<PaginatedResponse<Infraccion>>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [infraccionesLoading, setInfraccionesLoading] = useState(false);
  const [infraccionesPage, setInfraccionesPage] = useState(1);
  const [filtrosInfracciones, setFiltrosInfracciones] = useState<FiltrosInfracciones>({});

  // Estado para modales
  const [openInfraccionDialog, setOpenInfraccionDialog] = useState(false);
  const [openEstadoInfraccionModal, setOpenEstadoInfraccionModal] = useState(false);
  const [selectedInfraccion, setSelectedInfraccion] = useState<Infraccion | null>(null);

  // Estado general
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado para confirmación de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  useEffect(() => {
    loadInfracciones();
  }, []);

  const loadInfracciones = async (page: number = 1, filtros?: FiltrosInfracciones) => {
    setInfraccionesLoading(true);
    try {
      const data = await financeService.getInfracciones(page, filtros);
      setInfracciones(data || { count: 0, next: null, previous: null, results: [] });
      setInfraccionesPage(page);
    } catch (error) {
      setError(handleApiError(error));
      setInfracciones({ count: 0, next: null, previous: null, results: [] });
    } finally {
      setInfraccionesLoading(false);
    }
  };

  const getEstadoChip = (estado: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' } = {
      registrada: 'info',
      en_revision: 'warning',
      confirmada: 'primary',
      rechazada: 'error',
      multa_aplicada: 'success',
      pagada: 'success',
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

  const handleConfirmarInfraccion = async (id: number) => {
    try {
      await financeService.confirmarInfraccion(id);
      setSuccess('Infracción confirmada exitosamente');
      loadInfracciones(infraccionesPage, filtrosInfracciones);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleAplicarMulta = async (infraccionId: number) => {
    try {
      await financeService.aplicarMulta({ infraccion_id: infraccionId });
      setSuccess('Multa aplicada exitosamente');
      loadInfracciones(infraccionesPage, filtrosInfracciones);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleDeleteInfraccion = (id: number) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      await financeService.deleteInfraccion(deleteTargetId);
      setSuccess('Infracción eliminada exitosamente');
      loadInfracciones(infraccionesPage, filtrosInfracciones);
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

  const handleOpenEstadoInfraccionModal = (infraccion: Infraccion) => {
    setSelectedInfraccion(infraccion);
    setOpenEstadoInfraccionModal(true);
  };

  const handleCambiarEstadoInfraccion = async (id: number, estado: EstadoInfraccion, observaciones?: string) => {
    try {
      const response = await financeService.cambiarEstadoInfraccion(id, estado, observaciones);
      setSuccess(response.message);
      loadInfracciones(infraccionesPage, filtrosInfracciones);
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
            Gestión de Infracciones
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedInfraccion(null);
                  setOpenInfraccionDialog(true);
                }}
              >
                Nueva Infracción
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => loadInfracciones(1, filtrosInfracciones)}
              >
                Actualizar
              </Button>
            </Stack>
          </Box>

          {infraccionesLoading ? (
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
                      <TableCell>Tipo</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Monto</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {infracciones.results?.map((infraccion) => (
                      <TableRow key={infraccion.id}>
                        <TableCell>{infraccion.propietario_nombre || '-'}</TableCell>
                        <TableCell>{infraccion.unidad_numero || '-'}</TableCell>
                        <TableCell>{infraccion.tipo_infraccion_nombre || '-'}</TableCell>
                        <TableCell>
                          <Tooltip title={infraccion.descripcion || ''}>
                            <span>
                              {(infraccion.descripcion || '').length > 50
                                ? `${(infraccion.descripcion || '').substring(0, 50)}...`
                                : infraccion.descripcion || ''}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {infraccion.fecha_infraccion ? new Date(infraccion.fecha_infraccion).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {getEstadoChip(infraccion.estado || 'registrada')}
                        </TableCell>
                        <TableCell>
                          {infraccion.monto_calculado
                            ? formatCurrency(Number(infraccion.monto_calculado))
                            : (infraccion.monto_multa
                                ? formatCurrency(Number(infraccion.monto_multa))
                                : '-')}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedInfraccion(infraccion);
                                  setOpenInfraccionDialog(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            {(infraccion.estado || '') === 'registrada' && (
                              <Tooltip title="Confirmar">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleConfirmarInfraccion(infraccion.id)}
                                >
                                  <CheckIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(infraccion.estado || '') === 'confirmada' && infraccion.puede_aplicar_multa && (
                              <Tooltip title="Aplicar Multa">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => handleAplicarMulta(infraccion.id)}
                                >
                                  <MoneyIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Cambiar Estado">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleOpenEstadoInfraccionModal(infraccion)}
                              >
                                <SwapIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteInfraccion(infraccion.id)}
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

              {infracciones.count > 0 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={Math.ceil(infracciones.count / 10)}
                    page={infraccionesPage}
                    onChange={(e, page) => loadInfracciones(page, filtrosInfracciones)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de infracción */}
      {openInfraccionDialog && (
        <InfraccionForm
          open={openInfraccionDialog}
          onClose={() => setOpenInfraccionDialog(false)}
          infraccion={selectedInfraccion}
          onSuccess={() => {
            loadInfracciones(infraccionesPage, filtrosInfracciones);
            setOpenInfraccionDialog(false);
            setSuccess(selectedInfraccion ? 'Infracción actualizada' : 'Infracción creada');
          }}
        />
      )}

      {/* Modal para cambiar estado */}
      <EstadoInfraccionModal
        open={openEstadoInfraccionModal}
        onClose={() => {
          setOpenEstadoInfraccionModal(false);
          setSelectedInfraccion(null);
        }}
        infraccion={selectedInfraccion}
        onSuccess={setSuccess}
        onError={setError}
        onCambiarEstado={handleCambiarEstadoInfraccion}
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
            ¿Está seguro que desea eliminar esta infracción?
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

export default InfraccionesManagement;