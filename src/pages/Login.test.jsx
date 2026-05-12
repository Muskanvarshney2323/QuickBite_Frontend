import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from './Login';

// Mock the stores
vi.mock('../store/auth', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../store/toast', () => ({
  useToast: vi.fn(),
}));

// Mock Brand component
vi.mock('../components/Brand', () => ({
  default: () => <div data-testid="brand">QuickBite</div>,
}));

// Mock AppLayout's roleHome function
vi.mock('../components/AppLayout', () => ({
  roleHome: vi.fn(() => '/restaurants'),
}));

import { useAuthStore } from '../store/auth';
import { useToast } from '../store/toast';

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('Login component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    const mockLogin = vi.fn();
    useAuthStore.mockImplementation((selector) => selector({ login: mockLogin, loading: false }));
    useToast.mockImplementation((selector) => selector({ push: vi.fn() }));

    renderWithRouter(<Login />);

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows validation error when fields are empty', async () => {
    const mockToast = vi.fn();
    useAuthStore.mockImplementation((selector) => selector({ login: vi.fn(), loading: false }));
    useToast.mockImplementation((selector) => selector({ push: mockToast }));

    renderWithRouter(<Login />);

    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Enter email and password', 'error');
    });
  });

  it('calls login with correct credentials', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      user: { name: 'Test User', role: 'Customer' },
    });
    const mockToast = vi.fn();

    useAuthStore.mockImplementation((selector) => selector({ login: mockLogin, loading: false }));
    useToast.mockImplementation((selector) => selector({ push: mockToast }));

    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockToast).toHaveBeenCalledWith('Welcome back, Test User', 'success');
  });

  it('handles login error', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    const mockToast = vi.fn();

    useAuthStore.mockImplementation((selector) => selector({ login: mockLogin, loading: false }));
    useToast.mockImplementation((selector) => selector({ push: mockToast }));

    renderWithRouter(<Login />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Invalid credentials', 'error');
    });
  });

  it('shows loading state during login', () => {
    useAuthStore.mockImplementation((selector) => selector({ login: vi.fn(), loading: true }));
    useToast.mockImplementation((selector) => selector({ push: vi.fn() }));

    renderWithRouter(<Login />);

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
  });
});