# backend/app/api/v1/creation.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.creation import CreationRequest, SwitchAudienceRequest
from app.schemas.common import success_response
from app.services.creation_service import generate_creation, get_creation_detail, get_creations_list, delete_creation
from app.models.user import User

router = APIRouter(prefix="/creations", tags=["创作生成"])

@router.post("")
async def create(req: CreationRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        creation = await generate_creation(db, user, req.material_id, req.scenario, req.audience)
        detail = get_creation_detail(db, user, creation.id)
        return success_response(detail, "创作完成")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创作失败: {str(e)}")

@router.get("")
def list_creations(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    scenario: str = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items, total = get_creations_list(db, user, page, page_size, scenario)
    return success_response({"items": items, "total": total, "page": page, "page_size": page_size})

@router.get("/{creation_id}")
def get_detail(creation_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    detail = get_creation_detail(db, user, creation_id)
    if not detail:
        raise HTTPException(status_code=404, detail="创作不存在")
    return success_response(detail)

@router.delete("/{creation_id}")
def delete(creation_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not delete_creation(db, user, creation_id):
        raise HTTPException(status_code=404, detail="创作不存在")
    return success_response(message="删除成功")

@router.post("/{creation_id}/switch-audience")
async def switch_audience(
    creation_id: int,
    req: SwitchAudienceRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    detail = get_creation_detail(db, user, creation_id)
    if not detail:
        raise HTTPException(status_code=404, detail="创作不存在")
    try:
        creation = await generate_creation(db, user, detail["material_id"] if "material_id" in detail else 0, detail["scenario"], req.audience)
        new_detail = get_creation_detail(db, user, creation.id)
        return success_response(new_detail, "切换成功")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
