import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Fab,
  Tooltip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Pool as PoolIcon,
  EventAvailable as EventIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`areas-tabpanel-${index}`}
      aria-labelledby={`areas-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface AreaComun {
  id: number;
  nombre: string;
  estado: string;
  estado_display: string;
  precio_base: string;
  moneda: string;
  esta_disponible: boolean;
  created_at: string;
  updated_at: string;
}

interface ReservaArea {
  id: number;
  area: number;
  area_nombre: string;
  propietario: number;
  propietario_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  estado_display: string;
  precio_total: string;
  moneda: string;
  duracion_horas: number;
  created_at: string;
  updated_at: string;
}

const AreasComunes: React.FC = () => {
  const { token } = useAuth();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [areas, setAreas] = useState<AreaComun[]>([]);
  const [reservas, setReservas] = useState<ReservaArea[]>([]);
  const [propietarios, setPropietarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaComun | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<AreaComun | null>(null);
  const [openReservaForm, setOpenReservaForm] = useState(false);
  const [editingReserva, setEditingReserva] = useState<ReservaArea | null>(null);
  const [reservaFormData, setReservaFormData] = useState({
    area: '',
    fecha_inicio: '',
    fecha_fin: '',
    propietario: '',
    estado: 'pendiente'
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReserva, setSelectedReserva] = useState<ReservaArea | null>(null);
  const [openAreaForm, setOpenAreaForm] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaComun | null>(null);
  const [areaFormData, setAreaFormData] = useState({
    nombre: '',
    estado: 'disponible',
    precio_base: '',
    moneda: 'BOB'
  });

  const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

  // Efecto para leer el parámetro de URL y cambiar pestaña
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'reservas') {
      setTabValue(1);
    } else {
      setTabValue(0);
    }
  }, [location.search]);

  useEffect(() => {
    if (tabValue === 0) {
      fetchAreas();
    } else if (tabValue === 1) {
      fetchReservas();
    }
  }, [tabValue, token]);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/areas-comunes/areas/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAreas(data.results || data);
      } else {
        const errorData = await response.text();
        console.error('Server error response:', errorData);
        throw new Error(`Error al cargar áreas comunes: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar las áreas comunes',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/areas-comunes/reservas/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReservas(data.results || data);
      } else {
        throw new Error('Error al cargar reservas');
      }
    } catch (error) {
      console.error('Error fetching reservas:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar las reservas',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPropietarios = async () => {
    try {
      const response = await fetch(`${baseUrl}/properties/propietarios/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const propietariosData = data.results || data;
        setPropietarios(propietariosData);
      } else {
        console.warn('Error al cargar propietarios');
        setSnackbar({
          open: true,
          message: 'Error al cargar la lista de propietarios',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching propietarios:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar propietarios',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      // Estados de áreas
      case 'disponible':
        return 'success';
      case 'mantenimiento':
        return 'warning';
      case 'fuera_de_servicio':
        return 'error';
      case 'reservado':
        return 'info';
      // Estados de reservas
      case 'pendiente':
        return 'warning';
      case 'confirmada':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    const symbol = currency === 'BOB' ? 'Bs.' : '$';
    return `${symbol} ${parseFloat(amount).toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Funciones para manejar áreas
  const handleOpenAreaForm = (area?: AreaComun) => {
    if (area) {
      setEditingArea(area);
      setAreaFormData({
        nombre: area.nombre,
        estado: area.estado,
        precio_base: area.precio_base.toString(),
        moneda: area.moneda
      });
    } else {
      setEditingArea(null);
      setAreaFormData({
        nombre: '',
        estado: 'disponible',
        precio_base: '',
        moneda: 'BOB'
      });
    }
    setOpenAreaForm(true);
  };

  const handleCloseAreaForm = () => {
    setOpenAreaForm(false);
    setEditingArea(null);
    setAreaFormData({
      nombre: '',
      estado: 'disponible',
      precio_base: '',
      moneda: 'BOB'
    });
  };

  const handleAreaFormChange = (field: string, value: string) => {
    setAreaFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitArea = async () => {
    try {
      setLoading(true);

      const payload = {
        nombre: areaFormData.nombre,
        estado: areaFormData.estado,
        precio_base: parseFloat(areaFormData.precio_base),
        moneda: areaFormData.moneda
      };

      const url = editingArea
        ? `${baseUrl}/areas-comunes/areas/${editingArea.id}/`
        : `${baseUrl}/areas-comunes/areas/`;

      const method = editingArea ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: editingArea ? 'Área actualizada exitosamente' : 'Área creada exitosamente',
          severity: 'success'
        });
        handleCloseAreaForm();
        fetchAreas(); // Recargar la lista
      } else {
        throw new Error('Error al guardar el área');
      }
    } catch (error) {
      console.error('Error saving area:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el área',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funciones para eliminar área
  const handleOpenDeleteConfirm = (area: AreaComun) => {
    setAreaToDelete(area);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setAreaToDelete(null);
  };

  const handleDeleteArea = async () => {
    if (!areaToDelete) return;

    try {
      setLoading(true);

      const response = await fetch(`${baseUrl}/areas-comunes/areas/${areaToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Área eliminada exitosamente',
          severity: 'success'
        });
        handleCloseDeleteConfirm();
        fetchAreas(); // Recargar la lista
      } else {
        throw new Error('Error al eliminar el área');
      }
    } catch (error) {
      console.error('Error deleting area:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el área',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar reservas
  const handleOpenReservaForm = (reserva?: ReservaArea) => {
    if (reserva) {
      setEditingReserva(reserva);
      setReservaFormData({
        area: reserva.area.toString(),
        fecha_inicio: reserva.fecha_inicio.slice(0, 16), // formato datetime-local
        fecha_fin: reserva.fecha_fin.slice(0, 16),
        propietario: reserva.propietario.toString(),
        estado: reserva.estado
      });
    } else {
      setEditingReserva(null);
      setReservaFormData({
        area: '',
        fecha_inicio: '',
        fecha_fin: '',
        propietario: '',
        estado: 'pendiente'
      });
    }
    fetchPropietarios(); // Cargar propietarios al abrir el formulario
    setOpenReservaForm(true);
  };

  const handleCloseReservaForm = () => {
    setOpenReservaForm(false);
    setEditingReserva(null);
    setReservaFormData({
      area: '',
      fecha_inicio: '',
      fecha_fin: '',
      propietario: '',
      estado: 'pendiente'
    });
  };

  const handleReservaFormChange = (field: string, value: string) => {
    setReservaFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitReserva = async () => {
    try {
      setLoading(true);

      const payload = {
        area: parseInt(reservaFormData.area),
        fecha_inicio: reservaFormData.fecha_inicio,
        fecha_fin: reservaFormData.fecha_fin,
        propietario: parseInt(reservaFormData.propietario),
        estado: reservaFormData.estado
      };

      const url = editingReserva
        ? `${baseUrl}/areas-comunes/reservas/${editingReserva.id}/`
        : `${baseUrl}/areas-comunes/reservas/`;

      const method = editingReserva ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: editingReserva ? 'Reserva actualizada exitosamente' : 'Reserva creada exitosamente',
          severity: 'success'
        });
        handleCloseReservaForm();
        fetchReservas(); // Recargar la lista
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error creating reserva:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al crear la reserva',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funciones para el menú de acciones
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, reserva: ReservaArea) => {
    setAnchorEl(event.currentTarget);
    setSelectedReserva(reserva);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReserva(null);
  };

  const handleChangeEstadoReserva = async (nuevoEstado: string) => {
    if (!selectedReserva) return;

    try {
      setLoading(true);

      const response = await fetch(`${baseUrl}/areas-comunes/reservas/${selectedReserva.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Reserva ${nuevoEstado} exitosamente`,
          severity: 'success'
        });
        fetchReservas(); // Recargar la lista
      } else {
        throw new Error('Error al cambiar el estado de la reserva');
      }
    } catch (error) {
      console.error('Error changing reserva estado:', error);
      setSnackbar({
        open: true,
        message: 'Error al cambiar el estado de la reserva',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          CU13 - Configurar Disponibilidad de Instalaciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de áreas comunes y reservas del condominio
        </Typography>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PoolIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Áreas
                  </Typography>
                  <Typography variant="h5">
                    {areas.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ color: 'success.main', mr: 1 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Disponibles
                  </Typography>
                  <Typography variant="h5">
                    {areas.filter(a => a.estado === 'disponible').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ color: 'info.main', mr: 1 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Reservas Activas
                  </Typography>
                  <Typography variant="h5">
                    {reservas.filter(r => r.estado === 'confirmada').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    En Mantenimiento
                  </Typography>
                  <Typography variant="h5">
                    {areas.filter(a => a.estado === 'mantenimiento').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Áreas Comunes" />
            <Tab label="Reservas" />
            <Tab label="Estadísticas" />
          </Tabs>
        </Box>

        {/* Panel de Áreas Comunes */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Áreas Comunes</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAreaForm()}
            >
              Nueva Área
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Precio Base</TableCell>
                  <TableCell>Moneda</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {areas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {area.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={area.estado_display}
                        color={getEstadoColor(area.estado) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatCurrency(area.precio_base, area.moneda)}
                    </TableCell>
                    <TableCell>{area.moneda === 'BOB' ? 'Bolivianos' : 'Dólares'}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedArea(area);
                            setOpenDialog(true);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenAreaForm(area)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleOpenDeleteConfirm(area)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Panel de Reservas */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Reservas</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenReservaForm()}
            >
              Nueva Reserva
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Área</TableCell>
                  <TableCell>Propietario</TableCell>
                  <TableCell>Fecha/Hora</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservas.map((reserva) => (
                  <TableRow key={reserva.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{reserva.area_nombre}</Typography>
                    </TableCell>
                    <TableCell>{reserva.propietario_nombre}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatDateTime(reserva.fecha_inicio)}
                        </Typography>
                        <Typography variant="body2">
                          {formatDateTime(reserva.fecha_fin)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{reserva.duracion_horas}h</TableCell>
                    <TableCell>
                      <Chip
                        label={reserva.estado_display}
                        color={getEstadoColor(reserva.estado) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatCurrency(reserva.precio_total, reserva.moneda)}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenReservaForm(reserva)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Acciones">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, reserva)}
                          disabled={reserva.estado === 'cancelada'}
                        >
                          <ArrowDownIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Panel de Estadísticas */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Estadísticas de Áreas Comunes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Próximamente: Gráficos y reportes detallados
          </Typography>
        </TabPanel>
      </Paper>

      {/* Dialog de detalles del área */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalles del Área: {selectedArea?.nombre}
        </DialogTitle>
        <DialogContent>
          {selectedArea && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>Estado:</strong> {selectedArea.estado_display}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>Precio:</strong> {formatCurrency(selectedArea.precio_base, selectedArea.moneda)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>Moneda:</strong> {selectedArea.moneda === 'BOB' ? 'Bolivianos' : 'Dólares'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>Disponible:</strong> {selectedArea.esta_disponible ? 'Sí' : 'No'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>Creado:</strong> {formatDateTime(selectedArea.created_at)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>Actualizado:</strong> {formatDateTime(selectedArea.updated_at)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenDialog(false);
              handleOpenAreaForm(selectedArea!);
            }}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear/editar área */}
      <Dialog open={openAreaForm} onClose={handleCloseAreaForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingArea ? 'Editar Área' : 'Nueva Área'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nombre del área"
              value={areaFormData.nombre}
              onChange={(e) => handleAreaFormChange('nombre', e.target.value)}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={areaFormData.estado}
                label="Estado"
                onChange={(e) => handleAreaFormChange('estado', e.target.value)}
              >
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="mantenimiento">En Mantenimiento</MenuItem>
                <MenuItem value="fuera_de_servicio">Fuera de Servicio</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Precio base"
              type="number"
              value={areaFormData.precio_base}
              onChange={(e) => handleAreaFormChange('precio_base', e.target.value)}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />

            <FormControl fullWidth>
              <InputLabel>Moneda</InputLabel>
              <Select
                value={areaFormData.moneda}
                label="Moneda"
                onChange={(e) => handleAreaFormChange('moneda', e.target.value)}
              >
                <MenuItem value="BOB">Bolivianos (Bs.)</MenuItem>
                <MenuItem value="USD">Dólares ($)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAreaForm}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmitArea}
            disabled={loading || !areaFormData.nombre || !areaFormData.precio_base}
          >
            {editingArea ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear reserva */}
      <Dialog open={openReservaForm} onClose={handleCloseReservaForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReserva ? 'Editar Reserva' : 'Nueva Reserva'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Área Común</InputLabel>
              <Select
                value={reservaFormData.area}
                label="Área Común"
                onChange={(e) => handleReservaFormChange('area', e.target.value)}
              >
                {areas.filter(area => area.esta_disponible).map((area) => (
                  <MenuItem key={area.id} value={area.id.toString()}>
                    {area.nombre} - {formatCurrency(area.precio_base, area.moneda)}/hora
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Fecha y Hora de Inicio"
              type="datetime-local"
              value={reservaFormData.fecha_inicio}
              onChange={(e) => handleReservaFormChange('fecha_inicio', e.target.value)}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Fecha y Hora de Fin"
              type="datetime-local"
              value={reservaFormData.fecha_fin}
              onChange={(e) => handleReservaFormChange('fecha_fin', e.target.value)}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Propietario</InputLabel>
              <Select
                value={reservaFormData.propietario}
                label="Propietario"
                onChange={(e) => handleReservaFormChange('propietario', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Selecciona un propietario</em>
                </MenuItem>
                {propietarios.map((item, index) => {
                  // La estructura real: item.propietario contiene los datos
                  const propietario = item.propietario || item;
                  const id = propietario.id || item.id || index;

                  // Obtener el nombre y email de la estructura real
                  const fullName = propietario.user_full_name || '';
                  const email = propietario.user_email || '';
                  const telefono = propietario.user_telefono || '';
                  const unidadInfo = propietario.unidad_numero ? `Unidad ${propietario.unidad_numero}` : '';
                  const bloqueInfo = propietario.bloque_nombre ? `${propietario.bloque_nombre}` : '';

                  const displayName = fullName || `Usuario ${id}`;
                  const extraInfo = unidadInfo && bloqueInfo ? `${unidadInfo} - ${bloqueInfo}` : (unidadInfo || bloqueInfo);

                  return (
                    <MenuItem key={id} value={id.toString()}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {displayName}
                        </Typography>
                        {extraInfo && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {extraInfo}
                          </Typography>
                        )}
                        {email && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {email} {telefono && `• ${telefono}`}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Estado de la Reserva</InputLabel>
              <Select
                value={reservaFormData.estado}
                label="Estado de la Reserva"
                onChange={(e) => handleReservaFormChange('estado', e.target.value)}
              >
                <MenuItem value="pendiente">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'warning.main' }} />
                    Pendiente
                  </Box>
                </MenuItem>
                <MenuItem value="confirmada">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'success.main' }} />
                    Confirmada
                  </Box>
                </MenuItem>
                <MenuItem value="cancelada">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'error.main' }} />
                    Cancelada
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReservaForm}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReserva}
            disabled={loading || !reservaFormData.area || !reservaFormData.fecha_inicio || !reservaFormData.fecha_fin || !reservaFormData.propietario}
          >
            {editingReserva ? 'Actualizar Reserva' : 'Crear Reserva'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el área "{areaToDelete?.nombre}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer y eliminará todas las reservas asociadas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteArea}
            disabled={loading}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menú de acciones para reservas */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedReserva?.estado === 'pendiente' && (
          <MenuItem onClick={() => handleChangeEstadoReserva('confirmada')}>
            <ListItemIcon>
              <CheckIcon sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText>Confirmar Reserva</ListItemText>
          </MenuItem>
        )}
        {(selectedReserva?.estado === 'pendiente' || selectedReserva?.estado === 'confirmada') && (
          <MenuItem onClick={() => handleChangeEstadoReserva('cancelada')}>
            <ListItemIcon>
              <CancelIcon sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Cancelar Reserva</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AreasComunes;