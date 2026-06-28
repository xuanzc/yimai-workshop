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
