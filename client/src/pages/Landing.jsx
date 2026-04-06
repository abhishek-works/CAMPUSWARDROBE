import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiShirtLine, RiSearchLine, RiHandCoinLine, RiShieldCheckLine, RiArrowRightLine, RiGroupLine, RiStore2Line, RiRecycleLine, RiStarFill } from 'react-icons/ri';
import './Landing.css';

const CATEGORIES = [
  { name: 'Ethnic', emoji: '👘', desc: 'Sarees, lehengas, kurtas', color: '#ec4899' },
  { name: 'Western', emoji: '👗', desc: 'Dresses, tops, jeans', color: '#3b82f6' },
  { name: 'Formals', emoji: '👔', desc: 'Suits, blazers, shirts', color: '#8b5cf6' },
  { name: 'Sportswear', emoji: '🏃', desc: 'Jerseys, track suits', color: '#10b981' },
  { name: 'Accessories', emoji: '👜', desc: 'Bags, jewelry, watches', color: '#f59e0b' },
  { name: 'Costumes', emoji: '🎭', desc: 'Theme party & cosplay', color: '#ef4444' },
];

const STEPS = [
  {
    icon: <RiSearchLine />,
    title: 'Browse',
    desc: 'Explore clothes listed by students on your campus. Filter by style, size, and occasion.',
    color: 'var(--accent-violet)',
  },
  {
    icon: <RiHandCoinLine />,
    title: 'Book & Pay',
    desc: 'Select your dates, check availability, and book instantly. Choose hourly or nightly rates.',
    color: 'var(--accent-blue)',
  },
  {
    icon: <RiShieldCheckLine />,
    title: 'Meet & Wear',
    desc: 'Get your Meeting Pass with QR code. Meet the owner on campus, verify, and get your outfit!',
    color: 'var(--accent-cyan)',
  },
];

const STATS = [
  { icon: <RiGroupLine />, value: '21+', label: 'Campuses' },
  { icon: <RiStore2Line />, value: '∞', label: 'Listings' },
  { icon: <RiRecycleLine />, value: '100%', label: 'Sustainable' },
  { icon: <RiStarFill />, value: '4.9', label: 'Avg Rating' },
];

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing page" id="landing-page">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="container landing-hero-content">
          <div className="landing-hero-badge animate-fade-in">
            <RiShirtLine /> P2P Campus Fashion
          </div>
          <h1 className="landing-hero-title animate-fade-in-up">
            Rent & Lend Clothes<br />
            <span className="gradient-text">Within Your Campus</span>
          </h1>
          <p className="landing-hero-subtitle animate-fade-in-up">
            CampusWardrobe is the hyper-local clothing rental platform for college students. 
            Why buy when you can borrow? Access an entire wardrobe from your peers.
          </p>
          <div className="landing-hero-actions animate-fade-in-up">
            {isAuthenticated ? (
              <>
                <Link to="/browse" className="btn btn-primary btn-lg">
                  Browse Clothes <RiArrowRightLine />
                </Link>
                <Link to="/create" className="btn btn-secondary btn-lg">
                  List Your Item
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started <RiArrowRightLine />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="landing-hero-glow" />
      </section>

      {/* Stats */}
      <section className="landing-stats">
        <div className="container">
          <div className="landing-stats-grid stagger">
            {STATS.map((stat, i) => (
              <div key={i} className="landing-stat-card glass-card">
                <div className="landing-stat-icon">{stat.icon}</div>
                <div className="landing-stat-value">{stat.value}</div>
                <div className="landing-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-steps page-section">
        <div className="container">
          <div className="landing-section-header">
            <h2>How It <span className="gradient-text">Works</span></h2>
            <p>Three simple steps to transform your wardrobe experience</p>
          </div>
          <div className="landing-steps-grid stagger">
            {STEPS.map((step, i) => (
              <div key={i} className="landing-step-card glass-card">
                <div className="landing-step-number">{String(i + 1).padStart(2, '0')}</div>
                <div className="landing-step-icon" style={{ color: step.color }}>{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="landing-categories page-section">
        <div className="container">
          <div className="landing-section-header">
            <h2>Explore <span className="gradient-text">Categories</span></h2>
            <p>Find exactly what you need for any occasion</p>
          </div>
          <div className="landing-categories-grid stagger">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                to={isAuthenticated ? `/browse?category=${cat.name.toLowerCase()}` : '/register'}
                className="landing-category-card glass-card"
              >
                <span className="landing-category-emoji">{cat.emoji}</span>
                <h4>{cat.name}</h4>
                <p>{cat.desc}</p>
                <div className="landing-category-glow" style={{ background: cat.color }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta page-section">
        <div className="container">
          <div className="landing-cta-card">
            <h2>Ready to Transform Your <span className="gradient-text">Campus Fashion</span>?</h2>
            <p>Join thousands of students who are already sharing their wardrobe. Start renting or listing today.</p>
            <div className="landing-cta-actions">
              {isAuthenticated ? (
                <Link to="/browse" className="btn btn-primary btn-lg">
                  Start Browsing <RiArrowRightLine />
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Your Account <RiArrowRightLine />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
