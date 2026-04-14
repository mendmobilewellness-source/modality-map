import { Link } from 'react-router-dom';
import './Nav.css';

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-mark">M</div>
          <span className="nav-logo-text">
            Modality<span className="nav-logo-accent"> Map</span>
          </span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Directory</Link>
          <Link to="/for-businesses" className="nav-link">For Businesses</Link>
        </div>

        <Link to="/submit" className="nav-cta">List Your Business</Link>
      </div>
    </nav>
  );
}
