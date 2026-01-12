import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex', 'h-10', 'w-full');
  });

  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Input error="This field is required" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500', 'focus-visible:ring-red-500');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('associates label with input correctly', () => {
    render(<Input label="Password" />);
    const label = screen.getByText('Password');
    const input = screen.getByLabelText('Password');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    render(<Input value="" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test input');
    expect(input).toHaveValue('test input');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('cursor-not-allowed', 'opacity-50');
  });

  it('generates stable IDs', () => {
    const { rerender } = render(<Input label="Test" />);
    const input1 = screen.getByLabelText('Test');
    const id1 = input1.id;

    rerender(<Input label="Test" />);
    const input2 = screen.getByLabelText('Test');
    const id2 = input2.id;

    expect(id1).toBe(id2);
    expect(id1).toMatch(/^input-/);
  });
});
