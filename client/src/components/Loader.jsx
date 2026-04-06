import './Loader.css';

const Loader = ({ fullScreen = false, size = 'md' }) => {
  return (
    <div className={`loader-container ${fullScreen ? 'loader-fullscreen' : ''}`}>
      <div className={`loader-spinner loader-${size}`}>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
      </div>
    </div>
  );
};

export default Loader;
