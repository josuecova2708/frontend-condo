import api from './api';

export interface Vehicle {
  id: number;
  user: number;
  user_name: string;
  placa: string;
  color: string;
  modelo: string;
  marca: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleAccessLog {
  id: number;
  vehicle: number | null;
  vehicle_info: Vehicle | null;
  placa_detectada: string;
  confianza_ocr: number;
  resultado: 'autorizado' | 'denegado' | 'desconocido';
  imagen: string;
  timestamp_evento: string;
  created_at: string;
  updated_at: string;
}

export interface OCRResult {
  success: boolean;
  plate: string | null;
  confidence: number;
  resultado: 'autorizado' | 'denegado' | 'desconocido';
  message: string;
  vehicle_info: Vehicle | null;
  extracted_text: string | null;
  access_log_id: number | null;
}

class VehicleService {
  // Gestión de vehículos
  async getVehicles(): Promise<Vehicle[]> {
    const response = await api.get('/ai-security/api/vehicles/');
    return response.data.results || response.data;
  }

  async getMyVehicles(): Promise<Vehicle[]> {
    const response = await api.get('/ai-security/api/vehicles/my_vehicles/');
    return response.data;
  }

  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'user' | 'user_name' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    const response = await api.post('/ai-security/api/vehicles/', vehicleData);
    return response.data;
  }

  async updateVehicle(id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const response = await api.put(`/ai-security/api/vehicles/${id}/`, vehicleData);
    return response.data;
  }

  async deleteVehicle(id: number): Promise<void> {
    await api.delete(`/ai-security/api/vehicles/${id}/`);
  }

  // Logs de acceso
  async getAccessLogs(): Promise<VehicleAccessLog[]> {
    const response = await api.get('/ai-security/api/access-logs/');
    return response.data.results || response.data;
  }

  // OCR de placas
  async recognizePlate(imageFile: File): Promise<OCRResult> {
    const formData = new FormData();
    formData.append('imagen', imageFile);

    const response = await api.post('/ai-security/api/ocr/recognize_plate/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async testOCRService(): Promise<any> {
    const response = await api.get('/ai-security/api/ocr/test_service/');
    return response.data;
  }

  // Entrenamiento OCR
  async trainOCR(accessLogId: number, placaCorrecta: string): Promise<any> {
    const response = await api.post('/ai-security/api/ocr/train_ocr/', {
      access_log_id: accessLogId,
      placa_correcta: placaCorrecta
    });
    return response.data;
  }

  async getTrainingStats(): Promise<any> {
    const response = await api.get('/ai-security/api/ocr/training_stats/');
    return response.data;
  }
}

export default new VehicleService();