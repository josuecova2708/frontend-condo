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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Grid,
  Avatar,
} from '@mui/material';
import {
  FaceRetouchingNatural as FaceIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  List as ListIcon,
  Assessment as LogsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';

// Services
import facialRecognitionService, { PersonProfile, FacialAccessLog, FacialRecognitionResult } from '../services/facialRecognitionService';
import { userService } from '../services/api';
import { User } from '../types';

// Interfaces are imported from service

const FacialRecognitionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'identify' | 'profiles' | 'logs'>('register');
  const [profiles, setProfiles] = useState<PersonProfile[]>([]);
  const [accessLogs, setAccessLogs] = useState<FacialAccessLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para registro de persona
  const [registrationForm, setRegistrationForm] = useState({
    user_id: '',
    person_type: 'resident' as 'resident' | 'visitor' | 'employee' | 'delivery' | 'unknown',
    is_authorized: false,
    image: null as File | null,
  });

  // Estados para identificación
  const [identificationImage, setIdentificationImage] = useState<File | null>(null);
  const [identificationResult, setIdentificationResult] = useState<FacialRecognitionResult | null>(null);
  const [location, setLocation] = useState('Entrada Principal');

  // Estados para UI
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' | 'warning' });
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PersonProfile | null>(null);

  // Opciones de tipo de persona
  const personTypeOptions = [
    { value: 'resident', label: 'Residente' },
    { value: 'visitor', label: 'Visitante' },
    { value: 'employee', label: 'Empleado' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'unknown', label: 'Desconocido' },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'profiles') {
      loadProfiles();
    } else if (activeTab === 'logs') {
      loadAccessLogs();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers(1); // Primera página
      setUsers(response.results);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      showSnackbar('Error cargando usuarios', 'error');
    }
  };

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const profilesData: any = await facialRecognitionService.getProfiles();
      console.log('Profiles data received:', profilesData);

      // Asegurar que profilesData sea un array
      if (Array.isArray(profilesData)) {
        setProfiles(profilesData);
      } else if (profilesData && Array.isArray(profilesData.results)) {
        // Si viene paginado
        setProfiles(profilesData.results);
      } else {
        console.warn('Profiles data is not an array:', profilesData);
        setProfiles([]);
        showSnackbar('No se pudieron cargar los perfiles correctamente', 'warning');
      }
    } catch (error) {
      console.error('Error cargando perfiles:', error);
      showSnackbar('Error cargando perfiles', 'error');
      setProfiles([]); // Asegurar que profiles sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const loadAccessLogs = async () => {
    setLoading(true);
    try {
      const logsData: any = await facialRecognitionService.getAccessLogs();
      console.log('Access logs data received:', logsData);

      // Asegurar que logsData sea un array
      if (Array.isArray(logsData)) {
        setAccessLogs(logsData);
      } else if (logsData && Array.isArray(logsData.results)) {
        // Si viene paginado
        setAccessLogs(logsData.results);
      } else {
        console.warn('Access logs data is not an array:', logsData);
        setAccessLogs([]);
        showSnackbar('No se pudieron cargar los logs correctamente', 'warning');
      }
    } catch (error) {
      console.error('Error cargando logs de acceso:', error);
      showSnackbar('Error cargando logs de acceso', 'error');
      setAccessLogs([]); // Asegurar que accessLogs sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPerson = async () => {
    if (!registrationForm.user_id || !registrationForm.image) {
      showSnackbar('Por favor seleccione un usuario y suba una imagen', 'warning');
      return;
    }

    setLoading(true);
    try {
      const selectedUser = users.find(u => u.id.toString() === registrationForm.user_id);
      if (!selectedUser) {
        showSnackbar('Usuario no encontrado', 'error');
        return;
      }

      const registrationData = {
        imagen: registrationForm.image,
        name: `${selectedUser.first_name} ${selectedUser.last_name}`.trim(),
        person_type: registrationForm.person_type,
        is_authorized: registrationForm.is_authorized,
        user: selectedUser.id,
      };

      const response = await facialRecognitionService.registerPerson(registrationData);

      if (response.success) {
        showSnackbar('Persona registrada exitosamente', 'success');
        setRegistrationForm({
          user_id: '',
          person_type: 'resident',
          is_authorized: false,
          image: null,
        });

        if (activeTab === 'profiles') {
          loadProfiles();
        }
      } else {
        showSnackbar(response.error || 'Error registrando persona', 'error');
      }
    } catch (error) {
      console.error('Error registrando persona:', error);
      showSnackbar('Error registrando persona', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifyPerson = async () => {
    if (!identificationImage) {
      showSnackbar('Por favor seleccione una imagen', 'warning');
      return;
    }

    setLoading(true);
    try {
      const identificationData = {
        imagen: identificationImage,
        location: location,
      };

      const response = await facialRecognitionService.identifyPerson(identificationData);
      setIdentificationResult(response);

      if (response.success) {
        showSnackbar('Identificación completada', 'info');
      } else {
        showSnackbar(response.error || 'Error en la identificación', 'error');
      }

      if (activeTab === 'logs') {
        loadAccessLogs();
      }
    } catch (error) {
      console.error('Error identificando persona:', error);
      showSnackbar('Error identificando persona', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAuthorization = async (profileId: number) => {
    try {
      const response = await facialRecognitionService.toggleAuthorization(profileId);

      if (response.success) {
        showSnackbar(response.message, 'success');
        loadProfiles();
      } else {
        showSnackbar('Error actualizando autorización', 'error');
      }
    } catch (error) {
      console.error('Error actualizando autorización:', error);
      showSnackbar('Error actualizando autorización', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'registration' | 'identification') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'registration') {
        setRegistrationForm({ ...registrationForm, image: file });
      } else {
        setIdentificationImage(file);
        setIdentificationResult(null);
      }
    }
  };

  const renderRegistrationTab = () => (
    <Card sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Registrar Nueva Persona
      </Typography>

      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth required>
          <InputLabel>Seleccionar Usuario</InputLabel>
          <Select
            value={registrationForm.user_id}
            label="Seleccionar Usuario"
            onChange={(e) => setRegistrationForm({ ...registrationForm, user_id: e.target.value })}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id.toString()}>
                {`${user.first_name} ${user.last_name}`.trim()} ({user.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Tipo de persona</InputLabel>
          <Select
            value={registrationForm.person_type}
            label="Tipo de persona"
            onChange={(e) => setRegistrationForm({ ...registrationForm, person_type: e.target.value as any })}
          >
            {personTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={registrationForm.is_authorized}
              onChange={(e) => setRegistrationForm({ ...registrationForm, is_authorized: e.target.checked })}
            />
          }
          label="Persona autorizada"
        />

        <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="registration-photo-upload"
            type="file"
            onChange={(e) => handleImageUpload(e, 'registration')}
          />
          <label htmlFor="registration-photo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              sx={{ mb: 1 }}
            >
              Subir Foto
            </Button>
          </label>
          {registrationForm.image && (
            <Typography variant="body2" color="text.secondary">
              Archivo seleccionado: {registrationForm.image.name}
            </Typography>
          )}
          <Typography variant="caption" display="block" color="text.secondary">
            Formatos soportados: JPG, PNG, BMP (máx. 10MB)
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleRegisterPerson}
          disabled={loading || !registrationForm.user_id || !registrationForm.image}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Registrar Persona'}
        </Button>
      </Box>
    </Card>
  );

  const renderIdentificationTab = () => (
    <Card sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Identificar Persona
      </Typography>

      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Ubicación"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej: Entrada Principal, Puerta Norte, etc."
        />

        <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="identification-photo-upload"
            type="file"
            onChange={(e) => handleImageUpload(e, 'identification')}
          />
          <label htmlFor="identification-photo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              sx={{ mb: 1 }}
            >
              Subir Foto para Identificar
            </Button>
          </label>
          {identificationImage && (
            <Typography variant="body2" color="text.secondary">
              Archivo seleccionado: {identificationImage.name}
            </Typography>
          )}
          <Typography variant="caption" display="block" color="text.secondary">
            Formatos soportados: JPG, PNG, BMP (máx. 10MB)
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleIdentifyPerson}
          disabled={loading || !identificationImage}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Identificar Persona'}
        </Button>

        {identificationResult && (
          <Card sx={{ mt: 3, p: 2, bgcolor: identificationResult.access_granted ? 'success.light' : 'error.light' }}>
            <Typography variant="h6">
              Resultado de Identificación
            </Typography>
            <Typography variant="body1">
              <strong>Estado:</strong> {identificationResult.access_granted ? 'Autorizado' : 'Denegado'}
            </Typography>
            <Typography variant="body1">
              <strong>Confianza:</strong> {identificationResult.confidence}%
            </Typography>
            {identificationResult.person_profile && (
              <>
                <Typography variant="body1">
                  <strong>Persona:</strong> {identificationResult.person_profile.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Tipo:</strong> {identificationResult.person_profile.person_type_display}
                </Typography>
              </>
            )}
            <Typography variant="body2" sx={{ mt: 1 }}>
              {identificationResult.message}
            </Typography>
          </Card>
        )}
      </Box>
    </Card>
  );

  const renderProfilesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          <ListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Perfiles Registrados
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setActiveTab('register')}
        >
          Registrar Persona
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Foto</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Autorizado</TableCell>
                <TableCell>Fecha Registro</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay perfiles registrados
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <Avatar
                        src={profile.photo}
                        alt={profile.name}
                        sx={{ width: 40, height: 40 }}
                      />
                    </TableCell>
                    <TableCell>{profile.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={profile.person_type_display}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={profile.is_authorized ? 'Autorizado' : 'No Autorizado'}
                        size="small"
                        color={profile.is_authorized ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={profile.is_authorized ? 'Desautorizar' : 'Autorizar'}>
                        <IconButton
                          onClick={() => handleToggleAuthorization(profile.id)}
                          color={profile.is_authorized ? 'error' : 'success'}
                        >
                          {profile.is_authorized ? <CloseIcon /> : <CheckIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          onClick={() => {
                            setSelectedProfile(profile);
                            setEditDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderLogsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        <LogsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Historial de Accesos
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha/Hora</TableCell>
                <TableCell>Foto</TableCell>
                <TableCell>Persona</TableCell>
                <TableCell>Confianza</TableCell>
                <TableCell>Resultado</TableCell>
                <TableCell>Ubicación</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accessLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay logs de acceso
                  </TableCell>
                </TableRow>
              ) : (
                accessLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.timestamp_evento).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={log.photo}
                        alt="Intento de acceso"
                        sx={{ width: 40, height: 40 }}
                      />
                    </TableCell>
                    <TableCell>
                      {log.person_profile ? log.person_profile.name : log.detected_name || 'Desconocido'}
                    </TableCell>
                    <TableCell>
                      {log.confidence_score ? `${log.confidence_score}%` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.access_result_display}
                        size="small"
                        color={log.access_granted ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{log.location}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        <FaceIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Reconocimiento Facial
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab
            label="Registrar"
            value="register"
            icon={<PersonAddIcon />}
            iconPosition="start"
          />
          <Tab
            label="Identificar"
            value="identify"
            icon={<SearchIcon />}
            iconPosition="start"
          />
          <Tab
            label="Perfiles"
            value="profiles"
            icon={<ListIcon />}
            iconPosition="start"
          />
          <Tab
            label="Historial"
            value="logs"
            icon={<LogsIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {activeTab === 'register' && renderRegistrationTab()}
      {activeTab === 'identify' && renderIdentificationTab()}
      {activeTab === 'profiles' && renderProfilesTab()}
      {activeTab === 'logs' && renderLogsTab()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FacialRecognitionPage;