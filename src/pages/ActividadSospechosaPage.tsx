import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  VideoFile as VideoFileIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  DirectionsCar as CarIcon,
  Pets as PetsIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  NotificationImportant as AlertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

interface Camera {
  id: string;
  name: string;
  description: string;
  location: string;
}

interface Video {
  key: string;
  name: string;
  size: number;
  last_modified: string;
  url: string;
}

interface Analisis {
  id: number;
  camera_id: string;
  video_name: string;
  video_url: string;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR';
  estado_display: string;
  job_id?: string;
  iniciado_at: string;
  completado_at?: string;
  usuario_nombre: string;
  actividades_detectadas: number;
  confianza_promedio?: number;
  error_mensaje?: string;
  detecciones: DeteccionActividad[];
}

interface DeteccionActividad {
  id: number;
  tipo_actividad: {
    id: number;
    nombre: string;
    categoria: string;
    categoria_display: string;
    descripcion: string;
  };
  timestamp_inicio: number;
  timestamp_fin: number;
  duracion_segundos: number;
  confianza: number;
  objetos_detectados: string[];
  aviso_generado: boolean;
  aviso_id?: number;
  created_at: string;
}

interface TipoActividad {
  id: number;
  nombre: string;
  categoria: string;
  categoria_display: string;
  descripcion: string;
  palabras_clave: string;
  activo: boolean;
}

interface Estadisticas {
  total_analisis: number;
  analisis_completados: number;
  analisis_procesando: number;
  total_detecciones: number;
  detecciones_por_categoria: Record<string, number>;
  confianza_promedio: number;
  avisos_generados: number;
}

