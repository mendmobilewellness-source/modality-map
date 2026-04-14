import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Admin.css';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

// Transform Supabase row → shape the UI expects
function transformBusiness(row) {
  return {
    ...row,
    modalities: (row.business_modalities || [])
      .map(bm => bm.modalities)
      .filter(Boolean),
  };
}

// ── Tag helpers ─────────────────────────────────────────────────────────────
function TagList({ modalities }) {
  if (!modalities?.length) return <span className="admin-no-tags">None listed</span>;
  return (
    <div className="admin-tag-row">
      {modalities.map((m) => (
        <span key={m.name + m.category} className={`card-tag tag-${m.category}`}>{m.name}</span>
      ))}
    </div>
  );
}

// ── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setPw('');
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2>Admin Access</h2>
        <p>Enter the admin password to continue.</p>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <input
            type="password"
            className={`field-input${error ? ' error' : ''}`}
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
          />
          {error && <span className="field-error">Incorrect password.</span>}
          <button type="submit" className="btn-primary">Sign In</button>
        </form>
      </div>
    </div>
  );
}

// ── Pending Queue ───────────────────────────────────────────────────────────
function PendingTab({ businesses, onApprove, onReject, actionLoading }) {
  const pending = businesses.filter(b => b.status === 'pending');

  if (pending.length === 0) {
    return <div className="admin-empty"><p>No pending submissions.</p></div>;
  }

  return (
    <div className="admin-list">
      {pending.map((b) => (
        <div key={b.id} className="admin-card">
          <div className="admin-card-header">
            <div className="admin-avatar">{b.name.charAt(0)}</div>
            <div>
              <h3 className="admin-card-name">{b.name}</h3>
              <p className="admin-card-location">{b.address}, {b.city}, {b.state} {b.zip}</p>
              <p className="admin-card-date">Submitted {new Date(b.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {b.description && <p className="admin-card-desc">{b.description}</p>}

          <div className="admin-card-contact">
            {b.phone   && <span>{b.phone}</span>}
            {b.website && <a href={b.website} target="_blank" rel="noopener noreferrer">{b.website}</a>}
          </div>

          <div className="admin-card-offerings">
            <span className="admin-offering-label">Modalities</span>
            <TagList modalities={b.modalities.filter(m => m.category === 'modality')} />
            <span className="admin-offering-label">Devices</span>
            <TagList modalities={b.modalities.filter(m => m.category === 'device')} />
            <span className="admin-offering-label">Peptides & Nutrients</span>
            <TagList modalities={b.modalities.filter(m => m.category === 'compound')} />
          </div>

          <div className="admin-card-actions">
            <button
              className="btn-reject"
              onClick={() => onReject(b.id)}
              disabled={actionLoading === b.id}
            >
              Reject
            </button>
            <button
              className="btn-approve"
              onClick={() => onApprove(b.id)}
              disabled={actionLoading === b.id}
            >
              {actionLoading === b.id ? 'Saving…' : 'Approve & Publish'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Live Listings Manager ───────────────────────────────────────────────────
function ListingsTab({ businesses, onRemove, actionLoading }) {
  const live = businesses.filter(b => b.status === 'approved');

  if (live.length === 0) {
    return <div className="admin-empty"><p>No live listings.</p></div>;
  }

  return (
    <div className="admin-list">
      {live.map((b) => (
        <div key={b.id} className="admin-card admin-card-live">
          <div className="admin-card-header">
            <div className="admin-avatar admin-avatar-live">{b.name.charAt(0)}</div>
            <div>
              <h3 className="admin-card-name">{b.name}</h3>
              <p className="admin-card-location">{b.city}, {b.state}</p>
            </div>
            <span className="status-badge status-live">Live</span>
          </div>

          <div className="admin-card-offerings">
            <TagList modalities={b.modalities} />
          </div>

          <div className="admin-card-actions">
            <button
              className="btn-reject"
              onClick={() => onRemove(b.id)}
              disabled={actionLoading === b.id}
            >
              {actionLoading === b.id ? 'Removing…' : 'Remove Listing'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Rejected Archive ─────────────────────────────────────────────────────────
function RejectedTab({ businesses }) {
  const rejected = businesses.filter(b => b.status === 'rejected');

  if (rejected.length === 0) {
    return <div className="admin-empty"><p>No rejected submissions.</p></div>;
  }

  return (
    <div className="admin-list">
      {rejected.map((b) => (
        <div key={b.id} className="admin-card admin-card-rejected">
          <div className="admin-card-header">
            <div className="admin-avatar admin-avatar-rejected">{b.name.charAt(0)}</div>
            <div>
              <h3 className="admin-card-name">{b.name}</h3>
              <p className="admin-card-location">{b.city}, {b.state}</p>
              <p className="admin-card-date">Rejected {new Date(b.created_at).toLocaleDateString()}</p>
            </div>
            <span className="status-badge status-rejected">Rejected</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Admin Panel ─────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed]         = useState(false);
  const [activeTab, setActiveTab]   = useState('pending');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id of business being acted on

  useEffect(() => {
    if (!authed) return;

    async function fetchAll() {
      setLoading(true);
      setLoadError('');
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*, business_modalities(modalities(id, name, category))')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBusinesses((data || []).map(transformBusiness));
      } catch (err) {
        console.error('Admin fetch error:', err);
        setLoadError('Unable to load data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [authed]);

  async function handleApprove(id) {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ status: 'approved' })
        .eq('id', id);
      if (error) throw error;
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b));
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (error) throw error;
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemove(id) {
    setActionLoading(id);
    try {
      // Delete modality links first, then the business
      await supabase.from('business_modalities').delete().eq('business_id', id);
      const { error } = await supabase.from('businesses').delete().eq('id', id);
      if (error) throw error;
      setBusinesses(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Remove error:', err);
    } finally {
      setActionLoading(null);
    }
  }

  if (!authed) return <main className="admin-page"><LoginScreen onLogin={() => setAuthed(true)} /></main>;

  const pendingCount = businesses.filter(b => b.status === 'pending').length;
  const liveCount    = businesses.filter(b => b.status === 'approved').length;

  const TABS = [
    { key: 'pending',  label: 'Pending',      count: pendingCount },
    { key: 'live',     label: 'Live Listings', count: liveCount    },
    { key: 'rejected', label: 'Rejected',      count: null         },
  ];

  return (
    <main className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <button className="btn-logout" onClick={() => setAuthed(false)}>Sign Out</button>
        </div>

        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`admin-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {t.count !== null && (
                <span className={`tab-count${t.key === 'pending' && t.count > 0 ? ' tab-count-alert' : ''}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="admin-loading">Loading…</div>
        )}

        {loadError && (
          <div className="admin-load-error">{loadError}</div>
        )}

        {!loading && !loadError && (
          <>
            {activeTab === 'pending'  && <PendingTab  businesses={businesses} onApprove={handleApprove} onReject={handleReject} actionLoading={actionLoading} />}
            {activeTab === 'live'     && <ListingsTab businesses={businesses} onRemove={handleRemove} actionLoading={actionLoading} />}
            {activeTab === 'rejected' && <RejectedTab businesses={businesses} />}
          </>
        )}
      </div>
    </main>
  );
}
