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
  PasswordChangeData
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
    
    const response: AxiosResponse<PaginatedResponse<User>> = await api.get(`/users/?${params}`);
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response: AxiosResponse<User> = await api.get(`/users/${id}/`);
    return response.data;
  },

  async createUser(data: UserFormData): Promise<User> {
    const response: AxiosResponse<User> = await api.post('/users/', data);
    return response.data;
  },

  async updateUser(id: number, data: Partial<UserFormData>): Promise<User> {
    const response: AxiosResponse<User> = await api.patch(`/users/${id}/`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}/`);
  },

  async toggleUserStatus(id: number): Promise<User> {
    const response: AxiosResponse<User> = await api.patch(`/users/${id}/toggle-status/`);
    return response.data;
  },
};

// Servicios de roles
export const roleService = {
  async getRoles(): Promise<Role[]> {
    const response: AxiosResponse<Role[]> = await api.get('/users/roles/');
    return response.data;
  },

  async getRole(id: number): Promise<Role> {
    const response: AxiosResponse<Role> = await api.get(`/users/roles/${id}/`);
    return response.data;
  },
};

// Servicios de condominios
export const condominioService = {
  async getCondominios(): Promise<Condominio[]> {
    const response: AxiosResponse<Condominio[]> = await api.get('/core/condominios/');
    return response.data;
  },

  async getCondominio(id: number): Promise<Condominio> {
    const response: AxiosResponse<Condominio> = await api.get(`/core/condominios/${id}/`);
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