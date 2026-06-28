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
