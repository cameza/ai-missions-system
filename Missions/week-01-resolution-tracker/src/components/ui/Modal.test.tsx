import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

type ModalTestProps = Omit<React.ComponentProps<typeof Modal>, 'isOpen' | 'onClose'> & {
  initialOpen?: boolean;
  onClose?: () => void;
};

function ControlledModal({ initialOpen = true, onClose, ...props }: ModalTestProps) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return <Modal {...props} isOpen={isOpen} onClose={handleClose} />;
}

describe('Modal Component', () => {
  it('renders when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(
      <ControlledModal onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </ControlledModal>
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(
      <ControlledModal onClose={onClose} title="Test Modal" closeOnBackdropClick={true}>
        <p>Modal content</p>
      </ControlledModal>
    );
    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop click when disabled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(
      <ControlledModal onClose={onClose} title="Test Modal" closeOnBackdropClick={false}>
        <p>Modal content</p>
      </ControlledModal>
    );
    
    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" showCloseButton={false}>
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" description="Modal description">
        <p>Modal content</p>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('traps focus within modal', async () => {
    const user = userEvent.setup();
    
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <button>Modal Button</button>
        <input type="text" placeholder="Modal Input" />
      </Modal>
    );
    
    const modalButton = screen.getByRole('button', { name: 'Modal Button' });
    modalButton.focus();
    expect(modalButton).toHaveFocus();
    
    await user.tab();
    const modalInput = screen.getByPlaceholderText('Modal Input');
    expect(modalInput).toHaveFocus();
  });
});
