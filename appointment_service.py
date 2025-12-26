import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict


@dataclass
class Appointment:
    """class object for an appointment"""
    id: str
    patientName: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    duration: int  # duration in min
    doctorName: str
    status: str  # Confirmed, Scheduled, Upcoming, Cancelled
    mode: str  # "In-Person", "Virtual", "Phone"


class AppointmentService:
    """
    Core service for appointment management.
    In production, this would interact with:
    - AWS AppSync for GraphQL API
    - Amazon Aurora PostgreSQL for data persistence
    - AWS Lambda for serverless execution
    """
    
    def __init__(self):
        """Initialize with mock data simulating Aurora PostgreSQL records"""
        self._appointments: List[Appointment] = self._generate_mock_appointments()
    
    def _generate_mock_appointments(self) -> List[Appointment]:
        # data mocking for 12 appointments
        today = datetime.now()
        
        mock_appointments = [
            Appointment(
                id = "apt-001",
                patientName ="patient_A",
                date = (today + timedelta(days = 1)).strftime("%Y-%m-%d"),
                time = "09:00",
                duration = 30,
                doctorName = "Dr. A",
                status = "Confirmed",
                mode = "In-Person"
            ),
            Appointment(
                id = "apt-002",
                patientName = "patient_B",
                date = (today + timedelta(days = 1)).strftime("%Y-%m-%d"),
                time = "10:30",
                duration = 45,
                doctorName = "Dr. A",
                status = "Scheduled",
                mode = "Virtual"
            ),
            Appointment(
                id = "apt-003",
                patientName = "patient_C",
                date = (today + timedelta(days = 2)).strftime("%Y-%m-%d"),
                time = "14:00",
                duration = 60,
                doctorName = "Dr. B",
                status = "Upcoming",
                mode = "In-Person"
            ),
            Appointment(
                id = "apt-004",
                patientName = "patient_D",
                date = (today + timedelta(days = 2)).strftime("%Y-%m-%d"),
                time = "15:30",
                duration = 30,
                doctorName = "Dr. B",
                status = "Confirmed",
                mode = "Phone"
            ),
            Appointment(
                id = "apt-005",
                patientName = "patient_E",
                date = (today + timedelta(days = 3)).strftime("%Y-%m-%d"),
                time = "11:00",
                duration = 45,
                doctorName = "Dr. A",
                status = "Scheduled",
                mode = "Virtual"
            ),
            Appointment(
                id = "apt-006",
                patientName = "patient_F",
                date = (today + timedelta(days = 3)).strftime("%Y-%m-%d"),
                time = "13:00",
                duration = 30,
                doctorName = "Dr. A",
                status = "Upcoming",
                mode = "In-Person"
            ),
            Appointment(
                id = "apt-007",
                patientName = "patient_G",
                date = (today + timedelta(days = 4)).strftime("%Y-%m-%d"),
                time = "09:30",
                duration = 60,
                doctorName = "Dr. B",
                status = "Confirmed",
                mode = "In-Person"
            ),
            Appointment(
                id = "apt-008",
                patientName = "patient_H",
                date = (today + timedelta(days = 5)).strftime("%Y-%m-%d"),
                time = "10:00",
                duration = 30,
                doctorName = "Dr. A",
                status = "Cancelled",
                mode = "Virtual"
            ),
            Appointment(
                id = "apt-009",
                patientName = "patient_I",
                date = (today + timedelta(days = 5)).strftime("%Y-%m-%d"),
                time = "14:30",
                duration = 45,
                doctorName = "Dr. B",
                status = "Scheduled",
                mode = "In-Person"
            ),
            Appointment(
                id = "apt-010",
                patientName = "patient_J",
                date = (today + timedelta(days = 6)).strftime("%Y-%m-%d"),
                time = "16:00",
                duration = 30,
                doctorName = "Dr. A",
                status = "Upcoming",
                mode = "Phone"
            ),
            Appointment(
                id = "apt-011",
                patientName = "patient_K",
                date = (today + timedelta(days = 7)).strftime("%Y-%m-%d"),
                time = "08:00",
                duration = 60,
                doctorName = "Dr. B",
                status = "Confirmed",
                mode = "In-Person"
            ),
            Appointment(
                id = "apt-012",
                patientName = "patient_L",
                date = (today + timedelta(days = 1)).strftime("%Y-%m-%d"),
                time = "11:30",
                duration = 30,
                doctorName = "Dr. A",
                status = "Scheduled",
                mode = "Virtual"
            ),
        ]
        return mock_appointments
    
    def get_appointments(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        # query function. If no filters are provided, return all appointments
        if filters is None:
            filters = {}
        filtered = self._appointments.copy()
        # three filter arguments: date, status, doctorName. can be extended according to need
        # date filter
        if "date" in filters and filters["date"]:
            filtered = [apt for apt in filtered if apt.date == filters["date"]]
        
        # status filter
        if "status" in filters and filters["status"]:
            filtered = [apt for apt in filtered if apt.status == filters["status"]]
        
        # doctorName filter
        if "doctorName" in filters and filters["doctorName"]:
            filtered = [apt for apt in filtered if apt.doctorName == filters["doctorName"]]
        
        # Convert to dictionaries for JSON serialization
        return [asdict(apt) for apt in filtered]
    
    def update_appointment_status(self, appointment_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        """
        Update the status of an appointment.
        
        Args:
            appointment_id: Unique identifier of the appointment
            new_status: New status value (Confirmed, Scheduled, Upcoming, Cancelled)
        
        Returns:
            Updated appointment dictionary, or None if not found
        
        In production:
        - This would execute an Aurora PostgreSQL transaction:
          BEGIN;
          UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2;
          COMMIT;
        
        - AppSync Subscription would be triggered:
          After the database transaction commits, AppSync would publish a mutation
          event to all subscribed clients via WebSocket/SSE:
          subscription {
            onUpdateAppointment {
              id
              status
              patientName
              ...
            }
          }
        
        - Real-time updates would be pushed to connected frontend clients
        - EventBridge could also be triggered for downstream services (notifications, analytics)
        """
        # mutation function.
        # update the status of an appointment
        valid_statuses = ["Confirmed", "Scheduled", "Upcoming", "Cancelled"]
        # invalid status type check
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status: {new_status}. Must be one of {valid_statuses}")
        
        # finding and updating appointment
        for appointment in self._appointments:
            if appointment.id == appointment_id:
                appointment.status = new_status
                return asdict(appointment)
        
        return None
    
    
    def create_appointment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new appointment with validation and conflict detection.
        
        Args:
            payload: Dictionary containing:
                - patientName: str (required)
                - date: str (required, YYYY-MM-DD)
                - time: str (required, HH:MM)
                - duration: int (required, minutes)
                - doctorName: str (required)
                - mode: str (required)
                - status: str (optional, defaults to "Scheduled")
        
        Returns:
            Created appointment dictionary
        
        Raises:
            ValueError: If validation fails or time conflict detected
        
        In production:
        - This would execute an Aurora PostgreSQL transaction with conflict detection:
          BEGIN;
          SELECT * FROM appointments 
          WHERE doctor_name = $1 
            AND date = $2 
            AND status != 'Cancelled'
            AND (
              (time <= $3 AND time + duration > $3) OR
              (time < $3 + $4 AND time >= $3)
            );
          -- If no conflicts, insert:
          INSERT INTO appointments (id, patient_name, date, time, duration, 
                                   doctor_name, status, mode, created_at)
          VALUES ($5, $6, $2, $3, $4, $1, $7, $8, NOW())
          RETURNING *;
          COMMIT;
        
        - AppSync Subscription would notify all clients:
          subscription {
            onCreateAppointment {
              id
              patientName
              date
              ...
            }
          }
        
        - Unique constraint on (doctor_name, date, time) would prevent duplicates
        - Idempotency key could be used to prevent duplicate creates from retries
        """
        # Validate required fields
        required_fields = ["patientName", "date", "time", "duration", "doctorName", "mode"]
        missing_fields = [field for field in required_fields if field not in payload or not payload[field]]
        
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Validate date format
        try:
            datetime.strptime(payload["date"], "%Y-%m-%d")
        except ValueError:
            raise ValueError("Invalid date format. Expected YYYY-MM-DD")
        
        # Validate time format
        try:
            datetime.strptime(payload["time"], "%H:%M")
        except ValueError:
            raise ValueError("Invalid time format. Expected HH:MM")
        
        # Validate duration
        if not isinstance(payload["duration"], int) or payload["duration"] <= 0:
            raise ValueError("Duration must be a positive integer (minutes)")
        
        # Check for time conflicts with the same doctor on the same date
        doctor_name = payload["doctorName"]
        date = payload["date"]
        new_time = payload["time"]
        new_duration = payload["duration"]
        
        # Parse new appointment time
        new_start = datetime.strptime(f"{date} {new_time}", "%Y-%m-%d %H:%M")
        new_end = new_start + timedelta(minutes=new_duration)
        
        # Check against existing appointments (excluding cancelled ones)
        for existing in self._appointments:
            if (existing.doctorName == doctor_name and 
                existing.date == date and 
                existing.status != "Cancelled"):
                
                # Parse existing appointment time
                existing_start = datetime.strptime(f"{date} {existing.time}", "%Y-%m-%d %H:%M")
                existing_end = existing_start + timedelta(minutes=existing.duration)
                
                # Check for overlap
                if not (new_end <= existing_start or new_start >= existing_end):
                    raise ValueError(
                        f"Time conflict detected. Doctor {doctor_name} already has an appointment "
                        f"from {existing.time} to {existing_end.strftime('%H:%M')} on {date}"
                    )
        
        # Generate unique appointment ID
        appointment_id = f"apt-{str(uuid.uuid4())[:8]}"
        
        # Set default status if not provided
        status = payload.get("status", "Scheduled")
        
        # Validate status
        valid_statuses = ["Confirmed", "Scheduled", "Upcoming", "Cancelled"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid status: {status}. Must be one of {valid_statuses}")
        
        # Create new appointment
        new_appointment = Appointment(
            id=appointment_id,
            patientName=payload["patientName"],
            date=payload["date"],
            time=payload["time"],
            duration=payload["duration"],
            doctorName=payload["doctorName"],
            status=status,
            mode=payload["mode"]
        )
        
        # Add to mock data (in production, this would be the INSERT result)
        self._appointments.append(new_appointment)
        
        return asdict(new_appointment)
    
    def delete_appointment(self, appointment_id: str) -> bool:
        """
        Delete an appointment by ID.
        
        Args:
            appointment_id: Unique identifier of the appointment to delete
        
        Returns:
            True if appointment was deleted, False if not found
        
        In production:
        - This would execute an Aurora PostgreSQL transaction:
          BEGIN;
          DELETE FROM appointments WHERE id = $1;
          COMMIT;
        
        - AppSync Subscription would notify all clients:
          subscription {
            onDeleteAppointment {
              id
            }
          }
        
        - Soft delete could be implemented instead:
          UPDATE appointments SET deleted_at = NOW(), status = 'Cancelled' WHERE id = $1;
          This preserves audit trail and allows recovery
        """
        for i, appointment in enumerate(self._appointments):
            if appointment.id == appointment_id:
                del self._appointments[i]
                return True
        
        return False


# Data Consistency Explanation
"""
DATA CONSISTENCY IN PRODUCTION:

1. TRANSACTIONS:
   - All mutations (create, update, delete) would be wrapped in Aurora PostgreSQL transactions
   - BEGIN/COMMIT/ROLLBACK ensure atomicity
   - Example: Creating an appointment and checking conflicts must be atomic
   
2. UNIQUE CONSTRAINTS:
   - Database-level unique constraint on (doctor_name, date, time, status != 'Cancelled')
   - Prevents duplicate appointments even under concurrent requests
   - Example: UNIQUE INDEX idx_doctor_time ON appointments(doctor_name, date, time) 
     WHERE status != 'Cancelled';
   
3. IDEMPOTENCY KEYS:
   - Each mutation request includes an idempotency_key (UUID)
   - Stored in a separate idempotency table with TTL
   - If same key is used within TTL window, return cached result instead of re-executing
   - Prevents duplicate creates from network retries or user double-clicks
   - Example: INSERT INTO idempotency_keys (key, result, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')
   
4. OPTIMISTIC LOCKING:
   - Each appointment record has a version/timestamp field
   - UPDATE includes WHERE version = $old_version
   - If version mismatch, transaction fails (someone else modified it)
   - Prevents lost updates in concurrent scenarios
   
5. DISTRIBUTED LOCKS (if multi-region):
   - Use DynamoDB or Redis for distributed locking during conflict checks
   - Ensures only one request can create appointment for a doctor/time slot
   - Lock key: "appointment:{doctor_name}:{date}:{time}"
   
6. EVENTUAL CONSISTENCY HANDLING:
   - AppSync subscriptions may have slight delay
   - Frontend should handle stale data gracefully
   - Implement polling fallback or optimistic UI updates
"""


# Example usage and testing
if __name__ == "__main__":
    service = AppointmentService()
    
    # Test get_appointments with filters
    print("=== All Appointments ===")
    all_appts = service.get_appointments()
    print(f"Total: {len(all_appts)}")
    
    print("\n=== Filtered by Status: Confirmed ===")
    confirmed = service.get_appointments({"status": "Confirmed"})
    print(f"Found: {len(confirmed)}")
    
    print("\n=== Filtered by Doctor ===")
    dr_sarah = service.get_appointments({"doctorName": "Dr. A"})
    print(f"Found: {len(dr_sarah)}")
    
    # Test create_appointment
    print("\n=== Creating New Appointment ===")
    try:
        new_apt = service.create_appointment({
            "patientName": "Test Patient",
            "date": "2024-12-25",
            "time": "12:00",
            "duration": 30,
            "doctorName": "Dr. A",
            "mode": "Virtual"
        })
        print(f"Created: {new_apt['id']} - {new_apt['patientName']}")
    except ValueError as e:
        print(f"Error: {e}")
    
    # Test conflict detection
    print("\n=== Testing Conflict Detection ===")
    try:
        conflict_apt = service.create_appointment({
            "patientName": "Conflict Test",
            "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
            "time": "09:00",  # Conflicts with apt-001
            "duration": 30,
            "doctorName": "Dr. A",
            "mode": "In-Person"
        })
    except ValueError as e:
        print(f"Conflict correctly detected: {e}")
    
    # Test update_appointment_status
    print("\n=== Updating Appointment Status ===")
    updated = service.update_appointment_status("apt-001", "Cancelled")
    if updated:
        print(f"Updated: {updated['id']} -> {updated['status']}")
    
    # Test delete_appointment
    print("\n=== Deleting Appointment ===")
    deleted = service.delete_appointment("apt-002")
    print(f"Deleted: {deleted}")