const ActividadSospechosaPage: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [analisis, setAnalisis] = useState<Analisis[]>([]);
  const [selectedAnalisis, setSelectedAnalisis] = useState<Analisis | null>(null);
  const [tiposActividad, setTiposActividad] = useState<TipoActividad[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);

  const [loading, setLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [analisisLoading, setAnalisisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [analisisDialogOpen, setAnalisisDialogOpen] = useState(false);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);

  // Obtener token de autenticación
  const getAuthToken = () => localStorage.getItem('access_token');

  // Headers para requests
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Obtener lista de cámaras
  const fetchCameras = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/cameras/list_cameras/`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCameras(data.cameras);
      } else {
        setError(data.error || 'Error al cargar cámaras');
      }
    } catch (err) {
      setError(`Error al conectar con el servidor: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Obtener videos de una cámara específica
  const fetchVideos = async (cameraId: string) => {
    setVideosLoading(true);
    setVideoError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/cameras/list_videos/?camera_id=${cameraId}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setVideos(data.videos);
      } else {
        setVideoError(data.error || 'Error al cargar videos');
      }
    } catch (err) {
      setVideoError(`Error al conectar con el servidor: ${err}`);
    } finally {
      setVideosLoading(false);
    }
  };

  // Obtener análisis del usuario
  const fetchAnalisis = async () => {
    setAnalisisLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/actividad-sospechosa/mis_analisis/`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalisis(data.analisis);
      }
    } catch (err) {
      console.error('Error al cargar análisis:', err);
    } finally {
      setAnalisisLoading(false);
    }
  };

  // Obtener tipos de actividad
  const fetchTiposActividad = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/actividad-sospechosa/tipos_actividad/`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success) {
        setTiposActividad(data.tipos_actividad);
      }
    } catch (err) {
      console.error('Error al cargar tipos de actividad:', err);
    }
  };

  // Obtener estadísticas
  const fetchEstadisticas = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/actividad-sospechosa/estadisticas/`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success) {
        setEstadisticas(data.estadisticas);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // Iniciar análisis de video
  const iniciarAnalisis = async () => {
    if (!selectedCamera || !selectedVideo) {
      setError('Debe seleccionar una cámara y un video');
      return;
    }

    setAnalisisLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/actividad-sospechosa/iniciar_analisis/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          camera_id: selectedCamera.id,
          video_name: selectedVideo.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalisisDialogOpen(false);
        await fetchAnalisis();
        alert('Análisis iniciado exitosamente. Los resultados estarán disponibles en unos minutos.');
      } else {
        setError(data.error || 'Error al iniciar análisis');
      }
    } catch (err) {
      setError(`Error al iniciar análisis: ${err}`);
    } finally {
      setAnalisisLoading(false);
    }
  };

  // Verificar estado de análisis
  const verificarEstado = async (analisisId: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/actividad-sospechosa/${analisisId}/verificar_estado/`, {
        method: 'POST',
        headers: getHeaders(),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success) {
        await fetchAnalisis();
      }
    } catch (err) {
      console.error('Error al verificar estado:', err);
    }
  };

  // Ver detalle de análisis
  const verDetalle = async (analisisId: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/actividad-sospechosa/${analisisId}/detalle_analisis/`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success) {
        setSelectedAnalisis(data.analisis);
        setDetalleDialogOpen(true);
      }
    } catch (err) {
      console.error('Error al cargar detalle:', err);
    }
  };

  // Generar aviso para detección
  const generarAviso = async (deteccionId: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/actividad-sospechosa/${deteccionId}/generar_aviso/`, {
        method: 'POST',
        headers: getHeaders(),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success) {
        alert('Aviso generado exitosamente');
        if (selectedAnalisis) {
          verDetalle(selectedAnalisis.id);
        }
      } else {
        alert(data.error || 'Error al generar aviso');
      }
    } catch (err) {
      console.error('Error al generar aviso:', err);
    }
  };

  // Manejar selección de cámara
  const handleCameraSelect = (camera: Camera) => {
    setSelectedCamera(camera);
    setVideos([]);
    setSelectedVideo(null);
    fetchVideos(camera.id);
  };

  // Obtener ícono por categoría
  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'SOSPECHOSA':
        return <SecurityIcon color="error" />;
      case 'ACCIDENTE':
        return <CarIcon color="warning" />;
      case 'ANIMAL':
        return <PetsIcon color="info" />;
      default:
        return <WarningIcon />;
    }
  };

  // Obtener color por estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'success';
      case 'PROCESANDO':
        return 'warning';
      case 'ERROR':
        return 'error';
      default:
        return 'default';
    }
  };

  // Formatear duración
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  useEffect(() => {
    fetchCameras();
    fetchAnalisis();
    fetchTiposActividad();
    fetchEstadisticas();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Análisis de Actividades Sospechosas
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Detecta automáticamente actividades sospechosas, accidentes vehiculares y animales sueltos en videos de las cámaras de seguridad.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SearchIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{estadisticas.total_analisis}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Análisis
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{estadisticas.total_detecciones}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Detecciones
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AlertIcon color="error" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{estadisticas.avisos_generados}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avisos Generados
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h6">{estadisticas.confianza_promedio}%</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Confianza Promedio
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={() => setAnalisisDialogOpen(true)}
        >
          Nuevo Análisis
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchAnalisis}
        >
          Actualizar
        </Button>
      </Box>

      {/* Lista de Análisis */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Mis Análisis
          </Typography>

          {analisisLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : analisis.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No hay análisis disponibles. Inicia tu primer análisis de video.
              </Typography>
            </Box>
          ) : (
            <List>
              {analisis.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemIcon>
                      <VideoFileIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {item.video_name} - {item.camera_id.toUpperCase()}
                          </Typography>
                          <Chip
                            label={item.estado_display}
                            color={getEstadoColor(item.estado) as any}
                            size="small"
                          />
                          {item.actividades_detectadas > 0 && (
                            <Chip
                              label={`${item.actividades_detectadas} detecciones`}
                              color="warning"
                              size="small"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Iniciado: {formatDate(item.iniciado_at)}
                          </Typography>
                          {item.completado_at && (
                            <Typography variant="caption" display="block">
                              Completado: {formatDate(item.completado_at)}
                            </Typography>
                          )}
                          {item.confianza_promedio && (
                            <Typography variant="caption" display="block">
                              Confianza promedio: {item.confianza_promedio.toFixed(1)}%
                            </Typography>
                          )}
                          {item.error_mensaje && (
                            <Typography variant="caption" color="error" display="block">
                              Error: {item.error_mensaje}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {item.estado === 'PROCESANDO' && (
                        <Tooltip title="Verificar estado">
                          <IconButton
                            size="small"
                            onClick={() => verificarEstado(item.id)}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {item.estado === 'COMPLETADO' && (
                        <Tooltip title="Ver detalle">
                          <IconButton
                            size="small"
                            onClick={() => verDetalle(item.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Dialog para nuevo análisis */}
      <Dialog
        open={analisisDialogOpen}
        onClose={() => setAnalisisDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nuevo Análisis de Video</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, mt: 1 }}>
            {/* Selección de Cámara */}
            <Box sx={{ flex: '1 1 50%' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    1. Seleccionar Cámara
                  </Typography>

                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <List>
                      {cameras.map((camera) => (
                        <ListItem key={camera.id} disablePadding>
                          <ListItemButton
                            selected={selectedCamera?.id === camera.id}
                            onClick={() => handleCameraSelect(camera)}
                          >
                            <ListItemIcon>
                              <VideocamIcon color={selectedCamera?.id === camera.id ? 'inherit' : 'primary'} />
                            </ListItemIcon>
                            <ListItemText
                              primary={camera.name}
                              secondary={camera.location}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Selección de Video */}
            <Box sx={{ flex: '1 1 50%' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    2. Seleccionar Video
                  </Typography>

                  {!selectedCamera ? (
                    <Typography variant="body2" color="text.secondary">
                      Primero selecciona una cámara
                    </Typography>
                  ) : videosLoading ? (
                    <CircularProgress />
                  ) : videoError ? (
                    <Alert severity="error">{videoError}</Alert>
                  ) : videos.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No hay videos disponibles para esta cámara
                    </Typography>
                  ) : (
                    <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {videos.map((video) => (
                        <ListItem key={video.key} disablePadding>
                          <ListItemButton
                            selected={selectedVideo?.key === video.key}
                            onClick={() => setSelectedVideo(video)}
                          >
                            <ListItemIcon>
                              <VideoFileIcon color={selectedVideo?.key === video.key ? 'inherit' : 'primary'} />
                            </ListItemIcon>
                            <ListItemText
                              primary={video.name}
                              secondary={formatDate(video.last_modified)}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Información sobre tipos de actividades */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tipos de Actividades que se Detectan:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {tiposActividad.map((tipo) => (
                <Box key={tipo.id} sx={{ flex: '1 1 300px' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getCategoriaIcon(tipo.categoria)}
                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                          {tipo.categoria_display}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {tipo.descripcion}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalisisDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={iniciarAnalisis}
            variant="contained"
            disabled={!selectedCamera || !selectedVideo || analisisLoading}
          >
            {analisisLoading ? <CircularProgress size={20} /> : 'Iniciar Análisis'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para detalle de análisis */}
      <Dialog
        open={detalleDialogOpen}
        onClose={() => setDetalleDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Detalle del Análisis: {selectedAnalisis?.video_name}
        </DialogTitle>
        <DialogContent>
          {selectedAnalisis && (
            <Box>
              {/* Información general */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Box sx={{ flex: '1 1 250px' }}>
                  <Typography variant="subtitle2">Cámara:</Typography>
                  <Typography variant="body2">{selectedAnalisis.camera_id.toUpperCase()}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 250px' }}>
                  <Typography variant="subtitle2">Estado:</Typography>
                  <Chip
                    label={selectedAnalisis.estado_display}
                    color={getEstadoColor(selectedAnalisis.estado) as any}
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: '1 1 250px' }}>
                  <Typography variant="subtitle2">Actividades Detectadas:</Typography>
                  <Typography variant="body2">{selectedAnalisis.actividades_detectadas}</Typography>
                </Box>
                {selectedAnalisis.confianza_promedio && (
                  <Box sx={{ flex: '1 1 250px' }}>
                    <Typography variant="subtitle2">Confianza Promedio:</Typography>
                    <Typography variant="body2">{selectedAnalisis.confianza_promedio.toFixed(1)}%</Typography>
                  </Box>
                )}
              </Box>

              {/* Detecciones */}
              {selectedAnalisis.detecciones && selectedAnalisis.detecciones.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Detecciones Encontradas:
                  </Typography>
                  {selectedAnalisis.detecciones.map((deteccion, index) => (
                    <Accordion key={deteccion.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          {getCategoriaIcon(deteccion.tipo_actividad.categoria)}
                          <Box sx={{ ml: 2, flexGrow: 1 }}>
                            <Typography variant="subtitle2">
                              {deteccion.tipo_actividad.categoria_display}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDuration(deteccion.timestamp_inicio)} - {formatDuration(deteccion.timestamp_fin)}
                              ({deteccion.confianza.toFixed(1)}% confianza)
                            </Typography>
                          </Box>
                          {deteccion.aviso_generado ? (
                            <Chip label="Aviso Generado" color="success" size="small" />
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AlertIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                generarAviso(deteccion.id);
                              }}
                            >
                              Generar Aviso
                            </Button>
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ flex: '1 1 250px' }}>
                            <Typography variant="subtitle2">Descripción:</Typography>
                            <Typography variant="body2">{deteccion.tipo_actividad.descripcion}</Typography>
                          </Box>
                          <Box sx={{ flex: '1 1 250px' }}>
                            <Typography variant="subtitle2">Duración:</Typography>
                            <Typography variant="body2">{formatDuration(deteccion.duracion_segundos)}</Typography>
                          </Box>
                          <Box sx={{ flex: '1 1 100%' }}>
                            <Typography variant="subtitle2">Objetos Detectados:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {deteccion.objetos_detectados.map((objeto, idx) => (
                                <Chip key={idx} label={objeto} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetalleDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActividadSospechosaPage;