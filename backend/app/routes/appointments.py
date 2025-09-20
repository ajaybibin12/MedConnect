from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.db import models, schemas, database
from app.core.security import role_required, get_current_user
from typing import List

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# Patient books appointment
@router.post("/book", response_model=schemas.AppointmentOut)
def book_appointment(appointment: schemas.AppointmentCreate,
                     db: Session = Depends(database.get_db),
                     current_user = Depends(role_required(["patient"]))):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == appointment.doctor_id).first()
    if not doctor or not doctor.approved:
        raise HTTPException(status_code=404, detail="Doctor not found or not approved")
    
    new_appt = models.Appointment(
        patient_id=current_user.id,
        doctor_id=appointment.doctor_id,
        date=appointment.date,
        time_slot=appointment.time_slot
    )
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)
    return new_appt

# Doctor accepts/rejects appointment
@router.put("/{appointment_id}/status")
def update_appointment_status(appointment_id: int, status_update: schemas.StatusUpdate,
                              db: Session = Depends(database.get_db),
                              current_user = Depends(role_required(["doctor"]))):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.doctor.user_id != current_user.id:
        print("Appointment ID:", appointment_id)
        print("Current User ID:", current_user.id)
        raise HTTPException(status_code=403, detail="Not your appointment")
    appointment.status = status_update.status
    db.commit()
    return {"message": f"Appointment status updated to {status_update.status}"}

# Patient cancels appointment
@router.delete("/{appointment_id}")
def cancel_appointment(appointment_id: int,
                       db: Session = Depends(database.get_db),
                       current_user = Depends(role_required(["patient"]))):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your appointment")
    appointment.status = "cancelled"
    db.commit()
    return {"message": "Appointment cancelled"}

# Doctor views their appointments
@router.get("/doctor", response_model=List[schemas.AppointmentOut])
def doctor_appointments(db: Session = Depends(database.get_db),
                        current_user = Depends(role_required(["doctor"]))):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    appointments = db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor.id).all()
    return appointments

# Patient views their appointments
@router.get("/patient",response_model=list[schemas.AppointmentOut])
def patient_appointments(db: Session = Depends(database.get_db),
                         current_user = Depends(role_required(["patient"]))):
    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == current_user.id
    ).all()
    return appointments

# Admin views all appointments
@router.get("/admin", response_model=list[schemas.AppointmentOut])
def admin_appointments(db: Session = Depends(database.get_db),
                       current_user = Depends(role_required(["admin"]))):
    appointments = db.query(models.Appointment).all()
    return appointments