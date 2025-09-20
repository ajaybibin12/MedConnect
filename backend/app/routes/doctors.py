from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import models, schemas, database
from app.core.security import role_required, get_current_user

router = APIRouter(prefix="/doctors", tags=["Doctors"])

# ✅ Doctor views their profile
@router.get("/me", response_model=schemas.DoctorOut)
def get_doctor_profile(
    db: Session = Depends(database.get_db),
    current_user = Depends(role_required(["doctor"]))
):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor


# ✅ Doctor creates/updates their profile
@router.post("/create", response_model=schemas.DoctorOut)
def create_doctor_profile(doctor: schemas.DoctorCreate, 
                          db: Session = Depends(database.get_db),
                          current_user = Depends(role_required(["doctor"]))):
    db_doctor = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
    if db_doctor:
        # update profile if exists
        db_doctor.specialization = doctor.specialization
        db_doctor.experience = doctor.experience
        db_doctor.fees = doctor.fees
    else:
        db_doctor = models.Doctor(
            user_id=current_user.id,
            specialization=doctor.specialization,
            experience=doctor.experience,
            fees=doctor.fees
        )
        db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

# ✅ Admin approves doctor
@router.put("/approve/{doctor_id}")
def approve_doctor(doctor_id: int, 
                   db: Session = Depends(database.get_db),
                   current_user = Depends(role_required(["admin"]))):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.approved = True
    db.commit()
    return {"message": "Doctor approved successfully"}

# ✅ View all approved doctors (for patients)
@router.get("/approved", response_model=list[schemas.DoctorOut])
def get_approved_doctors(db: Session = Depends(database.get_db)):
    return db.query(models.Doctor).filter(models.Doctor.approved == True).all()

# ✅ View all doctors (for admin)
@router.get("/all", response_model=list[schemas.DoctorOut])
def get_all_doctors(db: Session = Depends(database.get_db)):
    return db.query(models.Doctor).all()
