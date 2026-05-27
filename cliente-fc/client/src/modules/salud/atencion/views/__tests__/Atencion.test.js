import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Atencion from '../Atencion';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => jest.fn() };
});

jest.mock('../../../../../services/pacientesServices', () => ({
  getPaciente: jest.fn(),
}));

jest.mock('../../../../../services/atencion', () => ({
  getLastSignosVitales: jest.fn(),
  getAtenciones: jest.fn(),
}));

jest.mock('../../../../../services/historiaServices', () => ({
  getHistorias: jest.fn(),
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

jest.mock('../../../../../components/Drawer', () => {
  const React = require('react');
  return ({ open, onClose }) =>
    React.createElement('div', { 'data-testid': 'drawer' },
      'Drawer ', open ? 'open' : 'closed'
    );
});

jest.mock('../../components/CuadroPaciente', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'cuadro-paciente' },
      'CuadroPaciente', ' isDeleteDisable:', String(props.isDeleteDisable)
    );
});

jest.mock('../../components/AtencionButton', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'atencion-button' },
      'AtencionButton',
      ' selected:', String(!!props.selectedPaciente),
      ' isFirst:', String(props.isFirstAttention)
    );
});

jest.mock('../../components/CuadroAtenciones', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'cuadro-atenciones' },
      'CuadroAtenciones atenciones:', String(props.atenciones.length)
    );
});

jest.mock('../../components/CuadroSignosVitales', () => {
  const React = require('react');
  return (props) =>
    React.createElement('div', { 'data-testid': 'cuadro-signos-vitales' },
      'CuadroSignosVitales',
      ' tieneSV:', String(!!props.ultimosSignosVitales)
    );
});

jest.mock('../../components/ExamenesTabView', () => {
  const React = require('react');
  return () =>
    React.createElement('div', { 'data-testid': 'examenes-tab-view' },
      'ExamenesTabView'
    );
});

const { getPaciente } = require('../../../../../services/pacientesServices');
const { getAtenciones, getLastSignosVitales } = require('../../../../../services/atencion');
const { getHistorias } = require('../../../../../services/historiaServices');
const { logAuditAction } = require('../../../../../services/auditoriaServices');
const { usePacienteContext } = require('../../../../../components/base/PacienteContext');

const mockPacienteData = {
  id_paciente: 1,
  nombres_paciente: 'Juan',
  apellidos_paciente: 'Pérez',
  dni_paciente: '1234567890',
};

const mockHistorias = [
  { id_historia: 42, id_paciente: 1 },
];

const mockAtenciones = [
  {
    id_aps: 101,
    id_historia: 42,
    fecha_atencion: '2024-01-15',
    motivo_consulta: 'Dolor de cabeza',
    problema_actual: 'Cefalea',
    plan_tratamiento: 'Reposo',
    id_personalsalud: 5,
    revision_actual_sistema: '[]',
    examen_fisico: '[]',
    prescripciones: '[]',
    diagnostico: '[]',
  },
];

const mockSignosVitales = {
  temperatura: '37',
  presion_arterial: '120/80',
  pulso: '72',
  peso: '70',
  talla: '1.75',
  frecuencia_respiratoria: '16',
  fecha_medicion: '2024-01-15T10:00:00',
};

const renderComponent = () =>
  render(
    React.createElement(MemoryRouter, null,
      React.createElement(Atencion)
    )
  );

describe('Atencion view', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Navbar, Drawer, and page structure', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: null });
    getPaciente.mockResolvedValue(null);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
    expect(screen.getByTestId('cuadro-paciente')).toBeInTheDocument();
    expect(screen.getByTestId('atencion-button')).toBeInTheDocument();
    expect(screen.getByText('Consultas Realizadas')).toBeInTheDocument();
    expect(screen.getByText('Información General')).toBeInTheDocument();
    expect(screen.getByText('Exámenes')).toBeInTheDocument();
  });

  it('shows CuadroAtenciones in tab 1', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: null });
    getPaciente.mockResolvedValue(null);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('cuadro-atenciones')).toBeInTheDocument();
    });
  });

  it('shows info alert in tab 2 when no paciente selected', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: null });
    getPaciente.mockResolvedValue(null);
    renderComponent();

    fireEvent.click(screen.getByText('Información General'));

    await waitFor(() => {
      expect(screen.getByText('Seleccione Paciente para ver información')).toBeInTheDocument();
    });
  });

  it('shows ExamenesTabView in tab 3', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: null });
    getPaciente.mockResolvedValue(null);
    renderComponent();

    fireEvent.click(screen.getByText('Exámenes'));

    await waitFor(() => {
      expect(screen.getByTestId('examenes-tab-view')).toBeInTheDocument();
    });
  });

  it('fetches data when selectedPaciente is set', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistorias.mockResolvedValue(mockHistorias);
    getAtenciones.mockResolvedValue(mockAtenciones);
    getLastSignosVitales.mockResolvedValue(mockSignosVitales);

    renderComponent();

    await waitFor(() => {
      expect(getPaciente).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(getHistorias).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getAtenciones).toHaveBeenCalledWith(42);
    });

    await waitFor(() => {
      expect(getLastSignosVitales).toHaveBeenCalledWith(42);
    });

    await waitFor(() => {
      expect(logAuditAction).toHaveBeenCalledWith(
        'CONSULTAR_ATENCION',
        expect.objectContaining({ accion: 'CONSULTAR' })
      );
    });
  });

  it('isFirstAttention is true when no historia exists', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistorias.mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/isFirst:true/)).toBeInTheDocument();
    });
  });

  it('isFirstAttention is false when historia exists', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistorias.mockResolvedValue(mockHistorias);
    getAtenciones.mockResolvedValue([]);
    getLastSignosVitales.mockResolvedValue(null);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/isFirst:false/)).toBeInTheDocument();
    });
  });

  it('shows CuadroSignosVitales in tab 2 when paciente selected', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistorias.mockResolvedValue(mockHistorias);
    getAtenciones.mockResolvedValue(mockAtenciones);
    getLastSignosVitales.mockResolvedValue(mockSignosVitales);

    renderComponent();

    fireEvent.click(screen.getByText('Información General'));

    await waitFor(() => {
      expect(screen.getByTestId('cuadro-signos-vitales')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockRejectedValue(new Error('API Error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('cuadro-atenciones')).toBeInTheDocument();
    });
  });

  it('resets data when selectedPaciente changes', async () => {
    usePacienteContext.mockReturnValue({ selectedPaciente: 1 });
    getPaciente.mockResolvedValue(mockPacienteData);
    getHistorias.mockResolvedValue(mockHistorias);
    getAtenciones.mockResolvedValue(mockAtenciones);
    getLastSignosVitales.mockResolvedValue(mockSignosVitales);

    const { rerender } = renderComponent();

    await waitFor(() => {
      expect(getPaciente).toHaveBeenCalled();
    });

    usePacienteContext.mockReturnValue({ selectedPaciente: null });
    rerender(React.createElement(MemoryRouter, null, React.createElement(Atencion)));
  });
});
