import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Configuracion from '../Configuracion';
import { logAuditAction } from '../../../../../services/auditoriaServices';
import { getCurrentUserId } from '../../../../../utils/userUtils';
import { changePassword } from '../../../../../services/authServices';

jest.mock('../../../../../components/NavbarAdmin', () => {
  var react = require('react');
  var MockNavbarAdmin = function (props) {
    return react.createElement('div', { 'data-testid': 'navbar-admin' });
  };
  return { __esModule: true, default: MockNavbarAdmin };
});

jest.mock('../../../../../components/Drawer', () => {
  var react = require('react');
  var MockDrawer = function (props) {
    return react.createElement('div', { 'data-testid': 'drawer' });
  };
  return { __esModule: true, default: MockDrawer };
});

jest.mock('../../../../../services/auditoriaServices', () => ({
  logAuditAction: jest.fn(),
}));

jest.mock('../../../../../utils/userUtils', () => ({
  getCurrentUserId: jest.fn(),
}));

jest.mock('../../../../../services/authServices', () => ({
  changePassword: jest.fn(),
}));

describe('Configuracion', function () {
  afterEach(function () {
    jest.clearAllMocks();
  });

  test('renders Navbar, Drawer, and title Configuracion de la cuenta', function () {
    render(React.createElement(Configuracion));

    expect(screen.getByTestId('navbar-admin')).toBeInTheDocument();
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
    expect(screen.getByText('Configuraci\u00f3n de la cuenta')).toBeInTheDocument();
  });

  test('shows 3 config list items', function () {
    render(React.createElement(Configuracion));

    expect(screen.getByRole('button', { name: 'Cambiar contrase\u00f1a' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eliminar cuenta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preferencias de notificaci\u00f3n' })).toBeInTheDocument();
  });

  test('opens change password dialog', function () {
    render(React.createElement(Configuracion));

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contrase\u00f1a' }));

    expect(screen.getByLabelText('Contrase\u00f1a actual')).toBeInTheDocument();
  });

  test('validates password match before submit', async function () {
    render(React.createElement(Configuracion));

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contrase\u00f1a' }));

    var currentPasswordInput = screen.getByLabelText('Contrase\u00f1a actual');
    var newPasswordInput = screen.getByLabelText('Nueva contrase\u00f1a');
    var confirmPasswordInput = screen.getByLabelText('Confirmar nueva contrase\u00f1a');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldPass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newPass456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentPass789' } });

    fireEvent.click(screen.getByText('Cambiar Contrase\u00f1a'));

    await waitFor(function () {
      expect(screen.getByText('Las contrase\u00f1as no coinciden')).toBeInTheDocument();
    });
  });

  test('opens delete account dialog', function () {
    render(React.createElement(Configuracion));

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar cuenta' }));

    expect(screen.getByText('Confirmar eliminaci\u00f3n de cuenta')).toBeInTheDocument();
  });

  test('delete account audits', async function () {
    getCurrentUserId.mockReturnValue(42);

    render(React.createElement(Configuracion));

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar cuenta' }));

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Cuenta' }));

    await waitFor(function () {
      expect(logAuditAction).toHaveBeenCalledWith('ELIMINAR_CUENTA_CONFIG', expect.any(Object));
    });
  });

  test('successful password change audits and shows success', async function () {
    getCurrentUserId.mockReturnValue(42);
    changePassword.mockImplementation(() => Promise.resolve({
      success: true,
      message: 'Contrase\u00f1a cambiada exitosamente'
    }));

    render(React.createElement(Configuracion));

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contrase\u00f1a' }));

    fireEvent.change(screen.getByLabelText('Contrase\u00f1a actual'), { target: { value: 'oldPass123' } });
    fireEvent.change(screen.getByLabelText('Nueva contrase\u00f1a'), { target: { value: 'newPass456' } });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contrase\u00f1a'), { target: { value: 'newPass456' } });

    fireEvent.click(screen.getByText('Cambiar Contrase\u00f1a'));

    await waitFor(function () {
      expect(changePassword).toHaveBeenCalledWith({
        oldPassword: 'oldPass123',
        newPassword: 'newPass456'
      });
    });

    await waitFor(function () {
      expect(logAuditAction).toHaveBeenCalledWith('CAMBIAR_CONTRASENA_CONFIG', expect.any(Object));
    });

    await waitFor(function () {
      expect(screen.getByText('Contrase\u00f1a cambiada exitosamente')).toBeInTheDocument();
    });
  });

  test('password change error shows error', async function () {
    getCurrentUserId.mockReturnValue(42);
    changePassword.mockRejectedValue(new Error('Error al cambiar la contrase\u00f1a'));

    render(React.createElement(Configuracion));

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contrase\u00f1a' }));

    var currentPasswordInput = screen.getByLabelText('Contrase\u00f1a actual');
    var newPasswordInput = screen.getByLabelText('Nueva contrase\u00f1a');
    var confirmPasswordInput = screen.getByLabelText('Confirmar nueva contrase\u00f1a');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldPass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newPass456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPass456' } });

    fireEvent.click(screen.getByText('Cambiar Contrase\u00f1a'));

    await waitFor(function () {
      expect(screen.getByText('Error al cambiar la contrase\u00f1a')).toBeInTheDocument();
    });
  });
});
