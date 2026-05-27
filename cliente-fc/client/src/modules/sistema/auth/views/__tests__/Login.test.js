import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { login, verifyToken, logout } from '../../../../../services/authServices';
import { logAuditAction } from '../../../../../services/auditoriaServices';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: function () { return mockNavigate; }
}));

jest.mock('../../../../../services/authServices', () => ({
  login: jest.fn(),
  verifyToken: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('../../../../../services/auditoriaServices', () => ({
  logAuditAction: jest.fn(),
}));

jest.mock('../login.css', () => ({}));

jest.mock('../../../../../assets/img/logo-fcc.png', () => 'logo-mock');

describe('Login', function () {
  afterEach(function () {
    jest.clearAllMocks();
  });

  function fillAndSubmitForm(email, pass) {
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { name: 'email', value: email }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { name: 'password', value: pass }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  }

  test('renders login form with email, password, and submit button', async function () {
    verifyToken.mockResolvedValue({ isValid: false });

    render(React.createElement(Login));

    await waitFor(function () {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('shows logo image', async function () {
    verifyToken.mockResolvedValue({ isValid: false });

    render(React.createElement(Login));

    await waitFor(function () {
      expect(screen.getByAltText('Logo')).toBeInTheDocument();
    });
    expect(screen.getByAltText('Logo')).toHaveAttribute('src', 'logo-mock');
  });

  test('shows loading spinner when loading state', function () {
    verifyToken.mockReturnValue(new Promise(function () {}));

    render(React.createElement(Login));

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('successful login calls login service, audits, and navigates', async function () {
    verifyToken.mockResolvedValue({ isValid: false });
    login.mockImplementation(function () {
      return Promise.resolve({
        success: true,
        token: 'test-token',
        data: { id: 1, correo_usuario: 'test@test.com' }
      });
    });

    render(React.createElement(Login));

    await waitFor(function () {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    fillAndSubmitForm('test@test.com', 'password123');

    await waitFor(function () {
      expect(login).toHaveBeenCalledWith({
        correo_usuario: 'test@test.com',
        password_usuario: 'password123'
      });
    });

    await waitFor(function () {
      expect(logAuditAction).toHaveBeenCalledWith('INICIAR_SESION', {
        usuario: { id: 1, correo_usuario: 'test@test.com' }
      });
    });

    await waitFor(function () {
      expect(screen.getAllByText('Inicio de sesi\u00f3n exitoso').length).toBeGreaterThan(0);
    });
  });

  test('failed login shows error alert', async function () {
    verifyToken.mockResolvedValue({ isValid: false });
    login.mockResolvedValue({ success: false });

    render(React.createElement(Login));

    await waitFor(function () {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    fillAndSubmitForm('wrong@test.com', 'badpass');

    await waitFor(function () {
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
    });
  });

  test('verifies token on mount and navigates if valid', async function () {
    verifyToken.mockResolvedValue({ isValid: true });

    render(React.createElement(Login));

    await waitFor(function () {
      expect(mockNavigate).toHaveBeenCalledWith('/fcc-menu-principal');
    });
    expect(verifyToken).toHaveBeenCalledTimes(1);
  });

  test('form disabled during submission', async function () {
    verifyToken.mockResolvedValue({ isValid: false });
    login.mockReturnValue(new Promise(function () {}));

    render(React.createElement(Login));

    await waitFor(function () {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    var submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { name: 'email', value: 'test@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { name: 'password', value: 'password123' }
    });
    fireEvent.click(submitButton);

    await waitFor(function () {
      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    });

    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
