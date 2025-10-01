import React from 'react';
import SeptemberDashboard from './components/SeptemberDashboard';
import CustomTitlebar from './components/CustomTitlebar';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        <CustomTitlebar />
        <div className="flex-1 overflow-auto">
          <SeptemberDashboard />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
