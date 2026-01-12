import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea Component', () => {
  it('renders with default props', () => {
    render(<Textarea placeholder="Enter description" />);
    const textarea = screen.getByPlaceholderText('Enter description');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full');
  });

  it('renders with label', () => {
    render(<Textarea label="Description" />);
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Textarea error="Description is required" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-red-500', 'focus-visible:ring-red-500');
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<Textarea helperText="Provide a detailed description" />);
    expect(screen.getByText('Provide a detailed description')).toBeInTheDocument();
  });

  it('shows character count when enabled', () => {
    render(<Textarea showCharacterCount maxLength={100} value="test" />);
    expect(screen.getByText('96 characters remaining')).toBeInTheDocument();
  });

  it('updates character count as user types', async () => {
    const user = userEvent.setup();
    render(<Textarea showCharacterCount maxLength={10} value="" onChange={() => {}} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'hello');
    
    expect(screen.getByText('5 characters remaining')).toBeInTheDocument();
  });

  it('shows over limit warning', async () => {
    const user = userEvent.setup();
    render(<Textarea showCharacterCount maxLength={5} value="" onChange={() => {}} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'too long text');
    
    expect(screen.getByText('4 characters remaining')).toHaveClass('text-red-600');
  });

  it('associates label with textarea correctly', () => {
    render(<Textarea label="Notes" />);
    const label = screen.getByText('Notes');
    const textarea = screen.getByLabelText('Notes');
    expect(label).toHaveAttribute('for', textarea.id);
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    render(<Textarea value="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    
    await user.type(textarea, 'test content');
    expect(textarea).toHaveValue('test content');
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('handles disabled state', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('cursor-not-allowed', 'opacity-50');
  });

  it('generates stable IDs', () => {
    const { rerender } = render(<Textarea label="Test" />);
    const textarea1 = screen.getByLabelText('Test');
    const id1 = textarea1.id;

    rerender(<Textarea label="Test" />);
    const textarea2 = screen.getByLabelText('Test');
    const id2 = textarea2.id;

    expect(id1).toBe(id2);
    expect(id1).toMatch(/^textarea-/);
  });

  it('does not show character count when disabled', () => {
    render(<Textarea showCharacterCount maxLength={100} disabled />);
    expect(screen.queryByText(/characters remaining/)).not.toBeInTheDocument();
  });
});
