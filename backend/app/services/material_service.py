# backend/app/services/material_service.py
import json
from sqlalchemy.orm import Session
from app.models.material import Material
from app.models.user import User

def create_material(db: Session, user: User, title: str, material_type: str, content: str, metadata: dict = None) -> Material:
    material = Material(
        user_id=user.id,
        title=title,
        material_type=material_type,
        content=content,
        metadata_json=json.dumps(metadata) if metadata else None,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material

def get_materials(db: Session, user: User, page: int, page_size: int, material_type: str = None):
    query = db.query(Material).filter(Material.user_id == user.id)
    if material_type:
        query = query.filter(Material.material_type == material_type)
    total = query.count()
    items = query.order_by(Material.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return items, total

def get_material(db: Session, user: User, material_id: int) -> Material:
    return db.query(Material).filter(Material.id == material_id, Material.user_id == user.id).first()

def update_material(db: Session, material: Material, title: str = None, content: str = None, metadata: dict = None) -> Material:
    if title is not None:
        material.title = title
    if content is not None:
        material.content = content
    if metadata is not None:
        material.metadata_json = json.dumps(metadata)
    db.commit()
    db.refresh(material)
    return material

def delete_material(db: Session, material: Material):
    db.delete(material)
    db.commit()
