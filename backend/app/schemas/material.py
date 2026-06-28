# backend/app/schemas/material.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Any

class MaterialCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    material_type: str = Field(pattern="^(ancient_book|craft_text|oral_record|craft_keyword)$")
    content: str = Field(min_length=1)
    metadata: Optional[dict] = None

class MaterialUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    content: Optional[str] = None
    metadata: Optional[dict] = None

class MaterialResponse(BaseModel):
    id: int
    user_id: int
    title: str
    material_type: str
    content: str
    metadata_json: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
