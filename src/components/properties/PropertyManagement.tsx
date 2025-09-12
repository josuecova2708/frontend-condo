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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  PersonOff,
  PersonAdd,
} from '@mui/icons-material';
import { UnidadHabitacional, UnidadFormData } from '../../types';
import { propertyService, handleApiError } from '../../services/api';
import UnidadForm from './UnidadForm';


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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PropertyManagement: React.FC = () => {
  const [unidades, setUnidades] = useState<UnidadHabitacional[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedUnidad, setSelectedUnidad] = useState<UnidadHabitacional | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Datos mock para demostración (en producción vendría de la API)
  useEffect(() => {
    loadUnidades();
  }, []);

  const loadUnidades = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyService.getUnidades(1, searchTerm);
      setUnidades(response.results);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadUnidades();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Función para abrir formulario de crear unidad
  const handleCreateUnidad = () => {
    setSelectedUnidad(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Función para abrir formulario de editar unidad
  const handleEditUnidad = (unidad: UnidadHabitacional) => {
    setSelectedUnidad(unidad);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Función para confirmar eliminación de unidad
  const handleDeleteUnidad = (unidad: UnidadHabitacional) => {
    setSelectedUnidad(unidad);
    setIsDeleteDialogOpen(true);
  };

  // Función para eliminar unidad
  const confirmDeleteUnidad = async () => {
    if (!selectedUnidad) return;

    try {
      setActionLoading(true);
      await propertyService.deleteUnidad(selectedUnidad.id);
      setIsDeleteDialogOpen(false);
      setSelectedUnidad(null);
      await loadUnidades();
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Función para cambiar estado de la unidad
  const handleToggleUnidadStatus = async (unidad: UnidadHabitacional) => {
    try {
      setActionLoading(true);
      await propertyService.toggleUnidadStatus(unidad.id);
      await loadUnidades();
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Función para manejar el envío del formulario
  const handleFormSubmit = async (formData: UnidadFormData) => {
    try {
      setActionLoading(true);
      
      if (formMode === 'create') {
        await propertyService.createUnidad(formData);
      } else if (selectedUnidad) {
        await propertyService.updateUnidad(selectedUnidad.id, formData);
      }
      
      setIsFormOpen(false);
      setSelectedUnidad(null);
      await loadUnidades();
    } catch (error) {
      throw error; // El error se maneja en el formulario
    } finally {
      setActionLoading(false);
    }
  };

  // Función para cerrar formulario
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedUnidad(null);
  };

  // Filtrar unidades por término de búsqueda
  const filteredUnidades = unidades.filter(unidad =>
    unidad.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (unidad.bloque_nombre && unidad.bloque_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (unidad.direccion_completa && unidad.direccion_completa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      {/* Encabezado */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                  Gestión de Propiedades
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateUnidad}
                  disabled={loading}
                >
                  Nueva Unidad
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Administra las unidades habitacionales, propietarios y residentes del condominio.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="property management tabs">
            <Tab 
              icon={<HomeIcon />} 
              label="Unidades" 
              id="simple-tab-0"
              aria-controls="simple-tabpanel-0"
            />
            <Tab 
              icon={<PersonIcon />} 
              label="Propietarios" 
              id="simple-tab-1"
              aria-controls="simple-tabpanel-1"
            />
            <Tab 
              icon={<PersonIcon />} 
              label="Residentes" 
              id="simple-tab-2"
              aria-controls="simple-tabpanel-2"
            />
            <Tab 
              icon={<HistoryIcon />} 
              label="Historial" 
              id="simple-tab-3"
              aria-controls="simple-tabpanel-3"
            />
          </Tabs>
        </Box>

        {/* Panel de Unidades */}
        <TabPanel value={tabValue} index={0}>
          {/* Controles de búsqueda */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por número de unidad, bloque o dirección..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={handleSearch}
                      disabled={loading}
                    >
                      Buscar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={loadUnidades}
                      disabled={loading}
                    >
                      Actualizar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Mostrar error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Tabla de unidades */}
          <Card>
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Unidad</TableCell>
                      <TableCell>Ubicación</TableCell>
                      <TableCell>Detalles</TableCell>
                      <TableCell>Características</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : filteredUnidades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No se encontraron unidades habitacionales
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUnidades.map((unidad) => (
                        <TableRow key={unidad.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">
                                {unidad.numero}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {unidad.tipo}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {unidad.bloque_nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Piso {unidad.piso}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {unidad.area_m2} m²
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {unidad.num_habitaciones} hab, {unidad.num_banos} baños
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {unidad.tiene_balcon && (
                                <Chip label="Balcón" size="small" color="info" />
                              )}
                              {unidad.tiene_parqueadero && (
                                <Chip label="Parqueadero" size="small" color="success" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={unidad.is_active ? 'Activo' : 'Inactivo'}
                              size="small"
                              color={unidad.is_active ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Editar unidad">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditUnidad(unidad)}
                                  disabled={actionLoading}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title={unidad.is_active ? 'Desactivar unidad' : 'Activar unidad'}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleUnidadStatus(unidad)}
                                  disabled={actionLoading}
                                  color={unidad.is_active ? 'error' : 'success'}
                                >
                                  {unidad.is_active ? <PersonOff /> : <PersonAdd />}
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Eliminar unidad">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteUnidad(unidad)}
                                  disabled={actionLoading}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Panel de Propietarios */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Gestión de Propietarios
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Funcionalidad disponible en próxima versión
            </Typography>
          </Box>
        </TabPanel>

        {/* Panel de Residentes */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Gestión de Residentes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Funcionalidad disponible en próxima versión
            </Typography>
          </Box>
        </TabPanel>

        {/* Panel de Historial */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Historial de Propietarios
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Funcionalidad disponible en próxima versión
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Formulario de unidad */}
      <UnidadForm
        open={isFormOpen}
        mode={formMode}
        unidad={selectedUnidad}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
        loading={actionLoading}
      />

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la unidad <strong>{selectedUnidad?.numero}</strong> 
            del bloque <strong>{selectedUnidad?.bloque_nombre}</strong>?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDeleteUnidad}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyManagement;