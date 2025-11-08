import { useState, useEffect } from 'react';
import { appointmentsAPI } from '../services/api';

const AppointmentsList = ({ refreshTrigger }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [refreshTrigger]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await appointmentsAPI.getAllAppointments();
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments. Please try again.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setCancelingId(id);
      await appointmentsAPI.cancelAppointment(id);

      // Remove the cancelled appointment from the list
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));

      alert('Appointment cancelled successfully');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setCancelingId(null);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isPastAppointment = (dateTimeString) => {
    return new Date(dateTimeString) < new Date();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>All Appointments</h2>
        <p style={styles.loading}>Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>All Appointments</h2>
        <p style={styles.error}>{error}</p>
        <button onClick={fetchAppointments} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>All Appointments</h2>
        <button onClick={fetchAppointments} style={styles.refreshButton}>
          ↻ Refresh
        </button>
      </div>

      {appointments.length === 0 ? (
        <p style={styles.noAppointments}>
          No appointments scheduled yet. Book your first appointment above!
        </p>
      ) : (
        <div style={styles.list}>
          {appointments.map((appointment) => {
            const isPast = isPastAppointment(appointment.date_time);

            return (
              <div
                key={appointment.id}
                style={{
                  ...styles.appointmentCard,
                  ...(isPast ? styles.pastAppointment : {}),
                }}
              >
                <div style={styles.appointmentHeader}>
                  <div style={styles.dateTime}>
                    <strong>{formatDateTime(appointment.date_time)}</strong>
                    {isPast && <span style={styles.pastBadge}>Past</span>}
                  </div>
                  {!isPast && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      style={styles.cancelButton}
                      disabled={cancelingId === appointment.id}
                    >
                      {cancelingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>

                <div style={styles.appointmentDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>Name:</span>
                    <span style={styles.value}>{appointment.name}</span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.label}>Email:</span>
                    <span style={styles.value}>{appointment.email}</span>
                  </div>

                  {appointment.phone && (
                    <div style={styles.detailRow}>
                      <span style={styles.label}>Phone:</span>
                      <span style={styles.value}>{appointment.phone}</span>
                    </div>
                  )}

                  {appointment.reason && (
                    <div style={styles.detailRow}>
                      <span style={styles.label}>Reason:</span>
                      <span style={styles.value}>{appointment.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
    marginTop: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  retryButton: {
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
  noAppointments: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px 20px',
    fontSize: '16px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  appointmentCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    transition: 'box-shadow 0.2s',
  },
  pastAppointment: {
    opacity: 0.6,
    backgroundColor: '#f3f4f6',
  },
  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e5e7eb',
  },
  dateTime: {
    fontSize: '16px',
    color: '#1e40af',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pastBadge: {
    fontSize: '12px',
    padding: '2px 8px',
    backgroundColor: '#9ca3af',
    color: '#fff',
    borderRadius: '12px',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  appointmentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailRow: {
    display: 'flex',
    fontSize: '14px',
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    minWidth: '80px',
  },
  value: {
    color: '#6b7280',
  },
};

export default AppointmentsList;
