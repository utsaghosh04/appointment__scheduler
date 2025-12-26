# Appointment Management System

This project implements a functional Appointment Scheduling and Queue Management system with a React frontend and Python backend service.

## Project Structure

```
SwasthiQ-assignment/
├── appointment_service.py          # Python backend service (Task 1)
├── appointmentService.js            # JavaScript service layer (mirrors Python API)
├── EMR_Frontend_Assignment.jsx     # React frontend component (Task 2)
└── README.md                        # This file
```

## Features Implemented

### Backend Service (Task 1)
- ✅ Mock data with 12+ appointments
- ✅ `get_appointments(filters)` - Query with optional date, status, doctorName filters
- ✅ `update_appointment_status(id, new_status)` - Update appointment status
- ✅ `create_appointment(payload)` - Create with validation and conflict detection
- ✅ `delete_appointment(id)` - Delete appointments
- ✅ Data consistency documentation

### Frontend Integration (Task 2)
- ✅ Data fetching with React hooks (useState/useEffect)
- ✅ Calendar filtering - Click date to filter appointments
- ✅ Tab filtering - Upcoming, Today, Past tabs
- ✅ Status updates - Update appointment status via backend API
- ✅ Create appointment - Form with backend validation
- ✅ No frontend-only state mutations - All changes go through backend

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Python 3.x
- npm or yarn

### Frontend Setup

1. Install dependencies (if using a React project):
```bash
npm install react react-dom
```

2. Import the component in your React app:
```jsx
import AppointmentManagementView from './EMR_Frontend_Assignment';
```

3. Use the component:
```jsx
function App() {
  return <AppointmentManagementView />;
}
```

### Backend Testing

Test the Python service:
```bash
python appointment_service.py
```

## API Contract

### get_appointments(filters)
```javascript
// Get all appointments
appointmentService.get_appointments()

// Filter by date
appointmentService.get_appointments({ date: '2024-12-25' })

// Filter by status
appointmentService.get_appointments({ status: 'Confirmed' })

// Filter by doctor
appointmentService.get_appointments({ doctorName: 'Dr. A' })

// Multiple filters
appointmentService.get_appointments({ 
  date: '2024-12-25', 
  status: 'Confirmed' 
})
```

### create_appointment(payload)
```javascript
appointmentService.create_appointment({
  patientName: 'John Doe',
  date: '2024-12-25',
  time: '14:00',
  duration: 30,
  doctorName: 'Dr. A',
  mode: 'In-Person',
  status: 'Scheduled' // Optional, defaults to 'Scheduled'
})
```

### update_appointment_status(id, new_status)
```javascript
appointmentService.update_appointment_status('apt-001', 'Confirmed')
```

### delete_appointment(id)
```javascript
appointmentService.delete_appointment('apt-001')
```

## Component Features

### Calendar Widget
- Click any date to filter appointments for that date
- Shows next 7 days
- Selected date is highlighted

### Tabs
- **Upcoming**: Shows future appointments (excluding cancelled)
- **Today**: Shows appointments for today
- **Past**: Shows past appointments

### Status Management
- Click "Confirm" to set status to Confirmed
- Click "Cancel" to set status to Cancelled
- Click "Mark Upcoming" to set status to Upcoming
- All status changes call the backend API

### Create Appointment Form
- Validates all required fields
- Prevents time conflicts for same doctor/date
- Refreshes appointment list after creation
- No direct state mutations - all via backend

## Data Flow

1. **Initial Load**: `useEffect` calls `get_appointments()` on mount
2. **Date Filter**: User clicks calendar → `handleDateClick()` → filters applied in `useEffect`
3. **Tab Filter**: User clicks tab → `handleTabClick()` → filters applied in `useEffect`
4. **Status Update**: User clicks status button → `handleStatusUpdate()` → calls backend → refreshes list
5. **Create**: User submits form → `handleCreateAppointment()` → calls backend → refreshes list

## Notes

- All state changes go through the backend service (no direct mutations)
- Error handling with user-friendly messages
- Loading states for async operations
- Responsive design with Tailwind CSS classes
- Conflict detection prevents double-booking

## GraphQL Query Structure

### getAppointments Query Design

The `get_appointments()` function is designed to map to a GraphQL query structure as follows:

```graphql
query GetAppointments($filters: AppointmentFilters) {
  getAppointments(filters: $filters) {
    id
    patientName
    date
    time
    duration
    doctorName
    status
    mode
  }
}
```

**Variables:**
```json
{
  "filters": {
    "date": "2024-12-25",
    "status": "Confirmed",
    "doctorName": "Dr. A"
  }
}
```

**GraphQL Schema Definition:**
```graphql
type Query {
  getAppointments(filters: AppointmentFilters): [Appointment!]!
}

input AppointmentFilters {
  date: String
  status: String
  doctorName: String
}

type Appointment {
  id: ID!
  patientName: String!
  date: String!
  time: String!
  duration: Int!
  doctorName: String!
  status: AppointmentStatus!
  mode: AppointmentMode!
}

enum AppointmentStatus {
  CONFIRMED
  SCHEDULED
  UPCOMING
  CANCELLED
}

enum AppointmentMode {
  IN_PERSON
  VIRTUAL
  PHONE
}
```

