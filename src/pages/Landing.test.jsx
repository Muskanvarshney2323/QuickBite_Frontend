import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the auth store
vi.mock('../store/auth', () => ({
  useAuthStore: vi.fn(),
}));

describe('Landing component', () => {
  it('component can be imported', async () => {
    const { default: Landing } = await import('./Landing');
    expect(Landing).toBeDefined();
    expect(typeof Landing).toBe('function');
  }, 10000);

  it('normalizeRole function can be imported', async () => {
    const { normalizeRole } = await import('./Landing');
    expect(normalizeRole).toBeDefined();
    expect(typeof normalizeRole).toBe('function');
  }, 10000);

  it('roleHome function can be imported', async () => {
    const { roleHome } = await import('./Landing');
    expect(roleHome).toBeDefined();
    expect(typeof roleHome).toBe('function');
  });

  it('renders landing page content', async () => {
    const { default: Landing } = await import('./Landing');
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getByText(/Hot meals,/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Log in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign up/i })).toBeInTheDocument();
  });
});