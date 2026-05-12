import { render, screen } from '@testing-library/react';
import Brand from './Brand';

describe('Brand component', () => {
  it('renders the brand text', () => {
    render(<Brand />);

    expect(screen.getByText(/QuickBite/i)).toBeInTheDocument();
    expect(screen.getByText('Q')).toBeInTheDocument();
  });
});
