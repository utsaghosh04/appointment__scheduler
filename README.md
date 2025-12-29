# Appointment Management System

This project implements a functional Appointment Scheduling and Queue Management system with a React frontend and Python FastAPI backend service.

##  Quick Start

### Step 1: Install Dependencies

**Backend (Python):**
```bash
pip install -r requirements.txt
```

**Frontend (Node.js):**
```bash
npm install
```

### Step 2: Start the Backend Server

```bash
uvicorn appointment_service:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at **http://localhost:8000**

- Health Check: http://localhost:8000/
- API Documentation: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

### Step 3: Start the Frontend

```bash
npm run dev
```

The frontend will run on **http://localhost:5173** (or similar)

##  Project Structure

```
SwasthiQ-assignment/
├── appointment_service.py          # Python backend service with FastAPI endpoints (Task 1)
├── EMR_Frontend_Assignment.jsx     # React frontend component (Task 2)
├── requirements.txt                # Python dependencies
├── package.json                    # Node dependencies
└── README.md                       # This file
```

##  Features Implemented

### Backend Service (Task 1)
-  Mock data with 12+ appointments
-  `get_appointments(filters)` - Query with optional date, status, doctorName filters
-  `update_appointment_status(id, new_status)` - Update appointment status
-  `create_appointment(payload)` - Create with validation and conflict detection
-  `delete_appointment(id)` - Delete appointments
-  Data consistency documentation
-  FastAPI REST API endpoints

### Frontend Integration (Task 2)
-  Data fetching with React hooks (useState/useEffect)
-  Calendar filtering - Click date to filter appointments
-  Tab filtering - Upcoming, Today, Past tabs
-  Status updates - Update appointment status via backend API
-  Create appointment - Form with backend validation
-  Delete appointment - Delete functionality with confirmation
-  Day/Week/Month view selectors
-  30-minute time interval display
-  Status-based color coding
-  No frontend-only state mutations - All changes go through backend

##  Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Python 3.x
- npm or yarn
- pip (Python package manager)

### Backend Setup

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

This installs:
- `fastapi` - Web framework for building APIs
- `uvicorn` - ASGI server to run FastAPI
- `pydantic` - Data validation

2. **Run the server:**
```bash
uvicorn appointment_service:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

1. **Install Node dependencies:**
```bash
npm install
```

2. **Run development server:**
```bash
npm run dev
```

##  API Endpoints

The FastAPI server (`appointment_service.py`) exposes REST endpoints:

### GET /appointments
Get all appointments with optional filtering.

**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD)
- `status` (optional): Filter by status (Confirmed, Scheduled, Upcoming, Cancelled)
- `doctorName` (optional): Filter by doctor name

**Example:**
```bash
# Get all appointments
curl http://localhost:8000/appointments

# Filter by date
curl "http://localhost:8000/appointments?date=2024-12-25"

# Multiple filters
curl "http://localhost:8000/appointments?date=2024-12-25&status=Confirmed"
```

### POST /appointments
Create a new appointment.

**Request Body:**
```json
{
  "patientName": "John Doe",
  "date": "2024-12-25",
  "time": "14:00",
  "duration": 30,
  "doctorName": "Dr. A",
  "mode": "In-Person",
  "status": "Scheduled"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "John Doe",
    "date": "2024-12-25",
    "time": "14:00",
    "duration": 30,
    "doctorName": "Dr. A",
    "mode": "In-Person"
  }'
```

### PATCH /appointments/{id}/status
Update appointment status.

**Request Body:**
```json
{
  "status": "Confirmed"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:8000/appointments/apt-001/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Confirmed"}'
```

### DELETE /appointments/{id}
Delete an appointment.

**Example:**
```bash
curl -X DELETE http://localhost:8000/appointments/apt-001
```

## 📋 API Contract

### get_appointments(filters)
```javascript
// Get all appointments
await fetch('http://localhost:8000/appointments')

// Filter by date
await fetch('http://localhost:8000/appointments?date=2024-12-25')

// Filter by status
await fetch('http://localhost:8000/appointments?status=Confirmed')

// Filter by doctor
await fetch('http://localhost:8000/appointments?doctorName=Dr. A')

// Multiple filters
await fetch('http://localhost:8000/appointments?date=2024-12-25&status=Confirmed')
```

### create_appointment(payload)
```javascript
await fetch('http://localhost:8000/appointments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patientName: 'John Doe',
    date: '2024-12-25',
    time: '14:00',
    duration: 30,
    doctorName: 'Dr. A',
    mode: 'In-Person',
    status: 'Scheduled' // Optional, defaults to 'Scheduled'
  })
})
```

