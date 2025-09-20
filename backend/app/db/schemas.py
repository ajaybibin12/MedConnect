from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str = "patient"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    profile_image: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: str | None = None

class DoctorBase(BaseModel):
    specialization: str
    experience: int
    fees: float

class DoctorCreate(DoctorBase):
    pass

class DoctorUser(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class DoctorProfileOut(BaseModel):
    id: int
    specialization: str
    experience: int
    fees: float

    class Config:
        from_attributes = True

class DoctorOut(DoctorBase):
    id: int
    approved: bool
    user: DoctorUser

    class Config:
        from_attributes = True


class AppointmentBase(BaseModel):
    doctor_id: int
    date: datetime
    time_slot : str

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentDoctorUser(BaseModel):
    name: str

    class Config:
        from_attributes = True

class AppointmentDoctor(BaseModel):
    id: int
    user: AppointmentDoctorUser   

    class Config:
        from_attributes = True

class AppointmentPatient(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class AppointmentOut(AppointmentBase):
    id: int
    patient_id: int
    status: str
    doctor: AppointmentDoctor
    patient: AppointmentPatient

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str
