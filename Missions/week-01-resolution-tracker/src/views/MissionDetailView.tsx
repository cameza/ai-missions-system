import { ArrowLeft, Edit, Trash2, Calendar, MessageCircle } from 'lucide-react';
import type { Mission } from '../types';
import { useMissionStore, useMissionProgress } from '../store/missionStore';
import { ProgressTimeline } from '../components/Progress/ProgressTimeline';
import { ProgressForm } from '../components/Progress/ProgressForm';
import { StatusBadge } from '../components/ui/StatusBadge';

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
  const mission = useMissionStore((state) => 
    state.missions.find(m => m.id === missionId)
  );
  const progressUpdates = useMissionProgress(missionId);
  const { updateMission, deleteMission, addProgressUpdate } = useMissionStore();

  const handleStatusChange = (status: Mission['status']) => {
    updateMission(missionId, { status });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this mission? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMission(missionId);
      alert('Mission deleted successfully.');
      onBack();
    } catch (error) {
      console.error('Failed to delete mission:', error);
      alert('Failed to delete mission. Please try again.');
    }
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Mission not found
            </h2>
            <p className="text-slate-600 mb-6">
              The mission you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={onBack}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="
                flex items-center gap-2 text-slate-600 hover:text-slate-900
                transition-colors font-medium
              "
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(missionId)}
                className="
                  flex items-center gap-2 px-3 py-2 text-slate-700 bg-white
                  border border-slate-300 rounded-md hover:bg-slate-50
                  transition-colors font-medium
                "
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              
              <button
                onClick={handleDelete}
                className="
                  flex items-center gap-2 px-3 py-2 text-red-600 bg-white
                  border border-red-300 rounded-md hover:bg-red-50
                  transition-colors font-medium
                "
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mission Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mission Header */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold text-slate-900 flex-1">
                  {mission.title}
                </h1>
                <StatusBadge status={mission.status} />
              </div>

              {mission.description && (
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {mission.description}
                  </p>
                </div>
              )}

              {/* Mission Metadata */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Created</div>
                      <div>{formatDate(mission.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Last Updated</div>
                      <div>{formatDate(mission.updatedAt)}</div>
                    </div>
                  </div>
                </div>

                {/* Status Change */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Change Status
                  </label>
                  <select
                    value={mission.status}
                    onChange={(e) => handleStatusChange(e.target.value as Mission['status'])}
                    className="
                      w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                    "
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <ProgressTimeline progressUpdates={progressUpdates} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Mission Stats
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MessageCircle className="w-4 h-4" />
                    Progress Updates
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {progressUpdates.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <StatusBadge status={mission.status} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Active</span>
                  <span className={`text-sm font-medium ${mission.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                    {mission.isActive ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Add Progress Form */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Add Progress Update
              </h2>
              
              <ProgressForm
                missionId={missionId}
                onSubmit={handleProgressSubmit}
                placeholder="What progress have you made? What challenges are you facing? What are your next steps?"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
              </h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => onEdit(missionId)}
                  className="
                    w-full flex items-center justify-center gap-2 px-4 py-2
                    bg-indigo-600 text-white rounded-md hover:bg-indigo-700
                    transition-colors font-medium
                  "
                >
                  <Edit className="w-4 h-4" />
                  Edit Mission
                </button>
                
                <button
                  onClick={handleDelete}
                  className="
                    w-full flex items-center justify-center gap-2 px-4 py-2
                    bg-white text-red-600 border border-red-300 rounded-md
                    hover:bg-red-50 transition-colors font-medium
                  "
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Mission
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
