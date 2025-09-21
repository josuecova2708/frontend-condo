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

// Tipos para configuraciones del sistema
export interface ConfiguracionSistema {
  id: number;
  clave: string;
  valor: string;
  descripcion?: string;
  tipo: 'string' | 'integer' | 'float' | 'boolean' | 'json';
  categoria?: string;
  created_at: string;
  updated_at: string;
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
  area_m2?: number;
  num_habitaciones?: number;
  num_banos?: number;
  tiene_parqueadero?: boolean;
  observaciones?: string;
  is_active?: boolean;
}

// Tipos para el mapa interactivo
export interface MapPosition {
  x: number;
  y: number;
}

export interface AreaComun {
  nombre: string;
  coordenadas: MapPosition;
  width: number;
  height: number;
}

export interface BloqueConfig {
  unidades_numeros: number[];
  color: string;
  position: MapPosition;
}

export interface MapConfig {
  bloques: {
    [key: string]: BloqueConfig;
  };
  areas_comunes: AreaComun[];
}

export interface BloqueData {
  nombre: string;
  unidades: UnidadHabitacional[];
}

export interface MapLayoutResponse {
  map_config: MapConfig;
  bloques_data: {
    [key: string]: BloqueData;
  };
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

export interface PropietarioFormData {
  user: number;
  unidad: number;
  porcentaje_propiedad: number;
  fecha_inicio: string;
  fecha_fin?: string;
  is_active?: boolean;
  documento_propiedad?: File;
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

// ===============================
// TIPOS PARA MÓDULO FINANCIERO (CU11)
// ===============================

// Enums para infracciones
export type TipoInfraccion =
  | 'ruido_excesivo'
  | 'uso_inadecuado_areas'
  | 'mascota_sin_correa'
  | 'basura_horario'
  | 'parqueadero_incorrecto'
  | 'modificacion_sin_permiso'
  | 'otros';

export type EstadoInfraccion =
  | 'registrada'
  | 'en_revision'
  | 'confirmada'
  | 'rechazada'
  | 'multa_aplicada'
  | 'pagada';

export type TipoCargo =
  | 'cuota_mensual'
  | 'expensa_extraordinaria'
  | 'multa'
  | 'interes_mora'
  | 'otros';

export type EstadoCargo =
  | 'pendiente'
  | 'parcialmente_pagado'
  | 'pagado'
  | 'vencido'
  | 'cancelado';

// Tipos para infracciones
export interface Infraccion {
  id: number;
  propietario: number;
  unidad: number;
  tipo_infraccion: TipoInfraccion;
  descripcion: string;
  fecha_infraccion: string;
  evidencia_url?: string;
  reportado_por?: number;
  monto_multa?: number;
  fecha_limite_pago?: string;
  estado: EstadoInfraccion;
  observaciones_admin?: string;
  es_reincidente: boolean;
  created_at: string;
  updated_at: string;

  // Campos relacionados del serializer
  propietario_info?: Propietario;
  unidad_info?: UnidadHabitacional;
  reportado_por_info?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
  };

  // Campos calculados
  puede_aplicar_multa?: boolean;
  dias_para_pago?: number;
  esta_vencida?: boolean;
  tipo_infraccion_display?: string;
  estado_display?: string;

  // Campos para el list serializer
  propietario_nombre?: string;
  unidad_numero?: string;
  bloque_nombre?: string;
}

// Tipos para cargos
export interface Cargo {
  id: number;
  propietario: number;
  unidad: number;
  concepto: string;
  tipo_cargo: TipoCargo;
  monto: number;
  moneda: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: EstadoCargo;
  es_recurrente: boolean;
  periodo?: string;
  infraccion?: number;
  monto_pagado: number;
  tasa_interes_mora: number;
  observaciones?: string;
  created_at: string;
  updated_at: string;

  // Campos relacionados
  propietario_info?: Propietario;
  unidad_info?: UnidadHabitacional;
  infraccion_info?: Infraccion;

  // Campos calculados
  saldo_pendiente?: number;
  esta_vencido?: boolean;
  dias_vencido?: number;
  interes_mora_calculado?: number;
  monto_total_con_intereses?: number;
  tipo_cargo_display?: string;
  estado_display?: string;

  // Campos para el list serializer
  propietario_nombre?: string;
  unidad_numero?: string;
  bloque_nombre?: string;
}

// Tipos para configuración de multas
export interface ConfiguracionMultas {
  id: number;
  tipo_infraccion: TipoInfraccion;
  monto_base: number;
  monto_reincidencia: number;
  dias_para_pago: number;
  es_activa: boolean;
  descripcion?: string;
  created_at: string;
  updated_at: string;
  tipo_infraccion_display?: string;
}

// Formularios para infracciones
export interface InfraccionFormData {
  propietario: number;
  unidad: number;
  tipo_infraccion: TipoInfraccion;
  descripcion: string;
  fecha_infraccion: string;
  evidencia_url?: string;
  reportado_por?: number;
  observaciones_admin?: string;
}

// Formularios para cargos
export interface CargoFormData {
  propietario: number;
  unidad: number;
  concepto: string;
  tipo_cargo: TipoCargo;
  monto: number;
  moneda?: string;
  fecha_vencimiento: string;
  es_recurrente?: boolean;
  periodo?: string;
  tasa_interes_mora?: number;
  observaciones?: string;
}

// Formularios para configuración de multas
export interface ConfiguracionMultasFormData {
  tipo_infraccion: TipoInfraccion;
  monto_base: number;
  monto_reincidencia: number;
  dias_para_pago: number;
  es_activa?: boolean;
  descripcion?: string;
}

// Tipos para operaciones específicas
export interface AplicarMultaData {
  infraccion_id: number;
  monto_personalizado?: number;
  observaciones_admin?: string;
}

export interface ProcesarPagoData {
  cargo_id: number;
  monto_pago: number;
  metodo_pago?: string;
  observaciones?: string;
}

export interface ResultadoPago {
  cargo: Cargo;
  cargo_interes?: Cargo;
  saldo_restante: number;
  pago_completo: boolean;
  mensaje: string;
}

// Estadísticas de infracciones
export interface EstadisticasInfracciones {
  total_infracciones: number;
  registradas: number;
  confirmadas: number;
  rechazadas: number;
  multas_aplicadas: number;
  multas_pagadas: number;
  por_tipo: { [key: string]: number };
}

// Resumen por propietario
export interface ResumenPropietario {
  propietario_id: number;
  propietario__user__first_name: string;
  propietario__user__last_name: string;
  propietario__unidad__numero: string;
  propietario__unidad__bloque__nombre: string;
  total_cargos: number;
  monto_total: number;
  monto_pagado_total: number;
  cargos_pendientes: number;
  cargos_vencidos: number;
}

// Filtros para búsquedas
export interface FiltrosInfracciones {
  estado?: EstadoInfraccion[];
  tipo_infraccion?: TipoInfraccion[];
  propietario?: number;
  unidad?: number;
  es_reincidente?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
}

export interface FiltrosCargos {
  estado?: EstadoCargo[];
  tipo_cargo?: TipoCargo[];
  propietario?: number;
  unidad?: number;
  es_recurrente?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
  esta_vencido?: boolean;
  search?: string;
}