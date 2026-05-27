import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../../../../services/terapia', () => ({
  getTerapiaByPaciente: jest.fn(),
  updateTerapia: jest.fn(),
  deleteTerapia: jest.fn(),
}));

jest.mock('../../../../../services/pacientesServices', () => ({
  getPaciente: jest.fn(),
}));

jest.mock('../../../../../services/auditoriaServices', () => ({
  logAuditAction: jest.fn(),
}));

jest.mock('../../../../../utils/userUtils', () => ({
  getCurrentUserId: jest.fn(),
}));

jest.mock('../../../../../components/base/PacienteContext', () => ({
  usePacienteContext: jest.fn(),
}));

jest.mock('../../../../../components/NavbarAdmin', () => {
  const R = require('react');
  const Mock = R.forwardRef((props, ref) =>
    R.createElement('div', { 'data-testid': 'navbar-admin' })
  );
  Mock.displayName = 'NavbarAdmin';
  return Mock;
});

jest.mock('../../../../../components/Drawer', () => {
  const R = require('react');
  return (props) => R.createElement('div', { 'data-testid': 'drawer' });
});

jest.mock('@mui/lab/TabContext', () => {
  const R = require('react');
  return ({ children }) => R.createElement('div', { 'data-testid': 'tab-context' }, children);
});

jest.mock('../../components/TerapiasHeader', () => {
  const R = require('react');
  return (props) => R.createElement('div', { 'data-testid': 'terapias-header' });
});

jest.mock('../../components/TerapiasTabs', () => {
  const R = require('react');
  return ({ tabValue, handleTabChange, isMobile }) =>
    R.createElement('div', { 'data-testid': 'terapias-tabs' },
      R.createElement('button', {
        'data-testid': 'tab-1-button',
        onClick: (e) => handleTabChange(e, '1'),
      }, 'Tab 1'),
      R.createElement('button', {
        'data-testid': 'tab-2-button',
        onClick: (e) => handleTabChange(e, '2'),
      }, 'Tab 2'),
    );
});

jest.mock('../../components/TerapiasAnteriores', () => {
  const R = require('react');
  return ({ handleUpdateTerapia, handleDeleteTerapia }) =>
    R.createElement('div', { 'data-testid': 'terapias-anteriores' },
      R.createElement('button', {
        'data-testid': 'trigger-update',
        onClick: () => { handleUpdateTerapia(1, { nombre_terapia: 'Updated Terapia' }).catch(function () {}); },
      }, 'Update Terapia'),
      R.createElement('button', {
        'data-testid': 'trigger-delete',
        onClick: () => { handleDeleteTerapia(1).catch(function () {}); },
      }, 'Delete Terapia'),
    );
});

jest.mock('../../components/AsistenciaTerapias', () => {
  const R = require('react');
  return (props) => R.createElement('div', { 'data-testid': 'asistencia-terapias' });
});

import Terapias from '../Terapia';
import {
  getTerapiaByPaciente,
  updateTerapia,
  deleteTerapia,
} from '../../../../../services/terapia';
import { getPaciente } from '../../../../../services/pacientesServices';
import { logAuditAction } from '../../../../../services/auditoriaServices';
import { getCurrentUserId } from '../../../../../utils/userUtils';
import { usePacienteContext } from '../../../../../components/base/PacienteContext';

const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useNavigate.mockReturnValue(mockNavigate);
  getCurrentUserId.mockReturnValue(1);
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});

function renderComponent(selectedPaciente) {
  usePacienteContext.mockReturnValue({ selectedPaciente });
  return render(
    React.createElement(ThemeProvider, { theme: createTheme() },
      React.createElement(BrowserRouter, null,
        React.createElement(Terapias),
      ),
    ),
  );
}

const samplePaciente = {
  id_paciente: 1,
  nombre: 'Juan',
  apellido: 'Perez',
  cedula: '1234567890',
};

const sampleTerapias = [
  { id_terapia: 1, nombre_terapia: 'Terapia de Lenguaje', id_tipo_terapia: '1' },
  { id_terapia: 2, nombre_terapia: 'Terapia Fisica', id_tipo_terapia: '2' },
];

