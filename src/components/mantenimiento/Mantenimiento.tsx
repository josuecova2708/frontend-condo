import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  Chip,
  Card,
  CardContent,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
  MoreVert as MoreVertIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface TareaMantenimiento {
  id: number;
  titulo: string;
  tipo: string;
  tipo_display: string;
  descripcion: string;
  estado: string;
  estado_display: string;
  costo_estimado?: number;
  costo_real?: number;
  programada_para?: string;
  tecnico_nombre?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  esta_completada: boolean;
  puede_completar: boolean;
  costo_formateado: string;
  dias_desde_creacion: number;
}

interface OpcionesResponse {
  tipos: Array<{ value: string; label: string }>;
  estados: Array<{ value: string; label: string }>;
}

interface EstadisticasResponse {
  total: number;
  pendientes: number;
  en_progreso: number;
  realizadas: number;
  porcentaje_completadas: number;
}

const Mantenimiento: React.FC = () => {
  const { token } = useAuth();
  const [tareas, setTareas] = useState<TareaMantenimiento[]>([]);
  const [opciones, setOpciones] = useState<OpcionesResponse>({ tipos: [], estados: [] });
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<TareaMantenimiento | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: '',
    descripcion: '',
    costo_estimado: '',
    programada_para: '',
    tecnico_nombre: ''
  });

  const [costoRealForm, setCostoRealForm] = useState('');

  const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchTareas();
    fetchOpciones();
    fetchEstadisticas();
  }, []);

  const fetchTareas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/mantenimiento/tareas/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTareas(data.results || data);
      } else {
        throw new Error('Error al cargar tareas');
      }
    } catch (error) {
      console.error('Error fetching tareas:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar las tareas',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOpciones = async () => {
    try {
      const response = await fetch(`${baseUrl}/mantenimiento/tareas/opciones/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOpciones(data);
      }
    } catch (error) {
      console.error('Error fetching opciones:', error);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch(`${baseUrl}/mantenimiento/tareas/estadisticas/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data);
      }
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        titulo: formData.titulo,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        costo_estimado: formData.costo_estimado ? parseFloat(formData.costo_estimado) : null,
        programada_para: formData.programada_para || null,
        tecnico_nombre: formData.tecnico_nombre || null,
      };

      const response = await fetch(`${baseUrl}/mantenimiento/tareas/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Tarea creada exitosamente',
          severity: 'success'
        });
        setOpenDialog(false);
        resetForm();
        fetchTareas();
        fetchEstadisticas();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la tarea');
      }
    } catch (error) {
      console.error('Error creating tarea:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al crear la tarea',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTarea = async () => {
    if (!selectedTarea) return;

    try {
      setLoading(true);

      const payload = {
        costo_real: costoRealForm ? parseFloat(costoRealForm) : null
      };

      const response = await fetch(`${baseUrl}/mantenimiento/tareas/${selectedTarea.id}/completar/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Tarea completada exitosamente',
          severity: 'success'
        });
        setOpenCompleteDialog(false);
        setCostoRealForm('');
        setSelectedTarea(null);
        fetchTareas();
        fetchEstadisticas();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al completar la tarea');
      }
    } catch (error) {
      console.error('Error completing tarea:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al completar la tarea',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTarea = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta tarea?')) return;

    try {
      setLoading(true);

      const response = await fetch(`${baseUrl}/mantenimiento/tareas/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Tarea eliminada exitosamente',
          severity: 'success'
        });
        setSelectedTarea(null);
        fetchTareas();
        fetchEstadisticas();
      } else {
        throw new Error('Error al eliminar la tarea');
      }
    } catch (error) {
      console.error('Error deleting tarea:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar la tarea',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      tipo: '',
      descripcion: '',
      costo_estimado: '',
      programada_para: '',
      tecnico_nombre: ''
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'en_progreso':
        return 'info';
      case 'realizado':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, tarea: TareaMantenimiento) => {
    setAnchorEl(event.currentTarget);
    setSelectedTarea(tarea);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Estadísticas */}
      {estadisticas && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BuildIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">{estadisticas.total}</Typography>
                </Box>
                <Typography color="textSecondary">Total Tareas</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">{estadisticas.pendientes}</Typography>
                </Box>
                <Typography color="textSecondary">Pendientes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CompleteIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">{estadisticas.realizadas}</Typography>
                </Box>
                <Typography color="textSecondary">Completadas</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{estadisticas.porcentaje_completadas}%</Typography>
                </Box>
                <Typography color="textSecondary">% Completado</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabla de tareas */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Tareas de Mantenimiento</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nueva Tarea
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Costo</TableCell>
                <TableCell>Fecha Programada</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tareas.map((tarea) => (
                <TableRow key={tarea.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{tarea.titulo}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {tarea.descripcion.length > 50
                        ? `${tarea.descripcion.substring(0, 50)}...`
                        : tarea.descripcion}
                    </Typography>
                  </TableCell>
                  <TableCell>{tarea.tipo_display}</TableCell>
                  <TableCell>
                    <Chip
                      label={tarea.estado_display}
                      color={getEstadoColor(tarea.estado) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{tarea.costo_formateado}</TableCell>
                  <TableCell>{tarea.programada_para ? formatDate(tarea.programada_para) : 'No programada'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, tarea)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedTarea?.puede_completar && (
          <MenuItem
            onClick={() => {
              setOpenCompleteDialog(true);
              handleMenuClose();
            }}
          >
            <CompleteIcon sx={{ mr: 1 }} />
            Completar
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (selectedTarea) handleDeleteTarea(selectedTarea.id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear tarea */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nueva Tarea de Mantenimiento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Título"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  {opciones.tipos.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Costo Estimado (Bs.)"
                type="number"
                value={formData.costo_estimado}
                onChange={(e) => setFormData({ ...formData, costo_estimado: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Programada para"
                type="datetime-local"
                value={formData.programada_para}
                onChange={(e) => setFormData({ ...formData, programada_para: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre Técnico"
                value={formData.tecnico_nombre}
                onChange={(e) => setFormData({ ...formData, tecnico_nombre: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            Crear Tarea
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para completar tarea */}
      <Dialog open={openCompleteDialog} onClose={() => {
        setOpenCompleteDialog(false);
        setSelectedTarea(null);
        setCostoRealForm('');
      }}>
        <DialogTitle>Completar Tarea</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ¿Está seguro de que desea marcar como completada la tarea: <strong>{selectedTarea?.titulo}</strong>?
          </Typography>
          <TextField
            fullWidth
            label="Costo Real (Bs.) - Opcional"
            type="number"
            value={costoRealForm}
            onChange={(e) => setCostoRealForm(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenCompleteDialog(false);
            setSelectedTarea(null);
            setCostoRealForm('');
          }}>Cancelar</Button>
          <Button onClick={handleCompleteTarea} variant="contained" disabled={loading}>
            Completar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Mantenimiento;