# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models import user, material, creation
from app.api.v1 import auth, material, creation, user as user_api
from app.services.auth_service import get_password_hash
from app.services.creation_service import parse_content_items, parse_craft_graph, ITEM_TYPE_MAP, SCENARIO_TITLES
import json

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


# ============ 演示账号种子数据 ============
DEMO_MATERIALS = [
    {
        "title": "《天工开物·陶埏》片段",
        "material_type": "ancient_book",
        "content": (
            "宋子曰：水火既济而土合。成器天下之前，始于炊爨之所需。"
            "大垔之未陶也，有虞氏之尚瓦棺也，夏后氏之垔周也。"
            "陶成雅器，有素肌玉骨之象焉。掩映几筵，文明可掬。"
            "岂固糠秕而已哉？凡陶之家，以茅苫前门，不得有窗棂。"
            "盖陶家忌明暗，茅屋取其气不散也。掘地深二尺，取细土和泥，"
            "蹂践使柔韧。过筛去其粗砾，渍水经宿，乃可制器。"
            "其器大小不等，大者缸瓮，小者碗碟。轮车既转，两手掬泥置于车盘之上，"
            "拇指中指插入，随转随开，遂成碗形。稍干修削，入窑烧之。"
            "柴薪累叠，火候足则止。"
        ),
    },
    {
        "title": "景德镇手工制瓷七十二道工序",
        "material_type": "craft_text",
        "content": (
            "景德镇手工制瓷工艺始载于宋代，至明清趋于鼎盛，"
            "完整工序多达七十二道，概括为：\n\n"
            "一、练泥：取高岭土与瓷石，经粉碎、淘洗、沉淀、揉练，"
            "使泥料柔韧均匀，无气孔气泡。\n\n"
            "二、拉坯：将泥团置于辘轳车盘中央，双手随轮旋转，"
            "以拇指开孔，手指挤压成形，制成碗、瓶、盘等坯体初形。\n\n"
            "三、印坯：对不规则器形，以刻有纹样的模具印压泥片，合模成形。\n\n"
            "四、晒坯：将坯体置于晾坯架上，阴干至适当硬度，防止变形开裂。\n\n"
            "五、修坯：以铁刀旋削坯体内外，使其厚薄均匀、表面光洁，修去余泥。\n\n"
            "六、画坯：用青花料或釉里红在素坯上描绘纹饰，线条流畅、构图讲究。\n\n"
            "七、施釉：将坯体浸入釉浆，或浇釉、吹釉，使表面均匀覆盖一层釉料。\n\n"
            "八、烧窑：装入匣钵，入窑码放，以松柴为燃料，升温至一千三百度，"
            "经二十余小时烧成。\n\n"
            "九、开窑：冷却后开窑取出，拣选合格成品。次品可复烧或另作他用。\n\n"
            "每一步皆需匠人凭经验判断火候、厚薄、釉色，代代口传心授，"
            "方得白如玉、明如镜、薄如纸、声如磬之景德镇瓷。"
        ),
    },
    {
        "title": "皮影戏传承人口述记录",
        "material_type": "oral_record",
        "content": (
            "【受访人：王师傅，陕西华县皮影戏省级传承人，从艺四十五年】\n\n"
            "我这皮影啊，是跟我师父学的。我师父叫李德茂，"
            "他师父的师父，那都追溯到清朝光绪年间了。"
            "我十二岁开始学，那时候就是跟着师父走村串乡，"
            "晚上搭个幕布，点上汽灯，就开始唱了。\n\n"
            "皮影的皮子，必须用上好的牛皮，泡水、刮薄、晾干，"
            "一张皮子处理下来得半个月。刻的时候用三十多把刻刀，"
            "最小的刀比绣花针还细。一个人物头茬，光刻就得三天。"
            "刻完再上色，红、绿、黑、黄，用的都是矿物颜料，几十年不褪色。\n\n"
            "唱腔是老腔，跟秦腔不一样，我们叫碗碗腔。"
            "一台戏四个人，签手、前声、上档、下档，四个人撑一台戏。\n\n"
            "现在最大的难处是没人学。年轻人都出去打工了，学这个挣不了钱。"
            "我带了三个徒弟，两个转行了，就剩一个还在坚持。"
            "我就怕这手艺断在我手里，那对不起师父，也对不起祖宗传下来的东西。"
        ),
    },
    {
        "title": "蓝印花布工艺关键词",
        "material_type": "craft_keyword",
        "content": (
            "蓝印花布、刻板、刮浆、染色、晾晒、靛蓝、防染、黄豆浆、"
            "桐油纸、漏印、冰裂纹、青白对比、民间印染、南通、染坊、"
            "镂空花版、蓝草、发酵染缸、氧化还原、传统纹样、吉祥图案、"
            "凤戏牡丹、麒麟送子、鲤鱼跳龙门"
        ),
    },
]


