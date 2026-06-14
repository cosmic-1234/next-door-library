import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiCheck, FiGift, FiUser } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function RequestModal({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author) {
      toast.error('Title and Author are required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/requests', { title, author, notes });
      onSave(res.data.request);
      toast.success('Book request submitted successfully! 🎉');
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 600 }}>Suggest a Book</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Book Title *</label>
            <input className="form-input" placeholder="e.g. The Blue Umbrella" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Author Name *</label>
            <input className="form-input" placeholder="e.g. Ruskin Bond" value={author} onChange={(e) => setAuthor(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Why should we add this? (optional)</label>
            <textarea className="form-input form-textarea" placeholder="Help neighbors understand why this is a great read..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ minHeight: '80px' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? 'Submitting...' : 'Submit Suggestion'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function BookRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleFulfill = async (reqId) => {
    if (!user) {
      toast.error('Please log in to offer a book');
      return;
    }
    if (!window.confirm('Do you have this book and want to lend/donate it to the library? We will contact you to coordinate.')) {
      return;
    }
    try {
      const res = await api.post(`/requests/${reqId}/fulfill`);
      setRequests(prev => prev.map(r => r._id === reqId ? res.data.request : r));
      toast.success('Thank you! We have logged your offer and will reach out shortly. 🤝');
    } catch (err) {
      toast.error('Failed to fulfill request');
    }
  };

  const handleSave = (newRequest) => {
    setRequests(prev => [newRequest, ...prev]);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="requests-page" style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Community Suggestions</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>See what books your neighbors want to read. Have one? Lend or donate it!</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <FiPlus size={16} /> Suggest a Book
          </button>
        </div>

        {/* List */}
        {requests.length === 0 ? (
          <div style={{ textAlignment: 'center', padding: '80px 20px', color: 'var(--text-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💭</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: '8px' }}>No suggestions yet</h3>
            <p style={{ fontSize: 'var(--text-sm)' }}>Be the first to suggest a book you want to see in our catalogue!</p>
            <button className="btn btn-secondary btn-sm" onClick={() => setModalOpen(true)} style={{ marginTop: '16px' }}>Suggest Now</button>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((req, i) => (
              <motion.div
                key={req._id}
                className="request-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="request-card-header">
                  <div>
                    <h3 className="request-title">{req.title}</h3>
                    <p className="request-author">by {req.author}</p>
                  </div>
                  {req.status === 'fulfilled' ? (
                    <span className="badge badge-active" style={{ textTransform: 'capitalize', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiCheck size={12} /> Fulfilled
                    </span>
                  ) : (
                    <span className="badge badge-pending" style={{ textTransform: 'capitalize', fontSize: '11px' }}>
                      Wanted
                    </span>
                  )}
                </div>

                {req.notes && (
                  <p className="request-notes">"{req.notes}"</p>
                )}

                <div className="request-card-footer">
                  <div className="requested-by">
                    <div className="requested-by-avatar">
                      {req.suggestedBy?.avatar ? <img src={req.suggestedBy.avatar} alt="" /> : req.suggestedBy?.name?.[0]}
                    </div>
                    <span>Suggested by {req.suggestedBy?.name}</span>
                  </div>

                  {req.status === 'pending' ? (
                    <button className="btn btn-ghost btn-sm fulfill-btn" onClick={() => handleFulfill(req._id)}>
                      <FiGift size={13} /> I Have This Book
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--sage)', fontStyle: 'italic', fontWeight: 500 }}>
                      Gifted by {req.fulfilledBy?.name || 'a Neighbor'}! ❤️
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && <RequestModal onClose={() => setModalOpen(false)} onSave={handleSave} />}
      </AnimatePresence>

      <style>{`
        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .request-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.15);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 180px;
          transition: all var(--transition-base);
          box-shadow: var(--shadow-sm);
        }
        .request-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: rgba(196,144,106,0.3);
        }
        .request-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        .request-title {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .request-author {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 2px;
        }
        .request-notes {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-style: italic;
          background: rgba(196,144,106,0.06);
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
          line-height: 1.5;
        }
        .request-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(196,144,106,0.1);
          flex-wrap: wrap;
        }
        .requested-by {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .requested-by-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--brown-rich);
          color: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          overflow: hidden;
        }
        .requested-by-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .fulfill-btn {
          font-size: 11px;
          padding: 6px 12px;
          color: var(--copper);
          border-color: rgba(196,144,106,0.3);
        }
        .fulfill-btn:hover {
          background: var(--copper);
          color: white;
        }
        @media (max-width: 480px) {
          .requests-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
