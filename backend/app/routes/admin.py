from fastapi import APIRouter, Depends
from app.core.security import role_required
from app.db.models import User

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
def admin_dashboard(current_user: User = Depends(role_required(["admin"]))):
    return {"message": f"Welcome Admin {current_user.name}"}
