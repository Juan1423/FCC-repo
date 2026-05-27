import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PersonalSalud from '../PersonalSalud';

jest.mock('../../../../../services/personalsaludServices', () => ({
  getPersonalSalud: jest.fn(),
  getPersonalSaludId: jest.fn(),
  deleteLogicalPersonalSalud: jest.fn(),
}));

jest.mock('../../../../../services/auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../../../utils/userUtils', () => ({
  getCurrentUserId: () => 1,
}));

jest.mock('../../../../../components/NavbarAdmin', () => {
  const React = require('react');
  return React.forwardRef((props, ref) =>
    React.createElement('div', { 'data-testid': 'navbar' }, 'Navbar')
  );
});

jest.mock('../../../../../components/Drawer', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'drawer' }, 'Drawer');
});

jest.mock('../../components/TablaPersonal', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'tabla-personal' },
      React.createElement('div', null, `isLoading=${props.isLoading}`),
      React.createElement('button', {
        'data-testid': 'btn-delete',
        onClick: () => props.handleDeletePersonalSalud(1),
      }, 'Delete'),
      React.createElement('button', {
        'data-testid': 'btn-edit',
        onClick: () => props.handleEdit(1),
      }, 'Edit')
    );
});

jest.mock('../../components/buscarPersonal', () => {
  const React = require('react');
  return (props) =>
    React.createElement('input', {
      'data-testid': 'buscar-personal',
      onChange: (e) => props.onSearch(e.target.value),
      placeholder: 'Buscar personal',
    });
});

jest.mock('../../components/modalAddPersonal', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'modal-add' },
      props.open ? 'ModalAddPersonal open' : 'ModalAddPersonal closed'
    );
});

jest.mock('../../components/modalEditPersonal', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'modal-edit' },
      props.open ? 'ModalEditPersonal open' : 'ModalEditPersonal closed'
    );
});

const { getPersonalSalud, getPersonalSaludId, deleteLogicalPersonalSalud } = require('../../../../../services/personalsaludServices');
const { logAuditAction } = require('../../../../../services/auditoriaServices');

const mockPersonals = [
  { id_personalsalud: 1, nombre_personal: 'Juan', apellidos_personal: 'Pérez', estado_personal: true, dni_personal: '12345678', especialidad_personal: 'Medicina' },
  { id_personalsalud: 2, nombre_personal: 'Ana', apellidos_personal: 'García', estado_personal: false, dni_personal: '87654321', especialidad_personal: 'Enfermería' },
];

const renderComponent = () =>
  render(React.createElement(PersonalSalud));

describe('PersonalSalud', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Navbar, Drawer, title, search, add button, and table', () => {
    getPersonalSalud.mockResolvedValue(mockPersonals);

    renderComponent();

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
    expect(screen.getByText('Lista del Personal de Salud Fundación con Cristo')).toBeInTheDocument();
    expect(screen.getByTestId('buscar-personal')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('fetches personal salud list on mount', async () => {
    getPersonalSalud.mockResolvedValue(mockPersonals);

    renderComponent();

    await waitFor(() => {
      expect(getPersonalSalud).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state initially in table', () => {
    getPersonalSalud.mockResolvedValue(mockPersonals);

    renderComponent();

    expect(screen.getByTestId('tabla-personal').textContent).toContain('isLoading=true');
  });

  it('shows loaded state after fetch completes', async () => {
    getPersonalSalud.mockResolvedValue(mockPersonals);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('tabla-personal').textContent).toContain('isLoading=false');
    });
  });

  it('opens add modal when clicking Personal button', async () => {
    getPersonalSalud.mockResolvedValue(mockPersonals);

    renderComponent();

    expect(screen.queryByTestId('modal-add')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Personal'));

    await waitFor(() => {
      expect(screen.getByTestId('modal-add').textContent).toContain('open');
    });
  });

  it('opens confirmation dialog when delete button is clicked', async () => {
    getPersonalSalud.mockResolvedValue(mockPersonals);
    getPersonalSaludId.mockResolvedValue(mockPersonals[0]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('btn-delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-delete'));

    await waitFor(() => {
      expect(screen.getByText(/Desactivar Personal/)).toBeInTheDocument();
    });

    expect(screen.getByText(/¿Estás seguro/)).toBeInTheDocument();
  });

  it('completes delete (deactivate) through confirmation dialog', async () => {
    getPersonalSalud.mockResolvedValue(mockPersonals);
    getPersonalSaludId.mockResolvedValue(mockPersonals[0]);
    deleteLogicalPersonalSalud.mockResolvedValue({});

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('btn-delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-delete'));

    await waitFor(() => {
      expect(screen.getByText('Desactivar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Desactivar'));

    await waitFor(() => {
      expect(deleteLogicalPersonalSalud).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(logAuditAction).toHaveBeenCalledWith('DESACTIVAR_PERSONAL', expect.any(Object));
    });
  });

  it('opens activate dialog for inactive personal', async () => {
    getPersonalSalud.mockResolvedValue(mockPersonals);
    getPersonalSaludId.mockResolvedValue(mockPersonals[1]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('btn-delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-delete'));

    await waitFor(() => {
      expect(screen.getByText(/Activar Personal/)).toBeInTheDocument();
    });
  });

  it('opens edit modal when edit button is clicked', async () => {
    getPersonalSalud.mockResolvedValue(mockPersonals);
    getPersonalSaludId.mockResolvedValue(mockPersonals[0]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('btn-edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-edit'));

    await waitFor(() => {
      expect(screen.getByTestId('modal-edit').textContent).toContain('open');
    });
  });

  it('handles search input change', async () => {
    getPersonalSalud.mockResolvedValue(mockPersonals);

    renderComponent();

    const searchInput = screen.getByTestId('buscar-personal');
    fireEvent.change(searchInput, { target: { value: 'Juan' } });
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getPersonalSalud.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('tabla-personal').textContent).toContain('isLoading=false');
    });
    consoleSpy.mockRestore();
  });
});
