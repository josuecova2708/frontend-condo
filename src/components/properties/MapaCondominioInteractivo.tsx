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
import { UnidadHabitacional } from '../../types';
import { propertyService, handleApiError } from '../../services/api';

// Configuración del plano del condominio según la imagen de referencia
const PLANO_CONDOMINIO = {
  bloques: {
    'A': {
      unidades: [9, 10],
      color: '#4CAF50',
      position: { x: 850, y: 200 }
    },
    'B': {
      unidades: [1, 2, 3, 4],
      color: '#2196F3',
      position: { x: 50, y: 100 }
    },
    'C': {
      unidades: [5, 6, 7, 8, 11, 12, 13, 14],
      color: '#FF9800',
      position: { x: 400, y: 300 }
    }
  },
  areas_comunes: [
    { nombre: 'Área Social', coordenadas: {x: 400, y: 50}, width: 350, height: 80 },
    { nombre: 'Piscina', coordenadas: {x: 400, y: 450}, width: 120, height: 80 },
    { nombre: 'Parque', coordenadas: {x: 200, y: 450}, width: 100, height: 80 },
    { nombre: 'Parque', coordenadas: {x: 600, y: 450}, width: 100, height: 80 },
    { nombre: 'Parqueo Visita', coordenadas: {x: 900, y: 50}, width: 200, height: 120 },
    { nombre: 'Tienda', coordenadas: {x: 100, y: 650}, width: 80, height: 40 },
    { nombre: 'Tienda', coordenadas: {x: 800, y: 650}, width: 80, height: 40 }
  ]
};

interface MapaCondominioInteractivoProps {
  onUnidadSelect?: (unidad: UnidadHabitacional) => void;
}

const MapaCondominioInteractivo: React.FC<MapaCondominioInteractivoProps> = ({ onUnidadSelect }) => {
  const [unidades, setUnidades] = useState<UnidadHabitacional[]>([]);
  const [selectedUnidad, setSelectedUnidad] = useState<UnidadHabitacional | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUnidades();
  }, []);

  const loadUnidades = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyService.getUnidades(1, '');
      setUnidades(response.results);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUnidadClick = (numeroUnidad: number) => {
    const unidad = unidades.find(u => parseInt(u.numero) === numeroUnidad);
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
    for (const [bloque, config] of Object.entries(PLANO_CONDOMINIO.bloques)) {
      if (config.unidades.includes(numeroUnidad)) {
        return config.color;
      }
    }
    return '#9E9E9E'; // Color por defecto
  };

  const getUnidadStatus = (numeroUnidad: number): { occupied: boolean; owner?: string } => {
    const unidad = unidades.find(u => parseInt(u.numero) === numeroUnidad);
    if (!unidad) return { occupied: false };

    // Aquí deberías tener la lógica para determinar si la unidad está ocupada
    // Por ahora usamos datos simulados
    return {
      occupied: unidad.is_active,
      owner: `Propietario ${numeroUnidad}`
    };
  };

  // Componente para renderizar una unidad individual
  const UnidadSVG: React.FC<{ numero: number; x: number; y: number; bloque: string }> = ({
    numero, x, y
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
          width={80}
          height={60}
          fill={status.occupied ? color : '#f0f0f0'}
          stroke="#333"
          strokeWidth="2"
          rx="5"
          opacity={status.occupied ? 1 : 0.5}
        />
        <text
          x={x + 40}
          y={y + 40}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill={status.occupied ? 'white' : '#666'}
        >
          {numero}
        </text>
      </g>
    );
  };

  // Componente para renderizar áreas comunes
  const AreaComun: React.FC<{ nombre: string; x: number; y: number; width: number; height: number }> = ({
    nombre, x, y, width, height
  }) => (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#E8F5E8"
        stroke="#4CAF50"
        strokeWidth="2"
        strokeDasharray="5,5"
        rx="10"
      />
      <text
        x={x + width/2}
        y={y + height/2}
        textAnchor="middle"
        fontSize="14"
        fontWeight="500"
        fill="#2E7D32"
      >
        {nombre.toUpperCase()}
      </text>
    </g>
  );

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Cargando mapa del condominio...</Typography>
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

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Leyenda */}
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#4CAF50', border: '1px solid #333' }} />
              <Typography variant="body2">Bloque A</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#2196F3', border: '1px solid #333' }} />
              <Typography variant="body2">Bloque B</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#FF9800', border: '1px solid #333' }} />
              <Typography variant="body2">Bloque C</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#f0f0f0', border: '1px solid #333', opacity: 0.5 }} />
              <Typography variant="body2">Disponible</Typography>
            </Box>
          </Box>

          {/* Mapa SVG */}
          <Paper elevation={2} sx={{ p: 2, overflow: 'auto' }}>
            <svg
              viewBox="0 0 1200 800"
              className="plano-condominio"
              style={{ width: '100%', height: '600px', minHeight: '400px' }}
            >
              {/* Bloque B: Unidades 1-4 (izquierda) */}
              <UnidadSVG numero={1} x={50} y={50} bloque="B" />
              <UnidadSVG numero={2} x={50} y={150} bloque="B" />
              <UnidadSVG numero={3} x={50} y={250} bloque="B" />
              <UnidadSVG numero={4} x={50} y={350} bloque="B" />

              {/* Área Social (centro superior) */}
              {PLANO_CONDOMINIO.areas_comunes.map((area, index) => (
                <AreaComun
                  key={index}
                  nombre={area.nombre}
                  x={area.coordenadas.x}
                  y={area.coordenadas.y}
                  width={area.width}
                  height={area.height}
                />
              ))}

              {/* Bloque C: Unidades 11-14 (centro superior) */}
              <UnidadSVG numero={11} x={250} y={200} bloque="C" />
              <UnidadSVG numero={12} x={350} y={200} bloque="C" />
              <UnidadSVG numero={13} x={450} y={200} bloque="C" />
              <UnidadSVG numero={14} x={550} y={200} bloque="C" />

              {/* Bloque C: Unidades 5-8 (centro inferior) */}
              <UnidadSVG numero={5} x={300} y={600} bloque="C" />
              <UnidadSVG numero={6} x={400} y={600} bloque="C" />
              <UnidadSVG numero={7} x={500} y={600} bloque="C" />
              <UnidadSVG numero={8} x={600} y={600} bloque="C" />

              {/* Bloque A: Unidades 9-10 (derecha) */}
              <UnidadSVG numero={9} x={950} y={200} bloque="A" />
              <UnidadSVG numero={10} x={950} y={350} bloque="A" />
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
                        secondary={`${selectedUnidad.area_m2} m²`}
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