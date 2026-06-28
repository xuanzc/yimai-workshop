# 遗脉工坊 实施计划 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个完整的 AI 非遗与古籍活化创作助手 Web 应用，包含 FastAPI 后端 + React 前端，支持 Mock/真实 AI 双模式。

**Architecture:** 单体前后端分离架构。后端 FastAPI 提供 RESTful API，SQLite 持久化，AI 适配层支持 Mock/OpenAI/通义千问三模式切换。前端 React SPA，Tailwind + shadcn/ui 构建 UI，Zustand 管理状态。

**Tech Stack:** Python 3.10+ / FastAPI / SQLAlchemy 2.x / SQLite / React 18 / Vite 5 / Tailwind CSS / shadcn/ui / Zustand / Axios

---

## Task 1: 后端项目初始化与配置

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`
- Create: `backend/app/__init__.py`
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/database.py`
- Create: `backend/run.py`

- [ ] **Step 1: 创建 requirements.txt**

```txt
fastapi==0.111.0
uvicorn[standard]==0.30.1
sqlalchemy==2.0.30
pydantic==2.7.1
pydantic-settings==2.2.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
httpx==0.27.0
pytest==8.2.0
pytest-asyncio==0.23.7
```

- [ ] **Step 2: 创建 .env.example**

```env
DATABASE_URL=sqlite:///./yimai.db
SECRET_KEY=dev-secret-key-change-in-production-please
ACCESS_TOKEN_EXPIRE_MINUTES=1440
AI_PROVIDER=mock
AI_API_KEY=
AI_MODEL=gpt-4o-mini
AI_BASE_URL=
CORS_ORIGINS=http://localhost:5173
```

- [ ] **Step 3: 创建配置管理 config.py**

```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./yimai.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production-please"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    AI_PROVIDER: str = "mock"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o-mini"
    AI_BASE_URL: str = ""
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
```

- [ ] **Step 4: 创建数据库连接 database.py**

```python
# backend/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 5: 创建 run.py 启动脚本**

```python
# backend/run.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
```

- [ ] **Step 6: 创建空 __init__.py 文件**

创建以下空文件：
- `backend/app/__init__.py`
- `backend/app/core/__init__.py`

- [ ] **Step 7: 验证依赖安装**

Run: `cd backend && pip install -r requirements.txt`
Expected: 所有依赖安装成功

---

## Task 2: 数据库模型定义

**Files:**
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/material.py`
- Create: `backend/app/models/creation.py`

- [ ] **Step 1: 创建用户模型 user.py**

```python
# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=False)
    avatar = Column(String(200), nullable=True)
    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    materials = relationship("Material", back_populates="user", cascade="all, delete-orphan")
    creations = relationship("Creation", back_populates="user", cascade="all, delete-orphan")
```

- [ ] **Step 2: 创建素材模型 material.py**

```python
# backend/app/models/material.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    material_type = Column(String(30), nullable=False)
    content = Column(Text, nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="materials")
    creations = relationship("Creation", back_populates="material")
```

- [ ] **Step 3: 创建创作模型 creation.py**

```python
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

    creation = relationship("Creation", back_populates="craft_nodes")

class CraftEdge(Base):
    __tablename__ = "craft_edges"

    id = Column(Integer, primary_key=True, index=True)
    creation_id = Column(Integer, ForeignKey("creations.id", ondelete="CASCADE"), nullable=False)
    source_node = Column(String(50), nullable=False)
    target_node = Column(String(50), nullable=False)
    label = Column(String(100), nullable=True)

    creation = relationship("Creation", back_populates="craft_edges")
```

- [ ] **Step 4: 创建 models/__init__.py**

```python
# backend/app/models/__init__.py
from app.models.user import User
from app.models.material import Material
from app.models.creation import Creation, ContentItem, CraftNode, CraftEdge
```

---

## Task 3: 安全模块与 Pydantic Schema

**Files:**
- Create: `backend/app/core/security.py`
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/common.py`
- Create: `backend/app/schemas/user.py`
- Create: `backend/app/schemas/material.py`
- Create: `backend/app/schemas/creation.py`

- [ ] **Step 1: 创建安全模块 security.py**

```python
# backend/app/core/security.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        return None
```

- [ ] **Step 2: 创建通用响应模式 common.py**

```python
# backend/app/schemas/common.py
from pydantic import BaseModel
from typing import Any, Optional, List

class ResponseBase(BaseModel):
    code: int = 200
    message: str = "success"
    data: Any = None

class PaginationData(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int

def success_response(data: Any = None, message: str = "success") -> dict:
    return {"code": 200, "message": message, "data": data}

def error_response(code: int, message: str) -> dict:
    return {"code": code, "message": message, "data": None}
```

- [ ] **Step 3: 创建用户 Schema user.py**

```python
# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserRegister(BaseModel):
    username: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)

class UserLogin(BaseModel):
    account: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    avatar: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    id: int
    username: str
    email: str
    avatar: Optional[str] = None
    token: str
    expires_in: int

class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=2, max_length=50)
    avatar: Optional[str] = None

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6, max_length=100)

class UserStats(BaseModel):
    material_count: int
    creation_count: int
    scenario_distribution: dict
```

- [ ] **Step 4: 创建素材 Schema material.py**

```python
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
```

- [ ] **Step 5: 创建创作 Schema creation.py**

```python
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
```

- [ ] **Step 6: 创建 schemas/__init__.py**

```python
# backend/app/schemas/__init__.py
```

---

## Task 4: 依赖注入与认证 API

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/deps.py`
- Create: `backend/app/api/v1/__init__.py`
- Create: `backend/app/api/v1/auth.py`
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/auth_service.py`

- [ ] **Step 1: 创建依赖注入 deps.py**

```python
# backend/app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token无效或已过期",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=403, detail="账号已禁用")
    return user
```

- [ ] **Step 2: 创建认证服务 auth_service.py**

```python
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
```

- [ ] **Step 3: 创建认证路由 auth.py**

```python
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
```

- [ ] **Step 4: 创建空 __init__.py 文件**

创建以下空文件：
- `backend/app/api/__init__.py`
- `backend/app/api/v1/__init__.py`
- `backend/app/services/__init__.py`

---

## Task 5: 素材管理 API

**Files:**
- Create: `backend/app/services/material_service.py`
- Create: `backend/app/api/v1/material.py`

- [ ] **Step 1: 创建素材服务 material_service.py**

```python
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
```

- [ ] **Step 2: 创建素材路由 material.py**

```python
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
```

---

## Task 6: AI 适配层实现

**Files:**
- Create: `backend/app/ai/__init__.py`
- Create: `backend/app/ai/base.py`
- Create: `backend/app/ai/prompts.py`
- Create: `backend/app/ai/mock.py`
- Create: `backend/app/ai/openai_provider.py`
- Create: `backend/app/ai/qwen_provider.py`

- [ ] **Step 1: 创建抽象基类 base.py**

```python
# backend/app/ai/base.py
from abc import ABC, abstractmethod

class AIProvider(ABC):
    @abstractmethod
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        pass
```

- [ ] **Step 2: 创建 Prompt 模板 prompts.py**

```python
# backend/app/ai/prompts.py

SYSTEM_PROMPT = """你是「遗脉工坊」的 AI 创作助手，专注于将古籍文献与非遗工艺素材转化为适配不同场景的文化传播内容。
你的能力：解析素材中的文化核心信息，根据场景和受众生成适配内容，将晦涩古文转化为通俗易懂语言，提取工艺流程构建可视化图谱。
输出要求：内容准确不编造，语言风格适配受众，结构清晰使用 Markdown 格式。"""

