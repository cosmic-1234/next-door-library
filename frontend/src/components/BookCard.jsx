import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiStar, FiBookOpen, FiHeart } from 'react-icons/fi';

const conditionColors = { New: 'var(--sage)', Good: 'var(--copper)', Fair: 'var(--text-muted)' };

export default function BookCard({ book, delay = 0 }) {
  const [imageError, setImageError] = useState(false);
  const isAvailable = book.availableCopies > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/books/${book._id}`} className="book-card">
        <div className="book-card-cover-wrap">
          {book.cover && !imageError ? (
            <img 
              src={book.cover} 
              alt={book.title} 
              className="book-card-cover" 
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="book-card-cover-placeholder">
              <FiBookOpen size={32} className="placeholder-icon" />
              <span className="placeholder-title">{book.title}</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="book-card-overlay">
            <span className="book-card-overlay-text">View Book</span>
          </div>

          {/* Badges */}
          <div className="book-card-badges">
            <span className={`badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
              {isAvailable ? `${book.availableCopies} available` : 'On loan'}
            </span>
            {book.featured && (
              <span style={{ background: 'var(--gold)', color: 'white', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600' }}>
                ✦ Featured
              </span>
            )}
          </div>
        </div>

        <div className="book-card-body">
          <div className="book-card-genre">
            <span className="badge badge-genre">{book.genre}</span>
            <span className="book-card-condition" style={{ color: conditionColors[book.condition] }}>
              ● {book.condition}
            </span>
          </div>

          <h3 className="book-card-title">{book.title}</h3>
          <p className="book-card-author">by {book.author}</p>

          {book.averageRating > 0 && (
            <div className="book-card-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <FiStar
                    key={star}
                    size={12}
                    fill={star <= Math.round(book.averageRating) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="book-card-rating-text">
                {book.averageRating.toFixed(1)} ({book.totalRatings})
              </span>
            </div>
          )}

          <div className="book-card-footer">
            <div className="book-card-price">
              <span className="book-card-price-amount">₹{book.pricePerWeek}</span>
              <span className="book-card-price-period">/week</span>
            </div>
            {book.language !== 'English' && (
              <span className="book-card-lang">{book.language}</span>
            )}
          </div>
        </div>
      </Link>

      <style>{`
        .book-card {
          display: block;
          text-decoration: none;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid rgba(196, 144, 106, 0.12);
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
        }

        .book-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-xl);
          border-color: rgba(196, 144, 106, 0.3);
        }

        .book-card-cover-wrap {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: var(--cream-dark);
        }

        .book-card-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .book-card:hover .book-card-cover {
          transform: scale(1.05);
        }

        .book-card-cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(135deg, var(--cream-dark) 0%, var(--bg-secondary) 100%);
          padding: 20px;
          text-align: center;
        }

        .placeholder-icon { color: var(--copper-light); }

        .placeholder-title {
          font-family: var(--font-serif);
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-secondary);
          line-height: 1.3;
        }

        .book-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(44, 24, 16, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .book-card:hover .book-card-overlay { opacity: 1; }

        .book-card-overlay-text {
          color: var(--cream);
          font-size: var(--text-sm);
          font-weight: 500;
          letter-spacing: 0.08em;
          border: 1.5px solid rgba(247, 240, 227, 0.6);
          padding: 8px 20px;
          border-radius: var(--radius-full);
        }

        .book-card-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .book-card-body {
          padding: 16px;
        }

        .book-card-genre {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .book-card-condition {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .book-card-title {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .book-card-author {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-bottom: 10px;
          font-style: italic;
        }

        .book-card-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .book-card-rating-text {
          font-size: 11px;
          color: var(--text-muted);
        }

        .book-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid rgba(196, 144, 106, 0.1);
        }

        .book-card-price {
          display: flex;
          align-items: baseline;
          gap: 3px;
        }

        .book-card-price-amount {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--brown-rich);
        }

        .book-card-price-period {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }

        .book-card-lang {
          font-size: 10px;
          color: var(--text-muted);
          padding: 2px 8px;
          background: rgba(196, 144, 106, 0.08);
          border-radius: var(--radius-full);
        }
      `}</style>
    </motion.div>
  );
}
