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
          <img src="/logo.png" alt="Next Door Library Logo" className="loading-logo-img" />
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

        .loading-logo-img {
          width: 60px;
          height: 60px;
          object-fit: contain;
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
