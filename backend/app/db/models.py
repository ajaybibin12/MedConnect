from sqlalchemy import Column, Integer, LargeBinary, String, DateTime
from datetime import datetime
from app.db.database import Base
from sqlalchemy import ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="patient")  # patient, doctor, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    profile_image = Column(LargeBinary, nullable=True)


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialization = Column(String, nullable=False)
    experience = Column(Integer, nullable=False)
    fees = Column(Float, nullable=False)
    approved = Column(Boolean, default=False)  # Admin approval needed

    user = relationship("User")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    patient_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime, nullable=False)
    time_slot = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, confirmed, rejected, cancelled
    doctor = relationship("Doctor")
    patient = relationship("User", foreign_keys=[patient_id])