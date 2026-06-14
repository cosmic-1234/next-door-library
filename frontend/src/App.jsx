import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

// Pages
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import FriendsFeed from './pages/FriendsFeed';

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
  if (loading) return <LoadingScreen />;

  return (
    <>
      <Routes>
        {/* Public pages with Navbar */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/books" element={<><Navbar /><Catalogue /><Footer /></>} />
        <Route path="/books/:id" element={<><Navbar /><BookDetail /><Footer /></>} />
        <Route path="/forum" element={<><Navbar /><Forum /><Footer /></>} />

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
