import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // Send to Electron main process if available
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.sendNotification({
        title: '⚠️ Application Error',
        body: 'An error occurred. Please restart the app.'
      }).catch(() => {
        // Silently fail if notification fails
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl border-2 border-red-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-600">Don't worry, your data is safe.</p>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
                <h2 className="font-semibold text-red-800 mb-2">Error Details:</h2>
                <pre className="text-xs text-red-700 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-md"
              >
                Reload App
              </button>
              {typeof window !== 'undefined' && window.electron && (
                <button
                  onClick={() => window.electron.close()}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                >
                  Close App
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
