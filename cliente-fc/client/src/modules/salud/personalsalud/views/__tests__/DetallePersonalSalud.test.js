import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DetallePersonalSalud from '../DetallePersonalSalud';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../../../../../services/personalsaludServices', () => ({
  getPersonalSaludId: jest.fn(),
}));

jest.mock('../../../../../services/apiConfig', () => ({
  BASE_API_URL: 'http://localhost:5000',
}));

const { getPersonalSaludId } = require('../../../../../services/personalsaludServices');

const mockPersonalData = {
  id_personalsalud: 1,
  nombres_personal: 'Juan Carlos',
  apellidos_personal: 'Pérez García',
  dni_personal: '12345678',
  tipo_dni_personal: 'Cédula',
  direccion_personal: 'Av. Principal 123',
  telefono_personal: '0987654321',
  email_personal: 'juan@example.com',
  fecha_nacimiento_personal: '1990-05-15',
  nacionalidad_personal: 'Ecuatoriana',
  estado_personal: true,
  titulos_personal: 'Médico General',
  licencia_personal: 'LIC-001',
  nombre_especialidad: 'Medicina General',
  descripcion_tipo_especialidad: 'Tipo A',
  fecha_registro_personal: '2023-01-10',
  foto_personal: '/uploads/personalsalud/foto1.jpg',
  hdv_personal: '/uploads/personalsalud/hdv1.pdf',
};

const renderComponent = (id = '1') =>
  render(
    React.createElement(MemoryRouter, { initialEntries: ['/detalle/' + id] },
      React.createElement(Routes, null,
        React.createElement(Route, {
          path: '/detalle/:id',
          element: React.createElement(DetallePersonalSalud),
        })
      )
    )
  );

describe('DetallePersonalSalud', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    getPersonalSaludId.mockResolvedValue(mockPersonalData);

    renderComponent();

    expect(screen.getByText('Detalles del Personal de Salud')).toBeInTheDocument();
    expect(screen.getAllByText('Cargando...').length).toBeGreaterThan(0);
  });

  it('fetches personal data on mount with id from URL', async () => {
    getPersonalSaludId.mockResolvedValue(mockPersonalData);

    renderComponent('5');

    await waitFor(() => {
      expect(getPersonalSaludId).toHaveBeenCalledWith('5');
    });
  });

  it('renders personal details after loading', async () => {
    getPersonalSaludId.mockResolvedValue(mockPersonalData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Juan Carlos Pérez García')).toBeInTheDocument();
    });

    expect(screen.getByText('Cédula: 12345678')).toBeInTheDocument();
    expect(screen.getByText('Av. Principal 123')).toBeInTheDocument();
    expect(screen.getByText('0987654321')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Ecuatoriana')).toBeInTheDocument();
    expect(screen.getByText('LIC-001')).toBeInTheDocument();
    expect(screen.getAllByText('Médico General').length).toBeGreaterThan(0);
    expect(screen.getByText('Medicina General')).toBeInTheDocument();
    expect(screen.getByText('Tipo A')).toBeInTheDocument();
  });

  it('shows Activo chip when estado_personal is true', async () => {
    getPersonalSaludId.mockResolvedValue(mockPersonalData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Activo')).toBeInTheDocument();
    });
  });

  it('shows Ver Hoja de Vida button when hdv_personal exists', async () => {
    getPersonalSaludId.mockResolvedValue(mockPersonalData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Ver Hoja de Vida')).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', async () => {
    getPersonalSaludId.mockResolvedValue(mockPersonalData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('ArrowBackIcon')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ArrowBackIcon').closest('button'));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getPersonalSaludId.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it('shows N/A for missing optional fields', async () => {
    getPersonalSaludId.mockResolvedValue({
      id_personalsalud: 2,
      nombres_personal: 'Ana',
      apellidos_personal: 'García',
      estado_personal: false,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Ana García')).toBeInTheDocument();
    });

    const naElements = screen.getAllByText('N/A');
    expect(naElements.length).toBeGreaterThan(0);
  });

  it('handles image error and shows fallback after 3 errors', async () => {
    getPersonalSaludId.mockResolvedValue(mockPersonalData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Juan Carlos Pérez García')).toBeInTheDocument();
    });

    const avatarImg = screen.getByRole('img');
    fireEvent.error(avatarImg);
    fireEvent.error(avatarImg);
    fireEvent.error(avatarImg);

    await waitFor(() => {
      expect(screen.getAllByTestId('PersonIcon').length).toBeGreaterThanOrEqual(2);
    });
  });
});
