import { MessageCircle, Clock } from 'lucide-react';
import type { ProgressUpdate } from '../../types';

interface ProgressTimelineProps {
  progressUpdates: ProgressUpdate[];
  isLoading?: boolean;
}

export function ProgressTimeline({
  progressUpdates,
  isLoading = false,
}: ProgressTimelineProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    }
    if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    }
    if (diffInDays < 7) {
      return diffInDays === 1 ? 'Yesterday' : `${diffInDays} days ago`;
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-600">
          <MessageCircle className="w-4 h-4" />
          <h3 className="font-medium">Progress Updates</h3>
        </div>
        <div className="space-y-3" data-testid="loading-skeletons">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse" data-testid={`skeleton-${i}`}>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-slate-300 rounded-full mt-2"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-300 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (progressUpdates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 mb-3">
          <MessageCircle className="w-8 h-8 mx-auto" />
        </div>
        <h3 className="text-sm font-medium text-slate-900 mb-1">No progress updates yet</h3>
        <p className="text-sm text-slate-600">
          Start tracking your progress by adding your first update.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-600">
          <MessageCircle className="w-4 h-4" />
          <h3 className="font-medium">Progress Updates</h3>
        </div>
        <div className="text-sm text-slate-500">
          {progressUpdates.length} update{progressUpdates.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {progressUpdates.map((update, index) => (
          <div key={update.id} className="relative">
            {/* Timeline line */}
            {index < progressUpdates.length - 1 && (
              <div className="absolute left-1.5 top-6 w-0.5 h-full bg-slate-200" />
            )}

            <div className="flex gap-3">
              {/* Timeline dot */}
              <div className="relative">
                <div className="w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
                {index === 0 && (
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-indigo-100 rounded-full animate-pulse" />
                )}
              </div>

              {/* Update content */}
              <div className="flex-1 min-w-0">
                <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      <time 
                        dateTime={update.timestamp.toISOString()}
                        title={formatFullDate(update.timestamp)}
                      >
                        {formatDate(update.timestamp)}
                      </time>
                    </div>
                    {index === 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        Latest
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="text-sm text-slate-900 whitespace-pre-wrap break-words">
                    {update.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with summary */}
      {progressUpdates.length > 1 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            First update {formatDate(progressUpdates[progressUpdates.length - 1].timestamp)} • 
            Latest update {formatDate(progressUpdates[0].timestamp)}
          </div>
        </div>
      )}
    </div>
  );
}
