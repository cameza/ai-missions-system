import { Edit, Trash2 } from 'lucide-react';
import type { Mission } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface MissionCardProps {
  mission: Mission;
  progressCount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  onStatusChange: (id: string, status: Mission['status']) => void;
}

export function MissionCard({
  mission,
  progressCount,
  onEdit,
  onDelete,
  onViewDetails,
  onStatusChange,
}: MissionCardProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(mission.id, e.target.value as Mission['status']);
  };

  return (
    <article
      className="
        bg-white border border-slate-200 rounded-lg p-5 
        hover:shadow-md transition-all duration-200 cursor-pointer group
        transform hover:-translate-y-1
      "
      onClick={() => onViewDetails(mission.id)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-semibold text-slate-900 truncate flex-1 mr-2">
          {mission.title}
        </h3>
        <StatusBadge status={mission.status} />
      </div>

      {/* Body */}
      {mission.description && (
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {mission.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>
          {progressCount === 0 
            ? 'No updates yet' 
            : `${progressCount} update${progressCount === 1 ? '' : 's'}`
          }
        </span>
        <span>
          Last updated: {mission.updatedAt.toLocaleDateString()}
        </span>
      </div>

      {/* Action Buttons - Show on hover */}
      <div className="mt-3 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(mission.id);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              aria-label="Edit mission"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(mission.id);
              }}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              aria-label="Delete mission"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <select
            value={mission.status}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>
    </article>
  );
}
