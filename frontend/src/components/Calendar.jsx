import { useState, useEffect } from 'react';
import { appointmentsAPI } from '../services/api';

const Calendar = ({ onSelectSlot }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    fetchAvailableSlots();
  }, [currentWeek]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = getStartOfWeek(currentWeek);
      const endDate = getEndOfWeek(currentWeek);

      const data = await appointmentsAPI.getAvailableSlots(
        formatDate(startDate),
        formatDate(endDate)
      );

      setAvailableSlots(data.available_slots || []);
    } catch (err) {
      setError('Failed to load available slots. Please try again.');
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getEndOfWeek = (date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 4);
    return end;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDayDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const slotsByDay = availableSlots.reduce((acc, slot) => {
    const dayDate = formatDayDate(slot.date_time);
    if (!acc[dayDate]) {
      acc[dayDate] = [];
    }
    acc[dayDate].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Available Time Slots</h2>
        <p style={styles.loading}>Loading available slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Available Time Slots</h2>
        <p style={styles.error}>{error}</p>
        <button onClick={fetchAvailableSlots} style={styles.button}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Available Time Slots</h2>
        <div style={styles.navigation}>
          <button onClick={goToPreviousWeek} style={styles.navButton}>
            ← Previous Week
          </button>
          <button onClick={goToCurrentWeek} style={styles.navButton}>
            Current Week
          </button>
          <button onClick={goToNextWeek} style={styles.navButton}>
            Next Week →
          </button>
        </div>
      </div>

      {availableSlots.length === 0 ? (
        <p style={styles.noSlots}>
          No available slots for this week. Try selecting a different week.
        </p>
      ) : (
        <div style={styles.grid}>
          {Object.entries(slotsByDay).map(([day, slots]) => (
            <div key={day} style={styles.dayColumn}>
              <h3 style={styles.dayHeader}>{day}</h3>
              <div style={styles.slotsContainer}>
                {slots.map((slot) => (
                  <button
                    key={slot.date_time}
                    onClick={() => onSelectSlot(slot)}
                    style={styles.slotButton}
                  >
                    {formatTime(slot.date_time)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  navigation: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  navButton: {
    padding: '8px 16px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
  },
  dayColumn: {
    backgroundColor: '#f9fafb',
    padding: '15px',
    borderRadius: '6px',
  },
  dayHeader: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#374151',
  },
  slotsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  slotButton: {
    padding: '10px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '20px',
  },
  error: {
    color: '#ef4444',
    padding: '10px',
    backgroundColor: '#fee2e2',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  noSlots: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '30px',
    fontSize: '16px',
  },
};

export default Calendar;
