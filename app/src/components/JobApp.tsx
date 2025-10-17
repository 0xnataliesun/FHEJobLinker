import { useState } from 'react';
import { Header } from './Header';
import { Registration } from './Registration';
import { Profile } from './Profile';
import { JobManager } from './JobManager';

export function JobApp() {
  const [tab, setTab] = useState<'register' | 'jobs' | 'profile'>('register');

  const tabs = [
    { id: 'register', label: 'Register', icon: '📝' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ] as const;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Modern Tab Navigation */}
        <div style={{ marginBottom: '2.5rem' }}>
          <nav style={{
            display: 'flex',
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '0.5rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--card-border)',
            width: 'fit-content',
            margin: '0 auto'
          }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  border: 'none',
                  background: tab === t.id ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : 'transparent',
                  color: tab === t.id ? 'white' : 'var(--text-secondary)',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: tab === t.id ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                  transform: tab === t.id ? 'translateY(-2px)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (tab !== t.id) {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab !== t.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div style={{ animation: 'fadeInUp 0.5s ease' }}>
          {tab === 'register' ? <Registration /> : tab === 'jobs' ? <JobManager /> : <Profile />}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        marginTop: '3rem',
        borderTop: '1px solid var(--card-border)'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          Built with privacy-first principles using <strong>Zama FHE</strong> technology
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          Making Web3 recruitment private, fair, and trustless
        </div>
      </footer>
    </div>
  );
}
