import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DetallePaciente from '../DetallePaciente';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}));

jest.mock('../../../../../services/pacientesServices', () => ({
  getPaciente: jest.fn(),
}));

jest.mock('../../../../../components/PdfGeneratorPaciente', () => () => <div>PDF Generator</div>);

const { getPaciente } = require('../../../../../services/pacientesServices');

const renderComponent = () =>
  render(
    <MemoryRouter initialEntries={['/fcc-pacientes/1']}>
      <Routes>
        <Route path="/fcc-pacientes/:id" element={<DetallePaciente />} />
      </Routes>
    </MemoryRouter>
  );

const mockPatient = {
  id_paciente: 1,
  nombre_paciente: 'Juan',
  apellidos_paciente: 'Pérez',
  dni_paciente: '1234567890',
  tipo_dni_paciente: 'Cédula',
  direccion_paciente: 'Calle 123',
  telefono_paciente: '0999999999',
  email_paciente: 'juan@test.com',
  fecha_paciente: '1990-01-15',
  fecha_registro_paciente: '2024-01-01',
  edad_paciente: 34,
  genero_paciente: 'Masculino',
  nacionalidad_paciente: 'Ecuatoriana',
  tiposangre_paciente: 'O+',
  biografia_paciente: 'Biografía de prueba',
  familiar_cuidador: 'María Pérez',
  parentesco_familiar: 'Madre',
  telefono_cuidador: '0988888888',
  foto_paciente: '/uploads/comunidad/personas/foto1.jpg',
  archivo_documentos_cedulas: '/uploads/documentos/cedula.pdf',
  archivo_certificado_medico: '/uploads/documentos/certificado.pdf',
};

describe('DetallePaciente', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    getPaciente.mockReturnValue(new Promise(() => {}));
    const { container } = renderComponent();

    const skeletonElements = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders patient details after loading', async () => {
    getPaciente.mockResolvedValue(mockPatient);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    expect(screen.getByText(/Cédula: 1234567890/)).toBeInTheDocument();
    expect(screen.getByText(/Calle 123/)).toBeInTheDocument();
    expect(screen.getByText('0999999999')).toBeInTheDocument();
    expect(screen.getByText('juan@test.com')).toBeInTheDocument();
    expect(screen.getByText('O+')).toBeInTheDocument();
    expect(screen.getByText('Masculino')).toBeInTheDocument();
  });

  it('renders caregiver information', async () => {
    getPaciente.mockResolvedValue(mockPatient);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('María Pérez')).toBeInTheDocument();
    });

    expect(screen.getByText('Madre')).toBeInTheDocument();
    expect(screen.getByText('0988888888')).toBeInTheDocument();
  });

  it('renders PDF Generator component', async () => {
    getPaciente.mockResolvedValue(mockPatient);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('PDF Generator')).toBeInTheDocument();
    });
  });

  it('shows N/A for missing optional fields', async () => {
    getPaciente.mockResolvedValue({ id_paciente: 1, nombre_paciente: 'Test' });
    renderComponent();

    await waitFor(() => {
      const naItems = screen.getAllByText('N/A');
      expect(naItems.length).toBeGreaterThan(0);
    });
  });

  it('navigates back when back button is clicked', async () => {
    getPaciente.mockResolvedValue(mockPatient);
    const { container } = renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    const buttons = container.querySelectorAll('button');
    const backButton = Array.from(buttons).find(
      (btn) => btn.querySelector('svg')
    );
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders document section with PDF view button', async () => {
    getPaciente.mockResolvedValue(mockPatient);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/ver pdf cédula/i)).toBeInTheDocument();
    });
  });
});
