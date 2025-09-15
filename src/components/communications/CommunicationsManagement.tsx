import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Campaign as CampaignIcon,
  Build as BuildIcon,
  MarkEmailRead as ReadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { communicationService, handleApiError } from '../../services/api';
import { AvisoFormData, AvisoComunicado } from '../../types';
import AvisoForm from './AvisoForm';


const CommunicationsManagement: React.FC = () => {
  const [avisos, setAvisos] = useState<AvisoComunicado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [avisoToDelete, setAvisoToDelete] = useState<AvisoComunicado | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Datos mock para demostración
  useEffect(() => {
    loadAvisos();
  }, []);

  const loadAvisos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await communicationService.getAvisos();
      setAvisos(response.results || []);
    } catch (error: any) {
      setError('Error al cargar los avisos y comunicados: ' + handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadAvisos();
  };

  const handleCreateAviso = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleCreateAvisoSubmit = async (data: AvisoFormData) => {
    try {
      setFormLoading(true);
      await communicationService.createAviso(data);
      setIsFormOpen(false);
      await loadAvisos();
    } catch (error: any) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (aviso: AvisoComunicado) => {
    setAvisoToDelete(aviso);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!avisoToDelete) return;

    try {
      await communicationService.deleteAviso(avisoToDelete.id);
      setSuccessMessage(`Aviso "${avisoToDelete.titulo}" eliminado exitosamente`);
      setDeleteDialogOpen(false);
      setAvisoToDelete(null);
      await loadAvisos();
    } catch (error: any) {
      setError('Error al eliminar el aviso: ' + handleApiError(error));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAvisoToDelete(null);
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica':
        return 'error';
      case 'alta':
        return 'warning';
      case 'media':
        return 'info';
      case 'baja':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'aviso':
        return <InfoIcon />;
      case 'comunicado':
        return <CampaignIcon />;
      case 'noticia':
        return <NotificationIcon />;
      case 'urgente':
        return <ErrorIcon />;
      case 'mantenimiento':
        return <BuildIcon />;
      default:
        return <NotificationIcon />;
    }
  };

  // Filtrar avisos por término de búsqueda
  const filteredAvisos = avisos.filter(aviso =>
    aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (aviso.preview_contenido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (aviso.autor_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      {/* Encabezado */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                  Avisos y Comunicados
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateAviso}
                  disabled={loading}
                >
                  Nuevo Aviso
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Consulta y gestiona los avisos y comunicados del condominio.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controles de búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por título, contenido o autor..."
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
                  onClick={loadAvisos}
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

      {/* Lista de avisos */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredAvisos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No se encontraron avisos o comunicados
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredAvisos.map((aviso, index) => (
                <React.Fragment key={aviso.id}>
                  <ListItem
                    sx={{ 
                      alignItems: 'flex-start',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: `${getPrioridadColor(aviso.prioridad)}.main`,
                          color: 'white'
                        }}
                      >
                        {getTipoIcon(aviso.tipo)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" component="div" sx={{ mb: 0.5 }}>
                              {aviso.titulo}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <Chip
                                label={aviso.tipo_display}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={aviso.prioridad_display}
                                size="small"
                                color={getPrioridadColor(aviso.prioridad) as any}
                                variant="outlined"
                              />
                              {aviso.is_expired && (
                                <Chip
                                  label="Expirado"
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Badge badgeContent={aviso.lecturas_count} color="primary">
                              <ReadIcon color="action" />
                            </Badge>
                            <IconButton size="small">
                              <NotificationIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(aviso);
                              }}
                              title="Eliminar aviso"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" component="span">
                              {aviso.preview_contenido}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Por: {aviso.autor_name} • {formatFecha(aviso.fecha_publicacion)}
                            </Typography>
                            {aviso.fecha_expiracion && (
                              <Typography variant="caption" color="warning.main">
                                Expira: {formatFecha(aviso.fecha_expiracion)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < filteredAvisos.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Formulario para nuevo aviso */}
      <AvisoForm
        open={isFormOpen}
        onSubmit={handleCreateAvisoSubmit}
        onClose={handleCloseForm}
        loading={formLoading}
      />

      {/* Dialog de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro que desea eliminar el aviso "{avisoToDelete?.titulo}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificación de éxito */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </Box>
  );
};

export default CommunicationsManagement;