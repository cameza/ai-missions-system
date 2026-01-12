# AI Resolution Tracker

A modern React application for tracking AI challenge missions with robust data persistence, TypeScript safety, and comprehensive component library.

## 🚀 Features

- **📊 Mission Management**: Create, update, and track AI challenge missions
- **📝 Progress Tracking**: Add progress updates with reverse-chronological ordering
- **💾 Robust Storage**: LocalStorage with Zod validation and error handling
- **🎨 Modern UI**: Accessible components with Tailwind CSS and shadcn/ui
- **⚡ Performance**: Optimized with Zustand state management and React 18
- **🧪 Testing**: Comprehensive test coverage with Vitest and React Testing Library

## 🏗️ Architecture

### Data Layer
- **StorageService**: Handles localStorage operations with validation
- **Zod Schemas**: Runtime validation for all data models
- **Type Safety**: Full TypeScript compliance with strict mode

### State Management
- **Zustand Store**: Centralized state with devtools support
- **Persistence Integration**: Automatic save/load with StorageService
- **Selectors**: Derived state for statistics and filtering

### Component Layer
- **UI Components**: Reusable, accessible components
- **Business Components**: Mission-specific components
- **Views**: Dashboard and management interfaces

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand with persistence
- **Validation**: Zod schemas
- **Testing**: Vitest + React Testing Library
- **Build**: Vite + TypeScript compiler

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Modal.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── StatusBadge.tsx
│   └── Shared/           # Business components
│       └── MissionCard.tsx
├── store/
│   └── missionStore.ts   # Zustand store
├── services/
│   └── storage.ts        # Storage service
├── types/
│   ├── mission.ts        # Mission types & schemas
│   ├── progress.ts       # Progress types & schemas
│   └── index.ts          # Type exports
├── views/
│   └── DashboardView.tsx # Main dashboard
└── lib/
    └── utils.ts          # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Testing
```bash
npm run test          # Run tests
npm run test:ui       # Run tests with UI
npm run test:run      # Run tests once
```

## 📖 Usage

### Mission Management

```typescript
import { useMissionStore } from './store/missionStore';

const { createMission, missions } = useMissionStore();

// Create a new mission
createMission({
  title: 'Build React App',
  description: 'Create a modern React application',
  status: MissionStatus.NotStarted,
  isActive: true,
});
```

### UI Components

```typescript
import { Button, StatusBadge, Input } from './components/ui';

// Button with variants
<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

// Status badge
<StatusBadge status={MissionStatus.InProgress} />

// Input with validation
<Input
  label="Mission Title"
  value={title}
  onChange={setTitle}
  error={error}
  required
/>
```

### Storage Service

```typescript
import { StorageService } from './services/storage';

const storage = new StorageService();

// Save missions
storage.saveMissions(missions);

// Load missions
const missions = storage.loadMissions();

// Validate and repair data
const result = storage.validateAndRepairData();
```

## 🧪 Testing

The application includes comprehensive test coverage:

- **Component Tests**: All UI components tested
- **Store Tests**: State management tested
- **Integration Tests**: Data flow tested
- **Accessibility Tests**: ARIA compliance verified

### Running Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:run

# Watch mode
npm run test
```

## 🔧 Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/*` → `./src/*`)
- Test files excluded from build

### Tailwind CSS
- Custom color palette
- Component variants
- Responsive utilities

### Vitest
- jsdom environment
- Test setup with mocks
- Coverage reporting

## 📦 Data Models

### Mission
```typescript
interface Mission {
  id: string;
  title: string;
  description?: string;
  status: MissionStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Progress Update
```typescript
interface ProgressUpdate {
  id: string;
  missionId: string;
  content: string;
  timestamp: Date;
}
```

## 🎯 Best Practices

### State Management
- Use selectors for derived state
- Keep actions focused and single-purpose
- Handle errors gracefully

### Component Design
- Follow accessibility guidelines
- Use stable IDs for form elements
- Implement proper error boundaries

### Data Persistence
- Validate all data before storage
- Handle storage quota limits
- Provide data recovery options

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure TypeScript compliance

## 📄 License

This project is licensed under the MIT License.
