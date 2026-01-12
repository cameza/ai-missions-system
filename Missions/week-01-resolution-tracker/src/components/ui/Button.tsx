import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { buttonVariants } from './buttonVariants';

type BaseButtonProps = {
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
} & VariantProps<typeof buttonVariants>;

type ButtonAsButton = BaseButtonProps & 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    as?: 'button';
    href?: never;
  };

type ButtonAsLink = BaseButtonProps & 
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    as: 'a';
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const { 
      className, 
      variant, 
      size, 
      isLoading = false, 
      isFullWidth = false, 
      leftIcon, 
      rightIcon, 
      children, 
      as = 'button',
      ...rest 
    } = props;

    const buttonClasses = cn(
      buttonVariants({ variant, size, className }),
      isFullWidth && 'w-full',
      (('disabled' in rest && rest.disabled) || isLoading) && 'cursor-not-allowed'
    );

    const renderContent = () => (
      <>
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        
        <span className={isLoading ? 'opacity-70' : ''}>{children}</span>
        
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    );

    if (as === 'a') {
      const { href, ...anchorProps } = rest as ButtonAsLink;
      return (
        <a
          className={buttonClasses}
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-disabled={isLoading}
          {...anchorProps}
        >
          {renderContent()}
        </a>
      );
    }

    const { disabled, ...buttonProps } = rest as ButtonAsButton;
    return (
      <button
        className={buttonClasses}
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...buttonProps}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
