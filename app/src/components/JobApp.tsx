import { useState } from 'react';
import { Header } from './Header';
import { Registration } from './Registration';
import { JobManager } from './JobManager';

export function JobApp() {
  const [tab, setTab] = useState<'register' | 'jobs'>('register');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />
      <main style={{ maxWidth: '56rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <button onClick={() => setTab('register')} style={{ border: 'none', background: 'none', padding: '0.5rem 0.25rem', borderBottom: tab === 'register' ? '2px solid #3b82f6' : '2px solid transparent', color: tab === 'register' ? '#2563eb' : '#6b7280', cursor: 'pointer' }}>Register</button>
            <button onClick={() => setTab('jobs')} style={{ border: 'none', background: 'none', padding: '0.5rem 0.25rem', borderBottom: tab === 'jobs' ? '2px solid #3b82f6' : '2px solid transparent', color: tab === 'jobs' ? '#2563eb' : '#6b7280', cursor: 'pointer' }}>Jobs</button>
          </nav>
        </div>
        {tab === 'register' ? <Registration /> : <JobManager />}
      </main>
    </div>
  );
}

