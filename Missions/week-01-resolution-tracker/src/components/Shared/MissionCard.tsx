import { Edit, Trash2, Calendar, MessageSquare } from 'lucide-react';
import { memo, useCallback } from 'react';
import type { Mission } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface MissionCardProps {
  mission: Mission;
  progressCount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  onStatusChange: (id: string, status: Mission['status']) => void;
  isLoading?: boolean;
}

export const MissionCard = memo(function MissionCard({
  mission,
  progressCount,
  onEdit,
  onDelete,
  onViewDetails,
  onStatusChange,
  isLoading = false,
}: MissionCardProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(mission.id, e.target.value as Mission['status']);
  };

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(mission.id);
  }, [onEdit, mission.id]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(mission.id);
  }, [onDelete, mission.id]);

  const handleCardClick = useCallback(() => {
    onViewDetails(mission.id);
  }, [onViewDetails, mission.id]);

  const handleStatusSelectClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewDetails(mission.id);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const updatesCopy = progressCount === 0 
    ? 'No updates yet' 
    : `${progressCount} update${progressCount === 1 ? '' : 's'}`;

  return (
    <article
      className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for mission: ${mission.title}. Status: ${mission.status.replace('_', ' ')}. ${updatesCopy}. Press Enter or Space to view details.`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" aria-hidden="true" />
          <span className="sr-only">Loading...</span>
        </div>
      )}

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              Mission
            </p>
            <h3 className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
              {mission.title}
            </h3>
          </div>
          <StatusBadge status={mission.status} />
        </div>

        {mission.description && (
          <p className="text-sm text-slate-600 line-clamp-3">
            {mission.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100/80 bg-slate-50/60 p-3 text-xs font-medium text-slate-600">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Updates</span>
            <div className="flex items-center gap-1.5 text-slate-700">
              <MessageSquare className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {updatesCopy}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Last Touch</span>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {formatDate(mission.updatedAt)}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditClick}
              disabled={isLoading}
              aria-hidden={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label={`Edit mission: ${mission.title}`}
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isLoading}
              aria-hidden={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50/70 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
              aria-label={`Delete mission: ${mission.title}`}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor={`status-${mission.id}`} className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              Status
            </label>
            <select
              id={`status-${mission.id}`}
              value={mission.status}
              onChange={handleStatusChange}
              onClick={handleStatusSelectClick}
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label={`Change status for mission: ${mission.title}`}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>
    </article>
  );
});
