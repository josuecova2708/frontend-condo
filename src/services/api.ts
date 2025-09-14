import axios, { AxiosResponse, AxiosError } from 'axios';
import { 
  LoginCredentials, 
  LoginResponse, 
  RegisterData, 
  User, 
  Role, 
  Condominio,
  PaginatedResponse,
  UserFormData,
  PasswordChangeData,
  UnidadHabitacional,
  UnidadFormData,
  Bloque,
  Propietario,
  Residente,
  AvisoComunicado,
  AvisoFormData,
  MapLayoutResponse
} from '../types';

// Configuración base de Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar renovar
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await refreshAccessToken(refreshToken);
          localStorage.setItem('access_token', response.access);
          
          // Reintentar la petición original
          const originalRequest = error.config;
          if (originalRequest) {
            originalRequest.headers.Authorization = `Bearer ${response.access}`;
            return api.request(originalRequest);
          }
        } catch (refreshError) {
          // Error al renovar token, cerrar sesión
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        // No hay refresh token, redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await api.post('/auth/login/', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<{ user: User; tokens: { access: string; refresh: string } }> {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout/', { refresh: refreshToken });
  },

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await api.get('/auth/profile/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await api.patch('/auth/profile/update/', data);
    return response.data;
  },

  async changePassword(data: PasswordChangeData): Promise<void> {
    await api.post('/auth/change-password/', {
      old_password: data.old_password,
      new_password: data.new_password,
    });
  },
};

// Función para renovar token de acceso
export const refreshAccessToken = async (refreshToken: string): Promise<{ access: string }> => {
  const response: AxiosResponse<{ access: string }> = await api.post('/auth/token/refresh/', {
    refresh: refreshToken,
  });
  return response.data;
};

// Servicios de usuarios
export const userService = {
  async getUsers(page: number = 1, search?: string): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);
    
    const response: AxiosResponse<PaginatedResponse<User>> = await api.get(`/users/manage/?${params}`);
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response: AxiosResponse<User> = await api.get(`/users/manage/${id}/`);
    return response.data;
  },

  async createUser(data: UserFormData): Promise<User> {
    const response: AxiosResponse<User> = await api.post('/users/manage/', data);
    return response.data;
  },

  async updateUser(id: number, data: Partial<UserFormData>): Promise<User> {
    const response: AxiosResponse<User> = await api.patch(`/users/manage/${id}/`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/manage/${id}/`);
  },

  async toggleUserStatus(id: number): Promise<User> {
    const response: AxiosResponse<User> = await api.patch(`/users/manage/${id}/toggle-status/`);
    return response.data;
  },
};

// Servicios de roles
export const roleService = {
  async getRoles(): Promise<Role[]> {
    try {
      const response: AxiosResponse<PaginatedResponse<Role>> = await api.get('/users/roles/');
      
      if (!response.data) {
        console.warn('Respuesta de roles vacía');
        return [];
      }
      
      // Verificar si es una respuesta paginada con 'results'
      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      
      // Si no es paginada, verificar si es un array directo
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.error('Respuesta de roles con formato inválido:', response.data);
      return [];
      
    } catch (error: any) {
      console.error('Error obteniendo roles:', error.message || error);
      throw error;
    }
  },

  async getRole(id: number): Promise<Role> {
    try {
      const response: AxiosResponse<Role> = await api.get(`/users/roles/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error(`Error obteniendo rol ${id}:`, error.message || error);
      throw error;
    }
  },
};

