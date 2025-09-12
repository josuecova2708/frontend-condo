import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PersonOff,
  PersonAdd,
} from '@mui/icons-material';
import { User, UserFormData } from '../../types';
import { userService, handleApiError } from '../../services/api';
import UserForm from './UserForm';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers(1, searchTerm);
      
      // Asegurar que results es un array válido
      const usersData = response?.results || [];
      setUsers(usersData);
    } catch (error: any) {
      setError(handleApiError(error));
      setUsers([]); // Asegurar que users siempre sea un array
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar usuarios
  const handleSearch = () => {
    loadUsers();
  };

  // Función para abrir formulario de crear usuario
  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Función para abrir formulario de editar usuario
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Función para confirmar eliminación de usuario
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Función para eliminar usuario
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await userService.deleteUser(selectedUser.id);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Función para cambiar estado del usuario
  const handleToggleUserStatus = async (user: User) => {
    try {
      setActionLoading(true);
      await userService.toggleUserStatus(user.id);
      await loadUsers();
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Función para manejar el envío del formulario
  const handleFormSubmit = async (formData: UserFormData) => {
    try {
      setActionLoading(true);
      
      if (formMode === 'create') {
        await userService.createUser(formData);
      } else if (selectedUser) {
        await userService.updateUser(selectedUser.id, formData);
      }
      
      setIsFormOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      throw error; // El error se maneja en el formulario
    } finally {
      setActionLoading(false);
    }
  };

  // Función para cerrar formulario
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = (users || []).filter(user =>
    user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Encabezado */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                  Gestión de Usuarios
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateUser}
                  disabled={loading}
                >
                  Nuevo Usuario
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Gestiona los usuarios del sistema, crea nuevos usuarios, edita información existente y controla el acceso.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controles de búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por usuario, email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  Buscar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadUsers}
                  disabled={loading}
                >
                  Actualizar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Mostrar error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabla de usuarios */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Información</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No se encontraron usuarios
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={user.avatar}>
                            {user.first_name?.[0] || user.username?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {user.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {user.full_name || 'Sin nombre'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.telefono && `Tel: ${user.telefono}`}
                            {user.cedula && ` • CI: ${user.cedula}`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.role_name ? (
                          <Chip
                            label={user.role_name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label="Sin rol"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={user.is_active ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Editar usuario">
                            <IconButton
                              size="small"
                              onClick={() => handleEditUser(user)}
                              disabled={actionLoading}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleUserStatus(user)}
                              disabled={actionLoading}
                              color={user.is_active ? 'error' : 'success'}
                            >
                              {user.is_active ? <PersonOff /> : <PersonAdd />}
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar usuario">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteUser(user)}
                              disabled={actionLoading}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Formulario de usuario */}
      <UserForm
        open={isFormOpen}
        mode={formMode}
        user={selectedUser}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
        loading={actionLoading}
      />

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser?.username}</strong>?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDeleteUser}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;