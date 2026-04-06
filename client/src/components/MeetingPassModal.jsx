import { RiCloseLine, RiQrCodeLine, RiShieldCheckLine, RiTimeLine } from 'react-icons/ri';
import { format } from 'date-fns';
import './MeetingPassModal.css';

const MeetingPassModal = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="meeting-pass-modal">
      <div className="modal-content meeting-pass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <RiCloseLine />
        </button>

        <div className="mp-header">
          <RiShieldCheckLine className="mp-icon" />
          <h3>Meeting Pass</h3>
          <p>Show this to the owner when you meet</p>
        </div>

        <div className="mp-qr-section">
          {booking.meetingPass?.qrData ? (
            <img src={booking.meetingPass.qrData} alt="Meeting Pass QR Code" className="mp-qr-image" />
          ) : (
            <div className="mp-qr-placeholder">
              <RiQrCodeLine />
              <span>QR code not available</span>
            </div>
          )}
        </div>

        <div className="mp-code">
          <span className="mp-code-label">Meeting Code</span>
          <span className="mp-code-value">{booking.meetingPass?.code || 'N/A'}</span>
        </div>

        <div className="mp-details">
          <div className="mp-detail-row">
            <span className="mp-detail-label">Item</span>
            <span className="mp-detail-value">{booking.product?.title || 'Unknown'}</span>
          </div>
          <div className="mp-detail-row">
            <span className="mp-detail-label">Type</span>
            <span className="mp-detail-value">{booking.type === 'hourly' ? 'Hourly' : 'Nightly'}</span>
          </div>
          <div className="mp-detail-row">
            <span className="mp-detail-label">From</span>
            <span className="mp-detail-value">{format(new Date(booking.timeSlot.start), 'MMM d, h:mm a')}</span>
          </div>
          <div className="mp-detail-row">
            <span className="mp-detail-label">Until</span>
            <span className="mp-detail-value">{format(new Date(booking.timeSlot.end), 'MMM d, h:mm a')}</span>
          </div>
          <div className="mp-detail-row mp-detail-total">
            <span className="mp-detail-label">Total</span>
            <span className="mp-detail-value">₹{booking.totalPrice}</span>
          </div>
        </div>

        <div className="mp-status">
          <span className={`badge status-${booking.status}`}>{booking.status}</span>
          {booking.meetingPass?.isRedeemed && (
            <span className="badge badge-green">Redeemed</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingPassModal;
