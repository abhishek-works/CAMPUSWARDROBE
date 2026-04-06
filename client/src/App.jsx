import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import ProductDetail from './pages/ProductDetail';
import CreateListing from './pages/CreateListing';
import MyBookings from './pages/MyBookings';
import MyListings from './pages/MyListings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/browse" element={
            <ProtectedRoute><Browse /></ProtectedRoute>
          } />
          <Route path="/product/:id" element={
            <ProtectedRoute><ProductDetail /></ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute><CreateListing /></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute><MyBookings /></ProtectedRoute>
          } />
          <Route path="/my-listings" element={
            <ProtectedRoute><MyListings /></ProtectedRoute>
          } />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
