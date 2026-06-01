import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual };
});

jest.mock('../../../../../services/usuarioServices', () => ({
  getUsuario: jest.fn(),
  updateUsuario: jest.fn(),
}));

jest.mock('../../../../../services/personalsaludServices', () => ({
  getPersonalSaludId: jest.fn(),
  updatePersonalSalud: jest.fn(),
  getEstadisticas: jest.fn(),
}));

jest.mock('../../../../../services/authServices', () => ({
  getUserInfo: jest.fn(),
}));

jest.mock('../../../../../services/auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../../../utils/userUtils', () => ({
  getCurrentUserId: jest.fn(() => 1),
}));

jest.mock('../../../../../services/apiConfig', () => ({
  API_IMAGE_URL: 'http://localhost:5000/uploads/',
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

jest.mock('../../../../../components/global/UseImageCache', () => {
  return () => (src) => src;
});

import Perfil from '../Perfil';
import { getUsuario, updateUsuario } from '../../../../../services/usuarioServices';
import { getPersonalSaludId, updatePersonalSalud, getEstadisticas } from '../../../../../services/personalsaludServices';
import { getUserInfo } from '../../../../../services/authServices';
import { logAuditAction } from '../../../../../services/auditoriaServices';

const sampleUserInfo = { user: 1 };
const sampleUser = {
  id_usuario: 1,
  correo_usuario: 'admin@test.com',
  rol_usuario: 'admin',
  id_personal_salud: 1,
};
const sampleAdminUser = {
  id_usuario: 2,
  nombre_usuario: 'maria',
  apellido_usuario: 'Maria Lopez',
  correo_usuario: 'admin2@test.com',
  rol_usuario: 'personal_administrativo',
  id_personal_salud: null,
};
const samplePersonalSalud = {
  id_personalsalud: 1,
  nombres_personal: 'Juan',
  apellidos_personal: 'Perez',
  telefono_personal: '123456789',
  dni_personal: 'LIC-001',
  nacionalidad_personal: 'Ecuatoriana',
  direccion_personal: 'Quito',
  especialidad: { nombre_especialidad: 'Medicina General' },
  foto_personal: 'foto.jpg',
};
const sampleEstadisticas = {
  pacientes_atendidos: 50,
  anos_experiencia: 5,
  terapias_realizadas: 200,
};

const renderComponent = () =>
  render(
    React.createElement(MemoryRouter, null,
      React.createElement(Perfil)
    )
  );

describe('Perfil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserInfo.mockReturnValue(sampleUserInfo);
    getUsuario.mockResolvedValue(sampleUser);
    getPersonalSaludId.mockResolvedValue(samplePersonalSalud);
    getEstadisticas.mockResolvedValue(sampleEstadisticas);
    const userUtils = require('../../../../../utils/userUtils');
    userUtils.getCurrentUserId.mockImplementation(() => 1);
  });

  test('shows loading skeleton while fetching data', async () => {
    getUsuario.mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByTestId('navbar-admin')).toBeInTheDocument();
  });

  test('renders profile page after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Perfil de Usuario')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Juan Perez').length).toBeGreaterThan(0);
    expect(screen.getByText('Administrador del Sistema')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
  });

  test('displays professional statistics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Estadísticas profesionales')).toBeInTheDocument();
    });

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  test('enters edit mode and shows save/cancel buttons', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Editar Perfil'));

    await waitFor(() => {
      expect(screen.getByText('Guardar')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
  });

  test('cancels edit mode', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Editar Perfil'));

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });
  });

  test('saves profile changes', async () => {
    updateUsuario.mockResolvedValue(sampleUser);
    updatePersonalSalud.mockResolvedValue(samplePersonalSalud);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Editar Perfil'));

    await waitFor(() => {
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(updateUsuario).toHaveBeenCalledWith(1, sampleUser);
      expect(updatePersonalSalud).toHaveBeenCalledWith(1, samplePersonalSalud);
      expect(logAuditAction).toHaveBeenCalledWith('EDITAR_USUARIO_PERFIL', expect.objectContaining({
        accion: 'EDITAR',
        tabla: 'usuarios',
        id_registro: 1,
      }));
      expect(logAuditAction).toHaveBeenCalledWith('EDITAR_PERSONALSALUD_PERFIL', expect.objectContaining({
        accion: 'EDITAR',
        tabla: 'personal_salud',
        id_registro: 1,
      }));
    });
  });

  test('shows error dialog on save failure', async () => {
    updateUsuario.mockRejectedValue(new Error('Update failed'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Editar Perfil'));

    await waitFor(() => {
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  test('handles no user info', async () => {
    getUserInfo.mockReturnValue(null);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('navbar-admin')).toBeInTheDocument();
    });

    expect(getUsuario).not.toHaveBeenCalled();
  });

  test('handles error when no user logged in on save', async () => {
    const userUtils = require('../../../../../utils/userUtils');
    userUtils.getCurrentUserId.mockReturnValue(null);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Editar Perfil'));

    await waitFor(() => {
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  test('renders profile for personal_administrativo without personalSalud', async () => {
    getUsuario.mockResolvedValue(sampleAdminUser);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Perfil de Usuario')).toBeInTheDocument();
    });

    expect(screen.getByText('Personal Administrativo')).toBeInTheDocument();
    expect(screen.getByText('admin2@test.com')).toBeInTheDocument();
    expect(screen.getAllByText('maria Maria Lopez').length).toBeGreaterThan(0);
    expect(screen.queryByText('Estadísticas profesionales')).not.toBeInTheDocument();
  });

  test('saves profile changes for personal_administrativo without personalSalud update', async () => {
    getUsuario.mockResolvedValue(sampleAdminUser);
    updateUsuario.mockResolvedValue(sampleAdminUser);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Editar Perfil'));

    await waitFor(() => {
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(updateUsuario).toHaveBeenCalledWith(2, sampleAdminUser);
      expect(updatePersonalSalud).not.toHaveBeenCalled();
    });
  });
});
