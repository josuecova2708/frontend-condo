import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { UnidadHabitacional, UnidadFormData, Bloque } from '../../types';
import { bloqueService, handleApiError } from '../../services/api';

interface UnidadFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  unidad?: UnidadHabitacional | null;
  onSubmit: (data: UnidadFormData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const UnidadForm: React.FC<UnidadFormProps> = ({
  open,
  mode,
  unidad,
  onSubmit,
  onClose,
  loading = false
}) => {
  const [formData, setFormData] = useState<UnidadFormData>({
    bloque: 0,
    numero: '',
    piso: 1,
    tipo: 'departamento',
    area_m2: undefined,
    num_habitaciones: undefined,
    num_banos: undefined,
    tiene_balcon: false,
    tiene_parqueadero: false,
    observaciones: '',
    is_active: true,
  });

  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingBloques, setLoadingBloques] = useState<boolean>(false);

  // Cargar bloques al abrir el formulario
  useEffect(() => {
    if (open) {
      loadBloques();
    }
  }, [open]);

  // Cargar datos de la unidad en modo edición
  useEffect(() => {
    if (open && mode === 'edit' && unidad) {
      setFormData({
        bloque: unidad.bloque,
        numero: unidad.numero,
        piso: unidad.piso,
        tipo: unidad.tipo,
        area_m2: unidad.area_m2,
        num_habitaciones: unidad.num_habitaciones,
        num_banos: unidad.num_banos,
        tiene_balcon: unidad.tiene_balcon,
        tiene_parqueadero: unidad.tiene_parqueadero,
        observaciones: unidad.observaciones,
        is_active: unidad.is_active,
      });
    } else if (open && mode === 'create') {
      // Resetear formulario para nuevo
      setFormData({
        bloque: 0,
        numero: '',
        piso: 1,
        tipo: 'departamento',
        area_m2: undefined,
        num_habitaciones: undefined,
        num_banos: undefined,
        tiene_balcon: false,
        tiene_parqueadero: false,
        observaciones: '',
        is_active: true,
      });
    }
    setError(null);
  }, [open, mode, unidad]);

  const loadBloques = async () => {
    try {
      setLoadingBloques(true);
      const bloquesData = await bloqueService.getBloques();
      console.log(bloquesData)
      setBloques(Array.isArray(bloquesData) ? bloquesData : []);
    } catch (error) {
      setError('Error al cargar los bloques disponibles');
      setBloques([]); // Asegurar que siempre sea un array
    } finally {
      setLoadingBloques(false);
    }
  };

  const handleInputChange = (field: keyof UnidadFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.bloque) {
      setError('Por favor selecciona un bloque');
      return;
    }
    
    if (!formData.numero.trim()) {
      setError('El número de unidad es requerido');
      return;
    }
    
    if (formData.piso < 1) {
      setError('El piso debe ser mayor a 0');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Nueva Unidad Habitacional' : 'Editar Unidad Habitacional'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Bloque y Número */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Bloque</InputLabel>
                <Select
                  value={formData.bloque}
                  label="Bloque"
                  onChange={(e) => handleInputChange('bloque', e.target.value as number)}
                  disabled={loadingBloques}
                >
                  <MenuItem value={0} disabled>
                    {loadingBloques ? 'Cargando...' : 'Seleccionar bloque'}
                  </MenuItem>
                  {Array.isArray(bloques) && bloques.map((bloque) => (
                    <MenuItem key={bloque.id} value={bloque.id}>
                      {bloque.nombre} - {bloque.condominio_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Número de Unidad"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                placeholder="Ej: 101, A-1, etc."
              />
            </Grid>

            {/* Piso y Tipo */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Piso"
                value={formData.piso}
                onChange={(e) => handleInputChange('piso', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Unidad</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo de Unidad"
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                >
                  <MenuItem value="departamento">Departamento</MenuItem>
                  <MenuItem value="casa">Casa</MenuItem>
                  <MenuItem value="oficina">Oficina</MenuItem>
                  <MenuItem value="local_comercial">Local Comercial</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Área y Habitaciones */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Área (m²)"
                value={formData.area_m2 || ''}
                onChange={(e) => handleInputChange('area_m2', e.target.value ? parseFloat(e.target.value) : undefined)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Número de Habitaciones"
                value={formData.num_habitaciones || ''}
                onChange={(e) => handleInputChange('num_habitaciones', e.target.value ? parseInt(e.target.value) : undefined)}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Número de Baños"
                value={formData.num_banos || ''}
                onChange={(e) => handleInputChange('num_banos', e.target.value ? parseInt(e.target.value) : undefined)}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Características */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.tiene_balcon}
                      onChange={(e) => handleInputChange('tiene_balcon', e.target.checked)}
                    />
                  }
                  label="Tiene balcón"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.tiene_parqueadero}
                      onChange={(e) => handleInputChange('tiene_parqueadero', e.target.checked)}
                    />
                  }
                  label="Tiene parqueadero"
                />
                
                {mode === 'edit' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      />
                    }
                    label="Activo"
                  />
                )}
              </Box>
            </Grid>

            {/* Observaciones */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                placeholder="Comentarios adicionales sobre la unidad..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || loadingBloques}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading 
              ? (mode === 'create' ? 'Creando...' : 'Guardando...')
              : (mode === 'create' ? 'Crear Unidad' : 'Guardar Cambios')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UnidadForm;