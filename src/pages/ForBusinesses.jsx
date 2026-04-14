import { Link } from 'react-router-dom';
import './ForBusinesses.css';

const BENEFITS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Free to List',
    desc: 'Creating your listing costs nothing. Get discovered by people actively searching for what you offer.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: 'Targeted Discovery',
    desc: 'Wellness seekers search by therapy, device, or compound — and find businesses that offer exactly that.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Verified Badge',
    desc: 'Approved listings earn a Verified badge, building trust with potential clients before they even walk in.',
  },
];

const MOCK_TAGS = [
  { name: 'Red Light Therapy', cat: 'modality' },
  { name: 'PEMF Therapy',      cat: 'modality' },
  { name: 'NAD+ IV',           cat: 'compound' },
  { name: 'BPC-157',           cat: 'compound' },
  { name: 'Joovv Grand 3.0',   cat: 'device'   },
  { name: 'Cold Plunge',       cat: 'modality' },
];

export default function ForBusinesses() {
  return (
    <main className="fb">

      {/* ── Hero ── */}
      <section className="fb-hero">
        <div className="fb-hero-inner">
          <div className="fb-eyebrow">For Wellness Businesses</div>
          <h1 className="fb-title">
            Get Found by People Who<br className="fb-br" /> Are Already Searching
          </h1>
          <p className="fb-subtitle">
            Modality Map is where wellness seekers look up NAD+, red light beds, peptide therapy, PEMF, and more — and find the nearest clinic that offers it. Put your business on the map.
          </p>
          <Link to="/submit" className="fb-cta">List Your Business Free →</Link>
          <p className="fb-cta-note">No credit card · Takes under 5 minutes</p>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="fb-benefits">
        <div className="fb-section-inner">
          <p className="fb-section-eyebrow">Why List on Modality Map</p>
          <div className="fb-cards">
            {BENEFITS.map((b) => (
              <div key={b.title} className="fb-card">
                <div className="fb-card-icon">{b.icon}</div>
                <h3 className="fb-card-title">{b.title}</h3>
                <p className="fb-card-desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Listing preview ── */}
      <section className="fb-preview">
        <div className="fb-section-inner fb-preview-inner">
          <div className="fb-preview-copy">
            <p className="fb-section-eyebrow">What Your Listing Looks Like</p>
            <h2 className="fb-preview-title">A complete profile that converts browsers into visitors</h2>
            <ul className="fb-preview-list">
              <li>Business name, location, and contact info</li>
              <li>Full hours with Open Now / Closed status</li>
              <li>Walk-ins welcome or by appointment badge</li>
              <li>Tagged modalities, devices, and compounds</li>
              <li>Direct links to call, get directions, or visit website</li>
            </ul>
            <Link to="/submit" className="fb-preview-cta">Create Your Free Listing →</Link>
          </div>

          {/* Mock card */}
          <div className="fb-mock-card">
            <div className="fb-mock-stripe" />
            <div className="fb-mock-body">
              <div className="fb-mock-name-row">
                <span className="fb-mock-name">Your Business Name</span>
                <span className="fb-mock-verified">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Verified
                </span>
              </div>
              <span className="fb-mock-location">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Your City, State
              </span>
              <p className="fb-mock-desc">Your short description helps clients understand your focus and what makes your wellness center unique.</p>
              <div className="fb-mock-tags">
                {MOCK_TAGS.map((t) => (
                  <span key={t.name} className={`card-tag tag-${t.cat}`}>{t.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="fb-footer">
        <div className="fb-footer-inner">
          <h2 className="fb-footer-title">Ready to Get Discovered?</h2>
          <p className="fb-footer-sub">Join the directory built for the biohacking and advanced wellness space. Listing is always free.</p>
          <Link to="/submit" className="fb-cta">List Your Business →</Link>
        </div>
      </section>
    </main>
  );
}
