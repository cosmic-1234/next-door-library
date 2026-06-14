import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiShield, FiUser, FiToggleLeft, FiToggleRight, FiSearch } from 'react-icons/fi';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, ...(search && { search }) });
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || { page: 1, pages: 1 });
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(1); }, [search]);

  const updateUser = async (userId, data) => {
    if (userId === currentUser._id) {
      toast.error("You can't modify your own account here");
      return;
    }
    try {
      const res = await api.patch(`/admin/users/${userId}`, data);
      setUsers(prev => prev.map(u => u._id === userId ? res.data.user : u));
      toast.success('User updated');
    } catch { toast.error('Failed to update user'); }
  };

  const toggleAdmin = (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    updateUser(user._id, { role: newRole });
  };

  const toggleActive = (user) => {
    updateUser(user._id, { isActive: !user.isActive });
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="admin-page-title">Users</h1>
        <p className="admin-page-sub">{pagination.total} registered readers</p>
      </div>

      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '24px' }}>
        <FiSearch size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-input" style={{ paddingLeft: '40px' }} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="admin-chart-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Books Read</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No users found</td></tr>
              ) : users.map((user, i) => (
                <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brown-rich)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px', overflow: 'hidden', flexShrink: 0 }}>
                        {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name?.[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{user.name}</p>
                        {user._id === currentUser._id && <p style={{ fontSize: '10px', color: 'var(--copper)' }}>You</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{user.phone || '—'}</td>
                  <td style={{ textAlign: 'center' }}>{user.totalBooksRead || 0}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      background: user.role === 'admin' ? 'rgba(196,144,106,0.15)' : 'rgba(122,143,110,0.1)',
                      color: user.role === 'admin' ? 'var(--copper)' : 'var(--sage)',
                      border: `1px solid ${user.role === 'admin' ? 'rgba(196,144,106,0.3)' : 'rgba(122,143,110,0.25)'}`,
                    }}>
                      {user.role === 'admin' ? <FiShield size={10} /> : <FiUser size={10} />}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-active' : 'badge-unavailable'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {user._id !== currentUser._id && (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => toggleAdmin(user)}
                          title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                          style={{ fontSize: '11px' }}
                        >
                          {user.role === 'admin' ? '⬇ Demote' : '⬆ Admin'}
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => toggleActive(user)}
                          style={{
                            fontSize: '11px',
                            color: user.isActive ? 'var(--dusty-rose)' : 'var(--sage)',
                            border: `1px solid ${user.isActive ? 'rgba(201,137,122,0.3)' : 'rgba(122,143,110,0.3)'}`,
                          }}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="pagination" style={{ marginTop: '20px' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`pagination-page ${p === pagination.page ? 'pagination-page-active' : ''}`} onClick={() => fetchUsers(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .admin-page-title { font-family: var(--font-serif); font-size: var(--text-3xl); font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
        .admin-page-sub { font-size: var(--text-sm); color: var(--text-muted); }
      `}</style>
    </div>
  );
}