**Mutations:**
```graphql
mutation CreateAppointment($input: CreateAppointmentInput!) {
  createAppointment(input: $input) {
    id
    patientName
    date
    time
    duration
    doctorName
    status
    mode
  }
}

mutation UpdateAppointmentStatus($id: ID!, $status: AppointmentStatus!) {
  updateAppointmentStatus(id: $id, status: $status) {
    id
    status
    patientName
    date
    time
  }
}

mutation DeleteAppointment($id: ID!) {
  deleteAppointment(id: $id)
}
```

**Subscriptions (for real-time updates):**
```graphql
subscription OnAppointmentUpdate {
  onUpdateAppointment {
    id
    status
    patientName
    date
    time
    doctorName
  }
}

subscription OnAppointmentCreate {
  onCreateAppointment {
    id
    patientName
    date
    time
    doctorName
    status
    mode
  }
}
```

## Data Consistency in Python Functions

### 1. Transaction Management

All mutation operations (`create_appointment`, `update_appointment_status`, `delete_appointment`) are designed to execute within database transactions:

**In Production (Aurora PostgreSQL):**
```python
# Example transaction for create_appointment
BEGIN;
  -- Check for conflicts
  SELECT * FROM appointments 
  WHERE doctor_name = $1 AND date = $2 
    AND status != 'Cancelled'
    AND (time, time + duration) OVERLAPS ($3, $3 + $4);
  
  -- If no conflicts, insert
  INSERT INTO appointments (...) VALUES (...);
COMMIT;
```

**Benefits:**
- Atomicity: All operations succeed or fail together
- Isolation: Prevents concurrent modifications from interfering
- Consistency: Database remains in valid state

### 2. Conflict Detection

The `create_appointment()` function implements time overlap detection:

```python
# Checks if new appointment overlaps with existing ones
for existing in self._appointments:
    if (existing.doctorName == doctor_name and 
        existing.date == date and 
        existing.status != "Cancelled"):
        # Calculate time ranges
        new_start = datetime.strptime(f"{date} {new_time}", "%Y-%m-%d %H:%M")
        new_end = new_start + timedelta(minutes=new_duration)
        existing_start = datetime.strptime(f"{date} {existing.time}", "%Y-%m-%d %H:%M")
        existing_end = existing_start + timedelta(minutes=existing.duration)
        
        # Check overlap
        if not (new_end <= existing_start or new_start >= existing_end):
            raise ValueError("Time conflict detected")
```

**In Production:**
- Database-level unique constraint: `UNIQUE (doctor_name, date, time) WHERE status != 'Cancelled'`
- Prevents duplicate appointments even under concurrent requests
- PostgreSQL's `OVERLAPS` operator for efficient range checking

### 3. Idempotency

The `update_appointment_status()` function is idempotent:
- Calling it multiple times with the same parameters produces the same result
- Safe for retries and network failures

**Implementation:**
```python
def update_appointment_status(self, appointment_id: str, new_status: str):
    # Validates status before update
    valid_statuses = ["Confirmed", "Scheduled", "Upcoming", "Cancelled"]
    if new_status not in valid_statuses:
        raise ValueError(f"Invalid status: {new_status}")
    
    # Find and update (idempotent operation)
    for appointment in self._appointments:
        if appointment.id == appointment_id:
            appointment.status = new_status  # Same result if called multiple times
            return asdict(appointment)
```

**In Production:**
- Idempotency key in request header
- Stored in separate table with TTL
- Returns cached result if key exists within TTL window

### 4. Validation and Error Handling

All functions validate inputs before processing:

**create_appointment() validations:**
- Required fields check
- Date format validation (YYYY-MM-DD)
- Time format validation (HH:MM)
- Duration positive integer check
- Status enum validation
- Time conflict detection

**update_appointment_status() validations:**
- Status enum validation
- Appointment existence check

**Error Handling:**
- Raises `ValueError` with descriptive messages
- Frontend can catch and display user-friendly errors
- Prevents invalid data from entering system

### 5. State Consistency

After any mutation, the frontend refreshes data from backend:

```javascript
// After update
const refreshed = appointmentService.get_appointments();
setAppointments(refreshed);
```

**In Production:**
- AppSync subscriptions push updates to all connected clients
- EventBridge triggers downstream services (notifications, analytics)
- Optimistic UI updates with rollback on failure

### 6. Optimistic Locking (Production)

For concurrent updates, each appointment would have a version field:

```sql
UPDATE appointments 
SET status = $1, version = version + 1 
WHERE id = $2 AND version = $3;
```

If version mismatch, transaction fails (someone else modified it).

## Production Considerations

The code includes comments explaining how this would work in production:
- AWS AppSync for GraphQL API
- Amazon Aurora PostgreSQL for data persistence
- AWS Lambda for serverless execution
- Real-time subscriptions for live updates
- Transaction management for data consistency

