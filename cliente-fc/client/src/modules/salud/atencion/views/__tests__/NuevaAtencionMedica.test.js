import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NuevaAtencionMedica from '../NuevaAtencionMedica';

const mockNavigate = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, jest.fn()],
  };
});

jest.mock('../../../../../services/atencion', () => ({
  createAtencion: jest.fn(),
  createSignosVitales: jest.fn(),
}));

jest.mock('../../../../../services/historiaServices', () => ({
  getHistoria: jest.fn(),
  updateHistoria: jest.fn(),
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
  const MockNavbar = React.forwardRef((props, ref) =>
    React.createElement('div', { 'data-testid': 'navbar', ref }, 'Navbar')
  );
  MockNavbar.displayName = 'NavbarAdmin';
  return MockNavbar;
});

jest.mock('../../components/CuadroPaciente', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'cuadro-paciente' },
      'CuadroPaciente'
    );
});

jest.mock('../../components/TablaOrganos', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'tabla-organos' });
});

jest.mock('../../components/TablaExamenFisico', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'tabla-examen-fisico' });
});

jest.mock('../../components/Diagnostico', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'diagnostico' });
});

jest.mock('../../components/Tratamiento', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'tratamiento' });
});

jest.mock('../../../historia/components/Antecedentes', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'antecedentes' });
});

jest.mock('../../../../../components/data/Data', () => ({
  organs: ['Corazón', 'Pulmones'],
  regions: ['Cabeza', 'Tórax'],
  NewAtencionSteps: [
    'Seleccionar Paciente',
    'Signos Vitales',
    'Revisión de Órganos',
    'Examen Físico',
    'Diagnóstico',
    'Tratamiento',
  ],
}));

const { getHistoria, updateHistoria } = require('../../../../../services/historiaServices');
const { createAtencion, createSignosVitales } = require('../../../../../services/atencion');
const { logAuditAction } = require('../../../../../services/auditoriaServices');
const { usePacienteContext } = require('../../../../../components/base/PacienteContext');

const mockHistoria = {
  id_historia: 42,
  id_paciente: 1,
  motivo_consulta_historia: 'Dolor de cabeza',
};

const mockAtencionResponse = {
  data: { id_aps: 101 },
};

const renderComponent = () =>
  render(
    React.createElement(MemoryRouter, null,
      React.createElement(NuevaAtencionMedica)
    )
  );

describe('NuevaAtencionMedica', () => {
  beforeEach(() => {
    mockSearchParams.delete('id');
    mockSearchParams.delete('type');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form after loading without pacienteId', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('cuadro-paciente')).toBeInTheDocument();
    });

    expect(screen.getByText('Seleccionar Paciente')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
  });

  it('shows snackbar when clicking next on step 0 without selectedPaciente', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: null });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Siguiente'));

    await waitFor(() => {
      expect(screen.getByText(/Por favor, seleccione un paciente/)).toBeInTheDocument();
    });
  });

  it('loads historia when pacienteId is in URL', async () => {
    mockSearchParams.set('id', '1');
    mockSearchParams.set('type', 'control');

    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getHistoria.mockResolvedValue(mockHistoria);

    renderComponent();

    await waitFor(() => {
      expect(getHistoria).toHaveBeenCalledWith('1');
    });
  });

  it('renders signos vitales step content', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Siguiente'));

    await waitFor(() => {
      expect(screen.getAllByText(/Signos Vitales/).length).toBeGreaterThan(0);
    });
  });

  it('navigates through all steps', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Siguiente'));
    await waitFor(() => {
      expect(screen.getAllByText(/Signos Vitales/).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByText('Siguiente'));
    await waitFor(() => {
      expect(screen.getByTestId('tabla-organos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Siguiente'));
    await waitFor(() => {
      expect(screen.getByTestId('tabla-examen-fisico')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Siguiente'));
    await waitFor(() => {
      expect(screen.getByTestId('diagnostico')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Siguiente'));
    await waitFor(() => {
      expect(screen.getByTestId('tratamiento')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Finalizar'));
    await waitFor(() => {
      expect(screen.getByText(/¿Está seguro/)).toBeInTheDocument();
    });
  });

  it('saves and shows success message', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    createAtencion.mockResolvedValue(mockAtencionResponse);
    createSignosVitales.mockResolvedValue({});
    updateHistoria.mockResolvedValue({});
    logAuditAction.mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });

    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByText(i < 5 ? 'Siguiente' : 'Finalizar'));
      await waitFor(() => {});
    }

    await waitFor(() => {
      expect(screen.getByText(/¿Está seguro/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(createAtencion).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/registrada exitosamente/)).toBeInTheDocument();
    });
  });

  it('shows antecedentes drawer when button clicked', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Revisar Antecedentes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Revisar Antecedentes'));

    await waitFor(() => {
      expect(screen.getByTestId('antecedentes')).toBeInTheDocument();
    });
  });
});
