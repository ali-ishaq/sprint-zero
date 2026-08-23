import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import UploadForm from './components/UploadForm';
import AgentLog from './components/AgentLog';
import SuccessScreen from './components/SuccessScreen';
import Dashboard from './components/Dashboard';

const API_BASE = '/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading');
  const [events, setEvents] = useState([]);
  const [result, setResult] = useState(null);
  const [abortController, setAbortController] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`);
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
        setView('dashboard');
      } else {
        setView('login');
      }
    } catch {
      setView('login');
    }
  };

  const handleLogin = () => {
    setView('login');
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {}
    setUser(null);
    setView('login');
  };

  const handleNewProject = () => {
    setView('upload');
    setEvents([]);
    setResult(null);
  };

  const handleUpload = async (formData) => {
    setView('processing');
    setEvents([]);
    
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      const res = await fetch(`${API_BASE}/process/process`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              setEvents(prev => [...prev, event]);
            } catch (e) {
              console.warn('Failed to parse SSE event:', line);
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Processing error:', err);
        setEvents(prev => [...prev, { step: 'error', status: 'error', data: err.message }]);
      }
    } finally {
      setAbortController(null);
    }
  };

  const handleComplete = (finalEvent) => {
    setResult(finalEvent.data);
    setView('success');
  };

  const handleBack = () => {
    if (abortController) {
      abortController.abort();
    }
    setView('dashboard');
    setEvents([]);
    setResult(null);
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard user={user} onNewProject={handleNewProject} onLogout={handleLogout} />;
      case 'upload':
        return <UploadForm onSubmit={handleUpload} onBack={handleBack} />;
      case 'processing':
        return <AgentLog events={events} onComplete={handleComplete} />;
      case 'success':
        return <SuccessScreen result={result} onNewProject={handleNewProject} />;
      default:
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
    </div>
  );
}