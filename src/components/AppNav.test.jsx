import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AppNav from './AppNav';

// Mock Brand component first
vi.mock('./Brand', () => ({
  default: () => <div data-testid="brand">QuickBite</div>,
}));

// Mock the stores
vi.mock('../store/auth', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../store/cart', () => ({
  useCart: vi.fn(),
}));

import { useAuthStore } from '../store/auth';
import { useCart } from '../store/cart';

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('AppNav component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockImplementation((selector) => selector({
      user: { role: 'Customer', name: 'Test User' },
      logout: vi.fn(),
    }));
    useCart.mockImplementation((selector) => selector({
      count: () => 2,
    }));
  });

  it('renders navigation for Customer role', () => {
    renderWithRouter(<AppNav />);

    expect(screen.getByTestId('brand')).toBeInTheDocument();
  });

  it('shows login/register when no user', () => {
    useAuthStore.mockImplementation((selector) => selector({
      user: null,
      logout: vi.fn(),
    }));
    useCart.mockImplementation((selector) => selector({
      count: () => 0,
    }));

    renderWithRouter(<AppNav />);

    const loginLinks = screen.getAllByRole('link', { name: /login/i });
    expect(loginLinks).toHaveLength(2);

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
  });
});