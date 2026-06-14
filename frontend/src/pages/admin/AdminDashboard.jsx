import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FiBook, FiUsers, FiList, FiTrendingUp, FiClock, FiAlertCircle } from 'react-icons/fi';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#C4906A', '#8A9A7B', '#3B2314', '#D4A882', '#7A8F6E', '#C9897A', '#C9A84C', '#6B3A2A'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentRentals, setRecentRentals] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, rentalsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/rentals?limit=5&sort=-createdAt')
        ]);
        setStats(statsRes.data.stats);
        setRecentRentals(rentalsRes.data.rentals || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}><div className="spinner" /></div>;

  const statCards = [
    { icon: FiBook, label: 'Total Books', value: stats?.totalBooks || 0, color: 'var(--copper)', bg: 'rgba(196,144,106,0.1)' },
    { icon: FiUsers, label: 'Total Readers', value: stats?.totalUsers || 0, color: 'var(--sage)', bg: 'rgba(122,143,110,0.1)' },
    { icon: FiList, label: 'Active Rentals', value: stats?.activeRentals || 0, color: 'var(--brown-warm)', bg: 'rgba(139,90,60,0.1)' },
    { icon: FiClock, label: 'Pending Requests', value: stats?.pendingRentals || 0, color: 'var(--gold)', bg: 'rgba(201,168,76,0.1)' },
    { icon: FiAlertCircle, label: 'Overdue', value: stats?.overdueRentals || 0, color: 'var(--dusty-rose)', bg: 'rgba(201,137,122,0.1)' },
    { icon: FiTrendingUp, label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, color: 'var(--sage)', bg: 'rgba(122,143,110,0.1)' },
  ];

  const chartData = (stats?.rentalsByMonth || []).map(m => ({
    name: MONTH_NAMES[(m._id.month - 1)],
    rentals: m.count,
    revenue: m.revenue
  }));

  const genreData = (stats?.genreStats || []).map(g => ({
    name: g._id,
    value: g.count || 0
  }));

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-sub">Welcome back. Here's what's happening at Next Door Library.</p>
      </div>

      {/* Stat Cards */}
      <div className="admin-stat-grid">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            className="admin-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="admin-stat-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="admin-stat-value" style={{ color: card.color }}>{card.value}</p>
              <p className="admin-stat-label">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts-grid">
        {chartData.length > 0 && (
          <motion.div
            className="admin-chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="admin-chart-title">Rentals & Revenue (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,144,106,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid rgba(196,144,106,0.2)', borderRadius: '8px', fontFamily: 'DM Sans' }} />
                <Bar dataKey="rentals" name="Rentals" fill="var(--copper)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="var(--sage)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {genreData.length > 0 && (
          <motion.div
            className="admin-chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="admin-chart-title">Popular Genres</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={genreData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {genreData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid rgba(196,144,106,0.2)', borderRadius: '8px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Recent Rentals */}
      <motion.div
        className="admin-chart-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ marginTop: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="admin-chart-title" style={{ marginBottom: 0 }}>Recent Rental Requests</h3>
          <Link to="/admin/rentals" className="btn btn-ghost btn-sm">View All</Link>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reader</th>
                <th>Book</th>
                <th>Duration</th>
                <th>Total</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentRentals.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No rentals yet</td></tr>
              ) : recentRentals.map(rental => (
                <tr key={rental._id}>
                  <td>
                    <div>
                      <p style={{ fontWeight: 500 }}>{rental.user?.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rental.user?.phone}</p>
                    </div>
                  </td>
                  <td>
                    <p style={{ fontWeight: 500 }}>{rental.book?.title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>by {rental.book?.author}</p>
                  </td>
                  <td>{rental.weeksDuration}w</td>
                  <td style={{ fontWeight: 600, color: 'var(--brown-rich)' }}>₹{rental.totalCost}</td>
                  <td style={{ textTransform: 'capitalize' }}>{rental.deliveryType}</td>
                  <td>
                    <span className={`badge badge-${rental.status}`} style={{ textTransform: 'capitalize' }}>
                      {rental.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(rental.requestedAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <style>{`
        .admin-dashboard {}

        .admin-page-header { margin-bottom: 32px; }
        .admin-page-title {
          font-family: var(--font-serif);
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .admin-page-sub { font-size: var(--text-sm); color: var(--text-muted); }

        .admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .admin-stat-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.12);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .admin-stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

        .admin-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-stat-value {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          font-weight: 700;
          line-height: 1;
          margin-bottom: 4px;
        }

        .admin-stat-label { font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

        .admin-charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .admin-chart-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.12);
          border-radius: var(--radius-lg);
          padding: 24px;
        }

        .admin-chart-title {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 20px;
        }

        .admin-table-wrap { overflow-x: auto; }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table th {
          text-align: left;
          padding: 10px 14px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          font-weight: 500;
          border-bottom: 1.5px solid rgba(196,144,106,0.15);
          white-space: nowrap;
        }

        .admin-table td {
          padding: 12px 14px;
          font-size: var(--text-sm);
          color: var(--text-primary);
          border-bottom: 1px solid rgba(196,144,106,0.08);
          vertical-align: middle;
        }

        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: rgba(196,144,106,0.04); }

        @media (max-width: 1024px) {
          .admin-stat-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-charts-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .admin-stat-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
