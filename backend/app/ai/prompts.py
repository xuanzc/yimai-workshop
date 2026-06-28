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
