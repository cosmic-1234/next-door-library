import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { FiX, FiMapPin, FiBookOpen, FiTruck, FiArrowRight } from 'react-icons/fi';

const FEATURES = [
  { icon: FiTruck, title: 'Campus Delivery', desc: 'Books brought right to your hostel or department' },
  { icon: FiBookOpen, title: 'Thoughtful Shelf', desc: 'Fiction, strategy, memoirs & philosophy' },
  { icon: FiMapPin, title: 'Mindful Lending', desc: 'From ₹15–₹30/wk with zero heavy deposit' },
];

export default function IIMUdaipurPopup({ isOpen, onClose, onSelectLocation }) {
  const navigate = useNavigate();

  // Gentle, warm celebratory confetti when popup opens
  useEffect(() => {
    if (!isOpen) return;
    const warmPalette = ['#C4906A', '#C9A84C', '#D4AF37', '#E8C88A', '#8B5E3C'];
    confetti({
      particleCount: 44,
      spread: 62,
      origin: { x: 0.5, y: 0.32 },
      colors: warmPalette,
      zIndex: 99999,
      scalar: 0.9,
      gravity: 0.85,
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
        <motion.div
          className="iimu-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="iimu-popup-card"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Soft ambient glow */}
            <div className="iimu-glow" />

            {/* Close */}
            <button className="iimu-close-btn" onClick={onClose} aria-label="Close">
              <FiX size={16} />
            </button>

            {/* Top accent strip */}
            <div className="iimu-accent-line" />

            {/* Header */}
            <div className="iimu-header">
              <span className="iimu-badge">✦ A New Chapter Begins ✦</span>
              <h2 className="iimu-title">
                Now Lending in <em>IIM Udaipur</em>
              </h2>
              <p className="iimu-subtitle">
                Quiet afternoons, shared pages, and doorstep lending across the Balicha campus.
              </p>
              <div className="iimu-divider">
                <span /> <em>✦</em> <span />
              </div>
            </div>

            {/* Features */}
            <div className="iimu-features">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="iimu-feature"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.12 + i * 0.06 }}
                >
                  <div className="iimu-feature-icon">
                    <f.icon size={16} />
                  </div>
                  <div className="iimu-feature-info">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Note */}
            <div className="iimu-note">
              <span className="iimu-note-dot" />
              Now active in <strong>Nagpur</strong> &amp; <strong>IIM Udaipur</strong>
            </div>

            {/* Actions */}
            <div className="iimu-actions">
              <button className="btn btn-primary iimu-btn-main" onClick={handleSelectIIMU}>
                <span>Explore IIM Udaipur Catalogue</span>
                <FiArrowRight size={15} />
              </button>
              <button type="button" className="iimu-btn-text" onClick={handleSelectNagpur}>
                Continue browsing Nagpur
              </button>
            </div>
          </motion.div>
        </motion.div>
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
          background: rgba(36, 20, 14, 0.62);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .iimu-popup-card {
          position: relative;
          background:
            radial-gradient(120% 90% at 50% -10%, rgba(201, 168, 76, 0.10), transparent 55%),
            linear-gradient(165deg, #FFFDF9 0%, #FBF4E9 100%);
          border: 1px solid rgba(196, 144, 106, 0.32);
          border-radius: 24px;
          padding: 34px 30px 26px;
          max-width: 468px;
          width: 100%;
          box-shadow:
            0 30px 70px -18px rgba(44, 24, 16, 0.45),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          overflow: hidden;
          box-sizing: border-box;
        }

        .iimu-glow {
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 340px;
          height: 200px;
          background: radial-gradient(circle, rgba(196, 144, 106, 0.22), transparent 70%);
          pointer-events: none;
        }

        .iimu-accent-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--gold), var(--copper) 55%, var(--brown-warm));
        }

        .iimu-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(196, 144, 106, 0.12);
          border: 1px solid rgba(196, 144, 106, 0.24);
          color: var(--text-secondary);
          cursor: pointer;
          z-index: 2;
          transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
        }
        .iimu-close-btn:hover { background: rgba(196, 144, 106, 0.22); color: var(--brown-deep); transform: rotate(90deg); }
        .iimu-close-btn:active { transform: scale(0.9); }

        .iimu-header { position: relative; text-align: center; margin-bottom: 20px; }

        .iimu-badge {
          display: inline-block;
          padding: 4px 14px;
          border-radius: var(--radius-full);
          background: rgba(201, 168, 76, 0.14);
          border: 1px solid rgba(201, 168, 76, 0.4);
          color: var(--brown-warm);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .iimu-title {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 600;
          color: var(--brown-deep);
          line-height: 1.15;
          letter-spacing: -0.01em;
          margin-bottom: 10px;
        }
        .iimu-title em { font-style: italic; color: var(--copper); }

        .iimu-subtitle {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.55;
          max-width: 360px;
          margin: 0 auto;
        }

        .iimu-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 18px;
        }
        .iimu-divider span {
          height: 1px;
          width: 44px;
          background: linear-gradient(90deg, transparent, rgba(196, 144, 106, 0.5));
        }
        .iimu-divider span:last-child { background: linear-gradient(90deg, rgba(196, 144, 106, 0.5), transparent); }
        .iimu-divider em { color: var(--copper); font-size: 12px; font-style: normal; }

        .iimu-features {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-bottom: 18px;
        }

        .iimu-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(196, 144, 106, 0.18);
          border-radius: 14px;
          transition: transform var(--transition-fast), border-color var(--transition-base), box-shadow var(--transition-base);
        }
        .iimu-feature:hover {
          transform: translateX(3px);
          border-color: rgba(196, 144, 106, 0.4);
          box-shadow: 0 4px 14px rgba(44, 24, 16, 0.06);
        }

        .iimu-feature-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: linear-gradient(160deg, rgba(196, 144, 106, 0.22), rgba(201, 168, 76, 0.12));
          border: 1px solid rgba(196, 144, 106, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brown-warm);
          flex-shrink: 0;
        }

        .iimu-feature-info h4 {
          font-family: var(--font-serif);
          font-size: 15px;
          font-weight: 600;
          color: var(--brown-deep);
          margin-bottom: 2px;
        }
        .iimu-feature-info p {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.35;
          margin: 0;
        }

        .iimu-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 18px;
        }
        .iimu-note strong { color: var(--brown-deep); font-weight: 600; }
        .iimu-note-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--sage);
          box-shadow: 0 0 0 3px rgba(122, 143, 110, 0.2);
        }

        .iimu-actions { display: flex; flex-direction: column; gap: 8px; }

        .iimu-btn-main {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 18px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 13px;
        }
        .iimu-btn-main:hover svg { transform: translateX(3px); }
        .iimu-btn-main svg { transition: transform var(--transition-base); }

        .iimu-btn-text {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 12.5px;
          padding: 6px;
          cursor: pointer;
          transition: color var(--transition-fast);
          text-align: center;
        }
        .iimu-btn-text:hover { color: var(--brown-rich); }

        @media (max-width: 480px) {
          .iimu-popup-card { padding: 30px 20px 22px; }
          .iimu-title { font-size: 1.65rem; }
        }
      `}</style>
    </AnimatePresence>
  );
}
