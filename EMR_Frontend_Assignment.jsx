import React, { useState, useEffect } from 'react';
const API_BASE_URL = 'http://localhost:8000';

const SLOT_HEIGHT = 80;

const AppointmentManagementView = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Day'); // 'Day', 'Week', 'Month'
  const [activeTab, setActiveTab] = useState('Today'); // 'Upcoming', 'Today', 'Past'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAppointments = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.status) params.append('status', filters.status);
      if (filters.doctorName) params.append('doctorName', filters.doctorName);

      const url = `${API_BASE_URL}/appointments${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch appointments' }));
        throw new Error(errorData.detail || 'Failed to fetch appointments');
      }
      
      return await response.json();
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch appointments');
    }
  };

  const createAppointment = async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to create appointment' }));
        throw new Error(errorData.detail || 'Failed to create appointment');
      }

      return await response.json();
    } catch (err) {
      throw new Error(err.message || 'Failed to create appointment');
    }
  };

  const updateAppointmentStatus = async (appointment_id, new_status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointment_id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: new_status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to update appointment' }));
        throw new Error(errorData.detail || 'Failed to update appointment');
      }

      return await response.json();
    } catch (err) {
      throw new Error(err.message || 'Failed to update appointment');
    }
  };

  const deleteAppointment = async (appointment_id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointment_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to delete appointment' }));
        throw new Error(errorData.detail || 'Failed to delete appointment');
      }

      return await response.json();
    } catch (err) {
      throw new Error(err.message || 'Failed to delete appointment');
    }
  };
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    date: '',
    startTime: '08:30',
    endTime: '09:30',
    duration: 30,
    doctorName: '',
    phone: '',
    email: '',
    abhaId: '',
    purpose: '',
    status: 'Scheduled'
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAppointments();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getAppointmentsForView = () => {
    let filteredAppointments = [...appointments];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Apply tab filtering first
    if (activeTab === 'Today') {
      filteredAppointments = filteredAppointments.filter(apt => apt.date === todayStr);
    } else if (activeTab === 'Past') {
      filteredAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T00:00:00');
        aptDate.setHours(0, 0, 0, 0);
        return aptDate < today;
      });
    } else if (activeTab === 'Upcoming') {
      filteredAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T00:00:00');
        aptDate.setHours(0, 0, 0, 0);
        // appointments with "Upcoming" status OR future dates
        return apt.status === 'Upcoming' || aptDate > today;
      });
    }

    // applying view mode filtering
    if (viewMode === 'Day') {
      const dateStr = currentDate.toISOString().split('T')[0];
      return filteredAppointments.filter(apt => apt.date === dateStr);
    } else if (viewMode === 'Week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T00:00:00');
        return aptDate >= startOfWeek && aptDate <= endOfWeek;
      });
    } else if (viewMode === 'Month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      return filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T00:00:00');
        return aptDate.getFullYear() === year && aptDate.getMonth() === month;
      });
    }
    return filteredAppointments;
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // calculatingduration from start and end time
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;
      const calculatedDuration = endTotal - startTotal;

      // preparing payload for backend
      const payload = {
        patientName: formData.patientName,
        date: formData.date || currentDate.toISOString().split('T')[0],
        time: formData.startTime,
        duration: calculatedDuration > 0 ? calculatedDuration : formData.duration,
        doctorName: formData.doctorName,
        mode: 'In-Person',
        status: formData.status
      };

      await createAppointment(payload);
      const refreshed = await getAppointments();
      setAppointments(refreshed);
      
      // Reset form
      setFormData({
        patientName: '',
        date: '',
        startTime: '08:30',
        endTime: '09:30',
        duration: 30,
        doctorName: '',
        phone: '',
        email: '',
        abhaId: '',
        purpose: '',
        status: 'Scheduled'
      });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAppointmentColor = (appointment) => {
    switch (appointment.status) {
      case 'Confirmed':
        return 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700';
      case 'Scheduled':
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700';
      case 'Upcoming':
        return 'bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700';
      case 'Cancelled':
        return 'bg-gradient-to-br from-gray-400 to-gray-500 opacity-70';
      default:
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700';
    }
  };

  const getAppointmentPosition = (appointment, allAppointments) => {
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + appointment.duration;
    const calendarStart = 7 * 60;
    const top = Math.round(((startMinutes - calendarStart) / 30) * SLOT_HEIGHT);
    const calculatedHeight = (appointment.duration / 30) * SLOT_HEIGHT;
    const height = Math.max(calculatedHeight, SLOT_HEIGHT);
    
    const overlapping = allAppointments
      .filter(apt => {
        if (apt.id === appointment.id) return false;
        const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
        const aptStart = aptHours * 60 + aptMinutes;
        const aptEnd = aptStart + apt.duration;
        
        return !(endMinutes <= aptStart || startMinutes >= aptEnd);
      })
      .sort((a, b) => {
        const [aHours, aMinutes] = a.time.split(':').map(Number);
        const [bHours, bMinutes] = b.time.split(':').map(Number);
        const aStart = aHours * 60 + aMinutes;
        const bStart = bHours * 60 + bMinutes;
        if (aStart !== bStart) return aStart - bStart;
        return a.doctorName.localeCompare(b.doctorName);
      });
    
    const apptStart = startMinutes;
    let overlapIndex = 0;
    for (const overlap of overlapping) {
      const [overlapHours, overlapMinutes] = overlap.time.split(':').map(Number);
      const overlapStart = overlapHours * 60 + overlapMinutes;
      if (overlapStart < apptStart || (overlapStart === apptStart && overlap.doctorName < appointment.doctorName)) {
        overlapIndex++;
      } else {
        break;
      }
    }
    
    const totalOverlapping = overlapping.length + 1;
    const gapPercent = 2; 
    const totalGaps = totalOverlapping - 1;
    const availableWidth = 100 - (totalGaps * gapPercent);
    const width = availableWidth / totalOverlapping;
    const leftOffset = (overlapIndex * width) + (overlapIndex * gapPercent);
    
    return {
      top: `${top}px`,
      height: `${Math.round(height)}px`,
      left: `${leftOffset}%`,
      width: `${Math.max(width, 20)}%`,
      zIndex: 10 + overlapIndex
    };
  };

  const handleDeleteAppointment = async (appointmentId, e) => {
    e.stopPropagation(); // Prevent triggering appointment click
    
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await deleteAppointment(appointmentId);
      const refreshed = await getAppointments();
      setAppointments(refreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus, e) => {
    e.stopPropagation(); // Prevent triggering appointment click
    
    setLoading(true);
    setError(null);
    
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      const refreshed = await getAppointments();
      setAppointments(refreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [];
  for (let hour = 7; hour <= 17; hour++) {
    timeSlots.push(`${hour}:00`);
    if (hour < 17) {
      timeSlots.push(`${hour}:30`);
    }
  }

  const viewAppointments = getAppointmentsForView();
  const calendarHeight = timeSlots.length * SLOT_HEIGHT;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 overflow-hidden">
      {/* Left Sidebar Navigation */}
      <div className="w-16 bg-white/80 backdrop-blur-sm border-r-2 border-gray-200/50 flex flex-col items-center py-4 space-y-4 flex-shrink-0 shadow-lg">
        <button className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105" title="Calendar">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Main Calendar Area */}
      <div className={`flex-1 flex flex-col overflow-hidden ${showCreateForm ? 'mr-96' : ''} transition-all duration-300`}>
        {/* Calendar Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b-2 border-gray-200/50 px-8 py-6 flex-shrink-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Calendar</h1>
              </div>
              <button
                onClick={goToToday}
                className="px-6 py-2.5 text-base font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl transition-all shadow-md hover:shadow-lg border border-gray-200/50"
              >
                Today
              </button>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1 border border-gray-200/50">
                <button
                  onClick={goToPreviousDay}
                  className="p-2 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNextDay}
                  className="p-2 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {formatDate(currentDate)}
              </div>
            </div>
            
            {/* Tab Filters */}
            <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1 border border-gray-200/50">
              <button
                onClick={() => setActiveTab('Upcoming')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'Upcoming'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-white hover:text-gray-800'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('Today')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'Today'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-white hover:text-gray-800'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setActiveTab('Past')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'Past'
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-white hover:text-gray-800'
                }`}
              >
                Past
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-4 py-2.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer font-medium shadow-md hover:shadow-lg transition-all"
              >
                <option value="Day">Day</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
              </select>
              <button
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    date: currentDate.toISOString().split('T')[0]
                  }));
                  setShowCreateForm(true);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                + Create
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
          <div className="flex h-full">
            {/* Time Column - Hidden in Month View */}
            {viewMode !== 'Month' && (
              <div className="w-32 border-r-2 border-gray-200/50 flex-shrink-0 bg-gradient-to-b from-white via-gray-50/50 to-white backdrop-blur-sm shadow-sm">
                {timeSlots.map((time, index) => {
                  const isHalfHour = time.endsWith(':30');
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center justify-end pr-4 border-b ${
                        isHalfHour 
                          ? 'text-sm text-gray-500 border-gray-200/50' 
                          : 'text-base font-bold text-gray-800 border-gray-300/50'
                      }`}
                      style={{ minHeight: `${SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}
                    >
                      {formatTime(time)}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Calendar Grid */}
            <div className="flex-1 relative bg-white/50 backdrop-blur-sm" style={{ minHeight: viewMode === 'Month' ? 'auto' : `${calendarHeight}px` }}>
              {/* Time slot lines - 30 minute intervals - Hidden in Month View */}
              {viewMode !== 'Month' && timeSlots.map((_, index) => {
                const isHalfHour = timeSlots[index].endsWith(':30');
                return (
                  <div
                    key={index}
                    className={`absolute left-0 right-0 border-b ${
                      isHalfHour ? 'border-gray-200/50' : 'border-gray-300/50'
                    }`}
                    style={{ top: `${index * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}
                  />
                );
              })}

              {/* Appointments - Day View */}
              {viewMode === 'Day' && viewAppointments.map((appointment) => {
                const style = getAppointmentPosition(appointment, viewAppointments);
                const color = getAppointmentColor(appointment);
                return (
                  <div
                    key={appointment.id}
                    className={`absolute ${color} text-white rounded-lg shadow-lg cursor-pointer transition-all group hover:shadow-xl overflow-hidden ${
                      appointment.status === 'Cancelled' ? 'line-through opacity-75' : ''
                    }`}
                    style={{
                      top: style.top,
                      height: style.height,
                      left: style.left,
                      width: style.width,
                      zIndex: style.zIndex,
                      padding: '8px',
                      boxSizing: 'border-box',
                      marginLeft: '4px',
                      marginRight: '4px',
                      marginTop: '2px',
                      marginBottom: '2px'
                    }}
                    title={`${appointment.patientName} / ${appointment.doctorName} - ${appointment.status}`}
                  >
                    <div className="flex flex-col h-full min-h-0">
                      <div className="font-bold text-sm leading-snug truncate mb-1 flex-shrink-0">
                        {appointment.patientName} / {appointment.doctorName}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-auto flex-shrink-0">
                        <select
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusUpdate(appointment.id, e.target.value, e)}
                          value={appointment.status}
                          className="flex-1 text-xs bg-white/25 hover:bg-white/35 text-white border border-white/40 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer font-medium"
                          title="Change status"
                        >
                          <option value="Scheduled" className="text-gray-800">Scheduled</option>
                          <option value="Confirmed" className="text-gray-800">Confirmed</option>
                          <option value="Upcoming" className="text-gray-800">Upcoming</option>
                          <option value="Cancelled" className="text-gray-800">Cancelled</option>
                        </select>
                        <button
                          onClick={(e) => handleDeleteAppointment(appointment.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/25 rounded flex-shrink-0"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Week View */}
              {viewMode === 'Week' && (
                <div className="absolute inset-0 flex">
                  {[...Array(7)].map((_, dayIndex) => {
                    const dayDate = new Date(currentDate);
                    dayDate.setDate(currentDate.getDate() - currentDate.getDay() + dayIndex);
                    const dayStr = dayDate.toISOString().split('T')[0];
                    const dayAppts = viewAppointments.filter(apt => apt.date === dayStr);
                    
                    return (
                      <div key={dayIndex} className="flex-1 border-r border-gray-200 relative">
                        <div className="sticky top-0 bg-gradient-to-br from-white to-gray-50 border-b-2 border-gray-200/50 p-3 text-center z-20 shadow-sm">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{dayDate.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="text-xl font-bold text-gray-800 mt-1">{dayDate.getDate()}</div>
                        </div>
                        {dayAppts.map((appointment) => {
                          const style = getAppointmentPosition(appointment, dayAppts);
                          const color = getAppointmentColor(appointment);
                          return (
                            <div
                              key={appointment.id}
                              className={`absolute ${color} text-white rounded-lg shadow-lg text-xs group hover:shadow-xl transition-all overflow-hidden ${
                                appointment.status === 'Cancelled' ? 'line-through opacity-75' : ''
                              }`}
                              style={{
                                top: style.top,
                                height: style.height,
                                left: style.left,
                                width: style.width,
                                zIndex: style.zIndex,
                                padding: '8px',
                                boxSizing: 'border-box',
                                marginLeft: '6px',
                                marginRight: '6px',
                                marginTop: '3px',
                                marginBottom: '3px'
                              }}
                            >
                              <div className="flex flex-col h-full min-h-0">
                                <div className="font-bold text-sm leading-snug truncate mb-1 flex-shrink-0">
                                  {appointment.patientName} / {appointment.doctorName}
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-auto flex-shrink-0">
                                  <select
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleStatusUpdate(appointment.id, e.target.value, e)}
                                    value={appointment.status}
                                    className="flex-1 text-xs bg-white/25 hover:bg-white/35 text-white border border-white/40 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer font-medium"
                                    title="Change status"
                                  >
                                    <option value="Scheduled" className="text-gray-800">Scheduled</option>
                                    <option value="Confirmed" className="text-gray-800">Confirmed</option>
                                    <option value="Upcoming" className="text-gray-800">Upcoming</option>
                                    <option value="Cancelled" className="text-gray-800">Cancelled</option>
                                  </select>
                                  <button
                                    onClick={(e) => handleDeleteAppointment(appointment.id, e)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/25 rounded flex-shrink-0"
                                    title="Delete"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Month View */}
              {viewMode === 'Month' && (
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-2 mb-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-2 rounded-lg">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-bold text-gray-700 py-2 uppercase tracking-wide">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {(() => {
                      const year = currentDate.getFullYear();
                      const month = currentDate.getMonth();
                      const firstDay = new Date(year, month, 1);
                      const lastDay = new Date(year, month + 1, 0);
                      const startDate = new Date(firstDay);
                      startDate.setDate(startDate.getDate() - startDate.getDay());
                      
                      const days = [];
                      for (let i = 0; i < 42; i++) {
                        const date = new Date(startDate);
                        date.setDate(startDate.getDate() + i);
                        days.push(date);
                      }
                      
                      return days.map((date, index) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const dayAppts = viewAppointments.filter(apt => apt.date === dateStr);
                        const isCurrentMonth = date.getMonth() === month;
                        
                        return (
                          <div
                            key={index}
                            className={`min-h-28 border-2 rounded-lg p-2 shadow-sm transition-all hover:shadow-md ${
                              isCurrentMonth ? 'bg-white border-gray-200/50' : 'bg-gray-50/50 border-gray-200/30'
                            }`}
                          >
                            <div className={`text-sm font-bold mb-2 ${
                              isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                            }`}>
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayAppts.slice(0, 3).map((appointment) => {
                                const color = getAppointmentColor(appointment);
                                return (
                                  <div
                                    key={appointment.id}
                                    className={`${color} text-white rounded px-1 py-0.5 text-xs group hover:shadow-sm transition-all ${
                                      appointment.status === 'Cancelled' ? 'line-through opacity-60' : ''
                                    }`}
                                    title={`${appointment.patientName} / ${appointment.doctorName} - ${appointment.status}`}
                                  >
                                    <div className="flex flex-col">
                                      <div className="truncate text-xs font-semibold leading-tight mb-0.5">
                                        {appointment.patientName} / {appointment.doctorName}
                                      </div>
                                      <div className="flex items-center justify-between gap-0.5">
                                        <select
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) => handleStatusUpdate(appointment.id, e.target.value, e)}
                                          value={appointment.status}
                                          className="flex-1 text-xs bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded px-0.5 py-0 focus:outline-none focus:ring-1 focus:ring-white/50 cursor-pointer"
                                          title="Change status"
                                        >
                                          <option value="Scheduled" className="text-gray-800">Scheduled</option>
                                          <option value="Confirmed" className="text-gray-800">Confirmed</option>
                                          <option value="Upcoming" className="text-gray-800">Upcoming</option>
                                          <option value="Cancelled" className="text-gray-800">Cancelled</option>
                                        </select>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAppointment(appointment.id, e);
                                          }}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/20 rounded flex-shrink-0"
                                          title="Delete"
                                        >
                                          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              {dayAppts.length > 3 && (
                                <div className="text-xs text-gray-500">+{dayAppts.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - New Event Form (Fixed Position) */}
      {showCreateForm && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col fixed right-0 top-0 bottom-0 z-50 shadow-2xl">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-800">New Event</h2>
              <p className="text-xs text-gray-500 mt-0.5">Create a new appointment</p>
            </div>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg text-sm shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-5">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Date
                </label>
                <div className="flex items-center space-x-2 text-sm text-gray-700 font-medium">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(currentDate)}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Time
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        const [h, m] = newStart.split(':').map(Number);
                        const endMinutes = h * 60 + m + formData.duration;
                        const endH = Math.floor(endMinutes / 60);
                        const endM = endMinutes % 60;
                        setFormData(prev => ({ 
                          ...prev, 
                          startTime: newStart, 
                          endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}` 
                        }));
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="pt-5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        const [startH, startM] = formData.startTime.split(':').map(Number);
                        const [endH, endM] = newEnd.split(':').map(Number);
                        const duration = (endH * 60 + endM) - (startH * 60 + startM);
                        setFormData(prev => ({ ...prev, endTime: newEnd, duration: duration > 0 ? duration : 30 }));
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Patient Information
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Patient Name *</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Enter patient name"
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        required
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Phone Number (Optional)</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <input
                        type="tel"
                        placeholder="Add phone number (optional)"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Email Address (Optional)</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <input
                        type="email"
                        placeholder="Add email address (optional)"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">ABHA ID (Optional)</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Add ABHA ID"
                        value={formData.abhaId}
                        onChange={(e) => setFormData({ ...formData, abhaId: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Purpose (Optional)
                </label>
                <textarea
                  placeholder="Describe the purpose of this appointment... (optional)"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Doctor Information
                </label>
                <div>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Dr. Sarah Johnson - Cardiologist"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Create Appointment'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="w-full px-4 py-2.5 text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagementView;
