import { useEffect } from 'react';
import './BusinessModal.css';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
                     thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };

function parseTime(str) {
  if (!str || str === 'Closed') return null;
  // e.g. "7:00 AM" or "8:00 PM"
  const m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const period = m[3].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

function getOpenStatus(hours) {
  if (!hours) return null;
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const todayStr = hours[dayKey];
  if (!todayStr || todayStr === 'Closed') return { open: false, label: 'Closed today' };

  const [openStr, closeStr] = todayStr.split('–').map(s => s.trim());
  const openMin  = parseTime(openStr);
  const closeMin = parseTime(closeStr);
  if (openMin === null || closeMin === null) return null;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isOpen = nowMin >= openMin && nowMin < closeMin;
  return {
    open: isOpen,
    label: isOpen ? `Open · Closes ${closeStr}` : `Closed · Opens ${openStr}`,
  };
}

export default function BusinessModal({ business, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!business) return null;

  const { name, city, state, address, zip, phone, website, description,
          modalities, status, latitude, longitude, hours, walkIn } = business;
  const isVerified = status === 'approved';
  const byCategory = (cat) => modalities.filter((m) => m.category === cat);

  const directionsUrl = latitude && longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${address}, ${city}, ${state} ${zip}`)}`;

  const openStatus = getOpenStatus(hours);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drag handle (mobile) */}
        <div className="modal-drag-handle" />

        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Coral top stripe */}
        <div className="modal-stripe" />

        <div className="modal-content">
          <div className="modal-header">
            <div>
              <div className="modal-name-row">
                <h2 className="modal-name">{name}</h2>
                {isVerified && (
                  <span className="modal-verified">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <p className="modal-location">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {address}, {city}, {state} {zip}
              </p>

              {/* Hours status + walk-in badges */}
              <div className="modal-badges">
                {openStatus && (
                  <span className={`modal-hours-badge ${openStatus.open ? 'open' : 'closed'}`}>
                    <span className="modal-hours-dot" />
                    {openStatus.label}
                  </span>
                )}
                {walkIn === 'welcome' && (
                  <span className="modal-walkin-badge welcome">Walk-ins Welcome</span>
                )}
                {walkIn === 'appointment' && (
                  <span className="modal-walkin-badge appt">By Appointment Only</span>
                )}
              </div>
            </div>
          </div>

          <p className="modal-description">{description}</p>

          {/* Hours table */}
          {hours && (
            <div className="modal-hours">
              <h4 className="modal-section-label">Hours</h4>
              <div className="modal-hours-grid">
                {DAY_KEYS.map(key => {
                  const today = DAY_KEYS[new Date().getDay()];
                  return (
                    <div key={key} className={`modal-hours-row${key === today ? ' today' : ''}`}>
                      <span className="modal-hours-day">{DAY_LABELS[key]}</span>
                      <span className="modal-hours-time">{hours[key] || '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Offerings */}
          <div className="modal-offerings">
            {byCategory('modality').length > 0 && (
              <div className="modal-group">
                <h4 className="modal-group-label">Modalities</h4>
                <div className="modal-tags">
                  {byCategory('modality').map((m) => (
                    <span key={m.name} className="card-tag tag-modality">{m.name}</span>
                  ))}
                </div>
              </div>
            )}
            {byCategory('device').length > 0 && (
              <div className="modal-group">
                <h4 className="modal-group-label">Devices</h4>
                <div className="modal-tags">
                  {byCategory('device').map((m) => (
                    <span key={m.name} className="card-tag tag-device">{m.name}</span>
                  ))}
                </div>
              </div>
            )}
            {byCategory('compound').length > 0 && (
              <div className="modal-group">
                <h4 className="modal-group-label">Peptides & Nutrients</h4>
                <div className="modal-tags">
                  {byCategory('compound').map((m) => (
                    <span key={m.name} className="card-tag tag-compound">{m.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="modal-contact">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="modal-contact-item modal-contact-directions">
              <div className="modal-contact-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              </div>
              <span>Get Directions</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'auto'}}>
                <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
            {phone && (
              <a href={`tel:${phone}`} className="modal-contact-item">
                <div className="modal-contact-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.06 6.06l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <span>{phone}</span>
              </a>
            )}
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="modal-contact-item modal-contact-website">
                <div className="modal-contact-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <span>Visit Website</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'auto'}}>
                  <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
