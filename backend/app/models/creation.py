# backend/app/models/creation.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Creation(Base):
    __tablename__ = "creations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    scenario = Column(String(30), nullable=False)
    audience = Column(String(30), nullable=False)
    status = Column(String(20), default="completed")
    model_used = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="creations")
    material = relationship("Material", back_populates="creations")
    content_items = relationship("ContentItem", back_populates="creation", cascade="all, delete-orphan")
    craft_nodes = relationship("CraftNode", back_populates="creation", cascade="all, delete-orphan")
    craft_edges = relationship("CraftEdge", back_populates="creation", cascade="all, delete-orphan")

class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(Integer, primary_key=True, index=True)
    creation_id = Column(Integer, ForeignKey("creations.id", ondelete="CASCADE"), nullable=False)
    item_type = Column(String(30), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0)

    creation = relationship("Creation", back_populates="content_items")

class CraftNode(Base):
    __tablename__ = "craft_nodes"

    id = Column(Integer, primary_key=True, index=True)
    creation_id = Column(Integer, ForeignKey("creations.id", ondelete="CASCADE"), nullable=False)
    node_id = Column(String(50), nullable=False)
    label = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    node_type = Column(String(30), nullable=False)
    sort_order = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)

    creation = relationship("Creation", back_populates="craft_nodes")

class CraftEdge(Base):
    __tablename__ = "craft_edges"

    id = Column(Integer, primary_key=True, index=True)
    creation_id = Column(Integer, ForeignKey("creations.id", ondelete="CASCADE"), nullable=False)
    source_node = Column(String(50), nullable=False)
    target_node = Column(String(50), nullable=False)
    label = Column(String(100), nullable=True)

    creation = relationship("Creation", back_populates="craft_edges")
