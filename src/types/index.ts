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

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}