SCENARIO_PROMPTS = {
    "classroom": """请基于以下素材，为{audience}生成课堂教学内容包：

素材类型：{material_type}
素材内容：{content}

请生成以下内容，每部分用 ## 标题分隔：
1. 教案大纲（教学目标、重点难点、课时安排）
2. 知识点卡片（3-5个核心知识点，每个含简要解释）
3. 课堂互动问答（5道互动问题及参考答案）
4. 课后作业建议（2-3项实践性作业）

要求：语言生动有趣，适合{audience}理解。""",

    "exhibition": """请基于以下素材，为{audience}生成展馆展览内容包：

素材类型：{material_type}
素材内容：{content}

请生成以下内容，每部分用 ## 标题分隔：
1. 展板文案（主题展板介绍文字，200字内）
2. 展品说明牌（3-5件核心展品的说明文字，每件50字内）
3. 语音导览词（完整导览脚本，适合语音播报）
4. 参观引导语（入口/出口/互动区的引导文字）

要求：文字简洁专业，适合{audience}阅读。""",

    "video": """请基于以下素材，为{audience}生成短视频宣传内容包：

素材类型：{material_type}
素材内容：{content}

请生成以下内容，每部分用 ## 标题分隔：
1. 视频分镜脚本（5-8个分镜，每个含画面描述、时长、转场）
2. 口播文案（完整旁白文字，适合1-3分钟视频）
3. 字幕文案（关键字幕文字列表）
4. 封面建议文案（3个封面标题方案）

要求：节奏明快，有传播力，吸引{audience}观看。""",

    "study_tour": """请基于以下素材，为{audience}生成研学活动内容包：

素材类型：{material_type}
素材内容：{content}

请生成以下内容，每部分用 ## 标题分隔：
1. 研学手册大纲（活动主题、学习目标、流程安排）
2. 体验活动设计（2-3个可操作的体验活动）
3. 研学任务卡（5个探究性任务及引导提示）
4. 安全须知（活动相关的安全注意事项）

要求：内容具有可操作性，适合{audience}参与。""",
}

CRAFT_GRAPH_PROMPT = """请从以下素材中提取工艺流程，并生成结构化的工艺图谱。

素材内容：{content}

请严格按以下 JSON 格式输出（只输出JSON，不要其他文字）：
{{
  "nodes": [
    {{
      "node_id": "step1",
      "label": "步骤名称",
      "node_type": "material|action|product",
      "description": "步骤描述"
    }}
  ],
  "edges": [
    {{
      "source_node": "step1",
      "target_node": "step2",
      "label": "关系标签"
    }}
  ]
}}"""

AUDIENCE_MAP = {
    "child": "儿童（6-12岁）",
    "teenager": "青少年（13-18岁）",
    "adult": "成人普通受众",
    "expert": "专业研究者",
}

MATERIAL_TYPE_MAP = {
    "ancient_book": "古籍原文",
    "craft_text": "非遗工艺文字",
    "oral_record": "口述记录",
    "craft_keyword": "工艺关键词",
}

def build_scenario_prompt(scenario: str, audience: str, material_type: str, content: str) -> str:
    return SCENARIO_PROMPTS[scenario].format(
        audience=AUDIENCE_MAP.get(audience, audience),
        material_type=MATERIAL_TYPE_MAP.get(material_type, material_type),
        content=content,
    )

def build_craft_graph_prompt(content: str) -> str:
    return CRAFT_GRAPH_PROMPT.format(content=content)
```

- [ ] **Step 3: 创建 Mock 实现 mock.py**

```python
# backend/app/ai/mock.py
import asyncio
import json
import re
from app.ai.base import AIProvider

class MockProvider(AIProvider):
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        await asyncio.sleep(1.5)

        if "JSON 格式输出" in user_prompt:
            return self._mock_craft_graph(user_prompt)

        scenario = self._detect_scenario(user_prompt)
        audience = self._detect_audience(user_prompt)
        content_snippet = self._extract_content(user_prompt)
        return self._mock_content(scenario, audience, content_snippet)

    def _detect_scenario(self, prompt: str) -> str:
        if "课堂教学" in prompt:
            return "classroom"
        if "展馆展览" in prompt:
            return "exhibition"
        if "短视频" in prompt:
            return "video"
        if "研学" in prompt:
            return "study_tour"
        return "classroom"

    def _detect_audience(self, prompt: str) -> str:
        if "儿童" in prompt:
            return "child"
        if "青少年" in prompt:
            return "teenager"
        if "专业" in prompt:
            return "expert"
        return "adult"

    def _extract_content(self, prompt: str) -> str:
        match = re.search(r"素材内容：(.+?)(?:\n\n|$)", prompt, re.DOTALL)
        return match.group(1).strip()[:100] if match else "素材内容"

    def _mock_content(self, scenario: str, audience: str, content: str) -> str:
        templates = {
            "classroom": f"""## 教案大纲

**教学目标：**
1. 了解「{content[:20]}...」的文化背景与历史价值
2. 掌握核心工艺流程与关键知识点
3. 培养对传统文化的兴趣与保护意识

**重点难点：**
- 重点：理解工艺步骤的先后逻辑
- 难点：古文术语的现代转化理解

**课时安排：** 1课时（45分钟）

## 知识点卡片

**知识点1：历史渊源**
该项工艺可追溯至古代，承载着丰富的历史文化信息，是中华文明的重要组成部分。

**知识点2：核心工艺**
工艺流程包含选材、制作、加工等关键环节，每一步都体现着匠人智慧。

**知识点3：文化寓意**
该工艺不仅具有实用价值，更蕴含着深厚的精神文化内涵。

## 课堂互动问答

**Q1：** 这项工艺最早出现在什么时期？
**A：** 根据史料记载，该工艺历史悠久，体现了古人的智慧与创造力。

**Q2：** 工艺中最关键的步骤是什么？
**A：** 每个步骤都不可或缺，但核心环节决定了最终成品的质量。

**Q3：** 现代生活中如何传承这项工艺？
**A：** 可以通过体验活动、文创产品等方式让更多人了解和参与。

## 课后作业建议

1. **实践作业：** 尝试用简易材料模拟工艺流程中的一个步骤
2. **调研作业：** 查找本地类似的非遗项目并撰写简短报告
3. **创意作业：** 设计一份推广该项工艺的宣传海报""",

            "exhibition": f"""## 展板文案

**千年匠心·{content[:15]}...**

本展区展示了中国传统工艺的精湛技艺与深厚文化底蕴。从选材到成品，每一道工序都凝聚着匠人的心血与智慧，是中华文明生生不息的生动见证。

## 展品说明牌

**展品1：原料标本**
展示工艺所用原始材料，可见其天然纹理与质感特征。

**展品2：工具器具**
匠人使用的传统工具，每一件都有百年以上使用历史。

**展品3：工艺半成品**
展示制作过程中的中间形态，可直观了解工艺步骤。

## 语音导览词

各位游客，欢迎来到本展区。您眼前所见的，是一项传承千年的中国传统工艺。让我们一同走进匠人的世界，感受指尖上的文化传承。从最初的原材料选择，到最终成品的呈现，每一个环节都承载着历史的记忆与文化的温度……

## 参观引导语

**入口处：** 欢迎进入匠心世界，请沿箭头方向参观
**互动区：** 欢迎亲手体验，感受工艺魅力
**出口处：** 感谢参观，文创产品可在商店选购""",

            "video": f"""## 视频分镜脚本

**分镜1（0-5秒）：** 开场特写——工艺成品细节展示，暖色调灯光 | 转场：淡入
**分镜2（5-15秒）：** 全景——匠人工作场景，环境音 | 转场：切换
**分镜3（15-30秒）：** 中景——核心工艺步骤特写 | 转场：推移
**分镜4（30-45秒）：** 采访——匠人讲述传承故事 | 转场：切换
**分镜5（45-60秒）：** 蒙太奇——工艺流程快速剪辑 | 转场：叠化
**分镜6（60-75秒）：** 成品展示+字幕——文化价值总结 | 转场：淡出

## 口播文案

在中华大地上，有这样一项传承千年的工艺。它不仅仅是一门手艺，更是一段跨越时空的对话。从选材的那一刻起，匠人便与材料建立了默契。每一道工序，都是对传统的致敬。每一次打磨，都是对完美的追求。这，就是中国匠心……

## 字幕文案

- 「千年传承 匠心独运」
- 「每一件作品 都是时光的礼物」
- 「传统工艺 现代守护」
- 「让文化在手心延续」

## 封面建议文案

方案1：「千年工艺·一指匠心」
方案2：「看见·非遗的力量」
方案3：「手艺中国——{content[:10]}...」""",

            "study_tour": f"""## 研学手册大纲

**活动主题：** 探秘传统工艺——{content[:15]}...研学之旅
**学习目标：**
1. 了解该项工艺的历史渊源与文化价值
2. 体验工艺制作的核心环节
3. 思考传统工艺的现代传承路径

**流程安排：**
- 09:00-09:30 开营仪式与安全讲解
- 09:30-10:30 展厅参观与知识学习
- 10:30-12:00 工艺体验（上）
- 12:00-13:00 午餐休息
- 13:00-14:30 工艺体验（下）
- 14:30-15:30 成果展示与分享
- 15:30-16:00 结营总结

## 体验活动设计

**活动1：原料辨识**
提供多种原料样本，学生通过观察、触摸、闻味等方式辨识正确原料，培养感知能力。

**活动2：工序体验**
在匠人指导下，学生亲手完成工艺中的一个简单步骤，体验匠人精神。

## 研学任务卡

**任务1：** 记录工艺流程中的5个关键步骤，并标注每步的作用
**任务2：** 采访一位匠人，记录他学习工艺的故事
**任务3：** 绘制该项工艺的思维导图
**任务4：** 提出一个让传统工艺走进现代生活的创意方案
**任务5：** 撰写一段100字的研学感悟

## 安全须知

1. 体验活动时请佩戴防护手套，避免直接接触高温或锋利工具
2. 听从匠人指导，未经允许不得擅自操作设备
3. 保持活动区域整洁，工具用完归位
4. 如有不适请立即告知带队老师""",
        }
        return templates.get(scenario, templates["classroom"])

    def _mock_craft_graph(self, prompt: str) -> str:
        graph = {
            "nodes": [
                {"node_id": "step1", "label": "选材备料", "node_type": "material", "description": "精选优质原材料，确保品质"},
                {"node_id": "step2", "label": "初步加工", "node_type": "action", "description": "对原料进行初步处理与修整"},
                {"node_id": "step3", "label": "核心制作", "node_type": "action", "description": "按照传统技法进行核心工艺"},
                {"node_id": "step4", "label": "精细修整", "node_type": "action", "description": "对半成品进行精细修整与完善"},
                {"node_id": "step5", "label": "装饰美化", "node_type": "action", "description": "添加装饰元素，提升艺术性"},
                {"node_id": "step6", "label": "成品检验", "node_type": "product", "description": "质量检验与成品包装"},
            ],
            "edges": [
                {"source_node": "step1", "target_node": "step2", "label": "经过"},
                {"source_node": "step2", "target_node": "step3", "label": "进入"},
                {"source_node": "step3", "target_node": "step4", "label": "转入"},
                {"source_node": "step4", "target_node": "step5", "label": "接着"},
                {"source_node": "step5", "target_node": "step6", "label": "产出"},
            ],
        }
        return json.dumps(graph, ensure_ascii=False)
