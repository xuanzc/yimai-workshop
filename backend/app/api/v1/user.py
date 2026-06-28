# backend/app/api/v1/user.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.security import verify_password, get_password_hash
from app.schemas.user import UserUpdate, PasswordUpdate
from app.schemas.common import success_response
from app.models.user import User
from app.models.material import Material
from app.models.creation import Creation
from sqlalchemy import func

router = APIRouter(prefix="/users", tags=["用户"])

@router.put("/me")
def update_profile(req: UserUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if req.username is not None:
        existing = db.query(User).filter(User.username == req.username, User.id != user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="用户名已存在")
        user.username = req.username
    if req.avatar is not None:
        user.avatar = req.avatar
    db.commit()
    db.refresh(user)
    return success_response({"id": user.id, "username": user.username, "email": user.email, "avatar": user.avatar}, "更新成功")

@router.put("/password")
def update_password(req: PasswordUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not verify_password(req.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="原密码错误")
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return success_response(message="密码修改成功")

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    material_count = db.query(func.count(Material.id)).filter(Material.user_id == user.id).scalar()
    creation_count = db.query(func.count(Creation.id)).filter(Creation.user_id == user.id).scalar()
    scenario_rows = db.query(Creation.scenario, func.count(Creation.id)).filter(Creation.user_id == user.id).group_by(Creation.scenario).all()
    distribution = {row[0]: row[1] for row in scenario_rows}
    return success_response({
        "material_count": material_count,
        "creation_count": creation_count,
        "scenario_distribution": distribution,
    })
