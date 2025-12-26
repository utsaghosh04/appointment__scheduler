import React, { useState, useEffect } from 'react';
import appointmentService from './appointmentService';

/**
 * Appointment Management View Component
 * Integrates with appointment_service.py backend via JavaScript service layer
 * Implements filtering, status updates, and appointment creation
 */
const AppointmentManagementView = () => {
  // State management
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('Upcoming'); // 'Upcoming', 'Today', 'Past'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state for creating new appointments
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    date: '',
    time: '',
    duration: 30,
    doctorName: '',
    mode: 'In-Person',
    status: 'Scheduled'
  });

  /**
   * Initialize component with data from backend
   * Task 2.1: Data Fetching using useState/useEffect
   */
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call to Python get_appointments() function
        const data = appointmentService.get_appointments();
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  /**
   * Apply filters based on selected date and active tab
   */
  useEffect(() => {
    let filtered = [...appointments];

    // Task 2.2: Calendar Filtering - Filter by selected date
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(apt => apt.date === dateStr);
    }

    // Task 2.3: Tab Filtering - Filter by date relative to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === 'Today') {
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter(apt => apt.date === todayStr);
    } else if (activeTab === 'Upcoming') {
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter(apt => apt.date >= todayStr && apt.status !== 'Cancelled');
    } else if (activeTab === 'Past') {
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter(apt => apt.date < todayStr);
    }

    setFilteredAppointments(filtered);
  }, [appointments, selectedDate, activeTab]);

  /**
   * Task 2.2: Calendar Widget Click Handler
   * Sets selectedDate and filters appointments
   */
  const handleDateClick = (date) => {
    setSelectedDate(date);
    // Filter is applied in useEffect above
  };

  /**
   * Task 2.3: Tab Click Handler
   */
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedDate(null); // Clear date filter when switching tabs
  };

  /**
   * Task 2.4: Status Update Handler
   * Calls update_appointment_status() and refreshes state
   */
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      // Call Python update_appointment_status() function
      const updated = appointmentService.update_appointment_status(appointmentId, newStatus);
      
      if (updated) {
        // Refresh appointments list from backend (no direct state mutation)
        const refreshed = appointmentService.get_appointments();
        setAppointments(refreshed);
        // State will update via useEffect
      } else {
        setError('Appointment not found');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating appointment status:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Task 2.5: Create Appointment Handler
   * Calls create_appointment() and refreshes list
   */
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call Python create_appointment() function
      const newAppointment = appointmentService.create_appointment(formData);
      
      // Refresh appointments list from backend (no direct state mutation)
      const refreshed = appointmentService.get_appointments();
      setAppointments(refreshed);
      
      // Reset form
      setFormData({
        patientName: '',
        date: '',
        time: '',
        duration: 30,
        doctorName: '',
        mode: 'In-Person',
        status: 'Scheduled'
      });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
      console.error('Error creating appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  /**
   * Format time for display
   */
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status) => {
    const colors = {
      'Confirmed': 'bg-green-100 text-green-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Upcoming': 'bg-purple-100 text-purple-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Appointment Management</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              + New Appointment
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Calendar Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Calendar</h2>
              <div className="space-y-2">
                {/* Simple calendar widget - showing next 7 days */}
                {[...Array(7)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dateStr;
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = date.getDate();
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleDateClick(date)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-semibold">{dayName}</div>
                      <div className="text-sm">{dayNum}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex space-x-4 border-b">
                {['Upcoming', 'Today', 'Past'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={`px-6 py-2 font-semibold transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Appointment Form */}
            {showCreateForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Create New Appointment</h2>
                <form onSubmit={handleCreateAppointment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doctor Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.doctorName}
                        onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date * (YYYY-MM-DD)
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time * (HH:MM)
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        required
                        min="15"
                        step="15"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mode *
                      </label>
                      <select
                        required
                        value={formData.mode}
                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="In-Person">In-Person</option>
                        <option value="Virtual">Virtual</option>
                        <option value="Phone">Phone</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create Appointment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Appointments List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedDate ? `Appointments for ${formatDate(selectedDate.toISOString().split('T')[0])}` : `${activeTab} Appointments`}
              </h2>
              
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {appointment.patientName}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Doctor:</span> {appointment.doctorName}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {formatDate(appointment.date)}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {formatTime(appointment.time)}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {appointment.duration} min
                            </div>
                            <div>
                              <span className="font-medium">Mode:</span> {appointment.mode}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {/* Status Update Buttons */}
                          {appointment.status !== 'Confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'Confirmed')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Confirm
                            </button>
                          )}
                          {appointment.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'Cancelled')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Cancel
                            </button>
                          )}
                          {appointment.status === 'Scheduled' && (
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'Upcoming')}
                              className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                            >
                              Mark Upcoming
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagementView;

