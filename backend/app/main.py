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
