import { useState, useMemo } from 'react';
import { Plus, Filter, TrendingUp, CheckCircle, Archive, Sparkles } from 'lucide-react';
import type { Mission } from '../types';
import { useMissionStore, useMissionStats } from '../store/missionStore';
import { MissionCard } from '../components/Shared/MissionCard';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export function DashboardView() {
  const [searchQuery] = useState('');
  const [statusFilter] = useState<Mission['status'] | 'all'>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const {
    missions,
    progressUpdates,
    setCurrentView,
    setSelectedMissionId,
    updateMission,
    deleteMission,
  } = useMissionStore();
  
  const stats = useMissionStats();
  const statCards = [
    {
      label: 'Total Missions',
      value: stats.total,
      icon: Archive,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: TrendingUp,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
  ];

  const filteredMissions = useMemo(() => {
    return missions.filter((mission) => {
      const matchesSearch = searchQuery === '' || 
        mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mission.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
      const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [missions, searchQuery, statusFilter]);

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

  const handleDeleteMission = (id: string, title: string) => {
    setMissionToDelete({ id, title });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!missionToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteMission(missionToDelete.id, missionToDelete.title);
      setShowDeleteDialog(false);
      setMissionToDelete(null);
    } catch (error) {
      console.error('Failed to delete mission:', error);
      toast.error('Failed to delete mission. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setMissionToDelete(null);
  };

  const handleStatusChange = (id: string, status: Mission['status']) => {
    updateMission(id, { status });
  };

  const getProgressCount = (missionId: string) => {
    return progressUpdates[missionId]?.length || 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                AI Resolution Tracker
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateMission}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Mission
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map(({ label, value, icon: Icon, bgColor, iconColor }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                  <p className="text-4xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor}`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Active Missions</h2>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {filteredMissions.length === 0 ? (
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
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Create Mission
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                progressCount={getProgressCount(mission.id)}
                onEdit={handleEditMission}
                onDelete={(id) => handleDeleteMission(id, mission.title)}
                onViewDetails={handleViewMission}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={handleCreateMission}
        className="fixed bottom-20 right-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition sm:hidden"
        aria-label="Create new mission"
      >
        <Plus className="h-4 w-4" />
        New Mission
      </button>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Mission"
        message={`Are you sure you want to delete "${missionToDelete?.title || 'this mission'}"? This action cannot be undone.`}
        confirmText="Delete Mission"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        closeOnConfirm={false}
      />
    </div>
  );
}
