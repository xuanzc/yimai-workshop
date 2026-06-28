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
