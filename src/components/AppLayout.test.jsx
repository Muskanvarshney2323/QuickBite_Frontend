import { describe, it, expect, vi } from 'vitest';

// Mock the auth store
vi.mock('../store/auth', () => ({
  useAuthStore: vi.fn(),
}));

describe('AppLayout component', () => {
  it('component can be imported', async () => {
    const { default: AppLayout } = await import('./AppLayout');
    expect(AppLayout).toBeDefined();
    expect(typeof AppLayout).toBe('function');
  }, 10000);

  it('normalizeRole function can be imported', async () => {
    const { normalizeRole } = await import('./AppLayout');
    expect(normalizeRole).toBeDefined();
    expect(typeof normalizeRole).toBe('function');
  });

  it('roleHome function can be imported', async () => {
    const { roleHome } = await import('./AppLayout');
    expect(roleHome).toBeDefined();
    expect(typeof roleHome).toBe('function');
  });
});