import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight, FiBookOpen, FiMapPin } from 'react-icons/fi';
import api from '../api/axios';
import BookCard from '../components/BookCard';
import { getCoverUrl } from '../utils/imageUrl';

const GENRES = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Fantasy', 'Science Fiction', 'Biography', 'Self-Help', 'History', 'Children', 'Young Adult', 'Thriller', 'Literary Fiction', 'Philosophy', 'Psychology', 'Business', 'Poetry', 'Other'];
const LANGUAGES = ['English', 'Hindi', 'Marathi'];
const CONDITIONS = ['New', 'Good', 'Fair'];
const LOCATIONS = ['All Locations', 'Nagpur', 'IIM Udaipur'];
const SORT_OPTIONS = [
  { value: '', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'title', label: 'Title A–Z' },
];

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialLoc = searchParams.get('location') || localStorage.getItem('ndl_selected_location') || '';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
    language: '',
    condition: '',
    location: initialLoc === 'All Locations' ? '' : initialLoc,
    available: '',
    sort: '',
    minPrice: '',
    maxPrice: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Sync with global location change events
  useEffect(() => {
    const handleLocUpdate = (e) => {
      if (e.detail) {
        const val = e.detail === 'All Locations' ? '' : e.detail;
        setFilters(p => ({ ...p, location: val }));
      }
    };
    window.addEventListener('ndl_location_change', handleLocUpdate);
    return () => window.removeEventListener('ndl_location_change', handleLocUpdate);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 500);
    return () => clearTimeout(t);
  }, [filters.search]);

  // Live search suggestions (quick, title matches)
  useEffect(() => {
    const q = filters.search.trim();
    if (q.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/books?search=${encodeURIComponent(q)}&limit=6`);
        setSuggestions(res.data.books || []);
      } catch { setSuggestions([]); }
    }, 220);
    return () => clearTimeout(t);
  }, [filters.search]);

  const fetchBooks = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.genre && { genre: filters.genre }),
        ...(filters.language && { language: filters.language }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.location && { location: filters.location }),
        ...(filters.available && { available: filters.available }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      });
      const res = await api.get(`/books?${params}`);
      setBooks(res.data.books || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(1);
  }, [debouncedSearch, filters.genre, filters.language, filters.condition, filters.location, filters.available, filters.sort, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    document.title = "Next Door Library | Browse Book Collection";
  }, []);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ search: '', genre: '', language: '', condition: '', location: '', available: '', sort: '', minPrice: '', maxPrice: '' });

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== '').length;

  return (
    <div className="catalogue-page">
      <div className="catalogue-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="catalogue-title">The Collection</h1>
            <p className="catalogue-subtitle">
              Every book is a world waiting to be explored. Find yours.
            </p>
          </motion.div>

          {/* Location Quick Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {LOCATIONS.map(loc => {
              const val = loc === 'All Locations' ? '' : loc;
              const isSelected = filters.location === val || (loc === 'All Locations' && !filters.location);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    updateFilter('location', val);
                    localStorage.setItem('ndl_selected_location', loc);
                    window.dispatchEvent(new CustomEvent('ndl_location_change', { detail: loc }));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isSelected ? '1.5px solid var(--brown-rich)' : '1px solid rgba(196, 144, 106, 0.3)',
                    background: isSelected ? 'var(--brown-rich)' : 'rgba(255, 255, 255, 0.6)',
                    color: isSelected ? 'var(--cream)' : 'var(--text-secondary)',
                    boxShadow: isSelected ? '0 4px 12px rgba(44, 24, 16, 0.15)' : 'none'
                  }}
                >
                  <FiMapPin size={12} style={{ color: isSelected ? 'var(--gold)' : 'var(--copper)' }} />
                  <span>{loc}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="catalogue-search-wrap">
            <div className="catalogue-search">
              <FiSearch size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by title, author, or description..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                onFocus={() => setSuggestOpen(true)}
                onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                autoComplete="off"
                id="catalogue-search-input"
              />
              {filters.search && (
                <button className="search-clear" onClick={() => updateFilter('search', '')}>
                  <FiX size={16} />
                </button>
              )}

              <AnimatePresence>
                {suggestOpen && filters.search.trim().length >= 2 && suggestions.length > 0 && (
                  <motion.div
                    className="search-suggest"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  >
                    {suggestions.map((b, i) => (
                      <motion.button
                        key={b._id}
                        type="button"
                        className="search-suggest-item"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onMouseDown={(e) => { e.preventDefault(); navigate(`/books/${b._id}`); }}
                      >
                        <span className="ss-thumb">
                          {b.cover ? <img src={getCoverUrl(b.cover)} alt="" /> : <FiBookOpen size={14} />}
                        </span>
                        <span className="ss-info">
                          <span className="ss-title">{b.title}</span>
                          <span className="ss-author">by {b.author}</span>
                        </span>
                        <span className="ss-price">₹{b.pricePerWeek}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="catalogue-controls">
              <select
                className="form-input form-select sort-select"
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                id="sort-select"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <button
                className={`btn btn-ghost filter-toggle ${activeFilterCount > 0 ? 'filter-toggle-active' : ''}`}
                onClick={() => setFiltersOpen(!filtersOpen)}
                id="filter-toggle-btn"
              >
                <FiFilter size={16} />
                Filters
                {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
              </button>

              {activeFilterCount > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                  <FiX size={14} /> Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            className="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
          >
            <div className="container">
              <div className="filter-grid animate-fadeInUp">
                <div className="form-group">
                  <label className="form-label">City / Location</label>
                  <select className="form-input form-select" value={filters.location} onChange={e => updateFilter('location', e.target.value)}>
                    <option value="">All Locations</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="IIM Udaipur">IIM Udaipur</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <select className="form-input form-select" value={filters.genre} onChange={e => updateFilter('genre', e.target.value)}>
                    <option value="">All Genres</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-input form-select" value={filters.language} onChange={e => updateFilter('language', e.target.value)}>
                    <option value="">All Languages</option>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select className="form-input form-select" value={filters.condition} onChange={e => updateFilter('condition', e.target.value)}>
                    <option value="">Any Condition</option>
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <select className="form-input form-select" value={filters.available} onChange={e => updateFilter('available', e.target.value)}>
                    <option value="">All Books</option>
                    <option value="true">Available Now</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price Range</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" className="form-input" placeholder="Min ₹" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} min="0" />
                    <input type="number" className="form-input" placeholder="Max ₹" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} min="0" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="container catalogue-body">
        {/* Results info */}
        <div className="results-info">
          <p>
            {loading ? 'Searching...' : `${pagination.total} book${pagination.total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div className="catalogue-loading">
            <div className="spinner" />
          </div>
        ) : books.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="empty-icon"><FiBookOpen size={48} /></div>
            <h3 className="empty-title">No books found</h3>
            <p className="empty-desc">Try adjusting your filters or search term.</p>
            <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
          </motion.div>
        ) : (
          <motion.div
            className="books-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {books.map((book, i) => (
              <BookCard key={book._id} book={book} delay={i * 0.05} />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm pagination-btn"
              onClick={() => fetchBooks(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <FiChevronLeft /> Prev
            </button>

            <div className="pagination-pages">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`pagination-page ${p === pagination.page ? 'pagination-page-active' : ''}`}
                  onClick={() => fetchBooks(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              className="btn btn-ghost btn-sm pagination-btn"
              onClick={() => fetchBooks(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .catalogue-page { padding-top: 80px; min-height: 100vh; }

        .catalogue-hero {
          background: linear-gradient(to bottom, var(--cream-dark), var(--cream));
          padding: 60px 0 40px;
          border-bottom: 1px solid rgba(196, 144, 106, 0.15);
        }

        .catalogue-title {
          font-family: var(--font-serif);
          font-size: var(--text-5xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .catalogue-subtitle {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          font-style: italic;
          font-family: var(--font-serif);
          margin-bottom: 32px;
        }

        .catalogue-search-wrap {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .catalogue-search {
          flex: 1;
          min-width: 300px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 12px 40px;
          background: white;
          border: 1.5px solid rgba(196, 144, 106, 0.3);
          border-radius: var(--radius-full);
          font-size: var(--text-base);
          color: var(--text-primary);
          outline: none;
          transition: all var(--transition-fast);
        }

        .search-input:focus {
          border-color: var(--copper);
          box-shadow: 0 0 0 3px rgba(196, 144, 106, 0.15);
        }

        .search-clear {
          position: absolute;
          right: 12px;
          color: var(--text-muted);
          padding: 4px;
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
        }

        .search-clear:hover { background: var(--cream-dark); color: var(--text-primary); }

        .search-suggest {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--bg-card);
          border: 1px solid rgba(196, 144, 106, 0.25);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          backdrop-filter: blur(20px);
          padding: 6px;
          z-index: 60;
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-height: 360px;
          overflow-y: auto;
        }
        .search-suggest-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: var(--radius-md);
          text-align: left;
          width: 100%;
          background: transparent;
          transition: background var(--transition-fast);
        }
        .search-suggest-item:hover { background: rgba(196, 144, 106, 0.1); }
        .ss-thumb {
          width: 30px;
          height: 40px;
          border-radius: 4px;
          overflow: hidden;
          background: var(--cream-dark);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--copper-light);
          box-shadow: 0 1px 3px rgba(44, 24, 16, 0.12);
        }
        .ss-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ss-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
        .ss-title {
          font-family: var(--font-serif);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ss-author { font-size: 11px; color: var(--text-muted); font-style: italic; }
        .ss-price {
          font-family: var(--font-serif);
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--brown-rich);
          flex-shrink: 0;
        }

        .catalogue-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-select {
          min-width: 180px;
          border-radius: var(--radius-full) !important;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
        }

        .filter-toggle-active {
          border-color: var(--copper) !important;
          background: rgba(196, 144, 106, 0.1) !important;
        }

        .filter-badge {
          background: var(--copper);
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .filter-panel {
          background: var(--cream-light);
          border-bottom: 1px solid rgba(196, 144, 106, 0.15);
          overflow: hidden;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          padding: 24px 0;
        }

        .catalogue-body {
          padding-top: 32px;
          padding-bottom: 80px;
        }

        .results-info {
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .catalogue-loading {
          display: flex;
          justify-content: center;
          padding: 80px 0;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon { font-size: 60px; margin-bottom: 20px; }
        .empty-title {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          color: var(--text-primary);
          margin-bottom: 10px;
        }
        .empty-desc { color: var(--text-muted); margin-bottom: 24px; }

        /* Pagination */
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 48px;
        }

        .pagination-pages {
          display: flex;
          gap: 4px;
        }

        .pagination-page {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-page:hover { background: var(--cream-dark); }
        .pagination-page-active {
          background: var(--brown-rich) !important;
          color: var(--cream) !important;
        }

        .pagination-btn { display: flex; align-items: center; gap: 4px; }

        @media (max-width: 1024px) {
          .books-grid { grid-template-columns: repeat(3, 1fr); }
          .filter-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 768px) {
          .books-grid { grid-template-columns: repeat(2, 1fr); }
          .filter-grid { grid-template-columns: repeat(2, 1fr); }
          .catalogue-search-wrap { flex-direction: column; align-items: stretch; }
          .catalogue-search { min-width: unset; }
        }

        @media (max-width: 480px) {
          .books-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
