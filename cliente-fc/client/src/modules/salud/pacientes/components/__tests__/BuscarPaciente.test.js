import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BuscarPaciente from '../buscarPaciente';

jest.useFakeTimers();

describe('BuscarPaciente', () => {
  it('renders search input and active toggle', () => {
    render(<BuscarPaciente onSearch={jest.fn()} onFilterChange={jest.fn()} />);

    expect(screen.getByLabelText(/buscar por nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/solo activos/i)).toBeInTheDocument();
  });

  it('calls onSearch with debounce when typing', () => {
    const onSearch = jest.fn();
    render(<BuscarPaciente onSearch={onSearch} onFilterChange={jest.fn()} />);

    const input = screen.getByLabelText(/buscar por nombre/i);
    fireEvent.change(input, { target: { value: 'Juan' } });

    expect(onSearch).not.toHaveBeenCalledWith('Juan', true);

    jest.advanceTimersByTime(300);

    expect(onSearch).toHaveBeenCalledWith('Juan', true);
  });

  it('calls onSearch with active=false when toggle is off', () => {
    const onSearch = jest.fn();
    render(<BuscarPaciente onSearch={onSearch} onFilterChange={jest.fn()} />);

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    jest.advanceTimersByTime(300);

    expect(onSearch).toHaveBeenCalledWith('', false);
  });

  it('calls onFilterChange when toggle is clicked', () => {
    const onFilterChange = jest.fn();
    render(<BuscarPaciente onSearch={jest.fn()} onFilterChange={onFilterChange} />);

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    expect(onFilterChange).toHaveBeenCalledWith(false);
  });

  it('starts with activeOnly = true by default', () => {
    render(<BuscarPaciente onSearch={jest.fn()} onFilterChange={jest.fn()} />);

    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeChecked();
  });

  it('accepts initialActiveOnly prop', () => {
    render(
      <BuscarPaciente
        onSearch={jest.fn()}
        onFilterChange={jest.fn()}
        initialActiveOnly={false}
      />
    );

    const toggle = screen.getByRole('checkbox');
    expect(toggle).not.toBeChecked();
  });
});
