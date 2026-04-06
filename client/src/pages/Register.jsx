import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CollegeSearch from '../components/CollegeSearch';
import { RiShirtLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [collegeQuery, setCollegeQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCollege) {
      setError('Please select your college');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, selectedCollege._id);
      toast.success('Welcome to CampusWardrobe!');
      navigate('/browse', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page" id="register-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <RiShirtLine />
            <span>Campus<span className="gradient-text">Wardrobe</span></span>
          </Link>
          <h2>Create Account</h2>
          <p>Join your campus fashion community</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              className="form-input"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">College</label>
            <CollegeSearch
              value={collegeQuery}
              onChange={setCollegeQuery}
              selectedCollege={selectedCollege}
              onSelect={setSelectedCollege}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">College Email</label>
            <input
              id="register-email"
              type="email"
              className="form-input"
              placeholder={selectedCollege ? `you@${selectedCollege.domain}` : 'you@college.edu'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {selectedCollege && (
              <span className="form-error" style={{ color: 'var(--text-muted)' }}>
                Must use your @{selectedCollege.domain} email
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              className="form-input"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} id="register-submit">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
