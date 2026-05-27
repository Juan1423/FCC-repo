import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Historia from '../Historia';

jest.mock('../../../../../services/pacientesServices', () => ({
  getPaciente: jest.fn(),
}));

jest.mock('../../../../../services/historiaServices', () => ({
  getHistoria: jest.fn(),
}));

jest.mock('../../../../../services/auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../../../utils/userUtils', () => ({
  getCurrentUserId: () => 1,
}));

jest.mock('../../../../../components/base/PacienteContext', () => ({
  usePacienteContext: jest.fn(),
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

let capturedOnHistoriaUpdated;

jest.mock('../../../atencion/components/CuadroPaciente', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'cuadro-paciente' },
      `CuadroPaciente isDeleteDisable=${props.isDeleteDisable} isNewHistory=${props.isNewHistory}`
    );
});

jest.mock('../../components/AddButton', () => {
  const React = require('react');
  const MockAddButton = (props) => {
    capturedOnHistoriaUpdated = props.onHistoriaUpdated;
    return React.createElement('button', {
      'data-testid': 'add-button',
      onClick: () => props.onHistoriaUpdated(),
    }, `AddButton selectedPaciente=${props.selectedPaciente} isNewHistory=${props.isNewHistory}`);
  };
  return MockAddButton;
});

jest.mock('../../components/CuadroHistorialClinico', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'cuadro-historial' },
      `CuadroHistorialClinico loading=${props.loading}`
    );
});

const { getPaciente } = require('../../../../../services/pacientesServices');
const { getHistoria } = require('../../../../../services/historiaServices');
const { logAuditAction } = require('../../../../../services/auditoriaServices');
const { usePacienteContext } = require('../../../../../components/base/PacienteContext');

const mockPacienteData = { id_paciente: 1, nombre: 'Test' };

const mockHistoria = {
  id_historia: 42,
  id_paciente: 1,
  motivo_consulta_historia: 'Dolor de cabeza',
};

const mockHistoriaSinMotivo = {
  id_historia: 43,
  id_paciente: 2,
  motivo_consulta_historia: null,
};

const renderComponent = () =>
  render(React.createElement(Historia));

describe('Historia', () => {
  beforeEach(() => {
    capturedOnHistoriaUpdated = undefined;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Navbar, Drawer, CuadroPaciente, ButtonAdd, and CuadroHistorialClinico', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistoria.mockResolvedValue(mockHistoria);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    expect(screen.getByTestId('drawer')).toBeInTheDocument();
    expect(screen.getByTestId('cuadro-paciente')).toBeInTheDocument();
    expect(screen.getByTestId('cuadro-paciente').textContent).toContain('isDeleteDisable=true');
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
    expect(screen.getByTestId('add-button').textContent).toContain('selectedPaciente=1');
    expect(screen.getByTestId('cuadro-historial')).toBeInTheDocument();
  });

  it('shows info alert when no patient is selected', () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: null });

    renderComponent();

    expect(screen.getByText(/Seleccione Paciente para ver información/)).toBeInTheDocument();
    expect(screen.queryByTestId('cuadro-historial')).not.toBeInTheDocument();
  });

  it('fetches paciente and historia when selectedPaciente is set', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistoria.mockResolvedValue(mockHistoria);

    renderComponent();

    await waitFor(() => {
      expect(getPaciente).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(getHistoria).toHaveBeenCalledWith(mockPacienteData.id_paciente);
    });

    await waitFor(() => {
      expect(screen.getByTestId('cuadro-paciente').textContent).toContain('isNewHistory=false');
    });
  });

  it('sets isNewHistory true when historia has no motivo_consulta', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 2 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistoria.mockResolvedValue(mockHistoriaSinMotivo);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('cuadro-paciente').textContent).toContain('isNewHistory=true');
    });
  });

  it('passes correct props to CuadroHistorialClinico', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistoria.mockResolvedValue(mockHistoria);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('cuadro-historial').textContent).toContain('loading=false');
    });
  });

  it('clears historia when selectedPaciente becomes null on re-render', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistoria.mockResolvedValue(mockHistoria);

    const { rerender } = render(React.createElement(Historia));

    await waitFor(() => {
      expect(screen.getByTestId('cuadro-historial')).toBeInTheDocument();
    });

    usePacienteContext.mockReturnValue({ selectedPaciente: null });
    rerender(React.createElement(Historia));

    await waitFor(() => {
      expect(screen.getByText(/Seleccione Paciente para ver información/)).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('cuadro-historial').textContent).toContain('loading=false');
    });
    consoleSpy.mockRestore();
  });

  it('handleHistoriaUpdated re-fetches historia data on button click', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistoria.mockResolvedValue(mockHistoria);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('add-button')).toBeInTheDocument();
    });

    getPaciente.mockResolvedValue(mockPacienteData);
    getHistoria.mockResolvedValue(mockHistoriaSinMotivo);

    fireEvent.click(screen.getByTestId('add-button'));

    await waitFor(() => {
      expect(getHistoria).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(logAuditAction).toHaveBeenCalledWith('EDITAR_HISTORIA', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByTestId('cuadro-paciente').textContent).toContain('isNewHistory=true');
    });
  });
});
