# backend/app/services/auth_service.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from datetime import timedelta

def get_user_by_username(db: Session, username: str) -> User:
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()

def register_user(db: Session, username: str, email: str, password: str) -> dict:
    if get_user_by_username(db, username):
        raise ValueError("用户名已存在")
    if get_user_by_email(db, email):
        raise ValueError("邮箱已被注册")
    user = User(
        username=username,
        email=email,
        hashed_password=get_password_hash(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": str(user.id)})
    return {"id": user.id, "username": user.username, "email": user.email, "token": token}

def authenticate_user(db: Session, account: str, password: str) -> dict:
    user = get_user_by_username(db, account) or get_user_by_email(db, account)
    if not user or not verify_password(password, user.hashed_password):
        raise ValueError("账号或密码错误")
    token = create_access_token(data={"sub": str(user.id)})
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "avatar": user.avatar,
        "token": token,
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }
