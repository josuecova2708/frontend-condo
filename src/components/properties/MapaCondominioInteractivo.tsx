import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  SquareFoot as AreaIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  DirectionsCar as ParkingIcon,
  Balcony as BalconyIcon,
} from '@mui/icons-material';
import { UnidadHabitacional, MapLayoutResponse, MapConfig, BloqueData } from '../../types';
import { propertyService, handleApiError } from '../../services/api';

interface MapaCondominioInteractivoProps {
  onUnidadSelect?: (unidad: UnidadHabitacional) => void;
}

const MapaCondominioInteractivo: React.FC<MapaCondominioInteractivoProps> = ({ onUnidadSelect }) => {
  const [mapData, setMapData] = useState<MapLayoutResponse | null>(null);
  const [selectedUnidad, setSelectedUnidad] = useState<UnidadHabitacional | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertyService.getMapLayout();
      setMapData(data);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const findUnidadByNumero = (numero: number): UnidadHabitacional | null => {
    if (!mapData) return null;

    for (const bloqueData of Object.values(mapData.bloques_data)) {
      const unidad = bloqueData.unidades.find(u => parseInt(u.numero) === numero);
      if (unidad) return unidad;
    }
    return null;
  };

  const handleUnidadClick = (numeroUnidad: number) => {
    const unidad = findUnidadByNumero(numeroUnidad);
    if (unidad) {
      setSelectedUnidad(unidad);
      setDialogOpen(true);
      onUnidadSelect?.(unidad);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUnidad(null);
  };

  const getUnidadColor = (numeroUnidad: number): string => {
    if (!mapData) return '#9E9E9E';

    for (const [bloque, config] of Object.entries(mapData.map_config.bloques)) {
      if (config.unidades_numeros.includes(numeroUnidad)) {
        return config.color;
      }
    }
    return '#9E9E9E';
  };

  const getUnidadStatus = (numeroUnidad: number): { occupied: boolean; unidad?: UnidadHabitacional } => {
    const unidad = findUnidadByNumero(numeroUnidad);
    if (!unidad) return { occupied: false };

    return {
      occupied: unidad.is_active,
      unidad: unidad
    };
  };

  // Componente para renderizar una unidad individual según la imagen
  const UnidadSVG: React.FC<{ numero: number; x: number; y: number; width?: number; height?: number }> = ({
    numero, x, y, width = 80, height = 60
  }) => {
    const status = getUnidadStatus(numero);
    const color = getUnidadColor(numero);

    return (
      <g
        onClick={() => handleUnidadClick(numero)}
        style={{ cursor: 'pointer' }}
        className="unidad-svg"
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={status.occupied ? color : '#f0f0f0'}
          stroke="#333"
          strokeWidth="2"
          rx="8"
          opacity={status.occupied ? 1 : 0.6}
        />
        <text
          x={x + width/2}
          y={y + height/2 + 5}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill={status.occupied ? 'white' : '#666'}
        >
          {numero}
        </text>
      </g>
    );
  };

  // Componente para renderizar áreas comunes
  const AreaComun: React.FC<{
    nombre: string;
    x: number;
    y: number;
    width: number;
    height: number;
    style?: 'default' | 'building' | 'green';
  }> = ({
    nombre, x, y, width, height, style = 'default'
  }) => {
    let fill = '#E8F5E8';
    let stroke = '#4CAF50';
    let textColor = '#2E7D32';

    if (style === 'building') {
      fill = '#FFF3E0';
      stroke = '#FF9800';
      textColor = '#F57C00';
    } else if (style === 'green') {
      fill = '#E8F5E8';
      stroke = '#4CAF50';
      textColor = '#2E7D32';
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
          strokeDasharray={style === 'green' ? "5,5" : "none"}
          rx="8"
        />
        <text
          x={x + width/2}
          y={y + height/2 + 3}
          textAnchor="middle"
          fontSize={nombre.length > 10 ? "12" : "14"}
          fontWeight="500"
          fill={textColor}
        >
          {nombre.toUpperCase()}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={loadMapData} variant="outlined">
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!mapData) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            No se pudo cargar la información del mapa
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="primary" />
            Mapa Interactivo del Condominio
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Haz clic en cualquier unidad para ver su información detallada
          </Typography>

          {/* Leyenda */}
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {Object.entries(mapData.map_config.bloques).map(([bloque, config]) => (
              <Box key={bloque} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: config.color, border: '1px solid #333', borderRadius: '4px' }} />
                <Typography variant="body2">Bloque {bloque}</Typography>
              </Box>
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#f0f0f0', border: '1px solid #333', borderRadius: '4px', opacity: 0.6 }} />
              <Typography variant="body2">Disponible</Typography>
            </Box>
          </Box>

          {/* Mapa SVG siguiendo exactamente la imagen de referencia */}
          <Paper elevation={2} sx={{ p: 2, overflow: 'auto' }}>
            <svg
              viewBox="0 0 1200 800"
              className="plano-condominio"
              style={{ width: '100%', height: '600px', minHeight: '400px' }}
            >
              {/* Bloque B: Unidades 1-4 (columna izquierda) */}
              <UnidadSVG numero={1} x={50} y={100} />
              <UnidadSVG numero={2} x={50} y={200} />
              <UnidadSVG numero={3} x={50} y={300} />
              <UnidadSVG numero={4} x={50} y={450} />

              {/* Área Social (centro superior) */}
              <AreaComun nombre="ÁREA SOCIAL" x={300} y={50} width={400} height={100} style="building" />

              {/* Parqueo Visita (esquina superior derecha) */}
              <AreaComun nombre="Parqueo visita" x={950} y={50} width={150} height={100} style="building" />

              {/* Bloque C: Unidades 11-14 (fila superior central) */}
              <UnidadSVG numero={11} x={250} y={200} />
              <UnidadSVG numero={12} x={350} y={200} />
              <UnidadSVG numero={13} x={450} y={200} />
              <UnidadSVG numero={14} x={550} y={200} />

              {/* Bloque A: Unidad 9 (derecha superior) */}
              <UnidadSVG numero={9} x={950} y={200} width={150} height={100} />

              {/* Áreas comunes centrales */}
              <AreaComun nombre="PARQUE" x={200} y={350} width={100} height={100} style="green" />

              {/* Boxis (parece ser un área entre parques) */}
              <AreaComun nombre="BOXIS" x={320} y={380} width={60} height={40} style="building" />

              <AreaComun nombre="PISCINA" x={400} y={350} width={150} height={100} style="building" />

              <AreaComun nombre="BOXIS" x={570} y={380} width={60} height={40} style="building" />

              <AreaComun nombre="PARQUE" x={650} y={350} width={100} height={100} style="green" />

              {/* Bloque A: Unidad 10 (derecha inferior) */}
              <UnidadSVG numero={10} x={950} y={400} width={150} height={100} />

              {/* Bloque C: Unidades 5-8 (fila inferior central) */}
              <UnidadSVG numero={5} x={300} y={550} />
              <UnidadSVG numero={6} x={400} y={550} />
              <UnidadSVG numero={7} x={500} y={550} />
              <UnidadSVG numero={8} x={600} y={550} />

              {/* Tiendas (parte inferior) */}
              <AreaComun nombre="Tienda" x={100} y={700} width={80} height={50} style="building" />
              <AreaComun nombre="Tienda" x={800} y={700} width={80} height={50} style="building" />
            </svg>
          </Paper>
        </CardContent>
      </Card>

      {/* Dialog de información de la unidad */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeIcon color="primary" />
              <Typography variant="h6">
                Unidad {selectedUnidad?.numero} - Bloque {selectedUnidad?.bloque_nombre}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedUnidad && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Información Básica
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <HomeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tipo de Unidad"
                        secondary={selectedUnidad.tipo}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Ubicación"
                        secondary={`Piso ${selectedUnidad.piso}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AreaIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Área"
                        secondary={selectedUnidad.area_m2 ? `${selectedUnidad.area_m2} m²` : 'No especificado'}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Características
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <BedIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Habitaciones"
                        secondary={selectedUnidad.num_habitaciones || 'No especificado'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BathtubIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Baños"
                        secondary={selectedUnidad.num_banos || 'No especificado'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Extras"
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {selectedUnidad.tiene_balcon && (
                              <Chip
                                icon={<BalconyIcon />}
                                label="Balcón"
                                size="small"
                                color="info"
                              />
                            )}
                            {selectedUnidad.tiene_parqueadero && (
                              <Chip
                                icon={<ParkingIcon />}
                                label="Parqueadero"
                                size="small"
                                color="success"
                              />
                            )}
                            {!selectedUnidad.tiene_balcon && !selectedUnidad.tiene_parqueadero && (
                              <Typography variant="body2" color="text.secondary">
                                Sin extras
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Estado Actual
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip
                      label={selectedUnidad.is_active ? 'Activo' : 'Inactivo'}
                      color={selectedUnidad.is_active ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                  {selectedUnidad.observaciones && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Observaciones:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedUnidad.observaciones}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              handleCloseDialog();
              // Aquí podrías abrir un modal de edición o navegar a la página de edición
            }}
          >
            Editar Unidad
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapaCondominioInteractivo;