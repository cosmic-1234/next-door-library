import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiClock, FiCheckCircle, FiAlertCircle, FiHeart, FiUser } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'var(--gold)', bg: 'rgba(201,168,76,0.1)', icon: '⏳' },
  approved: { label: 'Approved', color: 'var(--sage)', bg: 'rgba(122,143,110,0.1)', icon: '✅' },
  active: { label: 'Reading', color: 'var(--copper)', bg: 'rgba(196,144,106,0.1)', icon: '📖' },
  returned: { label: 'Returned', color: 'var(--text-muted)', bg: 'rgba(155,123,106,0.08)', icon: '📚' },
  overdue: { label: 'Overdue', color: 'var(--dusty-rose)', bg: 'rgba(201,137,122,0.1)', icon: '⚠️' },
  cancelled: { label: 'Cancelled', color: 'var(--text-muted)', bg: 'rgba(155,123,106,0.08)', icon: '❌' },
};

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const load = async () => {
      try {
        const [rentalsRes, meRes] = await Promise.all([
          api.get('/rentals/my'),
          api.get('/auth/me')
        ]);
        setRentals(rentalsRes.data.rentals || []);
        setWishlist(meRes.data.user?.wishlist || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleReturn = async (rentalId) => {
    try {
      await api.patch(`/rentals/${rentalId}/return-request`);
      setRentals(prev => prev.map(r => r._id === rentalId ? { ...r, status: 'returned' } : r));
      toast.success('Book marked as returned!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    }
  };

  const handleUpdateChallenge = async (goal) => {
    try {
      const res = await api.patch('/users/me/challenge', { goal });
      updateUser(res.data.user);
      toast.success('Reading challenge goal updated!');
    } catch (err) {
      toast.error('Failed to update reading challenge');
    }
  };

  const filteredRentals = {
    active: rentals.filter(r => ['pending', 'approved', 'active'].includes(r.status)),
    history: rentals.filter(r => ['returned', 'cancelled'].includes(r.status)),
    all: rentals
  }[activeTab] || rentals;

  const activeCount = rentals.filter(r => r.status === 'active').length;
  const pendingCount = rentals.filter(r => r.status === 'pending').length;
  const booksRead = rentals.filter(r => r.status === 'returned').length;

  if (loading) return <div className="loading-page" style={{ paddingTop: '80px' }}><div className="spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div style={{ paddingTop: '100px', paddingBottom: '80px' }}>
          {/* Header */}
          <motion.div
            className="dashboard-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="dashboard-greeting">
              <div className="dashboard-avatar">
                {user?.avatar ? <img src={user.avatar} alt="" /> : user?.name?.[0]}
              </div>
              <div>
                <p className="dashboard-eyebrow">Your Reading Space</p>
                <h1 className="dashboard-title">Hello, {user?.name?.split(' ')[0]} 👋</h1>
                {user?.bio && <p className="dashboard-bio">"{user.bio}"</p>}
              </div>
            </div>
          </motion.div>

          {/* Reading Challenge Banner */}
          <motion.div 
            className="challenge-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="challenge-icon-area">🏆</div>
            <div className="challenge-details">
              {(!user?.readingChallengeGoal || user.readingChallengeGoal === 0) ? (
                <div>
                  <h3 className="challenge-title-text">Start your 2026 Reading Challenge!</h3>
                  <p className="challenge-desc-text" style={{ marginBottom: '12px' }}>Set a goal to slow down, build empathy, and enjoy more books this year.</p>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const goalVal = e.target.elements.goalInput.value;
                    if (goalVal) handleUpdateChallenge(Number(goalVal));
                  }} className="challenge-form">
                    <input 
                      name="goalInput" 
                      type="number" 
                      min="1" 
                      placeholder="e.g. 12" 
                      className="form-input challenge-input" 
                      required 
                    />
                    <button type="submit" className="btn btn-primary btn-sm">Set Goal</button>
                  </form>
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 className="challenge-title-text">2026 Reading Challenge</h3>
                      <p className="challenge-desc-text">
                        You've completed <strong>{booksRead}</strong> of <strong>{user.readingChallengeGoal}</strong> book{user.readingChallengeGoal > 1 ? 's' : ''}!
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        const newGoal = prompt('Change your 2026 reading goal:', user.readingChallengeGoal);
                        if (newGoal && !isNaN(newGoal) && Number(newGoal) > 0) {
                          handleUpdateChallenge(Number(newGoal));
                        }
                      }} 
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      ✏️ Edit Goal
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="challenge-progress-bar-wrap">
                    <div 
                      className="challenge-progress-bar" 
                      style={{ 
                        width: `${Math.min(100, (booksRead / user.readingChallengeGoal) * 100)}%`,
                        background: booksRead >= user.readingChallengeGoal ? 'var(--sage)' : 'var(--copper)'
                      }} 
                    />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>{Math.round((booksRead / user.readingChallengeGoal) * 100)}% Complete</span>
                    {booksRead >= user.readingChallengeGoal ? (
                      <span style={{ color: 'var(--sage)', fontWeight: 600 }}>🎉 Goal achieved! Awesome job!</span>
                    ) : (
                      <span>{Math.max(0, user.readingChallengeGoal - booksRead)} more book{user.readingChallengeGoal - booksRead > 1 ? 's' : ''} to go</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="dashboard-stats">
            {[
              { icon: '📖', value: activeCount, label: 'Currently Reading' },
              { icon: '⏳', value: pendingCount, label: 'Pending Requests' },
              { icon: '✅', value: booksRead, label: 'Books Completed' },
              { icon: '❤️', value: wishlist.length, label: 'Wishlist' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="dashboard-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="dashboard-stat-icon">{stat.icon}</span>
                <span className="dashboard-stat-value">{stat.value}</span>
                <span className="dashboard-stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="dashboard-tabs">
            {[
              { key: 'active', label: 'Active Rentals' },
              { key: 'history', label: 'Reading History' },
              { key: 'all', label: 'All Requests' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`dashboard-tab ${activeTab === tab.key ? 'dashboard-tab-active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Rentals */}
          {filteredRentals.length === 0 ? (
            <motion.div className="dashboard-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3>No rentals here yet</h3>
              <p>Start by browsing our collection and requesting a book!</p>
              <Link to="/books" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Books</Link>
            </motion.div>
          ) : (
            <div className="dashboard-rentals">
              {filteredRentals.map((rental, i) => {
                const config = STATUS_CONFIG[rental.status] || STATUS_CONFIG.pending;
                const dueDate = rental.dueDate ? new Date(rental.dueDate) : null;
                const daysLeft = dueDate ? Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24)) : null;

                return (
                  <motion.div
                    key={rental._id}
                    className="rental-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div className="rental-cover">
                      {rental.book?.cover ? (
                        <img src={rental.book.cover} alt={rental.book.title} />
                      ) : (
                        <div className="rental-cover-placeholder">
                          <FiBook size={24} />
                        </div>
                      )}
                    </div>

                    <div className="rental-info">
                      <div className="rental-title-row">
                        <div>
                          <Link to={`/books/${rental.book?._id}`} className="rental-book-title">{rental.book?.title}</Link>
                          <p className="rental-book-author">by {rental.book?.author}</p>
                        </div>
                        <span className="rental-status-badge" style={{ color: config.color, background: config.bg }}>
                          {config.icon} {config.label}
                        </span>
                      </div>

                      <div className="rental-meta">
                        <div className="rental-meta-item">
                          <span>Duration</span>
                          <span>{rental.weeksDuration} week{rental.weeksDuration > 1 ? 's' : ''}</span>
                        </div>
                        <div className="rental-meta-item">
                          <span>Total</span>
                          <span className="rental-cost">₹{rental.totalCost}</span>
                        </div>
                        <div className="rental-meta-item">
                          <span>Delivery</span>
                          <span>{rental.deliveryType === 'delivery' ? `🏠 Home — ${rental.deliveryAddress?.area || ''}` : '🏪 Pickup'}</span>
                        </div>
                        {dueDate && rental.status === 'active' && (
                          <div className="rental-meta-item">
                            <span>Due Date</span>
                            <span style={{ color: daysLeft < 3 ? 'var(--dusty-rose)' : 'inherit' }}>
                              {dueDate.toLocaleDateString('en-IN')} {daysLeft !== null && `(${daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'})`}
                            </span>
                          </div>
                        )}
                        <div className="rental-meta-item">
                          <span>Requested</span>
                          <span>{new Date(rental.requestedAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>

                      {rental.adminNote && (
                        <div className="rental-admin-note">
                          <strong>Note from library:</strong> {rental.adminNote}
                        </div>
                      )}

                      {rental.status === 'active' && (
                        <button
                          className="btn btn-ghost btn-sm rental-return-btn"
                          onClick={() => handleReturn(rental._id)}
                        >
                          <FiCheckCircle size={14} /> Mark as Returned
                        </button>
                      )}

                      {rental.status === 'pending' && (
                        <p className="rental-pending-note">⏳ We'll contact you within 24 hours to confirm this request.</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Wishlist */}
          {wishlist.length > 0 && (
            <div style={{ marginTop: '60px' }}>
              <h2 className="dashboard-section-title">
                <FiHeart size={20} /> Wishlist
              </h2>
              <div className="wishlist-grid">
                {wishlist.map((book, i) => (
                  <Link key={book._id || i} to={`/books/${book._id}`} className="wishlist-item">
                    <div className="wishlist-cover">
                      {book.cover ? <img src={book.cover} alt={book.title} /> : <FiBook size={20} />}
                    </div>
                    <div className="wishlist-info">
                      <p className="wishlist-title">{book.title}</p>
                      <p className="wishlist-author">by {book.author}</p>
                      <p className="wishlist-price">₹{book.pricePerWeek}/week</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-page { min-height: 100vh; background: var(--cream); }

        .dashboard-header { margin-bottom: 40px; }

        .dashboard-greeting {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .dashboard-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--brown-rich);
          color: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-2xl);
          font-weight: 600;
          overflow: hidden;
          flex-shrink: 0;
          border: 3px solid rgba(196,144,106,0.3);
        }

        .dashboard-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .dashboard-eyebrow {
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--copper);
          font-weight: 500;
          margin-bottom: 4px;
        }

        .dashboard-title {
          font-family: var(--font-serif);
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .dashboard-bio {
          font-style: italic;
          color: var(--text-muted);
          font-size: var(--text-sm);
          margin-top: 4px;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .dashboard-stat-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.12);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .dashboard-stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }

        .dashboard-stat-icon { font-size: 24px; }
        .dashboard-stat-value { font-family: var(--font-serif); font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); }
        .dashboard-stat-label { font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

        .dashboard-tabs {
          display: flex;
          gap: 0;
          border-bottom: 2px solid rgba(196,144,106,0.15);
          margin-bottom: 32px;
        }

        .dashboard-tab {
          padding: 10px 20px;
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all var(--transition-fast);
        }

        .dashboard-tab:hover { color: var(--text-primary); }
        .dashboard-tab-active { color: var(--brown-rich); border-bottom-color: var(--brown-rich); }

        .dashboard-empty {
          text-align: center;
          padding: 80px 20px;
          color: var(--text-muted);
        }

        .dashboard-empty h3 { font-family: var(--font-serif); font-size: var(--text-2xl); color: var(--text-primary); margin-bottom: 8px; }
        .dashboard-empty p { font-size: var(--text-sm); }

        .dashboard-rentals {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rental-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.12);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .rental-card:hover { box-shadow: var(--shadow-md); border-color: rgba(196,144,106,0.25); }

        .rental-cover {
          width: 60px;
          height: 80px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--cream-dark);
          flex-shrink: 0;
        }

        .rental-cover img { width: 100%; height: 100%; object-fit: cover; }

        .rental-cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--copper-light);
        }

        .rental-info { flex: 1; }

        .rental-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .rental-book-title {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .rental-book-title:hover { color: var(--copper); }
        .rental-book-author { font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; font-style: italic; }

        .rental-status-badge {
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
          white-space: nowrap;
        }

        .rental-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 12px;
        }

        .rental-meta-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rental-meta-item > span:first-child {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }

        .rental-meta-item > span:last-child {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-primary);
        }

        .rental-cost { color: var(--brown-rich) !important; }

        .rental-admin-note {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          background: rgba(196,144,106,0.08);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          margin-bottom: 10px;
        }

        .rental-return-btn { margin-top: 8px; }
        .rental-pending-note { font-size: var(--text-xs); color: var(--text-muted); margin-top: 8px; font-style: italic; }

        /* Dashboard section title */
        .dashboard-section-title {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        /* Wishlist */
        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .wishlist-item {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px;
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.12);
          border-radius: var(--radius-lg);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .wishlist-item:hover { border-color: rgba(196,144,106,0.3); box-shadow: var(--shadow-sm); }

        .wishlist-cover {
          width: 44px;
          height: 60px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--cream-dark);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--copper-light);
        }

        .wishlist-cover img { width: 100%; height: 100%; object-fit: cover; }
        .wishlist-title { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); line-height: 1.3; margin-bottom: 2px; }
        .wishlist-author { font-size: var(--text-xs); color: var(--text-muted); font-style: italic; margin-bottom: 4px; }
        .wishlist-price { font-size: var(--text-xs); color: var(--copper); font-weight: 500; }

        /* Reading Challenge Styles */
        .challenge-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.15);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
          box-shadow: var(--shadow-sm);
        }
        .challenge-icon-area {
          font-size: 32px;
          background: rgba(201, 168, 76, 0.1);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1.5px dashed rgba(201, 168, 76, 0.4);
        }
        .challenge-details {
          flex: 1;
        }
        .challenge-title-text {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          color: var(--text-primary);
          font-weight: 600;
          margin-bottom: 2px;
        }
        .challenge-desc-text {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .challenge-form {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        .challenge-input {
          padding: 6px 12px;
          max-width: 100px;
          font-size: var(--text-sm);
        }
        .challenge-progress-bar-wrap {
          width: 100%;
          height: 8px;
          background: rgba(44, 24, 16, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-top: 10px;
        }
        .challenge-progress-bar {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @media (max-width: 768px) {
          .dashboard-stats { grid-template-columns: repeat(2, 1fr); }
          .rental-title-row { flex-direction: column; }
        }

        @media (max-width: 480px) {
          .dashboard-stats { grid-template-columns: 1fr 1fr; }
          .rental-meta { gap: 12px; }
        }
      `}</style>
    </div>
  );
}