```

- [ ] **Step 4: 创建 OpenAI 实现 openai_provider.py**

```python
# backend/app/ai/openai_provider.py
import httpx
from app.ai.base import AIProvider
from app.core.config import settings

class OpenAIProvider(AIProvider):
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        url = settings.AI_BASE_URL or "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.AI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.AI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.7,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
```

- [ ] **Step 5: 创建通义千问实现 qwen_provider.py**

```python
# backend/app/ai/qwen_provider.py
import httpx
from app.ai.base import AIProvider
from app.core.config import settings

class QwenProvider(AIProvider):
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        url = settings.AI_BASE_URL or "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.AI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.AI_MODEL or "qwen-plus",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.7,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
```

- [ ] **Step 6: 创建 AI 工厂 __init__.py**

```python
# backend/app/ai/__init__.py
from app.ai.base import AIProvider
from app.ai.mock import MockProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.qwen_provider import QwenProvider
from app.core.config import settings

def get_provider() -> AIProvider:
    providers = {
        "mock": MockProvider,
        "openai": OpenAIProvider,
        "qwen": QwenProvider,
    }
    provider_class = providers.get(settings.AI_PROVIDER, MockProvider)
    return provider_class()
```

---

## Task 7: 创作生成 API

**Files:**
- Create: `backend/app/services/creation_service.py`
- Create: `backend/app/api/v1/creation.py`

- [ ] **Step 1: 创建创作服务 creation_service.py**

```python
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
        db.add(CraftNode(
            creation_id=creation.id,
            node_id=node["node_id"],
            label=node["label"],
            description=node.get("description"),
            node_type=node["node_type"],
            sort_order=idx,
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
        "title": creation.title,
        "scenario": creation.scenario,
        "audience": creation.audience,
        "status": creation.status,
        "model_used": creation.model_used,
        "content_items": [{"item_type": i.item_type, "title": i.title, "content": i.content, "sort_order": i.sort_order} for i in content_items],
        "craft_graph": {
            "nodes": [{"node_id": n.node_id, "label": n.label, "description": n.description, "node_type": n.node_type, "sort_order": n.sort_order} for n in nodes],
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
```

- [ ] **Step 2: 创建创作路由 creation.py**

```python
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
```

> **注意:** `switch-audience` 需要从原创作获取 material_id。修改 `get_creation_detail` 返回值中加入 `material_id` 字段。

- [ ] **Step 3: 修复 get_creation_detail 增加 material_id**

在 `creation_service.py` 的 `get_creation_detail` 函数返回字典中添加：
```python
"material_id": creation.material_id,
```

---

## Task 8: 用户相关 API

**Files:**
- Create: `backend/app/api/v1/user.py`

- [ ] **Step 1: 创建用户路由 user.py**

```python
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
```

---

## Task 9: FastAPI 主应用入口

**Files:**
- Create: `backend/app/main.py`

- [ ] **Step 1: 创建主应用 main.py**

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.models import user, material, creation
from app.api.v1 import auth, material, creation, user as user_api

app = FastAPI(title="遗脉工坊 API", version="1.0.0")

# CORS
origins = settings.CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建表
Base.metadata.create_all(bind=engine)

# 注册路由
app.include_router(auth.router, prefix="/api/v1")
app.include_router(material.router, prefix="/api/v1")
app.include_router(creation.router, prefix="/api/v1")
app.include_router(user_api.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"name": "遗脉工坊 API", "version": "1.0.0", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 2: 启动后端验证**

Run: `cd backend && python run.py`
Expected: 服务在 `http://localhost:8000` 启动，访问 `/docs` 可见 Swagger 文档

---

## Task 10: 前端项目初始化

**Files:**
- Create: `frontend/package.json` (via Vite)
- Create: `frontend/vite.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/index.css`

- [ ] **Step 1: 创建 Vite + React 项目**

Run:
```bash
cd /workspace
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom axios zustand tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react clsx tailwind-merge
```

- [ ] **Step 2: 配置 Tailwind CSS — tailwind.config.js**

```javascript
// frontend/tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#fdf8f3', 100: '#faeee0', 500: '#c97b3c', 600: '#b0682f', 700: '#8f5224' },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: 配置 index.css**

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif;
}
```

- [ ] **Step 4: 配置 vite.config.js 代理**

```javascript
// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

- [ ] **Step 5: 验证前端启动**

Run: `cd frontend && npm run dev`
Expected: Vite 开发服务器在 `http://localhost:5173` 启动

---

## Task 11: 前端 API 层与状态管理

**Files:**
- Create: `frontend/src/services/api.js`
- Create: `frontend/src/services/auth.js`
- Create: `frontend/src/services/material.js`
- Create: `frontend/src/services/creation.js`
- Create: `frontend/src/store/authStore.js`
- Create: `frontend/src/utils/constants.js`
- Create: `frontend/src/utils/helpers.js`

- [ ] **Step 1: 创建 Axios 实例 api.js**

```javascript
// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

- [ ] **Step 2: 创建认证服务 auth.js**

```javascript
// frontend/src/services/auth.js
import api from './api';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};
```

- [ ] **Step 3: 创建素材服务 material.js**

```javascript
// frontend/src/services/material.js
import api from './api';

export const materialApi = {
  list: (params) => api.get('/materials', { params }),
  get: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
};
```

- [ ] **Step 4: 创建创作服务 creation.js**

```javascript
// frontend/src/services/creation.js
import api from './api';

export const creationApi = {
  create: (data) => api.post('/creations', data),
  list: (params) => api.get('/creations', { params }),
  get: (id) => api.get(`/creations/${id}`),
  delete: (id) => api.delete(`/creations/${id}`),
  switchAudience: (id, audience) => api.post(`/creations/${id}/switch-audience`, { audience }),
};
```

- [ ] **Step 5: 创建用户服务**

```javascript
// frontend/src/services/user.js
import api from './api';

export const userApi = {
  updateProfile: (data) => api.put('/users/me', data),
  updatePassword: (data) => api.put('/users/password', data),
  getStats: () => api.get('/users/stats'),
};
```

- [ ] **Step 6: 创建状态管理 authStore.js**

```javascript
// frontend/src/store/authStore.js
import { create } from 'zustand';
import { authApi } from '../services/auth';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (account, password) => {
    const res = await authApi.login({ account, password });
    localStorage.setItem('token', res.data.token);
    set({ user: res.data, token: res.data.token, isAuthenticated: true });
    return res;
  },

  register: async (username, email, password) => {
    const res = await authApi.register({ username, email, password });
    localStorage.setItem('token', res.data.token);
    set({ user: res.data, token: res.data.token, isAuthenticated: true });
    return res;
  },

  fetchUser: async () => {
    try {
      const res = await authApi.getMe();
      set({ user: res.data });
      return res.data;
    } catch {
      set({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem('token');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

- [ ] **Step 7: 创建常量文件 constants.js**

```javascript
// frontend/src/utils/constants.js
export const MATERIAL_TYPES = [
  { value: 'ancient_book', label: '古籍原文', icon: '📖' },
  { value: 'craft_text', label: '非遗工艺文字', icon: '🏺' },
  { value: 'oral_record', label: '口述记录', icon: '🎙️' },
  { value: 'craft_keyword', label: '工艺关键词', icon: '🔑' },
];

export const SCENARIOS = [
  { value: 'classroom', label: '课堂教学', icon: '📚', desc: '教案、知识卡片、互动问答、作业' },
  { value: 'exhibition', label: '展馆展览', icon: '🏛️', desc: '展板文案、说明牌、导览词、引导语' },
  { value: 'video', label: '短视频宣传', icon: '🎬', desc: '分镜脚本、口播文案、字幕、封面' },
  { value: 'study_tour', label: '研学活动', icon: '🎒', desc: '手册、体验活动、任务卡、安全须知' },
];

export const AUDIENCES = [
  { value: 'child', label: '儿童', desc: '6-12岁' },
  { value: 'teenager', label: '青少年', desc: '13-18岁' },
  { value: 'adult', label: '成人', desc: '普通受众' },
  { value: 'expert', label: '专家', desc: '专业研究者' },
];

export const SCENARIO_LABELS = {
  classroom: '课堂教学',
  exhibition: '展馆展览',
  video: '短视频宣传',
  study_tour: '研学活动',
};

export const AUDIENCE_LABELS = {
  child: '儿童',
  teenager: '青少年',
  adult: '成人',
  expert: '专家',
};
```

- [ ] **Step 8: 创建工具函数 helpers.js**

```javascript
// frontend/src/utils/helpers.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function truncate(str, len = 100) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function downloadMarkdown(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## Task 12: 前端布局与路由

**Files:**
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/components/Layout/AppLayout.jsx`
- Create: `frontend/src/components/ui/Toast.jsx`
- Create: `frontend/src/components/ui/Loading.jsx`

- [ ] **Step 1: 创建 App.jsx 路由配置**

```jsx
// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/Layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Create from './pages/Create';
import History from './pages/History';
import CreationDetail from './pages/CreationDetail';
import MaterialLib from './pages/MaterialLib';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<Create />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<CreationDetail />} />
          <Route path="/materials" element={<MaterialLib />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: 创建 AppLayout 布局组件**

```jsx
// frontend/src/components/Layout/AppLayout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Sparkles, History, FolderOpen, User, LogOut } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { path: '/create', label: '开始创作', icon: Sparkles },
  { path: '/history', label: '历史记录', icon: History },
  { path: '/materials', label: '素材库', icon: FolderOpen },
  { path: '/profile', label: '个人中心', icon: User },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchUser, logout } = useAuthStore();

  useEffect(() => {
    if (!user) fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <span className="text-xl font-bold text-primary-600">遗脉工坊</span>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-500' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm text-gray-700">{user?.username}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500">
            <LogOut size={16} /> 退出登录
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: 创建 Toast 通知组件**

```jsx
// frontend/src/components/ui/Toast.jsx
import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg`}>
        {message}
      </div>
    </div>
  );
}
```

---

## Task 13: 认证页面 (登录/注册)

**Files:**
- Create: `frontend/src/pages/Login.jsx`
- Create: `frontend/src/pages/Register.jsx`

- [ ] **Step 1: 创建登录页 Login.jsx**

```jsx
// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(account, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.detail || err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-96">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600">遗脉工坊</h1>
          <p className="text-gray-500 mt-2">AI非遗与古籍活化创作助手</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">账号</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="用户名或邮箱"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="请输入密码"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          还没有账号？<Link to="/register" className="text-primary-600 hover:underline">立即注册</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建注册页 Register.jsx**

```jsx
// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('两次密码不一致');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.detail || err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-96">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600">注册账号</h1>
          <p className="text-gray-500 mt-2">加入遗脉工坊，激活传统文化</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={form.username} onChange={update('username')} placeholder="用户名" required minLength={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500" />
          <input type="email" value={form.email} onChange={update('email')} placeholder="邮箱" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500" />
          <input type="password" value={form.password} onChange={update('password')} placeholder="密码 (至少6位)" required minLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500" />
          <input type="password" value={form.confirm} onChange={update('confirm')} placeholder="确认密码" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500" />
          <button type="submit" disabled={loading}
            className="w-full bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 transition disabled:opacity-50">
            {loading ? '注册中...' : '注 册'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          已有账号？<Link to="/login" className="text-primary-600 hover:underline">返回登录</Link>
        </p>
      </div>
    </div>
  );
}
```

---

## Task 14: 落地页与工作台

**Files:**
- Create: `frontend/src/pages/Landing.jsx`
- Create: `frontend/src/pages/Dashboard.jsx`

- [ ] **Step 1: 创建落地页 Landing.jsx**

```jsx
// frontend/src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { SCENARIOS } from '../utils/constants';
import { Sparkles, BookOpen, Upload, Cpu, Download } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const steps = [
    { icon: Upload, title: '输入素材', desc: '古籍原文、工艺文字、口述记录或关键词' },
    { icon: Cpu, title: 'AI 解析', desc: '自动拆解文化核心，提取工艺流程' },
    { icon: Sparkles, title: '多场景生成', desc: '一键产出四大场景配套内容包' },
    { icon: Download, title: '一键导出', desc: '支持复制、导出 Markdown，受众切换' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <nav className="flex items-center justify-between px-8 py-4">
        <span className="text-xl font-bold text-primary-600">遗脉工坊</span>
        <button
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          className="bg-primary-500 text-white px-5 py-2 rounded-lg hover:bg-primary-600 transition"
        >
          {isAuthenticated ? '进入工作台' : '开始使用'}
        </button>
      </nav>

      <section className="text-center py-20 px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          一键激活古籍非遗
        </h1>
        <p className="text-xl text-gray-600 mb-2">让传统文化活起来</p>
        <p className="text-gray-500 max-w-2xl mx-auto mb-8">
          基于 AI 大模型，上传古籍与非遗素材，自动生成适配课堂教学、展馆展览、短视频宣传、研学活动的全套文化传播内容
        </p>
        <button
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
          className="bg-primary-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-primary-600 transition shadow-lg"
        >
          立即体验
        </button>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">四步完成文化内容创作</h2>
        <div className="grid grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Icon className="text-primary-600" size={28} />
                </div>
                <h3 className="font-medium text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">四大应用场景</h2>
        <div className="grid grid-cols-2 gap-6">
          {SCENARIOS.map((s) => (
            <div key={s.value} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{s.label}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-gray-400 text-sm">
        遗脉工坊 · AI非遗与古籍活化创作助手 · 2026
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: 创建工作台 Dashboard.jsx**

```jsx
// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/user';
import { creationApi } from '../services/creation';
import { SCENARIO_LABELS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { Sparkles, FolderOpen, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ material_count: 0, creation_count: 0, scenario_distribution: {} });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userApi.getStats(),
      creationApi.list({ page: 1, page_size: 5 }),
    ]).then(([statsRes, recentRes]) => {
      setStats(statsRes.data);
      setRecent(recentRes.data.items);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">工作台</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="text-primary-500" />
            <span className="text-gray-500">素材总数</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.material_count}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-primary-500" />
            <span className="text-gray-500">创作总数</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.creation_count}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-primary-500" />
            <span className="text-gray-500">场景分布</span>
          </div>
          <div className="text-sm space-y-1">
            {Object.entries(stats.scenario_distribution).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-600">{SCENARIO_LABELS[k] || k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => navigate('/create')} className="flex-1 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2">
          <Sparkles size={18} /> 开始创作
        </button>
        <button onClick={() => navigate('/materials')} className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
          <FolderOpen size={18} /> 素材库
        </button>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">最近创作</h2>
        {recent.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">暂无创作记录，点击上方按钮开始创作</div>
        ) : (
          <div className="space-y-3">
            {recent.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/history/${item.id}`)}>
                <div>
                  <h3 className="font-medium text-gray-800">{item.title}</h3>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                    <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded">{SCENARIO_LABELS[item.scenario]}</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Task 15: 创作页面 (核心功能)

**Files:**
- Create: `frontend/src/pages/Create.jsx`
- Create: `frontend/src/components/CraftGraph/CraftGraph.jsx`
- Create: `frontend/src/components/CreationResult/MarkdownView.jsx`

- [ ] **Step 1: 创建 Markdown 渲染组件 MarkdownView.jsx**

```jsx
// frontend/src/components/CreationResult/MarkdownView.jsx
export default function MarkdownView({ content }) {
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let inList = false;
    let listItems = [];

    lines.forEach((line, i) => {
      const h2 = line.match(/^##\s+(.+)/);
      const h3 = line.match(/^###\s+(.+)/);
      const bold = line.match(/^\*\*(.+?)\*\*/);
      const li = line.match(/^[-*]\s+(.+)/);

      if (h2) {
        if (inList) { elements.push(<ul key={`ul-${i}`} className="list-disc pl-6 mb-3 space-y-1">{listItems}</ul>); listItems = []; inList = false; }
        elements.push(<h2 key={i} className="text-xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b border-gray-200">{h2[1]}</h2>);
      } else if (h3) {
        if (inList) { elements.push(<ul key={`ul-${i}`} className="list-disc pl-6 mb-3 space-y-1">{listItems}</ul>); listItems = []; inList = false; }
        elements.push(<h3 key={i} className="text-lg font-semibold text-gray-700 mt-4 mb-2">{h3[1]}</h3>);
      } else if (li) {
        inList = true;
        listItems.push(<li key={i} className="text-gray-600 text-sm">{renderInline(li[1])}</li>);
      } else if (line.trim()) {
        if (inList) { elements.push(<ul key={`ul-${i}`} className="list-disc pl-6 mb-3 space-y-1">{listItems}</ul>); listItems = []; inList = false; }
        elements.push(<p key={i} className="text-gray-600 text-sm leading-relaxed mb-2">{renderInline(line)}</p>);
      }
    });
    if (inList) elements.push(<ul key="ul-final" className="list-disc pl-6 mb-3 space-y-1">{listItems}</ul>);
    return elements;
  };

  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return <div className="prose prose-sm max-w-none">{renderMarkdown(content)}</div>;
}
```

- [ ] **Step 2: 创建工艺图谱组件 CraftGraph.jsx**

```jsx
// frontend/src/components/CraftGraph/CraftGraph.jsx
export default function CraftGraph({ nodes = [], edges = [] }) {
  if (nodes.length === 0) return <div className="text-gray-400 text-center py-8">暂无工艺图谱数据</div>;

  const nodeColors = {
    material: 'bg-blue-100 border-blue-400 text-blue-700',
    action: 'bg-primary-100 border-primary-400 text-primary-700',
    product: 'bg-green-100 border-green-400 text-green-700',
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-2 min-w-full">
        <div className="flex flex-wrap gap-4 justify-center">
          {nodes.map((node, i) => (
            <div key={node.node_id} className="flex flex-col items-center">
              {i > 0 && <div className="text-gray-400 text-xs mb-1">↓</div>}
              <div className={`border-2 rounded-lg px-4 py-3 max-w-xs ${nodeColors[node.node_type] || nodeColors.action}`}>
                <div className="font-medium text-sm">{node.label}</div>
                {node.description && <div className="text-xs mt-1 opacity-75">{node.description}</div>}
                <div className="text-xs mt-1 opacity-50 uppercase">{node.node_type}</div>
              </div>
            </div>
          ))}
        </div>
        {edges.length > 0 && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {edges.map((e, i) => (
              <span key={i} className="mr-3">{e.source_node} → {e.label || ''} → {e.target_node}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建创作页面 Create.jsx**

```jsx
// frontend/src/pages/Create.jsx
import { useState, useEffect } from 'react';
import { creationApi } from '../services/creation';
import { materialApi } from '../services/material';
import { MATERIAL_TYPES, SCENARIOS, AUDIENCES, AUDIENCE_LABELS } from '../utils/constants';
import { copyToClipboard, downloadMarkdown } from '../utils/helpers';
import MarkdownView from '../components/CreationResult/MarkdownView';
import CraftGraph from '../components/CraftGraph/CraftGraph';
import { Sparkles, Copy, Download, Loader2 } from 'lucide-react';

export default function Create() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [inputMode, setInputMode] = useState('new'); // 'new' | 'existing'
  const [materialType, setMaterialType] = useState('ancient_book');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [scenario, setScenario] = useState('classroom');
  const [audience, setAudience] = useState('child');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    materialApi.list({ page: 1, page_size: 100 }).then((res) => setMaterials(res.data.items));
  }, []);

  const handleGenerate = async () => {
    let matId = selectedMaterialId;
    if (inputMode === 'new') {
      if (!content.trim()) { setToast('请输入素材内容'); return; }
      const matRes = await materialApi.create({ title: title || '未命名素材', material_type: materialType, content });
      matId = matRes.data.id;
    }
    if (!matId) { setToast('请选择或输入素材'); return; }

    setLoading(true);
    setResult(null);
    try {
      const res = await creationApi.create({ material_id: parseInt(matId), scenario, audience });
      setResult(res.data);
      setActiveTab(0);
    } catch (err) {
      setToast(err.detail || '创作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAudience = async (newAudience) => {
    if (!result) return;
    setLoading(true);
    try {
      const res = await creationApi.switchAudience(result.id, newAudience);
      setResult(res.data);
      setActiveTab(0);
    } catch (err) {
      setToast(err.detail || '切换失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = result.content_items.map((i) => `## ${i.title}\n\n${i.content}`).join('\n\n');
    copyToClipboard(text);
    setToast('已复制到剪贴板');
  };

  const handleExport = () => {
    if (!result) return;
    const text = `# ${result.title}\n\n${result.content_items.map((i) => `## ${i.title}\n\n${i.content}`).join('\n\n')}`;
    downloadMarkdown(`${result.title}.md`, text);
    setToast('已导出 Markdown');
  };

  return (
    <div className="flex h-full">
      {/* 左侧输入区 */}
      <div className="w-2/5 border-r border-gray-200 p-6 overflow-auto bg-white">
        <h1 className="text-xl font-bold text-gray-800 mb-6">开始创作</h1>

        {/* 素材来源 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">素材来源</label>
          <div className="flex gap-2">
            <button onClick={() => setInputMode('new')} className={`flex-1 py-2 text-sm rounded-lg ${inputMode === 'new' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>直接输入</button>
            <button onClick={() => setInputMode('existing')} className={`flex-1 py-2 text-sm rounded-lg ${inputMode === 'existing' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>从素材库选</button>
          </div>
        </div>

        {inputMode === 'existing' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择素材</label>
            <select value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">请选择...</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">素材标题</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="为素材命名" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">素材类型</label>
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_TYPES.map((t) => (
                  <button key={t.value} onClick={() => setMaterialType(t.value)} className={`py-2 text-sm rounded-lg border ${materialType === t.value ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">素材内容</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="粘贴古籍原文、工艺描述、口述记录或关键词..." className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" />
            </div>
          </>
        )}

        {/* 场景选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">使用场景</label>
          <div className="grid grid-cols-2 gap-2">
            {SCENARIOS.map((s) => (
              <button key={s.value} onClick={() => setScenario(s.value)} className={`p-3 text-left rounded-lg border ${scenario === s.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                <div className="text-sm font-medium">{s.icon} {s.label}</div>
                <div className="text-xs text-gray-500 mt-1">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 受众选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">目标受众</label>
          <div className="flex gap-2">
            {AUDIENCES.map((a) => (
              <button key={a.value} onClick={() => setAudience(a.value)} className={`flex-1 py-2 text-sm rounded-lg ${audience === a.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading} className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="animate-spin" size={18} /> 创作中...</> : <><Sparkles size={18} /> 生成内容</>}
        </button>
      </div>

      {/* 右侧结果区 */}
      <div className="flex-1 p-6 overflow-auto bg-gray-50">
        {toast && <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50" onClick={() => setToast('')}>{toast}</div>}

        {!result && !loading && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
              <p>选择素材和场景后，点击"生成内容"开始创作</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-primary-500" size={40} />
              <p className="text-gray-500">AI 正在创作中，请稍候...</p>
            </div>
          </div>
        )}

        {result && !loading && (
          <div>
            {/* 工具栏 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{result.title}</h2>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Copy size={14} /> 复制
                </button>
                <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download size={14} /> 导出
                </button>
              </div>
            </div>

            {/* 受众切换 */}
            <div className="flex gap-2 mb-4">
              <span className="text-sm text-gray-500 py-1.5">受众切换：</span>
              {AUDIENCES.map((a) => (
                <button key={a.value} onClick={() => handleSwitchAudience(a.value)} className={`px-3 py-1.5 text-sm rounded-lg ${result.audience === a.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {a.label}
                </button>
              ))}
            </div>

            {/* 内容标签页 */}
            <div className="flex gap-1 mb-4 border-b border-gray-200">
              {result.content_items.map((item, i) => (
                <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-2 text-sm border-b-2 ${activeTab === i ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {item.title}
                </button>
              ))}
            </div>

            {/* 内容展示 */}
            {result.content_items[activeTab] && (
              <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <MarkdownView content={result.content_items[activeTab].content} />
              </div>
            )}

            {/* 工艺图谱 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">工艺流程图谱</h3>
              <CraftGraph nodes={result.craft_graph.nodes} edges={result.craft_graph.edges} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Task 16: 历史记录与详情页

**Files:**
- Create: `frontend/src/pages/History.jsx`
- Create: `frontend/src/pages/CreationDetail.jsx`

- [ ] **Step 1: 创建历史记录页 History.jsx**

```jsx
// frontend/src/pages/History.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { creationApi } from '../services/creation';
import { SCENARIOS, SCENARIO_LABELS, AUDIENCE_LABELS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { Trash2, Eye } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    creationApi.list({ page, page_size: 10, scenario: scenario || undefined }).then((res) => {
      setItems(res.data.items);
      setTotal(res.data.total);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, scenario]);

  const handleDelete = async (id) => {
    if (!confirm('确认删除？')) return;
    await creationApi.delete(id);
    fetchData();
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">历史记录</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setScenario('')} className={`px-4 py-1.5 text-sm rounded-lg ${!scenario ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>全部</button>
        {SCENARIOS.map((s) => (
          <button key={s.value} onClick={() => setScenario(s.value)} className={`px-4 py-1.5 text-sm rounded-lg ${scenario === s.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>{s.label}</button>
        ))}
      </div>

      {loading ? <div className="text-gray-500">加载中...</div> : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">暂无创作记录</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition">
              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/history/${item.id}`)}>
                <h3 className="font-medium text-gray-800">{item.title}</h3>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded">{SCENARIO_LABELS[item.scenario]}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">受众: {AUDIENCE_LABELS[item.audience]}</span>
                  {item.material_title && <span>素材: {item.material_title}</span>}
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => navigate(`/history/${item.id}`)} className="p-2 text-gray-400 hover:text-primary-600"><Eye size={16} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 text-sm rounded ${page === i + 1 ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建创作详情页 CreationDetail.jsx**

```jsx
// frontend/src/pages/CreationDetail.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { creationApi } from '../services/creation';
import { AUDIENCES } from '../utils/constants';
import { copyToClipboard, downloadMarkdown } from '../utils/helpers';
import MarkdownView from '../components/CreationResult/MarkdownView';
import CraftGraph from '../components/CraftGraph/CraftGraph';
import { Copy, Download, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    creationApi.get(id).then((res) => {
      setResult(res.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSwitchAudience = async (newAudience) => {
    setSwitching(true);
    try {
      const res = await creationApi.switchAudience(result.id, newAudience);
      setResult(res.data);
      setActiveTab(0);
      navigate(`/history/${res.data.id}`);
    } catch (err) {
      setToast('切换失败');
    } finally {
      setSwitching(false);
    }
  };

  const handleCopy = () => {
    const text = result.content_items.map((i) => `## ${i.title}\n\n${i.content}`).join('\n\n');
    copyToClipboard(text);
    setToast('已复制');
  };

  const handleExport = () => {
    const text = `# ${result.title}\n\n${result.content_items.map((i) => `## ${i.title}\n\n${i.content}`).join('\n\n')}`;
    downloadMarkdown(`${result.title}.md`, text);
    setToast('已导出');
  };

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;
  if (!result) return <div className="p-8 text-gray-500">创作不存在</div>;

  return (
    <div className="p-8">
      {toast && <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50" onClick={() => setToast('')}>{toast}</div>}

      <button onClick={() => navigate('/history')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> 返回列表
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{result.title}</h1>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"><Copy size={14} /> 复制</button>
          <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"><Download size={14} /> 导出</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <span className="text-sm text-gray-500 py-1.5">受众切换：</span>
        {AUDIENCES.map((a) => (
          <button key={a.value} onClick={() => handleSwitchAudience(a.value)} disabled={switching} className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 ${result.audience === a.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>
            {switching ? <Loader2 className="animate-spin inline" size={14} /> : a.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {result.content_items.map((item, i) => (
          <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-2 text-sm border-b-2 ${activeTab === i ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>{item.title}</button>
        ))}
      </div>

      {result.content_items[activeTab] && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <MarkdownView content={result.content_items[activeTab].content} />
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">工艺流程图谱</h3>
        <CraftGraph nodes={result.craft_graph.nodes} edges={result.craft_graph.edges} />
      </div>
    </div>
  );
}
```

---

## Task 17: 素材库与个人中心页

**Files:**
- Create: `frontend/src/pages/MaterialLib.jsx`
- Create: `frontend/src/pages/Profile.jsx`

- [ ] **Step 1: 创建素材库页 MaterialLib.jsx**

```jsx
// frontend/src/pages/MaterialLib.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialApi } from '../services/material';
import { MATERIAL_TYPES } from '../utils/constants';
import { formatDate, truncate } from '../utils/helpers';
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react';

export default function MaterialLib() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', material_type: 'ancient_book', content: '' });

  const fetchData = () => {
    materialApi.list({ page, page_size: 12, material_type: type || undefined }).then((res) => {
      setItems(res.data.items);
      setTotal(res.data.total);
    });
  };

  useEffect(() => { fetchData(); }, [page, type]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (editing) {
      await materialApi.update(editing.id, form);
    } else {
      await materialApi.create(form);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ title: '', material_type: 'ancient_book', content: '' });
    fetchData();
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, material_type: item.material_type, content: item.content });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('确认删除？')) return;
    await materialApi.delete(id);
    fetchData();
  };

  const typeLabel = (val) => MATERIAL_TYPES.find((t) => t.value === val)?.label || val;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">素材库</h1>
        <button onClick={() => { setEditing(null); setForm({ title: '', material_type: 'ancient_book', content: '' }); setShowModal(true); }} className="flex items-center gap-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">
          <Plus size={16} /> 新建素材
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setType('')} className={`px-4 py-1.5 text-sm rounded-lg ${!type ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>全部</button>
        {MATERIAL_TYPES.map((t) => (
          <button key={t.value} onClick={() => setType(t.value)} className={`px-4 py-1.5 text-sm rounded-lg ${type === t.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>{t.icon} {t.label}</button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">暂无素材，点击"新建素材"添加</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-800">{item.title}</h3>
                <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded">{typeLabel(item.material_type)}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-3">{truncate(item.content, 120)}</p>
              <div className="text-xs text-gray-400 mb-3">{formatDate(item.created_at)}</div>
              <div className="flex gap-2">
                <button onClick={() => navigate('/create')} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-primary-50 text-primary-600 rounded hover:bg-primary-100"><Sparkles size={12} /> 创作</button>
                <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-primary-600"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-[500px]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? '编辑素材' : '新建素材'}</h2>
            <div className="space-y-4">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="素材标题" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <select value={form.material_type} onChange={(e) => setForm({ ...form, material_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {MATERIAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="素材内容" className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">取消</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建个人中心页 Profile.jsx**

```jsx
// frontend/src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../services/user';
import { SCENARIO_LABELS } from '../utils/constants';

export default function Profile() {
  const { user, fetchUser } = useAuthStore();
  const [form, setForm] = useState({ username: '', avatar: '' });
  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '' });
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (user) setForm({ username: user.username, avatar: user.avatar || '' });
    userApi.getStats().then((res) => setStats(res.data));
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await userApi.updateProfile(form);
      await fetchUser();
      setToast('个人信息更新成功');
    } catch (err) {
      setToast(err.detail || '更新失败');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      await userApi.updatePassword(pwdForm);
      setPwdForm({ old_password: '', new_password: '' });
      setToast('密码修改成功');
    } catch (err) {
      setToast(err.detail || '修改失败');
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      {toast && <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50" onClick={() => setToast('')}>{toast}</div>}

      <h1 className="text-2xl font-bold text-gray-800 mb-6">个人中心</h1>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.material_count}</p>
            <p className="text-sm text-gray-500">素材数</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.creation_count}</p>
            <p className="text-sm text-gray-500">创作数</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-primary-600">{Object.keys(stats.scenario_distribution).length}</p>
            <p className="text-sm text-gray-500">场景覆盖</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="font-bold text-gray-800 mb-4">个人信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">用户名</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">邮箱</label>
            <input value={user?.email || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">头像 URL</label>
            <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <button onClick={handleUpdateProfile} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">保存修改</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">修改密码</h2>
        <div className="space-y-4">
          <input type="password" value={pwdForm.old_password} onChange={(e) => setPwdForm({ ...pwdForm, old_password: e.target.value })} placeholder="原密码" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="password" value={pwdForm.new_password} onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })} placeholder="新密码 (至少6位)" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <button onClick={handleUpdatePassword} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">修改密码</button>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 18: 修改 main.jsx 入口

**Files:**
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: 更新 main.jsx**

```jsx
// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Task 19: 后端测试

**Files:**
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_auth.py`
- Create: `backend/tests/test_material.py`
- Create: `backend/tests/test_creation.py`

- [ ] **Step 1: 创建测试夹具 conftest.py**

```python
# backend/tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.core.database import Base, get_db
from app.main import app

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def auth_token(client):
    client.post("/api/v1/auth/register", json={"username": "testuser", "email": "test@test.com", "password": "password123"})
    res = client.post("/api/v1/auth/login", json={"account": "testuser", "password": "password123"})
    return res.json()["data"]["token"]

@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}
```

- [ ] **Step 2: 创建认证测试 test_auth.py**

```python
# backend/tests/test_auth.py
def test_register(client):
    res = client.post("/api/v1/auth/register", json={"username": "newuser", "email": "new@test.com", "password": "pass123456"})
    assert res.status_code == 200
    assert res.json()["data"]["token"]

def test_register_duplicate(client):
    client.post("/api/v1/auth/register", json={"username": "dup", "email": "dup@test.com", "password": "pass123456"})
    res = client.post("/api/v1/auth/register", json={"username": "dup", "email": "other@test.com", "password": "pass123456"})
    assert res.status_code == 400

def test_login_success(client):
    client.post("/api/v1/auth/register", json={"username": "loginuser", "email": "l@test.com", "password": "pass123456"})
    res = client.post("/api/v1/auth/login", json={"account": "loginuser", "password": "pass123456"})
    assert res.status_code == 200
    assert res.json()["data"]["token"]

def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={"username": "wp", "email": "wp@test.com", "password": "pass123456"})
    res = client.post("/api/v1/auth/login", json={"account": "wp", "password": "wrong"})
    assert res.status_code == 401

def test_me(client, auth_headers):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["username"] == "testuser"

def test_me_no_token(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
```

- [ ] **Step 3: 创建素材测试 test_material.py**

```python
# backend/tests/test_material.py
def test_create_material(client, auth_headers):
    res = client.post("/api/v1/materials", json={"title": "测试素材", "material_type": "ancient_book", "content": "古文内容"}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["title"] == "测试素材"

def test_list_materials(client, auth_headers):
    client.post("/api/v1/materials", json={"title": "素材1", "material_type": "ancient_book", "content": "内容1"}, headers=auth_headers)
    client.post("/api/v1/materials", json={"title": "素材2", "material_type": "craft_text", "content": "内容2"}, headers=auth_headers)
    res = client.get("/api/v1/materials", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["total"] == 2

def test_get_material(client, auth_headers):
    create_res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = create_res.json()["data"]["id"]
    res = client.get(f"/api/v1/materials/{mat_id}", headers=auth_headers)
    assert res.status_code == 200

def test_update_material(client, auth_headers):
    create_res = client.post("/api/v1/materials", json={"title": "旧标题", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = create_res.json()["data"]["id"]
    res = client.put(f"/api/v1/materials/{mat_id}", json={"title": "新标题"}, headers=auth_headers)
    assert res.json()["data"]["title"] == "新标题"

def test_delete_material(client, auth_headers):
    create_res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = create_res.json()["data"]["id"]
    res = client.delete(f"/api/v1/materials/{mat_id}", headers=auth_headers)
    assert res.status_code == 200

def test_material_no_auth(client):
    res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"})
    assert res.status_code == 401
```

- [ ] **Step 4: 创建创作测试 test_creation.py**

```python
# backend/tests/test_creation.py
import pytest

@pytest.mark.asyncio
async def test_create_creation(client, auth_headers):
    # 先创建素材
    mat_res = client.post("/api/v1/materials", json={"title": "测试古籍", "material_type": "ancient_book", "content": "宋子曰：水火既济而土合"}, headers=auth_headers)
    mat_id = mat_res.json()["data"]["id"]
    # 发起创作
    res = client.post("/api/v1/creations", json={"material_id": mat_id, "scenario": "classroom", "audience": "child"}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["scenario"] == "classroom"
    assert len(data["content_items"]) > 0
    assert len(data["craft_graph"]["nodes"]) > 0

def test_list_creations(client, auth_headers):
    mat_res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = mat_res.json()["data"]["id"]
    client.post("/api/v1/creations", json={"material_id": mat_id, "scenario": "classroom", "audience": "child"}, headers=auth_headers)
    res = client.get("/api/v1/creations", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["total"] >= 1

def test_get_creation_detail(client, auth_headers):
    mat_res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = mat_res.json()["data"]["id"]
    create_res = client.post("/api/v1/creations", json={"material_id": mat_id, "scenario": "exhibition", "audience": "adult"}, headers=auth_headers)
    creation_id = create_res.json()["data"]["id"]
    res = client.get(f"/api/v1/creations/{creation_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["scenario"] == "exhibition"

def test_delete_creation(client, auth_headers):
    mat_res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = mat_res.json()["data"]["id"]
    create_res = client.post("/api/v1/creations", json={"material_id": mat_id, "scenario": "video", "audience": "teenager"}, headers=auth_headers)
    creation_id = create_res.json()["data"]["id"]
    res = client.delete(f"/api/v1/creations/{creation_id}", headers=auth_headers)
    assert res.status_code == 200
```

- [ ] **Step 5: 运行测试**

Run: `cd backend && python -m pytest tests/ -v --asyncio-mode=auto`
Expected: 所有测试通过

---

## Task 20: README 与最终验证

**Files:**
- Create: `README.md`

- [ ] **Step 1: 创建项目 README.md**

```markdown
# 遗脉工坊 — AI非遗与古籍活化创作助手

一款基于大模型驱动的 Web AI 创作系统，上传古籍、非遗素材即可一键生成多场景文化传播内容包。

## 功能特性

- 四类素材输入：古籍原文、非遗工艺文字、口述记录、工艺关键词
- 四大场景输出：课堂教学、展馆展览、短视频宣传、研学活动
- 四种受众切换：儿童、青少年、成人、专家
- 工艺流程图谱可视化
- Mock/真实 AI 双模式（默认 Mock 可直接演示）
- 用户体系：注册登录、个人中心、创作历史

## 技术栈

- 前端：React 18 + Vite + Tailwind CSS + Zustand
- 后端：FastAPI + SQLAlchemy + SQLite
- AI：多模型适配层（Mock / OpenAI / 通义千问）

## 快速开始

### 后端

cd backend
pip install -r requirements.txt
cp .env.example .env
python run.py
# 服务运行在 http://localhost:8000

### 前端

cd frontend
npm install
npm run dev
# 前端运行在 http://localhost:5173

### 配置真实 AI（可选）

编辑 backend/.env：
AI_PROVIDER=openai
AI_API_KEY=your-api-key
AI_MODEL=gpt-4o-mini

## 默认 Mock 模式

无需配置 API Key，默认 Mock 模式可直接体验全部功能。

## API 文档

启动后端后访问 http://localhost:8000/docs 查看 Swagger 文档。
```

- [ ] **Step 2: 全栈启动验证**

```bash
# 终端1：启动后端
cd backend && python run.py

# 终端2：启动前端
cd frontend && npm run dev
```

Expected: 前端 `http://localhost:5173` 可正常访问，注册→登录→创作全流程可用

- [ ] **Step 3: 验收清单检查**

- [ ] 用户可注册、登录
- [ ] 素材库可增删改查
- [ ] 创作页面四大场景均可生成
- [ ] 工艺图谱可视化展示
- [ ] 受众切换功能正常
- [ ] 历史记录可查看、删除
- [ ] 个人中心可修改信息、密码
- [ ] Mock 模式无需 API Key 即可使用
- [ ] 落地页正常展示

---

## 任务依赖关系

```
Task 1 (后端初始化)
  → Task 2 (数据模型)
    → Task 3 (安全+Schema)
      → Task 4 (认证API)
      → Task 5 (素材API)
      → Task 6 (AI适配层)
        → Task 7 (创作API)
      → Task 8 (用户API)
        → Task 9 (主应用入口)

Task 10 (前端初始化)
  → Task 11 (API层+状态管理)
    → Task 12 (布局+路由)
      → Task 13 (认证页面)
      → Task 14 (落地页+工作台)
        → Task 15 (创作页面) ← 核心
          → Task 16 (历史+详情)
          → Task 17 (素材库+个人中心)
            → Task 18 (入口修改)

Task 9 + Task 18
  → Task 19 (后端测试)
    → Task 20 (README+验收)
```

---

*计划完成。共 20 个 Task，覆盖后端 9 个 + 前端 9 个 + 测试验证 2 个。*
