import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiHeart, FiMapPin, FiClock } from 'react-icons/fi';

export default function Footer() {
  const [selectedLocation, setSelectedLocation] = useState(() => localStorage.getItem('ndl_selected_location') || 'All Locations');

  useEffect(() => {
    const handleLocUpdate = (e) => {
      if (e.detail) setSelectedLocation(e.detail);
    };
    window.addEventListener('ndl_location_change', handleLocUpdate);
    return () => window.removeEventListener('ndl_location_change', handleLocUpdate);
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="Next Door Library Logo" className="footer-logo-img" />
              <span className="footer-logo-text">Next Door Library</span>
            </div>
            <p className="footer-tagline">
              Stories that live just around the corner.
            </p>
            <a
              href="mailto:admin@nextdoorlibrary.in"
              className="footer-instagram"
            >
              <FiMail size={16} />
              admin@nextdoorlibrary.in
            </a>
          </div>

          {/* Explore */}
          <div className="footer-col">
            <h4 className="footer-col-title">Explore</h4>
            <nav className="footer-nav">
              <Link to="/books" className="footer-link">Browse Catalogue</Link>
              <Link to="/forum" className="footer-link">Community Forum</Link>
              <Link to="/feed" className="footer-link">Friends' Shelf</Link>
              <Link to="/register" className="footer-link">Join the Library</Link>
            </nav>
          </div>

          {/* How it works */}
          <div className="footer-col">
            <h4 className="footer-col-title">How It Works</h4>
            <div className="footer-steps">
              <div className="footer-step">
                <span className="footer-step-num">01</span>
                <span>Browse & pick your book</span>
              </div>
              <div className="footer-step">
                <span className="footer-step-num">02</span>
                <span>Request to rent (₹15–30/week)</span>
              </div>
              <div className="footer-step">
                <span className="footer-step-num">03</span>
                <span>{selectedLocation === 'IIM Udaipur' ? 'Pick up or campus delivery in IIM Udaipur' : 'Pick up or home delivery in Nagpur'}</span>
              </div>
              <div className="footer-step">
                <span className="footer-step-num">04</span>
                <span>Read, enjoy, return - repeat</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <div className="footer-contact-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FiMapPin size={14} style={{ color: 'var(--copper)' }} /> Nagpur, Maharashtra
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FiMail size={14} style={{ color: 'var(--copper)' }} /> admin@nextdoorlibrary.in
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FiClock size={14} style={{ color: 'var(--copper)' }} /> We respond within 24 hours
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-bottom-text">
            © {new Date().getFullYear()} Next Door Library, Nagpur. Made with <FiHeart style={{display:'inline', color:'var(--dusty-rose)'}} /> for the love of reading.
          </p>
          <p className="footer-bottom-text text-muted">
            Sustainable reading • Community first • Books deserve second lives
          </p>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--brown-deep);
          color: var(--cream);
          padding: 80px 0 40px;
          margin-top: 0;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 64px;
        }

        .footer-brand {}

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: var(--cream);
        }

        .footer-logo-img {
          width: 32px;
          height: 32px;
          object-fit: cover;
          border-radius: 50%;
        }

        .footer-logo-text {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--cream);
        }

        .footer-tagline {
          font-size: var(--text-sm);
          color: rgba(247, 240, 227, 0.6);
          line-height: 1.7;
          margin-bottom: 20px;
          font-style: italic;
          font-family: var(--font-serif);
        }

        .footer-instagram {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-sm);
          color: var(--copper-light);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-instagram:hover { color: var(--cream); }

        .footer-col-title {
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--copper-light);
          margin-bottom: 20px;
        }

        .footer-nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-link {
          font-size: var(--text-sm);
          color: rgba(247, 240, 227, 0.65);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-link:hover { color: var(--cream); }

        .footer-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-step {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: var(--text-sm);
          color: rgba(247, 240, 227, 0.65);
        }

        .footer-step-num {
          font-family: var(--font-serif);
          font-size: var(--text-xs);
          color: var(--copper-light);
          font-weight: 600;
          flex-shrink: 0;
          padding-top: 1px;
        }

        .footer-contact-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: var(--text-sm);
          color: rgba(247, 240, 227, 0.65);
          margin-bottom: 20px;
        }

        .footer-quote {
          padding: 16px;
          border-left: 2px solid var(--copper);
          background: rgba(196, 144, 106, 0.08);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }

        .footer-quote-text {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: var(--text-sm);
          color: rgba(247, 240, 227, 0.8);
          line-height: 1.6;
          margin-bottom: 6px;
        }

        .footer-quote-author {
          font-size: var(--text-xs);
          color: var(--copper-light);
          letter-spacing: 0.05em;
        }

        .footer-bottom {
          border-top: 1px solid rgba(196, 144, 106, 0.2);
          padding-top: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }

        .footer-bottom-text {
          font-size: var(--text-xs);
          color: rgba(247, 240, 227, 0.45);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </footer>
  );
}
