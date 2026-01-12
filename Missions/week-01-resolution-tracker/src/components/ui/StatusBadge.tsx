import type { Mission } from '../../types';

interface StatusBadgeProps {
  status: Mission['status'];
  className?: string;
}

const statusConfig: Record<Mission['status'], { label: string; classes: string }> = {
  not_started: {
    label: 'NOT STARTED',
    classes: 'bg-slate-100 text-slate-700',
  },
  in_progress: {
    label: 'IN PROGRESS',
    classes: 'bg-orange-100 text-orange-700',
  },
  completed: {
    label: 'COMPLETED',
    classes: 'bg-emerald-100 text-emerald-700',
  },
  blocked: {
    label: 'BLOCKED',
    classes: 'bg-red-100 text-red-700',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={`
        inline-flex items-center rounded px-2 py-1 text-xs font-semibold uppercase
        ${config.classes}
        ${className}
      `}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
