import { useState } from 'react';
import { appointmentsAPI } from '../services/api';

const BookingForm = ({ selectedSlot, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = [];

    if (!formData.name.trim()) {
      newErrors.push('Name is required');
    }

    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('Email is invalid');
    }

    if (formData.reason && formData.reason.length > 200) {
      newErrors.push('Reason must be 200 characters or less');
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors([]);

      const appointmentData = {
        ...formData,
        date_time: selectedSlot.date_time,
      };

      await appointmentsAPI.createAppointment(appointmentData);

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error creating appointment:', error);

      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors(['Failed to book appointment. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successMessage}>
          <h2 style={styles.successTitle}>Appointment Booked!</h2>
          <p>Your appointment has been successfully scheduled.</p>
          <p style={styles.appointmentDetails}>
            <strong>{formatDateTime(selectedSlot.date_time)}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Book Appointment</h2>
        <button onClick={onCancel} style={styles.closeButton}>
          ✕
        </button>
      </div>

      <div style={styles.selectedSlot}>
        <strong>Selected Time:</strong>
        <br />
        {formatDateTime(selectedSlot.date_time)}
      </div>

      {errors.length > 0 && (
        <div style={styles.errorContainer}>
          {errors.map((error, index) => (
            <p key={index} style={styles.error}>
              {error}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>
            Name <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>
            Email <span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.label}>
            Phone <span style={styles.optional}>(optional)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={styles.input}
            placeholder="e.g., +1 234 567 8900"
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="reason" style={styles.label}>
            Reason/Notes <span style={styles.optional}>(optional, max 200 chars)</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            style={styles.textarea}
            maxLength={200}
            rows={4}
            placeholder="Brief description of the appointment..."
          />
          <div style={styles.charCount}>
            {formData.reason.length}/200 characters
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={onCancel}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '30px',
    maxWidth: '500px',
    margin: '20px auto',
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
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0',
    width: '30px',
    height: '30px',
  },
  selectedSlot: {
    backgroundColor: '#eff6ff',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    color: '#1e40af',
    fontSize: '14px',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '20px',
  },
  error: {
    color: '#991b1b',
    margin: '5px 0',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151',
    fontSize: '14px',
  },
  required: {
    color: '#ef4444',
  },
  optional: {
    color: '#6b7280',
    fontWeight: 'normal',
    fontSize: '12px',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  charCount: {
    textAlign: 'right',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '5px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  successMessage: {
    textAlign: 'center',
    padding: '30px',
  },
  successTitle: {
    color: '#10b981',
    fontSize: '28px',
    marginBottom: '15px',
  },
  appointmentDetails: {
    color: '#1e40af',
    fontSize: '16px',
    marginTop: '15px',
  },
};

export default BookingForm;
