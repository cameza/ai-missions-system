import type { Mission } from '../../types';

interface StatusBadgeProps {
  status: Mission['status'];
  className?: string;
}

const statusConfig: Record<Mission['status'], { label: string; className: string }> = {
  not_started: {
    label: 'Not Started',
    className: 'bg-slate-100 text-slate-700',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-700',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700',
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-red-100 text-red-700',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ${config.className}
        ${className}
      `}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
