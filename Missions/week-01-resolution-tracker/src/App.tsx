import { DashboardView } from './views/DashboardView';

function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-900">
            AI Resolution Tracker
          </h1>
          <p className="text-slate-600 mt-2">
            Project initialized successfully! ✅
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardView />
      </main>
    </div>
  );
}

export default App;
