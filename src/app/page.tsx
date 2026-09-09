'use client';
import React from 'react';
import dynamic from 'next/dynamic';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, color: 'red', background: '#fff', height: '100vh' }}>
          <h2>React Crashed:</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const Smartboard = dynamic(() => import('../components/board/Smartboard'), { 
  ssr: false,
  loading: () => <div className="text-white p-4">Loading board engine...</div>
});

export default function BoardApp() {
  return (
    <main className="w-screen h-screen overflow-hidden overscroll-none touch-none bg-slate-900">
      <ErrorBoundary>
        <Smartboard />
      </ErrorBoundary>
    </main>
  );
}
