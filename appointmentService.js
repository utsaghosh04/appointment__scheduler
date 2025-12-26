/**
 * Appointment Service - JavaScript implementation
 * Mirrors the Python appointment_service.py API for React integration
 * Simulates AppSync/GraphQL API and PostgreSQL data layer
 */

class AppointmentService {
  constructor() {
    this._appointments = this._generateMockAppointments();
  }

  _generateMockAppointments() {
    const today = new Date();
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    return [
      {
        id: "apt-001",
        patientName: "patient_A",
        date: formatDate(addDays(today, 1)),
        time: "09:00",
        duration: 30,
        doctorName: "Dr. A",
        status: "Confirmed",
        mode: "In-Person"
      },
      {
        id: "apt-002",
        patientName: "patient_B",
        date: formatDate(addDays(today, 1)),
        time: "10:30",
        duration: 45,
        doctorName: "Dr. A",
        status: "Scheduled",
        mode: "Virtual"
      },
      {
        id: "apt-003",
        patientName: "patient_C",
        date: formatDate(addDays(today, 2)),
        time: "14:00",
        duration: 60,
        doctorName: "Dr. B",
        status: "Upcoming",
        mode: "In-Person"
      },
      {
        id: "apt-004",
        patientName: "patient_D",
        date: formatDate(addDays(today, 2)),
        time: "15:30",
        duration: 30,
        doctorName: "Dr. B",
        status: "Confirmed",
        mode: "Phone"
      },
      {
        id: "apt-005",
        patientName: "patient_E",
        date: formatDate(addDays(today, 3)),
        time: "11:00",
        duration: 45,
        doctorName: "Dr. A",
        status: "Scheduled",
        mode: "Virtual"
      },
      {
        id: "apt-006",
        patientName: "patient_F",
        date: formatDate(addDays(today, 3)),
        time: "13:00",
        duration: 30,
        doctorName: "Dr. A",
        status: "Upcoming",
        mode: "In-Person"
      },
      {
        id: "apt-007",
        patientName: "patient_G",
        date: formatDate(addDays(today, 4)),
        time: "09:30",
        duration: 60,
        doctorName: "Dr. B",
        status: "Confirmed",
        mode: "In-Person"
      },
      {
        id: "apt-008",
        patientName: "patient_H",
        date: formatDate(addDays(today, 5)),
        time: "10:00",
        duration: 30,
        doctorName: "Dr. A",
        status: "Cancelled",
        mode: "Virtual"
      },
      {
        id: "apt-009",
        patientName: "patient_I",
        date: formatDate(addDays(today, 5)),
        time: "14:30",
        duration: 45,
        doctorName: "Dr. B",
        status: "Scheduled",
        mode: "In-Person"
      },
      {
        id: "apt-010",
        patientName: "patient_J",
        date: formatDate(addDays(today, 6)),
        time: "16:00",
        duration: 30,
        doctorName: "Dr. A",
        status: "Upcoming",
        mode: "Phone"
      },
      {
        id: "apt-011",
        patientName: "patient_K",
        date: formatDate(addDays(today, 7)),
        time: "08:00",
        duration: 60,
        doctorName: "Dr. B",
        status: "Confirmed",
        mode: "In-Person"
      },
      {
        id: "apt-012",
        patientName: "patient_L",
        date: formatDate(addDays(today, 1)),
        time: "11:30",
        duration: 30,
        doctorName: "Dr. A",
        status: "Scheduled",
        mode: "Virtual"
      },
    ];
  }

  get_appointments(filters = {}) {
    /**
     * Query appointments with optional filtering
     * @param {Object} filters - Optional filters: { date?: string, status?: string, doctorName?: string }
     * @returns {Array} List of appointment objects matching filters
     */
    let filtered = [...this._appointments];

    if (filters.date) {
      filtered = filtered.filter(apt => apt.date === filters.date);
    }

    if (filters.status) {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    if (filters.doctorName) {
      filtered = filtered.filter(apt => apt.doctorName === filters.doctorName);
    }

    return filtered;
  }

  update_appointment_status(appointment_id, new_status) {
    /**
     * Update the status of an appointment
     * @param {string} appointment_id - Unique identifier
     * @param {string} new_status - New status (Confirmed, Scheduled, Upcoming, Cancelled)
     * @returns {Object|null} Updated appointment or null if not found
     */
    const valid_statuses = ["Confirmed", "Scheduled", "Upcoming", "Cancelled"];
    if (!valid_statuses.includes(new_status)) {
      throw new Error(`Invalid status: ${new_status}. Must be one of ${valid_statuses.join(', ')}`);
    }

    const appointment = this._appointments.find(apt => apt.id === appointment_id);
    if (appointment) {
      appointment.status = new_status;
      return { ...appointment };
    }

    return null;
  }

  create_appointment(payload) {
    /**
     * Create a new appointment with validation and conflict detection
     * @param {Object} payload - Appointment data
     * @returns {Object} Created appointment
     */
    const required_fields = ["patientName", "date", "time", "duration", "doctorName", "mode"];
    const missing_fields = required_fields.filter(field => !payload[field]);

    if (missing_fields.length > 0) {
      throw new Error(`Missing required fields: ${missing_fields.join(', ')}`);
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(payload.date)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(payload.time)) {
      throw new Error("Invalid time format. Expected HH:MM");
    }

    // Validate duration
    if (!Number.isInteger(payload.duration) || payload.duration <= 0) {
      throw new Error("Duration must be a positive integer (minutes)");
    }

    // Check for time conflicts
    const { doctorName, date, time, duration } = payload;
    const newStart = new Date(`${date}T${time}`);
    const newEnd = new Date(newStart.getTime() + duration * 60000);

    for (const existing of this._appointments) {
      if (
        existing.doctorName === doctorName &&
        existing.date === date &&
        existing.status !== "Cancelled"
      ) {
        const existingStart = new Date(`${date}T${existing.time}`);
        const existingEnd = new Date(existingStart.getTime() + existing.duration * 60000);

        // Check for overlap
        if (!(newEnd <= existingStart || newStart >= existingEnd)) {
          throw new Error(
            `Time conflict detected. Doctor ${doctorName} already has an appointment ` +
            `from ${existing.time} to ${existingEnd.toTimeString().slice(0, 5)} on ${date}`
          );
        }
      }
    }

    // Generate unique ID
    const appointment_id = `apt-${Math.random().toString(36).substr(2, 8)}`;

    // Set default status
    const status = payload.status || "Scheduled";

    const valid_statuses = ["Confirmed", "Scheduled", "Upcoming", "Cancelled"];
    if (!valid_statuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of ${valid_statuses.join(', ')}`);
    }

    // Create new appointment
    const new_appointment = {
      id: appointment_id,
      patientName: payload.patientName,
      date: payload.date,
      time: payload.time,
      duration: payload.duration,
      doctorName: payload.doctorName,
      status: status,
      mode: payload.mode
    };

    this._appointments.push(new_appointment);
    return { ...new_appointment };
  }

  delete_appointment(appointment_id) {
    /**
     * Delete an appointment by ID
     * @param {string} appointment_id - Unique identifier
     * @returns {boolean} True if deleted, false if not found
     */
    const index = this._appointments.findIndex(apt => apt.id === appointment_id);
    if (index !== -1) {
      this._appointments.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Export singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;

