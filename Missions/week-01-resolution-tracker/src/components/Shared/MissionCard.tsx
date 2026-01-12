import { Edit, Trash2, Calendar, MessageSquare } from 'lucide-react';
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

export function MissionCard({
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

  return (
    <article
      className="
        bg-white border border-slate-200 rounded-lg p-4 sm:p-5 
        hover:shadow-md transition-all duration-200 cursor-pointer group
        transform hover:-translate-y-1 focus:outline-none focus:ring-2 
        focus:ring-indigo-500 focus:ring-offset-2 relative overflow-hidden
      "
      onClick={() => onViewDetails(mission.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Mission: ${mission.title}. Status: ${mission.status.replace('_', ' ')}. ${progressCount} progress updates. Press Enter or Space to view details.`}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" aria-hidden="true"></div>
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 flex-1 mr-2">
          {mission.title}
        </h3>
        <StatusBadge status={mission.status} />
      </div>

      {/* Body */}
      {mission.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[2.5rem]">
          {mission.description}
        </p>
      )}

      {/* Progress indicator */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" aria-hidden="true" />
          <span>
            {progressCount === 0 
              ? 'No updates' 
              : `${progressCount} update${progressCount === 1 ? '' : 's'}`
            }
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" aria-hidden="true" />
          <span>{formatDate(mission.updatedAt)}</span>
        </div>
      </div>

      {/* Action Buttons - Always visible on mobile, hover on desktop */}
      <div className="mt-3 pt-3 border-t border-slate-100 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(mission.id);
              }}
              disabled={isLoading}
              aria-hidden={isLoading}
              className="
                p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded 
                transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:ring-offset-1 text-sm font-medium
              "
              aria-label={`Edit mission: ${mission.title}`}
            >
              <Edit className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(mission.id);
              }}
              disabled={isLoading}
              aria-hidden={isLoading}
              className="
                p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded 
                transition-colors focus:outline-none focus:ring-2 focus:ring-red-500
                focus:ring-offset-1 text-sm font-medium
              "
              aria-label={`Delete mission: ${mission.title}`}
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor={`status-${mission.id}`} className="text-xs font-medium text-slate-600 hidden sm:block">
              Status:
            </label>
            <select
              id={`status-${mission.id}`}
              value={mission.status}
              onChange={handleStatusChange}
              onClick={(e) => e.stopPropagation()}
              className="
                text-xs border border-slate-200 rounded px-2 py-1.5 bg-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
                hover:border-slate-300 transition-colors cursor-pointer
              "
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
}
