import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Assessment as StatsIcon,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import {
  Infraccion,
  Cargo,
  ConfiguracionMultas,
  EstadoInfraccion,
  EstadoCargo,
  TipoInfraccion,
  TipoCargo,
  FiltrosInfracciones,
  FiltrosCargos,
  PaginatedResponse,
} from '../../types';
import { financeService, handleApiError } from '../../services/api';
import InfraccionForm from './InfraccionForm';
import CargoForm from './CargoForm';
import MultaConfigForm from './MultaConfigForm';
import TipoInfraccionForm from './TipoInfraccionForm';
import EstadoInfraccionModal from './EstadoInfraccionModal';
import EstadoCargoModal from './EstadoCargoModal';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const FinancesManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

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

  // Estado para configuración de multas (legacy)
  const [configuracionMultas, setConfiguracionMultas] = useState<ConfiguracionMultas[]>([]);

  // Estado para tipos de infracciones dinámicos
  const [tiposInfraccion, setTiposInfraccion] = useState<TipoInfraccion[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [tiposLoading, setTiposLoading] = useState(false);

  // Estado para modales
  const [openInfraccionDialog, setOpenInfraccionDialog] = useState(false);
  const [openCargoDialog, setOpenCargoDialog] = useState(false);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [openTipoInfraccionDialog, setOpenTipoInfraccionDialog] = useState(false);
  const [openEstadoInfraccionModal, setOpenEstadoInfraccionModal] = useState(false);
  const [openEstadoCargoModal, setOpenEstadoCargoModal] = useState(false);
  const [selectedInfraccion, setSelectedInfraccion] = useState<Infraccion | null>(null);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<ConfiguracionMultas | null>(null);
  const [selectedTipoInfraccion, setSelectedTipoInfraccion] = useState<TipoInfraccion | null>(null);
  const [preselectedTipo, setPreselectedTipo] = useState<string | null>(null);

  // Estado general
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado para confirmación de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; type: 'infraccion' | 'cargo' | 'config' | 'tipo_infraccion' } | null>(null);

  // Estado para reportes y estadísticas
  const [estadisticas, setEstadisticas] = useState<{
    infracciones_por_tipo: { [key: string]: number };
    infracciones_por_estado: { [key: string]: number };
    montos_por_tipo: { [key: string]: number };
    totales: {
      total_infracciones: number;
      total_multas_aplicadas: number;
      monto_total_multas: number;
      tasa_confirmacion: number;
    };
    tendencias_mensuales: Array<{
      mes: string;
      infracciones: number;
      multas: number;
      monto: number;
    }>;
  } | null>(null);
  const [estadisticasLoading, setEstadisticasLoading] = useState(false);

  useEffect(() => {
    loadInfracciones();
    loadCargos();
    loadConfiguracionMultas();
    loadTiposInfraccion();
    loadEstadisticas();
  }, []);

  const loadInfracciones = async (page: number = 1, filtros?: FiltrosInfracciones) => {
    setInfraccionesLoading(true);
    try {
      const data = await financeService.getInfracciones(page, filtros);
      // Debug: Log para verificar datos
      if (data?.results?.length > 0) {
        console.log('📊 Infracciones cargadas:', data.results.length);
        const sample = data.results[0];
        console.log(`💰 Ejemplo - ID:${sample.id}, Tipo:${sample.tipo_infraccion_nombre}, Monto Calculado:${sample.monto_calculado}`);
      }
      setInfracciones(data || { count: 0, next: null, previous: null, results: [] });
      setInfraccionesPage(page);
    } catch (error) {
      setError(handleApiError(error));
      setInfracciones({ count: 0, next: null, previous: null, results: [] });
    } finally {
      setInfraccionesLoading(false);
    }
  };

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

  const loadConfiguracionMultas = async () => {
    setConfigLoading(true);
    try {
      // Updated to use new TipoInfraccion API instead of old configuracion-multas
      const data = await financeService.getTiposInfraccion();
      // Convert TipoInfraccion to ConfiguracionMultas format for compatibility
      const configuraciones = data.map(tipo => ({
        id: tipo.id,
        tipo_infraccion: tipo.codigo as any, // Legacy type compatibility
        monto_base: tipo.monto_base,
        monto_reincidencia: tipo.monto_reincidencia,
        dias_para_pago: tipo.dias_para_pago,
        es_activa: tipo.es_activo,
        descripcion: tipo.descripcion || '',
        created_at: tipo.created_at,
        updated_at: tipo.updated_at,
        tipo_infraccion_display: tipo.nombre,
      }));
      setConfiguracionMultas(configuraciones);
    } catch (error) {
      setError(handleApiError(error));
      setConfiguracionMultas([]);
    } finally {
      setConfigLoading(false);
    }
  };

  const loadTiposInfraccion = async () => {
    console.log('🔄 Loading tipos de infraccion...');
    setTiposLoading(true);
    try {
      const tipos = await financeService.getTiposInfraccion();
      console.log('✅ Tipos de infraccion loaded:', tipos);
      setTiposInfraccion(tipos);
    } catch (error) {
      console.error('❌ Error loading tipos de infraccion:', error);
      setError(handleApiError(error));
      setTiposInfraccion([]);
    } finally {
      setTiposLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    console.log('🔄 Loading estadísticas...');
    setEstadisticasLoading(true);
    try {
      // Calcular estadísticas desde los datos cargados
      const todasInfracciones = infracciones.results || [];
      const todosCargos = cargos.results || [];

      console.log('📊 Datos para estadísticas:', {
        infracciones: todasInfracciones.length,
        cargos: todosCargos.length,
        tiposInfraccion: tiposInfraccion.length
      });

      // Infracciones por tipo
      const infracciones_por_tipo: { [key: string]: number } = {};
      const montos_por_tipo: { [key: string]: number } = {};

      tiposInfraccion.forEach(tipo => {
        const count = todasInfracciones.filter(inf => inf.tipo_infraccion === tipo.id).length;
        infracciones_por_tipo[tipo.nombre] = count;

        // Calcular monto total usando el monto base del tipo de infracción
        // Multiplicar cantidad por monto base (asumiendo primera infracción para simplificar)
        const montoTotal = count * Number(tipo.monto_base);
        montos_por_tipo[tipo.nombre] = montoTotal;

        console.log(`📈 ${tipo.nombre}: ${count} infracciones, $${montoTotal} en multas (${formatCurrency(Number(tipo.monto_base))} x ${count})`);
      });

      // Infracciones por estado
      const infracciones_por_estado: { [key: string]: number } = {};
      todasInfracciones.forEach(inf => {
        if (inf.estado && typeof inf.estado === 'string') {
          infracciones_por_estado[inf.estado] = (infracciones_por_estado[inf.estado] || 0) + 1;
        }
      });

      // Totales
      const total_infracciones = todasInfracciones.length;
      const infracciones_confirmadas = todasInfracciones.filter(inf => inf.estado === 'confirmada').length;
      const multas_aplicadas = todasInfracciones.filter(inf => inf.estado === 'multa_aplicada' || inf.estado === 'pagada').length;

      // Calcular monto total de multas usando los montos base de tipos de infracción
      const monto_total_multas = Object.values(montos_por_tipo).reduce((sum, monto) => sum + monto, 0);

      const tasa_confirmacion = total_infracciones > 0 ?
        ((infracciones_confirmadas + multas_aplicadas) / total_infracciones * 100) : 0;

      const estadisticasCalculadas = {
        infracciones_por_tipo,
        infracciones_por_estado,
        montos_por_tipo,
        totales: {
          total_infracciones,
          total_multas_aplicadas: multas_aplicadas,
          monto_total_multas,
          tasa_confirmacion: Math.round(tasa_confirmacion * 100) / 100
        },
        tendencias_mensuales: [] // Por ahora vacío, se puede implementar más adelante
      };

      console.log('✅ Estadísticas calculadas:', estadisticasCalculadas);
      setEstadisticas(estadisticasCalculadas);

    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      setError('Error al calcular estadísticas');
    } finally {
      setEstadisticasLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Recargar estadísticas cuando se abra el tab de reportes
    if (newValue === 3) {
      loadEstadisticas();
    }
  };

  const getEstadoColor = (estado: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' } = {
      // Estados de infracciones
      registrada: 'info',
      en_revision: 'warning',
      confirmada: 'primary',
      rechazada: 'error',
      multa_aplicada: 'success',
      pagada: 'success',
      // Estados de cargos
      pendiente: 'warning',
      parcialmente_pagado: 'info',
      pagado: 'success',
      vencido: 'error',
      cancelado: 'default',
    };

    return colors[estado] || 'default';
  };

  const getEstadoChip = (estado: string, tipo: 'infraccion' | 'cargo') => {
    return (
      <Chip
        label={estado}
        color={getEstadoColor(estado)}
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
      loadCargos(cargosPage, filtrosCargos);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleDeleteInfraccion = (id: number) => {
    setDeleteTarget({ id, type: 'infraccion' });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCargo = (id: number) => {
    setDeleteTarget({ id, type: 'cargo' });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfig = (id: number) => {
    setDeleteTarget({ id, type: 'config' });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteTipoInfraccion = (id: number) => {
    setDeleteTarget({ id, type: 'tipo_infraccion' });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      switch (deleteTarget.type) {
        case 'infraccion':
          await financeService.deleteInfraccion(deleteTarget.id);
          setSuccess('Infracción eliminada exitosamente');
          loadInfracciones(infraccionesPage, filtrosInfracciones);
          break;
        case 'cargo':
          await financeService.deleteCargo(deleteTarget.id);
          setSuccess('Cargo eliminado exitosamente');
          loadCargos(cargosPage, filtrosCargos);
          break;
        case 'config':
          await financeService.deleteConfiguracionMulta(deleteTarget.id);
          setSuccess('Configuración eliminada exitosamente');
          loadConfiguracionMultas();
          break;
        case 'tipo_infraccion':
          await financeService.deleteTipoInfraccion(deleteTarget.id);
          setSuccess('Tipo de infracción eliminado exitosamente');
          loadTiposInfraccion();
          break;
      }
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleOpenEstadoInfraccionModal = (infraccion: Infraccion) => {
    setSelectedInfraccion(infraccion);
    setOpenEstadoInfraccionModal(true);
  };

  const handleOpenEstadoCargoModal = (cargo: Cargo) => {
    setSelectedCargo(cargo);
    setOpenEstadoCargoModal(true);
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

  const handleCambiarEstadoCargo = async (id: number, estado: EstadoCargo, observaciones?: string, montoPagado?: number) => {
    try {
      const response = await financeService.cambiarEstadoCargo(id, estado, observaciones, montoPagado);
      setSuccess(response.message);
      loadCargos(cargosPage, filtrosCargos);
      // También recargar infracciones por si se actualiza una infracción relacionada
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
            Gestión Financiera
          </Typography>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Infracciones" icon={<WarningIcon />} />
            <Tab label="Cargos" icon={<ReceiptIcon />} />
            <Tab label="Configuración" icon={<SettingsIcon />} />
            <Tab label="Reportes" icon={<StatsIcon />} />
          </Tabs>

          {/* Panel de Infracciones */}
          <TabPanel value={tabValue} index={0}>
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
                            {getEstadoChip(infraccion.estado || 'registrada', 'infraccion')}
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
                      ))}
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
          </TabPanel>

          {/* Panel de Cargos */}
          <TabPanel value={tabValue} index={1}>
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
                            {getEstadoChip(cargo.estado || 'pendiente', 'cargo')}
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
                      ))}
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
          </TabPanel>

          {/* Panel de Configuración */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedTipoInfraccion(null);
                    setOpenTipoInfraccionDialog(true);
                  }}
                >
                  Nuevo Tipo de Infracción
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    loadTiposInfraccion();
                  }}
                >
                  Actualizar
                </Button>
              </Stack>
            </Box>

            {tiposLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Monto Base</TableCell>
                      <TableCell>Monto Reincidencia</TableCell>
                      <TableCell>Días para Pago</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Orden</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tiposInfraccion.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography color="text.secondary" sx={{ py: 3 }}>
                            No hay tipos de infracciones configurados
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tiposInfraccion.map((tipo) => (
                        <TableRow key={tipo.id}>
                          <TableCell>{tipo.codigo}</TableCell>
                          <TableCell>{tipo.nombre}</TableCell>
                          <TableCell>{formatCurrency(Number(tipo.monto_base))}</TableCell>
                          <TableCell>{formatCurrency(Number(tipo.monto_reincidencia))}</TableCell>
                          <TableCell>{tipo.dias_para_pago} días</TableCell>
                          <TableCell>
                            <Chip
                              label={tipo.es_activo ? 'Activo' : 'Inactivo'}
                              color={tipo.es_activo ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{tipo.orden}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedTipoInfraccion(tipo);
                                    setOpenTipoInfraccionDialog(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteTipoInfraccion(tipo.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Panel de Reportes */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                  Reportes y Estadísticas
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadEstadisticas}
                  disabled={estadisticasLoading}
                >
                  Actualizar
                </Button>
              </Stack>
            </Box>

            {estadisticasLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : estadisticas && Object.keys(estadisticas.infracciones_por_estado).length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                {/* Tarjetas de resumen */}
                <Card sx={{ textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h4">{estadisticas.totales.total_infracciones}</Typography>
                    <Typography variant="body2">Total Infracciones</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="h4">{estadisticas.totales.total_multas_aplicadas}</Typography>
                    <Typography variant="body2">Multas Aplicadas</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent>
                    <Typography variant="h4">{formatCurrency(estadisticas.totales.monto_total_multas)}</Typography>
                    <Typography variant="body2">Total en Multas</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Typography variant="h4">{estadisticas.totales.tasa_confirmacion}%</Typography>
                    <Typography variant="body2">Tasa Confirmación</Typography>
                  </CardContent>
                </Card>

                {/* Infracciones por tipo - Top 5 */}
                <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 6' } }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Infracciones Más Cometidas
                      </Typography>
                      {Object.entries(estadisticas.infracciones_por_tipo)
                        .filter(([tipo, cantidad]) => tipo && typeof tipo === 'string' && cantidad > 0)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([tipo, cantidad]) => (
                          <Box key={tipo} sx={{ mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">{tipo}</Typography>
                              <Typography variant="body2" fontWeight="bold">{cantidad}</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={estadisticas.totales.total_infracciones > 0 ?
                                (cantidad / estadisticas.totales.total_infracciones) * 100 : 0}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        ))}
                    </CardContent>
                  </Card>
                </Box>

                {/* Infracciones por estado */}
                <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 6' } }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Estado de Infracciones
                      </Typography>
                      {Object.entries(estadisticas.infracciones_por_estado)
                        .filter(([estado, cantidad]) => estado && typeof estado === 'string' && cantidad > 0)
                        .map(([estado, cantidad]) => (
                          <Box key={estado} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Chip
                              label={estado.replace(/_/g, ' ').toUpperCase()}
                              color={getEstadoColor(estado)}
                              size="small"
                            />
                            <Typography variant="body2" fontWeight="bold">{cantidad}</Typography>
                          </Box>
                        ))}
                    </CardContent>
                  </Card>
                </Box>

                {/* Montos recaudados por tipo */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Montos Recaudados por Tipo de Infracción
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Tipo de Infracción</TableCell>
                              <TableCell align="right">Cantidad</TableCell>
                              <TableCell align="right">Monto Total</TableCell>
                              <TableCell align="right">Promedio</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(estadisticas.infracciones_por_tipo)
                              .filter(([tipo, cantidad]) => tipo && typeof tipo === 'string' && cantidad > 0)
                              .sort(([,a], [,b]) => b - a)
                              .map(([tipo, cantidad]) => {
                                const monto = estadisticas.montos_por_tipo[tipo] || 0;
                                const promedio = cantidad > 0 ? monto / cantidad : 0;
                                return (
                                  <TableRow key={tipo}>
                                    <TableCell>{tipo}</TableCell>
                                    <TableCell align="right">{cantidad}</TableCell>
                                    <TableCell align="right">{formatCurrency(monto)}</TableCell>
                                    <TableCell align="right">{formatCurrency(promedio)}</TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            ) : (
              <Alert severity="info">
                No hay datos suficientes para generar estadísticas
              </Alert>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Diálogos */}
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

      {openConfigDialog && (
        <MultaConfigForm
          open={openConfigDialog}
          onClose={() => {
            setOpenConfigDialog(false);
            setPreselectedTipo(null);
          }}
          configuracion={selectedConfig}
          preselectedTipo={preselectedTipo}
          onSuccess={() => {
            loadConfiguracionMultas();
            setOpenConfigDialog(false);
            setPreselectedTipo(null);
            setSuccess(selectedConfig ? 'Configuración actualizada' : 'Configuración creada');
          }}
        />
      )}

      {openTipoInfraccionDialog && (
        <TipoInfraccionForm
          open={openTipoInfraccionDialog}
          onClose={() => {
            setOpenTipoInfraccionDialog(false);
            setSelectedTipoInfraccion(null);
          }}
          tipoInfraccion={selectedTipoInfraccion}
          onSuccess={() => {
            loadTiposInfraccion();
            setOpenTipoInfraccionDialog(false);
            setSelectedTipoInfraccion(null);
            setSuccess(selectedTipoInfraccion ? 'Tipo de infracción actualizado' : 'Tipo de infracción creado');
          }}
        />
      )}

      {/* Modales para cambiar estado */}
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
            ¿Está seguro que desea eliminar este{' '}
            {deleteTarget?.type === 'infraccion' ? 'infracción' :
             deleteTarget?.type === 'cargo' ? 'cargo' :
             deleteTarget?.type === 'tipo_infraccion' ? 'tipo de infracción' : 'configuración'}?
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

export default FinancesManagement;