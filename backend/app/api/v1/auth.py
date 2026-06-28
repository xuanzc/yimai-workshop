# backend/app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.user import UserRegister, UserLogin, UserResponse
from app.schemas.common import success_response, error_response
from app.services.auth_service import register_user, authenticate_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/register")
def register(req: UserRegister, db: Session = Depends(get_db)):
    try:
        result = register_user(db, req.username, req.email, req.password)
        return success_response(result, "注册成功")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(req: UserLogin, db: Session = Depends(get_db)):
    try:
        result = authenticate_user(db, req.account, req.password)
        return success_response(result, "登录成功")
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return success_response(UserResponse.model_validate(current_user).model_dump())
