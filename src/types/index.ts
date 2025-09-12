// Tipos para el usuario
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telefono?: string;
  cedula?: string;
  fecha_nacimiento?: string;
  avatar?: string;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login?: string;
  role?: Role;
  role_name?: string;
  condominio?: Condominio;
  condominio_name?: string;
  full_name: string;
}

// Tipos para roles y permisos
export interface Role {
  id: number;
  nombre: string;
  descripcion?: string;
  is_active: boolean;
  permissions_count: number;
}

export interface Permission {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  modulo: string;
}

// Tipos para condominio
export interface Condominio {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  nit: string;
  logo?: string;
  is_active: boolean;
}

// Tipos para autenticación
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  telefono?: string;
  cedula?: string;
  fecha_nacimiento?: string;
  condominio?: number;
  role?: number;
}

// Tipos para contexto de autenticación
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Tipos para API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Tipos para formularios de usuario
export interface UserFormData {
  username: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  telefono?: string;
  cedula?: string;
  fecha_nacimiento?: string;
  role?: number;
  condominio?: number;
  is_active?: boolean;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

// Tipos para navegación
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  title: string;
}

// Tipos para propiedades
export interface Bloque {
  id: number;
  nombre: string;
  descripcion?: string;
  numero_pisos: number;
  condominio: number;
  condominio_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnidadHabitacional {
  id: number;
  bloque: number;
  bloque_nombre?: string;
  condominio_nombre?: string;
  numero: string;
  piso: number;
  tipo: 'departamento' | 'casa' | 'oficina' | 'local_comercial';
  area_m2?: number;
  num_habitaciones?: number;
  num_banos?: number;
  tiene_balcon: boolean;
  tiene_parqueadero: boolean;
  observaciones?: string;
  is_active: boolean;
  direccion_completa?: string;
  created_at: string;
  updated_at: string;
}

export interface UnidadFormData {
  bloque: number;
  numero: string;
  piso: number;
  tipo: 'departamento' | 'casa' | 'oficina' | 'local_comercial';
  area_m2?: number;
  num_habitaciones?: number;
  num_banos?: number;
  tiene_balcon?: boolean;
  tiene_parqueadero?: boolean;
  observaciones?: string;
  is_active?: boolean;
}

export interface Propietario {
  id: number;
  user: number;
  user_full_name?: string;
  user_email?: string;
  user_telefono?: string;
  unidad: number;
  unidad_numero?: string;
  bloque_nombre?: string;
  porcentaje_propiedad: number;
  fecha_inicio: string;
  fecha_fin?: string;
  is_active: boolean;
  documento_propiedad?: string;
  created_at: string;
  updated_at: string;
}

export interface Residente {
  id: number;
  user: number;
  user_full_name?: string;
  user_email?: string;
  user_telefono?: string;
  unidad: number;
  unidad_numero?: string;
  bloque_nombre?: string;
  relacion: 'propietario' | 'arrendatario' | 'familiar' | 'empleado_domestico' | 'otro';
  relacion_display?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  is_active: boolean;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

// Tipos para comunicaciones
export interface AvisoComunicado {
  id: number;
  titulo: string;
  contenido: string;
  preview_contenido?: string;
  tipo: 'aviso' | 'comunicado' | 'noticia' | 'urgente' | 'mantenimiento';
  tipo_display?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  prioridad_display?: string;
  condominio: number;
  condominio_nombre?: string;
  autor: number;
  autor_name?: string;
  fecha_publicacion: string;
  fecha_expiracion?: string;
  is_active: boolean;
  is_published: boolean;
  is_expired?: boolean;
  archivo_adjunto?: string;
  imagen?: string;
  lecturas_count?: number;
  created_at: string;
  updated_at: string;
}

// Tipos para formularios de avisos
export interface AvisoFormData {
  titulo: string;
  contenido: string;
  tipo: 'aviso' | 'comunicado' | 'noticia' | 'urgente' | 'mantenimiento';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  condominio: number;
  fecha_publicacion: string;
  fecha_expiracion?: string;
  is_active?: boolean;
  is_published?: boolean;
  archivo_adjunto?: File;
  imagen?: File;
}

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}