import { Plus } from 'lucide-react';
import type { Mission } from '../types';
import { useMissionStore, useMissionStats } from '../store/missionStore';
import { MissionCard } from '../components/Shared/MissionCard';

export function DashboardView() {
  const {
    missions,
    progressUpdates,
    setCurrentView,
    setSelectedMissionId,
    updateMission,
    deleteMission,
  } = useMissionStore();
  
  const stats = useMissionStats();

  const handleCreateMission = () => {
    setCurrentView('create-mission');
  };

  const handleViewMission = (id: string) => {
    setSelectedMissionId(id);
    setCurrentView('mission-detail');
  };

  const handleEditMission = (id: string) => {
    setSelectedMissionId(id);
    setCurrentView('create-mission');
  };

  const handleDeleteMission = (id: string) => {
    if (confirm('Are you sure you want to delete this mission?')) {
      deleteMission(id);
    }
  };

  const handleStatusChange = (id: string, status: Mission['status']) => {
    updateMission(id, { status });
  };

  const getProgressCount = (missionId: string) => {
    return progressUpdates[missionId]?.length || 0;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                AI Resolution Tracker
              </h1>
              <div className="mt-2 flex gap-4 text-sm text-slate-600">
                <span>Total: {stats.total}</span>
                <span>In Progress: {stats.inProgress}</span>
                <span>Completed: {stats.completed}</span>
              </div>
            </div>
            <button
              onClick={handleCreateMission}
              className="
                bg-indigo-600 text-white px-4 py-2 rounded-md
                hover:bg-indigo-700 transition-colors
                flex items-center gap-2
              "
            >
              <Plus className="w-4 h-4" />
              New Mission
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {missions.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Plus className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Ready to start your AI journey?
            </h2>
            <p className="text-slate-600 mb-6">
              Create your first mission to begin tracking your progress.
            </p>
            <button
              onClick={handleCreateMission}
              className="
                bg-indigo-600 text-white px-6 py-3 rounded-md
                hover:bg-indigo-700 transition-colors
              "
            >
              Create Mission
            </button>
          </div>
        ) : (
          // Mission Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                progressCount={getProgressCount(mission.id)}
                onEdit={handleEditMission}
                onDelete={handleDeleteMission}
                onViewDetails={handleViewMission}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
