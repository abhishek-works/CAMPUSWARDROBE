import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { RiShirtLine, RiAddLine, RiCalendarCheckLine, RiStore2Line, RiTimeLine, RiMoonLine } from 'react-icons/ri';
import './MyListings.css';

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%231a1a2e" width="200" height="200"/%3E%3Ctext fill="%234a4a6a" font-family="sans-serif" font-size="20" text-anchor="middle" x="100" y="105"%3ENo Image%3C/text%3E%3C/svg%3E';

const MyListings = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const res = await api.get('/products/me');
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, []);

  if (loading) return <div className="page"><Loader /></div>;

  return (
    <div className="mylistings-page page" id="my-listings-page">
      <div className="container">
        {/* Profile Header */}
        <div className="ml-profile">
          <div className="ml-profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            {user?.college && (
              <span className="badge badge-violet">{user.college.name || user.collegeID}</span>
            )}
          </div>
          <div className="ml-profile-stats">
            <div className="ml-stat">
              <RiStore2Line />
              <span className="ml-stat-value">{products.length}</span>
              <span className="ml-stat-label">Listings</span>
            </div>
            <div className="ml-stat">
              <RiCalendarCheckLine />
              <span className="ml-stat-value">
                {products.reduce((sum, p) => sum + (p.totalBookings || 0), 0)}
              </span>
              <span className="ml-stat-label">Total Bookings</span>
            </div>
          </div>
        </div>

        {/* Listings Header */}
        <div className="ml-header">
          <h3>My Listings</h3>
          <Link to="/create" className="btn btn-primary btn-sm">
            <RiAddLine /> New Listing
          </Link>
        </div>

        {/* Listings Grid */}
        {products.length === 0 ? (
          <div className="empty-state">
            <RiShirtLine className="empty-state-icon" />
            <h3>No listings yet</h3>
            <p>List your first item and start earning from your wardrobe!</p>
            <Link to="/create" className="btn btn-primary">
              <RiAddLine /> Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="ml-grid">
            {products.map((product) => (
              <Link to={`/product/${product._id}`} key={product._id} className="ml-card glass-card" id={`listing-${product._id}`}>
                <div className="ml-card-image">
                  <img src={product.images?.[0] || PLACEHOLDER_IMG} alt={product.title} />
                  <span className={`badge ${product.availability === 'available' ? 'badge-green' : product.availability === 'rented' ? 'badge-amber' : 'badge-red'}`}>
                    {product.availability}
                  </span>
                </div>
                <div className="ml-card-body">
                  <h4>{product.title}</h4>
                  <div className="ml-card-meta">
                    <span className="badge badge-violet">{product.category}</span>
                    <span className="ml-card-size">{product.size}</span>
                  </div>
                  <div className="ml-card-pricing">
                    {product.pricing?.hourly != null && (
                      <span><RiTimeLine /> ₹{product.pricing.hourly}/hr</span>
                    )}
                    {product.pricing?.nightly != null && (
                      <span><RiMoonLine /> ₹{product.pricing.nightly}/night</span>
                    )}
                  </div>
                  <div className="ml-card-bookings">
                    {product.totalBookings || 0} bookings
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
