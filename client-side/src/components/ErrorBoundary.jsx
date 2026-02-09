import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so next render shows fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('[ErrorBoundary] Caught error:', error);
        console.error('[ErrorBoundary] Error info:', errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoBack = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0c0d15 0%, #16182b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    fontFamily: "'Exo 2', sans-serif"
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 50, 50, 0.5)',
                        borderRadius: '20px',
                        padding: '40px',
                        textAlign: 'center',
                        boxShadow: '0 0 30px rgba(255, 50, 50, 0.2)'
                    }}>
                        {/* Error Icon */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 24px',
                            background: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(255, 68, 68, 0.4)'
                        }}>
                            <span style={{ fontSize: '40px', color: 'white' }}>!</span>
                        </div>

                        <h1 style={{
                            color: '#ffffff',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            marginBottom: '12px',
                            fontFamily: "'Orbitron', sans-serif"
                        }}>
                            Something Went Wrong
                        </h1>

                        <p style={{
                            color: '#94a3b8',
                            fontSize: '16px',
                            marginBottom: '24px',
                            lineHeight: '1.5'
                        }}>
                            The metaverse encountered an unexpected error.
                            Don't worry, your progress is safe.
                        </p>

                        {/* Error Details hidden as per request */}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={this.handleGoBack}
                                style={{
                                    padding: '12px 24px',
                                    background: 'transparent',
                                    border: '1px solid rgba(0, 142, 255, 0.5)',
                                    borderRadius: '10px',
                                    color: '#00aaff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = 'rgba(0, 142, 255, 0.1)';
                                    e.target.style.borderColor = '#00aaff';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.borderColor = 'rgba(0, 142, 255, 0.5)';
                                }}
                            >
                                Try Again
                            </button>

                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(90deg, #0055ff 0%, #00aaff 100%)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.boxShadow = '0 0 20px rgba(0, 170, 255, 0.5)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                Reload Page
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
