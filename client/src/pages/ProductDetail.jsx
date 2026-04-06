import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BookingCalendar from '../components/BookingCalendar';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiStarFill, RiRulerLine, RiPaletteLine, RiPriceTag3Line, RiShieldCheckLine, RiTimeLine, RiMoonLine } from 'react-icons/ri';
import './ProductDetail.css';

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"%3E%3Crect fill="%231a1a2e" width="400" height="500"/%3E%3Ctext fill="%234a4a6a" font-family="sans-serif" font-size="36" text-anchor="middle" x="200" y="260"%3ENo Image%3C/text%3E%3C/svg%3E';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [checkResult, setCheckResult] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        toast.error('Product not found');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleCheckAvailability = async (data) => {
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const res = await api.post('/bookings/check', {
        productId: id,
        ...data,
      });
      setCheckResult(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setCheckResult({ available: false, msg: err.response.data.msg });
      } else {
        toast.error('Failed to check availability');
      }
    } finally {
      setCheckLoading(false);
    }
  };

  const handleBook = async (data) => {
    setCheckLoading(true);
    try {
      const res = await api.post('/bookings', {
        productId: id,
        ...data,
      });
      toast.success('Booking confirmed! Check your Meeting Pass in My Bookings.');
      navigate('/bookings');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Booking failed';
      toast.error(msg);
    } finally {
      setCheckLoading(false);
    }
  };

  if (loading) return <div className="page"><Loader /></div>;
  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : [PLACEHOLDER_IMG];
  const isOwner = user?._id === product.owner?._id || user?.id === product.owner?._id;

  return (
    <div className="product-detail page" id="product-detail-page">
      <div className="container">
        <button className="btn btn-ghost pd-back" onClick={() => navigate(-1)}>
          <RiArrowLeftLine /> Back
        </button>

        <div className="pd-layout">
          {/* Image Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-image-wrap">
              <img src={images[activeImage]} alt={product.title} className="pd-main-image" />
            </div>
            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumbnail ${i === activeImage ? 'pd-thumbnail-active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`${product.title} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="pd-info">
            <div className="pd-info-header">
              <span className={`badge badge-violet`}>{product.category}</span>
              {product.condition && (
                <span className="badge badge-green">{product.condition}</span>
              )}
            </div>

            <h1 className="pd-title">{product.title}</h1>

            {product.description && (
              <p className="pd-description">{product.description}</p>
            )}

            {/* Pricing */}
            <div className="pd-pricing">
              {product.pricing?.hourly != null && (
                <div className="pd-price-card glass-card">
                  <RiTimeLine className="pd-price-icon" />
                  <div>
                    <span className="pd-price-value">₹{product.pricing.hourly}</span>
                    <span className="pd-price-unit">/ hour</span>
                  </div>
                </div>
              )}
              {product.pricing?.nightly != null && (
                <div className="pd-price-card glass-card">
                  <RiMoonLine className="pd-price-icon" />
                  <div>
                    <span className="pd-price-value">₹{product.pricing.nightly}</span>
                    <span className="pd-price-unit">/ night</span>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="pd-details">
              {product.size && (
                <div className="pd-detail">
                  <RiRulerLine /> <span>Size: <strong>{product.size}</strong></span>
                </div>
              )}
              {product.brand && (
                <div className="pd-detail">
                  <RiPriceTag3Line /> <span>Brand: <strong>{product.brand}</strong></span>
                </div>
              )}
              {product.color && (
                <div className="pd-detail">
                  <RiPaletteLine /> <span>Color: <strong>{product.color}</strong></span>
                </div>
              )}
              <div className="pd-detail">
                <RiShieldCheckLine /> <span>Condition: <strong>{product.condition}</strong></span>
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="pd-tags">
                {product.tags.map((tag, i) => (
                  <span key={i} className="badge badge-blue">#{tag}</span>
                ))}
              </div>
            )}

            {/* Owner Card */}
            <div className="pd-owner glass-card">
              <div className="pd-owner-avatar">
                {product.owner?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="pd-owner-info">
                <span className="pd-owner-name">{product.owner?.name}</span>
                {product.owner?.bio && (
                  <span className="pd-owner-bio">{product.owner.bio}</span>
                )}
              </div>
              {product.owner?.ratings?.average > 0 && (
                <div className="pd-owner-rating">
                  <RiStarFill /> {product.owner.ratings.average.toFixed(1)}
                </div>
              )}
            </div>

            {/* Booking Calendar */}
            {!isOwner && (product.pricing?.hourly != null || product.pricing?.nightly != null) && (
              <BookingCalendar
                pricing={product.pricing}
                onCheck={handleCheckAvailability}
                onBook={handleBook}
                checkResult={checkResult}
                loading={checkLoading}
              />
            )}

            {isOwner && (
              <div className="pd-owner-notice glass-card">
                <RiShieldCheckLine />
                <span>This is your listing. You cannot book your own item.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
