import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { FiX, FiMapPin, FiBookOpen, FiTruck, FiArrowRight } from 'react-icons/fi';

export default function IIMUdaipurPopup({ isOpen, onClose, onSelectLocation }) {
  const navigate = useNavigate();

  // Gentle, warm celebratory confetti when popup opens
  useEffect(() => {
    if (!isOpen) return;

    const warmPalette = ['#C4906A', '#C9A84C', '#D4AF37', '#E8C88A', '#8B5E3C'];

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: 0.5, y: 0.35 },
      colors: warmPalette,
      zIndex: 99999,
      scalar: 0.9,
      gravity: 0.8,
      ticks: 200,
    });
  }, [isOpen]);

  const handleSelectIIMU = () => {
    if (onSelectLocation) onSelectLocation('IIM Udaipur');
    else localStorage.setItem('ndl_selected_location', 'IIM Udaipur');
    onClose();
    navigate('/books?location=IIM+Udaipur');
  };

  const handleSelectNagpur = () => {
    if (onSelectLocation) onSelectLocation('Nagpur');
    else localStorage.setItem('ndl_selected_location', 'Nagpur');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="iimu-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="iimu-popup-card"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          >
            {/* Close Button */}
            <button className="iimu-close-btn" onClick={onClose} aria-label="Close">
              <FiX size={17} />
            </button>

            {/* Top Accent Strip */}
            <div className="iimu-accent-line" />

            {/* Header */}
            <div className="iimu-header">
              <div className="iimu-badge">
                <span>✦ A New Chapter Begins ✦</span>
              </div>

              <h2 className="iimu-title">
                Now Lending in <em>IIM Udaipur</em>
              </h2>

              <p className="iimu-subtitle">
                Quiet afternoons, shared pages, and doorstep lending across the Balicha campus.
              </p>
            </div>

            {/* Features Row */}
            <div className="iimu-features-grid">
              <div className="iimu-feature-cell">
                <div className="iimu-feature-icon">
                  <FiTruck size={16} />
                </div>
                <div className="iimu-feature-info">
                  <h4>Campus Delivery</h4>
                  <p>Hostels H1–H6, MDP block & Balicha gate</p>
                </div>
              </div>

              <div className="iimu-feature-cell">
                <div className="iimu-feature-icon">
                  <FiBookOpen size={16} />
                </div>
                <div className="iimu-feature-info">
                  <h4>Thoughtful Shelf</h4>
                  <p>Fiction, strategy, memoirs & philosophy</p>
                </div>
              </div>

              <div className="iimu-feature-cell">
                <div className="iimu-feature-icon">
                  <FiMapPin size={16} />
                </div>
                <div className="iimu-feature-info">
                  <h4>Mindful Lending</h4>
                  <p>From ₹15–₹30/wk with zero heavy deposit</p>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="iimu-note">
              <span>Active in <strong>Nagpur</strong> & <strong>IIM Udaipur</strong></span>
            </div>

            {/* Actions */}
            <div className="iimu-actions">
              <button
                className="btn btn-primary iimu-btn-main"
                onClick={handleSelectIIMU}
              >
                <span>Explore IIM Udaipur Catalogue</span>
                <FiArrowRight size={15} />
              </button>

              <button
                type="button"
                className="iimu-btn-text"
                onClick={handleSelectNagpur}
              >
                Continue browsing Nagpur
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .iimu-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(36, 20, 14, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .iimu-popup-card {
          position: relative;
          background: linear-gradient(160deg, #FFFDF9 0%, #FAF3E8 100%);
          border: 1.5px solid rgba(196, 144, 106, 0.35);
          border-radius: 20px;
          padding: 28px 26px 22px 26px;
          max-width: 460px;
          width: 100%;
          box-shadow: 0 20px 50px -10px rgba(44, 24, 16, 0.35), 0 0 24px rgba(196, 144, 106, 0.15);
          overflow: hidden;
          box-sizing: border-box;
        }

        .iimu-accent-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--gold) 0%, var(--copper) 60%, var(--brown-rich) 100%);
        }

        .iimu-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(196, 144, 106, 0.1);
          border: 1px solid rgba(196, 144, 106, 0.2);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .iimu-close-btn:hover {
          background: rgba(196, 144, 106, 0.2);
          color: var(--brown-deep);
        }

        .iimu-header {
          text-align: center;
          margin-bottom: 16px;
        }

        .iimu-badge {
          display: inline-block;
          padding: 3px 12px;
          border-radius: var(--radius-full);
          background: rgba(201, 168, 76, 0.14);
          border: 1px solid rgba(201, 168, 76, 0.35);
          color: var(--brown-rich);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .iimu-title {
          font-family: var(--font-serif);
          font-size: 1.65rem;
          font-weight: 600;
          color: var(--brown-deep);
          line-height: 1.25;
          margin-bottom: 6px;
        }
        .iimu-title em {
          font-style: italic;
          color: var(--copper);
        }

        .iimu-subtitle {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.45;
          max-width: 380px;
          margin: 0 auto;
        }

        .iimu-features-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 14px;
        }

        .iimu-feature-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(196, 144, 106, 0.2);
          border-radius: 10px;
        }

        .iimu-feature-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(196, 144, 106, 0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brown-rich);
          flex-shrink: 0;
        }

        .iimu-feature-info h4 {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--brown-deep);
          margin-bottom: 1px;
        }
        .iimu-feature-info p {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.3;
          margin: 0;
        }

        .iimu-note {
          text-align: center;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .iimu-note strong {
          color: var(--brown-deep);
        }

        .iimu-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .iimu-btn-main {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
        }

        .iimu-btn-text {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 11.5px;
          padding: 4px;
          cursor: pointer;
          transition: color 0.15s ease;
          text-align: center;
        }
        .iimu-btn-text:hover {
          color: var(--brown-rich);
        }
      `}</style>
    </AnimatePresence>
  );
}
