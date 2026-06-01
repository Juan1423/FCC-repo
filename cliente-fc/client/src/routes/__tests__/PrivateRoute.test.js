import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';

const mockVerifyToken = jest.fn();
jest.mock('../../services/authServices', () => ({
  verifyToken: (...args) => mockVerifyToken(...args),
  logout: jest.fn(),
}));

const MockComponent = () => <div data-testid="protected-content">Protected</div>;

const renderPrivateRoute = (allowedRoles = ['admin'], initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <PrivateRoute element={MockComponent} allowedRoles={allowedRoles} />
    </MemoryRouter>
  );
};

describe('PrivateRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner initially', () => {
    mockVerifyToken.mockReturnValue(new Promise(() => {}));
    renderPrivateRoute();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders the protected element when token is valid and role matches', async () => {
    mockVerifyToken.mockResolvedValue({
      isValid: true,
      data: { rol: 'admin' },
    });

    renderPrivateRoute(['admin']);

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('redirects to /accessdenied when token is invalid', async () => {
    mockVerifyToken.mockResolvedValue({ isValid: false });

    renderPrivateRoute(['admin']);

    await waitFor(() => {
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  it('redirects to /accessdenied when role is not allowed', async () => {
    mockVerifyToken.mockResolvedValue({
      isValid: true,
      data: { rol: 'user' },
    });

    renderPrivateRoute(['admin']);

    await waitFor(() => {
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  it('redirects to /accessdenied on verifyToken error', async () => {
    mockVerifyToken.mockRejectedValue(new Error('Network error'));

    renderPrivateRoute(['admin']);

    await waitFor(() => {
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  it('allows access when role is personal_administrativo and is in allowedRoles', async () => {
    mockVerifyToken.mockResolvedValue({
      isValid: true,
      data: { rol: 'personal_administrativo' },
    });

    renderPrivateRoute(['admin', 'personal_administrativo']);

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('redirects personal_administrativo when not in allowedRoles', async () => {
    mockVerifyToken.mockResolvedValue({
      isValid: true,
      data: { rol: 'personal_administrativo' },
    });

    renderPrivateRoute(['admin']);

    await waitFor(() => {
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
});
