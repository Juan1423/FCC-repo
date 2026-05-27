import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Paciente from '../Paciente';

jest.mock('../../../../../services/pacientesServices', () => ({
  getPacientes: jest.fn(),
  getPaciente: jest.fn(),
  deleteLogicalPaciente: jest.fn(),
}));

jest.mock('../../../../../services/auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../../../components/NavbarAdmin', () => {
  const React = require('react');
  const MockNavbar = React.forwardRef((props, ref) =>
    React.createElement('div', { 'data-testid': 'navbar', ref }, 'Navbar')
  );
  MockNavbar.displayName = 'NavbarAdmin';
  return MockNavbar;
});

jest.mock('../../../../../components/Drawer', () => {
  const React = require('react');
  return ({ open, onClose }) =>
    React.createElement('div', { 'data-testid': 'drawer' },
      'Drawer ', open ? 'open' : 'closed'
    );
});

jest.mock('../../components/TablaPaciente', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'tabla-paciente' },
      'TablaPaciente',
      React.createElement('button', { onClick: () => props.handleEdit(1) }, 'Edit 1'),
      React.createElement('button', { onClick: () => props.handleDeletePaciente(1) }, 'Delete 1')
    );
});

jest.mock('../../components/ModalAddPaciente', () => {
  const React = require('react');
  return (props) =>
    props.open ? React.createElement('div', { 'data-testid': 'modal-add' }, 'Modal Add') : null;
});

jest.mock('../../components/ModalEditPaciente', () => {
  const React = require('react');
  return (props) =>
    props.open ? React.createElement('div', { 'data-testid': 'modal-edit' }, 'Modal Edit') : null;
});

const { getPacientes, getPaciente, deleteLogicalPaciente } = require('../../../../../services/pacientesServices');
const { logAuditAction } = require('../../../../../services/auditoriaServices');

const renderComponent = () =>
  render(
    React.createElement(MemoryRouter, null,
      React.createElement(Paciente)
    )
  );

const mockPacientes = [
  {
    id_paciente: 1,
    nombre_paciente: 'Juan',
    apellidos_paciente: 'Pérez',
    dni_paciente: '1234567890',
    estado_paciente: true,
  },
  {
    id_paciente: 2,
    nombre_paciente: 'Ana',
    apellidos_paciente: 'López',
    dni_paciente: '0987654321',
    estado_paciente: false,
  },
];

describe('Paciente view', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title and Navbar/Drawer', async () => {
    getPacientes.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/lista de pacientes/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('fetches and passes pacientes to TablaPaciente', async () => {
    getPacientes.mockResolvedValue(mockPacientes);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('tabla-paciente')).toBeInTheDocument();
    });
  });

  it('shows error alert when fetching fails', async () => {
    getPacientes.mockRejectedValue(new Error('Error'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/hubo un error/i)).toBeInTheDocument();
    });
  });

  it('calls handleEdit and opens edit modal', async () => {
    getPacientes.mockResolvedValue(mockPacientes);
    getPaciente.mockResolvedValue({
      id_paciente: 1,
      nombre_paciente: 'Juan',
      apellidos_paciente: 'Pérez',
      fecha_paciente: '1990-01-15',
      estado_paciente: true,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('tabla-paciente')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit 1'));

    await waitFor(() => {
      expect(screen.getByTestId('modal-edit')).toBeInTheDocument();
    });
  });

  it('shows confirmation dialog on delete click', async () => {
    getPacientes.mockResolvedValue(mockPacientes);
    getPaciente.mockResolvedValue({
      id_paciente: 1,
      nombre_paciente: 'Juan',
      apellidos_paciente: 'Pérez',
      estado_paciente: true,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('tabla-paciente')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete 1'));

    await waitFor(() => {
      expect(screen.getByText(/¿estás seguro/i)).toBeInTheDocument();
    });
  });

  it('calls deleteLogicalPaciente and logs audit on confirm', async () => {
    getPacientes.mockResolvedValue(mockPacientes);
    getPaciente.mockResolvedValue({
      id_paciente: 1,
      nombre_paciente: 'Juan',
      apellidos_paciente: 'Pérez',
      dni_paciente: '1234567890',
      email_paciente: 'juan@test.com',
      estado_paciente: true,
    });
    deleteLogicalPaciente.mockResolvedValue({});
    logAuditAction.mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('tabla-paciente')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete 1'));

    await waitFor(() => {
      expect(screen.getByText(/desactivar paciente/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Desactivar');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteLogicalPaciente).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(logAuditAction).toHaveBeenCalledWith(
        'DESACTIVAR_PACIENTE',
        expect.objectContaining({
          accion: 'DESACTIVAR_PACIENTE',
          id_registro: 1,
        })
      );
    });
  });

  it('shows popover info when info icon is clicked', async () => {
    getPacientes.mockResolvedValue(mockPacientes);
    const { container } = renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('tabla-paciente')).toBeInTheDocument();
    });

    const buttons = container.querySelectorAll('button');
    const infoButton = Array.from(buttons).find(
      (btn) => btn.querySelector('svg')
    );
    fireEvent.click(infoButton);

    await waitFor(() => {
      expect(screen.getByText(/módulo de pacientes/i)).toBeInTheDocument();
    });
  });

  it('shows error alert when handleDelete fails', async () => {
    getPacientes.mockResolvedValue(mockPacientes);
    getPaciente.mockRejectedValue(new Error('Error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('tabla-paciente')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete 1'));

    await waitFor(() => {
      expect(screen.getByText(/hubo un error/i)).toBeInTheDocument();
    });
  });
});
