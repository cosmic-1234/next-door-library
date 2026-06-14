import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiStar, FiSearch } from 'react-icons/fi';
import api from '../../api/axios';

const GENRES = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Fantasy', 'Science Fiction', 'Biography', 'Self-Help', 'History', 'Children', 'Young Adult', 'Thriller', 'Literary Fiction', 'Philosophy', 'Psychology', 'Business', 'Poetry', 'Other'];
const EMPTY_BOOK = { title: '', author: '', description: '', genre: 'Fiction', language: 'English', condition: 'Good', pricePerWeek: 20, totalCopies: 1, publishedYear: '', publisher: '', pages: '', isbn: '', tags: '', featured: false };

function BookFormModal({ book, onClose, onSave }) {
  const isEdit = !!book?._id;
  const [form, setForm] = useState(book || EMPTY_BOOK);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tags') formData.append(k, typeof v === 'string' ? v : v.join(','));
        else if (v !== '' && v !== null && v !== undefined) formData.append(k, v);
      });
      if (coverFile) formData.append('cover', coverFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const res = isEdit
        ? await api.patch(`/admin/books/${book._id}`, formData, config)
        : await api.post('/admin/books', formData, config);

      onSave(res.data.book, isEdit);
      toast.success(`Book ${isEdit ? 'updated' : 'added'} successfully!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 600 }}>
            {isEdit ? 'Edit Book' : 'Add New Book'}
          </h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="book-form-grid">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Book title" />
            </div>

            <div className="form-group">
              <label className="form-label">Author *</label>
              <input className="form-input" value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} required placeholder="Author name" />
            </div>

            <div className="form-group">
              <label className="form-label">Genre *</label>
              <select className="form-input form-select" value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))}>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description *</label>
              <textarea className="form-input form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required placeholder="Book description..." rows={4} />
            </div>

            <div className="form-group">
              <label className="form-label">Price Per Week (₹) *</label>
              <input type="number" className="form-input" value={form.pricePerWeek} onChange={e => setForm(p => ({ ...p, pricePerWeek: Number(e.target.value) }))} required min="10" max="100" />
            </div>

            <div className="form-group">
              <label className="form-label">Total Copies</label>
              <input type="number" className="form-input" value={form.totalCopies} onChange={e => setForm(p => ({ ...p, totalCopies: Number(e.target.value) }))} min="1" />
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <select className="form-input form-select" value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-input form-select" value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Publisher</label>
              <input className="form-input" value={form.publisher} onChange={e => setForm(p => ({ ...p, publisher: e.target.value }))} placeholder="Publisher name" />
            </div>

            <div className="form-group">
              <label className="form-label">Published Year</label>
              <input type="number" className="form-input" value={form.publishedYear} onChange={e => setForm(p => ({ ...p, publishedYear: e.target.value }))} placeholder="e.g. 2023" />
            </div>

            <div className="form-group">
              <label className="form-label">Pages</label>
              <input type="number" className="form-input" value={form.pages} onChange={e => setForm(p => ({ ...p, pages: e.target.value }))} placeholder="Number of pages" />
            </div>

            <div className="form-group">
              <label className="form-label">ISBN</label>
              <input className="form-input" value={form.isbn} onChange={e => setForm(p => ({ ...p, isbn: e.target.value }))} placeholder="ISBN number" />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" value={typeof form.tags === 'string' ? form.tags : form.tags?.join(', ')} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. bestseller, emotional, recommended" />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Cover Image</label>
              <input type="file" className="form-input" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} />
              {book?.cover && !coverFile && (
                <div style={{ marginTop: '8px' }}>
                  <img src={book.cover} alt="" style={{ height: '80px', borderRadius: '6px', objectFit: 'cover' }} />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Current cover (upload new to replace)</p>
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="featured-check" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} />
              <label htmlFor="featured-check" className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <FiStar size={14} style={{ color: 'var(--gold)' }} /> Mark as Featured Book
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(196,144,106,0.15)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Book' : 'Add Book')}
            </button>
          </div>
        </form>

        <style>{`
          .book-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        `}</style>
      </motion.div>
    </div>
  );
}

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [modalBook, setModalBook] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBooks = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, ...(search && { search }) });
      const res = await api.get(`/admin/books?${params}`);
      setBooks(res.data.books || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(1); }, [search]);

  const handleSave = (book, isEdit) => {
    if (isEdit) {
      setBooks(prev => prev.map(b => b._id === book._id ? book : b));
    } else {
      setBooks(prev => [book, ...prev]);
    }
  };

  const handleDelete = async (bookId, title) => {
    if (!window.confirm(`Remove "${title}" from catalogue?`)) return;
    try {
      await api.delete(`/admin/books/${bookId}`);
      setBooks(prev => prev.filter(b => b._id !== bookId));
      toast.success('Book removed from catalogue');
    } catch { toast.error('Failed to remove book'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="admin-page-title">Books</h1>
          <p className="admin-page-sub">{pagination.total} books in catalogue</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setModalBook(null); setModalOpen(true); }} id="add-book-btn">
          <FiPlus size={16} /> Add Book
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '24px' }}>
        <FiSearch size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-input" style={{ paddingLeft: '40px' }} placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="admin-chart-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title & Author</th>
                <th>Genre</th>
                <th>Price</th>
                <th>Copies</th>
                <th>Condition</th>
                <th>Rating</th>
                <th>Featured</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : books.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No books found</td></tr>
              ) : books.map((book, i) => (
                <motion.tr key={book._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td>
                    <div style={{ width: '36px', height: '48px', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-dark)' }}>
                      {book.cover ? <img src={book.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                    </div>
                  </td>
                  <td>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{book.title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>by {book.author}</p>
                  </td>
                  <td><span className="badge badge-genre">{book.genre}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--brown-rich)' }}>₹{book.pricePerWeek}/wk</td>
                  <td>{book.availableCopies}/{book.totalCopies}</td>
                  <td>{book.condition}</td>
                  <td>{book.averageRating > 0 ? `⭐ ${book.averageRating.toFixed(1)}` : '—'}</td>
                  <td>{book.featured ? '✦' : '—'}</td>
                  <td>
                    <span className={`badge ${book.isActive ? 'badge-active' : 'badge-unavailable'}`}>
                      {book.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setModalBook(book); setModalOpen(true); }}>
                        <FiEdit2 size={13} />
                      </button>
                      <button className="btn btn-sm" style={{ color: 'var(--dusty-rose)', border: '1px solid rgba(201,137,122,0.3)' }} onClick={() => handleDelete(book._id, book.title)}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="pagination" style={{ marginTop: '20px' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`pagination-page ${p === pagination.page ? 'pagination-page-active' : ''}`} onClick={() => fetchBooks(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && <BookFormModal book={modalBook} onClose={() => setModalOpen(false)} onSave={handleSave} />}
      </AnimatePresence>

      <style>{`
        .admin-page-title { font-family: var(--font-serif); font-size: var(--text-3xl); font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
        .admin-page-sub { font-size: var(--text-sm); color: var(--text-muted); }
      `}</style>
    </div>
  );
}
