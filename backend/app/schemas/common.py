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
