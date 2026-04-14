import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BusinessCard from '../components/BusinessCard';
import BusinessModal from '../components/BusinessModal';
import MapView from '../components/MapView';
import { supabase } from '../lib/supabase';
import './Home.css';

const QUICK_FILTERS = [
  { label: 'All',        icon: '✦',  query: '' },
  { label: 'Red Light',  icon: '🔴', query: 'Red Light' },
  { label: 'Cryo',       icon: '❄️', query: 'Cryo' },
  { label: 'Peptides',   icon: '💉', query: 'Peptide' },
  { label: 'Sauna',      icon: '🧖', query: 'Sauna' },
  { label: 'Float',      icon: '🌊', query: 'Float' },
  { label: 'Hyperbaric', icon: '🫁', query: 'Hyperbaric' },
  { label: 'PEMF',       icon: '⚡', query: 'PEMF' },
  { label: 'IV Therapy', icon: '💧', query: 'IV' },
];

const TICKER_TERMS = [
  'NAD+', 'BPC-157', 'Red Light Bed', 'PEMF', 'Cold Plunge',
  'Infrared Sauna', 'Cryotherapy', 'Float Tank', 'Sermorelin',
  'Hyperbaric', 'Semaglutide', 'Glutathione IV', 'NormaTec',
];

const STATS = [
  { value: '500+', label: 'Businesses' },
  { value: '80+',  label: 'Modalities' },
  { value: '50+',  label: 'Peptides & Nutrients' },
];

const HOW_IT_WORKS = [
  {
    n: '1',
    title: 'Search',
    desc: 'Type any therapy, device, or peptide — like "NAD+" or "Red Light Bed".',
  },
  {
    n: '2',
    title: 'Discover',
    desc: 'See verified businesses near you offering exactly what you need.',
  },
  {
    n: '3',
    title: 'Connect',
    desc: 'Call, get directions, or book in one tap.',
  },
];

