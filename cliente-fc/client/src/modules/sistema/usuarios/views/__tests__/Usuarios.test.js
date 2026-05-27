import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual };
});

jest.mock('../../../../../services/usuarioServices', () => ({
  getUsuarios: jest.fn(),
  createUsuario: jest.fn(),
  updateUsuario: jest.fn(),
  deleteUsuario: jest.fn(),
}));

jest.mock('../../../../../services/auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../../../utils/userUtils', () => ({
  getCurrentUserId: jest.fn(() => 1),
}));

jest.mock('../../../../../components/NavbarAdmin', () => {
  const R = require('react');
  const Mock = R.forwardRef((props, ref) =>
    R.createElement('div', { 'data-testid': 'navbar-admin' })
  );
  Mock.displayName = 'NavbarAdmin';
  return Mock;
});

jest.mock('../../../../../components/Drawer', () => {
  const R = require('react');
  return (props) => R.createElement('div', { 'data-testid': 'drawer' });
});

jest.mock('../../components/ModalAddUsuario', () => {
  const R = require('react');
  return (props) =>
    R.createElement('div', { 'data-testid': 'modal-add-usuario' },
      props.open ? R.createElement('span', null, 'Modal Abierto') : null
    );
});

jest.mock('../../components/TablaUsuarios', () => {
  const R = require('react');
  return ({ users, searchTerm, handleEdit, handleActivate, handleDelete }) =>
    R.createElement('div', { 'data-testid': 'tabla-usuarios' },
      R.createElement('span', { 'data-testid': 'user-count' }, `Users: ${users.length}`),
      users.filter(u => !searchTerm || u.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase())).map(u =>
        R.createElement('div', { key: u.id_usuario, 'data-testid': `user-${u.id_usuario}` },
          R.createElement('span', null, u.nombre_usuario),
          R.createElement('button', { 'data-testid': `edit-${u.id_usuario}`, onClick: () => handleEdit(u) }, 'Edit'),
          R.createElement('button', { 'data-testid': `activate-${u.id_usuario}`, onClick: () => handleActivate(u) }, 'Toggle'),
          R.createElement('button', { 'data-testid': `delete-${u.id_usuario}`, onClick: () => handleDelete(u) }, 'Delete'),
        )
      )
    );
});

import Usuarios from '../Usuarios';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../../../../../services/usuarioServices';
import { logAuditAction } from '../../../../../services/auditoriaServices';

const sampleUsers = [
  { id_usuario: 1, nombre_usuario: 'Admin', email_usuario: 'admin@test.com', rol_usuario: 'admin', estado_usuario: true },
  { id_usuario: 2, nombre_usuario: 'Doctor', email_usuario: 'doctor@test.com', rol_usuario: 'doctor', estado_usuario: true },
];

const renderComponent = () =>
  render(
    React.createElement(MemoryRouter, null,
      React.createElement(Usuarios)
    )
  );

describe('Usuarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUsuarios.mockResolvedValue(sampleUsers);
    const userUtils = require('../../../../../utils/userUtils');
    userUtils.getCurrentUserId.mockImplementation(() => 1);
  });

  test('renders loading state then user list', async () => {
    renderComponent();

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('tabla-usuarios')).toBeInTheDocument();
    });

    expect(screen.getByText('Users: 2')).toBeInTheDocument();
  });

  test('fetches users on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(getUsuarios).toHaveBeenCalled();
    });
  });

  test('renders header and search', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
    });

    expect(screen.getByText('Gestión de usuarios de la aplicación.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar usuarios...')).toBeInTheDocument();
    expect(screen.getByText('Agregar usuario')).toBeInTheDocument();
  });

  test('shows error state on fetch failure', async () => {
    getUsuarios.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Error fetching users')).toBeInTheDocument();
    });
  });

  test('filters users by search term', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('tabla-usuarios')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    fireEvent.change(searchInput, { target: { value: 'Admin' } });

    expect(screen.getByTestId('user-1')).toBeInTheDocument();
  });

  test('opens modal when Agregar usuario is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Agregar usuario')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Agregar usuario'));

    expect(screen.getByText('Modal Abierto')).toBeInTheDocument();
  });

  test('handles edit user', async () => {
    updateUsuario.mockResolvedValue({ id_usuario: 1 });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-1'));

    await waitFor(() => {
      expect(updateUsuario).toHaveBeenCalledWith(1, sampleUsers[0]);
      expect(logAuditAction).toHaveBeenCalledWith('EDITAR_USUARIO', expect.objectContaining({
        accion: 'EDITAR',
        tabla: 'usuarios',
        id_registro: 1,
      }));
    });
  });

  test('handles activate toggle user', async () => {
    updateUsuario.mockResolvedValue({ id_usuario: 2 });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('activate-2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('activate-2'));

    await waitFor(() => {
      expect(updateUsuario).toHaveBeenCalledWith(2, { ...sampleUsers[1], estado_usuario: false });
      expect(logAuditAction).toHaveBeenCalledWith('DESACTIVAR_USUARIO', expect.objectContaining({
        id_registro: 2,
      }));
    });
  });

  test('handles delete user', async () => {
    deleteUsuario.mockResolvedValue({});

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-1'));

    await waitFor(() => {
      expect(deleteUsuario).toHaveBeenCalledWith(1);
      expect(logAuditAction).toHaveBeenCalledWith('ELIMINAR_USUARIO', expect.objectContaining({
        accion: 'ELIMINAR',
        id_registro: 1,
      }));
    });
  });

  test('handles edit when no user logged in', async () => {
    const userUtils = require('../../../../../utils/userUtils');
    userUtils.getCurrentUserId.mockReturnValue(null);
    updateUsuario.mockResolvedValue({ id_usuario: 1 });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-1'));

    await waitFor(() => {
      expect(logAuditAction).not.toHaveBeenCalled();
    });
  });
});
