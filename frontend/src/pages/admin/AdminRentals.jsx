import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiClock, FiPackage, FiRefreshCw, FiPhone, FiMail, FiMapPin, FiEdit2, FiCalendar } from 'react-icons/fi';
import api from '../../api/axios';

const STATUS_OPTIONS = ['pending', 'approved', 'active', 'returned', 'overdue', 'cancelled'];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'var(--gold)', bg: 'rgba(201,168,76,0.1)' },
  approved: { label: 'Approved', color: 'var(--sage)', bg: 'rgba(122,143,110,0.1)' },
  active: { label: 'Active', color: 'var(--copper)', bg: 'rgba(196,144,106,0.1)' },
  returned: { label: 'Returned', color: 'var(--text-muted)', bg: 'rgba(155,123,106,0.08)' },
  overdue: { label: 'Overdue', color: 'var(--dusty-rose)', bg: 'rgba(201,137,122,0.1)' },
  cancelled: { label: 'Cancelled', color: 'var(--text-muted)', bg: 'rgba(155,123,106,0.08)' },
};

function EditRentalModal({ rental, onClose, onSave }) {
  const [weeksDuration, setWeeksDuration] = useState(rental.weeksDuration || 1);
  const [location, setLocation] = useState(rental.location || 'Nagpur');
  const [status, setStatus] = useState(rental.status);
  const [adminNote, setAdminNote] = useState(rental.adminNote || '');
  const [dueDate, setDueDate] = useState(rental.dueDate ? new Date(rental.dueDate).toISOString().split('T')[0] : '');
  const [loading, setLoading] = useState(false);

  const pricePerWeek = rental.book?.pricePerWeek || 0;
  const recalculatedCost = pricePerWeek * weeksDuration;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        weeksDuration: Number(weeksDuration),
        location,
        status,
        adminNote,
        ...(dueDate && { dueDate: new Date(dueDate).toISOString() })
      };
      const res = await api.patch(`/admin/rentals/${rental._id}`, payload);
      onSave(res.data.rental);
      toast.success('Rental updated successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update rental');
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
        style={{ maxWidth: '500px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 600 }}>
            Customize Rental
          </h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--cream-light)', borderRadius: '8px', border: '1px solid rgba(196,144,106,0.2)' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{rental.book?.title}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reader: {rental.user?.name} ({rental.user?.email})</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Rental Location</label>
              <select className="form-input form-select" value={location} onChange={e => setLocation(e.target.value)}>
                <option value="Nagpur">Nagpur</option>
                <option value="IIM Udaipur">IIM Udaipur</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Rental Duration (weeks) *</label>
              <input
                type="number"
                className="form-input"
                value={weeksDuration}
                onChange={e => setWeeksDuration(Number(e.target.value))}
                min="1"
                max="52"
                required
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Total Cost: ₹{recalculatedCost} (₹{pricePerWeek}/wk × {weeksDuration} weeks)
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input form-select" value={status} onChange={e => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date (optional override)</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Note</label>
              <textarea
                className="form-input form-textarea"
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Internal notes or communication notes..."
                rows={3}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(196,144,106,0.15)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Update Rental'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [updatingId, setUpdatingId] = useState(null);
  const [editRental, setEditRental] = useState(null);

  const fetchRentals = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(locationFilter && { location: locationFilter })
      });
      const res = await api.get(`/admin/rentals?${params}`);
      setRentals(res.data.rentals || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchRentals(1); }, [statusFilter, locationFilter]);

  const updateStatus = async (rentalId, status, adminNote = '') => {
    setUpdatingId(rentalId);
    try {
      const res = await api.patch(`/admin/rentals/${rentalId}`, { status, adminNote });
      setRentals(prev => prev.map(r => r._id === rentalId ? res.data.rental : r));
      toast.success(`Rental status updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update rental');
    } finally {
      setUpdatingId(null);
    }
  };

  const quickActions = (rental) => {
    const actions = [];
    if (rental.status === 'pending') {
      actions.push({ label: 'Approve', icon: FiCheck, onClick: () => updateStatus(rental._id, 'active'), color: 'var(--sage)' });
      actions.push({ label: 'Cancel', icon: FiX, onClick: () => updateStatus(rental._id, 'cancelled'), color: 'var(--dusty-rose)' });
    }
    if (rental.status === 'active') {
      actions.push({ label: 'Mark Returned', icon: FiRefreshCw, onClick: () => updateStatus(rental._id, 'returned'), color: 'var(--copper)' });
    }
    return actions;
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="admin-page-title">Rental Requests</h1>
        <p className="admin-page-sub">{pagination.total} total rentals</p>
      </div>

      {/* Location Filter & Status Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {/* City Location Filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>Location:</span>
          {['', 'Nagpur', 'IIM Udaipur'].map(loc => (
            <button
              key={loc}
              className={`forum-cat-btn ${locationFilter === loc ? 'active' : ''}`}
              onClick={() => setLocationFilter(loc)}
              style={{
                color: locationFilter === loc ? 'white' : 'var(--text-secondary)',
                background: locationFilter === loc ? 'var(--brown-rich)' : 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(196,144,106,0.3)',
                padding: '4px 12px',
                fontSize: '11px'
              }}
            >
              {loc ? loc : 'All Cities'}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className={`forum-cat-btn ${!statusFilter ? 'active' : ''}`} onClick={() => setStatusFilter('')} style={{ color: !statusFilter ? 'white' : 'var(--text-secondary)', background: !statusFilter ? 'var(--copper)' : undefined, border: '1px solid rgba(196,144,106,0.2)' }}>
            All Statuses
          </button>
          {STATUS_OPTIONS.map(s => {
            const c = STATUS_CONFIG[s];
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: `1px solid ${c.color}40`,
                  color: isActive ? 'white' : c.color,
                  background: isActive ? c.color : c.bg,
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-chart-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reader</th>
                <th>Book</th>
                <th>Location</th>
                <th>Duration</th>
                <th>Cost</th>
                <th>Delivery</th>
                <th>Requested</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : rentals.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No rentals found</td></tr>
              ) : rentals.map((rental, i) => {
                const config = STATUS_CONFIG[rental.status];
                const actions = quickActions(rental);
                const isUpdating = updatingId === rental._id;

                return (
                  <motion.tr key={rental._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <p style={{ fontWeight: 500 }}>{rental.user?.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiPhone size={11} style={{ color: 'var(--text-muted)' }} /> {rental.user?.phone || 'No phone'}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiMail size={11} style={{ color: 'var(--text-muted)' }} /> {rental.user?.email}
                      </p>
                    </td>
                    <td>
                      <p style={{ fontWeight: 600 }}>{rental.book?.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>by {rental.book?.author}</p>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          fontSize: '11px',
                          background: rental.location === 'IIM Udaipur' ? 'rgba(201, 168, 76, 0.15)' : 'rgba(196, 144, 106, 0.15)',
                          color: rental.location === 'IIM Udaipur' ? 'var(--brown-deep)' : 'var(--brown-rich)',
                          border: rental.location === 'IIM Udaipur' ? '1px solid rgba(201, 168, 76, 0.4)' : '1px solid rgba(196, 144, 106, 0.3)'
                        }}
                      >
                        📍 {rental.location || 'Nagpur'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{rental.weeksDuration} week{rental.weeksDuration > 1 ? 's' : ''}</span>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 4px', height: 'auto', minHeight: 'auto', color: 'var(--copper)' }}
                          onClick={() => setEditRental(rental)}
                          title="Customize rental duration"
                        >
                          <FiEdit2 size={11} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--brown-rich)' }}>₹{rental.totalCost}</div>
                      <div style={{ fontSize: '10px', color: rental.paymentStatus === 'paid' ? 'var(--sage)' : 'var(--gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                        {rental.paymentStatus === 'paid' ? `Paid (${rental.paymentMethod})` : rental.paymentMethod === 'COD' ? 'COD (Pending)' : 'Unpaid'}
                      </div>
                    </td>
                    <td>
                      <p style={{ textTransform: 'capitalize', fontSize: 'var(--text-sm)' }}>{rental.deliveryType}</p>
                      {rental.deliveryType === 'delivery' && rental.deliveryAddress?.area && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <FiMapPin size={11} style={{ color: 'var(--text-muted)' }} /> {rental.deliveryAddress.area} {rental.deliveryAddress.pincode}
                        </p>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(rental.requestedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ fontSize: '12px', color: rental.dueDate && new Date(rental.dueDate) < new Date() ? 'var(--dusty-rose)' : 'var(--text-muted)' }}>
                      {rental.dueDate ? new Date(rental.dueDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td>
                      <select
                        value={rental.status}
                        onChange={e => updateStatus(rental._id, e.target.value)}
                        disabled={isUpdating}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-full)',
                          border: `1px solid ${config.color}40`,
                          color: config.color,
                          background: config.bg,
                          fontSize: '11px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ color: 'var(--text-primary)', background: 'white' }}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-sm"
                          style={{ color: 'var(--copper)', border: '1px solid rgba(196,144,106,0.3)', padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => setEditRental(rental)}
                          title="Edit Rental & Duration"
                        >
                          <FiEdit2 size={12} />
                        </button>
                        {actions.map((action, ai) => (
                          <button
                            key={ai}
                            className="btn btn-sm"
                            style={{ color: action.color, border: `1px solid ${action.color}40`, padding: '4px 10px', fontSize: '11px' }}
                            onClick={action.onClick}
                            disabled={isUpdating}
                            title={action.label}
                          >
                            <action.icon size={12} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="pagination" style={{ marginTop: '20px' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`pagination-page ${p === pagination.page ? 'pagination-page-active' : ''}`} onClick={() => fetchRentals(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editRental && (
          <EditRentalModal
            rental={editRental}
            onClose={() => setEditRental(null)}
            onSave={(updated) => {
              setRentals(prev => prev.map(r => r._id === updated._id ? updated : r));
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .admin-page-title { font-family: var(--font-serif); font-size: var(--text-3xl); font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
        .admin-page-sub { font-size: var(--text-sm); color: var(--text-muted); }
        .forum-cat-btn { padding: 6px 14px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 500; cursor: pointer; transition: all 0.2s; }
      `}</style>
    </div>
  );
}