// Servicios de condominios
export const condominioService = {
  async getCondominios(): Promise<Condominio[]> {
    try {
      const response: AxiosResponse<PaginatedResponse<Condominio>> = await api.get('/core/condominios/');
      
      if (!response.data) {
        console.warn('Respuesta de condominios vacía');
        return [];
      }
      
      // Verificar si es una respuesta paginada con 'results'
      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      
      // Si no es paginada, verificar si es un array directo
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.error('Respuesta de condominios con formato inválido:', response.data);
      return [];
      
    } catch (error: any) {
      console.error('Error obteniendo condominios:', error.message || error);
      throw error;
    }
  },

  async getCondominio(id: number): Promise<Condominio> {
    try {
      const response: AxiosResponse<Condominio> = await api.get(`/core/condominios/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error(`Error obteniendo condominio ${id}:`, error.message || error);
      throw error;
    }
  },
};

// Servicios de bloques
export const bloqueService = {
  async getBloques(): Promise<Bloque[]> {
    const response: AxiosResponse<PaginatedResponse<Bloque>> = await api.get('/core/bloques/');
    return response.data.results;
  },

  async getBloque(id: number): Promise<Bloque> {
    const response: AxiosResponse<Bloque> = await api.get(`/core/bloques/${id}/`);
    return response.data;
  },
};

// Servicios de propiedades
export const propertyService = {
  // Unidades habitacionales
  async getUnidades(page: number = 1, search?: string): Promise<PaginatedResponse<UnidadHabitacional>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);
    
    const response: AxiosResponse<PaginatedResponse<UnidadHabitacional>> = await api.get(`/properties/unidades/?${params}`);
    return response.data;
  },

  async getUnidad(id: number): Promise<UnidadHabitacional> {
    const response: AxiosResponse<UnidadHabitacional> = await api.get(`/properties/unidades/${id}/`);
    return response.data;
  },

  async createUnidad(data: UnidadFormData): Promise<UnidadHabitacional> {
    const response: AxiosResponse<UnidadHabitacional> = await api.post('/properties/unidades/', data);
    return response.data;
  },

  async updateUnidad(id: number, data: Partial<UnidadFormData>): Promise<UnidadHabitacional> {
    const response: AxiosResponse<UnidadHabitacional> = await api.patch(`/properties/unidades/${id}/`, data);
    return response.data;
  },

  async deleteUnidad(id: number): Promise<void> {
    await api.delete(`/properties/unidades/${id}/`);
  },

  async toggleUnidadStatus(id: number): Promise<UnidadHabitacional> {
    const response: AxiosResponse<UnidadHabitacional> = await api.patch(`/properties/unidades/${id}/toggle-status/`);
    return response.data;
  },

  async getMapLayout(): Promise<MapLayoutResponse> {
    const response: AxiosResponse<MapLayoutResponse> = await api.get('/properties/unidades/map_layout/');
    return response.data;
  },

  // Propietarios
  async getPropietarios(page: number = 1, search?: string): Promise<PaginatedResponse<Propietario>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);
    
    const response: AxiosResponse<PaginatedResponse<Propietario>> = await api.get(`/properties/propietarios/?${params}`);
    return response.data;
  },

  async getPropietario(id: number): Promise<Propietario> {
    const response: AxiosResponse<Propietario> = await api.get(`/properties/propietarios/${id}/`);
    return response.data;
  },

  // Residentes
  async getResidentes(page: number = 1, search?: string): Promise<PaginatedResponse<Residente>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);
    
    const response: AxiosResponse<PaginatedResponse<Residente>> = await api.get(`/properties/residentes/?${params}`);
    return response.data;
  },

  async getResidente(id: number): Promise<Residente> {
    const response: AxiosResponse<Residente> = await api.get(`/properties/residentes/${id}/`);
    return response.data;
  },
};

// Servicios de comunicaciones
export const communicationService = {
  async getAvisos(page: number = 1, search?: string): Promise<PaginatedResponse<AvisoComunicado>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);
    
    const response: AxiosResponse<PaginatedResponse<AvisoComunicado>> = await api.get(`/communications/avisos/?${params}`);
    return response.data;
  },

  async getAviso(id: number): Promise<AvisoComunicado> {
    const response: AxiosResponse<AvisoComunicado> = await api.get(`/communications/avisos/${id}/`);
    return response.data;
  },

  async createAviso(data: AvisoFormData): Promise<AvisoComunicado> {
    try {
      // Preparar FormData para archivos si los hay
      const formData = new FormData();
      
      // Campos básicos
      formData.append('titulo', data.titulo);
      formData.append('contenido', data.contenido);
      formData.append('tipo', data.tipo);
      formData.append('prioridad', data.prioridad);
      formData.append('condominio', data.condominio.toString());
      formData.append('fecha_publicacion', data.fecha_publicacion);
      
      // Campos opcionales
      if (data.fecha_expiracion) {
        formData.append('fecha_expiracion', data.fecha_expiracion);
      }
      
      formData.append('is_active', (data.is_active || true).toString());
      formData.append('is_published', (data.is_published || false).toString());
      
      // Archivos
      if (data.archivo_adjunto) {
        formData.append('archivo_adjunto', data.archivo_adjunto);
      }
      
      if (data.imagen) {
        formData.append('imagen', data.imagen);
      }
      
      const response: AxiosResponse<AvisoComunicado> = await api.post('/communications/avisos/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error creando aviso:', error);
      throw error;
    }
  },

  async updateAviso(id: number, data: Partial<AvisoFormData>): Promise<AvisoComunicado> {
    const response: AxiosResponse<AvisoComunicado> = await api.patch(`/communications/avisos/${id}/`, data);
    return response.data;
  },

  async deleteAviso(id: number): Promise<void> {
    await api.delete(`/communications/avisos/${id}/`);
  },

  async marcarComoLeido(id: number): Promise<void> {
    await api.post(`/communications/avisos/${id}/marcar-como-leido/`);
  },

  async getEstadisticas(): Promise<any> {
    const response = await api.get('/communications/avisos/estadisticas/');
    return response.data;
  },
};

// Utilidades para manejo de errores
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  if (error.response?.data && typeof error.response.data === 'object') {
    const firstKey = Object.keys(error.response.data)[0];
    const firstError = error.response.data[firstKey];
    
    if (Array.isArray(firstError)) {
      return firstError[0];
    }
    
    if (typeof firstError === 'string') {
      return firstError;
    }
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Ha ocurrido un error inesperado';
};

export default api;