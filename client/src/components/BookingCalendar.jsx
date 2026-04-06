import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { RiArrowLeftSLine, RiArrowRightSLine, RiTimeLine, RiMoonLine, RiCheckLine } from 'react-icons/ri';
import './BookingCalendar.css';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  return { value: i, label: `${h}:00 ${ampm}` };
});

const BookingCalendar = ({ pricing, onCheck, onBook, checkResult, loading }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingType, setBookingType] = useState(pricing?.hourly != null ? 'hourly' : 'nightly');
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(12);
  const [endDate, setEndDate] = useState(null);

  const today = startOfDay(new Date());

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDateCal = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;
    while (day <= endDateCal) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const handleDateClick = (day) => {
    if (isBefore(day, today)) return;

    if (bookingType === 'nightly' && selectedDate && !endDate && !isSameDay(day, selectedDate) && !isBefore(day, selectedDate)) {
      setEndDate(day);
    } else {
      setSelectedDate(day);
      setEndDate(null);
    }
  };

  const isInRange = (day) => {
    if (!selectedDate || !endDate) return false;
    return day > selectedDate && day < endDate;
  };

  const handleCheckAvailability = () => {
    if (!selectedDate) return;

    let start, end;

    if (bookingType === 'hourly') {
      start = new Date(selectedDate);
      start.setHours(startHour, 0, 0, 0);
      end = new Date(selectedDate);
      end.setHours(endHour, 0, 0, 0);
    } else {
      start = new Date(selectedDate);
      start.setHours(18, 0, 0, 0); // 6 PM check-in
      end = new Date(endDate || addDays(selectedDate, 1));
      end.setHours(10, 0, 0, 0); // 10 AM checkout
    }

    onCheck?.({
      start: start.toISOString(),
      end: end.toISOString(),
      type: bookingType,
    });
  };

  const handleBook = () => {
    if (!selectedDate || !checkResult?.available) return;

    let start, end;

    if (bookingType === 'hourly') {
      start = new Date(selectedDate);
      start.setHours(startHour, 0, 0, 0);
      end = new Date(selectedDate);
      end.setHours(endHour, 0, 0, 0);
    } else {
      start = new Date(selectedDate);
      start.setHours(18, 0, 0, 0);
      end = new Date(endDate || addDays(selectedDate, 1));
      end.setHours(10, 0, 0, 0);
    }

    onBook?.({
      start: start.toISOString(),
      end: end.toISOString(),
      type: bookingType,
      totalPrice: checkResult.totalPrice,
    });
  };

  const canCheck = bookingType === 'hourly'
    ? selectedDate && startHour < endHour
    : selectedDate && (endDate || true);

  return (
    <div className="booking-calendar" id="booking-calendar">
      {/* Type Toggle */}
      <div className="bc-type-toggle">
        {pricing?.hourly != null && (
          <button
            className={`bc-type-btn ${bookingType === 'hourly' ? 'bc-type-active' : ''}`}
            onClick={() => { setBookingType('hourly'); setEndDate(null); }}
          >
            <RiTimeLine /> Hourly <span className="bc-type-price">₹{pricing.hourly}/hr</span>
          </button>
        )}
        {pricing?.nightly != null && (
          <button
            className={`bc-type-btn ${bookingType === 'nightly' ? 'bc-type-active' : ''}`}
            onClick={() => setBookingType('nightly')}
          >
            <RiMoonLine /> Nightly <span className="bc-type-price">₹{pricing.nightly}/night</span>
          </button>
        )}
      </div>

      {/* Calendar Header */}
      <div className="bc-header">
        <button className="bc-nav-btn" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <RiArrowLeftSLine />
        </button>
        <h4 className="bc-month-label">{format(currentMonth, 'MMMM yyyy')}</h4>
        <button className="bc-nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <RiArrowRightSLine />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="bc-weekdays">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="bc-weekday">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="bc-days">
        {calendarDays.map((day, i) => {
          const isPast = isBefore(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isEnd = endDate && isSameDay(day, endDate);
          const inRange = isInRange(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={i}
              className={`bc-day 
                ${!isCurrentMonth ? 'bc-day-outside' : ''} 
                ${isPast ? 'bc-day-past' : ''} 
                ${isSelected ? 'bc-day-selected' : ''} 
                ${isEnd ? 'bc-day-end' : ''} 
                ${inRange ? 'bc-day-range' : ''} 
                ${isToday(day) ? 'bc-day-today' : ''}`}
              onClick={() => handleDateClick(day)}
              disabled={isPast}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Time Selectors (hourly) */}
      {bookingType === 'hourly' && selectedDate && (
        <div className="bc-time-selectors">
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <select className="form-select" value={startHour} onChange={(e) => setStartHour(Number(e.target.value))}>
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <select className="form-select" value={endHour} onChange={(e) => setEndHour(Number(e.target.value))}>
              {HOURS.filter((h) => h.value > startHour).map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Nightly info */}
      {bookingType === 'nightly' && selectedDate && (
        <div className="bc-nightly-info">
          <p>Check-in: <strong>{format(selectedDate, 'MMM d')} at 6:00 PM</strong></p>
          <p>Check-out: <strong>{format(endDate || addDays(selectedDate, 1), 'MMM d')} at 10:00 AM</strong></p>
          {!endDate && <p className="bc-nightly-hint">Click another date for multi-night rental</p>}
        </div>
      )}

      {/* Check & Book Buttons */}
      <div className="bc-actions">
        <button
          className="btn btn-secondary"
          onClick={handleCheckAvailability}
          disabled={!canCheck || loading}
        >
          {loading ? 'Checking...' : 'Check Availability'}
        </button>

        {checkResult && (
          <div className={`bc-result ${checkResult.available ? 'bc-result-available' : 'bc-result-unavailable'}`}>
            {checkResult.available ? (
              <>
                <RiCheckLine /> Available — <strong>₹{checkResult.totalPrice}</strong> total
              </>
            ) : (
              <>{checkResult.msg || 'Time slot unavailable'}</>
            )}
          </div>
        )}

        {checkResult?.available && (
          <button className="btn btn-primary btn-lg" onClick={handleBook} disabled={loading}>
            {loading ? 'Booking...' : `Book Now — ₹${checkResult.totalPrice}`}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
