import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import DashboardHome from './pages/DashboardHome';
import UserManagement from './components/users/UserManagement';
import Properties from './pages/Properties';
import Communications from './pages/Communications';
import UnitsManagement from './pages/UnitsManagement';
import RolesPermissions from './pages/RolesPermissions';
import SystemConfig from './pages/SystemConfig';
import UserProfile from './pages/UserProfile';
import Finances from './pages/Finances';
import Infracciones from './pages/Infracciones';
import Cargos from './pages/Cargos';
import AreasComunes from './components/areas-comunes/AreasComunes';
import Mantenimiento from './components/mantenimiento/Mantenimiento';

// Tema personalizado para Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ruta raíz - redirige al dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Ruta de login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas del dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              {/* Página de inicio del dashboard */}
              <Route index element={<DashboardHome />} />
              
              {/* Gestión de usuarios - Solo para administradores */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="Administrador">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* Gestión de roles y permisos - Solo para administradores */}
              <Route
                path="roles-permissions"
                element={
                  <ProtectedRoute requiredRole="Administrador">
                    <RolesPermissions />
                  </ProtectedRoute>
                }
              />

              {/* Gestionar unidades habitacionales - Solo para administradores */}
              <Route
                path="units-map"
                element={
                  <ProtectedRoute requiredRole="Administrador">
                    <UnitsManagement />
                  </ProtectedRoute>
                }
              />

              {/* Gestión de propiedades */}
              <Route
                path="properties"
                element={<Properties />}
              />

              {/* Gestión de comunicados */}
              <Route
                path="communications"
                element={<Communications />}
              />

              {/* Gestión financiera - Multas y penalizaciones */}
              <Route
                path="finances"
                element={
                  <ProtectedRoute requiredRole="Administrador">
                    <Finances />
                  </ProtectedRoute>
                }
              />

              {/* Gestión de infracciones */}
              <Route
                path="infracciones"
                element={
                  <ProtectedRoute requiredRole="Administrador">
                    <Infracciones />
                  </ProtectedRoute>
                }
              />

              {/* Gestión de cargos */}
              <Route
                path="cargos"
                element={
                  <ProtectedRoute requiredRole="Administrador">
                    <Cargos />
                  </ProtectedRoute>
                }
              />

              {/* CU13 - Gestión de áreas comunes */}
              <Route
                path="areas-comunes"
                element={
                  <ProtectedRoute requiredRole="Administrador">
                    <AreasComunes />
                  </ProtectedRoute>
                }
              />

              {/* Gestión de mantenimiento */}
              <Route
                path="mantenimiento"
                element={
                  <ProtectedRoute requiredRole="Administrador">
                    <Mantenimiento />
                  </ProtectedRoute>
                }
              />

              {/* Gestionar configuración del sistema - Solo para administradores */}
              <Route
                path="system-config"
                element={
                  <ProtectedRoute requiredRole="Administrador">
                    <SystemConfig />
                  </ProtectedRoute>
                }
              />

              {/* Gestionar perfil de usuario */}
              <Route
                path="user-profile"
                element={<UserProfile />}
              />
            </Route>
            
            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
