import { useState } from 'react';
import Calendar from './components/Calendar';
import BookingForm from './components/BookingForm';
import AppointmentsList from './components/AppointmentsList';
import './App.css';

function App() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookingSuccess = () => {
    setSelectedSlot(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCancelBooking = () => {
    setSelectedSlot(null);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>Appointment Booking System</h1>
        <p style={styles.subtitle}>
          Book your appointments easily - Available Monday to Friday, 9:00 AM - 5:00 PM
        </p>
      </header>

      <main style={styles.main}>
        {selectedSlot ? (
          <BookingForm
            selectedSlot={selectedSlot}
            onSuccess={handleBookingSuccess}
            onCancel={handleCancelBooking}
          />
        ) : (
          <Calendar onSelectSlot={handleSlotSelect} />
        )}

        <AppointmentsList refreshTrigger={refreshKey} />
      </main>

      <footer style={styles.footer}>
        <p>© 2025 Appointment Booking System</p>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#6366f1',
    color: '#fff',
    padding: '30px 20px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '16px',
    margin: 0,
    opacity: 0.9,
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  footer: {
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    textAlign: 'center',
    padding: '20px',
    marginTop: '50px',
  },
};

export default App;
