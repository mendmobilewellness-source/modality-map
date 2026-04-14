import './BusinessCard.css';

export default function BusinessCard({ business, onClick, animIndex = 0, distance, highlighted }) {
  const { name, city, state, description, modalities, status } = business;
  const isVerified = status === 'approved';
  const showDist = distance != null && isFinite(distance);

  return (
    <button
      className={`business-card${highlighted ? ' highlighted' : ''}`}
      onClick={() => onClick(business)}
      style={{ animationDelay: `${animIndex * 0.045}s` }}
    >
      {/* Coral left border stripe */}
      <div className="card-stripe" />

      <div className="card-body">
        <div className="card-top">
          <div>
            <div className="card-name-row">
              <h3 className="card-name">{name}</h3>
              {isVerified && (
                <span className="card-verified" title="Verified listing">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <span className="card-location">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {city}, {state}
              {showDist && (
                <span className="card-distance">{distance.toFixed(1)} mi</span>
              )}
            </span>
          </div>
        </div>

        <p className="card-description">{description}</p>

        <div className="card-tags">
          {modalities.slice(0, 4).map((m) => (
            <span key={m.name + m.category} className={`card-tag tag-${m.category}`}>
              {m.name}
            </span>
          ))}
          {modalities.length > 4 && (
            <span className="card-tag tag-more">+{modalities.length - 4} more</span>
          )}
        </div>
      </div>
    </button>
  );
}
