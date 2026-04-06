import { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import MeetingPassModal from '../components/MeetingPassModal';
import { format } from 'date-fns';
import { RiCalendarCheckLine, RiCalendarLine, RiTimeLine, RiMoonLine, RiQrCodeLine, RiShoppingBagLine, RiStore2Line } from 'react-icons/ri';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState({ rentals: [], lentOut: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rentals');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/me');
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const currentData = activeTab === 'rentals' ? bookings.rentals : bookings.lentOut;

  if (loading) return <div className="page"><Loader /></div>;

  return (
    <div className="bookings-page page" id="my-bookings-page">
      <div className="container">
        <div className="bookings-header">
          <h1>My <span className="gradient-text">Bookings</span></h1>
          <p>Track your rentals and items you've lent out</p>
        </div>

        {/* Tabs */}
        <div className="bookings-tabs">
          <button
            className={`bookings-tab ${activeTab === 'rentals' ? 'bookings-tab-active' : ''}`}
            onClick={() => setActiveTab('rentals')}
            id="tab-rentals"
          >
            <RiShoppingBagLine /> My Rentals
            {bookings.rentals.length > 0 && (
              <span className="bookings-tab-count">{bookings.rentals.length}</span>
            )}
          </button>
          <button
            className={`bookings-tab ${activeTab === 'lentOut' ? 'bookings-tab-active' : ''}`}
            onClick={() => setActiveTab('lentOut')}
            id="tab-lent-out"
          >
            <RiStore2Line /> Lent Out
            {bookings.lentOut.length > 0 && (
              <span className="bookings-tab-count">{bookings.lentOut.length}</span>
            )}
          </button>
        </div>

        {/* Booking Cards */}
        {currentData.length === 0 ? (
          <div className="empty-state">
            <RiCalendarLine className="empty-state-icon" />
            <h3>{activeTab === 'rentals' ? 'No rentals yet' : 'No items lent out'}</h3>
            <p>{activeTab === 'rentals' ? 'Browse clothes and make your first booking!' : 'List an item to start earning from your wardrobe.'}</p>
          </div>
        ) : (
          <div className="bookings-list">
            {currentData.map((booking) => (
              <div key={booking._id} className="booking-card glass-card" id={`booking-${booking._id}`}>
                <div className="booking-card-image">
                  {booking.product?.images?.[0] ? (
                    <img src={booking.product.images[0]} alt={booking.product?.title} />
                  ) : (
                    <div className="booking-card-image-placeholder">
                      <RiShoppingBagLine />
                    </div>
                  )}
                </div>

                <div className="booking-card-info">
                  <div className="booking-card-top">
                    <h4>{booking.product?.title || 'Unknown Item'}</h4>
                    <span className={`badge status-${booking.status}`}>{booking.status}</span>
                  </div>

                  <div className="booking-card-meta">
                    <span className="booking-card-type">
                      {booking.type === 'hourly' ? <RiTimeLine /> : <RiMoonLine />}
                      {booking.type === 'hourly' ? 'Hourly' : 'Nightly'}
                    </span>
                    <span className="booking-card-dates">
                      <RiCalendarCheckLine />
                      {format(new Date(booking.timeSlot.start), 'MMM d, h:mm a')} →{' '}
                      {format(new Date(booking.timeSlot.end), 'MMM d, h:mm a')}
                    </span>
                  </div>

                  <div className="booking-card-bottom">
                    <span className="booking-card-price">₹{booking.totalPrice}</span>

                    {activeTab === 'rentals' && (
                      <div className="booking-card-person">
                        <span>Owner: {booking.owner?.name || 'Unknown'}</span>
                      </div>
                    )}
                    {activeTab === 'lentOut' && (
                      <div className="booking-card-person">
                        <span>Renter: {booking.renter?.name || 'Unknown'}</span>
                      </div>
                    )}

                    {booking.meetingPass?.code && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <RiQrCodeLine /> Meeting Pass
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meeting Pass Modal */}
      {selectedBooking && (
        <MeetingPassModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default MyBookings;
