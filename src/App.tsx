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
              
              {/* Rutas futuras */}
              <Route
                path="properties"
                element={
                  <div>Gestión de Propiedades - En desarrollo</div>
                }
              />
              
              <Route
                path="communications"
                element={
                  <div>Comunicados - En desarrollo</div>
                }
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
