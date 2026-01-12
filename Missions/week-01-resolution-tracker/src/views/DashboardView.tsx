import { useState, useMemo } from 'react';
import { Plus, Search, Filter, TrendingUp, CheckCircle, Clock, AlertCircle, Archive } from 'lucide-react';
import type { Mission } from '../types';
import { useMissionStore, useMissionStats } from '../store/missionStore';
import { MissionCard } from '../components/Shared/MissionCard';

export function DashboardView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Mission['status'] | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const {
    missions,
    progressUpdates,
    setCurrentView,
    setSelectedMissionId,
    updateMission,
    deleteMission,
  } = useMissionStore();
  
  const stats = useMissionStats();

  // Filter missions based on search and status
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

  const statusOptions = [
    { value: 'all', label: 'All Missions', icon: Archive },
    { value: 'not_started', label: 'Not Started', icon: Clock },
    { value: 'in_progress', label: 'In Progress', icon: TrendingUp },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'blocked', label: 'Blocked', icon: AlertCircle },
  ];

  const currentStatusOption = statusOptions.find(option => option.value === statusFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                AI Resolution Tracker
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Track your progress and achieve your goals
              </p>
            </div>
            <button
              onClick={handleCreateMission}
              className="
                bg-indigo-600 text-white px-4 py-2 rounded-md
                hover:bg-indigo-700 transition-colors
                flex items-center gap-2 font-medium
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Missions</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <Archive className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.inProgress}</p>
              </div>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Blocked</p>
                <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search missions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  "
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="
                flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md
                hover:bg-slate-50 transition-colors font-medium
              "
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {statusFilter !== 'all' && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-600">Active filters:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className="
                  inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                  bg-indigo-100 text-indigo-700 border border-indigo-200
                "
              >
                <span className="capitalize">{statusFilter.replace('_', ' ')}</span>
                <span className="text-xs uppercase">Clear</span>
              </button>
            </div>
          )}

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = statusFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value as Mission['status'] | 'all')}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                        transition-colors border
                        ${isActive 
                          ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }
                      `}
                    >
                      <Icon className="w-3 h-3" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-600">
            {searchQuery || statusFilter !== 'all' ? (
              <span>
                Showing {filteredMissions.length} of {stats.total} missions
                {currentStatusOption && (
                  <span className="ml-1">
                    in <strong>{currentStatusOption.label.toLowerCase()}</strong>
                  </span>
                )}
                {searchQuery && (
                  <span className="ml-1">
                    matching <strong>"{searchQuery}"</strong>
                  </span>
                )}
              </span>
            ) : (
              <span>{stats.total} missions total</span>
            )}
          </div>
          
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Mission Grid */}
        {filteredMissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              {searchQuery || statusFilter !== 'all' ? (
                <Filter className="w-16 h-16 mx-auto" />
              ) : (
                <Plus className="w-16 h-16 mx-auto" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery || statusFilter !== 'all' 
                ? 'No missions found' 
                : 'Ready to start your AI journey?'
              }
            </h2>
            <p className="text-slate-600 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Create your first mission to begin tracking your progress.'
              }
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="bg-white text-indigo-600 px-6 py-3 rounded-md border border-indigo-300 hover:bg-indigo-50 transition-colors font-medium"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleCreateMission}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
              >
                Create Mission
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission) => (
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
