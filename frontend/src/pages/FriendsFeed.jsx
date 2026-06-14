import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUserPlus, FiSearch, FiBook } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function FriendsFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [followedIds, setFollowedIds] = useState(new Set());

  useEffect(() => {
    api.get('/users/feed')
      .then(res => setFeed(res.data.feed || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/users/search?q=${searchQuery}`);
        setSearchResults(res.data.users || []);
      } catch {} finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleFollow = async (userId, name) => {
    try {
      const res = await api.post(`/users/follow/${userId}`);
      if (res.data.following) {
        setFollowedIds(prev => new Set([...prev, userId]));
        toast.success(`Now following ${name}!`);
      } else {
        setFollowedIds(prev => { const s = new Set(prev); s.delete(userId); return s; });
        toast.success(`Unfollowed ${name}`);
      }
    } catch { toast.error('Failed to update follow'); }
  };

  return (
    <div className="feed-page">
      <div className="container">
        <div style={{ paddingTop: '100px', paddingBottom: '80px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="feed-title">Friends' Shelf</h1>
            <p className="feed-subtitle">See what your reading community is currently exploring.</p>
          </motion.div>

          {/* Find Readers */}
          <div className="find-readers-section">
            <h2 className="find-readers-title">Find Fellow Readers</h2>
            <div style={{ position: 'relative', maxWidth: '480px' }}>
              <FiSearch size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1 }} />
              <input
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="Search readers by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                id="user-search-input"
              />
            </div>

            {searchResults.length > 0 && (
              <motion.div className="search-results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {searchResults.map(u => (
                  <div key={u._id} className="search-user-card">
                    <div className="search-user-avatar">
                      {u.avatar ? <img src={u.avatar} alt="" /> : u.name?.[0]}
                    </div>
                    <div className="search-user-info">
                      <p className="search-user-name">{u.name}</p>
                      {u.currentlyReading && (
                        <p className="search-user-reading">
                          <FiBook size={11} /> Reading: {u.currentlyReading.title}
                        </p>
                      )}
                      {u.bio && <p className="search-user-bio">{u.bio}</p>}
                    </div>
                    <button
                      className={`btn btn-sm ${followedIds.has(u._id) ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => handleFollow(u._id, u.name)}
                    >
                      <FiUserPlus size={13} />
                      {followedIds.has(u._id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Feed */}
          <div style={{ marginTop: '48px' }}>
            <h2 className="feed-section-title">Currently Reading</h2>
            <p className="feed-section-sub">People you follow and what they're reading right now.</p>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div className="spinner" />
              </div>
            ) : feed.length === 0 ? (
              <motion.div className="feed-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <h3>No friends yet</h3>
                <p>Search for readers above and follow them to see what they're reading!</p>
                <Link to="/forum" className="btn btn-primary" style={{ marginTop: '20px' }}>Explore the Community</Link>
              </motion.div>
            ) : (
              <div className="feed-grid">
                {feed.map((reader, i) => (
                  <motion.div
                    key={reader._id}
                    className="feed-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="feed-card-user">
                      <div className="feed-avatar">
                        {reader.avatar ? <img src={reader.avatar} alt="" /> : reader.name?.[0]}
                      </div>
                      <div>
                        <p className="feed-user-name">{reader.name}</p>
                        {reader.bio && <p className="feed-user-bio">"{reader.bio}"</p>}
                      </div>
                    </div>

                    {reader.currentlyReading && (
                      <Link to={`/books/${reader.currentlyReading._id}`} className="feed-book-card">
                        <div className="feed-book-cover">
                          {reader.currentlyReading.cover ? (
                            <img src={reader.currentlyReading.cover} alt="" />
                          ) : (
                            <FiBook size={20} style={{ color: 'var(--copper-light)' }} />
                          )}
                        </div>
                        <div className="feed-book-info">
                          <span className="feed-reading-label">📖 Currently Reading</span>
                          <p className="feed-book-title">{reader.currentlyReading.title}</p>
                          <p className="feed-book-author">by {reader.currentlyReading.author}</p>
                          {reader.currentlyReading.genre && (
                            <span className="badge badge-genre" style={{ marginTop: '6px' }}>{reader.currentlyReading.genre}</span>
                          )}
                        </div>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .feed-page { min-height: 100vh; background: var(--cream); }

        .feed-title {
          font-family: var(--font-serif);
          font-size: var(--text-5xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .feed-subtitle {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          font-style: italic;
          font-family: var(--font-serif);
          margin-bottom: 40px;
        }

        .find-readers-section {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.15);
          border-radius: var(--radius-xl);
          padding: 28px;
        }

        .find-readers-title {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .search-results {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 16px;
          max-width: 480px;
        }

        .search-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--cream);
          border-radius: var(--radius-md);
          border: 1px solid rgba(196,144,106,0.1);
        }

        .search-user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--brown-rich);
          color: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: var(--text-sm);
          flex-shrink: 0;
          overflow: hidden;
        }

        .search-user-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .search-user-info { flex: 1; }
        .search-user-name { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }
        .search-user-reading { font-size: var(--text-xs); color: var(--copper); display: flex; align-items: center; gap: 4px; margin-top: 2px; }
        .search-user-bio { font-size: var(--text-xs); color: var(--text-muted); font-style: italic; margin-top: 2px; }

        .feed-section-title {
          font-family: var(--font-serif);
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .feed-section-sub { font-size: var(--text-base); color: var(--text-muted); margin-bottom: 28px; }

        .feed-empty {
          text-align: center;
          padding: 80px 20px;
          color: var(--text-muted);
        }

        .feed-empty h3 { font-family: var(--font-serif); font-size: var(--text-2xl); color: var(--text-primary); margin-bottom: 8px; }

        .feed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .feed-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.12);
          border-radius: var(--radius-xl);
          padding: 20px;
          transition: all 0.3s ease;
        }

        .feed-card:hover { box-shadow: var(--shadow-md); border-color: rgba(196,144,106,0.25); }

        .feed-card-user {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(196,144,106,0.1);
        }

        .feed-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--brown-rich);
          color: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: var(--text-lg);
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid rgba(196,144,106,0.2);
        }

        .feed-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .feed-user-name { font-size: var(--text-base); font-weight: 600; color: var(--text-primary); }
        .feed-user-bio { font-size: var(--text-xs); color: var(--text-muted); font-style: italic; margin-top: 2px; }

        .feed-book-card {
          display: flex;
          gap: 14px;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .feed-book-card:hover { opacity: 0.85; }

        .feed-book-cover {
          width: 56px;
          height: 76px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--cream-dark);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feed-book-cover img { width: 100%; height: 100%; object-fit: cover; }
        .feed-book-info { flex: 1; }
        .feed-reading-label { font-size: 10px; color: var(--copper); font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 6px; }
        .feed-book-title { font-family: var(--font-serif); font-size: var(--text-base); font-weight: 600; color: var(--text-primary); line-height: 1.3; margin-bottom: 4px; }
        .feed-book-author { font-size: var(--text-xs); color: var(--text-muted); font-style: italic; }
      `}</style>
    </div>
  );
}
