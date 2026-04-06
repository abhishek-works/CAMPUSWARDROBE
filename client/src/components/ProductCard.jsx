import { Link } from 'react-router-dom';
import { RiTimeLine, RiMoonLine, RiStarFill } from 'react-icons/ri';
import './ProductCard.css';

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%231a1a2e" width="400" height="400"/%3E%3Ctext fill="%234a4a6a" font-family="sans-serif" font-size="40" text-anchor="middle" x="200" y="210"%3ENo Image%3C/text%3E%3C/svg%3E';

const CATEGORY_COLORS = {
  ethnic: 'badge-pink',
  western: 'badge-blue',
  formals: 'badge-violet',
  sportswear: 'badge-green',
  accessories: 'badge-amber',
  footwear: 'badge-red',
  costumes: 'badge-pink',
};

const ProductCard = ({ product }) => {
  const imgSrc = product.images?.[0] || PLACEHOLDER_IMG;
  const hourly = product.pricing?.hourly;
  const nightly = product.pricing?.nightly;
  const ownerName = product.owner?.name || 'Unknown';
  const ownerInitial = ownerName.charAt(0).toUpperCase();

  return (
    <Link to={`/product/${product._id}`} className="product-card glass-card" id={`product-${product._id}`}>
      <div className="product-card-image-wrap">
        <img src={imgSrc} alt={product.title} className="product-card-image" loading="lazy" />
        <span className={`badge product-card-category ${CATEGORY_COLORS[product.category] || 'badge-violet'}`}>
          {product.category}
        </span>
        {product.condition && product.condition !== 'good' && (
          <span className="badge badge-green product-card-condition">{product.condition}</span>
        )}
      </div>

      <div className="product-card-body">
        <h4 className="product-card-title">{product.title}</h4>

        <div className="product-card-meta">
          {product.size && <span className="product-card-size">{product.size}</span>}
          {product.brand && <span className="product-card-brand">{product.brand}</span>}
        </div>

        <div className="product-card-pricing">
          {hourly != null && (
            <div className="product-card-price">
              <RiTimeLine />
              <span>₹{hourly}<small>/hr</small></span>
            </div>
          )}
          {nightly != null && (
            <div className="product-card-price">
              <RiMoonLine />
              <span>₹{nightly}<small>/night</small></span>
            </div>
          )}
        </div>

        <div className="product-card-owner">
          <div className="product-card-owner-avatar">{ownerInitial}</div>
          <span className="product-card-owner-name">{ownerName}</span>
          {product.owner?.ratings?.average > 0 && (
            <span className="product-card-rating">
              <RiStarFill /> {product.owner.ratings.average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
