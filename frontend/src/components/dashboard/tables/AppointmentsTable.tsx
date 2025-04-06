import React, { useState, useEffect } from 'react';
import { getAppointments } from '../../../services/api';
import './AppointmentsTable.scss';

interface AppointmentData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sel_time: string;
  duration: number;
  created_at: string;
}

const formatDate = (dateTimeString: string): string => {
  // Handle ISO date format or other formats from the API
  try {
    if (dateTimeString.includes('T')) {
      // ISO format with timezone
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } else {
      // Already formatted date or unknown format
      return dateTimeString;
    }
  } catch (error) {
    return dateTimeString;
  }
};

const formatTime = (dateTimeString: string): string => {
  try {
    if (dateTimeString.includes('T')) {
      // ISO format with timezone
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      // Just return the time part if it's already formatted
      return dateTimeString.split('T')[1]?.substring(0, 5) || dateTimeString;
    }
  } catch (error) {
    return dateTimeString;
  }
};

const AppointmentsTable: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const result = await getAppointments();
        setAppointments(result.appointments || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (isLoading) {
    return <div className="appointments-table-loading">Loading latest appointments...</div>;
  }

  if (error) {
    return <div className="appointments-table-error">{error}</div>;
  }

  if (appointments.length === 0) {
    return <div className="appointments-table-empty">No appointments found.</div>;
  }

  return (
    <div className="appointments-table-container">
      <table className="appointments-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {appointments.slice(0, 5).map((appointment) => (
            <tr key={appointment.id}>
              <td>{`${appointment.first_name} ${appointment.last_name}`}</td>
              <td>{formatDate(appointment.sel_time)}</td>
              <td>{formatTime(appointment.sel_time)}</td>
              <td>{appointment.email}</td>
              <td>{appointment.phone}</td>
              <td>{appointment.duration} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsTable; 