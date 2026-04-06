import { Link } from 'react-router-dom';
import { RiShirtLine, RiHeartLine, RiGithubLine } from 'react-icons/ri';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <RiShirtLine />
            <span>Campus<span className="gradient-text">Wardrobe</span></span>
          </Link>
          <p className="footer-tagline">Rent & lend clothes within your campus. Sustainable fashion for students.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/browse">Browse</Link>
            <Link to="/create">List an Item</Link>
            <Link to="/bookings">My Bookings</Link>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">How It Works</a>
            <a href="#">Safety Guide</a>
            <a href="#">Contact Us</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Made with <RiHeartLine className="footer-heart" /> for students, by students</p>
          <p className="footer-copy">&copy; {new Date().getFullYear()} CampusWardrobe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
