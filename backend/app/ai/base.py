# backend/app/ai/base.py
import urllib.parse
from abc import ABC, abstractmethod


class AIProvider(ABC):
    @abstractmethod
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        pass

    def generate_image_url(self, label: str, description: str, node_type: str, seed: int = 0) -> str:
        """构造工艺图谱节点图片 URL（使用 Pollinations.ai 免费生图服务）

        Pollinations.ai 特点：无需 API key，URL 即图片，浏览器加载时自动生成。
        """
        type_map = {
            "material": "traditional Chinese craft raw material",
            "action": "traditional Chinese craft process step",
            "product": "traditional Chinese craft finished product",
        }
        type_desc = type_map.get(node_type, "traditional Chinese craft")
        desc_short = (description or "")[:80]
        prompt_text = f"{type_desc}: {label}. {desc_short}. realistic, detailed, traditional Chinese style, illustration"
        encoded = urllib.parse.quote(prompt_text)
        seed_param = f"&seed={seed}" if seed > 0 else ""
        return f"https://image.pollinations.ai/prompt/{encoded}?width=400&height=300&nologo=true{seed_param}"
