import api from './api';

// Interfaces
export interface PersonProfile {
  id: number;
  name: string;
  person_type: string;
  person_type_display: string;
  photo: string;
  is_authorized: boolean;
  user?: number;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface FacialAccessLog {
  id: number;
  person_profile?: PersonProfile;
  photo: string;
  confidence_score: number;
  access_granted: boolean;
  access_result_display: string;
  location: string;
  detected_name: string;
  timestamp_evento: string;
}

export interface FacialRecognitionResult {
  success: boolean;
  person_profile?: PersonProfile;
  confidence: number;
  access_granted: boolean;
  message: string;
  access_log_id?: number;
  error?: string;
}

export interface PersonRegistrationData {
  imagen: File;
  name: string;
  person_type: string;
  is_authorized: boolean;
  user?: number;
}

export interface FacialIdentificationData {
  imagen: File;
  location: string;
}

export interface FacialStats {
  total_profiles: number;
  authorized_profiles: number;
  total_access_logs: number;
  recent_access_24h: number;
  monthly_stats: {
    authorized_access: number;
    denied_access: number;
    total_attempts: number;
  };
}

class FacialRecognitionService {
  private readonly baseURL = '/ai-security/api';

  // Gestión de perfiles
  async getProfiles(): Promise<PersonProfile[]> {
    const response = await api.get(`${this.baseURL}/person-profiles/`);
    return response.data;
  }

  async getAuthorizedProfiles(): Promise<PersonProfile[]> {
    const response = await api.get(`${this.baseURL}/person-profiles/authorized_profiles/`);
    return response.data;
  }

  async toggleAuthorization(profileId: number): Promise<{ success: boolean; message: string; is_authorized: boolean }> {
    const response = await api.post(`${this.baseURL}/person-profiles/${profileId}/toggle_authorization/`);
    return response.data;
  }

  async deleteProfile(profileId: number): Promise<void> {
    await api.delete(`${this.baseURL}/person-profiles/${profileId}/`);
  }

  // Logs de acceso
  async getAccessLogs(): Promise<FacialAccessLog[]> {
    const response = await api.get(`${this.baseURL}/facial-access-logs/`);
    return response.data;
  }

  async getRecentAccess(): Promise<FacialAccessLog[]> {
    const response = await api.get(`${this.baseURL}/facial-access-logs/recent_access/`);
    return response.data;
  }

  // Reconocimiento facial
  async identifyPerson(data: FacialIdentificationData): Promise<FacialRecognitionResult> {
    const formData = new FormData();
    formData.append('imagen', data.imagen);
    formData.append('location', data.location);

    const response = await api.post(`${this.baseURL}/facial-recognition/identify_person/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async registerPerson(data: PersonRegistrationData): Promise<{ success: boolean; person_profile?: PersonProfile; message: string; error?: string }> {
    const formData = new FormData();
    formData.append('imagen', data.imagen);
    formData.append('name', data.name);
    formData.append('person_type', data.person_type);
    formData.append('is_authorized', data.is_authorized.toString());

    if (data.user) {
      formData.append('user', data.user.toString());
    }

    const response = await api.post(`${this.baseURL}/facial-recognition/register_person/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Estadísticas
  async getStats(): Promise<{ success: boolean; stats: FacialStats }> {
    const response = await api.get(`${this.baseURL}/facial-recognition/stats/`);
    return response.data;
  }

  // Test del servicio
  async testService(): Promise<{ message: string; version: string; features: string[] }> {
    const response = await api.get(`${this.baseURL}/facial-recognition/test_service/`);
    return response.data;
  }
}

export default new FacialRecognitionService();