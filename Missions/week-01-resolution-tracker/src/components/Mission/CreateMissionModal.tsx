import { X, Info, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMissionStore, useMissionStats } from '../../store/missionStore';
import type { Mission } from '../../types';
import { MissionStatus } from '../../types';

const createMissionSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

type CreateMissionFormData = z.infer<typeof createMissionSchema>;

interface CreateMissionModalProps {
  onClose: () => void;
}

export function CreateMissionModal({ onClose }: CreateMissionModalProps) {
  const {
    createMission,
    updateMission,
    editingMissionId,
    missions,
    setEditingMissionId,
  } = useMissionStore();
  const stats = useMissionStats();

  const editingMission = editingMissionId
    ? (missions.find((mission) => mission.id === editingMissionId) ?? null)
    : null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionSchema),
    defaultValues: {
      title: editingMission?.title ?? '',
      description: editingMission?.description ?? '',
    },
  });

  const handleClose = () => {
    reset();
    setEditingMissionId(null);
    onClose();
  };

  const onSubmit = (data: CreateMissionFormData) => {
    if (editingMission) {
      const updatedMission: Partial<Mission> = {
        title: data.title,
        description: data.description ?? '',
      };
      updateMission(editingMission.id, updatedMission);
    } else {
      createMission({
        title: data.title,
        description: data.description ?? '',
        status: MissionStatus.NotStarted,
        isActive: true,
      });
    }

    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-mission-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[560px] flex flex-col bg-white rounded-2xl shadow-2xl border border-white/60 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 pt-8 pb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex flex-col gap-1">
              <h2
                id="create-mission-title"
                className="text-2xl font-bold tracking-tight text-slate-900"
              >
                {editingMission ? 'Edit Mission' : 'New Mission'}
              </h2>
              <p className="text-sm text-slate-500">
                {editingMission
                  ? 'Update mission details and keep your plan aligned.'
                  : 'Define your next AI challenge to track your progress.'}
              </p>
            </div>
            {!editingMission && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 tabular-nums">
                {stats.total} of 10 missions used
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="px-8 py-2 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="mission-title"
                className="text-sm font-semibold text-slate-900"
              >
                Mission Title <span className="text-primary">*</span>
              </label>
              <input
                id="mission-title"
                type="text"
                {...register('title')}
                className="
                  flex w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 
                  text-base text-slate-900 placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                  transition-all
                "
                placeholder="e.g., Mastering LLM Prompt Engineering"
                autoFocus
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="mission-description"
                className="text-sm font-semibold text-slate-900"
              >
                Description{' '}
                <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                id="mission-description"
                {...register('description')}
                className="
                  flex w-full min-h-[140px] rounded-xl border border-slate-200 bg-slate-50/50 p-4 
                  text-base text-slate-900 placeholder:text-slate-400 resize-none
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                  transition-all
                "
                placeholder="Describe the outcomes you want to achieve with this AI skill or project..."
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-slate-600">
                Missions help you compartmentalize learning. Once started, you can add specific milestones to track granular progress.
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-8 py-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="
                h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700
                transition-all hover:bg-slate-50 hover:border-slate-300
                focus:outline-none focus:ring-2 focus:ring-slate-200
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!editingMission && !watch('title').trim())}
              className="
                inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white
                shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-blue-600/40
                active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-70
              "
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {editingMission ? 'Update Mission' : 'Create Mission'}
            </button>
          </div>
        </form>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
