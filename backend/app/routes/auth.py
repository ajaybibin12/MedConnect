from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db import models, schemas
from app.db.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.core.config import settings
from fastapi import UploadFile, File
import shutil
import os


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = get_password_hash(user.password)
    new_user = models.User(name=user.name, email=user.email, hashed_password=hashed_pw, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": db_user.email}, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/update-profile", response_model=schemas.UserProfileOut)
def update_profile(
    data: schemas.UserProfileUpdate = Depends(),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    profile_image: UploadFile = File(None)
):
    if data.name:
        current_user.name = data.name
    if data.email:
        current_user.email = data.email
    if data.password:
        current_user.hashed_password = get_password_hash(data.password)

    if profile_image:
        # read bytes and store
        file_bytes = profile_image.file.read()
        current_user.profile_image = file_bytes

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/profile", response_model=schemas.UserProfileOut)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user