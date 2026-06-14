import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiMapPin, FiPhone, FiInfo, FiHeart, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAGPUR_AREAS = [
  'Dharampeth', 'Sitabuldi', 'Gandhibagh', 'Sadar', 'Civil Lines',
  'Ramdaspeth', 'Bajaj Nagar', 'Manewada', 'Wardha Road',
  'Amravati Road', 'Hingna', 'Katol Road', 'Other'
];

export default function Hubs() {
  const { user } = useAuth();
  const [hubs, setHubs] = useState([]);
  const [myHub, setMyHub] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const promises = [api.get('/hubs')];
      if (user) {
        promises.push(api.get('/hubs/my'));
      }
      const [hubsRes, myHubRes] = await Promise.all(promises);
      setHubs(hubsRes.data.hubs || []);
      if (myHubRes) {
        setMyHub(myHubRes.data.hub || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!area || !address || !contactPhone) {
      toast.error('Please fill in all required fields');
      return;
    }
    setFormLoading(true);
    try {
      const res = await api.post('/hubs', { area, address, contactPhone, description });
      setMyHub(res.data.hub);
      toast.success('🎉 Application submitted! Nagpur admins will contact you to verify your hub location.');
      setAddress('');
      setContactPhone('');
      setDescription('');
      setArea('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="hubs-page" style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-4xl)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Neighborhood Collection Hubs 🏡</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Our community library is powered by neighbors like you. Stays-at-home mothers and book lovers host safe pickup and drop-off hubs in Nagpur, making physical reading affordable, easy, and sustainable.
          </p>
        </div>

        <div className="hubs-grid-layout">
          {/* Active Hubs List */}
          <div className="hubs-section">
            <h2 className="section-subtitle-text" style={{ marginBottom: '24px' }}>Active Neighborhood Hubs ({hubs.length})</h2>
            
            {hubs.length === 0 ? (
              <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid rgba(196,144,106,0.15)' }}>
                <FiHome size={32} style={{ color: 'var(--copper-light)', marginBottom: '12px' }} />
                <h3>No active hubs in Nagpur yet</h3>
                <p style={{ fontSize: 'var(--text-sm)' }}>Volunteer to host the first library hub in your neighborhood!</p>
              </div>
            ) : (
              <div className="hubs-list">
                {hubs.map((hub, i) => (
                  <motion.div
                    key={hub._id}
                    className="hub-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="hub-area-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiMapPin style={{ color: 'var(--copper)' }} />
                        <span className="hub-area-name">{hub.area} Hub</span>
                      </div>
                      <span className="badge badge-active" style={{ fontSize: '10px' }}>Active Hub</span>
                    </div>

                    <div className="hub-host-details">
                      <div className="hub-host-avatar">
                        {hub.hostUser?.avatar ? <img src={hub.hostUser.avatar} alt="" /> : hub.hostUser?.name?.[0]}
                      </div>
                      <div>
                        <p className="hub-host-name">Hosted by {hub.hostUser?.name}</p>
                        {hub.description && <p className="hub-host-bio">"{hub.description}"</p>}
                      </div>
                    </div>

                    <div className="hub-contact-info">
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <FiHome size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{hub.address}</span>
                      </p>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiPhone size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{hub.contactPhone}</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Hosting Application Section */}
          <div className="hubs-apply-section">
            <div className="apply-card">
              <h2 className="section-subtitle-text" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiHeart style={{ color: 'var(--dusty-rose)' }} /> Host a Hub
              </h2>

              {!user ? (
                <div style={{ padding: '20px 0', textAlignment: 'center', textAlign: 'center' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Turn your home into a neighborhood book hub! Stay-at-home parents can meet other readers and earn recognition as a local hub leader.
                  </p>
                  <a href="/login" className="btn btn-secondary btn-sm">Sign In to Apply</a>
                </div>
              ) : myHub ? (
                <div style={{ padding: '12px 0' }}>
                  {myHub.status === 'pending' ? (
                    <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--gold)', marginBottom: '8px' }}>
                        <FiInfo /> Application Pending
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>
                        Your application to host a hub in <strong>{myHub.area}</strong> is being reviewed by our Nagpur library admins. We will reach out to you shortly to coordinate!
                      </p>
                    </div>
                  ) : myHub.status === 'active' ? (
                    <div style={{ background: 'rgba(122,143,110,0.08)', border: '1px solid rgba(122,143,110,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--sage)', marginBottom: '8px' }}>
                        <FiCheckCircle /> Host Status: Active 🎉
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>
                        Thank you for hosting the <strong>{myHub.area} Hub</strong>! Your address is listed publicly on this page so neighbors can coordinate book pick-ups and drop-offs.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                      Your hub is currently inactive. Contact admins to re-enable it.
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Sign up to receive and store books in your area. Homemakers, students, and retired seniors love this hobby to stay active and engage with the neighborhood!
                  </p>

                  <div className="form-group">
                    <label className="form-label">Nagpur Area *</label>
                    <select className="form-input form-select" value={area} onChange={e => setArea(e.target.value)} required>
                      <option value="">Select your area</option>
                      {NAGPUR_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pickup Address *</label>
                    <input className="form-input" placeholder="e.g. Flat 302, Vardhaman Heights, Dharampeth" value={address} onChange={e => setAddress(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Number (WhatsApp preferred) *</label>
                    <input className="form-input" placeholder="e.g. 9876543210" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tell neighbors about yourself (Bio)</label>
                    <textarea className="form-input form-textarea" placeholder="e.g. Home-maker loving historic fiction. Delighted to store books for kids in our society!" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ minHeight: '80px' }} />
                  </div>

                  <button type="submit" className="btn btn-primary w-full btn-sm" disabled={formLoading}>
                    {formLoading ? 'Submitting...' : 'Submit Host Application'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hubs-grid-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }
        .hubs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .hub-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.15);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }
        .hub-area-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(196,144,106,0.1);
          padding-bottom: 12px;
        }
        .hub-area-name {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
        }
        .hub-host-details {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
        }
        .hub-host-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--brown-rich);
          color: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          overflow: hidden;
          border: 2px solid rgba(196,144,106,0.2);
          flex-shrink: 0;
        }
        .hub-host-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hub-host-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }
        .hub-host-bio {
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-style: italic;
          margin-top: 2px;
        }
        .hub-contact-info {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          background: rgba(196,144,106,0.06);
          padding: 12px;
          border-radius: var(--radius-sm);
          line-height: 1.5;
        }
        .apply-card {
          background: var(--bg-card);
          border: 1px solid rgba(196,144,106,0.2);
          border-radius: var(--radius-xl);
          padding: 24px;
          position: sticky;
          top: 100px;
          box-shadow: var(--shadow-sm);
        }
        .section-subtitle-text {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          color: var(--text-primary);
          font-weight: 600;
        }
        @media (max-width: 900px) {
          .hubs-grid-layout {
            grid-template-columns: 1fr;
          }
          .apply-card {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
