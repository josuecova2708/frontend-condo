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
  Divider,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  VideoFile as VideoFileIcon,
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

interface CameraVideosResponse {
  success: boolean;
  camera_id: string;
  videos: Video[];
  count: number;
  error?: string;
}

const CameraPage: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

  // Obtener lista de cámaras disponibles
  const fetchCameras = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/cameras/list_cameras/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
      const token = localStorage.getItem('access_token');
      if (!token) {
        setVideoError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai-security/api/cameras/list_videos/?camera_id=${cameraId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CameraVideosResponse = await response.json();

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

  // Manejar selección de cámara
  const handleCameraSelect = (camera: Camera) => {
    setSelectedCamera(camera);
    setVideos([]);
    fetchVideos(camera.id);
  };

  // Manejar reproducción de video
  const handleVideoPlay = (video: Video) => {
    setSelectedVideo(video);
    setVideoDialogOpen(true);
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Cámaras
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Visualiza y gestiona los videos de las cámaras de seguridad del condominio.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Panel de Cámaras */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Cámaras Disponibles
                </Typography>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={fetchCameras}
                  disabled={loading}
                >
                  Actualizar
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {cameras.map((camera) => (
                    <ListItem
                      key={camera.id}
                      disablePadding
                      sx={{ mb: 1 }}
                    >
                      <ListItemButton
                        selected={selectedCamera?.id === camera.id}
                        onClick={() => handleCameraSelect(camera)}
                        sx={{
                          borderRadius: 1,
                        }}
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

        {/* Panel de Videos */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 67%' } }}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" component="h2">
                  {selectedCamera ? `Videos de ${selectedCamera.name}` : 'Selecciona una cámara'}
                </Typography>
                {selectedCamera && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedCamera.description} - {selectedCamera.location}
                  </Typography>
                )}
              </Box>

              {videoError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {videoError}
                </Alert>
              )}

              {!selectedCamera ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <VideocamIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Selecciona una cámara de la lista para ver sus videos
                  </Typography>
                </Box>
              ) : videosLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : videos.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <VideoFileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay videos disponibles para esta cámara
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => selectedCamera && fetchVideos(selectedCamera.id)}
                    sx={{ mt: 2 }}
                  >
                    Actualizar
                  </Button>
                </Box>
              ) : (
                <List>
                  {videos.map((video) => (
                    <React.Fragment key={video.key}>
                      <ListItem>
                        <ListItemIcon>
                          <VideoFileIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {video.name}
                              </Typography>
                              <Chip
                                label={formatFileSize(video.size)}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={`Última modificación: ${formatDate(video.last_modified)}`}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PlayIcon />}
                            onClick={() => handleVideoPlay(video)}
                          >
                            Reproducir
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            component="a"
                            startIcon={<DownloadIcon />}
                            href={video.url}
                            download={video.name}
                            target="_blank"
                          >
                            Descargar
                          </Button>
                        </Box>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Dialog para reproducir video */}
      <Dialog
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Reproducir Video: {selectedVideo?.name}
        </DialogTitle>
        <DialogContent>
          {selectedVideo && (
            <Box sx={{ width: '100%', pt: 1 }}>
              <video
                width="100%"
                height="400"
                controls
                src={selectedVideo.url}
                style={{ borderRadius: 8 }}
              >
                Tu navegador no soporta la reproducción de video.
              </video>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            component="a"
            href={selectedVideo?.url || ''}
            download={selectedVideo?.name || ''}
            target="_blank"
            startIcon={<DownloadIcon />}
          >
            Descargar
          </Button>
          <Button onClick={() => setVideoDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CameraPage;