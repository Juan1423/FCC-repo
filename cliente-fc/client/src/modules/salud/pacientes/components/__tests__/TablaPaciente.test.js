import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TablaPaciente from '../TablaPaciente';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../../../components/global/UseImageCache', () => () => (url) => url);

const mockPacientes = [
  {
    id_paciente: 1,
    nombre_paciente: 'Juan',
    apellidos_paciente: 'Pérez',
    dni_paciente: '1234567890',
    fecha_paciente: '1990-01-15',
    estado_paciente: true,
    familiar_cuidador: 'María Pérez',
    foto_paciente: '/uploads/comunidad/personas/foto1.jpg',
  },
  {
    id_paciente: 2,
    nombre_paciente: 'Ana',
    apellidos_paciente: 'López',
    dni_paciente: '0987654321',
    fecha_paciente: '1985-06-20',
    estado_paciente: false,
    familiar_cuidador: 'Carlos López',
    foto_paciente: null,
  },
];

const defaultProps = {
  handleEdit: jest.fn(),
  handleDeletePaciente: jest.fn(),
  filterCriteria: { name: '' },
  pacientes: mockPacientes,
  loading: false,
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <TablaPaciente {...defaultProps} {...props} />
    </MemoryRouter>
  );

describe('TablaPaciente', () => {
  it('renders table headers', () => {
    renderComponent();

    expect(screen.getByText(/nombres completo/i)).toBeInTheDocument();
    expect(screen.getByText(/identificación/i)).toBeInTheDocument();
    expect(screen.getByText(/fecha de nacimiento/i)).toBeInTheDocument();
    expect(screen.getByText(/representante/i)).toBeInTheDocument();
    expect(screen.getByText(/estado/i)).toBeInTheDocument();
  });

  it('renders patient rows', () => {
    renderComponent();

    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
    expect(screen.getByText(/Ana López/)).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('0987654321')).toBeInTheDocument();
  });

  it('renders active/inactive chips', () => {
    renderComponent();

    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    renderComponent({ loading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(/Juan Pérez/)).not.toBeInTheDocument();
  });

  it('filters pacientes by name', () => {
    renderComponent({ filterCriteria: { name: 'Ana' } });

    expect(screen.queryByText(/Juan Pérez/)).not.toBeInTheDocument();
    expect(screen.getByText(/Ana López/)).toBeInTheDocument();
  });

  it('filters pacientes by DNI', () => {
    renderComponent({ filterCriteria: { name: '1234567890' } });

    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
    expect(screen.queryByText(/Ana López/)).not.toBeInTheDocument();
  });

  it('calls handleEdit when edit button is clicked', () => {
    const handleEdit = jest.fn();
    renderComponent({ handleEdit });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(handleEdit).toHaveBeenCalledWith(1);
  });

  it('calls handleDeletePaciente when status chip is clicked', () => {
    const handleDeletePaciente = jest.fn();
    renderComponent({ handleDeletePaciente });

    const activeChip = screen.getByText('Activo');
    fireEvent.click(activeChip);

    expect(handleDeletePaciente).toHaveBeenCalledWith(1);
  });

  it('navigates to patient detail on name click', () => {
    renderComponent();

    const nameCell = screen.getByText(/Juan Pérez/);
    fireEvent.click(nameCell);

    expect(mockNavigate).toHaveBeenCalledWith('/fcc-pacientes/1');
  });

  it('paginates when there are many patients', () => {
    const manyPacientes = Array.from({ length: 12 }, (_, i) => ({
      id_paciente: i + 1,
      nombre_paciente: `Paciente${i + 1}`,
      apellidos_paciente: 'Test',
      dni_paciente: `${i}`,
      fecha_paciente: '1990-01-01',
      estado_paciente: true,
      familiar_cuidador: 'Familiar',
      foto_paciente: null,
    }));

    renderComponent({ pacientes: manyPacientes });

    expect(screen.getByText('Paciente1 Test')).toBeInTheDocument();
    expect(screen.queryByText('Paciente6 Test')).not.toBeInTheDocument();

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    expect(screen.getByText('Paciente6 Test')).toBeInTheDocument();
  });
});
