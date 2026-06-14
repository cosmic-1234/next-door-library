import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiStar, FiBook, FiMapPin, FiTruck, FiX, FiHeart, FiArrowLeft, FiBookOpen, FiAlertTriangle } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

const NAGPUR_AREAS = ['Dharampeth', 'Sitabuldi', 'Gandhibagh', 'Sadar', 'Civil Lines', 'Ramdaspeth', 'Bajaj Nagar', 'Manewada', 'Wardha Road', 'Amravati Road', 'Hingna', 'Katol Road', 'Other'];

function RentModal({ book, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState(2);
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const totalCost = book.pricePerWeek * weeks;
  const dueDate = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (deliveryType === 'delivery' && !area) {
      toast.error('Please enter your area for delivery');
      return;
    }

    setLoading(true);
    try {
      await api.post('/rentals', {
        bookId: book._id,
        weeksDuration: weeks,
        deliveryType,
        deliveryAddress: { area, pincode },
        userNote: note
      });
      toast.success('🎉 Rental request submitted! We\'ll contact you within 24 hours.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button className="modal-close" onClick={onClose}><FiX /></button>

        <div className="rent-modal-header">
          <h2 className="rent-modal-title">Request to Rent</h2>
          <p className="rent-modal-book">"{book.title}" by {book.author}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Duration */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Duration (weeks)</label>
            <div className="weeks-selector">
              {[1, 2, 3, 4, 6, 8].map(w => (
                <button
                  key={w}
                  type="button"
                  className={`week-btn ${weeks === w ? 'week-btn-active' : ''}`}
                  onClick={() => setWeeks(w)}
                >
                  {w}w
                </button>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="rent-summary">
            <div className="rent-summary-row">
              <span>₹{book.pricePerWeek} × {weeks} week{weeks > 1 ? 's' : ''}</span>
              <span className="rent-summary-total">₹{totalCost}</span>
            </div>
            <div className="rent-summary-row" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <span>Due date</span>
              <span>{dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Delivery */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">How would you like to receive the book?</label>
            <div className="delivery-options">
              <button
                type="button"
                className={`delivery-option ${deliveryType === 'pickup' ? 'delivery-option-active' : ''}`}
                onClick={() => setDeliveryType('pickup')}
              >
                <FiMapPin size={18} />
                <div>
                  <div className="delivery-option-title">Self Pickup</div>
                  <div className="delivery-option-desc">Coordinate via Instagram DM</div>
                </div>
              </button>
              <button
                type="button"
                className={`delivery-option ${deliveryType === 'delivery' ? 'delivery-option-active' : ''}`}
                onClick={() => setDeliveryType('delivery')}
              >
                <FiTruck size={18} />
                <div>
                  <div className="delivery-option-title">Home Delivery</div>
                  <div className="delivery-option-desc">Within Nagpur city</div>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          <AnimatePresence>
            {deliveryType === 'delivery' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', marginBottom: '16px' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Area / Locality</label>
                    <select className="form-input form-select" value={area} onChange={e => setArea(e.target.value)} required>
                      <option value="">Select area</option>
                      {NAGPUR_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input className="form-input" placeholder="e.g. 440010" value={pincode} onChange={e => setPincode(e.target.value)} maxLength={6} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Note */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Message (optional)</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Any special requests or questions..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              style={{ minHeight: '70px' }}
            />
          </div>

          <div className="rent-disclaimer">
            <FiAlertTriangle size={14} />
            <p>We'll contact you via Instagram or phone within 24 hours to confirm. Payment is collected at delivery/pickup.</p>
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Submitting...' : `Submit Request — ₹${totalCost} total`}
          </button>
        </form>

        <style>{`
          .rent-modal-header { margin-bottom: 24px; }
          .rent-modal-title {
            font-family: var(--font-serif);
            font-size: var(--text-2xl);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
          }
          .rent-modal-book {
            font-size: var(--text-sm);
            color: var(--text-muted);
            font-style: italic;
          }
          .weeks-selector {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .week-btn {
            padding: 8px 16px;
            border-radius: var(--radius-full);
            border: 1.5px solid rgba(196, 144, 106, 0.3);
            font-size: var(--text-sm);
            font-weight: 500;
            color: var(--text-secondary);
            transition: all var(--transition-fast);
          }
          .week-btn:hover { border-color: var(--copper); color: var(--copper); }
          .week-btn-active {
            background: var(--brown-rich) !important;
            border-color: var(--brown-rich) !important;
            color: var(--cream) !important;
          }
          .rent-summary {
            background: rgba(196, 144, 106, 0.08);
            border: 1px solid rgba(196, 144, 106, 0.2);
            border-radius: var(--radius-md);
            padding: 16px;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .rent-summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
          .rent-summary-total {
            font-family: var(--font-serif);
            font-size: var(--text-xl);
            font-weight: 700;
            color: var(--brown-rich);
          }
          .delivery-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .delivery-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px;
            border-radius: var(--radius-md);
            border: 1.5px solid rgba(196, 144, 106, 0.2);
            text-align: left;
            transition: all var(--transition-fast);
            color: var(--text-secondary);
          }
          .delivery-option:hover { border-color: var(--copper); }
          .delivery-option-active {
            border-color: var(--brown-rich) !important;
            background: rgba(59, 35, 20, 0.05) !important;
            color: var(--brown-rich) !important;
          }
          .delivery-option-title { font-size: var(--text-sm); font-weight: 500; margin-bottom: 2px; }
          .delivery-option-desc { font-size: var(--text-xs); color: var(--text-muted); }
          .rent-disclaimer {
            display: flex;
            gap: 8px;
            align-items: flex-start;
            padding: 12px;
            background: rgba(201, 168, 76, 0.08);
            border-radius: var(--radius-md);
            border: 1px solid rgba(201, 168, 76, 0.2);
            color: var(--text-muted);
          }
          .rent-disclaimer p { font-size: var(--text-xs); line-height: 1.5; }
          .rent-disclaimer svg { flex-shrink: 0; color: var(--gold); margin-top: 1px; }
        `}</style>
      </motion.div>
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '', hasSpoilers: false });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/books/${id}`);
        setBook(res.data.book);
        setReviews(res.data.reviews || []);
        setRelated(res.data.related || []);
      } catch {
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.post(`/books/${id}/wishlist`);
      setWishlisted(res.data.wishlisted);
      toast.success(res.data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setReviewLoading(true);
    try {
      const res = await api.post(`/books/${id}/reviews`, reviewForm);
      const newReview = res.data.review;
      setReviews(prev => {
        const updated = [newReview, ...prev];
        const total = updated.length;
        const avg = updated.reduce((sum, r) => sum + r.rating, 0) / total;
        setBook(b => ({
          ...b,
          averageRating: Math.round(avg * 10) / 10,
          totalRatings: total
        }));
        return updated;
      });
      setReviewForm({ rating: 5, title: '', body: '', hasSpoilers: false });
      toast.success('Review posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post review');
    } finally {
      setReviewLoading(false);
    }
  };


  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!book) return null;

  const isAvailable = book.availableCopies > 0;
  const conditionColor = { New: 'var(--sage)', Good: 'var(--copper)', Fair: 'var(--text-muted)' }[book.condition];

  const getRatingDistribution = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (counts[r.rating] !== undefined) {
        counts[r.rating]++;
      }
    });
    const total = reviews.length || 1;
    return Object.keys(counts).reverse().map(rating => ({
      rating: Number(rating),
      count: counts[rating],
      percentage: Math.round((counts[rating] / total) * 100)
    }));
  };

  return (
    <div className="book-detail">
      <div className="container">
        {/* Back */}
        <div style={{ paddingTop: '100px', marginBottom: '32px' }}>
          <Link to="/books" className="back-link">
            <FiArrowLeft size={16} /> Back to Catalogue
          </Link>
        </div>

        {/* Main */}
        <div className="book-detail-main">
          {/* Cover */}
          <motion.div
            className="book-detail-cover-wrap"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="book-detail-cover">
              {book.cover && !imageError ? (
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="book-detail-cover-placeholder">
                  <FiBookOpen size={48} />
                  <span>{book.title}</span>
                </div>
              )}
            </div>
            {book.featured && (
              <div className="book-detail-featured-tag">✦ Featured</div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            className="book-detail-info"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="book-detail-tags">
              <span className="badge badge-genre">{book.genre}</span>
              <span className="badge" style={{ color: conditionColor, background: `${conditionColor}18`, border: `1px solid ${conditionColor}40` }}>
                ● {book.condition}
              </span>
              {book.language !== 'English' && (
                <span className="badge" style={{ background: 'rgba(122,143,110,0.1)', color: 'var(--sage)', border: '1px solid rgba(122,143,110,0.3)' }}>
                  {book.language}
                </span>
              )}
            </div>

            <h1 className="book-detail-title">{book.title}</h1>
            <p className="book-detail-author">by {book.author}</p>

            {book.averageRating > 0 && (
              <div className="book-detail-rating">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <FiStar key={s} size={16} fill={s <= Math.round(book.averageRating) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  {book.averageRating.toFixed(1)} ({book.totalRatings} reviews)
                </span>
              </div>
            )}

            <p className="book-detail-desc">{book.description}</p>

            {/* Meta */}
            <div className="book-detail-meta">
              {book.publishedYear && <div className="book-meta-item"><span className="book-meta-label">Year</span><span>{book.publishedYear}</span></div>}
              {book.publisher && <div className="book-meta-item"><span className="book-meta-label">Publisher</span><span>{book.publisher}</span></div>}
              {book.pages && <div className="book-meta-item"><span className="book-meta-label">Pages</span><span>{book.pages}</span></div>}
              <div className="book-meta-item"><span className="book-meta-label">Available</span><span>{book.availableCopies} of {book.totalCopies}</span></div>
            </div>

            {book.tags?.length > 0 && (
              <div className="book-detail-tags-list">
                {book.tags.map(tag => (
                  <span key={tag} className="book-tag">#{tag}</span>
                ))}
              </div>
            )}

            {/* Price & CTA */}
            <div className="book-detail-cta-section">
              <div className="book-detail-price">
                <span className="book-detail-price-label">Rental Price</span>
                <div className="book-detail-price-value">
                  <span className="book-detail-price-amount">₹{book.pricePerWeek}</span>
                  <span className="book-detail-price-period">/week</span>
                </div>
                <span className="book-detail-price-note">Payment collected at pickup/delivery</span>
              </div>

              <div className="book-detail-actions">
                <button
                  className={`btn btn-primary btn-lg ${!isAvailable ? 'unavailable-btn' : ''}`}
                  onClick={() => {
                    if (!user) { navigate('/login'); return; }
                    if (isAvailable) setRentModalOpen(true);
                  }}
                  disabled={!isAvailable}
                  id="rent-now-btn"
                >
                  {isAvailable ? '📚 Request to Rent' : 'Currently on Loan'}
                </button>
                <button className={`btn btn-ghost wishlist-btn ${wishlisted ? 'wishlisted' : ''}`} onClick={handleWishlist} id="wishlist-btn">
                  <FiHeart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
                  {wishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>

              {!isAvailable && (
                <p className="unavailable-note">
                  This book is currently on loan. Add to wishlist and we'll let you know when it's available!
                </p>
              )}

              <div className="book-detail-delivery-note">
                <FiMapPin size={14} />
                <span>Pickup or home delivery available within Nagpur</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="book-reviews-section">
          <h2 className="reviews-title">Reader Reviews</h2>
          <hr className="divider" />

          {/* Rating Distribution Chart Summary */}
          {reviews.length > 0 && (
            <div className="reviews-summary-card">
              <div className="average-rating-large">
                <span className="avg-num">{book.averageRating.toFixed(1)}</span>
                <div className="stars" style={{ justifyContent: 'center', marginBottom: '4px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <FiStar key={s} size={16} fill={s <= Math.round(book.averageRating) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span className="total-revs">{reviews.length} review{reviews.length > 1 ? 's' : ''}</span>
              </div>
              <div className="rating-bars-list">
                {getRatingDistribution().map(item => (
                  <div key={item.rating} className="rating-bar-row">
                    <span className="bar-label">{item.rating} Star</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="bar-percent">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write a review */}
          {user && (
            <div className="review-form-wrap">
              <h3 className="review-form-title">Share Your Thoughts</h3>
              <form onSubmit={handleReview} className="review-form">
                <div className="review-rating-pick">
                  <label className="form-label">Your Rating</label>
                  <div className="stars stars-input">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`star-btn ${s <= reviewForm.rating ? 'star-filled' : ''}`}
                        onClick={() => setReviewForm(p => ({ ...p, rating: s }))}
                      >
                        <FiStar size={24} fill={s <= reviewForm.rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Review Title (optional)</label>
                  <input className="form-input" placeholder="Summarize your thoughts..." value={reviewForm.title} onChange={e => setReviewForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Review *</label>
                  <textarea className="form-input form-textarea" placeholder="Tell other readers about your experience with this book..." value={reviewForm.body} onChange={e => setReviewForm(p => ({ ...p, body: e.target.value }))} required rows={4} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="spoiler-check" checked={reviewForm.hasSpoilers} onChange={e => setReviewForm(p => ({ ...p, hasSpoilers: e.target.checked }))} />
                  <label htmlFor="spoiler-check" className="form-label" style={{ marginBottom: 0 }}>Contains spoilers</label>
                </div>
                <button type="submit" className="btn btn-primary" disabled={reviewLoading}>{reviewLoading ? 'Posting...' : 'Post Review'}</button>
              </form>
            </div>
          )}

          {/* Reviews list */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review this book!</p>
            ) : (
              reviews.map(review => (
                <motion.div
                  key={review._id}
                  className="review-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="review-header">
                    <div className="review-user">
                      <div className="review-avatar">
                        {review.user?.avatar ? <img src={review.user.avatar} alt="" /> : review.user?.name?.[0]}
                      </div>
                      <div>
                        <p className="review-user-name">{review.user?.name}</p>
                        <p className="review-date">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="stars">
                      {[1,2,3,4,5].map(s => <FiStar key={s} size={13} fill={s <= review.rating ? 'currentColor' : 'none'} />)}
                    </div>
                  </div>
                  {review.title && <p className="review-title">{review.title}</p>}
                  {review.hasSpoilers && !showSpoilers[review._id] ? (
                    <div className="spoiler-warning">
                      <FiAlertTriangle size={14} />
                      <span>This review contains spoilers</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowSpoilers(p => ({ ...p, [review._id]: true }))}>Show anyway</button>
                    </div>
                  ) : (
                    <p className="review-body">{review.body}</p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="related-section">
            <h2 className="reviews-title">You Might Also Like</h2>
            <hr className="divider" />
            <div className="related-grid">
              {related.map((b, i) => <BookCard key={b._id} book={b} delay={i * 0.1} />)}
            </div>
          </div>
        )}
      </div>

      {/* Rent Modal */}
      <AnimatePresence>
        {rentModalOpen && <RentModal book={book} onClose={() => setRentModalOpen(false)} />}
      </AnimatePresence>

      <style>{`
        .book-detail { min-height: 100vh; padding-bottom: 80px; }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-sm);
          color: var(--text-muted);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .back-link:hover { color: var(--text-primary); }

        .book-detail-main {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 64px;
          align-items: start;
          margin-bottom: 80px;
        }

        .book-detail-cover-wrap { position: sticky; top: 100px; }

        .book-detail-cover {
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          aspect-ratio: 3/4;
          background: var(--cream-dark);
        }

        .book-detail-cover img { width: 100%; height: 100%; object-fit: cover; }

        .book-detail-cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--copper);
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 600;
          text-align: center;
          padding: 32px;
        }

        .book-detail-featured-tag {
          text-align: center;
          margin-top: 12px;
          font-size: var(--text-xs);
          color: var(--gold);
          font-weight: 600;
          letter-spacing: 0.08em;
        }

        .book-detail-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .book-detail-title {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.1;
          margin-bottom: 8px;
        }
        .book-detail-author {
          font-size: var(--text-lg);
          color: var(--text-muted);
          font-style: italic;
          margin-bottom: 16px;
        }
        .book-detail-rating {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .book-detail-desc {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: 1.8;
          margin-bottom: 24px;
        }
        .book-detail-meta {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          padding: 16px 0;
          border-top: 1px solid rgba(196,144,106,0.12);
          border-bottom: 1px solid rgba(196,144,106,0.12);
          margin-bottom: 20px;
        }
        .book-meta-item { display: flex; flex-direction: column; gap: 3px; }
        .book-meta-label { font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .book-detail-tags-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 28px; }
        .book-tag {
          padding: 4px 10px;
          background: rgba(196,144,106,0.08);
          border: 1px solid rgba(196,144,106,0.15);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          color: var(--text-muted);
        }

        .book-detail-cta-section {
          background: rgba(196,144,106,0.06);
          border: 1px solid rgba(196,144,106,0.15);
          border-radius: var(--radius-xl);
          padding: 28px;
        }
        .book-detail-price { margin-bottom: 20px; }
        .book-detail-price-label {
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          display: block;
          margin-bottom: 4px;
        }
        .book-detail-price-value { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
        .book-detail-price-amount {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--brown-rich);
        }
        .book-detail-price-period { font-size: var(--text-sm); color: var(--text-muted); }
        .book-detail-price-note { font-size: var(--text-xs); color: var(--text-muted); }
        .book-detail-actions { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
        .wishlist-btn { color: var(--dusty-rose); }
        .wishlisted { background: rgba(201,137,122,0.1) !important; border-color: var(--dusty-rose) !important; }
        .unavailable-btn { opacity: 0.6; cursor: not-allowed; }
        .unavailable-note { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: 12px; line-height: 1.5; }
        .book-detail-delivery-note {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          color: var(--sage);
        }

        /* Reviews */
        .book-reviews-section, .related-section { margin-top: 60px; }
        .reviews-title {
          font-family: var(--font-serif);
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .review-form-wrap {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.15);
          border-radius: var(--radius-xl);
          padding: 28px;
          margin: 24px 0;
        }
        .review-form-title { font-family: var(--font-serif); font-size: var(--text-xl); font-weight: 600; margin-bottom: 20px; }
        .review-form { display: flex; flex-direction: column; gap: 16px; }
        .review-rating-pick {}
        .stars-input { display: flex; gap: 4px; margin-top: 6px; }
        .star-btn { color: var(--gold); transition: transform 0.15s; }
        .star-btn:hover { transform: scale(1.2); }
        .star-filled { color: var(--gold) !important; }

        .reviews-list { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
        .no-reviews { color: var(--text-muted); font-style: italic; }

        .review-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.1);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
        }
        .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .review-user { display: flex; align-items: center; gap: 10px; }
        .review-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--brown-rich);
          color: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-sm);
          font-weight: 600;
          overflow: hidden;
        }
        .review-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .review-user-name { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }
        .review-date { font-size: var(--text-xs); color: var(--text-muted); }
        .review-title { font-family: var(--font-serif); font-size: var(--text-base); font-weight: 600; margin-bottom: 8px; }
        .review-body { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.7; }
        .spoiler-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(201,168,76,0.08);
          border-radius: var(--radius-md);
          border: 1px solid rgba(201,168,76,0.2);
          color: var(--text-muted);
          font-size: var(--text-xs);
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-top: 24px;
        }

        /* Reviews Summary Chart Card */
        .reviews-summary-card {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 32px;
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.15);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 28px;
          align-items: center;
        }
        .average-rating-large {
          text-align: center;
          border-right: 1px solid rgba(196,144,106,0.15);
          padding-right: 16px;
        }
        .avg-num {
          font-family: var(--font-serif);
          font-size: 3.5rem;
          font-weight: 700;
          color: var(--brown-rich);
          line-height: 1;
          display: block;
          margin-bottom: 4px;
        }
        .total-revs {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .rating-bars-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rating-bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .bar-label {
          width: 50px;
          text-align: right;
          flex-shrink: 0;
        }
        .bar-track {
          flex: 1;
          height: 8px;
          background: rgba(44, 24, 16, 0.06);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          background: var(--gold);
          border-radius: var(--radius-full);
        }
        .bar-percent {
          width: 35px;
          text-align: left;
          flex-shrink: 0;
          color: var(--text-muted);
        }
        @media (max-width: 640px) {
          .reviews-summary-card {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .average-rating-large {
            border-right: none;
            border-bottom: 1px solid rgba(196,144,106,0.15);
            padding-right: 0;
            padding-bottom: 16px;
          }
        }

        @media (max-width: 1024px) {
          .book-detail-main { grid-template-columns: 280px 1fr; gap: 40px; }
          .related-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .book-detail-main { grid-template-columns: 1fr; }
          .book-detail-cover-wrap { position: static; max-width: 280px; margin: 0 auto; }
          .related-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
