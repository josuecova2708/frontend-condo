import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CloudUpload as UploadIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import vehicleService, { OCRResult } from '../../services/vehicleService';

interface VehicleOCRProps {
  onResult?: (result: OCRResult) => void;
}

const VehicleOCR: React.FC<VehicleOCRProps> = ({ onResult }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Por favor seleccione un archivo de imagen válido');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processImage = async () => {
    if (!selectedFile) {
      setError('Por favor seleccione una imagen primero');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const ocrResult = await vehicleService.recognizePlate(selectedFile);
      setResult(ocrResult);

      if (onResult) {
        onResult(ocrResult);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error procesando la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getResultColor = (resultado: string) => {
    switch (resultado) {
      case 'autorizado':
        return 'text-green-600';
      case 'denegado':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getResultIcon = (resultado: string) => {
    switch (resultado) {
      case 'autorizado':
        return '✅';
      case 'denegado':
        return '❌';
      default:
        return '⚠️';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Card elevation={3}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 48, height: 48 }}>
              <SearchIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2" fontWeight="bold">
                Reconocimiento OCR de Placas Vehiculares
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Sube una imagen para detectar y validar placas automáticamente
              </Typography>
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Área de subida de archivos */}
          <Paper
            elevation={2}
            sx={{
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
              cursor: 'pointer'
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {preview ? (
              <Box>
                {/* Preview con tamaño controlado */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', maxWidth: 400 }}>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }}
                    />
                    <Chip
                      label="Preview"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white'
                      }}
                    />
                  </Box>
                </Box>

                {/* Botones mejorados */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={processImage}
                    disabled={isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={20} /> : <SearchIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                      boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                    }}
                  >
                    {isProcessing ? 'Procesando...' : 'Procesar Imagen'}
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={clearSelection}
                    startIcon={<ClearIcon />}
                    color="secondary"
                  >
                    Limpiar
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <CameraIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Arrastra una imagen aquí o haz clic para seleccionar
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Formatos soportados: JPEG, PNG, BMP (máx. 10MB)
                </Typography>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="contained"
                    component="span"
                    size="large"
                    startIcon={<UploadIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                      boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                    }}
                  >
                    Seleccionar Imagen
                  </Button>
                </label>
              </Box>
            )}
          </Paper>

          {/* Indicador de procesamiento */}
          {isProcessing && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography color="primary" fontWeight="medium">
                  Procesando imagen con OCR...
                </Typography>
              </Box>
            </Box>
          )}

          {/* Mostrar errores */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Mostrar resultados */}
          {result && (
            <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <StatsIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Resultados del OCR
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Placa Detectada:</Typography>
                  <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
                    {result.plate || 'No detectada'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Confianza:</Typography>
                  <Typography variant="h5" color="primary">
                    {result.confidence.toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Resultado:</Typography>
                  <Chip
                    label={`${getResultIcon(result.resultado)} ${result.resultado.toUpperCase()}`}
                    color={result.resultado === 'autorizado' ? 'success' : result.resultado === 'denegado' ? 'error' : 'warning'}
                    size="medium"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Mensaje:</Typography>
                  <Typography>{result.message}</Typography>
                </Grid>
                {result.vehicle_info && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Información del Vehículo:</Typography>
                    <Typography>Propietario: {result.vehicle_info.user_name}</Typography>
                    <Typography>Marca: {result.vehicle_info.marca}</Typography>
                    <Typography>Modelo: {result.vehicle_info.modelo}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}

          {/* Información adicional */}
          <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: 'info.light' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              ℹ️ Información del Sistema
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2">Formatos: JPEG, PNG, BMP</Typography>
                <Typography variant="body2">Tamaño máx: 10MB</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2">Placas bolivianas: 1234-ABC, 123-ABC, ABC-123</Typography>
                <Typography variant="body2">Precisión: {'>'}90% en condiciones óptimas</Typography>
              </Grid>
            </Grid>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VehicleOCR;