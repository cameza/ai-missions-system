import { DashboardView } from './views/DashboardView';
import { MissionDetailView } from './views/MissionDetailView';
import { CreateMissionModal } from './components/Mission/CreateMissionModal';
import { useMissionStore } from './store/missionStore';

function App() {
  const {
    currentView,
    selectedMissionId,
    setCurrentView,
    setSelectedMissionId,
    setEditingMissionId,
  } = useMissionStore();

  const showMissionDetail = currentView === 'mission-detail' && selectedMissionId;
  const showMissionModal = currentView === 'create-mission';

  const handleBackToDashboard = () => {
    setSelectedMissionId(null);
    setEditingMissionId(null);
    setCurrentView('dashboard');
  };

  const handleEditMission = (missionId: string) => {
    setEditingMissionId(missionId);
    setSelectedMissionId(missionId);
    setCurrentView('create-mission');
  };

  const handleCloseModal = () => {
    setEditingMissionId(null);
    if (currentView === 'create-mission') {
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-slate-900">
      {showMissionDetail && selectedMissionId ? (
        <MissionDetailView
          missionId={selectedMissionId}
          onBack={handleBackToDashboard}
          onEdit={handleEditMission}
        />
      ) : (
        <DashboardView />
      )}

      {showMissionModal && (
        <CreateMissionModal onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default App;
