import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <motion.div
        className="loading-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="loading-tree">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="60" height="60">
            <circle cx="40" cy="40" r="38" stroke="var(--copper)" strokeWidth="1.5" opacity="0.4"/>
            <path d="M40 60C28 50 20 40 20 30C20 24 24.5 19 31 19C34.5 19 38 21 40 24C42 21 45.5 19 49 19C55.5 19 60 24 60 30C60 40 52 50 40 60Z"
              stroke="var(--brown-rich)" strokeWidth="1.5" fill="var(--copper)" fillOpacity="0.1"/>
            <line x1="40" y1="24" x2="40" y2="60" stroke="var(--brown-mid)" strokeWidth="1.2"/>
          </svg>
        </div>

        <motion.div
          className="loading-dots"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="loading-dot"
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.div>

        <p className="loading-text">Opening pages...</p>
      </motion.div>

      <style>{`
        .loading-screen {
          position: fixed;
          inset: 0;
          background: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .loading-tree {
          animation: float 3s ease-in-out infinite;
        }

        .loading-dots {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .loading-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--copper);
        }

        .loading-text {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: var(--text-base);
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
