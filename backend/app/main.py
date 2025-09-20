from fastapi import FastAPI
from app.db import models, database
from app.routes import appointments, auth,admin,doctors
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="MedConnect API")


origins = [
    "http://localhost:5173",  # React dev server
    "http://127.0.0.1:5173",
    # you can add production URL here later, e.g. "https://medconnect.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(doctors.router)
app.include_router(appointments.router)

@app.get("/")
def root():
    return {"message": "Welcome to MedConnect API"}