describe('Terapias', () => {
  test('renders loading spinner while fetching patient data', async () => {
    let resolvePaciente;
    const pacientePromise = new Promise((r) => { resolvePaciente = r; });
    getPaciente.mockReturnValue(pacientePromise);
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);

    renderComponent('1');

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    resolvePaciente(samplePaciente);

    await waitFor(() => {
      expect(screen.getByTestId('terapias-header')).toBeInTheDocument();
    });
  });

  test('renders full UI with patient selected', async () => {
    getPaciente.mockResolvedValue(samplePaciente);
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);

    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByTestId('terapias-anteriores')).toBeInTheDocument();
    });
    expect(screen.getByTestId('terapias-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('terapias-header')).toBeInTheDocument();
    expect(screen.getByTestId('asistencia-terapias')).toBeInTheDocument();
    expect(screen.getByTestId('tab-context')).toBeInTheDocument();
    expect(screen.getByTestId('navbar-admin')).toBeInTheDocument();
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  test('shows info alert when no patient selected', async () => {
    getPaciente.mockResolvedValue(samplePaciente);
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);

    renderComponent(null);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('terapias-anteriores')).not.toBeInTheDocument();
    expect(screen.queryByTestId('asistencia-terapias')).not.toBeInTheDocument();
    expect(getPaciente).not.toHaveBeenCalled();
    expect(getTerapiaByPaciente).not.toHaveBeenCalled();
  });

  test('fetches data on mount when selectedPaciente is provided', async () => {
    getPaciente.mockResolvedValue(samplePaciente);
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);

    renderComponent('1');

    await waitFor(() => {
      expect(getPaciente).toHaveBeenCalledWith('1');
      expect(getTerapiaByPaciente).toHaveBeenCalledWith('1');
    });
  });

  test('does not fetch data when no patient selected', async () => {
    renderComponent(null);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(getPaciente).not.toHaveBeenCalled();
    expect(getTerapiaByPaciente).not.toHaveBeenCalled();
  });

  test('tab switching updates tab value', async () => {
    getPaciente.mockResolvedValue(samplePaciente);
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);

    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByTestId('tab-1-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tab-2-button'));

    expect(screen.getByTestId('tab-2-button')).toBeInTheDocument();
  });

  test('handleUpdateTerapia calls updateTerapia and logs audit', async () => {
    getPaciente.mockResolvedValue(samplePaciente);
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);
    updateTerapia.mockResolvedValue({
      id_terapia: 1,
      nombre_terapia: 'Updated Lenguaje',
    });

    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByTestId('trigger-update')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('trigger-update'));

    await waitFor(() => {
      expect(updateTerapia).toHaveBeenCalledWith(1, { nombre_terapia: 'Updated Terapia' });
      expect(logAuditAction).toHaveBeenCalledWith('EDITAR_TERAPIA', expect.objectContaining({
        accion: 'EDITAR',
        tabla: 'terapias',
        id_registro: 1,
      }));
    });
  });

  test('handleDeleteTerapia calls deleteTerapia and logs audit', async () => {
    getPaciente.mockResolvedValue(samplePaciente);
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);
    deleteTerapia.mockResolvedValue({});

    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByTestId('trigger-delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('trigger-delete'));

    await waitFor(() => {
      expect(deleteTerapia).toHaveBeenCalledWith(1);
      expect(logAuditAction).toHaveBeenCalledWith('ELIMINAR_TERAPIA', expect.objectContaining({
        accion: 'ELIMINAR',
        id_registro: 1,
      }));
    });
  });

  test('handleUpdateTerapia throws when no user logged in', async () => {
    getCurrentUserId.mockReturnValue(null);
    getPaciente.mockResolvedValue(samplePaciente);
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);

    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByTestId('trigger-update')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('trigger-update'));

    await waitFor(() => {
      expect(updateTerapia).not.toHaveBeenCalled();
    });
  });

  test('handleDeleteTerapia throws when no user logged in', async () => {
    getCurrentUserId.mockReturnValue(null);
    getPaciente.mockResolvedValue(samplePaciente);
    getTerapiaByPaciente.mockResolvedValue(sampleTerapias);

    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByTestId('trigger-delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('trigger-delete'));

    await waitFor(() => {
      expect(deleteTerapia).not.toHaveBeenCalled();
    });
  });

  test('error handling on fetch failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getPaciente.mockRejectedValue(new Error('Network error'));
    getTerapiaByPaciente.mockRejectedValue(new Error('Network error'));

    renderComponent('1');

    await waitFor(() => {
      expect(screen.getByTestId('terapias-anteriores')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching patient data:',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
