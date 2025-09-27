import React from 'react'
import AIAssistant from './components/AIAssistant'

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          background: '#1e293b',
          color: 'white',
          minHeight: '100vh',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1>AI Assistant - Error</h1>
          <p>Something went wrong while loading the app.</p>
          <details style={{ marginTop: '20px' }}>
            <summary>Error Details</summary>
            <pre style={{
              background: '#374151',
              padding: '10px',
              borderRadius: '5px',
              overflow: 'auto',
              marginTop: '10px'
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('App component rendering...');

  // Test if we can render a simple div first
  const testMode = window.location.search.includes('test');

  if (testMode) {
    return (
      <div style={{
        padding: '20px',
        background: '#1e293b',
        color: 'white',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>AI Assistant - Test Mode</h1>
        <p>✅ React is working</p>
        <p>✅ App component loaded</p>
        <p>✅ Styles applied</p>
        <p>Remove "?test" from URL to load full app</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AIAssistant />
    </ErrorBoundary>
  );
}

export default App
