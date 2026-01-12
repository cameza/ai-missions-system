import React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    showCharacterCount = false, 
    maxLength,
    id,
    value,
    onChange,
    ...props 
  }, ref) => {
    // Use React.useId for stable IDs
    const generatedId = React.useId();
    const textareaId = id || `textarea-${generatedId}`;
    
    const textareaClasses = cn(
      'flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      error && 'border-red-500 focus-visible:ring-red-500',
      className
    );

    // Calculate character count from current value
    const characterCount = typeof value === 'string' ? value.length : 0;
    const isOverLimit = maxLength && characterCount > maxLength;
    const remainingChars = maxLength ? maxLength - characterCount : 0;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <textarea
          className={textareaClasses}
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error 
              ? `${textareaId}-error` 
              : helperText 
                ? `${textareaId}-helper` 
                : showCharacterCount && maxLength
                  ? `${textareaId}-counter`
                  : undefined
          }
          {...props}
        />
        
        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="text-sm text-slate-600">
            {helperText}
          </p>
        )}
        
        {showCharacterCount && maxLength && !error && (
          <p 
            id={`${textareaId}-counter`} 
            className={cn(
              "text-xs",
              isOverLimit ? "text-red-600" : "text-slate-500"
            )}
          >
            {remainingChars} characters remaining
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
