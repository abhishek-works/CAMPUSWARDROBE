import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { RiSearchLine, RiFilterLine, RiCloseLine, RiShirtLine } from 'react-icons/ri';
import './Browse.css';

const CATEGORIES = ['all', 'ethnic', 'western', 'formals', 'sportswear', 'accessories', 'footwear', 'costumes'];
const SIZES = ['all', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeCategory = searchParams.get('category') || 'all';
  const activeSize = searchParams.get('size') || 'all';

  const fetchProducts = async (pageNum = 1, reset = false) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 12 };
      if (activeCategory !== 'all') params.category = activeCategory;
      if (activeSize !== 'all') params.size = activeSize;

      const res = await api.get('/products', { params });

      if (reset) {
        setProducts(res.data);
      } else {
        setProducts((prev) => [...prev, ...res.data]);
      }
      setHasMore(res.data.length === 12);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [activeCategory, activeSize]);

  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProducts(next);
  };

  return (
    <div className="browse-page page" id="browse-page">
      <div className="container">
        {/* Page Header */}
        <div className="browse-header">
          <div>
            <h1>Browse <span className="gradient-text">Clothes</span></h1>
            <p>Discover outfits from students on your campus</p>
          </div>
          <button
            className="btn btn-secondary browse-filter-toggle"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <RiFilterLine /> Filters
          </button>
        </div>

        {/* Filters */}
        <div className={`browse-filters ${filterOpen ? 'browse-filters-open' : ''}`}>
          <div className="browse-filter-group">
            <label className="browse-filter-label">Category</label>
            <div className="browse-filter-chips">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`browse-chip ${activeCategory === cat ? 'browse-chip-active' : ''}`}
                  onClick={() => setFilter('category', cat)}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="browse-filter-group">
            <label className="browse-filter-label">Size</label>
            <div className="browse-filter-chips">
              {SIZES.map((size) => (
                <button
                  key={size}
                  className={`browse-chip ${activeSize === size ? 'browse-chip-active' : ''}`}
                  onClick={() => setFilter('size', size)}
                >
                  {size === 'all' ? 'All Sizes' : size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <Loader />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <RiShirtLine className="empty-state-icon" />
            <h3>No items found</h3>
            <p>No one from your campus has listed items in this category yet. Be the first!</p>
          </div>
        ) : (
          <>
            <div className="browse-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMore && (
              <div className="browse-load-more">
                <button className="btn btn-secondary" onClick={loadMore} disabled={loading}>
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Browse;
