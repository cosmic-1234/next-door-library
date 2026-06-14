import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiClock, FiPackage, FiRefreshCw } from 'react-icons/fi';
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

export default function AdminRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRentals = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, ...(statusFilter && { status: statusFilter }) });
      const res = await api.get(`/admin/rentals?${params}`);
      setRentals(res.data.rentals || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchRentals(1); }, [statusFilter]);

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

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button className={`forum-cat-btn ${!statusFilter ? 'active' : ''}`} onClick={() => setStatusFilter('')} style={{ color: !statusFilter ? 'white' : 'var(--text-secondary)', background: !statusFilter ? 'var(--brown-rich)' : undefined, border: '1px solid rgba(196,144,106,0.2)' }}>
          All
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

      <div className="admin-chart-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reader</th>
                <th>Book</th>
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
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : rentals.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No rentals found</td></tr>
              ) : rentals.map((rental, i) => {
                const config = STATUS_CONFIG[rental.status];
                const actions = quickActions(rental);
                const isUpdating = updatingId === rental._id;

                return (
                  <motion.tr key={rental._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <p style={{ fontWeight: 500 }}>{rental.user?.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📞 {rental.user?.phone || 'No phone'}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>✉ {rental.user?.email}</p>
                    </td>
                    <td>
                      <p style={{ fontWeight: 600 }}>{rental.book?.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>by {rental.book?.author}</p>
                    </td>
                    <td>{rental.weeksDuration} week{rental.weeksDuration > 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 700, color: 'var(--brown-rich)' }}>₹{rental.totalCost}</td>
                    <td>
                      <p style={{ textTransform: 'capitalize', fontSize: 'var(--text-sm)' }}>{rental.deliveryType}</p>
                      {rental.deliveryType === 'delivery' && rental.deliveryAddress?.area && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {rental.deliveryAddress.area} {rental.deliveryAddress.pincode}</p>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(rental.requestedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ fontSize: '12px', color: rental.dueDate && new Date(rental.dueDate) < new Date() ? 'var(--dusty-rose)' : 'var(--text-muted)' }}>
                      {rental.dueDate ? new Date(rental.dueDate).toLocaleDateString('en-IN') : '—'}
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
                      <div style={{ display: 'flex', gap: '4px' }}>
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

      <style>{`
        .admin-page-title { font-family: var(--font-serif); font-size: var(--text-3xl); font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
        .admin-page-sub { font-size: var(--text-sm); color: var(--text-muted); }
        .forum-cat-btn { padding: 6px 14px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 500; cursor: pointer; transition: all 0.2s; }
      `}</style>
    </div>
  );
}
