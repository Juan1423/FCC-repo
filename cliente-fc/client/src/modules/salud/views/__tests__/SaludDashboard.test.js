import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SaludDashboard from '../../SaludDashboard';

const mockNavigate = jest.fn();
const mockSetCurrentMenu = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return Object.assign(Object.assign({}, actual), { useNavigate: () => mockNavigate });
});

jest.mock('../../../../components/NavbarAdmin', () => {
  const react = require('react');
  const MockNavbarAdmin = function (props) {
    return react.createElement('div', { 'data-testid': 'navbar-admin' });
  };
  return { __esModule: true, default: MockNavbarAdmin };
});

jest.mock('../../../../components/Drawer', () => {
  const react = require('react');
  const MockDrawer = function (props) {
    return react.createElement('div', { 'data-testid': 'drawer' });
  };
  return { __esModule: true, default: MockDrawer };
});

jest.mock('../../../../components/base/MenuContext', () => ({
  useMenu: function () { return { setCurrentMenu: mockSetCurrentMenu }; }
}));

describe('SaludDashboard', () => {
  afterEach(function () {
    jest.clearAllMocks();
  });

  test('renders Navbar, Drawer, and title Gestion de Salud', function () {
    render(React.createElement(SaludDashboard));

    expect(screen.getByTestId('navbar-admin')).toBeInTheDocument();
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
    expect(screen.getByText('Gesti\u00f3n de Salud')).toBeInTheDocument();
  });

  test('shows 4 navigation cards with correct titles', function () {
    render(React.createElement(SaludDashboard));

    expect(screen.getByText('Pacientes')).toBeInTheDocument();
    expect(screen.getByText('Historias Cl\u00ednicas')).toBeInTheDocument();
    expect(screen.getByText('Atenci\u00f3n')).toBeInTheDocument();
    expect(screen.getByText('Terapias')).toBeInTheDocument();
  });

  test('clicking a card navigates to the correct route', function () {
    render(React.createElement(SaludDashboard));

    fireEvent.click(screen.getByText('Pacientes'));
    expect(mockNavigate).toHaveBeenCalledWith('/fcc-pacientes');

    fireEvent.click(screen.getByText('Historias Cl\u00ednicas'));
    expect(mockNavigate).toHaveBeenCalledWith('/fcc-historias-clinicas');

    fireEvent.click(screen.getByText('Atenci\u00f3n'));
    expect(mockNavigate).toHaveBeenCalledWith('/fcc-atencion');

    fireEvent.click(screen.getByText('Terapias'));
    expect(mockNavigate).toHaveBeenCalledWith('/fcc-terapias');
  });

  test('calls setCurrentMenu with Salud on mount', function () {
    render(React.createElement(SaludDashboard));

    expect(mockSetCurrentMenu).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentMenu).toHaveBeenCalledWith('Salud');
  });
});
