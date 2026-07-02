# backend/app/services/creation_service.py
import json
import re
from sqlalchemy.orm import Session
from app.models.creation import Creation, ContentItem, CraftNode, CraftEdge
from app.models.material import Material
from app.models.user import User
from app.ai import get_provider
from app.ai.prompts import SYSTEM_PROMPT, build_scenario_prompt, build_craft_graph_prompt

SCENARIO_TITLES = {
    "classroom": "课堂教学包",
    "exhibition": "展馆展览包",
    "video": "短视频宣传包",
    "study_tour": "研学活动包",
}

ITEM_TYPE_MAP = {
    "classroom": ["lesson_plan", "knowledge_card", "interactive_qa", "homework"],
    "exhibition": ["exhibit_text", "display_card", "audio_guide", "visitor_guide"],
    "video": ["storyboard", "voiceover", "subtitle", "cover_copy"],
    "study_tour": ["handbook", "activity_design", "task_card", "safety_notice"],
}

async def generate_creation(db: Session, user: User, material_id: int, scenario: str, audience: str) -> Creation:
    material = db.query(Material).filter(Material.id == material_id, Material.user_id == user.id).first()
    if not material:
        raise ValueError("素材不存在")

    provider = get_provider()

    # 生成内容
    content_prompt = build_scenario_prompt(scenario, audience, material.material_type, material.content)
    raw_content = await provider.generate(SYSTEM_PROMPT, content_prompt)

    # 生成工艺图谱
    graph_prompt = build_craft_graph_prompt(material.content)
    raw_graph = await provider.generate(SYSTEM_PROMPT, graph_prompt)

    # 解析内容
    content_items = parse_content_items(raw_content, scenario)

    # 解析图谱
    craft_graph = parse_craft_graph(raw_graph)

    # 保存创作
    creation = Creation(
        user_id=user.id,
        material_id=material_id,
        title=f"{material.title}——{SCENARIO_TITLES[scenario]}",
        scenario=scenario,
        audience=audience,
        status="completed",
        model_used=settings_provider_name(),
    )
    db.add(creation)
    db.flush()

    for idx, item in enumerate(content_items):
        db.add(ContentItem(
            creation_id=creation.id,
            item_type=item["item_type"],
            title=item["title"],
            content=item["content"],
            sort_order=idx,
        ))

    for idx, node in enumerate(craft_graph["nodes"]):
        image_url = provider.generate_image_url(
            label=node["label"],
            description=node.get("description", ""),
            node_type=node["node_type"],
            seed=(idx + 1) * 42,
        )
        db.add(CraftNode(
            creation_id=creation.id,
            node_id=node["node_id"],
            label=node["label"],
            description=node.get("description"),
            node_type=node["node_type"],
            sort_order=idx,
            image_url=image_url,
        ))

    for edge in craft_graph["edges"]:
        db.add(CraftEdge(
            creation_id=creation.id,
            source_node=edge["source_node"],
            target_node=edge["target_node"],
            label=edge.get("label"),
        ))

    db.commit()
    db.refresh(creation)
    return creation

def parse_content_items(raw: str, scenario: str) -> list:
    item_types = ITEM_TYPE_MAP[scenario]
    sections = re.split(r"^##\s+", raw, flags=re.MULTILINE)
    items = []
    for section in sections[1:]:
        lines = section.strip().split("\n", 1)
        title = lines[0].strip()
        content = lines[1].strip() if len(lines) > 1 else ""
        idx = len(items)
        item_type = item_types[idx] if idx < len(item_types) else f"section_{idx}"
        items.append({"item_type": item_type, "title": title, "content": content})
    return items if items else [{"item_type": "content", "title": "生成内容", "content": raw}]

def parse_craft_graph(raw: str) -> dict:
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
            cleaned = re.sub(r"\n?```$", "", cleaned)
        graph = json.loads(cleaned)
        return {"nodes": graph.get("nodes", []), "edges": graph.get("edges", [])}
    except (json.JSONDecodeError, Exception):
        return {"nodes": [], "edges": []}

def settings_provider_name() -> str:
    from app.core.config import settings
    return f"{settings.AI_PROVIDER}:{settings.AI_MODEL}"

def get_creation_detail(db: Session, user: User, creation_id: int) -> dict:
    creation = db.query(Creation).filter(Creation.id == creation_id, Creation.user_id == user.id).first()
    if not creation:
        return None
    content_items = db.query(ContentItem).filter(ContentItem.creation_id == creation_id).order_by(ContentItem.sort_order).all()
    nodes = db.query(CraftNode).filter(CraftNode.creation_id == creation_id).order_by(CraftNode.sort_order).all()
    edges = db.query(CraftEdge).filter(CraftEdge.creation_id == creation_id).all()
    return {
        "id": creation.id,
        "material_id": creation.material_id,
        "title": creation.title,
        "scenario": creation.scenario,
        "audience": creation.audience,
        "status": creation.status,
        "model_used": creation.model_used,
        "content_items": [{"item_type": i.item_type, "title": i.title, "content": i.content, "sort_order": i.sort_order} for i in content_items],
        "craft_graph": {
            "nodes": [{"node_id": n.node_id, "label": n.label, "description": n.description, "node_type": n.node_type, "sort_order": n.sort_order, "image_url": n.image_url} for n in nodes],
            "edges": [{"source_node": e.source_node, "target_node": e.target_node, "label": e.label} for e in edges],
        },
        "created_at": creation.created_at,
    }

def get_creations_list(db: Session, user: User, page: int, page_size: int, scenario: str = None):
    query = db.query(Creation).filter(Creation.user_id == user.id)
    if scenario:
        query = query.filter(Creation.scenario == scenario)
    total = query.count()
    items = query.order_by(Creation.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    result = []
    for c in items:
        material = db.query(Material).filter(Material.id == c.material_id).first()
        result.append({
            "id": c.id,
            "title": c.title,
            "scenario": c.scenario,
            "audience": c.audience,
            "status": c.status,
            "material_title": material.title if material else None,
            "created_at": c.created_at,
        })
    return result, total

def delete_creation(db: Session, user: User, creation_id: int):
    creation = db.query(Creation).filter(Creation.id == creation_id, Creation.user_id == user.id).first()
    if not creation:
        return False
    db.delete(creation)
    db.commit()
    return True
