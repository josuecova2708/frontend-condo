import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Security as SecurityIcon,
  DirectionsCar as CarIcon,
  Search as SearchIcon,
  List as ListIcon,
  Assessment as LogsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  School as TrainIcon,
} from '@mui/icons-material';
import VehicleOCR from '../components/security/VehicleOCR';
import VehicleRegistrationForm from '../components/security/VehicleRegistrationForm';
import vehicleService, { Vehicle, VehicleAccessLog, OCRResult } from '../services/vehicleService';

const VehiclePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'ocr' | 'vehicles' | 'logs'>('register');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [accessLogs, setAccessLogs] = useState<VehicleAccessLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para corrección manual
  const [correctionDialog, setCorrectionDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VehicleAccessLog | null>(null);
  const [correctPlate, setCorrectPlate] = useState('');
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (activeTab === 'vehicles') {
      loadVehicles();
    } else if (activeTab === 'logs') {
      loadAccessLogs();
    }
  }, [activeTab]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccessLogs = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getAccessLogs();
      setAccessLogs(data);
    } catch (error) {
      console.error('Error loading access logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOCRResult = (result: OCRResult) => {
    console.log('OCR Result:', result);
    // Recargar logs si estamos en esa pestaña
    if (activeTab === 'logs') {
      loadAccessLogs();
    }
  };

  const handleVehicleRegistered = (vehicle: Vehicle) => {
    console.log('Vehicle registered:', vehicle);
    // Recargar vehículos si estamos en esa pestaña
    if (activeTab === 'vehicles') {
      loadVehicles();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getResultBadge = (resultado: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (resultado) {
      case 'autorizado':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'denegado':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  // Funciones para corrección manual
  const handleCorrectPlate = (log: VehicleAccessLog) => {
    setSelectedLog(log);
    setCorrectPlate(log.placa_detectada || '');
    setCorrectionDialog(true);
  };

  const handleSaveCorrection = async () => {
    if (!selectedLog || !correctPlate.trim()) {
      setSnackbar({ open: true, message: 'Por favor ingrese la placa correcta', severity: 'error' });
      return;
    }

    setTrainingLoading(true);
    try {
      await vehicleService.trainOCR(selectedLog.id, correctPlate.trim());
      setSnackbar({
        open: true,
        message: 'Corrección guardada exitosamente. El OCR aprenderá de este ejemplo.',
        severity: 'success'
      });
      setCorrectionDialog(false);
      setCorrectPlate('');
      setSelectedLog(null);
    } catch (error) {
      console.error('Error saving correction:', error);
      setSnackbar({ open: true, message: 'Error al guardar la corrección', severity: 'error' });
    } finally {
      setTrainingLoading(false);
    }
  };

  const handleCloseCorrectionDialog = () => {
    setCorrectionDialog(false);
    setCorrectPlate('');
    setSelectedLog(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SecurityIcon sx={{ mr: 1, fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Gestión de Seguridad Vehicular
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Sistema de reconocimiento OCR y gestión de acceso vehicular
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<AddIcon />} label="Registrar Vehículo" value="register" />
          <Tab icon={<SearchIcon />} label="Reconocimiento OCR" value="ocr" />
          <Tab icon={<ListIcon />} label="Vehículos Registrados" value="vehicles" />
          <Tab icon={<LogsIcon />} label="Logs de Acceso" value="logs" />
        </Tabs>
      </Card>

      {/* Content */}
      <Box>

        {/* Register Tab */}
        {activeTab === 'register' && (
          <VehicleRegistrationForm onVehicleRegistered={handleVehicleRegistered} />
        )}

        {/* OCR Tab */}
        {activeTab === 'ocr' && (
          <VehicleOCR onResult={handleOCRResult} />
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Vehículos Registrados
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setActiveTab('register')}
              >
                Registrar Nuevo
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Cargando vehículos...</Typography>
              </Box>
            ) : vehicles.length > 0 ? (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Placa</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Marca</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Modelo</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Color</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Registro</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CarIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                              {vehicle.placa}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{vehicle.marca || '-'}</TableCell>
                        <TableCell>{vehicle.modelo || '-'}</TableCell>
                        <TableCell>{vehicle.color || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={vehicle.is_active ? 'Activo' : 'Inactivo'}
                            color={vehicle.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(vehicle.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CarIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay vehículos registrados
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Comience registrando su primer vehículo
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setActiveTab('register')}
                >
                  Registrar Primer Vehículo
                </Button>
              </Box>
            )}
          </Card>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Logs de Acceso Vehicular
            </Typography>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Cargando logs...</Typography>
              </Box>
            ) : accessLogs.length > 0 ? (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'secondary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha/Hora</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Placa Detectada</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Confianza OCR</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Resultado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vehículo</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accessLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formatDate(log.timestamp_evento)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {log.placa_detectada || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.confianza_ocr ? `${Number(log.confianza_ocr).toFixed(1)}%` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.resultado.toUpperCase()}
                            color={
                              log.resultado === 'autorizado' ? 'success' :
                              log.resultado === 'denegado' ? 'error' : 'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {log.vehicle_info ? (
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {log.vehicle_info.placa}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.vehicle_info.marca} {log.vehicle_info.modelo}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No registrado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Corregir placa para entrenar OCR">
                            <IconButton
                              size="small"
                              onClick={() => handleCorrectPlate(log)}
                              color="primary"
                            >
                              <TrainIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <LogsIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay logs de acceso
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Los registros aparecerán cuando se procesen imágenes con OCR
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={() => setActiveTab('ocr')}
                  color="secondary"
                >
                  Procesar Primera Imagen
                </Button>
              </Box>
            )}
          </Card>
        )}

      </Box>

      {/* Diálogo de corrección manual */}
      <Dialog open={correctionDialog} onClose={handleCloseCorrectionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrainIcon sx={{ mr: 1, color: 'primary.main' }} />
            Entrenar OCR - Corregir Placa
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              El OCR detectó: <strong>{selectedLog?.placa_detectada || 'N/A'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ingrese la placa correcta para entrenar el modelo:
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Placa Correcta"
              type="text"
              fullWidth
              variant="outlined"
              value={correctPlate}
              onChange={(e) => setCorrectPlate(e.target.value.toUpperCase())}
              placeholder="Ej: 4497-LYB"
              helperText="Formato: 1234-ABC, 123-ABC o ABC-123"
              inputProps={{
                style: { fontFamily: 'monospace', fontWeight: 'bold' }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCorrectionDialog}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveCorrection}
            variant="contained"
            disabled={trainingLoading || !correctPlate.trim()}
          >
            {trainingLoading ? <CircularProgress size={20} /> : 'Guardar Corrección'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VehiclePage;