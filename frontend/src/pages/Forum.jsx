import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiHeart, FiMessageCircle, FiEye, FiPlusCircle, FiX, FiBook } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Discussion', 'Recommendation', 'Review', 'Question', 'General'];

function PostCard({ post, onLike, onOpen }) {
  const { user } = useAuth();
  const isLiked = user && post.likes?.includes(user._id);

  return (
    <motion.div
      className="forum-post-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="forum-post-header">
        <div className="forum-author">
          <div className="forum-author-avatar">
            {post.author?.avatar ? <img src={post.author.avatar} alt="" /> : post.author?.name?.[0]}
          </div>
          <div>
            <p className="forum-author-name">{post.author?.name}</p>
            <p className="forum-post-date">{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="forum-category-badge">{post.category}</span>
          {post.isPinned && <span style={{ color: 'var(--gold)', fontSize: '12px' }}>📌 Pinned</span>}
        </div>
      </div>

      {post.book && (
        <Link to={`/books/${post.book._id}`} className="forum-book-link">
          <div className="forum-book-thumb">
            {post.book.cover ? <img src={post.book.cover} alt="" /> : <FiBook size={14} />}
          </div>
          <span>{post.book.title}</span>
        </Link>
      )}

      <h3 className="forum-post-title" onClick={() => onOpen(post)}>{post.title}</h3>
      <p className="forum-post-excerpt">{post.body.slice(0, 200)}{post.body.length > 200 ? '...' : ''}</p>

      {post.tags?.length > 0 && (
        <div className="forum-post-tags">
          {post.tags.map(tag => <span key={tag} className="forum-tag">#{tag}</span>)}
        </div>
      )}

      <div className="forum-post-footer">
        <button
          className={`forum-action-btn ${isLiked ? 'forum-action-liked' : ''}`}
          onClick={() => onLike(post._id)}
        >
          <FiHeart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          {post.likes?.length || 0}
        </button>
        <button className="forum-action-btn" onClick={() => onOpen(post)}>
          <FiMessageCircle size={14} />
          {post.comments?.length || 0}
        </button>
        <span className="forum-views">
          <FiEye size={12} /> {post.views || 0}
        </span>
      </div>
    </motion.div>
  );
}

function PostModal({ post: initialPost, onClose }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/forum/${post._id}/comment`, { body: comment });
      setPost(prev => ({ ...prev, comments: [...(prev.comments || []), res.data.comment] }));
      setComment('');
    } catch { toast.error('Failed to post comment'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ maxWidth: '700px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span className="forum-category-badge" style={{ marginBottom: '8px', display: 'inline-block' }}>{post.category}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 600 }}>{post.title}</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '6px' }}>
              by {post.author?.name} · {new Date(post.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px', fontSize: 'var(--text-base)' }}>
            {post.body}
          </p>

          <div style={{ borderTop: '1px solid rgba(196,144,106,0.15)', paddingTop: '20px' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', marginBottom: '16px' }}>
              Comments ({post.comments?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {post.comments?.map((c, i) => (
                <div key={c._id || i} style={{ background: 'rgba(196,144,106,0.05)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--brown-rich)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600 }}>
                      {c.author?.name?.[0]}
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{c.author?.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.body}</p>
                </div>
              ))}
            </div>

            {user ? (
              <form onSubmit={handleComment} style={{ display: 'flex', gap: '10px' }}>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Share your thoughts..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  style={{ minHeight: '70px', flex: 1, resize: 'none' }}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-end' }}>
                  {loading ? '...' : 'Post'}
                </button>
              </form>
            ) : (
              <Link to="/login" className="btn btn-ghost">Sign in to comment</Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', category: 'Discussion', tags: '' });
  const [creating, setCreating] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...(category && { category }), ...(search && { search }) });
      const res = await api.get(`/forum?${params}`);
      setPosts(res.data.posts || []);
      setPagination(res.data.pagination || { page: 1, pages: 1 });
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(1); }, [category, search]);

  const handleLike = async (postId) => {
    if (!user) { toast.error('Sign in to like posts'); return; }
    try {
      const res = await api.patch(`/forum/${postId}/like`);
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const likes = res.data.liked
          ? [...(p.likes || []), user._id]
          : (p.likes || []).filter(id => id !== user._id);
        return { ...p, likes };
      }));
    } catch { toast.error('Failed to like post'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const tags = newPost.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.post('/forum', { ...newPost, tags });
      setPosts(prev => [res.data.post, ...prev]);
      setNewPost({ title: '', body: '', category: 'Discussion', tags: '' });
      setCreateOpen(false);
      toast.success('Post created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally { setCreating(false); }
  };

  return (
    <div className="forum-page">
      <div className="forum-hero">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="forum-hero-title">Community Forum</h1>
            <p className="forum-hero-sub">Discuss books, share recommendations, ask questions. This is your space.</p>
          </motion.div>

          <div className="forum-controls">
            <input
              className="form-input forum-search"
              placeholder="Search discussions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <div className="forum-category-filters">
              <button className={`forum-cat-btn ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>All</button>
              {CATEGORIES.map(c => (
                <button key={c} className={`forum-cat-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>

            {user && (
              <button className="btn btn-primary" id="new-post-btn" onClick={() => setCreateOpen(true)}>
                <FiPlusCircle size={16} /> New Post
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container forum-body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : posts.length === 0 ? (
          <div className="forum-empty">
            <p>No posts found. Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="forum-posts-grid">
            {posts.map((post, i) => (
              <PostCard key={post._id} post={post} onLike={handleLike} onOpen={setSelectedPost} />
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`pagination-page ${p === pagination.page ? 'pagination-page-active' : ''}`} onClick={() => fetchPosts(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setCreateOpen(false)}>
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ maxWidth: '600px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 600 }}>Create Post</h2>
                <button className="modal-close" onClick={() => setCreateOpen(false)}><FiX /></button>
              </div>

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input form-select" value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" placeholder="What's this discussion about?" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Content *</label>
                  <textarea className="form-input form-textarea" placeholder="Share your thoughts, questions, or recommendations..." value={newPost.body} onChange={e => setNewPost(p => ({ ...p, body: e.target.value }))} required rows={5} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" placeholder="e.g. fiction, classics, must-read" value={newPost.tags} onChange={e => setNewPost(p => ({ ...p, tags: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Posting...' : 'Publish Post'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      </AnimatePresence>

      <style>{`
        .forum-page { min-height: 100vh; padding-top: 80px; }

        .forum-hero {
          background: linear-gradient(to bottom, var(--brown-deep), var(--brown-rich));
          padding: 60px 0 40px;
          color: var(--cream);
        }

        .forum-hero-title {
          font-family: var(--font-serif);
          font-size: var(--text-5xl);
          font-weight: 600;
          color: var(--cream);
          margin-bottom: 8px;
        }

        .forum-hero-sub {
          font-size: var(--text-lg);
          color: rgba(247,240,227,0.65);
          font-style: italic;
          margin-bottom: 32px;
        }

        .forum-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .forum-search {
          min-width: 280px;
          background: rgba(247,240,227,0.1) !important;
          border-color: rgba(247,240,227,0.2) !important;
          color: var(--cream) !important;
        }

        .forum-search::placeholder { color: rgba(247,240,227,0.4); }
        .forum-search:focus { background: rgba(247,240,227,0.15) !important; border-color: var(--copper-light) !important; }

        .forum-category-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .forum-cat-btn {
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
          color: rgba(247,240,227,0.65);
          border: 1px solid rgba(247,240,227,0.2);
          transition: all var(--transition-fast);
        }

        .forum-cat-btn:hover, .forum-cat-btn.active {
          background: var(--copper);
          color: white;
          border-color: var(--copper);
        }

        .forum-body { padding-top: 32px; padding-bottom: 80px; }

        .forum-posts-grid { display: flex; flex-direction: column; gap: 16px; }

        .forum-post-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.12);
          border-radius: var(--radius-lg);
          padding: 24px;
          transition: all 0.3s ease;
        }

        .forum-post-card:hover { border-color: rgba(196,144,106,0.25); box-shadow: var(--shadow-md); }

        .forum-post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .forum-author { display: flex; align-items: center; gap: 10px; }

        .forum-author-avatar {
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
          flex-shrink: 0;
        }

        .forum-author-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .forum-author-name { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }
        .forum-post-date { font-size: var(--text-xs); color: var(--text-muted); }

        .forum-category-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(196,144,106,0.1);
          color: var(--copper);
          border: 1px solid rgba(196,144,106,0.2);
        }

        .forum-book-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          background: rgba(59,35,20,0.06);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 10px;
          border: 1px solid rgba(196,144,106,0.15);
          transition: all var(--transition-fast);
        }

        .forum-book-link:hover { background: rgba(196,144,106,0.1); }

        .forum-book-thumb {
          width: 20px;
          height: 26px;
          border-radius: 2px;
          overflow: hidden;
          background: var(--cream-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--copper-light);
        }

        .forum-book-thumb img { width: 100%; height: 100%; object-fit: cover; }

        .forum-post-title {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 10px;
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .forum-post-title:hover { color: var(--copper); }

        .forum-post-excerpt { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.7; margin-bottom: 12px; }

        .forum-post-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
        .forum-tag { font-size: 11px; color: var(--text-muted); padding: 2px 8px; background: rgba(196,144,106,0.06); border-radius: var(--radius-full); border: 1px solid rgba(196,144,106,0.12); }

        .forum-post-footer { display: flex; align-items: center; gap: 16px; padding-top: 12px; border-top: 1px solid rgba(196,144,106,0.08); }

        .forum-action-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: var(--text-xs);
          color: var(--text-muted);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .forum-action-btn:hover { background: rgba(196,144,106,0.1); color: var(--text-primary); }
        .forum-action-liked { color: var(--dusty-rose) !important; }

        .forum-views { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; margin-left: auto; }

        .forum-empty { text-align: center; padding: 80px 20px; color: var(--text-muted); font-style: italic; }
      `}</style>
    </div>
  );
}
