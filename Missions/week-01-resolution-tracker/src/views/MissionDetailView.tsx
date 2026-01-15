import { ArrowLeft, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import type { Mission } from '../types';
import { useMissionStore, useMissionProgress } from '../store/missionStore';
import { ProgressTimeline } from '../components/Progress/ProgressTimeline';
import { ProgressForm } from '../components/Progress/ProgressForm';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../hooks/useToast';
import { useState } from 'react';

interface MissionDetailViewProps {
  missionId: string;
  onBack: () => void;
  onEdit: (missionId: string) => void;
}

export function MissionDetailView({
  missionId,
  onBack,
  onEdit,
}: MissionDetailViewProps) {
  const toast = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const mission = useMissionStore((state) => 
    state.missions.find(m => m.id === missionId)
  );
  const progressUpdates = useMissionProgress(missionId);
  const { updateMission, deleteMission, addProgressUpdate } = useMissionStore();

  const handleStatusChange = (status: Mission['status']) => {
    updateMission(missionId, { status });
  };

  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMission(missionId, mission?.title);
      setShowDeleteDialog(false);
      onBack();
    } catch (error) {
      console.error('Failed to delete mission:', error);
      toast.error('Failed to delete mission. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleProgressSubmit = (data: { content: string }) => {
    addProgressUpdate(missionId, data.content);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!mission) {
    return (
      <div className="min-h-screen bg-background-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-2xl border border-white/60 bg-white/90 p-10 text-center shadow-card">
            <ArrowLeft className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Mission not found</h2>
            <p className="text-slate-600 mb-6">The mission you're looking for was removed or never existed.</p>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-card hover:shadow-card-hover transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="inline-flex items-center gap-3">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:border-slate-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Mission Detail
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit(missionId)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft transition hover:border-slate-300"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/70 px-4 py-2 text-sm font-semibold text-red-600 shadow-soft transition hover:border-red-200"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-card space-y-6">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
                  Mission #{missionId.slice(0, 4).toUpperCase()}
                </div>
                <div className="flex flex-col gap-3">
                  <StatusBadge status={mission.status} className="self-start" />
                  <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900">
                    {mission.title}
                  </h1>
                  {mission.description && (
                    <p className="text-base leading-relaxed text-slate-600 whitespace-pre-wrap">
                      {mission.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-medium text-slate-600">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Created</span>
                    <span className="flex items-center gap-2 text-slate-800">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDate(mission.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Last touched</span>
                    <span className="flex items-center gap-2 text-slate-800">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDate(mission.updatedAt)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Status</span>
                    <select
                      value={mission.status}
                      onChange={(e) => handleStatusChange(e.target.value as Mission['status'])}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/70 bg-gradient-to-br from-primary/4 via-white to-white p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">Log Progress</p>
                  <h2 className="text-xl font-semibold text-slate-900">What moved forward today?</h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-xs font-medium text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  Auto saved
                </div>
              </div>

              <ProgressForm
                missionId={missionId}
                onSubmit={handleProgressSubmit}
                placeholder="Document breakthroughs, blockers, and next steps..."
              />
            </section>

            <section className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-card">
              <ProgressTimeline progressUpdates={progressUpdates} />
            </section>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-card space-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Snapshot</p>
                <h3 className="text-lg font-semibold text-slate-900 mt-1">Mission Metrics</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Updates</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{progressUpdates.length}</p>
                  <p className="text-xs text-slate-500">entries logged</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Active</p>
                  <p className={`mt-2 text-3xl font-black ${mission.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {mission.isActive ? 'YES' : 'NO'}
                  </p>
                  <p className="text-xs text-slate-500">{mission.isActive ? 'Focus retained' : 'Paused'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-red-100 bg-red-50/70 p-6 shadow-card space-y-3">
              <h3 className="text-lg font-semibold text-red-700">Need to reset?</h3>
              <p className="text-sm text-red-600">
                Delete this mission if it’s no longer relevant. This action cannot be undone.
              </p>
              <button
                onClick={handleDelete}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Delete Mission
              </button>
            </div>
          </div>
        </div>
      </main>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Mission"
        message={`Are you sure you want to delete "${mission?.title || 'this mission'}"? This action cannot be undone.`}
        confirmText="Delete Mission"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        closeOnConfirm={false}
      />
    </div>
  );
}
