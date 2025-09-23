import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
  Star as StarIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface KPIData {
  total_areas: number;
  total_reservas: number;
  reservas_confirmadas: number;
  tasa_confirmacion: number;
  ingresos_totales: number;
  area_mas_popular: string;
}

interface ResumenData {
  kpis: KPIData;
  mes_actual: {
    reservas: number;
    ingresos: number;
  };
}

interface IngresosPorArea {
  area__id: number;
  area__nombre: string;
  total_ingresos: number;
  total_reservas: number;
  promedio_por_reserva: number;
}

interface OcupacionArea {
  area_id: number;
  area_nombre: string;
  total_reservas: number;
  horas_totales: number;
  promedio_horas_por_reserva: number;
}

interface RankingArea {
  area_id: number;
  area_nombre: string;
  score_popularidad: number;
  total_reservas: number;
  reservas_confirmadas: number;
  tasa_confirmacion: number;
  total_ingresos: number;
  promedio_precio: number;
}

interface EstadoReserva {
  estado: string;
  estado_display: string;
  total: number;
  porcentaje: number;
  total_ingresos: number;
}

const ReportesInstalaciones: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<string>('resumen');

  // Estados para datos de reportes
  const [resumenData, setResumenData] = useState<ResumenData | null>(null);
  const [ingresosPorArea, setIngresosPorArea] = useState<IngresosPorArea[]>([]);
  const [ocupacionData, setOcupacionData] = useState<OcupacionArea[]>([]);
  const [rankingData, setRankingData] = useState<RankingArea[]>([]);
  const [estadosData, setEstadosData] = useState<EstadoReserva[]>([]);
  const [horariosPeakData, setHorariosPeakData] = useState<any>(null);
  const [ingresosPeriodoData, setIngresosPeriodoData] = useState<any>(null);

  // Filtros para reportes
  const [periodoFiltro, setPeriodoFiltro] = useState('mes');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://backend-condo-production.up.railway.app/api'
    : 'http://localhost:8000/api';

  const fetchReporte = async (endpoint: string, params?: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(`${baseUrl}/areas-comunes/${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar el reporte');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching report:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar datos');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadResumen = async () => {
    const data = await fetchReporte('reportes/resumen/');
    if (data) setResumenData(data);
  };

  const loadIngresosPorArea = async () => {
    const data = await fetchReporte('reportes/ingresos-por-area/');
    if (data) setIngresosPorArea(data.ingresos_por_area || []);
  };

  const loadOcupacion = async () => {
    const data = await fetchReporte('reportes/ocupacion-por-area/');
    if (data) setOcupacionData(data.ocupacion_por_area || []);
  };

  const loadRanking = async () => {
    const data = await fetchReporte('reportes/ranking-areas/');
    if (data) setRankingData(data.ranking_areas || []);
  };

  const loadEstados = async () => {
    const data = await fetchReporte('reportes/estados-reservas/');
    if (data) setEstadosData(data.estados_general || []);
  };

  const loadHorariosPeak = async () => {
    const data = await fetchReporte('reportes/horarios-peak/');
    if (data) setHorariosPeakData(data);
  };

  const loadIngresosPorPeriodo = async () => {
    const params: Record<string, string> = { periodo: periodoFiltro };
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;

    const data = await fetchReporte('reportes/ingresos-por-periodo/', params);
    if (data) setIngresosPeriodoData(data);
  };

  useEffect(() => {
    loadResumen();
  }, []);

  useEffect(() => {
    if (activeReport === 'ingresos-area') {
      loadIngresosPorArea();
    } else if (activeReport === 'ocupacion') {
      loadOcupacion();
    } else if (activeReport === 'ranking') {
      loadRanking();
    } else if (activeReport === 'estados') {
      loadEstados();
    } else if (activeReport === 'horarios-peak') {
      loadHorariosPeak();
    } else if (activeReport === 'ingresos-periodo') {
      loadIngresosPorPeriodo();
    }
  }, [activeReport]);

  useEffect(() => {
    if (activeReport === 'ingresos-periodo') {
      loadIngresosPorPeriodo();
    }
  }, [periodoFiltro, fechaInicio, fechaFin]);

  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelada': return 'error';
      default: return 'default';
    }
  };

  const reportCards = [
    {
      id: 'resumen',
      title: 'Resumen General',
      description: 'Vista general de KPIs principales',
      icon: <ReportIcon />,
      color: '#1976d2'
    },
    {
      id: 'ingresos-area',
      title: 'Ingresos por Área',
      description: 'Total y promedio por área común',
      icon: <MoneyIcon />,
      color: '#388e3c'
    },
    {
      id: 'ingresos-periodo',
      title: 'Ingresos por Período',
      description: 'Comparaciones temporales',
      icon: <TrendingUpIcon />,
      color: '#f57c00'
    },
    {
      id: 'ocupacion',
      title: 'Ocupación por Área',
      description: 'Horas de uso y tasas',
      icon: <ScheduleIcon />,
      color: '#7b1fa2'
    },
    {
      id: 'ranking',
      title: 'Ranking de Popularidad',
      description: 'Áreas más populares',
      icon: <StarIcon />,
      color: '#c62828'
    },
    {
      id: 'horarios-peak',
      title: 'Horarios Peak',
      description: 'Análisis por hora del día',
      icon: <BarChartIcon />,
      color: '#00796b'
    },
    {
      id: 'estados',
      title: 'Estados de Reservas',
      description: 'Distribución de estados',
      icon: <EventIcon />,
      color: '#455a64'
    }
  ];

  const renderResumen = () => (
    <Grid container spacing={3}>
      {resumenData?.kpis && Object.entries({
        'Total Áreas': resumenData.kpis.total_areas,
        'Total Reservas': resumenData.kpis.total_reservas,
        'Reservas Confirmadas': resumenData.kpis.reservas_confirmadas,
        'Tasa Confirmación': `${resumenData.kpis.tasa_confirmacion}%`,
        'Ingresos Totales': formatCurrency(resumenData.kpis.ingresos_totales),
        'Área Más Popular': resumenData.kpis.area_mas_popular
      }).map(([label, value]) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={label}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {label}
              </Typography>
              <Typography variant="h5" component="div">
                {value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {resumenData?.mes_actual && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estadísticas del Mes Actual
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Reservas</Typography>
                  <Typography variant="h6">{resumenData.mes_actual.reservas}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Ingresos</Typography>
                  <Typography variant="h6">{formatCurrency(resumenData.mes_actual.ingresos)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  const renderIngresosPorArea = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Área</TableCell>
            <TableCell align="right">Total Ingresos</TableCell>
            <TableCell align="right">Total Reservas</TableCell>
            <TableCell align="right">Promedio por Reserva</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ingresosPorArea.map((area) => (
            <TableRow key={area.area__id}>
              <TableCell>{area.area__nombre}</TableCell>
              <TableCell align="right">{formatCurrency(area.total_ingresos)}</TableCell>
              <TableCell align="right">{area.total_reservas}</TableCell>
              <TableCell align="right">{formatCurrency(area.promedio_por_reserva)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderOcupacion = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Área</TableCell>
            <TableCell align="right">Total Reservas</TableCell>
            <TableCell align="right">Horas Totales</TableCell>
            <TableCell align="right">Promedio Horas/Reserva</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ocupacionData.map((area) => (
            <TableRow key={area.area_id}>
              <TableCell>{area.area_nombre}</TableCell>
              <TableCell align="right">{area.total_reservas}</TableCell>
              <TableCell align="right">{area.horas_totales}h</TableCell>
              <TableCell align="right">{area.promedio_horas_por_reserva}h</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderRanking = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Posición</TableCell>
            <TableCell>Área</TableCell>
            <TableCell align="right">Score Popularidad</TableCell>
            <TableCell align="right">Total Reservas</TableCell>
            <TableCell align="right">Tasa Confirmación</TableCell>
            <TableCell align="right">Ingresos Totales</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rankingData.map((area, index) => (
            <TableRow key={area.area_id}>
              <TableCell>
                <Chip
                  label={`#${index + 1}`}
                  color={index < 3 ? 'primary' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>{area.area_nombre}</TableCell>
              <TableCell align="right">{area.score_popularidad}</TableCell>
              <TableCell align="right">{area.total_reservas}</TableCell>
              <TableCell align="right">{area.tasa_confirmacion}%</TableCell>
              <TableCell align="right">{formatCurrency(area.total_ingresos)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderEstados = () => (
    <Grid container spacing={3}>
      {estadosData.map((estado) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={estado.estado}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">{estado.estado_display}</Typography>
                <Chip
                  label={`${estado.porcentaje}%`}
                  color={getEstadoColor(estado.estado) as any}
                  size="small"
                />
              </Box>
              <Typography variant="h4" color="textPrimary">
                {estado.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {formatCurrency(estado.total_ingresos)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderIngresosPorPeriodo = () => (
    <Box>
      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={periodoFiltro}
                label="Período"
                onChange={(e) => setPeriodoFiltro(e.target.value)}
              >
                <MenuItem value="dia">Por Día</MenuItem>
                <MenuItem value="semana">Por Semana</MenuItem>
                <MenuItem value="mes">Por Mes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Fecha Inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Fecha Fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Box>

      {ingresosPeriodoData && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Período</TableCell>
                <TableCell align="right">Total Ingresos</TableCell>
                <TableCell align="right">Total Reservas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ingresosPeriodoData.datos?.map((periodo: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(periodo.periodo).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(periodo.total_ingresos)}</TableCell>
                  <TableCell align="right">{periodo.total_reservas}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderHorariosPeak = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" gutterBottom>
          Reservas por Hora del Día
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Hora</TableCell>
                <TableCell align="right">Reservas</TableCell>
                <TableCell align="right">Ingresos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {horariosPeakData?.horarios_peak?.map((hora: any) => (
                <TableRow key={hora.hora}>
                  <TableCell>{hora.hora}:00</TableCell>
                  <TableCell align="right">{hora.total_reservas}</TableCell>
                  <TableCell align="right">{formatCurrency(hora.total_ingresos)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h6" gutterBottom>
          Reservas por Día de la Semana
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Día</TableCell>
                <TableCell align="right">Reservas</TableCell>
                <TableCell align="right">Ingresos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {horariosPeakData?.dias_semana?.map((dia: any) => (
                <TableRow key={dia.dia_semana}>
                  <TableCell>{dia.dia_nombre}</TableCell>
                  <TableCell align="right">{dia.total_reservas}</TableCell>
                  <TableCell align="right">{formatCurrency(dia.total_ingresos)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );

  const renderActiveReport = () => {
    switch (activeReport) {
      case 'resumen': return renderResumen();
      case 'ingresos-area': return renderIngresosPorArea();
      case 'ingresos-periodo': return renderIngresosPorPeriodo();
      case 'ocupacion': return renderOcupacion();
      case 'ranking': return renderRanking();
      case 'horarios-peak': return renderHorariosPeak();
      case 'estados': return renderEstados();
      default: return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reportes de Uso de Instalaciones
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Selección de Reportes */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {reportCards.map((report) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={report.id}>
            <Card
              sx={{
                cursor: 'pointer',
                borderLeft: activeReport === report.id ? `4px solid ${report.color}` : 'none',
                backgroundColor: activeReport === report.id ? 'action.selected' : 'background.paper'
              }}
              onClick={() => setActiveReport(report.id)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box sx={{ color: report.color, mr: 1 }}>
                    {report.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {report.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {report.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Contenido del Reporte Activo */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            {reportCards.find(r => r.id === activeReport)?.title}
          </Typography>
          {loading && <CircularProgress size={24} />}
        </Box>

        {renderActiveReport()}
      </Paper>
    </Box>
  );
};

export default ReportesInstalaciones;