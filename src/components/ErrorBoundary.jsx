import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    // Clear potentially corrupt localStorage data that may cause the crash
    try {
      localStorage.removeItem('resumeoptimizer_anonymous_draft');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  handleFullReset = () => {
    try {
      localStorage.removeItem('resumeoptimizer_anonymous_draft');
      localStorage.removeItem('resumeoptimizer_user');
      localStorage.removeItem('resumeoptimizer_token');
      localStorage.removeItem('custom_resume_templates');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          padding: '24px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '48px 40px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #ef4444, #f87171)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px',
              color: 'white',
              fontWeight: 800,
            }}>
              !
            </div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '8px',
            }}>
              Something went wrong
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              marginBottom: '24px',
              lineHeight: 1.6,
            }}>
              The application encountered an unexpected error. This is usually caused by corrupt cached data. Try reloading, or reset your local data.
            </p>
            {this.state.error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '24px',
                textAlign: 'left',
              }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#b91c1c',
                  fontFamily: "'JetBrains Mono', monospace",
                  wordBreak: 'break-word',
                }}>
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleFullReset}
                style={{
                  padding: '12px 28px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Reset &amp; Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