def seed_demo_data():
    """启动时创建演示用户和样例数据（如不存在）"""
    db = SessionLocal()
    try:
        from app.models.user import User
        from app.models.material import Material
        from app.models.creation import Creation, ContentItem, CraftNode, CraftEdge
        from app.ai.mock import MockProvider

        # 检查 demo 用户是否已存在
        existing = db.query(User).filter(User.username == "demo").first()
        if existing:
            return  # 已有 demo 数据，跳过

        # 创建 demo 用户
        demo_user = User(
            username="demo",
            email="demo@yimai.workshop",
            hashed_password=get_password_hash("demo123"),
            avatar=None,
            role="user",
            is_active=True,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # 创建样例素材
        created_materials = []
        for mat_data in DEMO_MATERIALS:
            mat = Material(
                user_id=demo_user.id,
                title=mat_data["title"],
                material_type=mat_data["material_type"],
                content=mat_data["content"],
                metadata_json=None,
            )
            db.add(mat)
            db.commit()
            db.refresh(mat)
            created_materials.append(mat)

        # 创建样例创作（3条，覆盖3种场景）
        provider = MockProvider()
        sample_configs = [
            (created_materials[0], "classroom", "child"),
            (created_materials[1], "exhibition", "adult"),
            (created_materials[2], "video", "teenager"),
        ]

        for mat, scenario, audience in sample_configs:
            # 用 MockProvider 同步方法生成内容
            raw_content = provider._mock_content(scenario, audience, mat.content)
            content_items = parse_content_items(raw_content, scenario)

            raw_graph = provider._mock_craft_graph(mat.content)
            craft_graph = parse_craft_graph(raw_graph)

            creation = Creation(
                user_id=demo_user.id,
                material_id=mat.id,
                title=f"{mat.title}——{SCENARIO_TITLES[scenario]}",
                scenario=scenario,
                audience=audience,
                status="completed",
                model_used="mock:demo",
            )
            db.add(creation)
            db.flush()

            # 创建内容条目
            for idx, item in enumerate(content_items):
                db.add(ContentItem(
                    creation_id=creation.id,
                    item_type=item["item_type"],
                    title=item["title"],
                    content=item["content"],
                    sort_order=idx,
                ))

            # 创建工艺图谱节点
            for idx, node in enumerate(craft_graph["nodes"]):
                db.add(CraftNode(
                    creation_id=creation.id,
                    node_id=node["node_id"],
                    label=node["label"],
                    description=node.get("description"),
                    node_type=node["node_type"],
                    sort_order=idx,
                ))

            # 创建工艺图谱边
            for edge in craft_graph["edges"]:
                db.add(CraftEdge(
                    creation_id=creation.id,
                    source_node=edge["source_node"],
                    target_node=edge["target_node"],
                    label=edge.get("label"),
                ))

            db.commit()

        print(f"[seed] 演示数据初始化完成: 用户 demo, {len(created_materials)} 条素材, 3 条创作")

    except Exception as e:
        print(f"[seed] 演示数据初始化失败（可忽略）: {e}")
        db.rollback()
    finally:
        db.close()


# 启动时执行种子
seed_demo_data()

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
