import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('bg-indigo-600');
    expect(button.className).toContain('text-white');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    let button = screen.getByRole('button', { name: 'Secondary' });
    expect(button.className).toContain('bg-slate-100');
    expect(button.className).toContain('text-slate-900');

    rerender(<Button variant="danger">Danger</Button>);
    button = screen.getByRole('button', { name: 'Danger' });
    expect(button.className).toContain('bg-red-600');
    expect(button.className).toContain('text-white');

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: 'Ghost' });
    expect(button.className).toContain('hover:bg-slate-100');
    expect(button.className).toContain('hover:text-slate-900');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button', { name: 'Small' });
    expect(button.className).toContain('h-9');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: 'Large' });
    expect(button.className).toContain('h-11');
  });

  it('renders as link when as="a"', () => {
    render(<Button as="a" href="https://example.com">Link</Button>);
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('https://example.com');
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button', { name: 'Loading' });
    expect(button.disabled).toBe(true);
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with icons', () => {
    render(
      <Button leftIcon={<span data-testid="left-icon">←</span>} rightIcon={<span data-testid="right-icon">→</span>}>
        With Icons
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    render(<Button isFullWidth>Full Width</Button>);
    const button = screen.getByRole('button', { name: 'Full Width' });
    expect(button.className).toContain('w-full');
  });
});
