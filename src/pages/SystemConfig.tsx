import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  TextFields as TextIcon,
  Numbers as NumberIcon,
  ToggleOn as BooleanIcon,
  DataObject as JsonIcon,
} from '@mui/icons-material';
import { ConfiguracionSistema } from '../types';
import { configService, handleApiError } from '../services/api';

const SystemConfig: React.FC = () => {
  const [configuracionesPorCategoria, setConfiguracionesPorCategoria] = useState<{ [categoria: string]: ConfiguracionSistema[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [configToDelete, setConfigToDelete] = useState<ConfiguracionSistema | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadConfiguraciones();
  }, []);

  const loadConfiguraciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const grouped = await configService.getConfiguracionesPorCategoria();
      setConfiguracionesPorCategoria(grouped);
    } catch (error: any) {
      setError('Error al cargar las configuraciones: ' + handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (config: ConfiguracionSistema) => {
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!configToDelete) return;

    try {
      await configService.deleteConfiguracion(configToDelete.id);
      setSuccessMessage(`Configuración "${configToDelete.clave}" eliminada exitosamente`);
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
      await loadConfiguraciones();
    } catch (error: any) {
      setError('Error al eliminar la configuración: ' + handleApiError(error));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setConfigToDelete(null);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'string':
        return <TextIcon color="primary" />;
      case 'integer':
      case 'float':
      case 'number':
        return <NumberIcon color="secondary" />;
      case 'boolean':
        return <BooleanIcon color="success" />;
      case 'json':
        return <JsonIcon color="warning" />;
      default:
        return <CodeIcon color="action" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'string':
        return 'primary';
      case 'integer':
      case 'float':
      case 'number':
        return 'secondary';
      case 'boolean':
        return 'success';
      case 'json':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatValor = (valor: string, tipo: string) => {
    if (tipo === 'boolean') {
      return valor === 'true' ? 'Sí' : 'No';
    }
    return valor;
  };

  // Filtrar configuraciones por término de búsqueda
  const filteredConfiguraciones = Object.keys(configuracionesPorCategoria).reduce((acc, categoria) => {
    const configs = configuracionesPorCategoria[categoria].filter(config =>
      config.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.valor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (config.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (configs.length > 0) {
      acc[categoria] = configs;
    }

    return acc;
  }, {} as { [categoria: string]: ConfiguracionSistema[] });

  const categorias = Object.keys(filteredConfiguraciones);

  return (
    <Box>
      {/* Encabezado */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon color="primary" />
                  Configuraciones del Sistema
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadConfiguraciones}
                  disabled={loading}
                >
                  Actualizar
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Configuraciones del sistema organizadas por categoría. Solo se permite consultar y eliminar configuraciones.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar configuraciones por clave, valor o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Mostrar error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Contenido principal */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : categorias.length === 0 ? (
        <Alert severity="info">
          No se encontraron configuraciones que coincidan con la búsqueda.
        </Alert>
      ) : (
        <Box>
          {categorias.map((categoria) => (
            <Accordion key={categoria} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${categoria}-content`}
                id={`panel-${categoria}-header`}
              >
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  📁 {categoria} ({filteredConfiguraciones[categoria].length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {filteredConfiguraciones[categoria].map((config, index) => (
                    <ListItem
                      key={config.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemIcon>
                        {getTipoIcon(config.tipo)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {config.clave}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={config.tipo}
                                  size="small"
                                  color={getTipoColor(config.tipo) as any}
                                  variant="outlined"
                                />
                                <Chip
                                  label={`ID: ${config.id}`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteClick(config)}
                            >
                              Eliminar
                            </Button>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              Valor: <span style={{ fontFamily: 'monospace' }}>{formatValor(config.valor, config.tipo)}</span>
                            </Typography>
                            {config.descripcion && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {config.descripcion}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Actualizado: {new Date(config.updated_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

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
            ¿Está seguro que desea eliminar la configuración "{configToDelete?.clave}"?
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

export default SystemConfig;