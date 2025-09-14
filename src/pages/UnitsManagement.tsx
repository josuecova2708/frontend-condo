import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
} from '@mui/material';
import {
  Map as MapIcon,
  TableView as TableIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import MapaCondominioInteractivo from '../components/properties/MapaCondominioInteractivo';
import PropertyManagement from '../components/properties/PropertyManagement';
import { UnidadHabitacional } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`units-tabpanel-${index}`}
      aria-labelledby={`units-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UnitsManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedUnidad, setSelectedUnidad] = useState<UnidadHabitacional | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUnidadSelect = (unidad: UnidadHabitacional) => {
    setSelectedUnidad(unidad);
  };

  const handleSwitchToTable = () => {
    setTabValue(1);
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
                  Gestionar Unidades Habitacionales
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleSwitchToTable}
                  disabled={false}
                >
                  Nueva Unidad
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Administra las unidades habitacionales del condominio a través del mapa interactivo o la vista de tabla detallada.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pestañas */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="units management tabs"
            variant="fullWidth"
          >
            <Tab
              icon={<MapIcon />}
              label="Mapa Interactivo"
              id="units-tab-0"
              aria-controls="units-tabpanel-0"
            />
            <Tab
              icon={<TableIcon />}
              label="Vista de Tabla"
              id="units-tab-1"
              aria-controls="units-tabpanel-1"
            />
          </Tabs>
        </Box>

        {/* Panel del Mapa Interactivo */}
        <TabPanel value={tabValue} index={0}>
          <MapaCondominioInteractivo onUnidadSelect={handleUnidadSelect} />
        </TabPanel>

        {/* Panel de Vista de Tabla */}
        <TabPanel value={tabValue} index={1}>
          <PropertyManagement />
        </TabPanel>
      </Card>

      {/* Información de la unidad seleccionada */}
      {selectedUnidad && tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Unidad Seleccionada: {selectedUnidad.numero} - Bloque {selectedUnidad.bloque_nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUnidad.tipo} • {selectedUnidad.area_m2} m² • Piso {selectedUnidad.piso}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleSwitchToTable}
                  size="small"
                >
                  Ver más detalles en tabla
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default UnitsManagement;