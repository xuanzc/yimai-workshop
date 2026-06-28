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
        # 受众风格适配
        style_map = {
            "child": {"tone": "小朋友们", "level": "用简单有趣的语言，适合6-12岁儿童理解"},
            "teenager": {"tone": "同学们", "level": "适合中学生理解，可适度使用专业术语并解释"},
            "adult": {"tone": "各位游客/读者", "level": "语言专业流畅，适合普通成人受众"},
            "expert": {"tone": "各位专家/研究者", "level": "使用专业术语，提供学术深度"},
        }
        s = style_map.get(audience, style_map["adult"])

        # 预构建含换行的受众差异文本（f-string表达式内不能含反斜杠）
        subtitle_child = "- 「看！古人的宝贝」\n- 「每一件都是故事」\n- 「一起来学手艺吧」\n- 「把故事带回家」"
        subtitle_default = "- 「千年传承 匠心独运」\n- 「每一件作品 都是时光的礼物」\n- 「传统工艺 现代守护」\n- 「让文化在手心延续」"
        cover_child = "方案1：「古人的宝贝真好看」\n方案2：「跟我学做手艺」"
        cover_default = f"方案1：「千年工艺·一指匠心」\n方案2：「看见·非遗的力量」\n方案3：「手艺中国——{content[:10]}...」"

        templates = {
            "classroom": f"""## 教案大纲

**教学目标：**
1. 了解「{content[:20]}...」的文化背景与历史价值
2. 掌握核心工艺流程与关键知识点
3. 培养对传统文化的兴趣与保护意识

**教学对象：** {s['tone']}（{s['level']}）
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
**A：** {'很久很久以前，我们的祖先就开始做这个东西啦！' if audience == 'child' else '据考古发现与文献考证，该工艺起源甚早，具有重要的器物学与工艺史研究价值。' if audience == 'expert' else '根据史料记载，该工艺历史悠久，体现了古人的智慧与创造力。'}

**Q2：** 工艺中最关键的步骤是什么？
**A：** {'每一步都很重要哦！就像搭积木一样，少一块都不行。' if audience == 'child' else '从工艺学角度分析，核心工序对成品理化性能起决定性作用。' if audience == 'expert' else '每个步骤都不可或缺，但核心环节决定了最终成品的质量。'}

**Q3：** 现代生活中如何传承这项工艺？
**A：** {'可以和爸爸妈妈一起去体验，或者在学校的手工课上试一试！' if audience == 'child' else '建议从非遗保护、活态传承、数字化记录等维度构建系统性传承体系。' if audience == 'expert' else '可以通过体验活动、文创产品等方式让更多人了解和参与。'}

## 课后作业建议

1. **实践作业：** {'回家和爸爸妈妈一起，用橡皮泥试试做一个小作品' if audience == 'child' else '尝试用简易材料模拟工艺流程中的一个步骤'}
2. **调研作业：** {'问问爷爷奶奶，他们小时候见过这种手艺吗？' if audience == 'child' else '查找本地类似的非遗项目并撰写简短报告'}
3. **创意作业：** {'画一幅关于这项手艺的画，下节课分享给大家' if audience == 'child' else '设计一份推广该项工艺的宣传海报'}""",

            "exhibition": f"""## 展板文案

**千年匠心·{content[:15]}...**

{'小朋友们看！这是古时候的人做的宝贝，已经传了好久好久了。' if audience == 'child' else '本展区系统呈现该项工艺的技法谱系与文化脉络，为研究者提供多维度的学术参照。' if audience == 'expert' else '本展区展示了中国传统工艺的精湛技艺与深厚文化底蕴。从选材到成品，每一道工序都凝聚着匠人的心血与智慧。'}

## 展品说明牌

**展品1：原料标本**
{'这就是做宝贝用的石头和泥巴，摸一摸感受一下吧！' if audience == 'child' else '展示工艺所用原始材料，可见其天然纹理与质感特征。'}

**展品2：工具器具**
{'这些是匠人伯伯用的工具，比爷爷奶奶的年纪还要大呢！' if audience == 'child' else '匠人使用的传统工具，每一件都有百年以上使用历史。'}

**展品3：工艺半成品**
{'看！这是做到一半的样子，是不是很神奇？' if audience == 'child' else '展示制作过程中的中间形态，可直观了解工艺步骤。'}

## 语音导览词

{'小朋友们，欢迎来到这里！你们看，这些漂亮的东西都是古时候的人做的。让我们一起去看看他们是怎么做的吧！' if audience == 'child' else '各位研究者，欢迎莅临本展区。本展览旨在呈现该工艺从原料采集到成品输出的完整技术链条。' if audience == 'expert' else '各位游客，欢迎来到本展区。您眼前所见的，是一项传承千年的中国传统工艺。让我们一同走进匠人的世界，感受指尖上的文化传承。'}

## 参观引导语

**入口处：** {'小朋友们排好队，跟着箭头走，看看古人的宝贝！' if audience == 'child' else '欢迎进入匠心世界，请沿箭头方向参观'}
**互动区：** {'这里可以动手玩一玩，感受做宝贝的乐趣！' if audience == 'child' else '欢迎亲手体验，感受工艺魅力'}
**出口处：** {'今天的参观结束啦，记得和爸爸妈妈分享你看到的故事哦！' if audience == 'child' else '感谢参观，文创产品可在商店选购'}""",

            "video": f"""## 视频分镜脚本

**分镜1（0-5秒）：** 开场特写——工艺成品细节展示，暖色调灯光 | 转场：淡入
**分镜2（5-15秒）：** 全景——匠人工作场景，环境音 | 转场：切换
**分镜3（15-30秒）：** 中景——核心工艺步骤特写 | 转场：推移
**分镜4（30-45秒）：** 采访——匠人讲述传承故事 | 转场：切换
**分镜5（45-60秒）：** 蒙太奇——工艺流程快速剪辑 | 转场：叠化
**分镜6（60-75秒）：** 成品展示+字幕——文化价值总结 | 转场：淡出

## 口播文案

{'小朋友们，你们知道吗？在很久很久以前，有一位手艺特别棒的匠人。他用泥巴和石头，做出了好多漂亮的宝贝。让我们跟着镜头，一起去看看这些宝贝是怎么做出来的吧！' if audience == 'child' else '该项工艺作为中国传统手工艺的典型代表，其技术体系蕴含着丰富的材料学、热力学及美学知识。本片将从工艺人类学视角，系统记录这一非物质文化遗产的活态传承。' if audience == 'expert' else '在中华大地上，有这样一项传承千年的工艺。它不仅仅是一门手艺，更是一段跨越时空的对话。从选材的那一刻起，匠人便与材料建立了默契。每一道工序，都是对传统的致敬。每一次打磨，都是对完美的追求。这，就是中国匠心……'}

## 字幕文案

{subtitle_child if audience == 'child' else subtitle_default}

## 封面建议文案

{cover_child if audience == 'child' else cover_default}""",

            "study_tour": f"""## 研学手册大纲

**活动主题：** 探秘传统工艺——{content[:15]}...研学之旅
**研学对象：** {s['tone']}（{s['level']}）
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
{'老师会给大家看不同的小石头和泥土，猜猜哪个是用来做宝贝的？答对有奖哦！' if audience == 'child' else '提供多种原料样本，学生通过观察、触摸、闻味等方式辨识正确原料，培养感知能力。'}

**活动2：工序体验**
{'在老师帮助下，每位小朋友亲手捏一个小作品，带回家给爸爸妈妈看！' if audience == 'child' else '在匠人指导下，学生亲手完成工艺中的一个简单步骤，体验匠人精神。'}

## 研学任务卡

**任务1：** {'数一数，这项手艺一共有几步？画下来告诉老师' if audience == 'child' else '记录工艺流程中的5个关键步骤，并标注每步的作用'}
**任务2：** {'问问匠人伯伯，他是从几岁开始学手艺的？' if audience == 'child' else '采访一位匠人，记录他学习工艺的故事'}
**任务3：** {'用彩笔画出你觉得最漂亮的成品' if audience == 'child' else '绘制该项工艺的思维导图'}

## 安全须知

1. {'小朋友要戴好手套，不要碰热的东西和尖尖的工具哦' if audience == 'child' else '体验活动时请佩戴防护手套，避免直接接触高温或锋利工具'}
2. {'要听老师的话，老师没说可以做的不能自己做' if audience == 'child' else '听从匠人指导，未经允许不得擅自操作设备'}
3. {'如果不舒服，马上告诉老师' if audience == 'child' else '如有不适请立即告知带队老师'}""",
        }
        return templates.get(scenario, templates["classroom"])

    def _mock_craft_graph(self, prompt: str) -> str:
        # 根据素材内容关键词判断类型，返回差异化工艺图谱
        prompt_lower = prompt.lower()

        if "皮影" in prompt or "影戏" in prompt:
            graph = {
                "nodes": [
                    {"node_id": "step1", "label": "选皮处理", "node_type": "material", "description": "选用上等驴皮或牛皮，泡水、刮薄、晾干"},
                    {"node_id": "step2", "label": "画稿过稿", "node_type": "action", "description": "设计人物造型，将图样描画到皮面上"},
                    {"node_id": "step3", "label": "雕镂刻制", "node_type": "action", "description": "三十余把刻刀精雕，最小刻刀细于绣花针"},
                    {"node_id": "step4", "label": "上色固色", "node_type": "action", "description": "矿物颜料红绿黑白黄上色，数十年不褪"},
                    {"node_id": "step5", "label": "缀结装置", "node_type": "action", "description": "关节处缀结竹签铁丝，连接操纵杆"},
                    {"node_id": "step6", "label": "排练演出", "node_type": "product", "description": "签手操纵、前声演唱，幕布灯光下表演"},
                ],
                "edges": [
                    {"source_node": "step1", "target_node": "step2", "label": "经处理"},
                    {"source_node": "step2", "target_node": "step3", "label": "入雕刻"},
                    {"source_node": "step3", "target_node": "step4", "label": "施色彩"},
                    {"source_node": "step4", "target_node": "step5", "label": "缀装置"},
                    {"source_node": "step5", "target_node": "step6", "label": "上舞台"},
                ],
            }
        elif "瓷" in prompt or "坯" in prompt or "釉" in prompt or "窑" in prompt:
            graph = {
                "nodes": [
                    {"node_id": "step1", "label": "采矿淘洗", "node_type": "material", "description": "取高岭土与瓷石，经粉碎、淘洗、沉淀"},
                    {"node_id": "step2", "label": "练泥制不", "node_type": "action", "description": "揉练使泥料柔韧均匀，陈腐以增可塑性"},
                    {"node_id": "step3", "label": "拉坯印坯", "node_type": "action", "description": "辘轳车盘拉坯，或模具印压泥片合模"},
                    {"node_id": "step4", "label": "利坯修足", "node_type": "action", "description": "铁刀旋削坯体内外，厚薄均匀表面光洁"},
                    {"node_id": "step5", "label": "画坯施釉", "node_type": "action", "description": "青花料描绘纹饰，浸釉或吹釉均匀覆盖"},
                    {"node_id": "step6", "label": "装窑烧窑", "node_type": "action", "description": "匣钵装坯，松柴升温至1300度，二十余小时"},
                    {"node_id": "step7", "label": "开窑选瓷", "node_type": "product", "description": "冷却后拣选合格成品，白如玉明如镜"},
                ],
                "edges": [
                    {"source_node": "step1", "target_node": "step2", "label": "经练制"},
                    {"source_node": "step2", "target_node": "step3", "label": "入成型"},
                    {"source_node": "step3", "target_node": "step4", "label": "待修整"},
                    {"source_node": "step4", "target_node": "step5", "label": "施装饰"},
                    {"source_node": "step5", "target_node": "step6", "label": "入窑烧"},
                    {"source_node": "step6", "target_node": "step7", "label": "出成品"},
                ],
            }
        elif "绣" in prompt or "针" in prompt or "丝" in prompt:
            graph = {
                "nodes": [
                    {"node_id": "step1", "label": "选材备料", "node_type": "material", "description": "选取蚕丝线、棉布底料、矿物染料等原材料"},
                    {"node_id": "step2", "label": "勾稿上绷", "node_type": "action", "description": "设计图案勾稿，将底料上绷固定"},
                    {"node_id": "step3", "label": "核心工艺", "node_type": "action", "description": "按传统技法进行刺绣或印染等核心制作"},
                    {"node_id": "step4", "label": "精细修整", "node_type": "action", "description": "劈丝配色、分水勾线，精细打磨细节"},
                    {"node_id": "step5", "label": "落绷装裱", "node_type": "action", "description": "完成制作后落绷，装裱成装饰画或团扇"},
                    {"node_id": "step6", "label": "成品检验", "node_type": "product", "description": "质量检验，光感丝理达标即为成品"},
                ],
                "edges": [
                    {"source_node": "step1", "target_node": "step2", "label": "经准备"},
                    {"source_node": "step2", "target_node": "step3", "label": "入制作"},
                    {"source_node": "step3", "target_node": "step4", "label": "转修整"},
                    {"source_node": "step4", "target_node": "step5", "label": "入装裱"},
                    {"source_node": "step5", "target_node": "step6", "label": "出成品"},
                ],
            }
        else:
            # 古籍/通用陶埏类
            graph = {
                "nodes": [
                    {"node_id": "step1", "label": "取土选料", "node_type": "material", "description": "掘地取无沙粘土，百里内必产合用土色"},
                    {"node_id": "step2", "label": "练泥陈腐", "node_type": "action", "description": "调践熟泥，踩踏使柔韧均匀，渍水经宿"},
                    {"node_id": "step3", "label": "拉坯成型", "node_type": "action", "description": "以圆桶为模，铁线弦弓割泥，周包圆桶"},
                    {"node_id": "step4", "label": "修坯晾干", "node_type": "action", "description": "待稍干脱模而出，自然裂分，修削成型"},
                    {"node_id": "step5", "label": "装窑烧制", "node_type": "action", "description": "堆积窑中燃薪举火，一至二昼夜视量定熄"},
                    {"node_id": "step6", "label": "浇水转釉", "node_type": "action", "description": "停火后浇水使表面呈现光泽，与造砖同法"},
                    {"node_id": "step7", "label": "开窑取器", "node_type": "product", "description": "冷却后开窑取出，成品瓦器可用于建筑"},
                ],
                "edges": [
                    {"source_node": "step1", "target_node": "step2", "label": "经练制"},
                    {"source_node": "step2", "target_node": "step3", "label": "入成型"},
                    {"source_node": "step3", "target_node": "step4", "label": "待干燥"},
                    {"source_node": "step4", "target_node": "step5", "label": "入窑烧"},
                    {"source_node": "step5", "target_node": "step6", "label": "转釉色"},
                    {"source_node": "step6", "target_node": "step7", "label": "出成品"},
                ],
            }
        return json.dumps(graph, ensure_ascii=False)
