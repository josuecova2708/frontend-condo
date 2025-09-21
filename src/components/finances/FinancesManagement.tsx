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
  Grid,
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

  // Estado para configuración de multas
  const [configuracionMultas, setConfiguracionMultas] = useState<ConfiguracionMultas[]>([]);
  const [configLoading, setConfigLoading] = useState(false);

  // Estado para modales
  const [openInfraccionDialog, setOpenInfraccionDialog] = useState(false);
  const [openCargoDialog, setOpenCargoDialog] = useState(false);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [selectedInfraccion, setSelectedInfraccion] = useState<Infraccion | null>(null);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<ConfiguracionMultas | null>(null);

  // Estado general
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadInfracciones();
    loadCargos();
    loadConfiguracionMultas();
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
      const data = await financeService.getConfiguracionMultas();
      // Asegurar que data sea un array
      setConfiguracionMultas(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(handleApiError(error));
      setConfiguracionMultas([]);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getEstadoChip = (estado: string, tipo: 'infraccion' | 'cargo') => {
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
      loadCargos(cargosPage, filtrosCargos);
    } catch (error) {
      setError(handleApiError(error));
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
                          <TableCell>{infraccion.tipo_infraccion_display || '-'}</TableCell>
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
                            {infraccion.monto_multa ? formatCurrency(infraccion.monto_multa) : '-'}
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
                    setSelectedConfig(null);
                    setOpenConfigDialog(true);
                  }}
                >
                  Nueva Configuración
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadConfiguracionMultas}
                >
                  Actualizar
                </Button>
              </Stack>
            </Box>

            {configLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo de Infracción</TableCell>
                      <TableCell>Monto Base</TableCell>
                      <TableCell>Monto Reincidencia</TableCell>
                      <TableCell>Días para Pago</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configuracionMultas?.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>{config.tipo_infraccion_display || '-'}</TableCell>
                        <TableCell>{config.monto_base ? formatCurrency(config.monto_base) : '-'}</TableCell>
                        <TableCell>{config.monto_reincidencia ? formatCurrency(config.monto_reincidencia) : '-'}</TableCell>
                        <TableCell>{config.dias_para_pago ? `${config.dias_para_pago} días` : '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={config.es_activa ? 'Activa' : 'Inactiva'}
                            color={config.es_activa ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedConfig(config);
                                setOpenConfigDialog(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Panel de Reportes */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Reportes y Estadísticas
            </Typography>
            <Typography color="text.secondary">
              Esta sección estará disponible próximamente...
            </Typography>
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
          onClose={() => setOpenConfigDialog(false)}
          configuracion={selectedConfig}
          onSuccess={() => {
            loadConfiguracionMultas();
            setOpenConfigDialog(false);
            setSuccess(selectedConfig ? 'Configuración actualizada' : 'Configuración creada');
          }}
        />
      )}
    </Box>
  );
};

export default FinancesManagement;