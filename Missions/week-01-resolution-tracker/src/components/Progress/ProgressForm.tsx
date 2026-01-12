import type { KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const progressFormSchema = z.object({
  content: z.string()
    .min(1, 'Progress update is required')
    .max(1000, 'Progress update must be less than 1000 characters'),
});

type ProgressFormData = z.infer<typeof progressFormSchema>;

interface ProgressFormProps {
  missionId: string;
  onSubmit: (data: ProgressFormData) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ProgressForm({
  missionId,
  onSubmit,
  isLoading = false,
  placeholder = "What progress have you made? What challenges are you facing?",
}: ProgressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressFormSchema),
    defaultValues: {
      content: '',
    },
    mode: 'onChange',
  });

  const watchedContent = watch('content') ?? '';
  const characterCount = watchedContent.length;

  const handleFormSubmit = (data: ProgressFormData) => {
    onSubmit(data);
    reset();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isValid && isDirty) {
        handleSubmit(handleFormSubmit)();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Form Field */}
      <div>
        <label htmlFor={`progress-${missionId}`} className="block text-sm font-medium text-slate-700 mb-2">
          Add Progress Update <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            id={`progress-${missionId}`}
            {...register('content')}
            rows={4}
            className="
              w-full px-3 py-2 border border-slate-300 rounded-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              disabled:bg-slate-50 disabled:text-slate-500 resize-none
            "
            placeholder={placeholder}
            disabled={isLoading}
            onKeyDown={handleKeyDown}
            aria-invalid={errors.content ? 'true' : 'false'}
            aria-describedby={errors.content ? 'content-error' : 'content-help'}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" aria-hidden="true"></div>
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {errors.content && (
          <p id="content-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.content.message}
          </p>
        )}
        
        {/* Help Text */}
        <div id="content-help" className="mt-1 flex justify-between text-xs text-slate-500">
          <span>Share your progress, challenges, or next steps.</span>
          <span className={characterCount > 950 ? 'text-amber-600' : characterCount > 1000 ? 'text-red-600' : ''}>
            {characterCount}/1000
          </span>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isLoading || !isDirty || !isValid}
          className="
            flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2 rounded-md
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed
            transition-colors font-medium text-sm
          "
        >
          {isLoading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
              Adding...
            </>
          ) : (
            'Add Update'
          )}
        </button>
        
        <button
          type="button"
          onClick={() => reset()}
          disabled={isLoading || !isDirty}
          className="
            flex-1 sm:flex-none bg-white text-slate-700 px-4 py-2 rounded-md
            border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2
            focus:ring-slate-500 focus:ring-offset-2 disabled:bg-slate-50
            disabled:text-slate-500 transition-colors font-medium text-sm
          "
        >
          Clear
        </button>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="text-xs text-slate-500 text-center">
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono">Enter</kbd>
          <span>to submit, </span>
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono">Shift+Enter</kbd>
          <span>for new line</span>
        </span>
      </div>
    </form>
  );
}
