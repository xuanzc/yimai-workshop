# backend/app/api/v1/material.py
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.material import MaterialCreate, MaterialUpdate, MaterialResponse
from app.schemas.common import success_response
from app.services.material_service import (
    create_material, get_materials, get_material, update_material, delete_material
)
from app.models.user import User

router = APIRouter(prefix="/materials", tags=["素材管理"])

@router.post("")
def create(req: MaterialCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    material = create_material(db, user, req.title, req.material_type, req.content, req.metadata)
    return success_response(MaterialResponse.model_validate(material).model_dump(), "创建成功")

@router.get("")
def list_materials(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    material_type: str = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items, total = get_materials(db, user, page, page_size, material_type)
    return success_response({
        "items": [MaterialResponse.model_validate(m).model_dump() for m in items],
        "total": total,
        "page": page,
        "page_size": page_size,
    })

@router.get("/{material_id}")
def get_detail(material_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    material = get_material(db, user, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="素材不存在")
    return success_response(MaterialResponse.model_validate(material).model_dump())

@router.put("/{material_id}")
def update(material_id: int, req: MaterialUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    material = get_material(db, user, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="素材不存在")
    updated = update_material(db, material, req.title, req.content, req.metadata)
    return success_response(MaterialResponse.model_validate(updated).model_dump(), "更新成功")

@router.delete("/{material_id}")
def delete(material_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    material = get_material(db, user, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="素材不存在")
    delete_material(db, material)
    return success_response(message="删除成功")
