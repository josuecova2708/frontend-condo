import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  User,
  Role,
  Permission,
  Condominio,
  ConfiguracionSistema,
  PaginatedResponse,
  UserFormData,
  PasswordChangeData,
  UnidadHabitacional,
  UnidadFormData,
  Bloque,
  Propietario,
  PropietarioFormData,
  Residente,
  AvisoComunicado,
  AvisoFormData,
  MapLayoutResponse,
  // Finance module types
  Infraccion,
  InfraccionFormData,
  Cargo,
  CargoFormData,
  ConfiguracionMultas,
  ConfiguracionMultasFormData,
  AplicarMultaData,
  ProcesarPagoData,
  ResultadoPago,
  EstadisticasInfracciones,
  ResumenPropietario,
  FiltrosInfracciones,
  FiltrosCargos,
  TipoInfraccion,
  EstadoInfraccion,
  TipoCargo,
  EstadoCargo
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

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    try {
      const response: AxiosResponse<Permission[]> = await api.get(`/users/roles/${roleId}/permissions/`);
      return response.data;
    } catch (error: any) {
      console.error(`Error obteniendo permisos del rol ${roleId}:`, error.message || error);
      throw error;
    }
  },

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<any> {
    try {
      const response: AxiosResponse<any> = await api.post(`/users/roles/${roleId}/assign_permission/`, {
        permission_id: permissionId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error asignando permiso ${permissionId} al rol ${roleId}:`, error.message || error);
      throw error;
    }
  },

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<any> {
    try {
      const response: AxiosResponse<any> = await api.post(`/users/roles/${roleId}/remove_permission/`, {
        permission_id: permissionId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error removiendo permiso ${permissionId} del rol ${roleId}:`, error.message || error);
      throw error;
    }
  },

  async syncRolePermissions(roleId: number, permissionIds: number[]): Promise<any> {
    try {
      const response: AxiosResponse<any> = await api.post(`/users/roles/${roleId}/sync_permissions/`, {
        permission_ids: permissionIds
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error sincronizando permisos del rol ${roleId}:`, error.message || error);
      throw error;
    }
  },
};

// Servicios de permisos
export const permissionService = {
  async getPermissions(): Promise<Permission[]> {
    try {
      const response: AxiosResponse<PaginatedResponse<Permission>> = await api.get('/users/permissions/');

      if (!response.data) {
        console.warn('Respuesta de permisos vacía');
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

      console.error('Respuesta de permisos con formato inválido:', response.data);
      return [];

    } catch (error: any) {
      console.error('Error obteniendo permisos:', error.message || error);
      throw error;
    }
  },

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    try {
      const response: AxiosResponse<PaginatedResponse<Permission>> = await api.get(`/users/permissions/?modulo=${module}`);

      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }

      return [];
    } catch (error: any) {
      console.error(`Error obteniendo permisos del módulo ${module}:`, error.message || error);
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

  async createPropietario(data: PropietarioFormData): Promise<Propietario> {
    const response: AxiosResponse<Propietario> = await api.post('/properties/propietarios/', data);
    return response.data;
  },

  async updatePropietario(id: number, data: Partial<PropietarioFormData>): Promise<Propietario> {
    const response: AxiosResponse<Propietario> = await api.patch(`/properties/propietarios/${id}/`, data);
    return response.data;
  },

  async deletePropietario(id: number): Promise<void> {
    await api.delete(`/properties/propietarios/${id}/`);
  },

  async togglePropietarioStatus(id: number): Promise<Propietario> {
    const response: AxiosResponse<Propietario> = await api.patch(`/properties/propietarios/${id}/toggle-status/`);
    return response.data;
  },

  async getUsuariosSinUnidad(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await api.get('/properties/propietarios/usuarios_sin_unidad/');
    return response.data;
  },

  async getUnidadesDisponibles(): Promise<UnidadHabitacional[]> {
    const response: AxiosResponse<UnidadHabitacional[]> = await api.get('/properties/unidades/sin_propietario/');
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

// ======================
// SERVICIOS FINANCIEROS - CU11
// ======================
export const financeService = {
  // ========== INFRACCIONES ==========
  async getInfracciones(page: number = 1, filtros?: FiltrosInfracciones): Promise<PaginatedResponse<Infraccion>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filtros) {
      if (filtros.search) params.append('search', filtros.search);
      if (filtros.estado?.length) params.append('estado', filtros.estado.join(','));
      if (filtros.tipo_infraccion?.length) params.append('tipo_infraccion', filtros.tipo_infraccion.join(','));
      if (filtros.propietario) params.append('propietario', filtros.propietario.toString());
      if (filtros.unidad) params.append('unidad', filtros.unidad.toString());
      if (filtros.es_reincidente !== undefined) params.append('es_reincidente', filtros.es_reincidente.toString());
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    }

    const response: AxiosResponse<PaginatedResponse<Infraccion>> = await api.get(`/finances/api/infracciones/?${params}`);
    return response.data;
  },

  async getInfraccion(id: number): Promise<Infraccion> {
    const response: AxiosResponse<Infraccion> = await api.get(`/finances/api/infracciones/${id}/`);
    return response.data;
  },

  async createInfraccion(data: InfraccionFormData): Promise<Infraccion> {
    const response: AxiosResponse<Infraccion> = await api.post('/finances/api/infracciones/', data);
    return response.data;
  },

  async updateInfraccion(id: number, data: Partial<InfraccionFormData>): Promise<Infraccion> {
    const response: AxiosResponse<Infraccion> = await api.patch(`/finances/api/infracciones/${id}/`, data);
    return response.data;
  },

  async deleteInfraccion(id: number): Promise<void> {
    await api.delete(`/finances/api/infracciones/${id}/`);
  },

  async getInfraccionesPendientes(): Promise<Infraccion[]> {
    const response: AxiosResponse<Infraccion[]> = await api.get('/finances/api/infracciones/pendientes/');
    return response.data;
  },

  async aplicarMulta(data: AplicarMultaData): Promise<Cargo> {
    const response: AxiosResponse<Cargo> = await api.post('/finances/api/infracciones/aplicar_multa/', data);
    return response.data;
  },

  async confirmarInfraccion(id: number, observaciones?: string): Promise<Infraccion> {
    const response: AxiosResponse<Infraccion> = await api.post(`/finances/api/infracciones/${id}/confirmar/`, {
      observaciones_admin: observaciones
    });
    return response.data;
  },

  async rechazarInfraccion(id: number, observaciones: string): Promise<Infraccion> {
    const response: AxiosResponse<Infraccion> = await api.post(`/finances/api/infracciones/${id}/rechazar/`, {
      observaciones_admin: observaciones
    });
    return response.data;
  },

  // ========== CARGOS ==========
  async getCargos(page: number = 1, filtros?: FiltrosCargos): Promise<PaginatedResponse<Cargo>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filtros) {
      if (filtros.search) params.append('search', filtros.search);
      if (filtros.estado?.length) params.append('estado', filtros.estado.join(','));
      if (filtros.tipo_cargo?.length) params.append('tipo_cargo', filtros.tipo_cargo.join(','));
      if (filtros.propietario) params.append('propietario', filtros.propietario.toString());
      if (filtros.unidad) params.append('unidad', filtros.unidad.toString());
      if (filtros.es_recurrente !== undefined) params.append('es_recurrente', filtros.es_recurrente.toString());
      if (filtros.esta_vencido !== undefined) params.append('esta_vencido', filtros.esta_vencido.toString());
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    }

    const response: AxiosResponse<PaginatedResponse<Cargo>> = await api.get(`/finances/api/cargos/?${params}`);
    return response.data;
  },

  async getCargo(id: number): Promise<Cargo> {
    const response: AxiosResponse<Cargo> = await api.get(`/finances/api/cargos/${id}/`);
    return response.data;
  },

  async createCargo(data: CargoFormData): Promise<Cargo> {
    const response: AxiosResponse<Cargo> = await api.post('/finances/api/cargos/', data);
    return response.data;
  },

  async updateCargo(id: number, data: Partial<CargoFormData>): Promise<Cargo> {
    const response: AxiosResponse<Cargo> = await api.patch(`/finances/api/cargos/${id}/`, data);
    return response.data;
  },

  async deleteCargo(id: number): Promise<void> {
    await api.delete(`/finances/api/cargos/${id}/`);
  },

  async getCargosVencidos(): Promise<Cargo[]> {
    const response: AxiosResponse<Cargo[]> = await api.get('/finances/api/cargos/vencidos/');
    return response.data;
  },

  async procesarPago(data: ProcesarPagoData): Promise<ResultadoPago> {
    const response: AxiosResponse<ResultadoPago> = await api.post('/finances/api/cargos/procesar_pago/', data);
    return response.data;
  },

  async generarIntereses(): Promise<{ cargos_generados: number; total_intereses: number }> {
    const response = await api.post('/finances/api/cargos/generar_intereses/');
    return response.data;
  },

  // ========== CONFIGURACIÓN MULTAS ==========
  async getConfiguracionMultas(): Promise<ConfiguracionMultas[]> {
    const response: AxiosResponse<ConfiguracionMultas[]> = await api.get('/finances/api/configuracion-multas/');
    // Asegurar que siempre devolvemos un array
    return Array.isArray(response.data) ? response.data : [];
  },

  async getConfiguracionMulta(id: number): Promise<ConfiguracionMultas> {
    const response: AxiosResponse<ConfiguracionMultas> = await api.get(`/finances/api/configuracion-multas/${id}/`);
    return response.data;
  },

  async createConfiguracionMulta(data: ConfiguracionMultasFormData): Promise<ConfiguracionMultas> {
    const response: AxiosResponse<ConfiguracionMultas> = await api.post('/finances/api/configuracion-multas/', data);
    return response.data;
  },

  async updateConfiguracionMulta(id: number, data: Partial<ConfiguracionMultasFormData>): Promise<ConfiguracionMultas> {
    const response: AxiosResponse<ConfiguracionMultas> = await api.patch(`/finances/api/configuracion-multas/${id}/`, data);
    return response.data;
  },

  async deleteConfiguracionMulta(id: number): Promise<void> {
    await api.delete(`/finances/api/configuracion-multas/${id}/`);
  },

  // ========== ESTADÍSTICAS Y REPORTES ==========
  async getEstadisticasInfracciones(): Promise<EstadisticasInfracciones> {
    const response: AxiosResponse<EstadisticasInfracciones> = await api.get('/finances/api/infracciones/estadisticas/');
    return response.data;
  },

  async getResumenPorPropietario(): Promise<ResumenPropietario[]> {
    const response: AxiosResponse<ResumenPropietario[]> = await api.get('/finances/api/cargos/resumen_por_propietario/');
    return response.data;
  },

  async getDetallesPropietario(propietarioId: number): Promise<{
    propietario: Propietario;
    infracciones: Infraccion[];
    cargos: Cargo[];
    total_pendiente: number;
    total_vencido: number;
  }> {
    const response = await api.get(`/finances/api/propietarios/${propietarioId}/detalle-financiero/`);
    return response.data;
  },

  // ========== UTILIDADES ==========
  async getMontoMulta(tipoInfraccion: TipoInfraccion, esReincidente: boolean = false): Promise<{ monto: number }> {
    const response = await api.get(`/finances/api/configuracion-multas/calcular-monto/`, {
      params: { tipo_infraccion: tipoInfraccion, es_reincidente: esReincidente }
    });
    return response.data;
  },

  async validarInfraccion(data: InfraccionFormData): Promise<{
    es_valida: boolean;
    errores?: string[];
    monto_sugerido?: number;
    es_reincidente?: boolean;
  }> {
    const response = await api.post('/finances/api/infracciones/validar/', data);
    return response.data;
  }
};

// ======================
// Configuraciones del Sistema
// ======================
export const configService = {
  async getConfiguraciones(page: number = 1, search?: string, categoria?: string): Promise<PaginatedResponse<ConfiguracionSistema>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);
    if (categoria) params.append('categoria', categoria);

    const response: AxiosResponse<PaginatedResponse<ConfiguracionSistema>> = await api.get(`/core/configuraciones/?${params}`);
    return response.data;
  },

  async getConfiguracion(id: number): Promise<ConfiguracionSistema> {
    const response: AxiosResponse<ConfiguracionSistema> = await api.get(`/core/configuraciones/${id}/`);
    return response.data;
  },

  async deleteConfiguracion(id: number): Promise<void> {
    await api.delete(`/core/configuraciones/${id}/`);
  },

  async getConfiguracionesPorCategoria(): Promise<{ [categoria: string]: ConfiguracionSistema[] }> {
    try {
      const response = await this.getConfiguraciones(1, '', '');
      const configuraciones = response.results || [];

      // Agrupar por categoría
      const grouped = configuraciones.reduce((acc, config) => {
        const categoria = config.categoria || 'Sin categoría';
        if (!acc[categoria]) {
          acc[categoria] = [];
        }
        acc[categoria].push(config);
        return acc;
      }, {} as { [categoria: string]: ConfiguracionSistema[] });

      return grouped;
    } catch (error) {
      throw error;
    }
  }
};

export default api;