import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { KeyboardEvent } from 'react';
import type { Mission } from '../../types';

// Form validation schema using existing types
const missionFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']),
  isActive: z.boolean(),
});

type MissionFormData = z.infer<typeof missionFormSchema>;

interface MissionFormProps {
  mission?: Mission;
  onSubmit: (data: MissionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MissionForm({
  mission,
  onSubmit,
  onCancel,
  isLoading = false,
}: MissionFormProps) {
  const isEditing = !!mission;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
  } = useForm<MissionFormData>({
    resolver: zodResolver(missionFormSchema),
    mode: 'onChange',
    defaultValues: mission ? {
      title: mission.title,
      description: mission.description || '',
      status: mission.status,
      isActive: mission.isActive,
    } : {
      title: '',
      description: '',
      status: 'not_started',
      isActive: true,
    },
  });

  const descriptionValue = watch('description') ?? '';

  const handleFormSubmit = (data: MissionFormData) => {
    onSubmit(data);
    if (!isEditing) {
      reset();
    }
  };

  const handleDescriptionKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && isDirty && isValid) {
        handleSubmit(handleFormSubmit)();
      }
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="
            w-full px-3 py-2 border border-slate-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            disabled:bg-slate-50 disabled:text-slate-500
          "
          placeholder="Enter mission title..."
          disabled={isLoading}
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
          Description <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="
            w-full px-3 py-2 border border-slate-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            disabled:bg-slate-50 disabled:text-slate-500 resize-none
          "
          placeholder="Enter mission description..."
          disabled={isLoading}
          aria-invalid={errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'description-error' : undefined}
          onKeyDown={handleDescriptionKeyDown}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.description.message}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          {descriptionValue.length}/500 characters
        </p>
      </div>

      {/* Status and Active Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status Field */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="
              w-full px-3 py-2 border border-slate-300 rounded-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              disabled:bg-slate-50 disabled:text-slate-500
            "
            disabled={isLoading}
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Active Field */}
        <div className="flex items-center">
          <div className="flex items-center h-5">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="
                h-4 w-4 text-indigo-600 border-slate-300 rounded
                focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500
              "
              disabled={isLoading}
            />
          </div>
          <div className="ml-3">
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Active Mission
            </label>
            <p className="text-xs text-slate-500">
              Track this mission actively
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={isLoading || (isEditing && !isDirty)}
          className="
            flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-2.5 rounded-md
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed
            transition-colors font-medium
          "
        >
          {isLoading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEditing ? 'Update Mission' : 'Create Mission'}</>
          )}
        </button>
        
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="
            flex-1 sm:flex-none bg-white text-slate-700 px-6 py-2.5 rounded-md
            border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2
            focus:ring-slate-500 focus:ring-offset-2 disabled:bg-slate-50
            disabled:text-slate-500 transition-colors font-medium
          "
        >
          Cancel
        </button>
      </div>

      {/* Form Status */}
      {isDirty && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="text-sm text-amber-800">
            You have unsaved changes. Click "{isEditing ? 'Update' : 'Create'} Mission" to save or "Cancel" to discard.
          </p>
        </div>
      )}
    </form>
  );
}
