import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import IIMUdaipurPopup from './components/IIMUdaipurPopup';

// Pages
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import FriendsFeed from './pages/FriendsFeed';
import BookRequests from './pages/BookRequests';
import Hubs from './pages/Hubs';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminRentals from './pages/admin/AdminRentals';
import AdminUsers from './pages/admin/AdminUsers';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const { loading } = useAuth();
  const [showIIMUPopup, setShowIIMUPopup] = useState(false);

  useEffect(() => {
    // Show popup after a brief delay if not dismissed in current session
    const hasSeen = sessionStorage.getItem('ndl_iimu_popup_dismissed');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShowIIMUPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleOpenPopup = () => setShowIIMUPopup(true);
    window.addEventListener('open_iimu_popup', handleOpenPopup);
    return () => window.removeEventListener('open_iimu_popup', handleOpenPopup);
  }, []);

  const handleCloseIIMUPopup = () => {
    setShowIIMUPopup(false);
    sessionStorage.setItem('ndl_iimu_popup_dismissed', 'true');
  };

  const handleSelectLocation = (location) => {
    localStorage.setItem('ndl_selected_location', location);
    window.dispatchEvent(new CustomEvent('ndl_location_change', { detail: location }));
    handleCloseIIMUPopup();
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <IIMUdaipurPopup
        isOpen={showIIMUPopup}
        onClose={handleCloseIIMUPopup}
        onSelectLocation={handleSelectLocation}
      />

      <Routes>
        {/* Public pages with Navbar */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/books" element={<><Navbar /><Catalogue /><Footer /></>} />
        <Route path="/books/:id" element={<><Navbar /><BookDetail /><Footer /></>} />
        <Route path="/forum" element={<><Navbar /><Forum /><Footer /></>} />
        <Route path="/suggestions" element={<><Navbar /><BookRequests /><Footer /></>} />
        <Route path="/hubs" element={<><Navbar /><Hubs /><Footer /></>} />

        {/* Auth pages */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected pages */}
        <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /><Footer /></ProtectedRoute>} />
        <Route path="/feed" element={<ProtectedRoute><Navbar /><FriendsFeed /><Footer /></ProtectedRoute>} />

        {/* Admin pages */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="rentals" element={<AdminRentals />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
