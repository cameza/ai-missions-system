// Console script to add sample missions for testing
// Open browser console and paste this script

const addTestMissions = () => {
  const { useMissionStore } = window.__ZUSTAND__?.stores?.missionStore || {};
  
  if (!useMissionStore) {
    console.error('Mission store not found. Make sure the app is loaded.');
    return;
  }

  const store = useMissionStore.getState();
  
  const missions = [
    {
      title: "Build React Component Library",
      description: "Create a comprehensive set of reusable React components with TypeScript support",
      status: "in_progress",
      isActive: true,
    },
    {
      title: "Implement Data Persistence", 
      description: "Add localStorage integration with Zod validation for robust data storage",
      status: "completed",
      isActive: true,
    },
    {
      title: "Set Up Testing Framework",
      description: "Configure Vitest and React Testing Library for comprehensive test coverage", 
      status: "not_started",
      isActive: true,
    },
    {
      title: "Add Accessibility Features",
      description: "Ensure all components meet WCAG accessibility standards with proper ARIA labels",
      status: "blocked", 
      isActive: false,
    }
  ];

  const progressUpdates = [
    {
      missionId: "1",
      content: "Started designing component architecture with TypeScript interfaces",
    },
    {
      missionId: "1",
      content: "Implemented Button component with polymorphic support", 
    },
    {
      missionId: "2",
      content: "StorageService successfully integrated with Zustand store",
    },
    {
      missionId: "2", 
      content: "All data persistence issues resolved and validated",
    },
  ];

  // Clear existing data
  store.clearError();
  
  // Add missions
  missions.forEach((mission, index) => {
    store.createMission({
      ...mission,
      id: `test-${index + 1}`,
      createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(Date.now() - (index * 12 * 60 * 60 * 1000)),
    });
  });

  // Add progress updates
  progressUpdates.forEach((update, index) => {
    store.addProgressUpdate(`test-${update.missionId}`, update.content);
  });

  console.log('✅ Test missions added successfully!');
  console.log('📊 Mission count:', store.missions.length);
  console.log('📝 Progress updates:', Object.keys(store.progressUpdates).length);
};

// Export for easy access
window.addTestMissions = addTestMissions;

console.log('🚀 Test data script loaded!');
console.log('📝 Run: addTestMissions() to add sample missions');
