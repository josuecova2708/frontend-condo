import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthContextType 
} from '../types';
import { authService, handleApiError } from '../services/api';

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contexto de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  // Función para verificar si el usuario está autenticado
  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        setToken(storedToken);
        // Obtener perfil del usuario
        const userData = await authService.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Limpiar tokens si hay error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para iniciar sesión
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      
      // Guardar tokens en localStorage
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Actualizar estado
      setToken(response.access);
      setUser(response.user);
      
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para registrar usuario
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(data);
      
      // Guardar tokens en localStorage
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      
      // Actualizar estado
      setToken(response.tokens.access);
      setUser(response.user);
      
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar estado local independientemente del resultado de la API
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  // Función para actualizar el usuario en el contexto (comentada porque no se usa)
  // const updateUser = (userData: User) => {
  //   setUser(userData);
  // };

  // Función para limpiar errores (comentada porque no se usa)
  // const clearError = () => {
  //   setError(null);
  // };

  // Valor del contexto
  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    register,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook para verificar si el usuario está autenticado
export const useIsAuthenticated = (): boolean => {
  const { user, token } = useAuth();
  return !!(user && token);
};

// Hook para verificar si el usuario tiene un rol específico
export const useHasRole = (roleName: string): boolean => {
  const { user } = useAuth();
  return user?.role_name === roleName;
};

// Hook para verificar si el usuario tiene permisos de administrador
export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.role_name === 'Administrador' || user?.is_staff === true;
};

export default AuthContext;