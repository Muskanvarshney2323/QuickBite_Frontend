import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Toasts from './Toasts';

// Mock the toast store
vi.mock('../store/toast', () => ({
  useToast: vi.fn(),
}));

import { useToast } from '../store/toast';

describe('Toasts component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders no toasts when items array is empty', () => {
    useToast.mockReturnValue([]);

    render(<Toasts />);

    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('renders toast messages', () => {
    const mockItems = [
      { id: 1, message: 'Success message', type: 'success' },
      { id: 2, message: 'Error message', type: 'error' },
      { id: 3, message: 'Default message', type: 'default' },
    ];

    useToast.mockReturnValue(mockItems);

    render(<Toasts />);

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Default message')).toBeInTheDocument();
  });

  it('applies correct CSS classes for toast types', () => {
    const mockItems = [
      { id: 1, message: 'Success', type: 'success' },
      { id: 2, message: 'Error', type: 'error' },
      { id: 3, message: 'Info', type: 'info' },
    ];

    useToast.mockReturnValue(mockItems);

    render(<Toasts />);

    const successToast = screen.getByText('Success').closest('.toast');
    const errorToast = screen.getByText('Error').closest('.toast');
    const infoToast = screen.getByText('Info').closest('.toast');

    expect(successToast).toHaveClass('success');
    expect(errorToast).toHaveClass('error');
    expect(infoToast).toHaveClass('info');
  });

  it('renders default toast without additional class', () => {
    const mockItems = [
      { id: 1, message: 'Default toast', type: 'default' },
    ];

    useToast.mockReturnValue(mockItems);

    render(<Toasts />);

    const toast = screen.getByText('Default toast').closest('.toast');
    expect(toast).toHaveClass('toast');
    expect(toast).not.toHaveClass('default');
  });
});