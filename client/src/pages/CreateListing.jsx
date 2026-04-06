import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { RiImageAddLine, RiCloseLine, RiShirtLine } from 'react-icons/ri';
import './CreateListing.css';

const CATEGORIES = ['ethnic', 'western', 'formals', 'sportswear', 'accessories', 'footwear', 'costumes'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CONDITIONS = ['new', 'like-new', 'good', 'fair'];

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    size: '',
    brand: '',
    color: '',
    condition: 'good',
    hourlyPrice: '',
    nightlyPrice: '',
    tags: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    if (!form.size) {
      toast.error('Please select a size');
      return;
    }
    if (!form.hourlyPrice && !form.nightlyPrice) {
      toast.error('Please set at least one pricing option');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('size', form.size);
      formData.append('brand', form.brand);
      formData.append('color', form.color);
      formData.append('condition', form.condition);

      const pricing = {};
      if (form.hourlyPrice) pricing.hourly = Number(form.hourlyPrice);
      if (form.nightlyPrice) pricing.nightly = Number(form.nightlyPrice);
      formData.append('pricingStr', JSON.stringify(pricing));

      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      formData.append('tagsStr', JSON.stringify(tags));

      images.forEach((img) => formData.append('images', img));

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Listing created successfully!');
      navigate('/my-listings');
    } catch (err) {
      const msg = err.response?.data || 'Failed to create listing';
      toast.error(typeof msg === 'string' ? msg : 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page page" id="create-listing-page">
      <div className="container">
        <div className="create-header">
          <RiShirtLine className="create-header-icon" />
          <h1>List an <span className="gradient-text">Item</span></h1>
          <p>Share your clothes with your campus community</p>
        </div>

        <form className="create-form glass-card" onSubmit={handleSubmit} id="create-listing-form">
          {/* Images */}
          <div className="create-section">
            <h3>Photos</h3>
            <p className="create-section-desc">Add up to 5 photos. First photo will be the cover.</p>
            <div className="create-images">
              {previews.map((preview, i) => (
                <div key={i} className="create-image-preview">
                  <img src={preview} alt={`Preview ${i + 1}`} />
                  <button type="button" className="create-image-remove" onClick={() => removeImage(i)}>
                    <RiCloseLine />
                  </button>
                  {i === 0 && <span className="create-image-cover-badge">Cover</span>}
                </div>
              ))}
              {images.length < 5 && (
                <label className="create-image-upload" htmlFor="image-upload">
                  <RiImageAddLine />
                  <span>Add Photo</span>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="create-section">
            <h3>Basic Info</h3>
            <div className="create-grid">
              <div className="form-group create-full">
                <label className="form-label" htmlFor="create-title">Title *</label>
                <input
                  id="create-title"
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Blue Silk Saree"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-group create-full">
                <label className="form-label" htmlFor="create-description">Description</label>
                <textarea
                  id="create-description"
                  name="description"
                  className="form-textarea"
                  placeholder="Describe your item — material, occasion, fit notes..."
                  value={form.description}
                  onChange={handleChange}
                  maxLength={500}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" className="form-select" value={form.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Size *</label>
                <select name="size" className="form-select" value={form.size} onChange={handleChange} required>
                  <option value="">Select size</option>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="create-brand">Brand</label>
                <input
                  id="create-brand"
                  name="brand"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Zara, FabIndia"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="create-color">Color</label>
                <input
                  id="create-color"
                  name="color"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Navy Blue"
                  value={form.color}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Condition</label>
                <select name="condition" className="form-select" value={form.condition} onChange={handleChange}>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="create-section">
            <h3>Pricing</h3>
            <p className="create-section-desc">Set at least one pricing option. Both are recommended.</p>
            <div className="create-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="create-hourly">Hourly Rate (₹)</label>
                <input
                  id="create-hourly"
                  name="hourlyPrice"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 50"
                  value={form.hourlyPrice}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="create-nightly">Nightly Rate (₹)</label>
                <input
                  id="create-nightly"
                  name="nightlyPrice"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 200"
                  value={form.nightlyPrice}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="create-section">
            <h3>Tags</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="create-tags">Tags (comma separated)</label>
              <input
                id="create-tags"
                name="tags"
                type="text"
                className="form-input"
                placeholder="e.g. wedding, party, formal, vintage"
                value={form.tags}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary btn-lg create-submit" disabled={loading} id="create-submit">
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