### update_appointment_status(id, new_status)
```javascript
await fetch(`http://localhost:8000/appointments/${id}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'Confirmed' })
})
```

### delete_appointment(id)
```javascript
await fetch(`http://localhost:8000/appointments/${id}`, {
  method: 'DELETE'
})
```

##  Component Features

### Calendar Widget
- Click any date to filter appointments for that date
- Shows appointments in Day, Week, or Month view
- Selected date is highlighted
- 30-minute time intervals displayed

### Tabs
- **Upcoming**: Shows future appointments (excluding cancelled)
- **Today**: Shows appointments for today
- **Past**: Shows past appointments

### Status Management
- Status-based color coding:
  - **Confirmed**: Green
  - **Scheduled**: Blue
  - **Upcoming**: Purple
  - **Cancelled**: Gray (with strikethrough)
- All status changes call the backend API

### Create Appointment Form
- Validates all required fields
- Prevents time conflicts for same doctor/date
- Refreshes appointment list after creation
- No direct state mutations - all via backend
- Beautiful UI with grouped sections and icons

### Delete Functionality
- Delete button appears on hover for each appointment
- Confirmation dialog before deletion
- Works in Day, Week, and Month views

##  Data Flow

1. **Initial Load**: `useEffect` calls `get_appointments()` on mount
2. **Date Filter**: User clicks calendar → filters applied via API call
3. **Tab Filter**: User clicks tab → filters applied via API call
4. **Status Update**: User updates status → calls backend → refreshes list
5. **Create**: User submits form → calls backend → refreshes list
6. **Delete**: User deletes appointment → calls backend → refreshes list

##  GraphQL Query Structure

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

##  Data Consistency in Python Functions

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
const refreshed = await getAppointments();
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

### 7. Additional Production Considerations

- **Unique Constraints**: Database-level constraints prevent duplicates
- **Distributed Locks**: For multi-region deployments, use DynamoDB or Redis
- **Eventual Consistency**: Handle AppSync subscription delays gracefully
- **Audit Trail**: Log all mutations with timestamps and user IDs

##  Deployment

### Deployed to Vercel

#### Option 1: Vercel CLI

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Follow the prompts** to link your project

#### Option 2: Vercel Dashboard

1. **Push code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Go to [vercel.com](https://vercel.com)**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Vercel will auto-detect Vite and deploy**

### Deploy to Netlify

#### Option 1: Netlify CLI

1. **Install Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Build the project:**
```bash
npm run build
```

3. **Deploy:**
```bash
netlify deploy --prod --dir=dist
```

#### Option 2: Netlify Dashboard

1. **Push code to GitHub** (same as Vercel steps above)

2. **Go to [app.netlify.com](https://app.netlify.com)**

3. **Click "Add new site" → "Import an existing project"**

4. **Connect to GitHub** and select your repository

5. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

6. **Click "Deploy site"**

### Environment Variables

No environment variables are required for this demo. In production, you would add:
- `VITE_API_BASE_URL` - Your FastAPI backend URL
- `VITE_APPSYNC_URL` - Your AppSync GraphQL endpoint (if using)
- `VITE_API_KEY` - API key for authentication

### Repository Setup

1. **Initialize Git:**
```bash
git init
```

2. **Create .gitignore** (already included)

3. **Add all files:**
```bash
git add .
```

4. **Initial commit:**
```bash
git commit -m "Initial commit: Appointment Management System"
```

5. **Create repository on GitHub/GitLab/Bitbucket**

6. **Add remote and push:**
```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

**Quick Deploy Steps:**
```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy to Vercel
npx vercel --prod

# OR Deploy to Netlify
npx netlify deploy --prod --dir=dist
```

### Submission

1. **Repository Link:** `https://github.com/utsaghosh04/appointment__scheduler.git`
2. **Live Link:** `https://appointmentscheduler-six.vercel.app/`

##  Troubleshooting

### Backend Issues

#### Port already in use
If port 8000 is already in use, you can change it:

```bash
# Use uvicorn command with different port
uvicorn appointment_service:app --reload --port 8001
```

#### Module not found errors
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

#### CORS errors from frontend
If your frontend runs on a different port, add it to the CORS origins in `appointment_service.py`:
```python
allow_origins=["http://localhost:5173", "http://localhost:3000", "http://your-frontend-url"]
```

### Frontend Issues

#### Build Errors
If you get build errors:
1. Make sure all dependencies are installed: `npm install`
2. Check Node.js version (v14+ required)
3. Clear cache: `rm -rf node_modules package-lock.json && npm install`

#### Tailwind CSS Not Working
If styles aren't applying:
1. Check `tailwind.config.js` includes all file paths
2. Ensure `postcss.config.js` is present
3. Verify `src/index.css` has Tailwind directives

#### Import Errors
If you get module not found errors:
1. Ensure all files are in correct directories
2. Check import paths in `EMR_Frontend_Assignment.jsx`
3. Verify file extensions match

#### API Connection Issues
If frontend can't connect to backend:
1. Ensure FastAPI server is running on port 8000
2. Check browser console for CORS errors
3. Verify `API_BASE_URL` in `EMR_Frontend_Assignment.jsx` matches your backend URL

### Verify the Server is Running

1. **Health Check:**
   Open your browser and visit: http://localhost:8000/
   
   You should see:
   ```json
   {
     "message": "Appointment Management API",
     "status": "running"
   }
   ```

2. **Interactive API Documentation:**
   Visit: http://localhost:8000/docs
   
   This provides a Swagger UI where you can:
   - See all available endpoints
   - Test the API directly from the browser
   - View request/response schemas

3. **Alternative API Documentation:**
   Visit: http://localhost:8000/redoc
   
   This provides ReDoc documentation (alternative to Swagger)

##  Production Considerations

The code includes comments explaining how this would work in production:
- AWS AppSync for GraphQL API
- Amazon Aurora PostgreSQL for data persistence
- AWS Lambda for serverless execution
- Real-time subscriptions for live updates
- Transaction management for data consistency
- Distributed locks for multi-region deployments
- Idempotency keys for safe retries
- Optimistic locking for concurrent updates

##  Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Netlify Deployment Guide](https://docs.netlify.com/)

---
