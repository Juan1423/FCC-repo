import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../../../components/NavbarAdmin', () => {
  const R = require('react');
  const Mock = R.forwardRef((props, ref) =>
    R.createElement('div', { 'data-testid': 'navbar-admin' })
  );
  Mock.displayName = 'NavbarAdmin';
  return Mock;
});

jest.mock('../../../components/Drawer', () => {
  const R = require('react');
  return (props) => R.createElement('div', { 'data-testid': 'drawer' });
});

jest.mock('../../../components/base/MenuContext', () => ({
  useMenu: () => ({ setCurrentMenu: jest.fn() }),
}));

import SistemaDashboard from '../SistemaDashboard';

const renderComponent = () =>
  render(
    React.createElement(MemoryRouter, null,
      React.createElement(SistemaDashboard)
    )
  );

describe('SistemaDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the dashboard title and description', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Gestión del Sistema')).toBeInTheDocument();
    });

    expect(screen.getByText('Administración y configuración del sistema')).toBeInTheDocument();
  });

  test('renders all 4 navigation cards', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Auditoría')).toBeInTheDocument();
      expect(screen.getByText('Personal de Salud')).toBeInTheDocument();
      expect(screen.getByText('Configuración')).toBeInTheDocument();
    });
  });

  test('renders correct descriptions for each card', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Gestión de los usuarios del sistema')).toBeInTheDocument();
      expect(screen.getByText('Gestión de las peticiones realizadas')).toBeInTheDocument();
      expect(screen.getByText('Gestión del personal de la fundación')).toBeInTheDocument();
      expect(screen.getByText('Configuración general del sistema')).toBeInTheDocument();
    });
  });

  test('navigates to usuarios page on card click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Usuarios'));

    expect(mockNavigate).toHaveBeenCalledWith('/fcc-usuarios');
  });

  test('navigates to auditoria page on card click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Auditoría')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Auditoría'));

    expect(mockNavigate).toHaveBeenCalledWith('/fcc-auditoria');
  });

  test('navigates to personal-salud page on card click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Personal de Salud')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Personal de Salud'));

    expect(mockNavigate).toHaveBeenCalledWith('/fcc-personal-salud');
  });

  test('navigates to configuracion page on card click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Configuración')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Configuración'));

    expect(mockNavigate).toHaveBeenCalledWith('/fcc-configuracion');
  });

  test('renders navbar and drawer', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('navbar-admin')).toBeInTheDocument();
    });

    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });
});
