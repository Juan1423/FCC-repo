import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
const mockParams = { id: '1' };

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

jest.mock('../../../../../services/pacientesServices', () => ({
  getPaciente: jest.fn(),
}));

jest.mock('../../../../../services/terapia', () => ({
  createTerapia: jest.fn(),
  getTerapiaByPaciente: jest.fn(),
  getLastTerapia: jest.fn(),
}));

jest.mock('../../../../../services/historiaServices', () => ({
  getHistoria: jest.fn(),
  getHistoriaFile: jest.fn(),
}));

jest.mock('../../../../../services/auditoriaServices', () => ({
  logAuditAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../../../utils/userUtils', () => ({
  getCurrentUserId: jest.fn(() => 1),
}));

import SistemaTerapias from '../NuevaTerapia';
import { getPaciente } from '../../../../../services/pacientesServices';
import { getHistoria, getHistoriaFile } from '../../../../../services/historiaServices';
import { createTerapia, getTerapiaByPaciente, getLastTerapia } from '../../../../../services/terapia';
import { logAuditAction } from '../../../../../services/auditoriaServices';

const samplePaciente = {
  nombre_paciente: 'Juan',
  apellidos_paciente: 'Perez',
  edad_paciente: 30,
};

const sampleHistoria = {
  id_historia: 1,
  motivo_consulta_historia: 'Control general',
};

const sampleLastTerapia = {
  id_terapia: 5,
  fecha_hora: new Date().toISOString(),
};

const sampleTerapias = [
  { id: 1, nombre_terapia: 'Terapia de Lenguaje', fecha_hora: new Date().toISOString(), notas_evolucion: 'Notas', farmacoterapia_indicaciones: 'Indicaciones' },
];

const renderComponent = () =>
  render(
    React.createElement(MemoryRouter, null,
      React.createElement(SistemaTerapias)
    )
  );

describe('SistemaTerapias (NuevaTerapia)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams.id = '1';
    const userUtils = require('../../../../../utils/userUtils');
    userUtils.getCurrentUserId.mockImplementation(() => 1);
    getPaciente.mockResolvedValue(samplePaciente);
    getHistoria.mockResolvedValue(sampleHistoria);
    getLastTerapia.mockResolvedValue(sampleLastTerapia);
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);
  });

  test('renders loading state while fetching patient data', async () => {
    getPaciente.mockReturnValue(new Promise(() => {}));
    getHistoria.mockReturnValue(new Promise(() => {}));
    getLastTerapia.mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByText('Sistema de Terapias')).toBeInTheDocument();
  });

  test('fetches patient, historia, and last terapia on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(getPaciente).toHaveBeenCalledWith('1');
      expect(getHistoria).toHaveBeenCalledWith('1');
      expect(getLastTerapia).toHaveBeenCalledWith('1');
    });
  });

  test('renders therapy selection cards at step 0', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Terapia Física')).toBeInTheDocument();
      expect(screen.getByText('Terapia Ocupacional')).toBeInTheDocument();
      expect(screen.getByText('Terapia de Lenguaje')).toBeInTheDocument();
    });
  });

  test('selects therapy and advances to step 1', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Terapia Física')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Terapia Física'));

    await waitFor(() => {
      expect(screen.getByText('Notas de Tratamiento')).toBeInTheDocument();
      expect(screen.getByText('Medicación')).toBeInTheDocument();
    });
  });

  test('navigates through all steps to summary', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Terapia Física')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Terapia Física'));

    await waitFor(() => {
      expect(screen.getByText('Notas de Tratamiento')).toBeInTheDocument();
    });

    const nextButtons = screen.getAllByTestId('ArrowForwardIcon');
    fireEvent.click(nextButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Resumen de la Terapia')).toBeInTheDocument();
      expect(screen.getByText('Terapia Física')).toBeInTheDocument();
    });
  });

  test('allows going back from step 1 to step 0', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Terapia Física')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Terapia Física'));

    await waitFor(() => {
      expect(screen.getByText('Notas de Tratamiento')).toBeInTheDocument();
    });

    const backButtons = screen.getAllByTestId('ArrowBackIcon');
    fireEvent.click(backButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Terapia Física')).toBeInTheDocument();
    });
  });

  test('submits therapy and navigates back', async () => {
    createTerapia.mockResolvedValue({ data: { id_terapia: 10 } });
    logAuditAction.mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Terapia Física')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Terapia Física'));

    await waitFor(() => {
      expect(screen.getByText('Notas de Tratamiento')).toBeInTheDocument();
    });

    const nextButtons = screen.getAllByTestId('ArrowForwardIcon');
    fireEvent.click(nextButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirmar y Guardar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirmar y Guardar'));

    await waitFor(() => {
      expect(createTerapia).toHaveBeenCalled();
      expect(logAuditAction).toHaveBeenCalledWith('CREAR_TERAPIA', expect.objectContaining({
        accion: 'CREAR',
        tabla: 'terapias',
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/Fcc-terapias');
    });
  });

  test('shows error when no user logged in on submit', async () => {
    const userUtils = require('../../../../../utils/userUtils');
    userUtils.getCurrentUserId.mockReturnValue(null);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Terapia Física')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Terapia Física'));

    await waitFor(() => {
      expect(screen.getByText('Notas de Tratamiento')).toBeInTheDocument();
    });

    const nextButtons = screen.getAllByTestId('ArrowForwardIcon');
    fireEvent.click(nextButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirmar y Guardar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirmar y Guardar'));

    await waitFor(() => {
      expect(createTerapia).not.toHaveBeenCalled();
    });
  });

  test('cancel button navigates back', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Sistema de Terapias')).toBeInTheDocument();
    });

    const closeButton = screen.getByTestId('CloseIcon');
    fireEvent.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/Fcc-terapias');
  });

  test('handles error on patient fetch failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getPaciente.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error getting patient:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('handles error on submit failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    createTerapia.mockRejectedValue(new Error('Save error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Terapia Física')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Terapia Física'));

    await waitFor(() => {
      expect(screen.getByText('Notas de Tratamiento')).toBeInTheDocument();
    });

    const nextButtons = screen.getAllByTestId('ArrowForwardIcon');
    fireEvent.click(nextButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirmar y Guardar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirmar y Guardar'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error al guardar la terapia:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('shows treatment history in notes step', async () => {
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Terapia Física')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Terapia Física'));

    await waitFor(() => {
      expect(screen.getByText('Historia de Tratamiento')).toBeInTheDocument();
      expect(screen.getByText('Notas')).toBeInTheDocument();
      expect(screen.getByText('Indicaciones')).toBeInTheDocument();
    });
  });
});