function distanceMi(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Transform Supabase row → shape the rest of the app expects
function transformBusiness(row) {
  return {
    ...row,
    modalities: (row.business_modalities || [])
      .map(bm => bm.modalities)
      .filter(Boolean),
  };
}

export default function Home() {
  const [businesses, setBusinesses]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [loadError, setLoadError]             = useState('');
  const [query, setQuery]                     = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [viewMode, setViewMode]               = useState('list');
  const [userLocation, setUserLocation]       = useState(null);
  const [locationError, setLocationError]     = useState('');
  const [locating, setLocating]               = useState(false);
  const [hoveredCardId, setHoveredCardId]     = useState(null);
  const [hoveredPinId, setHoveredPinId]       = useState(null);
  const inputRef     = useRef(null);
  const cardRefs     = useRef({});
  const mapCenterRef = useRef(null);
  const resultsRef   = useRef(null);

  // Fetch approved businesses from Supabase on mount
  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*, business_modalities(modalities(id, name, category))')
          .eq('status', 'approved');

        if (error) throw error;
        setBusinesses((data || []).map(transformBusiness));
      } catch (err) {
        console.error('Failed to load businesses:', err);
        setLoadError('Unable to load listings. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, []);

  const activeQuickFilter = QUICK_FILTERS.find(f =>
    f.query !== '' && query.toLowerCase() === f.query.toLowerCase()
  ) || (query === '' ? QUICK_FILTERS[0] : null);

  const filtered = useMemo(() => {
    const normalize = (s) => s.toLowerCase().replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim();
    const q = normalize(query);
    let list = q
      ? businesses.filter((b) =>
          normalize(b.name || '').includes(q) ||
          normalize(b.city || '').includes(q) ||
          normalize(b.state || '').includes(q) ||
          b.modalities.some((m) => normalize(m.name).includes(q))
        )
      : [...businesses];

    if (userLocation) {
      list = list
        .map(b => ({
          ...b,
          _dist: b.latitude && b.longitude
            ? distanceMi(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
            : Infinity,
        }))
        .sort((a, b) => a._dist - b._dist);
    }
    return list;
  }, [query, userLocation, businesses]);

  function applyFilter(q) {
    setQuery(q);
    if (q) inputRef.current?.blur();
  }

  function handleNearMe() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocating(false);
        mapCenterRef.current?.(loc);
        setViewMode('list');
      },
      () => {
        setLocationError('Enable location to find businesses near you.');
        setLocating(false);
      }
    );
  }

  // Called by MapView when a pin is clicked on mobile floating card scenario
  const handlePinClick = useCallback((business) => {
    setSelectedBusiness(business);
    // Also scroll card into view if in list mode
    const el = cardRefs.current[business.id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const handleCardHover = useCallback((id) => setHoveredCardId(id), []);
  const handleCardLeave = useCallback(() => setHoveredCardId(null), []);
  const handlePinHover  = useCallback((id) => {
    setHoveredPinId(id);
    const el = cardRefs.current[id];
    if (el && viewMode === 'list') el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [viewMode]);
  const handlePinLeave  = useCallback(() => setHoveredPinId(null), []);

  return (
    <main className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">The Wellness Discovery Platform</div>

          <h1 className="hero-title">
            Find The Exact Wellness<br className="hero-br" /> Experience You're Looking For
          </h1>

          <p className="hero-subtitle">
            Search by therapy, device, or peptide. Discover clinics near you offering exactly what you need.
          </p>

          {/* Search bar + Near Me */}
          <div className="hero-search">
            <div className="hero-search-wrap">
              <svg className="hero-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                className="hero-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query) {
                    const top = resultsRef.current?.getBoundingClientRect().top + window.scrollY - 12;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }}
                placeholder="Search NAD+, Red Light Therapy, PEMF…"
              />
              {query && (
                <button className="hero-search-clear" onClick={() => setQuery('')} type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              <button className="hero-search-btn" type="button" onClick={() => {
                if (query) {
                  const top = resultsRef.current?.getBoundingClientRect().top + window.scrollY - 12;
                  window.scrollTo({ top, behavior: 'smooth' });
                } else {
                  inputRef.current?.focus();
                }
              }}>
                Search
              </button>
            </div>

            {/* Near Me */}
            <button
              className={`near-me-btn${userLocation ? ' active' : ''}${locating ? ' locating' : ''}`}
              type="button"
              onClick={handleNearMe}
              title="Sort by distance"
              aria-label="Near me"
            >
              {locating ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              )}
              <span className="near-me-label">Near Me</span>
            </button>
          </div>

          {locationError && (
            <p className="location-error">{locationError}</p>
          )}

          {/* Scrolling ticker */}
          <div className="ticker-wrap" aria-hidden="true">
            <div className="ticker-track">
              {[...TICKER_TERMS, ...TICKER_TERMS].map((term, i) => (
                <button key={i} className="ticker-pill" type="button" onClick={() => applyFilter(term)}>
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {STATS.map(({ value, label }) => (
              <div key={label} className="hero-stat">
                <span className="hero-stat-value">{value}</span>
                <span className="hero-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works">
        <div className="hiw-inner">
          <p className="hiw-eyebrow">How It Works</p>
          <div className="hiw-steps">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.n} className="hiw-step">
                <div className="hiw-num">{s.n}</div>
                <div className="hiw-step-body">
                  <h3 className="hiw-title">{s.title}</h3>
                  <p className="hiw-desc">{s.desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && <div className="hiw-connector" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="home-content" ref={resultsRef}>

        {/* Quick filters */}
        <div className="quick-filters-wrap">
          <div className="quick-filters">
            {QUICK_FILTERS.map((f) => {
              const isActive = activeQuickFilter?.label === f.label;
              return (
                <button
                  key={f.label}
                  className={`quick-filter${isActive ? ' active' : ''}`}
                  onClick={() => applyFilter(f.query)}
                  type="button"
                >
                  <span className="quick-filter-icon">{f.icon}</span>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* View toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
            onClick={() => setViewMode('list')}
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            List
          </button>
          <button
            className={`view-toggle-btn${viewMode === 'map' ? ' active' : ''}`}
            onClick={() => setViewMode('map')}
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Map
          </button>
        </div>

        {/* Map (always mounted, CSS-toggled) */}
        <div className={`map-section${viewMode === 'map' ? ' map-section--visible' : ''}`}>
          <MapView
            businesses={filtered}
            onBusinessClick={handlePinClick}
            isVisible={viewMode === 'map'}
            hoveredCardId={hoveredCardId}
            onPinHover={handlePinHover}
            onPinLeave={handlePinLeave}
            onRegisterCenter={(fn) => { mapCenterRef.current = fn; }}
          />
        </div>

        {/* Results header + grid (list mode only) */}
        {viewMode === 'list' && (
          <>
            {!loading && !loadError && (
              <div className="results-header">
                <span className="results-count">
                  <strong>{filtered.length}</strong> {filtered.length === 1 ? 'business' : 'businesses'}
                  {userLocation ? ' near you' : ' found'}
                  {query && <span className="results-query"> for "<em>{query}</em>"</span>}
                </span>
                <div className="results-actions">
                  {userLocation && (
                    <button className="results-clear" onClick={() => setUserLocation(null)} type="button">
                      Clear location
                    </button>
                  )}
                  {query && (
                    <button className="results-clear" onClick={() => setQuery('')} type="button">
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            )}

            {loadError && (
              <div className="load-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {loadError}
              </div>
            )}

            {loading ? (
              <div className="business-grid">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-stripe" />
                    <div className="skeleton-body">
                      <div className="skeleton-line skeleton-title" />
                      <div className="skeleton-line skeleton-sub" />
                      <div className="skeleton-line skeleton-desc" />
                      <div className="skeleton-tags">
                        <div className="skeleton-tag" />
                        <div className="skeleton-tag" />
                        <div className="skeleton-tag" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loadError && filtered.length > 0 ? (
              <div className="business-grid">
                {filtered.map((b, i) => (
                  <div
                    key={b.id}
                    ref={el => { cardRefs.current[b.id] = el; }}
                    onMouseEnter={() => handleCardHover(b.id)}
                    onMouseLeave={handleCardLeave}
                  >
                    <BusinessCard
                      business={b}
                      onClick={setSelectedBusiness}
                      animIndex={i}
                      distance={b._dist}
                      highlighted={hoveredPinId === b.id}
                    />
                  </div>
                ))}
              </div>
            ) : !loadError ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No businesses found</h3>
                <p>No results for "<strong>{query}</strong>". Try a different search or <Link to="/submit">list your business</Link>.</p>
              </div>
            ) : null}
          </>
        )}
      </div>

      {selectedBusiness && (
        <BusinessModal business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />
      )}

      {/* ── Footer CTA ── */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="footer-logo-mark">M</div>
            <span>Modality <span className="footer-logo-accent">Map</span></span>
          </div>
          <h2 className="footer-title">Are You a Wellness Business?</h2>
          <p className="footer-sub">
            Get discovered by people searching for exactly what you offer. Listing is free.
          </p>
          <Link to="/submit" className="footer-cta">List Your Business →</Link>
          <p className="footer-copy">© 2025 Modality Map · The Wellness Discovery Platform</p>
        </div>
      </footer>

      {/* ── Bottom tab bar (mobile) ── */}
      <nav className="bottom-tabs" aria-label="Mobile navigation">
        <Link to="/" className="bottom-tab active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </Link>
        <button className="bottom-tab" onClick={() => setViewMode(v => v === 'map' ? 'list' : 'map')} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Map</span>
        </button>
        <button className="bottom-tab" onClick={() => inputRef.current?.focus()} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
        </button>
        <Link to="/submit" className="bottom-tab">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>List</span>
        </Link>
      </nav>
    </main>
  );
}
