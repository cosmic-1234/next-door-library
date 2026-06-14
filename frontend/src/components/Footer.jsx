import { Link } from 'react-router-dom';
import { FiInstagram, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M20 28C14 23 10 18 10 14C10 11.8 11.8 10 14 10C16.1 10 17.9 11.3 20 13.5C22.1 11.3 23.9 10 26 10C28.2 10 30 11.8 30 14C30 18 26 23 20 28Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              </svg>
              <span className="footer-logo-text">Next Door Library</span>
            </div>
            <p className="footer-tagline">
              Stories find their next reader.<br />
              Books that deserve to be loved again.
            </p>
            <a
              href="https://instagram.com/next_door_library"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-instagram"
            >
              <FiInstagram size={16} />
              @next_door_library
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
                <span>Pick up or home delivery in Nagpur</span>
              </div>
              <div className="footer-step">
                <span className="footer-step-num">04</span>
                <span>Read, enjoy, return — repeat</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <div className="footer-contact-info">
              <p>📍 Nagpur, Maharashtra</p>
              <p>📸 DM us on Instagram</p>
              <p>🕐 We respond within 24 hours</p>
            </div>
            <div className="footer-quote">
              <p className="footer-quote-text">
                "A reader lives a thousand lives before he dies."
              </p>
              <p className="footer-quote-author">— George R.R. Martin</p>
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
