# backend/app/schemas/creation.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class CreationRequest(BaseModel):
    material_id: int
    scenario: str = Field(pattern="^(classroom|exhibition|video|study_tour)$")
    audience: str = Field(pattern="^(child|teenager|adult|expert)$")

class SwitchAudienceRequest(BaseModel):
    audience: str = Field(pattern="^(child|teenager|adult|expert)$")

class ContentItemResponse(BaseModel):
    item_type: str
    title: str
    content: str
    sort_order: int

class CraftNodeResponse(BaseModel):
    node_id: str
    label: str
    description: Optional[str]
    node_type: str
    sort_order: int

class CraftEdgeResponse(BaseModel):
    source_node: str
    target_node: str
    label: Optional[str]

class CraftGraphResponse(BaseModel):
    nodes: List[CraftNodeResponse]
    edges: List[CraftEdgeResponse]

class CreationResponse(BaseModel):
    id: int
    title: str
    scenario: str
    audience: str
    status: str
    model_used: Optional[str]
    content_items: List[ContentItemResponse]
    craft_graph: CraftGraphResponse
    created_at: datetime

class CreationListItem(BaseModel):
    id: int
    title: str
    scenario: str
    audience: str
    status: str
    material_title: Optional[str]
    created_at: datetime
