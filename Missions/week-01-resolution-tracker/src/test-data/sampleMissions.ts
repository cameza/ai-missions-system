import { MissionStatus } from '../types';

export const sampleMissions = [
  {
    title: "Build React Component Library",
    description: "Create a comprehensive set of reusable React components with TypeScript support",
    status: MissionStatus.InProgress,
    isActive: true,
  },
  {
    title: "Implement Data Persistence",
    description: "Add localStorage integration with Zod validation for robust data storage",
    status: MissionStatus.Completed,
    isActive: true,
  },
  {
    title: "Set Up Testing Framework",
    description: "Configure Vitest and React Testing Library for comprehensive test coverage",
    status: MissionStatus.NotStarted,
    isActive: true,
  },
  {
    title: "Add Accessibility Features",
    description: "Ensure all components meet WCAG accessibility standards with proper ARIA labels",
    status: MissionStatus.Blocked,
    isActive: false,
  },
];

export const sampleProgressUpdates = [
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
